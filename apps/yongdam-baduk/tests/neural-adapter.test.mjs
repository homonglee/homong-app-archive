import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,play} from '../dist/engine.js';
import {neuralRequest,pickNeuralMove,chooseStrongMove,cancelStrongSearch} from '../dist/strong-engine.js';

test('neural request includes exact positional history and real board history across pass',()=>{
 let state=newGame(9,4);state=play(state,40).state;state=play(state,-1).state;
 const r=neuralRequest(state,{level:6,komi:.5});
 assert.equal(r.rules,'chinese');assert.equal(r.currentPlayer,'white');
 assert.equal(r.board.length,9);assert.equal(r.previousBoard[4][4],'white');
 assert.equal(r.previousPreviousBoard[4][4],null);
 assert.deepEqual(r.moveHistory.at(-1),{x:-1,y:-1,player:'black'});
 assert.equal(r.repetitionHistory.length,state.history.length);
 assert.equal(r.komi,.5);assert.equal(r.visits,256);assert.equal(r.maxTimeMs,12000);
 for(let k=0;k<state.history.length;k++){
  let key='';for(const ch of r.repetitionHistory[k].split(':')[1]){let v=ch.charCodeAt(0)-65;key+=Math.floor(v/9)+''+Math.floor(v%9/3)+''+v%3}
  assert.equal(key.slice(0,81),state.history[k]);
 }
});
test('root candidate legality enforced; no legal candidate rejects rather than guessing',()=>{
 let state=play(newGame(9),0).state;
 assert.equal(pickNeuralMove(state,{moves:[{x:0,y:0},{x:4,y:4}]}),40);
 assert.throws(()=>pickNeuralMove(state,{moves:[{x:0,y:0}]}),/합법/);
});
test('persistent model reused, progress emitted, failures explicit and cancel rejects',async()=>{
 const original=globalThis.Worker;const created=[];
 class FakeWorker{
  constructor(){this.messages=[];created.push(this)}
  postMessage(m){this.messages.push(m);if(this.pause)return;queueMicrotask(()=>{if(m.type==='katago:init')this.onmessage({data:{type:'katago:init_result',ok:true,backend:'wasm',modelName:'test-real-protocol'}});else this.onmessage({data:{type:'katago:analyze_result',id:m.id,ok:true,backend:'wasm',modelName:'test-real-protocol',analysis:{rootVisits:32,moves:[{x:4,y:4}]}}})})}
  terminate(){this.terminated=true}
 }
 globalThis.Worker=FakeWorker;
 try{
  const phases=[];const result=await chooseStrongMove(newGame(9),{level:4,onProgress:m=>phases.push(m.phase)});
  assert.equal(result.index,40);assert.equal(result.analysis.rootVisits,32);assert.equal(result.visits,32);assert.equal(result.backend,'wasm');
  assert.deepEqual(phases,['loading','ready','searching']);
  await chooseStrongMove(newGame(9),{level:5});assert.equal(created.length,1);assert.equal(created[0].messages.filter(m=>m.type==='katago:init').length,1);
  created[0].pause=true;const waiting=chooseStrongMove(newGame(9),{level:4});cancelStrongSearch();await assert.rejects(waiting,e=>e.name==='AbortError');assert.ok(created[0].terminated);
  const err=chooseStrongMove(newGame(9),{level:4});const last=created.at(-1);last.onmessage({data:{type:'katago:init_result',ok:false,error:'model unavailable'}});await assert.rejects(err,/model unavailable/);
 }finally{cancelStrongSearch();globalThis.Worker=original}
});
