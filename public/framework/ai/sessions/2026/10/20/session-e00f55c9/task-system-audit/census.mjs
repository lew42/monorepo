// Task census: node census.mjs [days=14]. Walks every task.jsonl (sessions + module tasks/), writes census.json and census.md beside this file.
import fs from "fs";import path from "path";import {fileURLToPath} from "url";
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"../../../../../../..");  // public/framework
const DAYS=+process.argv[2]||14, NOW=Date.now(), DAY=864e5;
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==="node_modules"||e.name===".git")continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name==="task.jsonl")files.push(p)}}
walk(root);
const t=s=>{const x=Date.parse(s);return isNaN(x)?null:x};
const day=ms=>new Date(ms).toISOString().slice(0,10);
function who(a){const s=(a.agent||a.by||"")+"";const tab=a.tab||"";
 if(/^mastermind|task-mastermind|sub-mastermind/.test(s))return"mastermind";
 if(/^minion/.test(s))return"minion";
 if(/voice|cloud/.test(s+tab))return"voice";
 if(/servex|StaleClose|heartbeat|TaskLoop|node|append|quick-fix/i.test(s))return"servex";
 if(s)return"other-agent";
 return"tab";}
const tasks=[];
for(const f of files){
 const rel=path.relative(root,f).split(path.sep).join("/"), dir=path.dirname(rel);
 const lines=[];for(const l of fs.readFileSync(f,"utf8").split("\n")){if(l.trim())try{lines.push(JSON.parse(l))}catch{}}
 if(!lines.length)continue;
 let a={},times=[],landed=null,stopped=null,logs=0,title=null,outcome=null,commits=0;
 for(const o of lines){
  if(o.assign)Object.assign(a,o.assign);
  if(o.assign?.landed_at)landed=t(o.assign.landed_at);
  if(o.assign?.title)title=o.assign.title;
  if(o.assign?.outcome)outcome=o.assign.outcome;
  if(o.complete||o.finish)landed=landed??t(o.complete?.at||o.finish?.at)??null;
  if(o.stop){stopped=o.stop; }
  if(o.log)logs++; if(o.commit)commits++;
  for(const v of [o.ts,o.log?.at,o.stop?.at,o.assign?.requested_at,o.assign?.landed_at,o.at,o.commit?.at]){const x=v&&t(v);if(x)times.push(x)}
 }
 if(!times.length)continue;
 const created=a.requested_at?t(a.requested_at):Math.min(...times), last=Math.max(...times);
 const landedFlag=!!(landed||a.landed_at||outcome);
 let state=landedFlag?"landed":stopped?(/abandon|StaleClose/.test(JSON.stringify(stopped))?"abandoned":"stopped"):(NOW-last>DAY?"stalled":"open");
 const home=/^ai\/sessions\//.test(rel)?"session":"module";
 tasks.push({path:dir,title:title||a.request?.slice(0,80)||a.card||path.basename(dir),by:who(a),agent:a.agent||a.tab||null,created:created,day:day(created),last,state,lines:lines.length,logs,commits,home,cost:+a.cost_usd||0,hasOutcome:!!outcome,steps:Array.isArray(a.steps)?a.steps.length:0,step:a.step,session:a.session_id||null,sessionDir:(rel.match(/^ai\/sessions\/\d+\/\d+\/\d+\/[^/]+/)||[null])[0]});
}
const days=[];for(let i=DAYS-1;i>=0;i--)days.push(day(NOW-i*DAY));
const perDay={};for(const d of days)perDay[d]={created:0,by:{},landed:0,open:0,stalled:0,abandoned:0,stopped:0};
for(const x of tasks){const p=perDay[x.day];if(!p)continue;p.created++;p.by[x.by]=(p.by[x.by]||0)+1;p[x.state]++}
const recent=tasks.filter(x=>perDay[x.day]);
// session completion %
const bySess={};for(const x of tasks){if(!x.sessionDir)continue;(bySess[x.sessionDir]??={n:0,landed:0,recent:false})[x.state==="landed"?"landed":"n"]++;bySess[x.sessionDir].tot=(bySess[x.sessionDir].tot||0)+1;if(perDay[x.day])bySess[x.sessionDir].recent=true}
const sess=Object.entries(bySess).filter(([,v])=>v.recent&&v.tot>=2).map(([k,v])=>({session:k,tasks:v.tot,landed:v.landed,pct:Math.round(100*v.landed/v.tot)})).sort((a,b)=>b.tasks-a.tasks);
const overall={};for(const x of recent){overall[x.state]=(overall[x.state]||0)+1}
const ageing={};for(const x of tasks){ageing[x.state]=(ageing[x.state]||0)+1}
// quality
const empty=recent.filter(x=>x.lines<=2&&x.state!=="landed"), untouched=recent.filter(x=>x.logs===0&&x.commits===0&&x.state!=="landed");
const titles={};for(const x of recent){const k=x.title.toLowerCase().replace(/\W+/g," ").trim().slice(0,50);(titles[k]??=[]).push(x.path)}
const dups=Object.entries(titles).filter(([,v])=>v.length>1).map(([k,v])=>({title:k,n:v.length,paths:v.slice(0,4)}));
const byAll={};for(const x of recent)byAll[x.by]=(byAll[x.by]||0)+1;
const byRole={};for(const x of tasks){const r=byRole[x.by]??={n:0,landed:0,stalled:0,abandoned:0,stopped:0,open:0,doneWork_notLanded:0,module:0};r.n++;r[x.state]++;if(x.home==="module")r.module++;if(x.state!=="landed"&&x.commits>0)r.doneWork_notLanded++}
const out={generated:new Date().toISOString(),days:DAYS,total_task_files:tasks.length,window:{tasks:recent.length,by:byAll,state:overall,untouched:untouched.length,empty:empty.length,dup_groups:dups.length,dup_tasks:dups.reduce((s,d)=>s+d.n,0)},allTime:{state:ageing,module_tasks:tasks.filter(x=>x.home==="module").length,session_tasks:tasks.filter(x=>x.home==="session").length},byRole,perDay,sessions:sess.slice(0,25),dups:dups.slice(0,15),untouched:untouched.slice(0,15).map(x=>({path:x.path,by:x.by,title:x.title.slice(0,70)})),empty:empty.slice(0,15).map(x=>({path:x.path,by:x.by,lines:x.lines,title:x.title.slice(0,70)})),stalledSample:recent.filter(x=>x.state==="stalled").slice(0,10).map(x=>({path:x.path,by:x.by,age_h:Math.round((NOW-x.last)/36e5),title:x.title.slice(0,60)}))};
fs.writeFileSync(path.join(here,"census.json"),JSON.stringify(out,null,1));
let m=`# Task census, last ${DAYS} days (computed ${out.generated.slice(0,16)}Z by census.mjs)\n\n`;
m+=`${out.total_task_files} task.jsonl files in all; ${out.window.tasks} created in the window. Window states: ${JSON.stringify(overall)}. All-time: ${JSON.stringify(ageing)}.\n\n| day | created | landed | open | stalled | abandoned | stopped | by |\n|---|---|---|---|---|---|---|---|\n`;
for(const d of days){const p=perDay[d];m+=`| ${d} | ${p.created} | ${p.landed} | ${p.open} | ${p.stalled} | ${p.abandoned} | ${p.stopped} | ${Object.entries(p.by).map(([k,v])=>k+" "+v).join(", ")} |\n`}
m+=`\n## All time, by creator\n| creator | tasks | landed | stalled | abandoned | stopped | open | has commits, not landed | filed in a module tasks/ |\n|---|---|---|---|---|---|---|---|---|\n${Object.entries(byRole).map(([k,r])=>`| ${k} | ${r.n} | ${r.landed} | ${r.stalled} | ${r.abandoned} | ${r.stopped} | ${r.open} | ${r.doneWork_notLanded} | ${r.module} |`).join("\n")}\n\nCreators (window): ${JSON.stringify(byAll)}\n\nUntouched (no log/commit, not landed): ${untouched.length} · near-empty (<=2 lines): ${empty.length} · duplicate-title groups: ${dups.length} (${out.window.dup_tasks} tasks)\n\n## Sessions with 2+ tasks active in the window (completion %)\n| session | tasks | landed | % |\n|---|---|---|---|\n`;
for(const s of sess.slice(0,15))m+=`| ${s.session.replace("ai/sessions/","")} | ${s.tasks} | ${s.landed} | ${s.pct} |\n`;
const tot=sess.reduce((a,s)=>[a[0]+s.tasks,a[1]+s.landed],[0,0]);m+=`\nAcross those ${sess.length} sessions: ${tot[1]}/${tot[0]} landed = ${Math.round(100*tot[1]/tot[0])}%.\n`;
fs.writeFileSync(path.join(here,"census.md"),m);console.log(m);
