#!/usr/bin/env node
// Server/session-migrate.mjs — one folder per session: ai/sessions/YYYY/MM/DD/<slug>/  (owner decision 2026-10-08, doc/data-architecture-2026-10-08.md section 12)
//
//   node Server/session-migrate.mjs [--repo <checkout>]            DRY RUN: counts only, nothing is touched (the default)
//   node Server/session-migrate.mjs --apply [--repo <checkout>]    move everything, write the manifest
//   node Server/session-migrate.mjs --undo  [--repo <checkout>]    move everything back using the manifest
//
// What moves, per session (joined by the Claude session id):
//   ai/sessions/YYYY/MM/DD/<uuid>/            -> ai/sessions/YYYY/MM/DD/<slug>/            (cache.jsonl, session.jsonl, index.json, trace.json: the whole folder)
//   ai/YYYY/MM/DD/session-<id8>/ (the card)   -> ai/sessions/YYYY/MM/DD/<slug>/            (its files, so page.jsonl lands at <slug>/page.jsonl; a name that clashes goes under card/)
//   ai/YYYY-MM-DD/<task>/ (the task)          -> ai/sessions/YYYY/MM/DD/<slug>/task/       ONLY with --tasks (whole folder; joined by session_id in task.jsonl). Off by default: see MOVE_TASKS.
// The slug is descriptive and unique within its day: the task's folder name, else the session's title (Sessions list), else the first
// words of its first prompt, else session-<id8>. A collision on a day gets the id8 appended. The UUID stays inside index.json.
// Nothing is deleted. Tracked files move with `git mv`, untracked and ignored ones (cache.jsonl) with a plain rename.
// The manifest `ai/sessions/migration-manifest.json` lists every old path -> new path, so old links resolve and --undo can reverse it.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2), flag = n => argv.includes(n), val = n => flag(n) ? argv[argv.indexOf(n) + 1] : undefined;   // undefined, never argv[0], when the flag is absent
const REPO = path.resolve(val("--repo") ?? path.join(here, ".."));
const AI = path.join(REPO, "public", "framework", "ai"), SESS = path.join(AI, "sessions"), MANIFEST = path.join(SESS, "migration-manifest.json");
// Task folders stay where they are unless --tasks: a task is a page tree, and a page exists only while its parent declares it, so a moved task has no route yet (sessions/doc/data/layout.md).
const MOVE_TASKS = flag("--tasks");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// The first real prompt of a session, from its raw transcript (~/.claude/projects/<cwd>/<id>.jsonl); the first 256 KB are enough.
const PROJECTS = path.join(os.homedir(), ".claude", "projects");
const transcripts = new Map();
function find_transcripts(){
	for (const d of dirs(PROJECTS)) try { for (const f of fs.readdirSync(path.join(PROJECTS, d))) if (f.endsWith(".jsonl")) transcripts.set(f.slice(0, -6), path.join(PROJECTS, d, f)); } catch {}
}
function first_prompt(id){
	const file = transcripts.get(id); if (!file) return "";
	let buf; try { const fd = fs.openSync(file, "r"); buf = Buffer.alloc(262144); const n = fs.readSync(fd, buf, 0, buf.length, 0); fs.closeSync(fd); buf = buf.subarray(0, n); } catch { return ""; }
	for (const l of buf.toString("utf8").split("\n")){
		if (!l.includes('"type":"user"')) continue;
		try {
			const o = JSON.parse(l); if (o.type !== "user" || o.isMeta || o.isSidechain) continue;
			const c = o.message?.content, t = typeof c === "string" ? c : Array.isArray(c) ? c.find(b => b?.type === "text")?.text : "";
			if (t && !t.trimStart().startsWith("<")) return t;
		} catch {}
	}
	return "";
}
const dirs = p => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } };
const rel = p => path.relative(REPO, p).split(path.sep).join("/");

export function slugify(s, words = 8){
	const w = String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean).slice(0, words).join("-");
	return w.slice(0, 48).replace(/-+$/, "");
}

