// Joins the three skill-use sources into one table and applies a fixed status rule (no judgment):
//   working = some log shows a load in the last 7 days · stale = no load in any log in the last 14 days (or never)
//   unverifiable = last load 8-14 days ago.
// Sources: skill-calls.json (transcripts: Skill tool + /slash), skill-logs.json (ledger hook "skill:" lines; Servex skills.jsonl inlines),
// roles.js (which Servex role carries it). Usage: node skill-table.mjs <taskdir>
import fs from 'node:fs'; import path from 'node:path'; import cp from 'node:child_process'; import { pathToFileURL } from 'node:url';
const dir = process.argv[2] ?? '.';
const tc = JSON.parse(fs.readFileSync(path.join(dir, 'skill-calls.json'), 'utf8'));
const lg = JSON.parse(fs.readFileSync(path.join(dir, 'skill-logs.json'), 'utf8'));
const { ROLES } = await import(pathToFileURL(path.resolve('Servex/agents/roles.js')));
const roleOf = {}; for (const [r, row] of Object.entries(ROLES)) for (const s of row.skills ?? (row.skill ? [row.skill] : [])) (roleOf[s] ??= []).push(r);
const today = new Date('2026-10-15'); const age = d => d ? Math.round((today - new Date(d)) / 864e5) : Infinity;
const rows = [];
for (const s of fs.readdirSync('.claude/skills')) {
  if (!fs.existsSync(`.claude/skills/${s}/SKILL.md`)) continue;
  const t = tc.skills.find(x => x.name === s) ?? {}; const l = lg.ledger[s] ?? {}; const i = lg.servexInjected[s] ?? {};
  const lasts = [t.last, l.last, i.last].filter(Boolean).sort(); const last = lasts.at(-1) ?? null;
  const a = age(last); const status = a <= 7 ? 'working' : a <= 14 ? 'unverifiable' : 'stale';
  const edit = String(cp.execFileSync('git', ['log', '-1', '--format=%cs', '--', `.claude/skills/${s}/SKILL.md`])).trim();
  rows.push({ skill: s, transcript_calls: (t.tool ?? 0) + (t.slash ?? 0), transcript_sessions: t.sessions ?? 0, ledger_lines: l.n ?? 0, servex_inlined: i.n ?? 0, roles: (roleOf[s] ?? []).join(' '), last_used: last, last_edit: edit, status });
}
rows.sort((a, b) => (b.transcript_calls + b.ledger_lines + b.servex_inlined) - (a.transcript_calls + a.ledger_lines + a.servex_inlined));
fs.writeFileSync(path.join(dir, 'skill-table.json'), JSON.stringify(rows, null, 1));
console.log('| skill | transcript calls (sessions) | ledger hook lines | Servex inlined | role row | last used | SKILL.md last commit | status |\n|---|--:|--:|--:|---|---|---|---|');
for (const r of rows) console.log(`| ${r.skill} | ${r.transcript_calls} (${r.transcript_sessions}) | ${r.ledger_lines} | ${r.servex_inlined} | ${r.roles} | ${r.last_used ?? 'never'} | ${r.last_edit} | ${r.status} |`);
