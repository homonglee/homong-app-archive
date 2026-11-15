// Update public metadata from the reviewed registry; retain existing display dates.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const reg=JSON.parse(fs.readFileSync(path.join(root,'apps_registry.json'),'utf8'));
const old=JSON.parse(fs.readFileSync(path.join(root,'apps_static.json'),'utf8'));
const categoryIds=new Set(['work','documents','content','schedule','life-finance','learning','games']);
const availability=new Set(['unknown','available','requires-setup','demo','blocked']);
const quality=new Set(['unreviewed','basic-checked','draft-output','identity-mismatch']);
const ranks=new Set();
for(const [slug,a]of Object.entries(reg)){
  if(!categoryIds.has(a.primaryCategory)||!availability.has(a.availability)||!quality.has(a.quality))throw Error('Invalid discovery state: '+slug);
  if(!Array.isArray(a.tags)||!a.tags.includes(a.category)||!Array.isArray(a.collections)||a.collections.some(c=>!['lab','resources'].includes(c)))throw Error('Invalid tags/collections: '+slug);
  if(!a.verification||!Array.isArray(a.verification.passed)||!Array.isArray(a.verification.notTested))throw Error('Invalid verification: '+slug);
  if(a.featuredRank!==null){
    if(!Number.isInteger(a.featuredRank)||a.featuredRank<1||a.featuredRank>6||ranks.has(a.featuredRank)||a.availability!=='available'||a.quality!=='basic-checked'||!a.verification.checkedAt||!a.verification.passed.length)throw Error('Invalid recommendation: '+slug);
    ranks.add(a.featuredRank);
  }
}
const fields=['name','description','url','github','icon','category','downloadUrl','primaryCategory','tags','collections','featuredRank', 'featuredReason','availability','quality','limitations','verification','contentUpdatedAt'];
const seen=new Set();
const apps=old.apps.filter(a=>reg[a.slug]).map(a=>{seen.add(a.slug); const next={...a}; for(const k of fields)if(k in reg[a.slug])next[k]=reg[a.slug][k]; return next;});
for(const [slug,a]of Object.entries(reg))if(!seen.has(slug)){const next={slug,mtime:0,hasLocalIndex:false,source:'manual-registry'};for(const k of fields)if(k in a)next[k]=a[k];apps.push(next);}
fs.writeFileSync(path.join(root,'apps_static.json'),JSON.stringify({...old,apps},null,2)+'\n');
console.log('Generated '+apps.length+' reviewed apps');
