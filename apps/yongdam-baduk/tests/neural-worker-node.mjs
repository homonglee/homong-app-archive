/** Run exactly the shipped browser neural worker in a Node worker-thread.
 * Only browser transport/fetch is shimmed; all actual neural/WASM code is unchanged.
 */
import {parentPort} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
const browserWorker=new URL('../dist/neural/worker.js',import.meta.url);
Object.defineProperty(globalThis,'navigator',{value:{hardwareConcurrency:2,userAgent:'NeuralWasmTest'},configurable:true});
globalThis.self=globalThis;
globalThis.WorkerGlobalScope=class {};
globalThis.XMLHttpRequest=class {open(method,url,async=true){this.url=url;this.async=async} send(){try{const data=readFileSync(new URL(this.url));this.response=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);this.responseText=data.toString();this.status=200;if(this.async)queueMicrotask(()=>this.onload?.());else this.onload?.()}catch(e){this.status=404;this.onerror?.(e)}}};
globalThis.location={href:browserWorker.href};
globalThis.importScripts=()=>{throw new Error('Unexpected importScripts in bundled worker')};
globalThis.fetch=async input=>{const url=new URL(typeof input==='string'?input:input.url||input.href,browserWorker);if(url.protocol!=='file:')throw new Error('Unexpected network '+url);try{return new Response(await readFile(url),{status:200,headers:{'Content-Type':url.pathname.endsWith('.wasm')?'application/wasm':'application/octet-stream'}})}catch{return new Response('missing',{status:404})}};
globalThis.postMessage=(message)=>parentPort.postMessage(message);
// Emscripten takes its real browser path rather than Node's require/fs branch.
globalThis.process=undefined;
globalThis.SharedArrayBuffer=undefined;
globalThis.crossOriginIsolated=false;
await import(browserWorker.href);
parentPort.on('message',message=>globalThis.onmessage({data:message}));
parentPort.postMessage({type:'harness:ready'});