/** Read every source and decide every move. Pure reading: no file is changed. */
export function plan(){
	const sessions = new Map();   // id -> { id, dir, day, title, prompt, card, tasks: [] }
	const put = (id, dir, day) => sessions.set(id, { id, dir, day, title: "", prompt: "", cards: [], tasks: [] });
	for (const n of dirs(SESS)){
		if (UUID.test(n)) put(n, path.join(SESS, n), null);
		else if (/^\d{4}$/.test(n)) for (const m of dirs(path.join(SESS, n))) for (const d of dirs(path.join(SESS, n, m))) for (const s of dirs(path.join(SESS, n, m, d))) if (UUID.test(s)) put(s, path.join(SESS, n, m, d, s), `${n}-${m}-${d}`);
	}
	// the day of a session still in the flat shape: its first_at in cache.jsonl (UTC), else today's folder is unknown
	for (const s of sessions.values()) if (!s.day){
		try { const l = fs.readFileSync(path.join(s.dir, "cache.jsonl"), "utf8").split("\n").find(x => x.startsWith('{"summary"')); s.day = JSON.parse(l).summary.first_at.slice(0, 10); } catch { s.day = "unknown"; }
	}
	try { for (const r of JSON.parse(fs.readFileSync(path.join(SESS, "sessions.json"), "utf8")).rows ?? []){ const s = sessions.get(r.session_id ?? r.id); if (s){ s.title = r.tab_title ?? ""; s.prompt = r.last_prompt_first_line ?? ""; } } } catch {}
	find_transcripts();
	for (const s of sessions.values()) s.first = first_prompt(s.id);
	const by8 = new Map([...sessions.keys()].map(id => [id.slice(0, 8), id]));

	const cards = [], card_orphans = [];
	for (const y of dirs(AI).filter(n => /^\d{4}$/.test(n))) for (const m of dirs(path.join(AI, y))) for (const d of dirs(path.join(AI, y, m))) for (const c of dirs(path.join(AI, y, m, d))){
		const dir = path.join(AI, y, m, d, c), id = c.startsWith("session-") ? by8.get(c.slice(8, 16)) : null;
		if (id){ sessions.get(id).cards.push(dir); cards.push(dir); } else card_orphans.push(dir);
	}
	const tasks = [], task_orphans = [], multi_session = [];
	for (const d of dirs(AI).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n))) for (const t of dirs(path.join(AI, d))){
		const dir = path.join(AI, d, t); let log = ""; try { log = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8"); } catch {}
		const ids = [...new Set([...log.matchAll(/"session_id":"([0-9a-f-]{36})"/g)].map(x => x[1]))].filter(id => sessions.has(id));
		if (!ids.length){ task_orphans.push(dir); continue; }
		if (ids.length > 1) multi_session.push(dir);
		sessions.get(ids[0]).tasks.push(dir); tasks.push(dir);   // the task moves with the session that launched it (first in its log); the others reach it through the manifest
	}

	// slugs: unique within a day
	const taken = new Map(), moves = [], collisions = [];
	const fallback = s => "session-" + s.id.slice(0, 8);
	for (const s of [...sessions.values()].sort((a, b) => a.id.localeCompare(b.id))){
		const task_name = s.tasks.length ? path.basename(s.tasks[0]) : "";
		const pick = [["task", slugify(task_name, 12)], ["title", s.title && !/^(monorepo|lew42|untitled)$/i.test(s.title) ? slugify(s.title) : ""], ["prompt", slugify(s.first || s.prompt, 6)]].find(([, v]) => v) ?? ["id", fallback(s)];
		let slug = pick[1], day = taken.get(s.day) ?? taken.set(s.day, new Set()).get(s.day);
		if (day.has(slug)){ collisions.push(`${s.day}/${slug}`); const base = slug; slug = `${base}-${s.id.slice(0, 8)}`; if (day.has(slug)) slug = `${base}-${s.id}`; }   // two sessions sharing an id8 (test fixtures) fall back to the full id, which is unique
		day.add(slug); s.slug = slug; s.slug_from = pick[0];
		if (s.day === "unknown") continue;   // no first_at to date it: it stays where it is
		const [Y, M, D] = s.day.split("-"), to = path.join(SESS, Y, M, D, slug);
		moves.push({ id: s.id, from: s.dir, to, kind: "session" });
		// the card's files go straight into the session folder (page.jsonl -> <slug>/page.jsonl); a name already there goes under card/ instead
		const used = new Set(["cache.jsonl", "session.jsonl", "index.json", "trace.json", "task", "card"]);
		s.cards.forEach(c => { for (const e of fs.readdirSync(c)){ const clash = used.has(e); used.add(e); moves.push({ id: s.id, from: path.join(c, e), to: path.join(to, clash ? "card" : "", e), kind: "card", card_dir: c }); } });
		if (MOVE_TASKS) s.tasks.forEach((t, i) => moves.push({ id: s.id, from: t, to: path.join(to, i ? `task-${i + 1}` : "task"), kind: "task" }));
	}
	return { sessions, moves, cards, card_orphans, tasks, task_orphans, multi_session, collisions };
}

