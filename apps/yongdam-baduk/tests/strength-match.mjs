/** Small reproducible comparison, not a calibrated rank/Elo assessment.
 * Runs both colours on 9x9 under the app's actual Chinese area-scoring rules.
 * Low visit/time cap is intentional to make the comparison reproducible quickly.
 * Results at a move cap are explicitly inconclusive, never reported as wins.
 */
import assert from 'node:assert/strict';
import {newGame,play,score,chooseMove} from '../dist/engine.js';
import {createNeuralHarness} from './neural-harness.mjs';
const neural=await createNeuralHarness();
const games=[];
try{
 for(const neuralColor of [1,2]){
  let state=newGame(9),totalMs=0,totalVisits=0,neuralMoves=0;
  const started=Date.now();
  while(!state.finished&&state.moves.length<220){
   let index;
   if(state.toPlay===neuralColor){const r=await neural.choose(state,{level:6,komi:6.5,visits:24,maxTimeMs:1000});index=r.index;totalMs+=r.elapsedMs;totalVisits+=r.visits;neuralMoves++;assert.equal(r.backend,'wasm');}
   else index=chooseMove(state,6);
   const next=play(state,index);assert.equal(next.ok,true,'Every selected move must be legal');state=next.state;
   if(state.moves.length%20===0)console.log(JSON.stringify({progress:true,neuralColor,moves:state.moves.length,captures:state.captures}));
  }
  const result={neuralColor,moves:state.moves.length,finished:state.finished,elapsedMs:Date.now()-started,meanNeuralMs:Math.round(totalMs/Math.max(1,neuralMoves)),meanVisits:Math.round(totalVisits/Math.max(1,neuralMoves)),score:state.finished?score(state,6.5):null};
  games.push(result);console.log(JSON.stringify({game:result}));
 }
 console.log(JSON.stringify({summary:games,wins:games.filter(g=>g.finished&&g.score.winner===g.neuralColor).length,completed:games.filter(g=>g.finished).length,note:'Two 9x9 games only; not a rank calibration.'}));
}finally{await neural.close()}
