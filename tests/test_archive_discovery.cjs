const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const D=require('../assets/archive-discovery.js'),O=require('../assets/archive-order.js');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const reg=JSON.parse(read('apps_registry.json')),snapshot=JSON.parse(read('apps_static.json')).apps,targets=JSON.parse(read('app_targets.json')),config=JSON.parse(read('vercel.json'));
assert.equal(Object.keys(reg).length,35);assert.equal(snapshot.length,35);assert.equal(new Set(snapshot.map(a=>a.slug)).size,35);
assert.deepEqual(new Set(Object.keys(reg)),new Set(Object.keys(targets)));
assert.ok(!reg['mastermind-page']);assert.ok(!targets['mastermind-page']);assert.ok(!JSON.stringify(config).includes('mastermind-page'));
const metadata=['primaryCategory','tags','collections','featuredRank','featuredReason','availability','quality','limitations','verification','contentUpdatedAt'];
for(const a of snapshot){assert.ok(D.categories.some(c=>c[0]===a.primaryCategory));assert.ok(a.tags.includes(a.category));for(const k of metadata)assert.deepEqual(a[k],reg[a.slug][k],a.slug+' '+k);assert.equal(D.matches(a,{query:a.category}),true);}
const sum=D.categories.reduce((n,[id])=>n+snapshot.filter(a=>a.primaryCategory===id).length,0);assert.equal(sum,35);
const rec=D.featured(snapshot);assert.equal(rec.length,5);assert.ok(!rec.some(a=>a.slug==='yongdam-baduk'));
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
console.log('Archive discovery: 35 apps, seven categories, recommendation exclusions, legacy search, metadata contract and script syntax passed');
