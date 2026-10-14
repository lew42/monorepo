import LandingCheck from "../../../../../../../../../../Server/LandingCheck.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const br = execFileSync("git",["for-each-ref","--format=%(refname:short)","refs/heads"],{encoding:"utf8"}).split("\n").filter(Boolean).filter(b=>b!=="michael/dev");
const kind = f => /^(public\/)?(framework\/)?ai\//.test(f)||/^public\/framework\/ai\//.test(f)||/files\.jsonl$|\.(png|jpg|jsonl|patch|json)$|^\.scratch|scratch/.test(f)?"records"
 : /\.md$/.test(f)?"docs" : "code";
const out=[];
for (const b of br){ const v=LandingCheck.verify(b); if(v.landed) continue;
 const c={records:[],docs:[],code:[]}; for(const f of v.missing) c[kind(f)].push(f);
 out.push({branch:b,ahead:v.ahead,missing:v.missing.length,records:c.records.length,docs:c.docs,code:c.code}); }
fs.writeFileSync(new URL("classify.json",import.meta.url),JSON.stringify(out,null,1));
for(const o of out) console.log(o.branch,o.ahead,o.missing,"rec",o.records,"docs",o.docs.length,"code",o.code.length);
