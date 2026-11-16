const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../app-shell.html'),'utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
new vm.Script(source);
async function shell(slug){
  const nodes={status:{remove(){this.removed=true;}},manualLink:{},usageNotice:{hidden:true}};
  const frames=[];
  const document={getElementById:id=>nodes[id],createElement:()=>({setAttribute(){},addEventListener(type,callback){this.onLoad=callback;}}),body:{appendChild:frame=>frames.push(frame)}};
  await vm.runInNewContext(source,{document,location:{pathname:'/'+slug+'/'},fetch:async()=>({ok:true,json:async()=>({[slug]:'https://example.com/app'})}),console});
  frames[0].onLoad();
  assert.ok(nodes.status.removed);
  assert.equal(frames[0].src,'https://example.com/app');
  return nodes.usageNotice;
}
(async()=>{
  for(const [slug,label] of [['schedule-share-link-generator','데모 · 연결 필요'],['meeting-secretary-app','검토용 초안'],['subscription-dashboard','샘플 날짜 안내'],['memory-companion','샘플 날짜 안내']]){
    const notice=await shell(slug);assert.equal(notice.hidden,false);assert.ok(notice.textContent.startsWith(label));
  }
  assert.equal((await shell('markdown-lite-editor')).hidden,true);
  console.log('App notices remain visible after result iframe loads; unaffected apps have no notice');
})().catch(error=>{console.error(error);process.exitCode=1;});
