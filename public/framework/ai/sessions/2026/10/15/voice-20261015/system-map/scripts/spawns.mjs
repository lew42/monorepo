// Who Servex has spawned: Servex's registry.json (every agent id ever spawned), counted by role, by parent kind, by model, with cost.
// Usage: node spawns.mjs [--out spawns.json]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const home = process.env.SERVEX_HOME ?? path.join(process.env.LOCALAPPDATA ?? os.homedir(), 'lew42', 'servex');
const reg = JSON.parse(fs.readFileSync(path.join(home, 'registry.json'), 'utf8'));
const rows = Object.values(reg);
const kind = p => !p ? '(none: code or VS Code)' : p.replace(/-.*/, '');
const roles = {};
for (const r of rows) {
  const k = r.role ?? '(none)'; const x = roles[k] ??= { n: 0, cost: 0, first: null, last: null, parents: {}, models: {} };
  x.n++; x.cost += Number(r.cost) || 0;
  const at = r.started_at?.slice(0, 10); if (at) { if (!x.first || at < x.first) x.first = at; if (!x.last || at > x.last) x.last = at; }
  x.parents[kind(r.parent)] = (x.parents[kind(r.parent)] ?? 0) + 1;
  const m = String(r.model ?? '?').replace(/^claude-/, ''); x.models[m] = (x.models[m] ?? 0) + 1;
}
const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(', ');
const out = Object.entries(roles).sort((a, b) => b[1].n - a[1].n).map(([role, x]) => ({ role, n: x.n, cost: +x.cost.toFixed(2), first: x.first, last: x.last, parents: top(x.parents), models: top(x.models) }));
const o = process.argv.indexOf('--out'); if (o > 0) fs.writeFileSync(process.argv[o + 1], JSON.stringify({ at: new Date().toISOString(), registry: path.join(home, 'registry.json'), agents: rows.length, roles: out }, null, 1));
console.log(`agents ever registered: ${rows.length}`);
for (const r of out) console.log(`${r.role.padEnd(20)} ${String(r.n).padStart(5)}  $${String(r.cost).padStart(8)}  ${r.first}..${r.last}  parents: ${r.parents}  models: ${r.models}`);
