#!/usr/bin/env node
// Server/TaskDirs.mjs — WHERE A TASK FOLDER LIVES. The one class every writer and reader asks; nobody types ai/<date>/ by hand.
// Decision: public/framework/ai/doc/task-folders.md (2026-10-12). A task lives in the sessions store, inside the session that ran it:
//   ai/sessions/YYYY/MM/DD/<session folder>/<slug>/   (no known session: ai/sessions/YYYY/MM/DD/<slug>/; a child task: <parent>/<slug>/)
// The day is the owner's LOCAL day (TaskDirs.day, one rule in core/Session/Day.js), like State.day; folders filed by UTC before 2026-10-18 were moved by Server/SessionDayMove.mjs. The day's log is ai/sessions/YYYY/MM/DD/day.jsonl.
//
//   node Server/TaskDirs.mjs --new <slug> [--session <uuid>] [--parent <dir>]   make the folder, print its repo-relative path
//   node Server/TaskDirs.mjs --day                print today's day folder (where day.jsonl goes)
//   node Server/TaskDirs.mjs --find <slug>        print the newest task folder with that slug
//   node Server/TaskDirs.mjs --list [days]        print every task folder of the last N days (default 7)
//   node Server/TaskDirs.mjs --follow <old dir>   print where an old ai/YYYY-MM-DD/<slug>/ path lives now (moved, or the slug found in that day)
//   node Server/TaskDirs.mjs --census             day folders still on disk + code that hand-joins one (exit 1 if any); TaskDirs.refuse() is the guard
// Old paths keep working: every move is a line in ai/sessions/task-moves.jsonl (Server/TaskMove.mjs) or the 2026-10-10
// ai/sessions/task-manifest.json; follow(), alias() and redirect() chain through both. The 2026-10-10 mover (plan/apply/verify/undo) is below.
import fs from "node:fs";
import SessionRecord from "./SessionRecord.mjs";
import Day from "../public/framework/core/Session/Day.js";
import DatedFiles from "./DatedFiles.mjs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(process.env.LEDGER_ROOT || path.resolve(here, "..")), AI = path.join(REPO, "public", "framework", "ai"), SESS = path.join(AI, "sessions");
if (process.env.LEDGER_ROOT) DatedFiles.ROOT = REPO;   // one root for this alias and the Dated collection it fronts
const SESSIONS = DatedFiles.sessions;   // the sessions collection: every date rule below is its
const MANIFEST = path.join(SESS, "task-manifest.json"), MOVES = path.join(SESS, "task-moves.jsonl"), DAY_MOVES = path.join(SESS, "session-day-moves.jsonl"), STUB = "moved.json", QUIET_MIN = 240;
const slash = p => p.split(path.sep).join("/"), rel = p => slash(path.relative(REPO, p));
const ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };

export default class TaskDirs {
	static REPO = REPO;
	static AI = AI;
	static SESS = SESS;
	static MANIFEST = MANIFEST;
	static MOVES = MOVES;
	static STUB = STUB;
	static #cache = { key: "", map: new Map() };

	/** THE day rule: the local "YYYY-MM-DD" of a time (Date, ms or ISO string; now by default). State.day is this same function. */
	static day(date = new Date()){ return Day.of(date); }
	/** "YYYY/MM/DD" of a time, or of a "YYYY-MM-DD" string as given. */
	static ymd(day = new Date()){ return Day.path(day); }
	/** The day's folder in the store, where day.jsonl lives. Absolute. */
	static day_dir(day){ return SESSIONS.day_dir(day); }

	/** A session's folder without the async full scan: `session-<id8>` or the uuid, on the given day or up to 3 days before;
	 *  else the folder Session.locate() would make (`session-<id8>` under the day). Absolute. */
	static session_dir(id, day = new Date()){ return SESSIONS.session_dir(id, day); }

	/** WHERE A NEW TASK GOES. {slug, session_id?, parent?, day?} -> absolute dir (not created). */
	static dir({ slug, session_id, parent, day } = {}){
		try { return SESSIONS.home({ slug, session_id, day, parent: parent && this.follow(path.resolve(REPO, parent)) }); }
		catch (e){ throw new Error("TaskDirs.dir: " + e.message); }
	}

