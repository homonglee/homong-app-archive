import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const {version}=JSON.parse(await readFile('package.json','utf8'));
const html=await readFile('dist/index.html','utf8'),manual=await readFile('dist/manual.html','utf8'),app=await readFile(`dist/app-v${version}.js`,'utf8'),sw=await readFile('dist/sw.js','utf8');
assert.ok(html.includes(`name="app-version" content="${version}"`),'Release metadata');
assert.ok(!html.includes('id="app-version"')&&!html.includes('엔진 출처'),'No visible version or engine-source link');
assert.ok(manual.includes(`v${version}`)&&manual.includes(`content="${version}"`),'Manual version');
assert.ok(manual.includes(`기준 버전 ${version}`),'Manual visible release version');
assert.ok(app.includes(`APP_VERSION='${version}'`),'Code version');
assert.ok(sw.includes(`VERSION = 'v${version}'`),'Offline cache version');
for(const text of [html,app,manual])assert.ok(!text.includes('용담 선생'),'Opponent renamed consistently');
assert.ok(html.includes('href="./manual.html"'),'Manual in header');
const files=JSON.parse(sw.match(/const FILES = (\[[\s\S]*?\]);/)[1]);
let total=0;for(const file of files){if(file==='./')continue;total+=(await stat('dist/'+file.slice(2))).size}
for(const file of ['manual.html','favicon.ico','og-yongdam-walnut.png','neural/katago-b10.bin.gz','neural/katago-b6.bin.gz','neural/worker.js','neural/tfjs/tfjs-backend-wasm-simd.wasm'])assert.ok(files.includes('./'+file),'Offline asset '+file);
const png=await readFile('dist/og-yongdam-walnut.png');assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
assert.ok(html.includes('https://homong-app.com/용담바둑/og-yongdam-walnut.png'),'Absolute OG image');
console.log(`Release ${version} consistent: header, manual, cache, names, icons, 1200x630 OG; ${(total/1048576).toFixed(1)} MiB cached.`);

const rankCode=await readFile('dist/ranks.js','utf8');assert.ok(rankCode.includes('length:18')&&rankCode.includes('length:9'));assert.ok(!html.includes('KataGo B6')&&!html.includes('KataGo B10'));
