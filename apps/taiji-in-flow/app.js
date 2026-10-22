'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeRead = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;}};
const safeWrite = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value));return true;} catch {return false;}};
const topics = [
  {title:'역사와 기원',description:'기록과 전승 사이, 태극권의 발자취.',body:'태극권의 기원을 이야기할 때는 전해 내려오는 설화와 확인 가능한 기록을 구분하는 것이 좋습니다. 장삼봉 기원설은 전승의 맥락에서, 진가구와 진왕정에 관한 논의는 역사 연구의 맥락에서 살펴볼 수 있습니다. 19세기 이후 여러 지도자의 활동과 함께 다양한 문파가 발전했습니다.',target:'history'},
  {title:'음양과 철학',description:'서로 다른 힘이 만나 만드는 균형.',body:'태극권에서 음양은 움직임을 이해하는 하나의 전통적 관점입니다. 열림과 닫힘, 실함과 비움, 나아감과 물러남을 서로 연결해서 봅니다. 십삼세는 여덟 가지 기본 작용인 팔문과 다섯 가지 방향·중심 개념인 오보를 함께 설명하는 체계입니다.',target:'practice'},
  {title:'문파와 계보',description:'같은 뿌리에서 뻗어 나온 여섯 갈래.',body:'진가·양가·오가·무가·손가 등은 서로 다른 전승과 수련 특징을 보여줍니다. 조보 계통의 홀뢰태극권도 함께 소개합니다. 같은 문파 안에서도 계열과 지도자에 따라 자세, 속도, 투로의 구성이 다를 수 있습니다.',target:'schools'},
  {title:'몸과 움직임',description:'정렬, 이완, 체중 이동을 하나의 흐름으로.',body:'머리와 척추의 편안한 정렬, 어깨와 팔꿈치의 이완, 발의 지지와 체중 이동을 함께 관찰해 보세요. 움직임을 크게 만드는 것보다 무리하지 않는 범위에서 몸 전체가 어떻게 연결되는지 느끼는 것이 수련의 출발점이 됩니다.',target:'practice'},
  {title:'일상 속 수련',description:'오늘의 몸에 맞춰 천천히 시작하기.',body:'주변 공간을 정리하고 미끄럽지 않은 바닥에서 편안한 범위로 움직여 보세요. 깊은 자세나 큰 동작을 서둘러 따라 할 필요는 없습니다. 이곳의 1분 체험은 잠시 몸에 주의를 기울이는 타이머이며, 투로 지도나 개인별 운동 처방을 대신하지 않습니다.',target:'practice'},
  {title:'문화유산과 세계',description:'세대를 넘어 이어지는 살아 있는 전통.',body:'태극권은 2020년 유네스코 인류무형문화유산 대표목록에 등재되었습니다. 동작과 수련법뿐 아니라 공동체 안에서 지식과 문화를 전하고 이어가는 과정에도 의미가 있습니다. UNESCO 공식 영상에서 전승의 다양한 모습을 만나보세요.',target:'videos',source:'https://ich.unesco.org/en/RL/tai-chi-and-taiji-quan-00424'}
];
const schools = [
  {short:'진가',han:'陳',name:'진가태극권',en:'CHEN STYLE',desc:'나선으로 이어지는 전사경과 강함·부드러움의 변화. 느린 흐름 안에 빠르고 탄력적인 힘의 표현이 어우러집니다.',lineage:'진왕정 · 진장흥 계열',tags:['나선형 움직임','강유상제','발경']},
  {short:'양가',han:'楊',name:'양가태극권',en:'YANG STYLE',desc:'크고 편안하게 펼쳐지는 동작을 부드럽게 이어갑니다. 안정적인 자세와 고른 흐름 속에서 몸 전체의 연결을 살펴봅니다.',lineage:'양로선 · 양징보 계열',tags:['크고 부드러운 동작','연속적인 흐름','편안한 정렬']},
  {short:'오가',han:'吳',name:'오가태극권',en:'WU STYLE',desc:'상대적으로 좁은 보형과 치밀한 체중 이동이 특징입니다. 부드러운 접촉과 추수 수련에서 섬세한 변화를 탐색합니다.',lineage:'전우 · 오감천 계열',tags:['치밀한 체중 이동','좁은 보형','부드러운 추수']},
  {short:'무가',han:'武',name:'무가태극권',en:'WU / HAO STYLE',desc:'작고 정교한 움직임을 통해 중심과 자세의 미세한 변화를 살펴봅니다. 간결한 외형 안에서 내부의 연결을 중시합니다.',lineage:'무우양 · 이역여 · 학위진 계열',tags:['정교한 동작','중심 제어','간결한 외형']},
  {short:'손가',han:'孫',name:'손가태극권',en:'SUN STYLE',desc:'형의권·팔괘장·태극권의 경험이 어우러진 문파입니다. 발을 따라 붙이는 근보와 열고 닫는 개합의 움직임을 강조합니다.',lineage:'손록당 계열',tags:['근보','개합','가벼운 발걸음']},
  {short:'홀뢰',han:'雷',name:'홀뢰태극권',en:'HULEI STYLE',desc:'조보 계통에서 발전한 분파로 소개됩니다. 빠른 기락과 진동성 움직임이 특징이며, 전승 계열에 따라 표현에 차이가 있습니다.',lineage:'조보 계통의 분파',tags:['기락의 변화','진동성 움직임','조보 계통']}
];
const timeline = [
  ['17세기 전후','기원을 둘러싼 기록과 전승','진가구와 진왕정에 관한 논의가 역사 연구의 주요 대상이 됩니다. 장삼봉 기원설은 전승으로 구분해 살펴봅니다.'],
  ['19세기','마을을 넘어, 여러 문파로','양로선 등의 활동으로 태극권이 진가구 밖으로 전파되며 다양한 계열과 문파가 발전합니다.'],
  ['20세기','수련의 문이 넓어지다','기원에 대한 문헌·현장 연구와 함께, 전통 무예에서 생활체육과 문화 교류까지 수련의 맥락이 넓어집니다.'],
  ['2020','인류무형문화유산이 되다','유네스코 인류무형문화유산 대표목록 등재. 세대를 이어온 태극권의 지식과 실천이 세계와 연결됩니다.'],
  ['오늘','전통을 잇는 새로운 일상','공원과 도장, 온라인과 국제 교류의 장에서 저마다의 속도로 태극권의 흐름을 이어갑니다.']
];
const principleNotes = [
  '머리 위를 가볍게 끌어올린다고 상상하세요. 턱을 당겨 긴장시키기보다, 목과 어깨가 편안한 위치를 찾아봅니다.',
  '호흡의 길이나 속도를 억지로 정하지 않아도 좋습니다. 숨이 들어오고 나가는 감각과 지금의 몸 상태에 주의를 기울여 보세요.',
  '발바닥이 바닥에 닿는 감각을 살펴보세요. 동작을 크게 만들기보다, 지지하는 발과 가벼워지는 발의 차이를 천천히 느껴봅니다.'
];
$('#topic-grid').innerHTML = topics.map((t,i) => `<button class="topic reveal" data-topic="${i}"><span class="topic-index">0${i+1} / EXPLORE</span><span class="topic-arrow" aria-hidden="true">↗</span><h3>${t.title}</h3><p>${t.description}</p></button>`).join('');
$('#school-tabs').innerHTML = schools.map((s,i) => `<button class="school-tab${i===0?' active':''}" role="tab" id="school-${i}" aria-controls="school-panel" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-school="${i}">${s.short}<span>${s.han}</span></button>`).join('');
$('#timeline').innerHTML = timeline.map((t,i) => `<article class="timeline-entry reveal${i===3?' highlight':''}"><div class="timeline-year">${t[0]}</div><h3>${t[1]}</h3><p>${t[2]}</p></article>`).join('');