	/** Make it. Returns the absolute dir. Refuses a folder that already holds a task (never two tasks in one log). */
	static make(spec){ const dir = SESSIONS.make(this.dir(spec)); try { SessionRecord.link_parent(dir, "TaskDirs", { parent: spec.parent && path.resolve(REPO, spec.parent), session_id: spec.session_id }); } catch {} return dir; }   // a folder under a session or task counts as its task (SessionRecord.link_parent)

	/** An old-shaped dir (ai/YYYY-MM-DD/<slug>[/rest]) that does not exist and never moved -> its new home, for writers
	 *  (Servex open_task) handed an old-style path by a brief. Anything else comes back resolved but unchanged. */
	static normalize(dir, session_id){
		const abs = path.resolve(REPO, dir), f = this.follow(abs);
		if (f !== abs || fs.existsSync(abs)) return f;
		const m = /^public\/framework\/ai\/(\d{4}-\d{2}-\d{2})\/([^/]+)((?:\/[^/]+)*)$/.exec(rel(abs));
		if (!m) return abs;
		if (m[3] && fs.existsSync(path.join(AI, m[1], m[2]))) return abs;   // a child under a live old-shaped parent stays beside it
		return path.join(this.dir({ slug: m[2], session_id }), ...m[3].split("/").filter(Boolean));
	}

	/** Every task folder (holds task.jsonl) of the last `days` days, both shapes: [{dir, day:"YYYY-MM-DD", slug, key}]. Newest day first. */
	static list(days = 7, now = new Date()){
		const out = [], cut = this.day(new Date(now.getTime() - days * 864e5));
		const push = (dir, day) => { if (fs.existsSync((SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl")))) out.push({ dir, day, slug: path.basename(dir), key: slash(path.relative(AI, dir)) }); };
		for (const { day, dir: dd } of SESSIONS.day_folders()){
			if (day < cut) continue;
			for (const a of ls(dd)){ push(path.join(dd, a), day); for (const b of ls(path.join(dd, a))) push(path.join(dd, a, b), day); }
		}
		for (const day of ls(AI).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n) && n >= cut)) for (const s of ls(path.join(AI, day))) push(path.join(AI, day, s), day);
		return out.sort((a, b) => b.day.localeCompare(a.day));
	}

	/** The newest task folder named `slug` (either shape), or null. */
	static find(slug, days = 60){ return this.list(days).find(t => t.slug === slug)?.dir ?? null; }

	/** old repo-relative path -> {to}, from both manifests, chains resolved (old -> 10-10 task/ -> <slug>/). Cached by mtimes. */
	static map(){
		const mt = f => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } }, key = mt(MANIFEST) + ":" + mt(MOVES) + ":" + mt(DAY_MOVES);
		if (key !== this.#cache.key){
			const map = new Map();
			try { for (const e of JSON.parse(fs.readFileSync(MANIFEST, "utf8")).moves) map.set(e.from, e); } catch {}
			try { for (const l of fs.readFileSync(MOVES, "utf8").split("\n")) if (l.trim()) try { const e = JSON.parse(l); if (e.from && e.to && !e.undone && !(e.kind === "stub" && map.get(e.from)?.kind === "redirect")) map.set(e.from, e); } catch {} } catch {}   // a stub's archive copy never beats the redirect to the real folder
			try {   // Server/SessionDayMove.mjs: planned {old,new}, in force once a `done` line follows and no `undone` does
				const rows = fs.readFileSync(DAY_MOVES, "utf8").split(String.fromCharCode(10)).filter(l => l.startsWith("{")).map(l => { try { return JSON.parse(l); } catch { return {}; } });
				const on = new Set(); for (const r of rows){ if (r.done) on.add(r.done); if (r.undone) on.delete(r.undone); }
				for (const r of rows) if (r.old && r.new && on.has(r.old)) map.set(r.old, { kind: "rename", from: r.old, to: r.new });
			} catch {}
			for (const [from, e] of map){ let to = e.to, n = 0; while (map.has(to) && n++ < 9) to = map.get(to).to; if (to !== e.to) map.set(from, { ...e, to }); }
			this.#cache = { key, map };
		}
		return this.#cache.map;
	}

