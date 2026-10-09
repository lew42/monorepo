import fs from "node:fs"; import os from "node:os"; import path from "node:path";
const ag = await (await fetch("http://127.0.0.1/api/agents",{headers:{host:"servex.localhost"}})).json();
const now = Date.now(), p = path.join(os.homedir(), ".claude", "projects");
const files = {};
for (const d of fs.readdirSync(p)) for (const f of fs.readdirSync(path.join(p, d))) if (f.endsWith(".jsonl")) files[f.slice(0,-6)] = path.join(p, d, f);
const flags = JSON.parse(fs.readFileSync("public/framework/ai/sessions/session-flags.json")).rows;
const min = t => Math.round((now - t) / 60000);
console.log("== Servex agents by state"); const c={}; ag.forEach(a=>c[a.state]=(c[a.state]||0)+1); console.log(c);
console.log("== Servex agents 'working'/'idle' w/ session, transcript quiet >=10min");
for (const a of ag) { if (!a.session_id || ["stopped","dormant"].includes(a.state)) continue; const f = files[a.session_id]; const q = f ? min(fs.statSync(f).mtimeMs) : null; if (q == null || q >= 10) console.log(a.id, a.state, "quiet", q, "min");}
console.log("== VS Code/CLI transcripts touched in last 6h, quiet >=10min, ep");
for (const [id,f] of Object.entries(files)) { const m = fs.statSync(f).mtimeMs; if (now-m > 6*3600e3) continue; const r = flags[id]; if (r?.ep && r.ep !== "sdk-ts" && r.ep!=="sdk-cli") console.log(id.slice(0,8), r.ep, r.role, "quiet", min(m)); }
