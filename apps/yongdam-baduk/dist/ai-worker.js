import { chooseMove } from './engine.js';
self.onmessage = ({data}) => {
 const {id,state,level}=data;
 try { self.postMessage({id,index:chooseMove(state,level)}); }
 catch(error){ self.postMessage({id,error:error?.message||'컴퓨터의 수를 계산하지 못했습니다.'}); }
};
