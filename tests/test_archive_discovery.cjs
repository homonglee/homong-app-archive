const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const D=require('../assets/archive-discovery.js'),O=require('../assets/archive-order.js');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reg=JSON.parse(read('apps_registry.json')),snapshot=JSON.parse(read('apps_static.json')).apps,targets=JSON.parse(read('app_targets.json')),config=JSON.parse(read('vercel.json'));
assert.equal(Object.keys(reg).length,46);assert.equal(snapshot.length,46);assert.equal(new Set(snapshot.map(a=>a.slug)).size,46);
assert.deepEqual(new Set(Object.keys(reg)),new Set(Object.keys(targets)));
assert.ok(!reg['mastermind-page']);assert.ok(!targets['mastermind-page']);assert.ok(!JSON.stringify(config).includes('mastermind-page'));
const metadata=['primaryCategory','tags','collections','featuredRank','featuredReason','availability','quality','limitations','verification','contentUpdatedAt','inputOutput'];
for(const a of snapshot){assert.ok(D.categories.some(c=>c[0]===a.primaryCategory));assert.ok(a.tags.includes(a.category));for(const k of metadata)assert.deepEqual(a[k],reg[a.slug][k],a.slug+' '+k);assert.equal(D.matches(a,{query:a.category}),true);}
const sum=D.categories.reduce((n,[id])=>n+snapshot.filter(a=>a.primaryCategory===id).length,0);assert.equal(sum,46);
assert.equal(D.categories.length,8);
const prompt = snapshot.find(a=>a.slug==='prompt-golden-key');
for (const query of ['프롬프트엔지니어링황금키','황금키 프롬프트','엔지니어링 황금키']) {
  assert.deepEqual(snapshot.filter(a=>D.matches(a,{query,category:'learning',collection:'resources'})),[prompt]);
  assert.equal(D.matches(prompt,{query,category:'work'}),false);
}
const rec=D.featured(snapshot);assert.deepEqual(rec.map(a=>a.slug),['camping-checklist','markdown-lite-editor','eisenhower-prioritizer','60sec-speech-timer','font-preview-board','yongdam-baduk']);
assert.ok(snapshot.every(a=>typeof a.inputOutput==='string'&&a.inputOutput.length>10));
for(const availability of ['unknown','blocked','requires-setup','demo'])assert.equal(D.featured([{...rec[0],availability}]).length,0);
assert.equal(D.featured([{...rec[0],quality:'identity-mismatch'}]).length,0);
assert.equal(D.featured([{...rec[0],verification:{}}]).length,0);
assert.equal(D.matches(rec[0],{query:'camping',category:'work'}),false);
assert.equal(D.matches(rec[0],{query:'camping',category:'life-finance'}),true);
assert.equal(D.matches(rec[0],{collection:'resources'}),false);
assert.deepEqual(D.normalize([{slug:'a'},{slug:'a'},{slug:'mastermind-page'},{slug:'b'}]).map(a=>a.slug),['a','b']);
assert.equal(D.status({}), '기능 미검증');
const apps=['a','b','c','d','new'].map(slug=>({slug}));
assert.deepEqual(O.applySavedOrder(apps,['c','a','c','mastermind-page','b','d']).map(a=>a.slug),['c','a','b','d','new']);
assert.deepEqual(O.mergeVisibleOrder(apps,[apps[2],apps[0]]).map(a=>a.slug),['c','b','a','d','new']);
for(const block of read('index.html').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(block[0].includes('application/ld+json'))JSON.parse(block[1]);else new vm.Script(block[1]);}
console.log('Archive discovery: 46 apps, eight categories, six verified picks, exclusions, legacy search, metadata contract and script syntax passed');
