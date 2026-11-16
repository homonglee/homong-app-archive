(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root.document)api.start(root);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const KEY='homong-app-theme-v1';
  const valid=value=>value==='light'||value==='dark';
  function readTheme(storage){try{const value=storage?.getItem(KEY);return valid(value)?value:'dark';}catch{return 'dark';}}
  function writeTheme(storage,theme){if(!valid(theme))return false;try{if(!storage)return false;storage.setItem(KEY,theme);return true;}catch{return false;}}
  function start(win){
    const doc=win.document;
    let storage;try{storage=win.localStorage;}catch{storage=null;}
    let theme=readTheme(storage);
    function apply(value){
      theme=valid(value)?value:'dark';
      doc.documentElement.dataset.theme=theme;
      doc.documentElement.style.colorScheme=theme;
      const button=doc.getElementById('themeToggle');
      if(button){const label=theme==='dark'?'라이트 모드로 전환':'다크 모드로 전환';button.setAttribute('aria-label',label);button.setAttribute('title',label);button.setAttribute('aria-pressed',String(theme==='light'));}
    }
    apply(theme);
    function bind(){
      const button=doc.getElementById('themeToggle');if(!button)return;
      apply(theme);
      button.addEventListener('click',()=>{
        apply(theme==='dark'?'light':'dark');
        const saved=writeTheme(storage,theme),status=doc.getElementById('themeStatus');
        if(status)status.textContent=(theme==='light'?'라이트':'다크')+' 모드로 전환했습니다.'+(saved?'':' 이 브라우저에 선택을 저장하지 못했습니다.');
      });
    }
    if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
    win.addEventListener('storage',event=>{if(event.key===KEY&&(!event.storageArea||event.storageArea===storage))apply(event.newValue);});
  }
  return {KEY,readTheme,writeTheme,start};
});
