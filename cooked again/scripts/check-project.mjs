import fs from 'node:fs';
import path from 'node:path';
const root='.';
const skip=new Set(['node_modules','.git','scripts/check-project.mjs']);
const bad=[];
function walk(dir){
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,ent.name);
  if(ent.isDirectory()){ if(!skip.has(p)) walk(p); continue; }
  if(/\.(html|js|css|txt|json|md)$/i.test(ent.name)){
   const s=fs.readFileSync(p,'utf8');
   if(/by\s+medo|medo\.ai|medo-(badge|brand|watermark|widget)|<[^>]*(?:by\s+medo|medo\.ai)[^>]*>/i.test(s)) bad.push(p);
  }
 }
}
walk(root);
if(bad.length){console.error('Possible branding references:',bad.join('\n'));process.exit(1)}
console.log('Branding scan passed.');
