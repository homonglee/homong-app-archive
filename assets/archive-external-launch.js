(async function(){
  const slug=location.pathname.split('/').filter(Boolean)[0];
  const name=document.getElementById('launchName'),description=document.getElementById('launchDescription'),open=document.getElementById('openOriginal'),retry=document.getElementById('retryLaunch');
  retry.addEventListener('click',()=>location.reload());
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
    const [targetsResponse,appsResponse]=await Promise.all([fetch('/api/app_targets',{signal:controller.signal,cache:'no-store'}),fetch('/apps_static.json',{signal:controller.signal,cache:'no-store'})]);
    if(!targetsResponse.ok||!appsResponse.ok)throw Error('목록 연결 실패');
    const [targets,data]=await Promise.all([targetsResponse.json(),appsResponse.json()]);
    const app=data.apps.find(a=>a.slug===slug&&a.launchMode==='external');
    if(!app||!targets[slug])throw Error('등록된 사이트를 찾지 못했습니다');
    const target=new URL(targets[slug]);if(target.protocol!=='https:')throw Error('지원하지 않는 주소입니다');
    name.textContent=app.name;description.textContent=app.inputOutput||app.description;
    document.title=app.name+' · 호몽 앱 아카이브';
    open.href=target.href;open.hidden=false;document.getElementById('siteOrigin').textContent=target.hostname;
  }catch(error){name.textContent='사이트 연결을 확인해 주세요';description.textContent='연결 정보를 불러오지 못했습니다. 다시 시도하거나 아카이브 홈에서 다른 앱을 선택해 주세요.';retry.hidden=false;}
  finally{clearTimeout(timer);}
})();
