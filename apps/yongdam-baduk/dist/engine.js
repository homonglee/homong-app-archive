/** 용담바둑: dependency-free rules and heuristic practice engine.
 * Area scoring; positional superko; suicide forbidden. Difficulty labels are
 * training bands only, never calibrated playing-strength certifications.
 */
export const LEVELS = [
 {id:0,name:'첫걸음',range:'30–25급',description:'돌을 연결하고 따내는 연습'},
 {id:1,name:'입문',range:'24–20급',description:'단수와 활로를 익히는 대국'},
 {id:2,name:'초급',range:'19–15급',description:'연결과 끊음을 생각하는 대국'},
 {id:3,name:'중급',range:'14–10급',description:'공격과 수비의 균형 연습'},
 {id:4,name:'고급',range:'KataGo B6',description:'학습된 모델로 빠르고 단단하게'},
 {id:5,name:'상급',range:'KataGo B6 심화',description:'더 많은 수를 탐색하는 심화 대국'},
 {id:6,name:'최강',range:'KataGo B10',description:'큰 학습 모델로 깊이 읽는 집중 대국'}
];
const neighborCache = new Map();
function neighbors(size){
 if(!neighborCache.has(size)) neighborCache.set(size,Array.from({length:size*size},(_,i)=>{
  const x=i%size,y=Math.floor(i/size),a=[];
  if(x>0)a.push(i-1);if(x<size-1)a.push(i+1);if(y>0)a.push(i-size);if(y<size-1)a.push(i+size);return a;
 }));return neighborCache.get(size);
}
export function groupAt(board,index,size){
 if(!board[index])return {stones:[],liberties:[]};
 const seen=new Set([index]),stones=[],liberties=new Set(),stack=[index],nn=neighbors(size),color=board[index];
 while(stack.length){const p=stack.pop();stones.push(p);for(const q of nn[p]){
  if(!board[q])liberties.add(q);else if(board[q]===color&&!seen.has(q)){seen.add(q);stack.push(q);}
 }}return {stones,liberties:[...liberties]};
}
function allGroups(board,size){const seen=new Set(),groups=[],at=new Array(board.length);for(let i=0;i<board.length;i++){
 if(!board[i]||seen.has(i))continue;const g=groupAt(board,i,size);g.color=board[i];g.libertySet=new Set(g.liberties);groups.push(g);for(const p of g.stones){seen.add(p);at[p]=g;}
 }return {groups,at};}
