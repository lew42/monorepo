// DatedFiles: the node half of core/Item/Dated.js. Makes, moves, queries and checks a collection filed by day (today: "projects").
//   create({module, slug, title})  mkdir <module>/projects/YYYY/MM/DD/<slug>/, line 1 of project.jsonl, and the index row, one call
//   move({from, module, apply})    git mv a project folder into a module; rows on BOTH days, a pointer in its session, one manifest line (body of the old ProjectMove)
//   undo({run})                    put a move back
//   query({from, to, where, sort}) the index rows of a day range, run through ext/Query
//   check()                        rebuild from the folders, diff with the index: {ok, missing, stale}
//   sessions: snapshots({from,to}) every session's current snapshot; find(args) the CLI filter; query(spec) the same through ext/Query; in_flight() who is running now
// Index = the day stream ai/sessions/YYYY/MM/DD/index.jsonl (AIIndexStream). Doors: static tools() (SDK/MCP) and static setup(socket) (dev socket) call these same methods.
// Doc: Server/doc/dated-files.md · plan: public/framework/core/Item/doc/store-index-query-plan.md
import fs from "node:fs";
import path from "node:path";
import LineKey from "../public/framework/core/Item/LineKey.js";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import AIIndexStream from "./AIIndexStream.mjs";
import SessionRecord from "./SessionRecord.mjs";
import Day from "../public/framework/core/Session/Day.js";
import Dated from "../public/framework/core/Item/Dated.js";
import Query from "../public/framework/ext/Query/Query.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const slash = p => p.split(path.sep).join("/");

export default class DatedFiles extends Dated {
	static ROOT = path.resolve(HERE, "..");                      // a test points this at a scratch repo
	static MANIFEST = "public/framework/ai/sessions/project-moves.jsonl";

