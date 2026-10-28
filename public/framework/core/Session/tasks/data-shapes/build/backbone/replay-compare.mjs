// Old files must replay identically: replay every real session.jsonl, task.jsonl, improvements.jsonl and page.jsonl with one
// checkout's code, and write one digest line per file. Run it once with the old code and once with the new, then compare.
//
//   node replay-compare.mjs --code <repo root> --data <repo root> --out <digests.jsonl> [--match <substring>]
//   node replay-compare.mjs --compare <before.jsonl> <after.jsonl>
//
// --code: whose core/Item, Task, Session and Page do the replay. --data: whose public/ holds the files (read only).
// Each file is replayed the way the item tool picks its class (Servex/agents/page_tools.js class_of): a line 1 naming a
// `class`, else a {session:{…}} line 1 is a Session, else by file name. Child references stay stubs (no resolver), so
// every file is judged on its own lines. Ids and the wall clock are made deterministic, so two runs of the same code agree.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const arg = name => { const i = process.argv.indexOf(name); return i === -1 ? undefined : process.argv[i + 1]; };

if (process.argv.includes("--compare")){
	const [a, b] = process.argv.slice(process.argv.indexOf("--compare") + 1);
	const read = f => new Map(fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)).map(r => [r.file, r]));
	const before = read(a), after = read(b);
	let same = 0, changed = 0, ms_a = 0, ms_b = 0;
	const diff = [], missing = [];
	for (const [file, r] of before){
		const s = after.get(file);
		if (!s){ missing.push(file); continue; }
		if (s.text !== r.text){ changed++; continue; }   // the file itself changed between the two runs (a live log): not comparable
		ms_a += r.ms; ms_b += s.ms;
		if (r.digest === s.digest && r.err === s.err) same++;
		else diff.push({ file, before: r.err ?? r.digest.slice(0, 10), after: s.err ?? s.digest.slice(0, 10) });
	}
	const slow = [...before.values()].sort((x, y) => y.ms - x.ms).slice(0, 5).map(r => ({ file: r.file, lines: r.lines, before_ms: r.ms, after_ms: after.get(r.file)?.ms }));
	console.log(JSON.stringify({ files: before.size, same, changed_between_runs: changed, different: diff.length, missing: missing.length, total_ms: { before: Math.round(ms_a), after: Math.round(ms_b) }, slowest: slow }, null, 1));
	for (const d of diff.slice(0, 40)) console.log("DIFF", JSON.stringify(d));
	for (const m of missing.slice(0, 10)) console.log("MISSING", m);
	process.exit(diff.length || missing.length ? 1 : 0);
}

const STRIP = process.argv.includes("--strip-stamps");
const CODE = path.resolve(arg("--code") ?? "."), DATA = path.resolve(arg("--data") ?? "."), OUT = arg("--out"), MATCH = arg("--match");
if (!OUT) throw new Error("--out <file> is required");

// Deterministic: uuids count up per file, and a Date with no argument is one fixed moment.
let n = 0;
Object.defineProperty(globalThis.crypto, "randomUUID", { value: () => `uuid-${++n}`, configurable: true, writable: true });
const FIXED = Date.parse("2026-01-01T00:00:00Z"), RealDate = Date;
globalThis.Date = class extends RealDate { constructor(...a){ a.length ? super(...a) : super(FIXED); } static now(){ return FIXED; } };
console.warn = () => {};

register(pathToFileURL(path.join(CODE, "Servex", "agents", "site-hooks.mjs")).href);
const load = rel => import(pathToFileURL(path.join(CODE, "public", "framework", rel)).href).then(m => m.default);
const Item = await load("core/Item/Item.js");
await load("core/List/List.js");
const Task = await load("core/Task/Task.js");
const Session = await load("core/Session/Session.js");
let Page = null;
try { Page = await load("core/Page/Page.class.js"); await import(pathToFileURL(path.join(CODE, "public", "framework", "core/Page/parts/kinds.js")).href); } catch (e){ console.error("Page did not load:", e.message); }

const FILE_CLASS = { "task.jsonl": "Task", "session.jsonl": "Session", "improvements.jsonl": "Task", "page.jsonl": "Page" };
const SKIP = new Set(["node_modules", ".git", "worktrees", "_retired"]);
function* walk(dir){
	let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of ents){
		if (SKIP.has(e.name)) continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) yield* walk(p);
		else if (FILE_CLASS[e.name]) yield p;
	}
}

const parse = text => text.split("\n").filter(l => l.trim()).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
const plain = v => !!v && typeof v === "object" && v.constructor === Object;

function class_of(file, first){
	const named = plain(first) && typeof first.class === "string" ? Item.types.get(first.class) : null;
	if (named) return named;
	if (plain(first?.session)) return Session;
	const by_name = FILE_CLASS[path.basename(file)];
	return by_name === "Page" ? Page : Item.types.get(by_name);
}

// What a replay produced: the saved shape, plus what is only in memory (states, times, progress).
function dump(root){
	const extra = [];
	const seen = new Set();
	const visit = item => {
		if (!item || seen.has(item)) return;
		seen.add(item);
		extra.push([item.id, item.constructor?.name, item._created_at ?? null, typeof item.get_one === "function" ? item.get_one("state") ?? null : null]);
		for (const list of Object.values(item.lists?.() ?? {})) for (const kid of list) visit(kid);
	};
	visit(root);
	// --strip-stamps: leave out the root's `by`/`ts` fields, which the old code kept as data (the new code strips them into
	// the clock), so a second comparison can show that nothing ELSE changed.
	if (STRIP && root.data){ root = Object.assign(Object.create(Object.getPrototypeOf(root)), root, { data: { ...root.data } }); delete root.data.by; delete root.data.ts; }
	let progress = null;
	try { progress = root.progress?.() ?? null; } catch (e){ progress = "throws: " + e.message; }
	const met = new WeakSet();   // a snapshot Item kept in data can point back up: a repeat is written as a mark, not a throw
	const json = JSON.stringify(root, (k, v) => { if (v && typeof v === "object"){ if (met.has(v)) return "[seen]"; met.add(v); } return v; });
	return { json, extra, progress, first_at: root.first_at ?? null, last_at: root.last_at ?? null, settings: root._settings ?? null };
}

const out = fs.openSync(OUT, "w");
let count = 0;
for (const file of walk(path.join(DATA, "public"))){
	const rel = path.relative(DATA, file).replace(/\\/g, "/");
	if (MATCH && !rel.includes(MATCH)) continue;
	let lines, text;
	try { text = fs.readFileSync(file, "utf8"); lines = parse(text); } catch { continue; }
	if (!lines.length) continue;
	const Class = class_of(file, lines[0]);
	if (!Class) continue;
	n = 0;
	Task.clock = null;
	let digest = "", err, ms = 0;
	try {
		const t0 = performance.now();
		const root = Class.replay(lines);
		ms = performance.now() - t0;
		digest = crypto.createHash("sha1").update(JSON.stringify(dump(root))).digest("hex");
	} catch (e){ err = String(e?.message ?? e).slice(0, 200); }
	fs.writeSync(out, JSON.stringify({ file: rel, text: crypto.createHash("sha1").update(text).digest("hex").slice(0, 12), cls: Class.name, lines: lines.length, ms: Math.round(ms * 10) / 10, digest, ...(err ? { err } : {}) }) + "\n");
	count++;
}
fs.closeSync(out);
console.log(`${count} files replayed with ${CODE}`);
