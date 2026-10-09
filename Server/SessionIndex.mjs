// Server/SessionIndex.mjs — every session's current state, in memory, and the ONE writer of the per-session `index.json`.
// Doc: public/framework/ai/sessions/doc/realtime.md
//
//   transcript line appended -> fs.watch -> Session.update() reads only the new bytes (Session.apply_line per line)
//   -> the session's SNAPSHOT is rebuilt; if a field changed it is stored, `change` listeners hear it (the socket plugin pushes it
//      to subscribed pages) and `<session folder>/index.json` is queued for a rewrite (temp file + rename, after 5 s of quiet and at least every 60 s).
//
// A snapshot is small and only about NOW (never a history): { id, state, model, effort, provider, usd, tree_usd, children, wall_ms,
// flags, tokens, first_at, last_activity, day, tags, alerts, core, category, parent, agent }. Its day for bundling is the UTC day of its
// last activity. When a day is over and nothing in it is active, `freeze()` writes `YYYY/MM/DD/index.json` with closed:true (a static site reads
// that file, live or closed), and `roll()` rebuilds the month and year totals from the day files. The history lives in the transcript and cache.jsonl.
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../public/framework/ai/sessions/Session.js";
import { files_of, registry_rows } from "./session-summary.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(here, "..");
const SESSIONS_DIR = path.join(REPO, "public", "framework", "ai", "sessions");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// "<id>.jsonl" is a main transcript; "<id>/subagents/agent-*.jsonl" is an in-process subagent of that session.
const TRANSCRIPT = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\.jsonl|[\\/]subagents[\\/][^\\/]+\.jsonl)$/;
const r4 = n => Math.round(n * 1e4) / 1e4;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default class SessionIndex {

	static ACTIVE_MS = 5 * 60 * 1000;   // "in flight" = a transcript line in the last five minutes (the window SessionRows uses)
	static DEBOUNCE_MS = 30;            // a burst of lines from one turn is read once
	static SWEEP_MS = 5000;             // safety net for a missed watch event, and the active -> idle flip
	static SAVE_MS = 30000;             // cache.jsonl is rewritten at most this often per session
	static QUIET_MS = 5000;             // a file is written after this long with no further change...
	static MAX_MS = 60000;              // ...and at least this often while it keeps changing (a trailing debounce)
	static FREEZE_MS = 60000;           // closed days are looked for this often
	static RECORD_MS = 60000;           // session.jsonl (tags, alerts) is re-read at most this often per session

	constructor({ base = path.join(os.homedir(), ".claude", "projects"), root = SESSIONS_DIR, repo = REPO, log = () => {} } = {}){
		this.base = base; this.root = root; this.repo = repo; this.log = log;
		this.snaps = new Map();      // id -> snapshot (the whole truth for the grid)
		this.dirs = new Map();       // id -> absolute session folder
		this.entries = new Map();    // id -> { session, main_path, active, dirty, saved_at, rec, rec_at } (sessions being tailed)
		this.timers = new Map();     // id -> debounce timer     this.writes = new Map()   id -> write timer
		this.writes = new Map(); this.day_writes = new Map();
		this.listeners = new Set();
		this.joins = { core: new Map(), category: new Map() };
		this.watchers = []; this.registry = { at: 0, rows: [] }; this.busy = Promise.resolve();
		this.ready = Promise.resolve();
	}

	// ---- life -----------------------------------------------------------------------------------------------------
	start(){
		this.ready = this.load().catch(e => this.log("SessionIndex: load failed — " + e.message));
		for (const d of this.project_dirs()) this.watch(d);
		this.sweeper = setInterval(() => this.sweep(), SessionIndex.SWEEP_MS); this.sweeper.unref?.();
		this.freezer = setInterval(() => this.freeze(), SessionIndex.FREEZE_MS); this.freezer.unref?.();
		this.log(`SessionIndex: following ${this.watchers.length} transcript folders`);
		return this;
	}

	async stop(){
		clearInterval(this.sweeper); clearInterval(this.freezer);
		this.watchers.forEach(w => w.close()); this.watchers = [];
		await this.busy;
		for (const id of [...this.writes.keys()]) await this.write(id);
		for (const d of [...this.day_writes.keys()]) await this.write_day(d);
		for (const e of this.entries.values()) await this.save(e);
	}

	project_dirs(){ try { return fs.readdirSync(this.base).filter(d => /^c--code-lew42-/i.test(d)).map(d => path.join(this.base, d)); } catch { return []; } }

	watch(dir){
		try {
			this.watchers.push(fs.watch(dir, { recursive: true }, (_, name) => {
				const m = name && TRANSCRIPT.exec(String(name));
				if (m) this.schedule(m[1], path.join(dir, m[1] + ".jsonl"));
			}));
		} catch (e){ this.log("SessionIndex: cannot watch " + dir + " — " + e.message); }
	}

	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }

	// ---- loading: the snapshots already on disk, then the sessions that have none yet -------------------------------
	async load(){
		this.load_joins();
		const old = this.old_index();
		const dirs = await this.session_dirs();
		const todo = [];
		await this.each(dirs, async ({ id, dir }) => {
			this.dirs.set(id, dir);
			let snap = null;
			try { snap = JSON.parse(await fsp.readFile(path.join(dir, "index.json"), "utf8")); } catch {}
			if (snap?.id === id){ this.snaps.set(id, snap); this.join(snap); } else todo.push({ id, dir });
		});
		this.log(`SessionIndex: ${this.snaps.size} snapshots on disk, ${todo.length} to build`);
		await this.each(todo, async ({ id, dir }) => {
			const session = await Session.load_cached(id);
			if (!session) return;
			const prev = old.get(id);
			const snap = this.build(id, session, { prev });
			snap.tags = []; snap.alerts = 0;
			await this.fill_record(id, snap);
			this.snaps.set(id, snap); this.queue(id);
		});
		this.freeze();
	}

	/** The old whole-file index, only for each session's descendants total (a tree the transcript alone cannot give). id -> { usd, tree_usd, children }. */
	old_index(){
		const out = new Map();
		try {
			const ix = JSON.parse(fs.readFileSync(path.join(this.root, "session-index.json"), "utf8")), c = ix.columns;
			for (const [id, v] of Object.entries(ix.rows ?? {})) out.set(id, { usd: v[c.indexOf("usd")], tree_usd: v[c.indexOf("tree_usd")], children: v[c.indexOf("children")] });
		} catch {}
		return out;
	}

	/** Every dated session folder: [{ id, dir }]. The old flat folders and the named ones are not sessions of this shape. */
	async session_dirs(){
		const out = [], ls = async p => fsp.readdir(p, { withFileTypes: true }).then(r => r.filter(d => d.isDirectory()).map(d => d.name), () => []);
		for (const y of await ls(this.root)) if (/^\d{4}$/.test(y)) for (const m of await ls(path.join(this.root, y))) for (const d of await ls(path.join(this.root, y, m)))
			for (const id of await ls(path.join(this.root, y, m, d))) if (UUID.test(id)) out.push({ id, dir: path.join(this.root, y, m, d, id) });
		return out;
	}

	async each(list, fn, width = 48){
		let i = 0;
		await Promise.all(Array.from({ length: Math.min(width, list.length) }, async () => { while (i < list.length) { const item = list[i++]; try { await fn(item); } catch (e){ this.log("SessionIndex: " + e.message); } } }));
	}

	/** The task audit's two joins: which core modules a session touched (sessions-core.json) and the category of the task that launched it (categories.json + each task's launch line). */
	load_joins(){
		const audit = path.join(this.repo, "public", "framework", "ai", "2026-10-08", "task-audit");
		try {
			for (const s of JSON.parse(fs.readFileSync(path.join(audit, "sessions-core.json"), "utf8"))){
				const mods = [...new Set((s.core ?? []).map(p => SessionIndex.module_of(p)).filter(Boolean))].slice(0, 4);
				if (mods.length) this.joins.core.set(s.session, mods);
			}
		} catch {}
		try {
			const ai = path.join(this.repo, "public", "framework", "ai");
			for (const c of JSON.parse(fs.readFileSync(path.join(audit, "categories.json"), "utf8")))
				try { for (const m of fs.readFileSync(path.join(ai, c.id, "task.jsonl"), "utf8").matchAll(/"session_id":"([0-9a-f-]{36})"/g)) this.joins.category.set(m[1], c.category); } catch {}
		} catch {}
	}

	/** "/public/framework/ai/sessions/Session.js" -> "ai/sessions"; "/Server/x.mjs" -> "Server". The small label the grid filters by. */
	static module_of(p){
		const parts = String(p).replace(/^\//, "").replace(/^public\/framework\//, "").split("/");
		return parts.length < 2 ? parts[0] : parts[0] === "Server" || parts[0] === "Servex" ? parts[0] : parts.slice(0, 2).join("/");
	}

	join(snap){ snap.core ??= this.joins.core.get(snap.id) ?? []; snap.category ??= this.joins.category.get(snap.id) ?? null; }

	// ---- the snapshot ---------------------------------------------------------------------------------------------
	/** A snapshot from a Session (its transcript totals) plus what we already knew (`prev`: the descendants total, the record, the registry row). */
	build(id, session, { prev, reg } = {}){
		const s = session.s, pv = session.preview(), age = s.last_at ? Date.now() - Date.parse(s.last_at) : Infinity;
		const tokens = Object.values(s.tokens ?? {}).reduce((n, v) => n + (typeof v === "number" ? v : 0), 0);
		const own = r4(pv.usd), below = prev ? Math.max(0, (prev.tree_usd ?? 0) - (prev.usd ?? 0)) : 0;   // the descendants, which the transcript alone cannot give
		const snap = {
			id, state: age < SessionIndex.ACTIVE_MS ? "active" : "idle", model: pv.model === "unknown" ? null : pv.model, effort: pv.effort ?? null,
			provider: pv.provider === "openrouter" ? "openrouter" : "claude", usd: own, tree_usd: r4(own + below),
			children: prev?.children ?? 0, wall_ms: Math.round(pv.wall_ms), flags: pv.flags.length, tokens, first_at: s.first_at ?? null, last_activity: s.last_at ?? null,
			day: Session.day(s.first_at) ?? prev?.day ?? null, tags: prev?.tags ?? [], alerts: prev?.alerts ?? 0,
			parent: reg?.parent ?? prev?.parent ?? null, agent: reg?.id ?? prev?.agent ?? null,
		};
		this.join(snap);
		return snap;
	}

	async fill_record(id, snap){
		const rec = await Session.record(id);
		snap.tags = rec.tags; snap.alerts = rec.alerts; snap.closed = !!rec.closed;
	}

	/** The UTC day a snapshot is bundled under: the day of its last activity. */
	static day_of(snap){ return (snap.last_activity ?? snap.first_at ?? new Date().toISOString()).slice(0, 10); }

	/** Store a snapshot if anything changed. Tells the listeners (with the changed keys) and queues the file. Returns the changed keys. */
	set(snap){
		const before = this.snaps.get(snap.id);
		const changed = Object.keys(snap).filter(k => !before || !same(before[k], snap[k]));
		if (before && !changed.length) return [];
		this.snaps.set(snap.id, snap);
		this.listeners.forEach(fn => { try { fn(snap, changed, before) } catch (e){ this.log("SessionIndex: listener — " + e.message); } });
		this.queue(snap.id); this.queue_day(SessionIndex.day_of(snap));
		if (before && SessionIndex.day_of(before) !== SessionIndex.day_of(snap)) this.queue_day(SessionIndex.day_of(before));
		return changed;
	}

	// ---- the single writer: index.json, temp file + rename, trailing-debounced: 5 s of quiet, at least every 60 s while changing ----------------
	/** Trailing debounce: run `fn` after QUIET_MS without another call, but never later than MAX_MS after the first call of a burst. */
	defer(map, key, fn){
		const now = Date.now(), cur = map.get(key), first = cur?.first ?? now;
		clearTimeout(cur?.timer);
		const timer = setTimeout(() => { map.delete(key); this.busy = this.busy.then(fn); }, Math.max(0, Math.min(SessionIndex.QUIET_MS, first + SessionIndex.MAX_MS - now)));
		timer.unref?.(); map.set(key, { timer, first });
	}

	queue(id){ this.defer(this.writes, id, () => this.write(id)); }

	/** The day composite is a REAL FILE at a stable URL, so a static host serves it unchanged. Debounced to a few seconds; the socket covers the gap. */
	queue_day(day){ this.defer(this.day_writes, day, () => this.write_day(day)); }

	async write_day(day, closed = false){
		clearTimeout(this.day_writes.get(day)?.timer); this.day_writes.delete(day);
		const file = SessionIndex.day_file(day, this.root), snapshots = this.bundle(day).snapshots;
		if (!snapshots.length) return;
		try {
			await fsp.mkdir(path.dirname(file), { recursive: true });
			await fsp.writeFile(file + ".tmp.json", JSON.stringify({ day, closed, snapshots }));
			await fsp.rename(file + ".tmp.json", file);
		} catch (e){ this.log("SessionIndex: write day " + day + " — " + e.message); }
	}

	async dir_of(id, snap){
		let dir = this.dirs.get(id);
		if (!dir){ dir = fileURLToPath(await Session.locate(id, snap.first_at)); this.dirs.set(id, dir); }
		return dir;
	}

	async write(id){
		clearTimeout(this.writes.get(id)?.timer); this.writes.delete(id);
		const snap = this.snaps.get(id); if (!snap) return;
		try {
			const dir = await this.dir_of(id, snap);
			await fsp.mkdir(dir, { recursive: true });
			const tmp = path.join(dir, "index.tmp.json"), file = path.join(dir, "index.json");   // a .json name: the dev watcher ignores it
			await fsp.writeFile(tmp, JSON.stringify(snap));
			try { await fsp.rename(tmp, file); } catch { await new Promise(r => setTimeout(r, 50)); await fsp.rename(tmp, file); }
		} catch (e){ this.log("SessionIndex: write " + id + " — " + e.message); }
	}

	// ---- following transcripts ------------------------------------------------------------------------------------
	schedule(id, main_path){
		clearTimeout(this.timers.get(id));
		this.timers.set(id, setTimeout(() => {
			this.timers.delete(id);
			this.busy = this.busy.then(() => this.process(id, main_path)).catch(e => this.log("SessionIndex: " + id + " — " + e.message));
		}, SessionIndex.DEBOUNCE_MS));
	}

	registry_row(id){
		if (Date.now() - this.registry.at > 10000) this.registry = { at: Date.now(), rows: registry_rows() };
		return this.registry.rows.find(r => r.session_id === id);
	}

	async entry(id, main_path){
		let e = this.entries.get(id);
		if (e) return e;
		e = { session: (await Session.load_cached(id)) ?? new Session(id), main_path, active: false, dirty: false, saved_at: 0, rec_at: 0 };
		this.entries.set(id, e);
		return e;
	}

	/** Read a session's new transcript bytes and update its snapshot. Returns the changed keys ([] if nothing moved). */
	async process(id, main_path){
		await this.ready;
		const e = await this.entry(id, main_path), files = files_of(id, e.main_path);
		if (!files.length) return [];
		const { new_lines } = await e.session.update(files);
		const reg = this.registry_row(id);
		e.session.set_configured(reg ? { model: reg.model, effort: reg.effort, parent: reg.parent, role: reg.role, agent: reg.id, cost: reg.cost, turns: reg.turns } : null);
		if (new_lines) e.dirty = true;
		const prev = this.snaps.get(id), snap = this.build(id, e.session, { prev, reg });
		if (prev?.closed != null) snap.closed = prev.closed;
		if (!prev || Date.now() - e.rec_at > SessionIndex.RECORD_MS){ e.rec_at = Date.now(); await this.fill_record(id, snap); }
		e.active = snap.state === "active";
		const changed = this.set(snap);
		if (Date.now() - e.saved_at > SessionIndex.SAVE_MS) await this.save(e);
		return changed;
	}

	async save(e){
		if (!e.dirty) return;
		e.dirty = false; e.saved_at = Date.now();
		await e.session.save("session-index").catch(err => this.log("SessionIndex: save failed — " + err.message));
	}

	/** Every few seconds: re-check the sessions in flight (a missed watch event, and the active -> idle flip after five quiet minutes). */
	sweep(){
		for (const [id, e] of this.entries) if (e.active || e.dirty) this.schedule(id, e.main_path);
	}

	// ---- composites, built from memory ----------------------------------------------------------------------------
	snapshot(id){ return this.snaps.get(id) ?? null; }

	/** One bundle for a day ("YYYY-MM-DD") or a month ("YYYY-MM"): every snapshot whose last activity falls in it, oldest first. */
	bundle(prefix){
		const snapshots = [...this.snaps.values()].filter(s => SessionIndex.day_of(s).startsWith(prefix)).sort((a, b) => (a.last_activity ?? "").localeCompare(b.last_activity ?? ""));
		return { prefix, snapshots };
	}

	// ---- closed days: the closed day composite and the month / year totals ---------------------------------------------
	static day_file(day, root = SESSIONS_DIR){ return path.join(root, ...day.split("-"), "index.json"); }

	/** Close every day before today that has no active session: its `index.json` is written once more with `closed:true`, and is never rewritten after. Returns the days closed. */
	freeze(){
		const today = new Date().toISOString().slice(0, 10), by = new Map();
		for (const s of this.snaps.values()) (by.get(SessionIndex.day_of(s)) ?? by.set(SessionIndex.day_of(s), []).get(SessionIndex.day_of(s))).push(s);
		const written = [];
		for (const [day, list] of by){
			if (day >= today || list.some(s => s.state === "active")) continue;
			const file = SessionIndex.day_file(day, this.root);
			try { if (JSON.parse(fs.readFileSync(file, "utf8")).closed) continue; } catch {}
			fs.mkdirSync(path.dirname(file), { recursive: true });
			list.sort((a, b) => a.id.localeCompare(b.id));
			fs.writeFileSync(file + ".tmp.json", JSON.stringify({ day, closed: true, snapshots: list }));
			fs.renameSync(file + ".tmp.json", file);
			clearTimeout(this.day_writes.get(day)?.timer); this.day_writes.delete(day);
			written.push(day);
		}
		if (written.length) SessionIndex.roll(this.root);
		return written;
	}

	static numbered(dir, width){
		try { return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && new RegExp(`^\\d{${width}}$`).test(d.name)).map(d => d.name).sort(); } catch { return []; }
	}

	/** The totals the closed day files imply: { "2026/10": { "08": {count, usd, flagged} }, ... } and per year. A day's usd is the lifetime cost of the sessions whose last activity was that day. */
	static compute(root = SESSIONS_DIR){
		const months = {}, years = {};
		for (const y of SessionIndex.numbered(root, 4)) for (const m of SessionIndex.numbered(path.join(root, y), 2)) for (const d of SessionIndex.numbered(path.join(root, y, m), 2)){
			let day; try { day = JSON.parse(fs.readFileSync(path.join(root, y, m, d, "index.json"), "utf8")); } catch { continue; }
			if (!day.closed) continue;
			const list = day.snapshots ?? [];
			(months[`${y}/${m}`] ??= {})[d] = { count: list.length, usd: r4(list.reduce((n, s) => n + (s.usd || 0), 0)), flagged: list.filter(s => s.flags > 0 || s.alerts > 0).length };
		}
		for (const [ym, days] of Object.entries(months)){
			const [y, m] = ym.split("/"), all = Object.values(days);
			(years[y] ??= {})[m] = { days: all.length, count: all.reduce((n, x) => n + x.count, 0), usd: r4(all.reduce((n, x) => n + x.usd, 0)), flagged: all.reduce((n, x) => n + x.flagged, 0) };
		}
		return { months, years };
	}

	static files(root = SESSIONS_DIR){
		const c = SessionIndex.compute(root), out = new Map();
		for (const [ym, days] of Object.entries(c.months)) out.set(path.join(root, ...ym.split("/"), "index.json"), JSON.stringify({ days }));
		for (const [y, months] of Object.entries(c.years)) out.set(path.join(root, y, "index.json"), JSON.stringify({ months }));
		return out;
	}

	static roll(root = SESSIONS_DIR){
		let n = 0;
		for (const [file, text] of SessionIndex.files(root)){
			let old = null; try { old = fs.readFileSync(file, "utf8"); } catch {}
			if (old !== text){ fs.writeFileSync(file, text); n++; }
		}
		return n;
	}

	/** The audit: the month and year totals must equal what the day files say. Returns the names that differ. */
	static check(root = SESSIONS_DIR){
		const bad = [];
		for (const [file, text] of SessionIndex.files(root)){
			let old = null; try { old = fs.readFileSync(file, "utf8"); } catch {}
			if (old !== text) bad.push(path.relative(root, file) + (old === null ? " (missing)" : " (differs)"));
		}
		return bad;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	// node Server/SessionIndex.mjs --build   write every missing index.json, freeze the closed days, rebuild the totals
	// node Server/SessionIndex.mjs --check   audit: month/year totals match the day files; every cached session has an index.json
	const cmd = process.argv[2];
	if (cmd === "--build"){
		const ix = new SessionIndex({ log: console.log }); await ix.load(); for (const id of [...ix.writes.keys()]) await ix.write(id);
		const days = new Set([...ix.snaps.values()].map(SessionIndex.day_of)); for (const d of days) await ix.write_day(d);
		console.log(`${ix.snaps.size} snapshots; froze ${ix.freeze().length} day(s); ${SessionIndex.roll()} total file(s) written`);
	} else if (cmd === "--check"){
		const bad = SessionIndex.check(), ix = new SessionIndex({ log: () => {} }), dirs = await ix.session_dirs();
		let missing = 0; for (const { dir } of dirs) if (!fs.existsSync(path.join(dir, "index.json")) && fs.existsSync(path.join(dir, "cache.jsonl"))) missing++;
		console.log(bad.length ? "totals out of date:\n  " + bad.join("\n  ") : "month and year totals match the day files");
		console.log(`${dirs.length} session folders, ${missing} cached without an index.json`);
		process.exit(bad.length || missing ? 3 : 0);
	} else console.log("usage: node Server/SessionIndex.mjs --build | --check");
}
