import { execFileSync } from "node:child_process"; import fs from "node:fs";
const o=JSON.parse(fs.readFileSync(new URL("classify.json",import.meta.url)));
const g=(...a)=>{try{return execFileSync("git",a,{encoding:"utf8",stdio:["ignore","pipe","ignore"]}).trim()}catch{return null}};
const out=[];
for(const b of o){ const f=[...b.code,...b.docs]; if(!f.length) continue;
 const mb=g("merge-base","michael/dev",b.branch); let absent=0,moved=0,same=0;
 for(const x of f){ if(g("cat-file","-e","michael/dev:"+x)===null){absent++;continue;}
  const n=g("rev-list","--count",mb+"..michael/dev","--",x); (Number(n)>0?moved++:same++); }
 const r={branch:b.branch,ahead:b.ahead,date:g("log","-1","--format=%ad","--date=short",b.branch),files:f.length,absent,devMoved:moved,devUnchanged:same};
 out.push(r); console.log(JSON.stringify(r)); }
fs.writeFileSync(new URL("moved.json",import.meta.url),JSON.stringify(out,null,1));
