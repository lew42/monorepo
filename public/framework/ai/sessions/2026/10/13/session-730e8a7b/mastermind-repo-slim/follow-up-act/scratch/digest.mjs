import fs from "node:fs"; import path from "node:path"; import {execFileSync} from "node:child_process";
const root = "public/framework/ai/"; const md = fs.readFileSync(root+"doc/follow-up-full.md","utf8").split("\n");
const rows = md.filter(l=>l.startsWith("| [")&&/\| (quiet|no-outcome) \|$/.test(l));
const out = []; 
for (const l of rows){
  const m = l.match(/\]\(\/framework\/ai\/([^)]+)\/\)/); const dir = root+m[1]; const slug = path.basename(m[1]);
  let tj=""; try{ tj=fs.readFileSync(dir+"/task.jsonl","utf8"); }catch{}
  const lines = tj.split("\n").filter(Boolean).map(s=>s.length>500?s.slice(0,500)+"…":s);
  const keep = lines.length>14 ? [...lines.slice(0,4), "...("+(lines.length-12)+" lines)...", ...lines.slice(-8)] : lines;
  let st=""; for(const f of ["STATE.md","requirements.md"]) { try{ st+= `\n--${f}--\n`+fs.readFileSync(dir+"/"+f,"utf8").slice(0,1200);}catch{} }
  let g=""; try{ g=execFileSync("git",["log","michael/dev","--oneline","-i","-n","5","--grep",slug],{encoding:"utf8"}).trim(); }catch{}
  out.push({slug, dir, kind:l.split("|").slice(-2)[0].trim(), text:`### ${slug}\ndir: ${dir}\nkind: ${l.split("|").slice(-2)[0].trim()}\ntask.jsonl (${lines.length} lines):\n${keep.join("\n")}${st}\ngit log michael/dev grep slug:\n${g||"(none)"}\n`});
}
fs.writeFileSync(process.argv[2]+"/all.json", JSON.stringify(out.map(o=>({slug:o.slug,dir:o.dir,kind:o.kind})),null,1));
const per=10; for(let i=0;i*per<out.length;i++){ fs.writeFileSync(`${process.argv[2]}/batch${i+1}.md`, out.slice(i*per,(i+1)*per).map(o=>o.text).join("\n\n")); }
console.log(out.length, "tasks");
