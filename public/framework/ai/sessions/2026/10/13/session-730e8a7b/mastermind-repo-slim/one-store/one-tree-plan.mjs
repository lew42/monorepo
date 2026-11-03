#!/usr/bin/env node
// one-tree-plan.mjs — DRY RUN of the one-tree move (doc/one-tree.md, option b): every card folder
// public/framework/ai/YYYY/MM/DD/<card>/ -> public/framework/ai/sessions/YYYY/MM/DD/cards/<card>/, and every md/js/mjs/html
// line that names one, rewritten. Writes one-tree-manifest.json beside itself; moves and rewrites NOTHING.
// The apply is TaskMove's (ledger, sha1 snapshot, run-scoped --undo), once the card readers resolve ids (doc/one-tree.md#proof).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "../../../../../../../../../..");
const AI = path.join(REPO, "public/framework/ai");
const slash = p => p.split(path.sep).join("/"), rel = p => slash(path.relative(REPO, p));
const ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };

const moves = [];
for (const y of ls(AI).filter(n => /^\d{4}$/.test(n))) for (const m of ls(path.join(AI, y))) for (const d of ls(path.join(AI, y, m)))
	for (const c of ls(path.join(AI, y, m, d))){
		const from = path.join(AI, y, m, d, c), to = path.join(AI, "sessions", y, m, d, "cards", c);
		moves.push({ kind: "card", id: `${y}/${m}/${d}/${c}`, from: rel(from), to: rel(to), exists: fs.existsSync(to) });
	}
// the day pages of the card tree (ai/YYYY/MM/DD/page.jsonl and friends) go to the store day as cards/ index files
const loose = [];
for (const y of ls(AI).filter(n => /^\d{4}$/.test(n))) for (const m of ls(path.join(AI, y))) for (const d of ls(path.join(AI, y, m)))
	for (const f of fs.readdirSync(path.join(AI, y, m, d), { withFileTypes: true }).filter(e => e.isFile()))
		loose.push({ kind: "cardday", from: rel(path.join(AI, y, m, d, f.name)), to: rel(path.join(AI, "sessions", y, m, d, "cards", f.name)) });

// relink: /framework/ai/YYYY/MM/DD/<card> (and public/… and bare ai/…) -> the store path; md/js/mjs/html only, never records
const RE = /((?:public)?\/framework\/ai\/|(?<![\w/])ai\/)(20\d\d\/\d\d\/\d\d\/)(?=[\w.-])/g;
const relink = []; let lines = 0;
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){
	if (["node_modules", ".git", "worktrees"].includes(e.name)) continue;
	const f = path.join(d, e.name);
	if (e.isDirectory()){ walk(f); continue; }
	if (![".md", ".js", ".mjs", ".html"].includes(path.extname(e.name))) continue;
	let s; try { s = fs.readFileSync(f, "utf8"); } catch { continue; }
	const hits = s.split("\n").map((l, i) => [i + 1, (l.match(RE) ?? []).length]).filter(([, n]) => n);
	if (hits.length){ relink.push({ file: rel(f), lines: hits.map(([n]) => n), mentions: hits.reduce((a, [, n]) => a + n, 0) }); lines += hits.length; }
} };
for (const d of ["public", "Server", "Servex", ".claude"]) walk(path.join(REPO, d));

const out = {
	at: new Date().toISOString(), dry_run: true, decision: "doc/one-tree.md",
	totals: { card_folders: moves.length, target_exists: moves.filter(m => m.exists).length, day_files: loose.length, relink_files: relink.length, relink_lines: lines, relink_mentions: relink.reduce((a, r) => a + r.mentions, 0) },
	moves, day_files: loose, relink,
};
fs.writeFileSync(path.join(here, "one-tree-manifest.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.totals));
