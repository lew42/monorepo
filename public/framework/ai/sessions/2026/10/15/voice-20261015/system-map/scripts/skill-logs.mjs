// Two hook/host logs of skill use: (1) ledger.mjs "skill: X" lines in every task.jsonl under public/
// (all time), (2) Servex's logs/skills.jsonl (skills inlined into a spawned agent's first message by roles.js).
// Usage: node skill-logs.mjs [--out skill-logs.json]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const L = {}, I = {};
const bump = (M, k, at) => { const r = M[k] ??= { n: 0, first: null, last: null }; r.n++; if (at) { if (!r.first || at < r.first) r.first = at; if (!r.last || at > r.last) r.last = at; } };
let taskFiles = 0;
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'task.jsonl') { taskFiles++; for (const line of fs.readFileSync(p, 'utf8').split('\n')) { if (!line.includes('skill: ')) continue; try { const j = JSON.parse(line); const m = j.log?.msg?.match(/^skill: (\S+)/); if (m) bump(L, m[1], j.log.at?.slice(0, 10)); } catch {} } } } };
walk('public');
const sk = path.join(process.env.SERVEX_HOME ?? path.join(process.env.LOCALAPPDATA ?? os.homedir(), 'lew42', 'servex'), 'logs', 'skills.jsonl');
let injectLines = 0, fallback = 0; const roles = {};
if (fs.existsSync(sk)) for (const line of fs.readFileSync(sk, 'utf8').split('\n')) { if (!line.trim()) continue; try { const j = JSON.parse(line); injectLines++; if (j.fallback) fallback++; roles[j.role ?? 'none'] = (roles[j.role ?? 'none'] ?? 0) + 1; for (const s of j.injected ?? []) bump(I, s, j.at?.slice(0, 10)); } catch {} }
const res = { at: new Date().toISOString(), taskFiles, ledger: L, servexInjected: I, servexLog: sk, injectLines, fallback, roles };
const o = process.argv.indexOf('--out'); if (o > 0) fs.writeFileSync(process.argv[o + 1], JSON.stringify(res, null, 1));
console.log(`task.jsonl files ${taskFiles}; servex skills.jsonl lines ${injectLines} (fallback ${fallback})`);
console.log('ledger hook "skill:" lines:'); for (const [k, r] of Object.entries(L).sort((a, b) => b[1].n - a[1].n)) console.log(' ', k.padEnd(26), String(r.n).padStart(5), r.first, r.last);
console.log('servex injected:'); for (const [k, r] of Object.entries(I).sort((a, b) => b[1].n - a[1].n)) console.log(' ', k.padEnd(26), String(r.n).padStart(5), r.first, r.last);
console.log('spawns by role:', JSON.stringify(roles));
