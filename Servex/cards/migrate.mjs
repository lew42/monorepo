#!/usr/bin/env node
/**
 * Migrate the old cards into one folder each.
 *
 *   node Servex/cards/migrate.mjs --out <dir> [--dry]
 *
 * Reads  public/framework/ai/board.jsonl  (cards merged by id, newest fields win)
 *   and  %LOCALAPPDATA%/lew42/servex/logs/cards/<slug>.jsonl  (each card's own log).
 * Writes <dir>/YYYY/MM/DD/<slug>/page.jsonl plus year/month/day index pages.
 * Never deletes or edits the old files. A card folder that already exists is left
 * alone, so running it twice writes nothing the second time.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const oi = args.indexOf("--out");
const out = path.resolve(oi >= 0 ? args[oi + 1] : path.join(root, "public/framework/ai"));

const CLASS = "/framework/ai2/Card.js";
const NOT_CARDS = new Set(["live", "state"]);            // streams, not cards
const listing = child => ({ file: `${child}/page.jsonl` }); // the one shape of a parent's listing line
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const boardFile = path.join(root, "public/framework/ai/board.jsonl");
const logsDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData/Local"), "lew42/servex/logs/cards");

const skipped = [];
const parse = (text, what) => text.split(/\r?\n/).filter(l => l.trim()).map((l, i) => {
	try { return { obj: JSON.parse(l), raw: l }; }
	catch { skipped.push(`${what} line ${i + 1}: not JSON, carried as raw text`); return { obj: null, raw: l }; }
});

// ── read the board: merge by id, newest fields win, remember the earliest `at`
const cards = new Map();
if (fs.existsSync(boardFile)) {
	for (const { obj } of parse(fs.readFileSync(boardFile, "utf8"), "board")) {
		const c = obj?.card;
		if (!c || c.id == null) continue;
		const id = String(c.id);
		const prev = cards.get(id);
		if (!prev) cards.set(id, { fields: { ...c, id }, first: c.at });
		else { prev.fields = { ...prev.fields, ...c, id }; if (c.at != null && (prev.first == null || String(c.at) < String(prev.first))) prev.first = c.at; }
	}
}

// ── read the logs
const logs = new Map();
if (fs.existsSync(logsDir)) {
	for (const f of fs.readdirSync(logsDir).filter(f => f.endsWith(".jsonl")).sort()) {
		const slug = f.slice(0, -6);
		if (NOT_CARDS.has(slug)) { skipped.push(`${f}: a stream, not a card`); continue; }
		logs.set(slug, parse(fs.readFileSync(path.join(logsDir, f), "utf8"), f));
	}
}

// ── titles from Servex's prompts log: "name" and "card" entries whose id or re points at a card
const titles = new Map();   // card id -> latest title, file order = time order
const promptsFile = path.join(path.dirname(logsDir), "prompts.jsonl");
if (fs.existsSync(promptsFile)) {
	for (const l of fs.readFileSync(promptsFile, "utf8").split(/\r?\n/).filter(Boolean)) {
		let o; try { o = JSON.parse(l); } catch { continue; }
		if (o.type !== "name" && o.type !== "card") continue;
		const t = o.title ?? o.name;
		if (!t) continue;
		for (const k of [o.id, ...[].concat(o.re ?? [])]) if (typeof k === "string") titles.set(k, t);
	}
}
let retitled = 0;

// ── one date from the first `at`; the stamps carry the owner's own offset, so the written date is the local one
const pad = n => String(n).padStart(2, "0");
const dateOf = at => {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(at ?? ""));
	if (m) return { y: m[1], m: m[2], d: m[3] };
	const t = new Date(typeof at === "number" ? at : String(at));
	if (isNaN(t)) return null;
	return { y: String(t.getFullYear()), m: pad(t.getMonth() + 1), d: pad(t.getDate()) };
};
const clean = s => String(s).replace(/[^\w.-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "") || "card";
const j = o => JSON.stringify(o);
const empty = v => v == null || v === "" || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
const drop = o => Object.fromEntries(Object.entries(o).filter(([, v]) => !empty(v)));

// ── plan every card
const ids = new Set([...cards.keys(), ...[...logs].filter(([, l]) => l.length).map(([s]) => s)]);
const plan = [];
for (const id of [...ids].sort()) {
	const card = cards.get(id);
	const log = logs.get(id) ?? [];
	const firstLog = log.find(l => l.obj?.at != null)?.obj.at;
	const candidates = [card?.first, firstLog].filter(x => x != null && dateOf(x)).map(String).sort();
	const first = candidates[0];
	const date = first ? dateOf(first) : null;
	if (!date) { skipped.push(`${id}: no usable date, not migrated`); continue; }
	plan.push({ id, slug: clean(id), card, log, first, date });
}

// ── write
let written = 0, messages = 0, prompts = 0, already = 0;
const daysTouched = new Set();
const dirsToList = new Map(); // dir -> {title, children:Set}
const note = (dir, title, child) => { if (!dirsToList.has(dir)) dirsToList.set(dir, { title, kids: [] }); const e = dirsToList.get(dir); if (!e.kids.includes(child)) e.kids.push(child); };
const seenTargets = new Set();

for (const p of plan) {
	const { y, m, d } = p.date;
	const dayDir = path.join(out, y, m, d);
	const dir = path.join(dayDir, p.slug);
	if (seenTargets.has(dir)) { skipped.push(`${p.id}: sanitized slug "${p.slug}" collides with another card, not migrated`); continue; }
	seenTargets.add(dir);
	if (fs.existsSync(dir)) { already++; continue; }

	const f = p.card?.fields ?? {};
	let title = f.title ?? p.log.find(l => l.obj?.title)?.obj.title ?? p.id;
	// a card still called "New card" takes the latest `name` line of its log (assumed shape: {type:"name", name})
	const names = p.log.filter(l => l.obj?.type === "name").map(l => l.obj.name ?? l.obj.title ?? l.obj.text).filter(Boolean);
	if (title === "New card") { const t = names.at(-1) ?? titles.get(p.id); if (t) { title = t; retitled++; } }
	const newId = `${y}/${m}/${d}/${p.slug}`;
	const lines = [{
		class: CLASS, title, type: f.kind ?? f.route ?? "card", id: newId,
		created: p.first, by: f.by ?? f.author ?? p.log.find(l => l.obj?.by)?.obj.by ?? "", tags: [],
	}, { legacy: p.id }];
	for (const [k, v] of Object.entries(f)) {
		if (["id", "at", "title", "by", "author", "kind", "route"].includes(k) || empty(v)) continue;
		lines.push({ [k]: v });
	}
	if (f.author && f.author !== lines[0].by) lines.push({ author: f.author });
	for (const l of p.log) {
		const o = l.obj;
		if (o?.type === "prompt" && o.by === "owner") {
			const id = o.id ?? "p-" + new Date(o.at).getTime().toString(36);
			lines.push({ prompt: drop({ id, at: o.at, by: "owner", raw: o.text, text: o.text, via: o.via || "typed", on: newId, sentences: o.sentences }) });
			prompts++;
			// a `refined` line citing this prompt (assumed shape: {type:"refined", of|prompt|refines: <prompt id>, text|refined}) rewrites its text
			for (const r of p.log) if (r.obj?.type === "refined" && (r.obj.of ?? r.obj.prompt ?? r.obj.refines) === id) { lines.push({ prompt: { id, text: r.obj.text ?? r.obj.refined } }); prompts++; }
			continue;
		}
		if (o?.type === "refined" && p.log.some(x => x.obj?.type === "prompt" && x.obj.by === "owner" && x.obj.id === (o.of ?? o.prompt ?? o.refines))) continue;
		if (!l.obj) { lines.push({ message: { raw: l.raw } }); messages++; continue; }
		const { by, text, at, type, ...rest } = l.obj;
		lines.push({ message: drop({ by, text, at, kind: type, ...rest }) }); messages++;
	}
	written++;
	daysTouched.add(`${y}-${m}-${d}`);
	note(dayDir, `${DAYS[new Date(+y, +m - 1, +d).getDay()]} ${+d} ${MONTHS[+m - 1]}`, p.slug);
	note(path.join(out, y, m), `${MONTHS[+m - 1]} ${y}`, d);
	note(path.join(out, y), y, m);
	if (!dry) {
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "page.jsonl"), lines.map(j).join("\n") + "\n");
	}
}

// index pages: create with a title line, then append only the listing lines that are missing
if (!dry) for (const [dir, { title, kids }] of dirsToList) {
	const file = path.join(dir, "page.jsonl");
	let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : j({ title }) + "\n";
	if (!text.endsWith("\n")) text += "\n";
	for (const k of kids.sort()) { const line = j(listing(k)); if (!text.split("\n").includes(line)) text += line + "\n"; }
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(file, text);
}

console.log(`${dry ? "DRY RUN — nothing written. " : ""}Migrate into ${out}`);
console.log(`  cards ${dry ? "that would be " : ""}written : ${written}`);
console.log(`  prompts carried      : ${prompts}`);
console.log(`  messages carried     : ${messages}`);
console.log(`  titles fixed         : ${retitled}`);
console.log(`  days                 : ${daysTouched.size}`);
if (already) console.log(`  already migrated     : ${already} (left alone)`);
console.log(`  skipped              : ${skipped.length}`);
for (const s of skipped) console.log(`    - ${s}`);
