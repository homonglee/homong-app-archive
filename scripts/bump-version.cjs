const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function nextVersion(value){
  if(!/^\d+\.\d{2}$/.test(value))throw Error('Use a release number such as 5.01');
  const [major,minor]=value.split('.').map(Number),next=major*100+minor+1;
  return Math.floor(next/100)+'.'+String(next%100).padStart(2,'0');
}
function bump(rootDirectory=root){
  const file=path.join(rootDirectory,'version.json'),index=path.join(rootDirectory,'index.html');
  const current=JSON.parse(fs.readFileSync(file,'utf8')),version=nextVersion(current.version);
  const html=fs.readFileSync(index,'utf8');
  if(!html.includes('aria-label="사이트 버전 '+current.version+'">v'+current.version+'</span>'))throw Error('Version file and header disagree; no files changed');
  const pattern=/(<span id="siteVersion" class="version-badge" aria-label=")[^"]*(">)v\d+\.\d{2}(<\/span>)/;
  if(!pattern.test(html))throw Error('Header version badge was not found; no files changed');
  const nextHtml=html.replace(pattern,(_,before,after,end)=>before+'사이트 버전 '+version+after+'v'+version+end);
  const updatedAt=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
  fs.writeFileSync(index,nextHtml);
  fs.writeFileSync(file,JSON.stringify({...current,version,updatedAt},null,2)+'\n');
  return version;
}
if(require.main===module)console.log('Release v'+bump());
module.exports={nextVersion,bump};