	static abs(rel){ return path.join(this.ROOT, rel); }
	static rel(abs){ return slash(path.relative(this.ROOT, abs)); }
	static url(rel){ return "/" + rel.replace(/^public\//, "").replace(/\/?$/, "/"); }
	static lines(file){
		try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(l => l.startsWith("{")).map(l => { try { return LineKey.deep(JSON.parse(l)); } catch { return null; } }).filter(Boolean); }   // D13: marks off
		catch { return []; }
	}
	static append(file, obj){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, JSON.stringify(obj) + "\n"); }
	static git(...args){ return execFileSync("git", args, { cwd: this.ROOT, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim(); }
	static tracked(rel){ try { return !!this.git("ls-files", "--", rel); } catch { return false; } }
	get store(){ return DatedFiles.abs(this.index); }

	/** The project's own facts, replayed through core/Task/Project.js: title, state, completion (0..1). */
	async read(dir){
		const lines = DatedFiles.lines(path.join(dir, this.file));
		if (!lines.length) throw new Error(`no ${this.file} in ${DatedFiles.rel(dir)}`);
		const { default: Project } = await import(pathToFileURL(path.join(HERE, "../public/framework/core/Task/Project.js")).href);
		const p = Project.from_lines(lines);
		const at = lines.map(l => Object.values(l).find(v => v && typeof v === "object")?.at ?? l.at).find(Boolean);
		return { title: p.get_one("title") ?? lines[0].title ?? path.basename(dir), state: p.state, completion: p.completion, at };
	}

	/** Which day the item started: the YYYY/MM/DD in its session path, else the first line's time, else today. */
	start_day(rel, at){
		const m = rel.match(/sessions\/(\d{4})\/(\d{2})\/(\d{2})\//);
		return m ? `${m[1]}-${m[2]}-${m[3]}` : (Day.of(at) || Day.of());
	}

	/** The session folder that owns an item: the nearest ancestor holding a session.jsonl (or an old task.jsonl). */
	session_of(dir){
		const R = DatedFiles.ROOT;
		for (let d = path.dirname(dir); d.startsWith(R) && d !== R; d = path.dirname(d)) if (SessionRecord.file(d)) return d;
		return null;
	}

	row(slug, rel, facts){ return { id: slug, path: rel, url: DatedFiles.url(rel), title: facts.title, state: facts.state, completion: facts.completion }; }

	/** Makes a new project in a module: the folder, line 1, and the index row on its day. */
	create({ module, slug, title, day = Day.of(), at = new Date().toISOString() }){
		if (!/^[a-z0-9][a-z0-9-]*$/.test(slug ?? "")) throw new Error(`create: slug "${slug}" must be lowercase words and dashes`);
		const home = `public/framework/${String(module ?? "").replace(/^\/|\/$/g, "")}`;
		if (!module || !fs.existsSync(DatedFiles.abs(home))) throw new Error(`module ${module} does not exist (${home})`);
		const dir = this.path(day, slug, module);
		if (fs.existsSync(DatedFiles.abs(dir))) throw new Error(`${dir} already exists`);
		DatedFiles.append(path.join(DatedFiles.abs(dir), this.file), { id: slug, title: title ?? slug, module, at });
		const row = this.row(slug, dir, { title: title ?? slug, state: "idle", completion: 0 });
		AIIndexStream.append(this.store, this.kind, row, `${Day.of(day)}T00:00:00`);
		return { dir, id: slug, url: row.url };
	}

	async plan({ from, module }){
		const R = DatedFiles, rel = from.startsWith("/framework/") ? "public" + from.replace(/\/$/, "") : slash(path.relative(R.ROOT, path.resolve(R.ROOT, from)));
		const dir = R.abs(rel);
		if (!fs.existsSync(path.join(dir, this.file))) throw new Error(`${rel} has no ${this.file}; only a project folder moves`);
		if (rel.includes("/projects/")) throw new Error(`${rel} is already in a module's projects/ folder`);
		const home = `public/framework/${module.replace(/^\/|\/$/g, "")}`;
		if (!fs.existsSync(R.abs(home))) throw new Error(`module ${module} does not exist (${home})`);
		const facts = await this.read(dir), slug = path.basename(dir), day = this.start_day(rel, facts.at);
		const to = this.path(day, slug, module);
		if (fs.existsSync(R.abs(to))) throw new Error(`${to} already exists`);
		const session = this.session_of(dir);
		return { from: rel, to, module, slug, day, ...facts, session: session && R.rel(session) };
	}

	/** Dry run unless `apply`. Returns the plan, plus the run id when applied. */
	async move({ from, module, apply = false }){
		const R = DatedFiles, plan = await this.plan({ from, module });
		if (!apply) return { dry_run: true, ...plan };
		const now = new Date().toISOString();
		fs.mkdirSync(path.dirname(R.abs(plan.to)), { recursive: true });
		if (R.tracked(plan.from)) R.git("mv", plan.from, plan.to); else fs.renameSync(R.abs(plan.from), R.abs(plan.to));
		const row = { ...this.row(plan.slug, plan.to, plan), moved_from: plan.from };
		AIIndexStream.append(this.store, this.kind, row, `${plan.day}T00:00:00`);   // the start day's stream now points at the new home
		AIIndexStream.append(this.store, this.kind, { ...row, moved: true }, now);   // today's stream shows the move
		if (plan.session) R.append(SessionRecord.file(R.abs(plan.session)), { log: { at: now, msg: `project ${plan.slug} moved to ${R.url(plan.to)} (was ${plan.from})` } });
		const run = now.replace(/\D/g, "").slice(0, 14);
		R.append(R.abs(R.MANIFEST), { run, at: now, from: plan.from, to: plan.to, module, slug: plan.slug, day: plan.day, session: plan.session });
		return { dry_run: false, run, ...plan };
	}

	/** Reverses one move (the last that is not undone, or `run`): the folder goes back and each day gets a mirror row. */
	async undo({ run } = {}){
		const R = DatedFiles, all = R.lines(R.abs(R.MANIFEST)), undone = new Set(all.filter(l => l.undone).map(l => l.undone));
		const m = all.filter(l => l.to && !undone.has(l.run)).filter(l => !run || l.run === run).pop();
		if (!m) throw new Error("no move to undo");
		if (!fs.existsSync(R.abs(m.to))) throw new Error(`${m.to} is gone; nothing to put back`);
		if (fs.existsSync(R.abs(m.from))) throw new Error(`${m.from} already exists; will not overwrite`);
		const now = new Date().toISOString(), facts = await this.read(R.abs(m.to));
		fs.mkdirSync(path.dirname(R.abs(m.from)), { recursive: true });
		if (R.tracked(m.to)) R.git("mv", m.to, m.from); else fs.renameSync(R.abs(m.to), R.abs(m.from));
		for (let d = path.dirname(R.abs(m.to)); d.includes(`${path.sep}projects${path.sep}`); d = path.dirname(d)) { try { fs.rmdirSync(d); } catch { break; } }
		const row = this.row(m.slug, m.from, facts);
		AIIndexStream.append(this.store, this.kind, row, `${m.day}T00:00:00`);
		AIIndexStream.append(this.store, this.kind, { ...row, moved_back: true }, now);
		if (m.session && SessionRecord.file(R.abs(m.session))) R.append(SessionRecord.file(R.abs(m.session)), { log: { at: now, msg: `project ${m.slug} moved back to ${m.from}` } });
		R.append(R.abs(R.MANIFEST), { at: now, undone: m.run, from: m.to, to: m.from });
		return { undone: m.run, from: m.to, to: m.from };
	}

	/** The index rows of a day range (default: the last 30 days), filtered, sorted and paged by ext/Query. Spec: {from, to, where, sort, offset, limit}. */
	async query(spec = {}){
		if (this.kind === "session") return new Query({ sort: { by: "last_activity", dir: "desc" }, ...spec }).run(this.snapshots({ from: spec.from, to: spec.to }));
		const to = spec.to ?? Day.of(), d = new Date(to + "T12:00:00"); d.setDate(d.getDate() - 30);
		const rows = await this.rows({ from: spec.from ?? Day.of(d), to, load: async day => AIIndexStream.read(this.store, day) });
		return new Query({ sort: { by: "at", dir: "desc" }, ...spec }).run(rows.map(r => ({ ...r, at: r.at ?? "" })));
	}

	/** Every project folder under <module>/projects/YYYY/MM/DD/<slug>/ in the repo. */
	folders(){
		const out = [], R = DatedFiles, walk = (dir, depth) => {
			let names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
			for (const e of names) {
				if (!e.isDirectory() || e.name === "node_modules" || e.name === ".git") continue;
				const full = path.join(dir, e.name);
				if (e.name === "projects" && fs.existsSync(path.join(full))) { this.days_under(full, out); continue; }
				if (depth < 6) walk(full, depth + 1);
			}
		};
		walk(R.abs("public/framework"), 0);
		return out;
	}
	days_under(projects, out){
		const R = DatedFiles, ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => path.join(d, e.name)); } catch { return []; } };
		for (const y of ls(projects)) for (const m of ls(y)) for (const dd of ls(m)) for (const slug of ls(dd))
			if (fs.existsSync(path.join(slug, this.file))) out.push({ path: R.rel(slug), day: `${path.basename(y)}-${path.basename(m)}-${path.basename(dd)}` });
	}

