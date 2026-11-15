/* 용담바둑: every playing asset stays on this device after installation. */
const VERSION = 'v2.2.2';
const BUILD = '4664c288e03ec9a6';
const PREFIX = 'yongdam-baduk-';
const CACHE = PREFIX + VERSION;
const ROOT = new URL('./', self.location.href);
const FILES = [
  "./",
  "./ai-worker.js",
  "./app-v2.2.2.js",
  "./app.js",
  "./engine-v2.2.2.js",
  "./engine.js",
  "./favicon-32.png",
  "./favicon.ico",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./index.html",
  "./manifest.webmanifest",
  "./manual.html",
  "./neural/LICENSE.KataGo.txt",
  "./neural/LICENSE.TensorFlow.txt",
  "./neural/LICENSE.pako.txt",
  "./neural/LICENSE.web-katrain.txt",
  "./neural/NOTICE.txt",
  "./neural/human-model.json",
  "./neural/humanv0-0.part",
  "./neural/humanv0-1.part",
  "./neural/humanv0-2.part",
  "./neural/humanv0-3.part",
  "./neural/humanv0-4.part",
  "./neural/humanv0-5.part",
  "./neural/katago-b10.bin.gz",
  "./neural/katago-b6.bin.gz",
  "./neural/models.json",
  "./neural/tfjs/tfjs-backend-wasm-simd.wasm",
  "./neural/tfjs/tfjs-backend-wasm-threaded-simd.wasm",
  "./neural/tfjs/tfjs-backend-wasm.wasm",
  "./neural/worker.js",
  "./neural/worker.js.LEGAL.txt",
  "./og-yongdam-walnut.png",
  "./ranks-v2.2.2.js",
  "./ranks.js",
  "./reading.js",
  "./review-engine-v2.2.2.js",
  "./review-engine.js",
  "./strong-engine-v2.2.2.js",
  "./strong-engine.js",
  "./style-v2.2.2.css",
  "./style.css"
];
const URLS = FILES.map(file => new URL(file, ROOT).href);
const KNOWN = new Set(URLS);
const ENTRY = new URL('index.html', ROOT).href;

async function cacheReady() {
  const cache = await caches.open(CACHE);
  const entries = await Promise.all(URLS.map(url => cache.match(url)));
  return entries.every(response => response && response.ok);
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Fetch all files before writing: an interrupted download must not signal ready.
    const responses = await Promise.all(URLS.map(async url => {
      const response = await fetch(url, {
        cache: 'reload', credentials: 'same-origin', redirect: 'follow'
      });
      const received=new URL(response.url || url);
      const requested=new URL(url);
      const canonical=p=>p.replace(/\/index\.html$/,'/').replace(/\.html$/,'');
      if(received.origin!==requested.origin || canonical(received.pathname)!==canonical(requested.pathname))throw new Error('Unexpected offline redirect');
      if (!response.ok || response.type === 'opaque') {
        throw new Error('Offline asset unavailable: ' + new URL(url).pathname);
      }
      // Never store a sign-in/error HTML page under a script, icon, or manifest URL.
      const pathname = new URL(url).pathname;
      const contentType = response.headers.get('content-type') || '';
      if (/\.(js|css|png|svg|ico|webmanifest|wasm|gz|part|json)$/.test(pathname) && /text\/html/i.test(contentType)) {
        throw new Error('Unexpected offline asset response');
      }
      // Navigation requests cannot reuse a response carrying a redirect flag.
      return response.redirected ? new Response(response.body, {
        status: response.status, statusText: response.statusText, headers: response.headers
      }) : response;
    }));
    const cache = await caches.open(CACHE);
    await Promise.all(URLS.map((url, i) => cache.put(url, responses[i])));
    if (!(await cacheReady())) throw new Error('Offline cache incomplete');
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (!(await cacheReady())) return;
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage({ type: 'CACHE_STATUS', ready: true, version: VERSION }));
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_STATUS') return;
  event.waitUntil((async () => {
    const message = { type: 'CACHE_STATUS', ready: await cacheReady(), version: VERSION };
    if (event.ports?.[0]) event.ports[0].postMessage(message);
    else event.source?.postMessage(message);
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== ROOT.origin) return;
  url.search = '';
  url.hash = '';
  if (!KNOWN.has(url.href) && KNOWN.has(url.href+'.html')) url.pathname += '.html';
  if (!KNOWN.has(url.href)) return;
  // Only app-shell URLs are intercepted. Auth, account, API, and unrelated pages
  // remain exclusively under the host's normal network/access behavior.
  if (event.request.mode === 'navigate' && (url.href === ROOT.href || url.href === ENTRY)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) return response;
        const cached = await caches.match(ENTRY, { cacheName: CACHE });
        return cached || response;
      } catch {
        return (await caches.match(ENTRY, { cacheName: CACHE })) ||
          new Response('인터넷에 연결해 용담바둑을 한 번 열어 주세요.', {
            status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(url.href, { cacheName: CACHE });
    return cached || fetch(event.request);
  })());
});
