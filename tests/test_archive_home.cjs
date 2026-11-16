const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reg=JSON.parse(read('apps_registry.json')),config=JSON.parse(read('vercel.json'));
const rewrite=new Map(config.rewrites.map(r=>[r.source,r.destination]));
const HOME='https://homong-app.com/';
for(const [slug,app] of Object.entries(reg)){
  let file;
  if(slug==='yongdam-baduk')file='apps/yongdam-baduk/dist/index.html';
  else if(app.launchMode==='external'){
    file='external-app-shell.html';
    assert.equal(rewrite.get('/'+slug+'/'),'/external-app-shell.html?slug='+slug);
    assert.ok(!config.redirects.some(r=>r.source==='/'+slug+'/'));
  }else file=app.shareShell||'app-shell.html';
  const html=read(file),link=html.match(/<a\b[^>]*id="archiveHomeLink"[^>]*>[^<]*<\/a>/)?.[0];
  assert.ok(link,slug+' needs a visible home link');assert.ok(link.includes('href="'+HOME+'"'),slug);assert.ok(link.includes('target="_top"'),slug);
  if(slug!=='yongdam-baduk'&&app.launchMode!=='external')assert.equal(rewrite.get('/'+slug+'/'),'/'+file+'?slug='+slug);
}
assert.ok(read('external-app-shell.html').includes('원본 사이트 새 탭에서 열기'));
const source=read('assets/archive-external-launch.js');new vm.Script(source);
async function launch(slug,{ok=true,protocol='https:'}={}){
  const elements=Object.fromEntries(['launchName','launchDescription','openOriginal','retryLaunch','siteOrigin'].map(id=>[id,{hidden:true,addEventListener(){}}]));
  const target=protocol+'//example.com/source';
  const context={document:{getElementById:id=>elements[id]},location:{pathname:'/'+slug+'/',reload(){}},URL,AbortController,setTimeout,clearTimeout,fetch:async url=>({ok,json:async()=>url.includes('app_targets')?{[slug]:target}:{apps:[{slug:'site',launchMode:'external',name:'Example',description:'Source site'}]}})};
  await vm.runInNewContext(source,context);
  return elements;
}
(async()=>{
  const valid=await launch('site');assert.equal(valid.openOriginal.href,'https://example.com/source');assert.equal(valid.openOriginal.hidden,false);
  const failed=await launch('site',{ok:false});assert.equal(failed.openOriginal.hidden,true);assert.equal(failed.retryLaunch.hidden,false);
  const unknown=await launch('unknown');assert.equal(unknown.openOriginal.hidden,true);
  const unsafe=await launch('site',{protocol:'http:'});assert.equal(unsafe.openOriginal.hidden,true);
  assert.equal(JSON.parse(read('apps/yongdam-baduk/package.json')).version,'2.4.0');
  assert.ok(read('apps/yongdam-baduk/dist/manual.html').includes('기준 버전 2.4.0'));
  console.log('All '+Object.keys(reg).length+' archive entries have top-level home links; external launcher, errors and original-site navigation verified');
})().catch(error=>{console.error(error);process.exitCode=1;});
