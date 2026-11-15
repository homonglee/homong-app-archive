import assert from 'node:assert/strict';
import { newGame, play, score, chooseMove, LEVELS } from '../dist/engine.js';

const tests=[];
const test=(name,fn)=>tests.push([name,fn]);
const at=(r,c,n=9)=>r*n+c;
function position(stones=[],toPlay=1,size=9){
  const s=newGame(size);
  for(const [r,c,color] of stones)s.board[at(r,c,size)]=color;
  s.toPlay=toPlay;s.history=[s.board.join('')];
  return s;
}

test('new game has an empty 19x19 board and black starts',()=>{
  const s=newGame();assert.equal(s.size,19);assert.equal(s.board.length,361);
  assert.ok(s.board.every(x=>x===0));assert.equal(s.toPlay,1);
  assert.equal(s.finished,false);assert.equal(s.passes,0);assert.deepEqual(s.moves,[]);
});

test('legal play changes turn without mutating the input',()=>{
  const s=newGame(9),before=JSON.stringify(s);const p=play(s,at(4,4));
  assert.equal(p.ok,true);assert.equal(JSON.stringify(s),before);
  assert.equal(p.state.board[at(4,4)],1);assert.equal(p.state.toPlay,2);
  assert.equal(p.state.moves.length,1);assert.equal(p.state.moves[0].index,at(4,4));
  assert.equal(p.state.moves[0].color,1);assert.equal(play(p.state,at(4,4)).ok,false);
});

test('one-stone capture removes the stone and increases the capturing player count',()=>{
  const s=position([[4,4,2],[3,4,1],[4,3,1],[5,4,1]]);
  const p=play(s,at(4,5));assert.equal(p.ok,true);assert.equal(p.state.board[at(4,4)],0);
  assert.equal(p.state.captures[1],1);assert.deepEqual(p.state.moves.at(-1).captured,[at(4,4)]);
});

test('an entire connected group is captured at its last liberty',()=>{
  const s=position([[4,4,2],[4,5,2],[3,4,1],[5,4,1],[4,3,1],[3,5,1],[5,5,1]]);
  const p=play(s,at(4,6));assert.equal(p.ok,true);
  assert.equal(p.state.board[at(4,4)],0);assert.equal(p.state.board[at(4,5)],0);
  assert.equal(p.state.captures[1],2);assert.equal(p.state.moves.at(-1).captured.length,2);
});

test('suicide is rejected but a surrounded capturing move is legal',()=>{
  const s=position([[3,4,2],[4,3,2],[4,5,2],[5,4,2]]);
  assert.equal(play(s,at(4,4)).ok,false);
  const capture=position([[0,1,2],[1,0,2],[0,2,1],[1,1,1],[2,0,1]]);
  const p=play(capture,at(0,0));assert.equal(p.ok,true);assert.equal(p.state.captures[1],2);
});

test('immediate ko recapture and any earlier repeated position are rejected',()=>{
  const s=position([[1,1,2],[0,1,1],[1,0,1],[2,1,1],[0,2,2],[2,2,2],[1,3,2]]);
  const p=play(s,at(1,2));assert.equal(p.ok,true);assert.equal(p.state.captures[1],1);
  const recapture=play(p.state,at(1,1));assert.equal(recapture.ok,false);
  const empty=newGame(9);const first=play(empty,at(4,4));
  empty.history.push(first.state.board.join(''));assert.equal(play(empty,at(4,4)).ok,false);
});

test('passing is allowed despite repeated board; two passes finish a game',()=>{
  const s=newGame(9);const p=play(s,-1);assert.equal(p.ok,true);
  assert.equal(p.state.passes,1);assert.equal(p.state.toPlay,2);assert.equal(p.state.finished,false);
  const q=play(p.state,-1);assert.equal(q.ok,true);assert.equal(q.state.finished,true);
  assert.equal(q.state.passes,2);assert.equal(play(q.state,0).ok,false);
});

test('playing a stone resets consecutive pass count',()=>{
  const p=play(newGame(9),-1);const q=play(p.state,at(4,4));
  assert.equal(q.ok,true);assert.equal(q.state.passes,0);
});

test('fixed handicap stones are unique and white moves first',()=>{
  for(const size of [9,13,19])for(let count=2;count<=(size===9?5:9);count++){
    const s=newGame(size,count);assert.equal(s.board.filter(x=>x===1).length,count);
    assert.equal(s.board.filter(x=>x===2).length,0);assert.equal(s.toPlay,2);
    assert.equal(s.history[0],s.board.join(''));
  }
});

test('handicap limits clamp and a single stone is treated as even play',()=>{
  assert.equal(newGame(9,99).board.filter(x=>x===1).length,5);
  assert.equal(newGame(19,99).board.filter(x=>x===1).length,9);
  assert.equal(newGame(13,1).board.filter(x=>x===1).length,0);
});

test('area scoring counts stones and surrounded points, with white komi',()=>{
  const s=newGame(9);s.board.fill(1);s.board[at(4,4)]=0;
  const result=score(s,6.5);assert.equal(result.black,81);assert.equal(result.white,6.5);
  assert.equal(result.winner,1);assert.equal(result.margin,74.5);assert.equal(result.ownership.length,81);
});

test('mixed-border empty regions are neutral',()=>{
  const s=newGame(9);for(let r=0;r<9;r++)for(let c=0;c<9;c++)s.board[at(r,c)]=c<4?1:c>4?2:0;
  const result=score(s,6.5);assert.equal(result.black,36);assert.equal(result.white,42.5);
  assert.equal(result.winner,2);assert.equal(result.margin,6.5);
  for(let r=0;r<9;r++)assert.equal(result.ownership[at(r,4)],0);
});

test('removing selected dead stones scores resulting territory without input mutation',()=>{
  const s=newGame(9);s.board.fill(1);s.board[at(4,4)]=2;const before=JSON.stringify(s);
  const result=score(s,6.5,[at(4,4)]);assert.equal(result.black,81);assert.equal(result.white,6.5);
  assert.equal(JSON.stringify(s),before);
});

test('all seven difficulty settings choose a legal move without changing the position',()=>{
  assert.equal(LEVELS.length,7);
  let s=newGame(9);for(const index of [at(2,2),at(6,6),at(2,6),at(6,2)])s=play(s,index).state;
  for(let level=0;level<7;level++){
    const before=JSON.stringify(s);const move=chooseMove(s,level);
    assert.equal(Number.isInteger(move),true);assert.equal(play(s,move).ok,true);
    assert.equal(JSON.stringify(s),before);
  }
});

let failures=0;
for(const [name,fn] of tests){
  try{fn();console.log(`PASS ${name}`);}catch(error){failures++;console.error(`FAIL ${name}\n${error.stack}`);}
}
console.log(`${tests.length-failures}/${tests.length} rule tests passed`);
if(failures)process.exitCode=1;
