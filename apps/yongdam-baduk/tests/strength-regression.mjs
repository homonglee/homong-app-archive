import assert from 'node:assert/strict';
import test,{before,after} from 'node:test';
import {newGame,play,chooseMove} from '../dist/engine.js';
import {neuralRequest} from '../dist/strong-engine.js';
import {createNeuralHarness} from './neural-harness.mjs';
import {tacticalFixtures,koFixture,ladderCanBeCaptured,replay,fromDiagram} from './strength-fixtures.mjs';
let neural;
before(async()=>{neural=await createNeuralHarness()});
after(async()=>{await neural?.close()});
async function analyze(s,options={}){const r=await neural.choose(s,{level:6,visits:32,maxTimeMs:30000,...options});assert.equal(r.backend,'wasm');assert.equal(play(s,r.index).ok,true);assert.ok(Number.isFinite(r.rootScoreLead));assert.ok(r.visits>0);return r}

test('neural request preserves coordinates, colour, komi, pass history and capture reversal',()=>{
 const s=replay(9,[20,21,29,-1]);
 const req=neuralRequest(s,{level:6,komi:.5});
 assert.equal(req.board[2][2],'black');assert.equal(req.board[2][3],'white');assert.equal(req.board[3][2],'black');
 assert.equal(req.currentPlayer,'black');assert.equal(req.komi,.5);assert.equal(req.rules,'chinese');
 assert.deepEqual(req.moveHistory.at(-1),{x:-1,y:-1,player:'white'});
 assert.deepEqual(req.previousBoard,req.board,'a pass preserves previous board');
 assert.equal(req.previousPreviousBoard[3][2],null,'previous previous board reverses earlier stone');
 assert.equal(req.repetitionHistory.length,s.history.length);
 const k=koFixture(),kr=neuralRequest(k.state,{komi:6.5});
 assert.equal(kr.board[1][1],'black');assert.equal(kr.board[1][2],null);
 assert.equal(kr.previousBoard[1][1],null);assert.equal(kr.previousBoard[1][2],'white');
});

test('real WASM neural search supports 9, 13 and 19 board sizes',async()=>{
 for(const size of [9,13,19]){
  const r=await analyze(newGame(size),{visits:16});
  assert.ok(r.index>=0&&r.index<size*size,`${size}: non-pass opening`);
  assert.ok(r.visits>=16,`${size}: complete fixed visit budget`);
  console.log(JSON.stringify({case:'board-size',size,index:r.index,visits:r.visits,ms:r.elapsedMs,model:r.modelName}));
 }
});

test('handicap position reaches the neural engine as White to play without extra compensation',async()=>{
 const s=newGame(13,4),req=neuralRequest(s,{level:6,komi:.5});
 assert.equal(req.currentPlayer,'white');assert.equal(req.komi,.5);
 assert.equal(req.board.flat().filter(x=>x==='black').length,4);
 const r=await analyze(s,{visits:16,komi:.5});
 assert.ok(r.index>=0);assert.equal(play(s,r.index).state.board[r.index],2);
});

test('real search rejects an immediate ko recapture',async()=>{
 const {state,forbidden}=koFixture();
 assert.equal(play(state,forbidden).ok,false);
 const r=await analyze(state);assert.notEqual(r.index,forbidden);
});

test('real search finds the capture that rescues a chain in atari',async()=>{
 const f=tacticalFixtures.find(x=>x.name==='capture_three_stones'),s=f.state();
 const r=await analyze(s,{visits:64});assert.ok(f.expected.includes(r.index));
 assert.equal(play(s,r.index).state.captures[1],3);
 console.log(JSON.stringify({case:f.name,baseline:chooseMove(s,6),neural:r.index,visits:r.visits,ms:r.elapsedMs}));
});

test('real search avoids feeding a forced ladder that the old highest heuristic extends',async()=>{
 const f=tacticalFixtures.find(x=>x.name==='doomed_ladder'),s=f.state();
 assert.equal(ladderCanBeCaptured(s,20),true,'fixture is a forced ladder');
 const old=chooseMove(s,6); // Characterization only; future heuristic improvements are welcome.
 const r=await analyze(s,{visits:64});assert.ok(!f.avoid.includes(r.index),'neural engine abandons doomed chain');
 console.log(JSON.stringify({case:f.name,baseline:old,neural:r.index,visits:r.visits,ms:r.elapsedMs}));
});

test('larger White komi lowers the neural estimate for Black',async()=>{
 const s=fromDiagram('balanced9',`
.........
..X.O....
...X.O...
.X..O....
....X.O..
..O.X....
...O.X...
.........
.........
`,1);
 const low=await analyze(s,{visits:32,komi:.5});
 const high=await analyze(s,{visits:32,komi:14.5});
 assert.ok(high.rootScoreLead<low.rootScoreLead-7,'14 extra komi must substantially reduce Black lead');
 console.log(JSON.stringify({case:'komi',komi05:low.rootScoreLead,komi145:high.rootScoreLead}));
});