	/** Rebuild from the folders and diff with the index: `missing` = a folder with no row, `stale` = a row whose folder is gone. Never out of sync, or ok is false. */
	async check(){
		if (this.kind === "session") return this.check_sessions();
		const R = DatedFiles, latest = new Map();
		for (const day of Dated.days(Day.of(new Date(Date.now() - 400 * 864e5)), Day.of()))
			for (const l of AIIndexStream.read(this.store, day)) { const r = l[this.kind]; if (r?.id) latest.set(r.id, { ...latest.get(r.id), ...r }); }
		const found = this.folders(), have = new Set(found.map(f => f.path));
		const indexed = new Set([...latest.values()].map(r => r.path));
		const missing = found.filter(f => !indexed.has(f.path)).map(f => f.path);
		const stale = [...latest.values()].filter(r => !fs.existsSync(R.abs(r.path))).map(r => r.path);
		return { ok: !missing.length && !stale.length, folders: have.size, rows: latest.size, missing, stale };
	}

	/** Sessions: ok when no top folder sits under the wrong day (misfiled) and no index row points at a folder that is gone (stale). A folder without a row is not a fault: watch() and the transcript indexer fill rows in. */
	check_sessions(){
		const R = DatedFiles, latest = new Map(), have = new Set();
		for (const { day, dir } of this.day_folders()){
			for (const l of AIIndexStream.read(this.store, day)) { const r = l[this.kind]; if (r?.id) latest.set(r.id, { ...latest.get(r.id), ...r }); }
			try { for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) have.add(R.rel(path.join(dir, e.name))); } catch {}
		}
		const moves = this.misfiled({ since: DatedFiles.LOCAL_DAY_SINCE }).moves.filter(m => m.source !== "folder birth time"), stale = [...latest.values()].filter(r => r.path && !fs.existsSync(path.isAbsolute(r.path) ? r.path : R.abs(r.path))).map(r => r.path);
		return { ok: !moves.length && !stale.length, folders: have.size, rows: latest.size, misfiled: moves.map(m => m.old), stale };
	}

	// ── the sessions collection: <ai/sessions>/YYYY/MM/DD/<session or task folder>/ (TaskDirs is its thin alias) ──
	static get sessions(){ return this._sessions ??= new DatedFiles("sessions"); }
	static UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
	static LOCAL_DAY_SINCE = "2026-10-18";   // folders filed before this were filed by the UTC day and stay (ai/doc/task-folders.md)
	static TIME_KEYS = ["at", "ts", "started_at", "first_at", "requested_at", "started", "time", "created_at"];
	/** Absolute folder of a day ("YYYY-MM-DD", a Date or ms; today by default). */
	day_dir(day){ return DatedFiles.abs(this.day_path(day)); }
	/** Every day folder of the collection, oldest first (absolute): YYYY/MM/DD under its root. */
	days(){
		const root = path.dirname(path.dirname(path.dirname(this.day_dir(new Date()))));
		const ls = (d, re) => { try { return fs.readdirSync(d).filter(n => re.test(n)).sort(); } catch { return []; } };
		const out = [];
		for (const y of ls(root, /^\d{4}$/)) for (const m of ls(path.join(root, y), /^\d{2}$/)) for (const d of ls(path.join(root, y, m), /^\d{2}$/)) out.push(path.join(root, y, m, d));
		return out;
	}
	/** A session's folder without a scan: `session-<id8>` or the uuid, the oldest that holds the id (the day it began); else where a new one goes, on `day`. Absolute.
	 *  A `session-<id8>` folder that names ANOTHER full id is not ours: two ids can share their first 8 hex (the hand-picked a1c1d1e1-000N ids of
	 *  2026-09-19 put three sessions' costs in one folder), so a clash gets a folder named by the full uuid. Doc: core/Session/doc/identity.md. */
	session_dir(id, day = new Date()){
		const t = typeof day === "string" ? new Date(day + "T12:00:00") : day, short = "session-" + id.slice(0, 8);
		// One session, one folder (2026-10-25): the OLDEST folder that holds the id, the day the session began, however long ago.
		// Until then it looked back a fixed number of days, newest first: a tab resumed on its fifth day got a second folder (session-e00f55c9 on 10/20 and 10/24).
		for (const d of this.days()){
			if (fs.existsSync(path.join(d, id))) return path.join(d, id);
			if (fs.existsSync(path.join(d, short)) && [id, null].includes(DatedFiles.owner(path.join(d, short)))) return path.join(d, short);
		}
		const home = path.join(this.day_dir(t), short);
		return fs.existsSync(home) ? path.join(this.day_dir(t), id) : home;   // reached only when session-<id8> belongs to another id
	}
	/** The full session id a session folder says it holds, or null when it does not say (then it is taken to be the caller's).
	 *  The same sources, in the same order, as Session.scan: index.json, the cache summary, then line 1 of the record or page. */
	static owner(dir){
		const read = f => { try { return fs.readFileSync(path.join(dir, f), "utf8"); } catch { return ""; } };
		const first = f => { try { return JSON.parse(read(f).split("\n")[0] || "null"); } catch { return null; } };
		let id = null;
		try { id = JSON.parse(read("index.json") || "null")?.id ?? null; } catch {}
		if (!id) try { id = JSON.parse(read("cache.jsonl").split("\n").find(l => l.startsWith('{"summary"')) ?? "null")?.summary?.id ?? null; } catch {}
		if (!id){ const l = first("session.jsonl") ?? first("task.jsonl"); id = l?.session?.id ?? l?.assign?.session_id ?? null; }
		if (!id){ const l = first("page.jsonl"); id = typeof l?.session === "string" ? l.session : null; }
		return typeof id === "string" && DatedFiles.UUID.test(id) ? id : null;
	}
	/** Where a new task folder goes: inside its session when one is given, else straight under the day. Absolute, not created. `parent` is resolved by the caller. */
	home({ slug, session_id, parent, day } = {}){
		if (!/^[a-z0-9][a-z0-9._-]*$/i.test(slug ?? "")) throw new Error("a slug is [a-z0-9-], got " + JSON.stringify(slug));
		if (parent) return path.join(parent, slug);
		if (session_id && DatedFiles.UUID.test(session_id)) return path.join(this.session_dir(session_id, day ?? new Date()), slug);
		return path.join(this.day_dir(day), slug);
	}
	/** Make the folder `dir` names, refusing one that already holds a record (never two tasks in one log). Returns it. */
	make(dir){
		const log = SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl");
		if (fs.existsSync(log)) throw new Error(`refused: ${DatedFiles.rel(dir)} already holds a task. Pick another slug (e.g. ${path.basename(dir)}-2).`);
		fs.mkdirSync(dir, { recursive: true });
		return dir;
	}

	static first_json(file){ try { for (const l of fs.readFileSync(file, "utf8").split("\n", 8)) if (l.startsWith("{")) try { return JSON.parse(l); } catch {} } catch {} return null; }
	static time_in(o){ if (!o || typeof o !== "object") return null; for (const k of this.TIME_KEYS) if (typeof o[k] === "string" && !isNaN(Date.parse(o[k]))) return o[k]; for (const v of Object.values(o)) if (v && typeof v === "object") { const t = this.time_in(v); if (t) return t; } return null; }
	/** A folder's own start time and where it came from: its record's first line, else index.json first_at, else cache.jsonl, else the birth time. */
	start(dir){
		const R = DatedFiles, log = SessionRecord.log_file(dir);
		if (log){ const t = R.time_in(R.first_json(log)); if (t) return { at: t, source: path.basename(log) + " first line" }; }
		const ix = R.first_json(path.join(dir, "index.json"))?.first_at;
		if (ix && !isNaN(Date.parse(ix))) return { at: ix, source: "index.json first_at" };
		try { for (const l of fs.readFileSync(path.join(dir, "cache.jsonl"), "utf8").split("\n")) if (l.startsWith('{"summary"')){ const f = JSON.parse(l).summary?.first_at; if (f && !isNaN(Date.parse(f))) return { at: f, source: "cache.jsonl summary first_at" }; } } catch {}
		try { const st = fs.statSync(dir); return { at: new Date(st.birthtimeMs || st.mtimeMs).toISOString(), source: "folder birth time" }; } catch { return null; }
	}
	/** Every day folder of the store: [{day:"YYYY-MM-DD", dir}] oldest first. */
	day_folders(){
		const ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };
		const root = DatedFiles.abs(this.root), out = [];
		for (const y of ls(root)) if (/^\d{4}$/.test(y)) for (const m of ls(path.join(root, y))) if (/^\d\d$/.test(m)) for (const d of ls(path.join(root, y, m))) if (/^\d\d$/.test(d)) out.push({ day: `${y}-${m}-${d}`, dir: path.join(root, y, m, d) });
		return out;
	}
	/** Every top-level folder whose start day is not its folder day. [{old, new, reason, source, start}] + skipped (target exists). `cards` are filed by the moment written and skipped. */
	misfiled({ since = "0000-00-00" } = {}){
		const R = DatedFiles, moves = [], skipped = [];
		for (const { day: here, dir: dd } of this.day_folders()){
			let names; try { names = fs.readdirSync(dd, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { continue; }
			for (const name of names){
				if (name === "cards") continue;
				const dir = path.join(dd, name), s = this.start(dir); if (!s) continue;
				const want = Day.of(s.at); if (!want || want === here) continue;
				if (here < since && want < since) continue;   // older history stays as filed (UTC); see ai/doc/task-folders.md
				const to = path.join(this.day_dir(want), name);
				if (fs.existsSync(to)){ skipped.push({ old: R.rel(dir), why: "target exists: " + R.rel(to) }); continue; }
				moves.push({ old: R.rel(dir), new: R.rel(to), reason: `started ${want} ${new Date(s.at).toTimeString().slice(0, 5)} local, filed under ${here}`, source: s.source, start: s.at });
			}
		}
		return { moves, skipped };
	}

	/** The index row of a session folder, built from its own record (never typed by an AI): id, path, url, title, state. Null when the folder holds no record. */
	session_row(dir){
		const R = DatedFiles, file = SessionRecord.file(dir) ?? SessionRecord.log_file(dir);
		if (!file) return null;
		const lines = R.lines(file), head = lines[0] ?? {}, h = head.session ?? head.assign ?? head;
		const id = h.id ?? h.session_id ?? path.basename(dir), rel = R.rel(dir);
		const title = [...lines].reverse().map(l => l.summary?.title ?? l.title).find(t => typeof t === "string") ?? h.title ?? h.agent ?? path.basename(dir);
		const state = lines.some(l => l.finish || l.closed) ? "done" : "open";
		return { id, path: rel, url: R.url(rel), title, state };
	}
	/** Writes the day-index row for a folder when it has none, or when its state or title changed. Returns the row written, else null. */
	sync(dir){
		const row = this.session_row(dir); if (!row) return null;
		const start = this.start(dir)?.at, day = Day.of(start || Date.now());
		const have = AIIndexStream.read(this.store, day).map(l => l[this.kind]).filter(r => r?.id === row.id).pop();
		if (have && have.state === row.state && have.title === row.title) return null;
		AIIndexStream.append(this.store, this.kind, row, start ? new Date(start).toISOString() : undefined);
		return row;
	}
	/** The safety net: a folder that appears, or a record that grows, gets its index row from this one writer, whatever path wrote it. Returns {close}. */
	watch({ debounce = 400 } = {}){
		const timers = new Map(), R = DatedFiles, root = R.abs(this.root);
		const w = fs.watch(root, { recursive: true }, (_ev, name) => {
			const parts = String(name ?? "").split(/[\\/]/);   // YYYY/MM/DD/<folder>/…
			if (parts.length < 4 || !/^\d{4}$/.test(parts[0]) || /^(index\.jsonl|day\.jsonl|cards)$/.test(parts[3])) return;
			const leaf = parts[parts.length - 1], record = leaf === "session.jsonl" || leaf === "task.jsonl";
			if (parts.length > 4 && !record) return;   // cache.jsonl, index.json and the rest are the transcript indexer's own writes
			const dir = path.join(root, ...parts.slice(0, 4));
			clearTimeout(timers.get(dir));
			timers.set(dir, setTimeout(() => { timers.delete(dir); try { fs.existsSync(dir) && this.sync(dir); } catch (e) { console.error("DatedFiles.watch:", e.message); } }, debounce));
		});
		return { close(){ w.close(); for (const t of timers.values()) clearTimeout(t); } };
	}

	// ── sessions: the current snapshot of every session, read from the day index.json files (AISessionIndex writes them) ──
	/** Where the live snapshots sit in memory, when a server runs the transcript index: `{ items: () => iterable, on: fn => off }`, set by AISessionTailer. Without it the day files are the source. */
	static live = null;
	/** Every session's current snapshot for a day range (default: all days), one per id (the later last_activity wins). With a live index the memory answers: it is what writes the files. */
	snapshots({ from, to } = {}){
		const day = s => String(s.last_activity ?? s.first_at ?? "").slice(0, 10), keep = s => (!from || day(s) >= from) && (!to || day(s) <= to);
		if (DatedFiles.live) return [...DatedFiles.live.items()].filter(keep);
		const by = new Map();
		for (const { day: d, dir } of this.day_folders()){
			if ((from && d < from.slice(0, 10)) || (to && d > to.slice(0, 10))) continue;
			let file; try { file = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8")); } catch { continue; }
			for (const s of file.snapshots ?? []){ const old = by.get(s.id); if (!old || String(s.last_activity) >= String(old.last_activity)) by.set(s.id, s); }
		}
		return [...by.values()].filter(keep);
	}

	/** Server/session-query.mjs's filter, over snapshots(): {since, until, tags, system, state, model, provider, parent, min_cost, text, sort, limit} -> {count, shown, claude_api_equivalent_usd, openrouter_real_usd, rows}. */
	find(args = {}, snapshots){
		const r2 = n => Math.round(n * 100) / 100, list = v => v == null || v === "" ? [] : (Array.isArray(v) ? v : String(v).split(",")).map(x => String(x).trim()).filter(Boolean);
		const day_of = s => String(s.last_activity ?? s.first_at ?? "").slice(0, 10);
		const tags = list(args.tags ?? args.tag), system = args.system ? String(args.system).toLowerCase() : null, text = args.text ? String(args.text).toLowerCase() : null;
		const min = Number(args.min_cost ?? 0) || 0, limit = Math.min(200, Math.max(0, Number(args.limit ?? 25)));
		const hit = s => {
			const day = day_of(s);
			if (args.since && day < args.since) return false;
			if (args.until && day > args.until) return false;
			if (tags.length && !tags.every(t => (s.tags ?? []).includes(t))) return false;
			if (system && !(s.core ?? []).some(c => c.toLowerCase().includes(system)) && !String(s.category ?? "").toLowerCase().includes(system)) return false;
			if (args.state && s.state !== args.state) return false;
			if (args.model && !String(s.model ?? "").toLowerCase().includes(String(args.model).toLowerCase())) return false;
			if (args.provider && s.provider !== args.provider) return false;
			if (args.parent && s.parent !== args.parent) return false;
			if (min && !((s.usd ?? 0) >= min)) return false;
			if (text && ![s.id, s.agent, s.category, ...(s.tags ?? []), ...(s.core ?? [])].some(v => String(v ?? "").toLowerCase().includes(text))) return false;
			return true;
		};
		const found = (snapshots ?? this.snapshots()).filter(hit);
		const sorts = { cost: (a, b) => (b.usd ?? 0) - (a.usd ?? 0), oldest: (a, b) => String(a.last_activity).localeCompare(String(b.last_activity)), recent: (a, b) => String(b.last_activity).localeCompare(String(a.last_activity)) };
		found.sort(sorts[args.sort] ?? sorts.recent);
		// Claude sessions are priced at API-equivalent rates (what the plan saves, not money spent); OpenRouter sessions are real dollars.
		const claude = found.filter(s => s.provider === "claude" || !s.provider), router = found.filter(s => s.provider && s.provider !== "claude");
		const sum = l => r2(l.reduce((n, s) => n + (s.usd || 0), 0));
		return { count: found.length, shown: Math.min(limit, found.length), claude_api_equivalent_usd: sum(claude), openrouter_real_usd: sum(router),
			rows: found.slice(0, limit).map(s => ({ id: s.id, day: day_of(s), state: s.state, model: s.model, provider: s.provider, usd: r2(s.usd || 0), tags: s.tags ?? [], category: s.category ?? null, core: s.core ?? [], parent: s.parent ?? null, agent: s.agent ?? null })) };
	}

	/** Who is running right now: state active and last activity within `within` ms (an hour). Feeds /framework/ai/now/ (Server/InFlight.mjs) and must equal Servex's working agents. */
	in_flight({ now = Date.now(), within = 3600e3 } = {}){
		const since = Day.of(new Date(now - within - 864e5)), t = s => Date.parse(s.last_activity ?? 0) || 0;
		return this.snapshots({ from: since }).filter(s => s.state === "active" && now - t(s) < within).sort((a, b) => t(b) - t(a));
	}

	// ── the doors: one set of methods, two adapters ─────────────────────────────────────────────
	static get files(){ return this._files ??= new DatedFiles("projects"); }

	/** SDK/MCP tools. `move_project` keeps its name (the one door); `dated_create` and `dated_query` are the other two. */
	static tools(){
		const f = () => this.files, json = async v => JSON.stringify(await v, null, 2);
		return [
			{
				name: "move_project",
				description: "Move a project folder (one holding project.jsonl) from its session into a module: git mv to <module>/projects/YYYY/MM/DD/<slug>/ and it indexes itself (both days' index.jsonl, a one-line pointer in the session's session.jsonl). Dry run unless apply is true. {undo:true} puts the last move back. Doc: /framework/ai/tasks/doc/projects.md",
				inputSchema: { type: "object", properties: {
					from: { type: "string", description: "The project folder: a repo path or a site path (/framework/ai/sessions/…/<slug>/)." },
					module: { type: "string", description: 'The module that takes it, e.g. "core/Task".' },
					apply: { type: "boolean", description: "Do it. Omitted = dry run." },
					undo: { type: "boolean", description: "Reverse the last move (then from/module are ignored)." } } },
				handler: a => json(a.undo ? f().undo() : f().move(a))
			},
			{
				name: "dated_create",
				description: "Make a new project in a module: <module>/projects/YYYY/MM/DD/<slug>/project.jsonl with its first line, and its row in the day's index. Doc: Server/doc/dated-files.md",
				inputSchema: { type: "object", required: ["module", "slug"], properties: { module: { type: "string" }, slug: { type: "string", description: "lowercase words and dashes" }, title: { type: "string" } } },
				handler: a => json(f().create(a))
			},
			{
				name: "dated_query",
				description: "Query the projects index (default: last 30 days). Spec: {from, to (YYYY-MM-DD), where:[{field,op,value}], sort, limit}. Returns {rows,total}.",
				inputSchema: { type: "object", properties: { from: { type: "string" }, to: { type: "string" }, where: { type: "array" }, sort: { type: "object" }, limit: { type: "number" } } },
				handler: a => json(f().query(a))
			}
		];
	}

	/** The dev-socket door: rpc:dated_create / dated_move / dated_query answer `{index, response}`. Local peers only (the socket refuses LAN commands). */
	static socket(socket){
		const door = (name, fn) => socket.on(`rpc:${name}`, async (args = [], index) => {
			let response; try { response = { ok: true, ...(await fn(args[0] ?? {})) }; } catch (e) { response = { ok: false, error: e.message }; }
			socket.send({ index, response });
		});
		door("dated_create", a => this.files.create(a));
		door("dated_move", a => a.undo ? this.files.undo(a) : this.files.move(a));
		door("dated_query", a => this.files.query(a));
	}
	/** `DevSocket.Socket.use(DatedFiles)` calls this for every socket. */
	static setup(socket){ this.socket(socket); }
}
