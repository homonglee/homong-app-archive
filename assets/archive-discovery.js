(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArchiveDiscovery=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const categories=[['work','업무 자동화'],['documents','문서·회의·기록'],['content','콘텐츠·발표'],['schedule','일정·협업'],['life-finance','생활·재무'],['learning','학습·읽을거리'],['games','게임·놀이']];
  const label=id=>id==='websites'?'제작홈페이지':categories.find(c=>c[0]===id)?.[1]||'분류 확인 중';
  function normalize(apps){
    const seen=new Set();
    return apps.filter(a=>a&&typeof a.slug==='string'&&a.slug!=='mastermind-page'&&!seen.has(a.slug)&&seen.add(a.slug));
  }
  function matches(a,{query='',category='all',collection='all'}={}){
    const text=[a.name,a.description,a.inputOutput,a.slug,a.category,label(a.primaryCategory),...(a.tags||[])].join(' ').toLocaleLowerCase('ko');
    return (category==='all'||(category==='websites'?(a.collections||[]).includes('websites'):a.primaryCategory===category))&&(collection==='all'||(a.collections||[]).includes(collection))&&text.includes(query.trim().toLocaleLowerCase('ko'));
  }
  function featured(apps){
    return apps.filter(a=>Number.isInteger(a.featuredRank)&&a.featuredRank>=1&&a.featuredRank<=6&&a.availability==='available'&&a.quality==='basic-checked'&&a.verification?.checkedAt&&a.verification?.passed?.length).sort((a,b)=>a.featuredRank-b.featuredRank).slice(0,6);
  }
  function status(a){
    if(a.availability==='blocked')return '이용 제한';
    if(a.quality==='identity-mismatch')return '연결 확인 필요';
    if(a.availability==='requires-setup')return '연결 필요';
    if(a.availability==='demo')return a.slug==='schedule-share-link-generator'?'데모 · 연결 필요':'데모';
    if(a.quality==='draft-output')return '검토용 초안';
    if(a.quality==='basic-checked')return '핵심 기능 확인';
    if(a.verification?.checkedAt&&a.verification?.level==='identity')return '화면·내용 확인';
    return '기능 미검증';
  }
  return {categories,label,normalize,matches,featured,status};
});
