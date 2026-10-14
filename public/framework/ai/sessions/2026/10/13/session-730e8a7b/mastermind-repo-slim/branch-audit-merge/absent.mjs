import { execFileSync } from "node:child_process"; import fs from "node:fs";
const o=JSON.parse(fs.readFileSync(new URL("classify.json",import.meta.url)));
const g=(...a)=>{try{return execFileSync("git",a,{encoding:"utf8",stdio:["ignore","pipe","ignore"]})}catch{return null}};
const res=[];
for(const b of o){ const f=[...b.code,...b.docs]; if(!f.length) continue;
 const abs=[],diff=[];
 for(const x of f){ const onDev=g("cat-file","-e","michael/dev:"+x)!==null; const onBr=g("cat-file","-e",b.branch+":"+x)!==null;
  (onDev?diff:abs).push(x+(onBr?"":" [deleted-on-branch]")); }
 res.push({branch:b.branch,absent:abs,differ:diff.length}); console.log(b.branch,"absentOnDev",abs.length,"differ",diff.length, abs.slice(0,6).join(" | ")); }
fs.writeFileSync(new URL("absent.json",import.meta.url),JSON.stringify(res,null,1));