	/** Any absolute path (dir or file) under a moved folder -> where it is now (itself when nothing above it moved). */
	static follow(p){
		const map = this.map(); if (!map.size) return p;
		const r = rel(path.resolve(p)).split("/");
		for (let i = r.length; i > 0; i--){ const e = map.get(r.slice(0, i).join("/")); if (e) return path.join(REPO, e.to, ...r.slice(i)); }
		return p;
	}

	/** The task folder named `slug` on `day` ("YYYY-MM-DD") anywhere in that day of the store (inside a session, a parent
	 *  task, up to 4 levels), newest first; null if none. What an old /framework/ai/<day>/<slug>/ guess meant. */
	static locate(day, slug, store = SESS){
		const hits = [], walk = (d, n) => { for (const e of ls(d)){ const f = path.join(d, e); if (e === slug && fs.existsSync((SessionRecord.log_file(f) ?? path.join(f, "task.jsonl")))) hits.push(f); if (n < 4) walk(f, n + 1); } };
		walk(path.join(store, ...this.ymd(day).split("/")), 1);
		return hits.sort((a, b) => fs.statSync((SessionRecord.log_file(b) ?? path.join(b, "task.jsonl"))).mtimeMs - fs.statSync((SessionRecord.log_file(a) ?? path.join(a, "task.jsonl"))).mtimeMs)[0] ?? null;
	}

	/** An old-shaped path (dir or file) -> where it is: a moved folder, else the same slug found in that day of the store; else itself. */
	static resolve(p){
		const abs = path.resolve(REPO, p), f = this.follow(abs);
		if (f !== abs || fs.existsSync(abs)) return f;
		const m = /^public\/framework\/ai\/(\d{4}-\d{2}-\d{2})\/([^/]+)((?:\/[^/]+)*)$/.exec(rel(abs));
		const hit = m && this.locate(m[1], m[2]);
		return hit ? path.join(hit, ...m[3].split("/").filter(Boolean)) : abs;
	}

	/** THE GUARD (2026-10-13, one-store/doc/why-the-day-folder-came-back.md): nothing new is made under the retired
	 *  public/framework/ai/YYYY-MM-DD/. An old path that moved or can be found is followed; anything else throws, naming the right place. */
	static refuse(p){
		const abs = path.resolve(REPO, p), m = /^public\/framework\/ai\/(\d{4}-\d{2}-\d{2})(?:\/|$)/.exec(rel(abs));
		if (!m) return abs;
		const now = this.resolve(abs);
		if (now !== abs) return now;
		const day = rel(this.day_dir(m[1]));
		throw Object.assign(new Error(`refused: ${rel(abs)} is under the retired day folder public/framework/ai/${m[1]}/. `
			+ `A task folder goes in the store: \`node Server/TaskDirs.mjs --new <slug>\` (it lands in ${day}/<session>/<slug>/); `
			+ `a script's run folder is TaskDirs.dir({slug}) (${day}/<slug>/); the day log is ${day}/day.jsonl. Why: public/framework/ai/doc/task-folders.md`), { code: "RETIRED_DAY_FOLDER" });
	}