function report(p){
	const n = p.sessions.size, from = k => [...p.sessions.values()].filter(s => s.slug_from === k).length;
	const lines = [
		`session folders (uuid): ${n}`,
		`card folders: ${p.cards.length} join a session by id8, ${p.card_orphans.length} are not session cards and stay where they are`,
		`task folders: ${p.tasks.length} join a session by session_id, ${p.task_orphans.length} orphans stay (no session in the store)`,
		`  of the joined tasks, ${p.multi_session.length} name more than one session (they move with the first)`,
		`sessions with more than one card: ${[...p.sessions.values()].filter(s => s.cards.length > 1).length}; more than one task: ${[...p.sessions.values()].filter(s => s.tasks.length > 1).length}`,
		`slugs from: task name ${from("task")}, title ${from("title")}, first prompt ${from("prompt")}, session-<id8> ${from("id")}`,
		`slug collisions on a day (get the id8 appended): ${p.collisions.length}`,
		`moves planned: ${p.moves.length} (${p.moves.filter(m => m.kind === "session").length} session, ${p.moves.filter(m => m.kind === "card").length} card, ${p.moves.filter(m => m.kind === "task").length} task)`,
	];
	return lines.join("\n");
}

const tracked = new Set();
function load_tracked(){
	try { for (const f of execFileSync("git", ["-C", REPO, "ls-files", "-z", "public/framework/ai"], { maxBuffer: 1 << 28, windowsHide: true }).toString().split("\0")) if (f) for (let p = f; p && !tracked.has(p); p = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "") tracked.add(p); } catch {}
}
const is_tracked = p => tracked.has(rel(p));   // `tracked` holds every tracked file AND every folder above one

/** Move one folder. Its tracked files go through `git mv` so history follows; everything else (cache.jsonl is gitignored) moves with the rename. */
function move(from, to){
	fs.mkdirSync(path.dirname(to), { recursive: true });
	if (fs.existsSync(to)) throw new Error("target exists: " + rel(to));
	if (is_tracked(from)){ execFileSync("git", ["-C", REPO, "mv", rel(from), rel(to)], { windowsHide: true, stdio: "pipe" }); }
	else fs.renameSync(from, to);
	// git mv moves tracked files only; carry any untracked or ignored leftovers across, then drop the empty shell (nothing with content is deleted)
	if (fs.existsSync(from)) merge_into(from, to);
}
function merge_into(from, to){
	for (const e of fs.readdirSync(from, { withFileTypes: true })){
		const a = path.join(from, e.name), b = path.join(to, e.name);
		if (e.isDirectory()){ fs.mkdirSync(b, { recursive: true }); merge_into(a, b); } else fs.renameSync(a, b);
	}
	try { fs.rmdirSync(from); } catch {}
}

function apply(p){
	load_tracked();
	const done = [];
	// the manifest is written FIRST and then updated as the moves land, so an interrupted run can still be undone
	const write = () => fs.writeFileSync(MANIFEST, JSON.stringify({ at: new Date().toISOString(), repo: rel(REPO) || ".", moves: done }, null, 1));
	let n = 0;
	try {
		for (const m of p.moves){
			move(m.from, m.to);
			done.push({ id: m.id, kind: m.kind, from: rel(m.from), to: rel(m.to) });
			if (++n % 500 === 0) write();
		}
	} finally { write(); }   // an interrupted run still leaves a manifest that covers every move that landed
	// each session's index.json gets its folder name; its UUID is already inside it
	for (const m of p.moves.filter(m => m.kind === "session")){
		const f = path.join(m.to, "index.json");
		try { const snap = JSON.parse(fs.readFileSync(f, "utf8")); snap.folder = path.basename(m.to); fs.writeFileSync(f, JSON.stringify(snap)); } catch {}
	}
	for (const c of new Set(p.moves.filter(m => m.card_dir).map(m => m.card_dir))) try { fs.rmdirSync(c); } catch {}   // the emptied card folder (rmdir refuses a folder with anything left in it)
	write();
	return done.length;
}

function undo(){
	const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
	load_tracked(); let n = 0;
	for (const m of [...man.moves].reverse()){
		const from = path.join(REPO, m.to), to = path.join(REPO, m.from);
		if (!fs.existsSync(from)) continue;
		move(from, to); n++;
	}
	fs.renameSync(MANIFEST, MANIFEST.replace(".json", `-undone-${Date.now()}.json`));
	return n;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	if (flag("--undo")) console.log(`moved back ${undo()} folders`);
	else {
		const p = plan();
		console.log(report(p));
		if (flag("--apply")) console.log(`moved ${apply(p)} folders; manifest: ${rel(MANIFEST)}`);
		else {
			const out = val("--out");
			if (out) fs.writeFileSync(out, JSON.stringify(p.moves.slice(0, 2000).map(m => ({ ...m, from: rel(m.from), to: rel(m.to) })), null, 1));
			console.log("(dry run: nothing was changed)");
		}
	}
}
