const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('apps/sky-racer-3d/index.html','utf8');
let code=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function setupInteractionEvents'));
class Node {constructor(){this.listeners={};this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.style={};}addEventListener(k,f){(this.listeners[k]??=[]).push(f)}emit(k,e={}){for(const f of this.listeners[k]??[])f(e)}setPointerCapture(){}getAttribute(){return this.dataset.touchKey}closest(){return null}}
const nodes=new Map(),el=id=>{if(!nodes.has(id))nodes.set(id,new Node);return nodes.get(id)};
const touch=['KeyW','Space'].map(c=>{const n=new Node;n.dataset.touchKey=c;return n});
const doc=new Node;doc.getElementById=el;doc.querySelectorAll=s=>s==='.touch-btn'?touch:[];
const win=new Node,canvas=new Node;
class V{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}clone(){return new V(this.x,this.y,this.z)}}
const ctx={window:win,document:doc,THREE:{Vector3:V,MathUtils:{clamp:(v,a,b)=>Math.max(a,Math.min(v,b))}},console};
code=code.replace('        })();',`globalThis.test={state,keys,mouseFlight,inputSources,handleKeyChange,setup:()=>{renderer={domElement:globalThis.canvas};setupInteractionEvents();}};})();`);
ctx.canvas=canvas;vm.runInNewContext(code,ctx);const t=ctx.test;t.setup();t.state.mode='playing';
const down=(n,id)=>n.emit('pointerdown',{pointerId:id,preventDefault(){}});
down(touch[0],11);down(touch[1],12);assert(t.keys.up&&t.keys.boost);
touch[1].emit('pointerup',{pointerId:12});assert(t.keys.up&&!t.keys.boost);
touch[0].emit('pointercancel',{pointerId:11});assert(!t.keys.up);
t.handleKeyChange('KeyW',true);down(touch[0],13);touch[0].emit('pointerup',{pointerId:13});assert(t.keys.up);t.handleKeyChange('KeyW',false);assert(!t.keys.up);
canvas.emit('pointerdown',{button:0,pointerId:21,clientX:100,clientY:100});win.emit('pointermove',{pointerId:21,clientX:145,clientY:55});assert(t.mouseFlight.x>0&&t.mouseFlight.y<0);
win.emit('pointerup',{pointerId:22});assert(t.mouseFlight.active);
win.emit('pointerup',{pointerId:21});assert(!t.mouseFlight.active&&t.mouseFlight.x===0);
down(touch[0],31);down(touch[1],32);win.emit('blur');assert(!t.keys.up&&!t.keys.boost&&t.state.mode==='paused');
assert(html.includes('v1.0.4'));assert.equal(fs.readFileSync('apps/sky-racer-3d/VERSION','utf8').trim(),'1.0.4');
console.log('PASS: simultaneous touch, independent release, cancellation, keyboard coexistence, drag pointer identity, blur pause, version');