	/** Every day folder still on disk, and every code line that joins public/framework/ai with a date by hand (a writer)
	 *  or builds a /framework/ai/<date>/ url (a reader, which the router redirects). `node Server/TaskDirs.mjs --census`. */
	static census(){
		const days = ls(AI).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n)).map(n => ({ dir: rel(path.join(AI, n)), files: this.files(path.join(AI, n)).length }));
		const writers = [], readers = [], skip = /node_modules|[\\/]public[\\/]framework[\\/]ai[\\/](sessions|\d{4}|\d{4}-\d{2}-\d{2}|archive)([\\/]|$)|\.test\.|TaskDirs\.mjs|TaskMove\.mjs/;
		const WRITE = /["'`]public\/framework\/ai\/?["'`]\s*,\s*(?!["'`]sessions)[^)\n]*(date|day|now\(\)|stamp|slice\(0, ?10\))|path\.join\(AI, *(date|day)\b/i;
		const READ = /\/framework\/ai\/\$\{[^}]*(date|day)[^}]*\}\//i;
		const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){
			const f = path.join(d, e.name); if (skip.test(f)) continue;
			if (e.isDirectory()) walk(f);
			else if (/\.(m?js)$/.test(e.name)) fs.readFileSync(f, "utf8").split("\n").forEach((l, i) => {
				if (WRITE.test(l)) writers.push(`${rel(f)}:${i + 1}`); else if (READ.test(l)) readers.push(`${rel(f)}:${i + 1}`); });
		} };
		for (const d of ["Server", "Servex", ".claude/hooks", "public/framework"]) walk(path.join(REPO, d));
		return { days, writers, readers };
	}

	/** A site URL under an old task dir (/framework/ai/<date>/<task>/<rest>) -> the absolute file it now is, or null. */
	static alias(url){
		const m = /^\/framework\/ai\/(\d{4}-\d{2}-\d{2}\/.+)$/.exec(url);
		if (!m) return null;
		const old = path.join(AI, ...decodeURIComponent(m[1]).split("/"));
		if (!old.startsWith(AI)) return null;
		const now = this.resolve(old);
		return now === old ? null : now;
	}

	/** The new URL for an old one (/framework/ai/2026-10-12/<slug>/... or the bare day), or null. Old URLs redirect through this. */
	static redirect(url){
		const day = /^\/framework\/ai\/(\d{4})-(\d{2})-(\d{2})\/?$/.exec(url);
		if (day) return `/framework/ai/sessions/${day[1]}/${day[2]}/${day[3]}/`;
		const m = /^\/framework\/ai\/(\d{4}-\d{2}-\d{2}\/[^/]+)(\/.*)?$/.exec(url);
		if (!m) return null;
		const old = path.join(AI, ...m[1].split("/")), now = this.resolve(old);
		return now === old ? null : "/" + slash(path.relative(path.join(REPO, "public"), now)) + (m[2] ?? "/");
	}

	// ---- reading the tree ----
	static files(dir, base = dir, out = []){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			const f = path.join(dir, e.name);
			if (e.isDirectory()) this.files(f, base, out);
			else out.push({ p: slash(path.relative(base, f)), size: fs.statSync(f).size, sha1: crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex") });
		}
		return out;
	}
	static newest(dir){ let t = 0; for (const e of fs.readdirSync(dir, { withFileTypes: true })){ const f = path.join(dir, e.name); t = Math.max(t, e.isDirectory() ? this.newest(f) : fs.statSync(f).mtimeMs); } return t; }

	/** Decide every move. Pure reading. Uses session-migrate's join (task.jsonl session_id -> session folder in the store). */
	static async plan(){
		const { plan } = await import("./session-migrate.mjs");
		const p = plan(), moves = [], stay = [], now = Date.now();
		for (const s of p.sessions.values()){
			let n = 0;
			for (const t of s.tasks){
				const log = fs.readFileSync(path.join(t, "task.jsonl"), "utf8");
				const why = !/"landed_at"/.test(log) ? "not landed" : (now - this.newest(t)) / 6e4 < QUIET_MIN ? "written in the last " + QUIET_MIN + " min" : s.day === "unknown" || !/sessions[\\/]\d{4}[\\/]\d\d[\\/]\d\d[\\/]/.test(s.dir) ? "session not in the dated store" : "";
				if (why){ stay.push({ dir: rel(t), why }); continue; }
				moves.push({ id: s.id, from: rel(t), to: rel(path.join(s.dir, n++ ? `task-${n}` : "task")) });
			}
		}
		return { moves, stay, orphans: p.task_orphans.length, multi: p.multi_session.length };
	}

	// ---- acting ----
	static async apply(){
		const { moves, stay } = await this.plan();
		const done = [], at = new Date().toISOString();
		const write = () => fs.writeFileSync(MANIFEST, JSON.stringify({ at, moves: done }, null, 1));
		for (const m of moves){
			const from = path.join(REPO, m.from), to = path.join(REPO, m.to);
			if (fs.existsSync(to)) throw new Error("target exists: " + m.to);
			const files = this.files(from);   // the snapshot: taken before the folder moves
			done.push({ ...m, files });
			write();                          // recorded first, so an interrupted run can still be undone
			fs.mkdirSync(path.dirname(to), { recursive: true });
			fs.renameSync(from, to);
			fs.mkdirSync(from, { recursive: true });
			fs.writeFileSync(path.join(from, STUB), JSON.stringify({ moved_to: m.to, session: m.id, at }) + "\n");
		}
		write();
		return { moved: done.length, stay: stay.length };
	}

	/** Every snapshot file must exist at the new path with the same size and sha1; the stub must point at the folder. */
	static verify(){
		const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8")), bad = [];
		let files = 0, bytes = 0;
		for (const m of man.moves){
			const to = path.join(REPO, m.to);
			for (const f of m.files){
				files++; bytes += f.size;
				const file = path.join(to, f.p);
				if (!fs.existsSync(file)) bad.push({ missing: m.to + "/" + f.p });
				else if (crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex") !== f.sha1) bad.push({ changed: m.to + "/" + f.p });
			}
			try { if (JSON.parse(fs.readFileSync(path.join(REPO, m.from, STUB), "utf8")).moved_to !== m.to) bad.push({ stub: m.from }); } catch { bad.push({ stub: m.from }); }
		}
		return { folders: man.moves.length, files, bytes, bad };
	}

	static undo(){
		const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8")); let n = 0;
		for (const m of [...man.moves].reverse()){
			const from = path.join(REPO, m.from), to = path.join(REPO, m.to);
			if (!fs.existsSync(to)) continue;
			// the stub folder may hold only the stub and the dev server's regenerated files.jsonl listing (the real one moved with the task)
			for (const e of fs.readdirSync(from)) if (e === STUB || e === "files.jsonl") fs.unlinkSync(path.join(from, e));
			try { fs.rmdirSync(from); } catch { throw new Error("old folder holds more than a stub: " + m.from); }
			fs.renameSync(to, from); n++;
		}
		fs.renameSync(MANIFEST, MANIFEST.replace(".json", `-undone-${Date.now()}.json`));
		return n;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const flag = n => process.argv.includes(n), arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
	if (flag("--new")) console.log(rel(TaskDirs.make({ slug: arg("--new"), session_id: arg("--session") ?? process.env.CLAUDE_CODE_SESSION_ID, parent: arg("--parent") })));
	else if (flag("--day")){ const d = TaskDirs.day_dir(); fs.mkdirSync(d, { recursive: true }); console.log(rel(d)); }
	else if (flag("--find")){ const d = TaskDirs.find(arg("--find")); if (!d) process.exit(1); console.log(rel(d)); }
	else if (flag("--list")) for (const t of TaskDirs.list(Number(arg("--list")) || 7)) console.log(t.day, rel(t.dir));
	else if (flag("--follow")) console.log(rel(TaskDirs.resolve(arg("--follow"))));
	else if (flag("--census")){ const c = TaskDirs.census(); console.log(JSON.stringify(c, null, 1)); console.error(`${c.days.length} day folders, ${c.writers.length} writers, ${c.readers.length} readers (redirected)`); process.exit(c.days.length || c.writers.length ? 1 : 0); }
	else if (flag("--undo")) console.log(`moved back ${TaskDirs.undo()} folders`);
	else if (flag("--verify")){ const r = TaskDirs.verify(); console.log(`${r.folders} folders, ${r.files} files, ${r.bytes} bytes checked: ${r.bad.length} missing/changed`); if (r.bad.length){ console.log(r.bad.slice(0, 20)); process.exit(1); } }
	else if (flag("--apply")) console.log(await TaskDirs.apply());
	else if (flag("--plan")){ const p = await TaskDirs.plan(); console.log(`move: ${p.moves.length}; stay: ${p.stay.length}; no session: ${p.orphans}`); }
	else console.log("usage: --new <slug> [--session id] [--parent dir] | --day | --find <slug> | --list [days] | --follow <dir> | --census | 2026-10-10 mover: --plan --apply --verify --undo");
}
