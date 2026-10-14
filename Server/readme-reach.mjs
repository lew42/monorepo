// Read-only: is each item linked from its parent readme, and are chain readmes <100 lines?
import fs from 'fs'; import path from 'path';
const F = 'public/framework/';
// [item, readme that should link it, needle]
const items = [
 ['catalog/', F+'readme.md','catalog'],['ux/Dictate/surfaces/', F+'ux/Dictate/readme.md','surfaces'],
 ['ux/Content/Object/', F+'ux/Content/readme.md','Object'],['ai/models', F+'ai/readme.md','models'],
 ['ai/AITask', F+'ai/readme.md','AITask'],
 ...['architecture','repo-size','follow-up','asks-outcomes','skills-proposals-2026-10-13'].map(d=>['ai/doc/'+d+'.md',F+'ai/readme.md',d+'.md']),
 ['core/Page/doc/how-a-page-renders.md',F+'core/Page/readme.md','how-a-page-renders'],
 ['core/Page/doc/storage.md',F+'core/Page/readme.md','storage.md'],
 ['ext/Figma/doc/round-trip.md',F+'ext/Figma/readme.md','round-trip'],
 ['ext/Refine/doc/confidence.md',F+'ext/Refine/readme.md','confidence.md'],
 ['ext/Refine/runs/',F+'ext/Refine/readme.md','runs'],
 ['Server/doc/session-index.md','Server/readme.md','session-index'],
 ['Servex/agents/doc/assistant-chain.md','Servex/agents/readme.md','assistant-chain'],
 ['lab/doc/pwa-state.md',F+'lab/readme.md','pwa-state'],
];
let miss=0;
for (const [it,rd,n] of items){ const t=fs.existsSync(rd)?fs.readFileSync(rd,'utf8'):''; const ok=t.includes(n); if(!ok)miss++; console.log((ok?'OK  ':'MISS')+' '+it+'  <- '+rd);}
console.log(`checked ${items.length} / listed ${items.length}, misses ${miss}`);
for (const r of ['readme.md',F+'readme.md',F+'ai/readme.md',F+'core/Page/readme.md',F+'ext/Refine/readme.md',F+'ext/Figma/readme.md',F+'lab/readme.md','Server/readme.md']){
 const n=fs.readFileSync(r,'utf8').split('\n').length; if(n>100) console.log('OVER100 '+r+' '+n);}