export function newGame(size=19,handicap=0){
 size=[9,13,19].includes(Number(size))?Number(size):19;
 handicap=Math.min(size===9?5:9,Math.max(0,Math.floor(Number(handicap)||0)));if(handicap===1)handicap=0;
 const board=Array(size*size).fill(0),low=size===9?2:3,high=size-low-1,mid=(size-1)/2;
 let pts=[[high,low],[low,high],[high,high],[low,low]];
 if(handicap===5)pts.push([mid,mid]);
 if(handicap>=6)pts.push([low,mid],[high,mid]);
 if(handicap===7)pts.push([mid,mid]);
 if(handicap>=8)pts.push([mid,low],[mid,high]);
 if(handicap===9)pts.push([mid,mid]);
 pts.slice(0,handicap).forEach(([x,y])=>board[y*size+x]=1);
 return {size,board,toPlay:handicap?2:1,captures:{1:0,2:0},moves:[],history:[board.join('')],passes:0,finished:false,lastMove:null,handicap};
}
function put(board,size,index,color,history){
 if(!Number.isInteger(index)||index<0||index>=board.length)return {ok:false,error:'바둑판의 교차점에 놓아 주세요.'};
 if(board[index])return {ok:false,error:'이미 돌이 놓인 자리입니다.'};
 const next=board.slice(),nn=neighbors(size);next[index]=color;const captured=[],seen=new Set();
 for(const q of nn[index])if(next[q]===3-color&&!seen.has(q)){
  const g=groupAt(next,q,size);g.stones.forEach(p=>seen.add(p));
  if(!g.liberties.length){for(const p of g.stones){next[p]=0;captured.push(p);}}
 }
 if(!groupAt(next,index,size).liberties.length)return {ok:false,error:'활로가 없는 곳에는 놓을 수 없습니다.'};
 const key=next.join('');if(history&&history.includes(key))return {ok:false,error:'패 또는 이전과 같은 판의 반복은 허용되지 않습니다.'};
 return {ok:true,board:next,captured,key};
}
export function play(state,index){
 if(state.finished)return {ok:false,error:'대국이 끝났습니다. 새 대국을 시작해 주세요.'};
 const color=state.toPlay;
 if(index===-1){const passes=state.passes+1;return {ok:true,state:{...state,board:state.board.slice(),captures:{...state.captures},toPlay:3-color,passes,finished:passes>=2,lastMove:-1,moves:[...state.moves,{index:-1,color,captured:[]}],history:[...state.history]}};}
 const move=put(state.board,state.size,index,color,state.history);if(!move.ok)return move;
 return {ok:true,state:{...state,board:move.board,toPlay:3-color,captures:{...state.captures,[color]:(state.captures[color]||0)+move.captured.length},moves:[...state.moves,{index,color,captured:move.captured}],history:[...state.history,move.key],passes:0,finished:false,lastMove:index}};
}
export function score(state,komi=6.5,dead=[]){
 const board=state.board.slice(),nn=neighbors(state.size);for(const p of dead)if(Number.isInteger(p)&&p>=0&&p<board.length)board[p]=0;
 const ownership=board.slice(),seen=new Set();let black=0,white=Number(komi)||0;
 for(let i=0;i<board.length;i++){
  if(board[i]){if(board[i]===1)black++;else white++;continue;}
  if(seen.has(i))continue;
  const area=[],borders=new Set(),stack=[i];seen.add(i);
  while(stack.length){const p=stack.pop();area.push(p);for(const q of nn[p]){
   if(board[q])borders.add(board[q]);else if(!seen.has(q)){seen.add(q);stack.push(q);}
  }}
  if(borders.size===1){const owner=[...borders][0];for(const p of area)ownership[p]=owner;if(owner===1)black+=area.length;else white+=area.length;}
 }
 return {black,white,winner:black===white?0:black>white?1:2,margin:Math.abs(black-white),ownership};
}
function ownEye(board,p,color,size){
 const nn=neighbors(size),near=nn[p];if(!near.every(q=>board[q]===color))return false;
 const x=p%size,y=Math.floor(p/size);let hostile=0,off=0;
 for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=size||yy>=size)off++;else if(board[yy*size+xx]===3-color)hostile++;}
 return off?hostile===0:hostile<=1;
}
function analyseMove(state,p,color,level,info){
 const {board,size}=state,nn=neighbors(size),move=put(board,size,p,color,state.history);if(!move.ok)return null;
 const own=groupAt(move.board,p,size),adj=new Set(nn[p].map(q=>info.at[q]).filter(Boolean));
 const x=p%size,y=Math.floor(p/size),edge=Math.min(x,y,size-1-x,size-1-y);
 let value=move.captured.length*23,saved=0,threat=0,friend=0,enemy=0;
 for(const g of adj){
  if(g.color===color){friend++;if(g.liberties.length===1&&own.liberties.length>1)saved+=g.stones.length;}
  else {enemy++;if(g.liberties.length===2){const rem=g.liberties.find(q=>q!==p);if(rem!==undefined&&move.board[g.stones[0]])threat+=g.stones.length;}}
 }
 value+=saved*18+Math.min(threat,8)*(level>1?4.2:2.1);
 value+=Math.min(own.liberties.length,7)*1.3;
 if(own.liberties.length===1)value-=own.stones.length*22+15;
 if(own.liberties.length===2&&enemy)value-=Math.min(own.stones.length,8)*2;
 if(ownEye(board,p,color,size))value-=130;
 if(friend>1)value+=Math.min(friend-1,2)*3.5;
 const moveCount=state.moves.length,opening=moveCount<size*2;
 // Efficient third/fourth-line shapes, spreading out before contact.
 if(opening){value+=edge===2?7:edge===3?8:edge===1?-7:edge===0?-13:2;}
 else value+=edge===0?-1:edge===1?0.5:2;
 let closest=99,nearestOwn=99,nearestEnemy=99,nearCount=0;
 for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
  const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=size||yy>=size||(!dx&&!dy))continue;
  const c=board[yy*size+xx];if(!c)continue;const d=Math.abs(dx)+Math.abs(dy);closest=Math.min(closest,d);if(c===color)nearestOwn=Math.min(nearestOwn,d);else nearestEnemy=Math.min(nearestEnemy,d);if(d<=2)nearCount++;
 }
 if(opening){value+=closest===3?9:closest===4?7:closest===2?3:closest===1?-2:4;}
 else {value+=nearestEnemy<=2?4:nearestEnemy===3?2:0;if(nearestOwn>4&&nearestEnemy>4)value-=3;}
 if(nearestEnemy>3&&nearestOwn<3&&!saved&&!move.captured.length)value-=10;
 if(friend>=2&&!enemy&&nearestEnemy>2)value-=10;
 if(friend>=3&&!enemy&&!move.captured.length)value-=25;
 // Occupied corner expansion tends to be safer than empty-board center.
 if(moveCount<8){const low=size===9?2:3,high=size-low-1;const starDist=Math.min(...[[low,low],[low,high],[high,low],[high,high]].map(([a,b])=>Math.abs(x-a)+Math.abs(y-b)));value+=Math.max(0,4-starDist)*2.2;}
 return {index:p,value,board:move.board,captured:move.captured.length,liberties:own.liberties.length,tactical:saved+threat+move.captured.length};
}
function candidateList(state,color,level){
 const info=allGroups(state.board,state.size),result=[];
 for(let p=0;p<state.board.length;p++){if(state.board[p])continue;const a=analyseMove(state,p,color,level,info);if(a)result.push(a);}
 return result.sort((a,b)=>b.value-a.value);
}
function danger(board,size,color){
 const info=allGroups(board,size);let n=0;
 for(const g of info.groups){if(g.color!==color)continue;if(g.liberties.length===1)n+=g.stones.length*20;else if(g.liberties.length===2)n+=Math.min(g.stones.length,8)*1.8;}return n;
}
/** The labels are practice presets; this is a compact local heuristic AI. */
export function chooseMove(state,level=3){
 if(state.finished)return -1;level=Math.max(0,Math.min(6,Math.floor(Number(level)||0)));
 const start=Date.now(),budget=[180,220,280,420,650,950,1350][level],color=state.toPlay;
 let list=candidateList(state,color,level);if(!list.length)return -1;
 const useful=list.filter(m=>m.value>-12);
 if(!useful.length)return -1;
 // After an opponent pass, avoid repeatedly filling settled eyes.
 if(state.passes&&state.moves.length>state.size*2&&list[0].value<5&&!list[0].tactical)return -1;
 const width=[1,1,1,4,7,10,14][level];
 if(level>=3){
  const examined=[];
  for(const move of list.slice(0,width)){
   if(Date.now()-start>budget)break;
   const next={...state,board:move.board,history:[...state.history,move.board.join('')],moves:[...state.moves,{index:move.index,color}]};
   // Search the opponent's strongest local tactical responses rather than random playouts.
   const info=allGroups(next.board,state.size),candidates=new Set(),nn=neighbors(state.size);
   for(const g of info.groups)if(g.liberties.length<=3)g.liberties.forEach(p=>candidates.add(p));
   nn[move.index].forEach(p=>{candidates.add(p);nn[p].forEach(q=>candidates.add(q));});
   let penalty=0;
   for(const p of candidates){if(next.board[p])continue;const reply=analyseMove(next,p,3-color,level,info);if(!reply)continue;
    const tactical=reply.captured*22+danger(reply.board,state.size,color)*0.5;
    if(tactical>penalty)penalty=tactical;
   }
   move.value-=penalty*[0,0,0,.45,.65,.85,1][level];
   examined.push(move);
  }
  if(examined.length)list=examined;
  list.sort((a,b)=>b.value-a.value);
 }
 const noise=[23,16,10,6,3.5,1.8,.7][level];
 const count=[22,14,9,6,4,3,2][level];
 const pool=list.filter(x=>x.value>-25).slice(0,count);if(!pool.length)return -1;
 let best=pool[0],bestValue=-Infinity;
 for(const m of pool){const v=m.value+Math.random()*noise;if(v>bestValue){best=m;bestValue=v;}}
 return best.index;
}
