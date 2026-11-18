const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),D=require('../assets/archive-discovery.js');
const root=path.join(__dirname,'..');
const reg=JSON.parse(fs.readFileSync(path.join(root,'apps_registry.json'),'utf8')),config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const expected={rea:'https://rea.homong-app.com/',iktype:'https://iktype.com/','prompt-golden-key':'https://prompt-golden-key.homong-lee.chatgpt.site/',krcompany:'https://krcompany.vercel.app/',kojibio:'https://kojibio.com/',kabbu:'https://kabbu-homongs-projects.vercel.app/','hovision-ax-diagnosis':'https://hovision-ax-diagnosis.vercel.app/','pm-skills-guide':'https://claude.ai/artifact/5PdHceQC1WUKmpQZgPd9Un',sangdojinsoo:'https://sangdojinsoo-homongs-projects.vercel.app/','kim-hyuk':'https://kim-hyuk-story-2026.homong-lee.chatgpt.site/'};
for(const [slug,url] of Object.entries(expected)){
  assert.equal(reg[slug].deploymentUrl,url);assert.equal(reg[slug].launchMode,'external');
  assert.ok(config.rewrites.some(r=>r.source==='/'+slug+'/'&&r.destination==='/external-app-shell.html?slug='+slug));
  assert.ok(!config.redirects.some(r=>r.source==='/'+slug+'/'));
  assert.ok(fs.existsSync(path.join(root,'manuals',slug+'.html')));
}
const websites=Object.keys(reg).filter(s=>reg[s].collections.includes('websites'));
assert.deepEqual(websites.sort(),['iktype','kojibio','kabbu','sangdojinsoo','kim-hyuk','krcompany'].sort());
assert.equal(D.categories.length,8);assert.ok(websites.every(slug=>reg[slug].primaryCategory==='websites'));
assert.ok(D.matches({...reg.sangdojinsoo,slug:'sangdojinsoo'},{collection:'websites',query:'이진수'}));
assert.ok(D.matches({...reg.sangdojinsoo,slug:'sang도jinsoo'},{query:'제작홈페이지'}));
assert.equal(D.matches({...reg.rea,slug:'rea'},{collection:'websites'}),false);
console.log('Ten original URLs and six created websites preserved as a separate collection');
