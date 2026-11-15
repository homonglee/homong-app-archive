import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8');
const origin = 'https://baduk.test';
const files = JSON.parse(source.match(/const FILES = (\[[\s\S]*?\]);/)[1]).map(p => new URL(p,origin+'/').pathname);

function harness() {
  const listeners = new Map(), stores = new Map(), fetches = [];
  let online = true, failPath = null, htmlPath = null, redirectPath = null;
  const messages = [];
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        async put(key, response) { entries.set(String(key), response.clone()); },
        async match(key) { return entries.get(String(key))?.clone(); },
        async delete(key) { return entries.delete(String(key)); }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async match(key, options = {}) {
      if (options.cacheName) return stores.get(options.cacheName)?.get(String(key))?.clone();
      for (const entries of stores.values()) if (entries.has(String(key))) return entries.get(String(key)).clone();
    }
  };
  const self = {
    location: { href: origin + '/sw.js' },
    addEventListener(type, handler) { listeners.set(type, handler); },
    async skipWaiting() { self.skipped = true; },
    clients: {
      async claim() { self.claimed = true; },
      async matchAll() { return [{ postMessage(message) { messages.push(message); } }]; }
    }
  };
  async function fetch(input, options) {
    const url = new URL(typeof input === 'string' ? input : input.url);
    fetches.push({ path: url.pathname, options });
    if (!online) throw new TypeError('Network unavailable');
    if (url.pathname === failPath) return new Response('Not found', { status: 404 });
    const type = url.pathname === htmlPath ? 'text/html' :
      url.pathname.endsWith('.json') ? 'application/json' :
      url.pathname.endsWith('.part') ? 'application/octet-stream' :
      url.pathname.endsWith('.gz') ? 'application/gzip' :
      url.pathname.endsWith('.wasm') ? 'application/wasm' :
      url.pathname.endsWith('.ico') ? 'image/x-icon' :
      url.pathname.endsWith('.js') ? 'text/javascript' :
      url.pathname.endsWith('.css') ? 'text/css' :
      url.pathname.endsWith('.png') ? 'image/png' :
      url.pathname.endsWith('.svg') ? 'image/svg+xml' :
      url.pathname.endsWith('.webmanifest') ? 'application/manifest+json' : 'text/html';
    const response=new Response('content:' + url.pathname, { headers: { 'Content-Type': type } });
    if(redirectPath){const redirectedURL=origin+(redirectPath==='canonical'?url.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,''):redirectPath);Object.defineProperty(response,'url',{value:redirectedURL});Object.defineProperty(response,'redirected',{value:redirectedURL!==url.href});}
    return response;
  }
  vm.runInNewContext(source, { self, caches, fetch, URL, Response, Set, Promise, Error });
  async function dispatch(type, extra = {}) {
    const waits = [];
    let response;
    listeners.get(type)({ ...extra, waitUntil(promise) { waits.push(promise); }, respondWith(promise) { response = promise; } });
    await Promise.all(waits);
    return response ? await response : undefined;
  }
  return {
    self, stores, fetches, messages, caches, dispatch,
    setOnline(value) { online = value; },
    setFail(path) { failPath = path; },
    setHTML(path) { htmlPath = path; },
    setRedirect(path){redirectPath=path},
    async status() {
      let reply;
      await dispatch('message', { data: { type: 'CACHE_STATUS' }, ports: [{ postMessage(value) { reply = value; } }] });
      return reply;
    },
    request(path, mode = 'cors', method = 'GET') {
      return dispatch('fetch', { request: { url: new URL(path, origin).href, method, mode } });
    }
  };
}

test('install downloads all app resources before reporting readiness and claiming clients', async () => {
  const h = harness();
  assert.equal((await h.status()).ready, false);
  await h.dispatch('install');
  assert.deepEqual(h.fetches.map(item => item.path), files);
  assert.ok(h.fetches.every(item => item.options.credentials === 'same-origin' && item.options.redirect === 'follow'));
  assert.equal((await h.status()).ready, true);
  assert.equal(h.self.skipped, true);
  await h.dispatch('activate');
  assert.equal(h.self.claimed, true);
  assert.equal(h.messages[0].ready, true);
});

test('every required asset and both app navigation URLs remain available offline', async () => {
  const h = harness();
  await h.dispatch('install');
  h.setOnline(false);
  for (const path of files) {
    const response = await h.request(path, path === '/' || path.endsWith('.html') ? 'navigate' : 'cors');
    assert.equal(response.status, 200, path);
    assert.equal(await response.text(), 'content:' + (path === '/' ? '/index.html' : path), path);
  }
  assert.equal((await h.status()).ready, true);
});

test('cache status detects a missing worker after a complete installation', async () => {
  const h = harness();
  await h.dispatch('install');
  const cache = await h.caches.open('yongdam-baduk-' + (await h.status()).version);
  await cache.delete(origin + '/ai-worker.js');
  assert.equal((await h.status()).ready, false);
});

test('failed required download does not produce a ready or activated offline cache', async () => {
  const h = harness();
  h.setFail('/engine.js');
  await assert.rejects(h.dispatch('install'), /Offline asset unavailable/);
  assert.equal((await h.status()).ready, false);
  assert.equal(h.self.skipped, undefined);
  await h.dispatch('activate');
  assert.equal(h.self.claimed, undefined);
});

test('HTML login/error responses cannot poison script caches', async () => {
  const h = harness();
  h.setHTML('/app.js');
  await assert.rejects(h.dispatch('install'), /Unexpected offline asset response/);
  assert.equal((await h.status()).ready, false);
});

test('auth, API, external origins, and non-GET requests are not intercepted', async () => {
  const h = harness();
  await h.dispatch('install');
  h.setOnline(false);
  assert.equal(await h.request('/auth/login', 'navigate'), undefined);
  assert.equal(await h.request('/api/account'), undefined);
  assert.equal(await h.request('https://elsewhere.test/app.js'), undefined);
  assert.equal(await h.request('/app.js', 'cors', 'POST'), undefined);
});

test('cache cleanup removes only this app’s older versions', async () => {
  const h = harness();
  await h.caches.open('yongdam-baduk-v0');
  await h.caches.open('another-app-v1');
  await h.dispatch('install');
  await h.dispatch('activate');
  assert.deepEqual((await h.caches.keys()).sort(), ['another-app-v1', 'yongdam-baduk-' + (await h.status()).version]);
});


test('same-origin clean HTML redirects cache correctly and manual clean URL works offline',async()=>{const h=harness();h.setRedirect('canonical');await h.dispatch('install');h.setOnline(false);assert.equal((await h.status()).ready,true);const manual=await h.request('/manual','navigate');assert.equal(manual.redirected,false);assert.equal(await manual.text(),'content:/manual.html');const root=await h.request('/','navigate');assert.equal(root.redirected,false);assert.equal(await root.text(),'content:/index.html')});
test('sign-in redirects are rejected instead of caching a login page',async()=>{const h=harness();h.setRedirect('/signin');await assert.rejects(h.dispatch('install'),/Unexpected offline redirect/);assert.equal((await h.status()).ready,false)});