function pickSchool(index) {
  const s=schools[index];
  $$('.school-tab').forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-selected',i===index);button.tabIndex=i===index?0:-1;});
  $('#school-panel').setAttribute('aria-labelledby',`school-${index}`);
  $('#school-panel').innerHTML=`<div class="school-art"><span class="school-art-number">0${index+1} / 06</span><span class="school-character" aria-hidden="true">${s.han}</span><span class="school-art-caption">${s.en} · TAIJIQUAN</span></div><div class="school-details"><p class="eyebrow">${s.en}</p><h3>${s.name}</h3><p>${s.desc}</p><div class="school-tags">${s.tags.map(t=>`<span>${t}</span>`).join('')}</div><div class="school-lineage"><span>LINEAGE / 전승 계열</span>${s.lineage}</div></div>`;
}
pickSchool(0);
$$('.school-tab').forEach(b=>b.addEventListener('click',()=>pickSchool(Number(b.dataset.school))));
function keyboardTabs(container, selector, choose, vertical=false) {
  container.addEventListener('keydown',event=>{
    const tabs=$$(selector,container), current=tabs.indexOf(document.activeElement);
    if(current<0)return;
    let next=current;
    if(event.key===(vertical?'ArrowDown':'ArrowRight'))next=(current+1)%tabs.length;
    else if(event.key===(vertical?'ArrowUp':'ArrowLeft'))next=(current-1+tabs.length)%tabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();choose(next);tabs[next].focus();
  });
}
keyboardTabs($('#school-tabs'),'.school-tab',pickSchool);
function pickPrinciple(index) {
  $$('.principle').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',i===index);b.tabIndex=i===index?0:-1;});
  $('#principle-note').textContent=principleNotes[index];
  $('#principle-panel').setAttribute('aria-labelledby',`principle-${index}`);
  $('.taiji-disc').style.filter=`hue-rotate(${index*10}deg)`;
}
$$('.principle').forEach(b=>b.addEventListener('click',()=>pickPrinciple(Number(b.dataset.principle))));
keyboardTabs($('.principles'),'.principle',pickPrinciple,true);

