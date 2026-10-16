import fs from "node:fs"; import path from "node:path";
const info = JSON.parse(fs.readFileSync(new URL("./kinds.json", import.meta.url), "utf8"));
const MACHINE = /^(You clean up|Read this numbered|Current outline|The prompt, one numbered|You are cleaning|Turn this outline|These sentences|You judge|You are reading prompts|Call the SendMessage)/;
const AI = "C:/Code/lew42/monorepo/public/framework/ai"; const linked = new Set();
(function w(d) { let e; try { e = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const x of e) { const p = d + "/" + x.name; if (x.isDirectory()) { if (x.name !== "node_modules") w(p); } else if (x.name === "task.jsonl") { const t = fs.readFileSync(p, "utf8"); for (const m of t.matchAll(/"session_id":"([0-9a-f-]{36})"/g)) linked.add(m[1]); } } })(AI + "/sessions");
const real = info.filter(r => !MACHINE.test(r.key));
const lk = info.filter(r => linked.has(r.id));
const both = real.filter(r => linked.has(r.id));
const mb = a => +(a.reduce((s, r) => s + r.kb, 0) / 1024).toFixed(1);
const med = a => { const s = a.map(r => r.kb).sort((x, y) => x - y); return +(s[Math.floor(s.length / 2)] || 0).toFixed(1); };
console.log(JSON.stringify({ all: info.length, machine: info.length - real.length, real: real.length, realMB: mb(real), realMedKB: med(real), linkedToTask: lk.length, linkedMB: mb(lk), realAndLinked: both.length, realNotLinked: real.length - both.length,
  real_ge4KB: real.filter(r => r.kb >= 4).length, real_ge4KB_MB: mb(real.filter(r => r.kb >= 4)), real_lt2KB: real.filter(r => r.kb < 2).length, real_gt150KB: real.filter(r => r.kb > 150).length, real_gt150KB_MB: mb(real.filter(r => r.kb > 150)) }, null, 1));
fs.writeFileSync(new URL("./real.json", import.meta.url), JSON.stringify(real.map(r => ({ id: r.id, p: r.p, kb: r.kb, linked: linked.has(r.id), key: r.key, last: r.last }))));
