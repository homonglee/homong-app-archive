const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const T=require('../assets/archive-theme.js'),V=require('../scripts/bump-version.cjs');
const root=path.resolve(__dirname,'..'),version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(version.version,/^\d+\.\d{2}$/);
assert.ok(html.includes('aria-label="사이트 버전 '+version.version+'">v'+version.version+'</span>'));
assert.ok(html.indexOf('archive-theme.js')<html.indexOf('<style>'));
assert.equal(T.readTheme(null),'dark');
assert.equal(T.readTheme({getItem:()=> 'light'}),'light');
assert.equal(T.readTheme({getItem:()=> 'corrupt'}),'dark');
assert.equal(T.readTheme({getItem(){throw Error('blocked');}}),'dark');
assert.equal(T.writeTheme(null,'light'),false);
assert.equal(T.writeTheme({setItem(){throw Error('quota');}},'light'),false);
const saved=new Map(),storage={getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)};
assert.equal(T.writeTheme(storage,'light'),true);assert.equal(T.readTheme(storage),'light');
assert.equal(T.writeTheme(storage,'invalid'),false);assert.equal(T.readTheme(storage),'light');
assert.equal(V.nextVersion('5.01'),'5.02');assert.equal(V.nextVersion('5.99'),'6.00');
assert.throws(()=>V.nextVersion('5.1'));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'homong-release-'));
try{
  fs.writeFileSync(path.join(dir,'index.html'),html);fs.writeFileSync(path.join(dir,'version.json'),JSON.stringify(version));
  const next=V.bump(dir);
  assert.equal(next,V.nextVersion(version.version));
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'version.json'),'utf8')).version,next);
  assert.ok(fs.readFileSync(path.join(dir,'index.html'),'utf8').includes('>v'+next+'</span>'));
}finally{fs.unlinkSync(path.join(dir,'index.html'));fs.unlinkSync(path.join(dir,'version.json'));fs.rmdirSync(dir);}
for(const block of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(block[0].includes('application/ld+json'))JSON.parse(block[1]);else new vm.Script(block[1]);}
console.log('Theme storage fallback, release increment, header consistency and script syntax passed at v'+version.version);
