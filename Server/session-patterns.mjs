// node Server/session-patterns.mjs [--write]   Counts every place a session's data lives today and prints the table
// (pattern, example, count, how it is read). --write puts it in public/framework/ai/sessions/doc/patterns.md.
// Read-only: it only lists folders.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const root = process.env.REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");   // REPO_ROOT: count another checkout (the main tree holds the real data)
const ai = path.join(root, "public/framework/ai");
const dirs = p => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/;

const ids = { store: new Set(), card: new Set(), task: new Set(), transcript: new Set() };   // distinct Claude session ids per pattern (cards by their 8-letter prefix, resolved below)
const count = { flat: 0, flat_ex: "", dated: 0, dated_ex: "", card: 0, card_ex: "", task: 0, task_ex: "", named: 0, named_ex: "" };
for (const n of dirs(path.join(ai, "sessions"))){
	if (UUID.test(n)) ids.store.add(n);
	if (UUID.test(n)){ count.flat++; count.flat_ex ||= `ai/sessions/${n}/`; }
	else if (/^\d{4}$/.test(n)) for (const m of dirs(path.join(ai, "sessions", n))) for (const d of dirs(path.join(ai, "sessions", n, m))) for (const s of dirs(path.join(ai, "sessions", n, m, d))){ ids.store.add(s); count.dated++; count.dated_ex ||= `ai/sessions/${n}/${m}/${d}/${s}/`; }
	else if (n !== "ai" && n !== "doc"){ count.named++; count.named_ex ||= `ai/sessions/${n}/`; }
}
for (const y of dirs(ai).filter(n => /^\d{4}$/.test(n))) for (const m of dirs(path.join(ai, y))) for (const d of dirs(path.join(ai, y, m))) for (const s of dirs(path.join(ai, y, m, d)).filter(n => n.startsWith("session-"))){ ids.card.add(s.slice(8)); count.card++; count.card_ex ||= `ai/${y}/${m}/${d}/${s}/`; }
for (const d of dirs(ai).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n))) for (const t of dirs(path.join(ai, d))){ try { for (const m of fs.readFileSync(path.join(ai, d, t, "task.jsonl"), "utf8").matchAll(/"session_id":"([0-9a-f-]{36})"/g)) ids.task.add(m[1]); } catch {} count.task++; count.task_ex ||= `ai/${d}/${t}/`; }

const projects = path.join(os.homedir(), ".claude", "projects");
let transcripts = 0;
for (const p of dirs(projects)) for (const f of fs.readdirSync(path.join(projects, p)).filter(f => f.endsWith(".jsonl"))){ transcripts++; ids.transcript.add(f.slice(0, -6)); }

// Overlap: the unit is the Claude session id. A card folder is named by the first 8 characters of its id, so it is resolved to a full id
// through the other sets; a prefix that matches none is counted on its own line.
const full = [...new Set([...ids.store, ...ids.task, ...ids.transcript])];
const by8 = new Map(full.map(id => [id.slice(0, 8), id]));
const card_full = new Set(), card_orphan = [];
for (const p of ids.card){ const id = by8.get(p); id ? card_full.add(id) : card_orphan.push(p); }
const sets = { "Session store": ids.store, "Card folders": card_full, "Task folders": ids.task, "Raw transcripts": ids.transcript };
const distinct = new Set([...full, ...card_full]);
const in_n = id => Object.values(sets).filter(s => s.has(id)).length;
const overlap = Object.entries(sets).map(([name, s]) => { const mine = [...s], also = mine.filter(id => in_n(id) > 1).length; return [name, mine.length, also, mine.length - also]; });
const names = Object.keys(sets);
const pair = names.map(a => [a, ...names.map(b => a === b ? "-" : [...sets[a]].filter(id => sets[b].has(id)).length)]);

// Each count that has a matching grid filter is a link: the Sessions grid opens already filtered.
const GRID = "/framework/ai/sessions/", link = (n, q) => q ? `[${n}](${GRID}?records=${q})` : `[${n}](${GRID})`;
const FILTER = { "Session store": "", "Card folders": "has-card", "Task folders": "has-task", "Raw transcripts": "" };
const rows = [
	["Session store, dated", count.dated_ex, link(count.dated), "`Session.dir_url(id)` from the index `day` column. The shape new sessions are written in."],
	["Session store, flat (old)", count.flat_ex, count.flat, "`Session.locate` finds it and moves it into the dated shape on first write; `session-place.mjs` moves all."],
	...(count.named ? [["Named session folder", count.named_ex, count.named, "A folder beside the store with a name, not an id. Listed from `sessions.json` if it has a session id."]] : []),
	["Card folder by date", count.card_ex, link(count.card, "has-card"), "A Servex or VS Code card's `page.jsonl`. Listed from `sessions.json`; opens in the same detail view."],
	["Task folder", count.task_ex, link(count.task, "has-task"), "`task.jsonl` and the brief. Joined to a session by the `session_id` in its launch line."],
	["Raw transcript (outside the repo)", "~/.claude/projects/<cwd>/<id>.jsonl", transcripts, "The source of truth, never copied. `Server/session-cost.mjs` reads it; the page reads the small cached summaries."],
];
const md = `# Where session data lives today

Counted by \`node Server/session-patterns.mjs --write\`, not typed. Every row opens in the same detail view, \`/framework/ai/sessions/<id>/\`.

| Pattern | Example | Count | How it is read |
|---|---|---|---|
${rows.map(r => `| ${r[0]} | \`${r[1]}\` | ${r[2]} | ${r[3]} |`).join("\n")}

## One id, several places

The unit is the Claude session id. **${distinct.size} distinct ids**, plus ${card_orphan.length} card folders whose id prefix matches no other source. The counts above do not add up because a card folder or task folder is a *view onto* a session that already has a transcript, not another session.

| Pattern | Ids | Also in another pattern | Only here |
|---|---|---|---|
${overlap.map(r => `| ${r.join(" | ")} |`).join("\n")}

Ids found in both the row's pattern and the column's:

| | ${names.join(" | ")} |
|---|${names.map(() => "---").join("|")}|
${pair.map(r => `| ${r.join(" | ")} |`).join("\n")}

A task folder counts every id in a \`session_id\` field of its \`task.jsonl\`, so one task can add several. Join by id; no further duplicate hunting.

Every count that is a link opens the Sessions grid already filtered (\`?records=has-card\`, \`has-task\`). The grid's "records" menu also has \`no-card\`, \`no-task\`, \`has-brief\`, \`has-report\`, \`has-parent\` and \`has-children\`. "Only here" ids with no raw transcript are not rows in the grid, because a grid row is built from a transcript.

How the folders are arranged is in [layout](layout.md).
`;
if (process.argv.includes("--write")) fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/framework/ai/sessions/doc/patterns.md"), md);
else console.log(md);