function openDialog(dialog){dialog.showModal();document.body.classList.add('dialog-open');}
$$('dialog').forEach(dialog=>{
  $('.dialog-close',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');if(dialog.id==='video-dialog')$('#video-frame').replaceChildren();});
});
function showInfo(title,html){$('#info-title').textContent=title;$('#info-body').innerHTML=html;openDialog($('#info-dialog'));}
$$('[data-topic]').forEach(button=>button.addEventListener('click',()=>{
  const t=topics[Number(button.dataset.topic)];
  showInfo(t.title,`<p>${t.body}</p>${t.source?`<p><a href="${t.source}" target="_blank" rel="noopener noreferrer">UNESCO 공식 자료 ↗</a></p>`:''}<p><a href="#${t.target}" class="info-section-link">관련 내용 더 살펴보기 ↗</a></p>`);
}));
$('#info-body').addEventListener('click',e=>{if(e.target.closest('.info-section-link'))$('#info-dialog').close();});
$('#credits-open').addEventListener('click',()=>showInfo('자료 출처 · 이미지 크레딧',`<h3>지식 콘텐츠</h3><p>제공된 ‘태극의 길’ 원본의 주제·문파·역사 내용을 바탕으로 학습용 소개를 재구성했습니다. 전승과 역사적 기록은 구분하여 소개하며, 문파의 세부 수련법은 계열에 따라 다릅니다.</p><p><a href="https://ich.unesco.org/en/RL/tai-chi-and-taiji-quan-00424" target="_blank" rel="noopener noreferrer">UNESCO · Taijiquan — 2020 대표목록 등재 ↗</a></p><h3>영상자료</h3><p>YouTube의 Lee Chan Taichi TV, Dr Paul Lam · Tai Chi Productions, yangfamilytaichi, UNESCO 채널 자료를 소개합니다. 영상의 권리는 각 제작자에게 있으며 제목은 탐색을 돕기 위해 한국어로 요약했습니다. 각 영상 창에서 원본 링크를 확인할 수 있습니다.</p><h3>황산 사진</h3><p>© 颐园居 · <a href="https://commons.wikimedia.org/wiki/File:Huangshan_mist_20141109.jpg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a><br><small>원본 파일을 사용하며, 화면에 맞춘 자르기와 색상 오버레이를 적용했습니다.</small></p><p><small>자료 확인: 2026년 10월 22일</small></p>`));

const videos=window.TAIJI_VIDEOS||[];
const savedRaw=safeRead('taiji-saved-videos',[]);
const saved=new Set(Array.isArray(savedRaw)?savedRaw.filter(id=>videos.some(v=>v.id===id)):[]);
let videoFilter='all';
let toastTimeout;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function renderVideos(){
  const query=$('#video-search').value.trim().toLocaleLowerCase();
  const filtered=videos.filter(v=>(videoFilter==='all'||(videoFilter==='saved'?saved.has(v.id):v.category===videoFilter))&&[v.title,v.originalTitle,v.channel,v.description,v.category].join(' ').toLocaleLowerCase().includes(query));
  $('#saved-count').textContent=saved.size;
  $('#video-results-status').textContent=`영상 ${filtered.length}개`;
  $('#video-grid').innerHTML=filtered.length?filtered.map(v=>`<article class="video-card"><button class="video-image" data-video="${v.id}" aria-label="${escapeHTML(v.title)} 재생"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="270" referrerpolicy="no-referrer"><span class="video-label">${v.category}${v.language?' · '+v.language:''}</span><span class="video-play" aria-hidden="true">▶</span>${v.duration?`<span class="video-duration">${v.duration}</span>`:''}</button><div class="video-info"><div class="video-channel">${escapeHTML(v.channel)}</div><h3><button class="video-title-button" data-video="${v.id}" style="padding:0;text-align:left">${v.title}</button></h3><p>${v.description}</p><button class="video-save icon-button" data-save="${v.id}" aria-label="${escapeHTML(v.title)} ${saved.has(v.id)?'저장 해제':'저장'}" aria-pressed="${saved.has(v.id)}"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"/></svg></button></div></article>`).join(''):`<div class="empty-state"><h3>${videoFilter==='saved'&&!query?'저장한 영상이 아직 없습니다.':'검색 결과가 없습니다.'}</h3><p>${videoFilter==='saved'&&!query?'영상 제목 옆의 책갈피를 눌러 다시 보고 싶은 영상을 모아보세요.':'다른 검색어나 분류로 다시 찾아보세요.'}</p></div>`;
  $$('#video-grid img').forEach(img=>img.addEventListener('error',()=>{img.style.opacity='0';},{once:true}));
}
function playVideo(id){
  const v=videos.find(v=>v.id===id);if(!v)return;
  $('#video-dialog-title').textContent=v.title;
  $('#video-dialog-description').textContent=`${v.channel} · ${v.originalTitle}`;
  $('#youtube-link').href=`https://www.youtube.com/watch?v=${id}`;
  if(v.externalOnly){
    $('#video-frame').innerHTML=`<div class="external-video"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt=""><div class="external-video-content"><span class="eyebrow light">WATCH ON YOUTUBE</span><p>이 영상은 YouTube에서 감상해 주세요.</p><a class="button button-light" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">YouTube에서 영상 보기 <span>↗</span></a></div></div>`;
    openDialog($('#video-dialog'));return;
  }
  const iframe=document.createElement('iframe');
  iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&origin=${encodeURIComponent(location.origin)}`;
  iframe.title=`${v.title} — ${v.channel}`;iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
  $('#video-frame').replaceChildren(iframe);openDialog($('#video-dialog'));
}
$('#video-grid').addEventListener('click',event=>{
  const play=event.target.closest('[data-video]');if(play){playVideo(play.dataset.video);return;}
  const save=event.target.closest('[data-save]');if(!save)return;
  const previousIndex=$$('[data-save]').indexOf(save);
  const id=save.dataset.save;const wasSaved=saved.has(id);wasSaved?saved.delete(id):saved.add(id);
  const persisted=safeWrite('taiji-saved-videos',[...saved]);renderVideos();
  const remainingButtons=$$('[data-save]');
  const nextFocus=$(`[data-save="${id}"]`)||remainingButtons[Math.min(previousIndex,remainingButtons.length-1)]||$('.filter-button[data-filter="saved"]');
  nextFocus.focus({preventScroll:true});
  toast(persisted?(wasSaved?'저장한 영상에서 삭제했습니다.':'이 브라우저에 영상을 저장했습니다.'):'브라우저 저장이 제한되어 현재 화면에서만 보관됩니다.');
});
$$('.filter-button').forEach(button=>button.addEventListener('click',()=>{
  videoFilter=button.dataset.filter;$$('.filter-button').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});renderVideos();
}));
$('#video-search').addEventListener('input',renderVideos);renderVideos();

const knowledge=[...topics.map(t=>({title:t.title,summary:t.description,body:t.body,target:t.target})),...schools.map(s=>({title:s.name,summary:s.desc,body:`${s.desc} 전승 계열: ${s.lineage}.`,target:'schools'})),
  {title:'전사경',summary:'나선으로 이어지는 움직임',body:'진가태극권에서 강조하는 나선형의 연결된 움직임을 설명하는 개념입니다. 팔만 돌리는 동작으로 이해하기보다, 몸통·팔다리·체중 이동의 연결을 함께 살펴봅니다.',target:'schools'},
  {title:'십삼세',summary:'팔문과 오보를 아우르는 기본 체계',body:'전통적으로 붕·리·제·안·채·렬·주·고의 팔문과 진·퇴·고·반·정의 오보를 함께 설명하는 태극권의 기본 체계입니다.',target:'about'},
  {title:'호흡과 집중',summary:'자연스러운 숨과 지금의 움직임에 주의 기울이기',body:principleNotes[1],target:'practice'},
  {title:'유네스코',summary:'2020년 인류무형문화유산 대표목록 등재',body:topics[5].body,target:'history'}];
function renderKnowledge(){
  const q=$('#knowledge-query').value.trim().toLocaleLowerCase();
  const found=knowledge.map((k,index)=>({...k,index})).filter(k=>[k.title,k.summary,k.body].join(' ').toLocaleLowerCase().includes(q));
  $('#knowledge-count').textContent=`${found.length}개의 지식 항목`;
  $('#knowledge-results').innerHTML=found.length?found.map(k=>`<button class="knowledge-result" data-knowledge="${k.index}"><strong>${k.title} ↗</strong><span>${k.summary}</span></button>`).join(''):'<p>검색 결과가 없습니다. 다른 검색어로 찾아보세요.</p>';
}
$$('.search-open').forEach(b=>b.addEventListener('click',()=>{closeMenu();renderKnowledge();openDialog($('#search-dialog'));$('#knowledge-query').focus();}));
$('#knowledge-query').addEventListener('input',renderKnowledge);
$$('[data-query]').forEach(b=>b.addEventListener('click',()=>{$('#knowledge-query').value=b.dataset.query;renderKnowledge();$('#knowledge-query').focus();}));
$('#knowledge-results').addEventListener('click',e=>{const b=e.target.closest('[data-knowledge]');if(!b)return;const k=knowledge[Number(b.dataset.knowledge)];$('#search-dialog').close();showInfo(k.title,`<p>${k.body}</p><p><a class="info-section-link" href="#${k.target}">관련 내용 살펴보기 ↗</a></p>`);});

let remaining=60000,deadline=0,timer=null;
function renderTime(){const seconds=Math.max(0,Math.ceil(remaining/1000));$('#session-time').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;$('#session-time').setAttribute('aria-label',`남은 시간 ${seconds}초`);$('#session-progress').style.width=`${100-(remaining/600)}%`;}
function stopTimer(){clearInterval(timer);timer=null;document.body.classList.remove('session-running');}
function timerTick(){remaining=Math.max(0,deadline-Date.now());renderTime();if(remaining<=0){stopTimer();$('#session-start').innerHTML='다시 시작 <span>↗</span>';$('#session-instruction').textContent='한 번의 고요한 멈춤을 마쳤습니다. 지금의 몸 상태를 가볍게 느껴보세요.';$('#session-status').textContent='1분 체험을 마쳤습니다.';}}
$('#session-start').addEventListener('click',()=>{
  if(timer){remaining=Math.max(0,deadline-Date.now());stopTimer();renderTime();$('#session-start').innerHTML='이어서 하기 <span>▷</span>';$('#session-status').textContent='타이머를 잠시 멈췄습니다.';return;}
  if(remaining<=0)remaining=60000;
  deadline=Date.now()+remaining;timer=setInterval(timerTick,200);document.body.classList.add('session-running');$('#session-start').innerHTML='잠시 멈춤 <span>Ⅱ</span>';$('#session-reset').hidden=false;$('#session-instruction').textContent='호흡을 억지로 맞추지 않아도 좋습니다. 몸의 감각에 편안히 머물러 보세요.';$('#session-status').textContent='1분 체험을 시작합니다.';renderTime();
});
$('#session-reset').addEventListener('click',()=>{stopTimer();remaining=60000;renderTime();$('#session-start').innerHTML='1분 시작 <span>↗</span>';$('#session-reset').hidden=true;$('#session-instruction').textContent='편안하게 앉거나 서서, 어깨를 풀고 자연스럽게 호흡해 보세요.';$('#session-status').textContent='타이머를 초기화했습니다.';$('#session-start').focus();});

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let pausedMotion=safeRead('taiji-motion-paused',false)===true;
function applyMotion(){const paused=pausedMotion||reducedMotion.matches;document.documentElement.classList.toggle('motion-paused',paused);$('#motion-toggle').setAttribute('aria-pressed',paused);$('#motion-toggle').disabled=reducedMotion.matches;$('#motion-toggle').innerHTML=reducedMotion.matches?'모션 줄임 적용':paused?'<span aria-hidden="true">▷</span> 모션 재생':'<span aria-hidden="true">Ⅱ</span> 모션 멈춤';}
$('#motion-toggle').addEventListener('click',()=>{pausedMotion=!pausedMotion;safeWrite('taiji-motion-paused',pausedMotion);applyMotion();});reducedMotion.addEventListener('change',applyMotion);applyMotion();
function closeMenu(){$('#nav').classList.remove('open');$('#header').classList.remove('menu-open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','메뉴 열기');}
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('#nav').classList.toggle('open',open);$('#header').classList.toggle('menu-open',open);$('.menu-toggle').setAttribute('aria-expanded',open);$('.menu-toggle').setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
$$('.nav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('#header'))closeMenu();});
let scrollQueued=false;
const navSections=$$('.nav a').map(a=>({a,section:$(a.getAttribute('href'))}));
function updateScroll(){
  const y=window.scrollY;$('#header').classList.toggle('scrolled',y>60);
  $('.reading-progress').style.width=`${Math.min(100,100*y/Math.max(1,document.documentElement.scrollHeight-innerHeight))}%`;
  let current=null;navSections.forEach(x=>{if(x.section.getBoundingClientRect().top<=180)current=x.a;});
  navSections.forEach(x=>{x.a.classList.toggle('current',x.a===current);if(x.a===current)x.a.setAttribute('aria-current','location');else x.a.removeAttribute('aria-current');});scrollQueued=false;
}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();
if('IntersectionObserver' in window){document.body.classList.add('js-ready');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));}
