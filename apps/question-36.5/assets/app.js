(() => {
'use strict';
const $=s=>document.querySelector(s);
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduceMotion.matches;
try {if(localStorage.getItem('question365-motion')==='paused')paused=true;}catch{}
const motionButton=$('#motionToggle');
function setMotion(){document.documentElement.classList.toggle('motion-paused',paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.textContent=paused?'▶ 배경 모션 켜기':'Ⅱ 배경 모션 멈춤';}
setMotion();motionButton.addEventListener('click',()=>{paused=!paused;setMotion();try{localStorage.setItem('question365-motion',paused?'paused':'playing');}catch{}});
reduceMotion.addEventListener('change',e=>{paused=e.matches;setMotion();});
let queued=false;function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=(range>0?scrollY/range*100:0)+'%';queued=false;}addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateProgress);}}, {passive:true});addEventListener('resize',updateProgress);updateProgress();
const themes=[{word:'CHANGE',title:'검색에서, 답변으로.',text:'검색에서 AI의 답변으로 옮겨가는 고객의 선택. 익숙했던 마케팅의 기준이 흔들릴 때, 우리는 무엇을 새로 배워야 할까요?'},{word:'EVIDENCE',title:'그럴듯한 답, 그다음의 질문.',text:'AI의 답변을 검증하고, 무엇을 성과로 볼지 고민합니다. 근거를 묻는 일은 더 나은 결정을 향한 첫걸음입니다.'},{word:'CONNECTION',title:'함께 풀어가는 사람들.',text:'문제를 함께 풀며 가까워지는 동료들. 작은 회사의 분투와 오피스 로맨스 사이에서, 신뢰와 사랑의 의미를 돌아봅니다.'}];
const tabs=[...document.querySelectorAll('[role=tab]')];
function activateTab(i,focus=false){tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===i));tab.tabIndex=n===i?0:-1;});const t=themes[i];$('#themeWord').textContent=t.word;$('#themeTitle').textContent=t.title;$('#themeText').textContent=t.text;$('#theme-panel').setAttribute('aria-labelledby',tabs[i].id);if(focus)tabs[i].focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activateTab(i));tab.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();activateTab(n,true);});});
const questions=[['그래서, 결과는 무엇인가요?','어떤 답을 가장 빨리 얻을 수 있나요?','지금 무엇부터 끝내면 될까요?'],['그 답을 뒷받침하는 근거는 무엇인가요?','우리가 놓친 다른 관점은 없을까요?','이 정보를 어디에서 확인할 수 있을까요?'],['당신은 이 답을 어떻게 느꼈나요?','지금 당신에게 가장 필요한 질문은 무엇인가요?','우리가 서로를 더 믿으려면 무엇을 물어야 할까요?']];
const types=['결과를 향하는 질문','근거를 살피는 질문','마음을 헤아리는 질문'];const colors=['#42859e','#7c789f','#ba1551'];let questionIndex=0;
const slider=$('#temperature');function group(){const v=Number(slider.value);return v<34.9?0:v<36?1:2;}
function showQuestion(){const n=group(),v=Number(slider.value).toFixed(1);$('#tempValue').textContent=v+'°';slider.setAttribute('aria-valuetext',v+'도, '+types[n]);$('#questionType').textContent=types[n];$('#questionText').textContent=questions[n][questionIndex%questions[n].length];$('#tempOrb').style.setProperty('--orb',colors[n]);}
slider.addEventListener('input',()=>{questionIndex=0;showQuestion();});$('#newQuestion').addEventListener('click',()=>{questionIndex++;showQuestion();});showQuestion();
let toastTimer;function toast(s){clearTimeout(toastTimer);$('#toast').textContent=s;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
$('#copyQuestion').addEventListener('click',async()=>{const text=$('#questionText').textContent+'\n— 질문의 온도 36.5도 | 이용호(호몽)';try{await navigator.clipboard.writeText(text);toast('질문을 복사했습니다.');}catch{toast('복사가 제한되어 있습니다. 질문 문장을 길게 눌러 복사해 주세요.');}});
if('IntersectionObserver' in window && !reduceMotion.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section-heading,.story-grid,.story-explorer,.experience-grid,.author-grid,.buy-heading,.stores').forEach(el=>{el.classList.add('reveal','will-reveal');observer.observe(el);});}
})();
