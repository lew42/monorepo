// Checks every path a system doc names (markdown links, `backtick/paths`, `node <script>`) against the repo.
// Resolution tries: the doc's own dir, the repo root, public/ (site URLs), Servex/ (/framework/servex/ URLs), Server/ (/framework/dev/).
// A bare file name counts as found if any tracked file has that name. A missing path whose last two segments exist elsewhere is "moved".
// Usage: node doc-paths.mjs [--out doc-paths.json]
import fs from 'node:fs'; import path from 'node:path'; import cp from 'node:child_process';
const docs = ['CLAUDE.md', 'readme.md', 'public/framework/readme.md', 'public/framework/ai/readme.md', 'public/framework/ai/sessions/readme.md',
  '.claude/hooks/readme.md', 'Servex/readme.md', 'Servex/agents/readme.md', 'Server/README.md', 'public/framework/ai/handover.md', 'public/framework/ai/systems-map.md'];
for (const d of fs.readdirSync('Servex/doc')) if (d.endsWith('.md')) docs.push('Servex/doc/' + d);
for (const s of fs.readdirSync('.claude/skills')) { const f = `.claude/skills/${s}/SKILL.md`; if (fs.existsSync(f)) docs.push(f); }
const all = String(cp.execFileSync('git', ['ls-files'], { maxBuffer: 1 << 28 })).split('\n').filter(Boolean);
const base = new Set(all.map(f => f.split('/').pop()));
const moved = p => { const t = p.replace(/\/$/, '').split('/').slice(-2).join('/'); if (!t.includes('/')) return null; return all.find(f => f.includes('/' + t + '/') || f.endsWith('/' + t)) ?? null; };
const exists = (doc, raw) => {
  const p = raw.split('#')[0].split('?')[0].replace(/:\d+$/, '').replace(/[),.;]+$/, ''); if (!p) return true;
  const c = [];
  if (p.startsWith('/')) { c.push('public' + p, p.slice(1)); if (p.startsWith('/framework/servex/')) c.push('Servex/' + p.slice(18)); if (p.startsWith('/framework/dev/')) c.push('Server/' + p.slice(15)); }
  else c.push(path.join(path.dirname(doc), p), p, 'public/' + p, 'public/framework/' + p, 'public/framework/ai/' + p, 'Server/' + p, 'Servex/' + p, '.claude/' + p);
  return c.some(x => fs.existsSync(x));
};
const looksPath = s => /^(\.{0,2}\/)?[\w@.-]+(\/[\w@.-]*)+(\.\w+)?(#.*)?$/.test(s) || /^[\w-]+\.(mjs|js|md|jsonl|json)$/.test(s);
const skip = f => /[<>*{}$…]|YYYY|\bslug\b|^michael\/|^\/api\/|^\/mcp|^https?:/.test(f);
const out = []; let checked = 0;
for (const doc of docs) fs.readFileSync(doc, 'utf8').split('\n').forEach((line, i) => {
  const found = new Set();
  for (const m of line.matchAll(/\]\(([^)\s]+)\)/g)) if (!/^(https?:|mailto:)/.test(m[1])) found.add(m[1]);
  for (const m of line.matchAll(/`([^`\s]+)`/g)) if (looksPath(m[1])) found.add(m[1]);
  for (const m of line.matchAll(/node ([\w./-]+\.m?js)/g)) found.add(m[1]);
  for (const f of found) {
    if (skip(f)) continue; checked++; if (exists(doc, f)) continue;
    const clean = f.split('#')[0].replace(/\/$/, '');
    if (!clean.includes('/')) { if (base.has(clean)) continue; out.push({ doc, line: i + 1, path: f, kind: 'name-not-in-repo' }); continue; }
    const now = moved(clean.replace(/^\//, ''));
    out.push({ doc, line: i + 1, path: f, kind: now ? 'moved' : 'missing', now: now ?? undefined });
  }
});
const by = {}; for (const r of out) by[r.kind] = (by[r.kind] ?? 0) + 1;
const o = process.argv.indexOf('--out'); if (o > 0) fs.writeFileSync(process.argv[o + 1], JSON.stringify({ at: new Date().toISOString(), docs: docs.length, checked, by, missing: out }, null, 1));
console.log(`docs ${docs.length}, paths checked ${checked}, not found ${out.length}`, JSON.stringify(by));
for (const r of out) console.log(`${r.kind.padEnd(17)} ${r.doc}:${r.line}  ${r.path}${r.now ? '  -> ' + r.now : ''}`);
