// Round 4 step 3a: every owner prompt in every real transcript from the last N days -> %TEMP%/pw/prompts-<N>d.json   node prompts.mjs [days=30]
import fs from "node:fs"; import path from "node:path";
import { AISessionDigest as D } from "../../../../../../../AISession/AISessionDigest.mjs";
const days = +process.argv[2] || 30, t0 = Date.now(), out = [];
for (const f of D.files(days)) { if (fs.statSync(f.file).size > 60e6) continue; const d = new D(f.file, f.mtime).read(); if (d.machine) continue; for (const p of d.prompts) out.push({ sid: d.id, agent: d.agent, at: p.at, t: p.t }); }
fs.writeFileSync(path.join(process.env.TEMP, "pw", `prompts-${days}d.json`), JSON.stringify(out));
const sess = new Set(out.map(p => p.sid)); console.log(JSON.stringify({ days, prompts: out.length, sessionsWithOwnerPrompt: sess.size, secs: (Date.now() - t0) / 1000, chars: out.reduce((n, p) => n + p.t.length, 0) }));
