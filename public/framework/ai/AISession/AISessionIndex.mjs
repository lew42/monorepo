// ai/AISession/AISessionIndex.mjs — every session's current state, in memory, and the ONE writer of the per-session `index.json`.
// Doc: public/framework/ai/sessions/doc/live/realtime.md
//
//   transcript line appended -> fs.watch -> AISession.update() reads only the new bytes (AISession.apply_line per line)
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
import Day from "../../core/Session/Day.js";
import AISession from "./AISession.js";
import AIIndexStream from "../../../../Server/AIIndexStream.mjs";
import { files_of, registry_rows } from "../../../../Server/session-summary.mjs";
import { links_of, children_map } from "../../../../Server/session-links.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(here, "..", "..", "..", "..");
const SESSIONS_DIR = path.join(REPO, "public", "framework", "ai", "sessions");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// "<id>.jsonl" is a main transcript; "<id>/subagents/agent-*.jsonl" is an in-process subagent of that session.
const TRANSCRIPT = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\.jsonl|[\\/]subagents[\\/][^\\/]+\.jsonl)$/;
const r4 = n => Math.round(n * 1e4) / 1e4;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default class AISessionIndex {

	static ACTIVE_MS = 5 * 60 * 1000;   // "in flight" = a transcript line in the last five minutes (the window AISessionRows uses)
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
		this.ready = this.load().catch(e => this.log("AISessionIndex: load failed — " + e.message));
		for (const d of this.project_dirs()) this.watch(d);
		this.watch_records();
		this.sweeper = setInterval(() => this.sweep(), AISessionIndex.SWEEP_MS); this.sweeper.unref?.();
		this.freezer = setInterval(() => this.freeze(), AISessionIndex.FREEZE_MS); this.freezer.unref?.();
		this.log(`AISessionIndex: following ${this.watchers.length} transcript folders`);
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
		} catch (e){ this.log("AISessionIndex: cannot watch " + dir + " — " + e.message); }
	}

	// ---- record-only sessions: a cloud voice call has a session.jsonl and no transcript on this machine ------------------
	watch_records(){
		try {
			this.watchers.push(fs.watch(this.root, { recursive: true }, (_, name) => {
				const m = name && /^(\d{4})[\\/](\d{2})[\\/](\d{2})[\\/]([^\\/]+)[\\/]session\.jsonl$/.exec(String(name));
				if (m) this.schedule_record(path.join(this.root, m[1], m[2], m[3], m[4]));
			}));
		} catch (e){ this.log("AISessionIndex: cannot watch " + this.root + " — " + e.message); }
	}

	schedule_record(dir){
		clearTimeout(this.timers.get(dir));
		this.timers.set(dir, setTimeout(() => {
			this.timers.delete(dir);
			this.busy = this.busy.then(() => { const snap = AISessionIndex.record_snap(dir); if (snap){ this.dirs.set(snap.id, dir); this.set(snap); } }).catch(e => this.log("AISessionIndex: record " + dir + " — " + e.message));
		}, AISessionIndex.DEBOUNCE_MS));
	}

	/** The snapshot of a record-only folder, or null if it is not one. id = the folder name; kind from line 1; times from the lines' `at`; cost from `cost` lines (`{"cost":{"usd":n}}`), else 0. */
	static record_snap(dir){
		const name = path.basename(dir);
		if (UUID.test(name) || /^session-[0-9a-f]{8}$/.test(name)) return null;   // a transcript session's folder
		let lines; try { lines = fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return null; }
		const head = lines[0]?.session; if (!head || head.kind === "vscode-tab") return null;
		const ms = v => { const t = typeof v === "number" ? v : Date.parse(v); return Number.isFinite(t) ? t : null; };
		const times = [ms(head.at), ...lines.slice(1).map(l => ms(Object.values(l)[0]?.at))].filter(t => t != null);
		const first = times.length ? Math.min(...times) : fs.statSync(path.join(dir, "session.jsonl")).birthtimeMs, last = times.length ? Math.max(...times) : first;
		const usd = r4(lines.reduce((n, l) => n + (+l.cost?.usd || 0), 0)), title = lines.find(l => typeof l.title === "string")?.title ?? head.title ?? name;
		return { id: name, kind: head.kind ?? null, state: Date.now() - last < AISessionIndex.ACTIVE_MS ? "active" : "idle", model: null, effort: null, provider: "claude", usd, usd_source: "recorded", tree_usd: usd, children: 0,
			wall_ms: last - first, flags: 0, tokens: 0, first_at: new Date(first).toISOString(), last_activity: new Date(last).toISOString(), day: Day.of(first), folder: name, tags: [], alerts: 0, parent: null, agent: null, title, core: [], files: 0 };
	}

	/** Every dated folder with a record-only session.jsonl gets its snapshot at start-up; later changes come from watch_records. */
	async load_records(){
		for (const y of AISessionIndex.numbered(this.root, 4)) for (const m of AISessionIndex.numbered(path.join(this.root, y), 2)) for (const d of AISessionIndex.numbered(path.join(this.root, y, m), 2)){
			const day = path.join(this.root, y, m, d);
			for (const e of await fsp.readdir(day, { withFileTypes: true }).catch(() => [])){
				if (!e.isDirectory()) continue;
				const dir = path.join(day, e.name), snap = AISessionIndex.record_snap(dir);
				if (snap && !this.snaps.has(snap.id)){ this.dirs.set(snap.id, dir); this.snaps.set(snap.id, snap); this.queue(snap.id); this.queue_day(AISessionIndex.day_of(snap)); }
			}
		}
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
			if (snap?.id === id){ if (snap.folder !== path.basename(dir)){ snap.folder = path.basename(dir); this.queue(id); } this.snaps.set(id, snap); if (this.join(snap)) this.queue(id); } else todo.push({ id, dir });
		});
		this.log(`AISessionIndex: ${this.snaps.size} snapshots on disk, ${todo.length} to build`);
		await this.each(todo, async ({ id, dir }) => {
			const session = await AISession.load_cached(id);
			if (!session) return;
			const prev = old.get(id);
			const snap = this.build(id, session, { prev });
			snap.tags = []; snap.alerts = 0;
			await this.fill_record(id, snap);
			this.snaps.set(id, snap); this.queue(id);
		});
		await this.load_records();
		this.link_all();
		this.freeze();
		this.heal();
	}

	/** A snapshot counted under an older rule (no `cost_v`, or lower) is re-read once, for the last three days (older days: `--recost`). Runs behind the page, one session at a time. */
	heal(){
		if (this.no_heal) return;
		const since = Day.of(Date.now() - 2 * 864e5), days = new Set();
		for (const s of this.snaps.values()) if ((s.cost_v ?? 1) < AISession.STATE_V && AISessionIndex.day_of(s) >= since) days.add(AISessionIndex.day_of(s));
		if (!days.size) return;
		this.log("AISessionIndex: re-reading " + [...days].join(", ") + " with the current cost rule");
		this.busy = this.busy.then(() => this.recost([...days])).then(r => this.log("AISessionIndex: recost " + JSON.stringify(r))).catch(e => this.log("AISessionIndex: recost failed — " + e.message));
	}

	/** Every snapshot gets its `links` (card, task, brief, report, parent, children), computed from the real folders; rewritten only when they changed. */
	link_all(){
		this.kids = children_map([...this.snaps.values()]);
		for (const snap of this.snaps.values()){ const links = this.links(snap); if (!same(links, snap.links)){ snap.links = links; this.queue(snap.id); } }
	}

	/** One snapshot's links: what its own folder holds (card, task, brief, report) and the sessions it is tied to (parent, children). */
	links(snap){
		const dir = this.dirs.get(snap.id), url = dir ? "/framework/ai/sessions/" + path.relative(this.root, dir).split(path.sep).join("/") + "/" : null;
		return links_of(snap, dir, url, this.kids ?? new Map());
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

	/** Every dated session folder: [{ id, dir }]. A uuid-named folder is its own id; a slug-named one says its id in index.json (or its cache summary).
	 *  The old flat folders and other named ones are not sessions of this shape. */
	async session_dirs(){
		const out = [], ls = async p => fsp.readdir(p, { withFileTypes: true }).then(r => r.filter(d => d.isDirectory()).map(d => d.name), () => []);
		for (const y of await ls(this.root)) if (/^\d{4}$/.test(y)) for (const m of await ls(path.join(this.root, y))) for (const d of await ls(path.join(this.root, y, m)))
			for (const name of await ls(path.join(this.root, y, m, d))){
				const dir = path.join(this.root, y, m, d, name); let id = UUID.test(name) ? name : null;
				if (!id) try { id = JSON.parse(await fsp.readFile(path.join(dir, "index.json"), "utf8")).id; } catch {}
				if (!id) try { id = JSON.parse((await fsp.readFile(path.join(dir, "cache.jsonl"), "utf8")).split("\n").find(l => l.startsWith('{"summary"'))).summary.id; } catch {}
				if (id && UUID.test(id)) out.push({ id, dir });
			}
		return out;
	}

	async each(list, fn, width = 48){
		let i = 0;
		await Promise.all(Array.from({ length: Math.min(width, list.length) }, async () => { while (i < list.length) { const item = list[i++]; try { await fn(item); } catch (e){ this.log("AISessionIndex: " + e.message); } } }));
	}

	/** The task audit's two joins: which core modules a session touched (sessions-core.json) and the category of the task that launched it (categories.json + each task's launch line). */
	load_joins(){
		const audit = path.join(this.repo, "public", "framework", "ai", "2026-10-08", "task-audit");
		try {
			for (const s of JSON.parse(fs.readFileSync(path.join(audit, "sessions-core.json"), "utf8"))){
				const mods = [...new Set((s.core ?? []).map(p => AISessionIndex.module_of(p)).filter(Boolean))].slice(0, 4);
				if (mods.length) this.joins.core.set(s.session, mods);
			}
		} catch {}
		try {
			const ai = path.join(this.repo, "public", "framework", "ai");
			for (const c of JSON.parse(fs.readFileSync(path.join(audit, "categories.json"), "utf8")))
				try { for (const m of fs.readFileSync(path.join(ai, c.id, "task.jsonl"), "utf8").matchAll(/"session_id":"([0-9a-f-]{36})"/g)) this.joins.category.set(m[1], c.category); } catch {}
		} catch {}
	}

	/** A file path -> the familiar repo-relative tag: "/public/framework/ext/Refine/Refine.js" -> "ext/Refine", "/public/framework/ai/AISession/AISession.js" -> "ai/sessions",
	 *  "/public/framework/page.js" -> "page.js", "/Server/refine.mjs" -> "Server/refine.mjs", "/Servex/agents/tools.js" -> "Servex/agents/tools.js". Root files (CLAUDE.md, *.json) give "" (no tag). */
	static module_of(p){
		const parts = String(p).replace(/^\//, "").replace(/^public\/framework\//, "").split("/");
		if (parts[0] === "Server" || parts[0] === "Servex") return parts.length > 1 ? parts.slice(0, 4).join("/") : "";
		if (parts.length < 2) return "";
		return parts.length === 2 ? parts.join("/") : parts.slice(0, 2).join("/");
	}

	/** The modules a session edited most, from `touched` ({ path: times }): up to 4, most-edited first. */
	static modules_of(touched){
		const by = {};
		for (const [p, n] of Object.entries(touched ?? {})){ const m = AISessionIndex.module_of(p); if (m) by[m] = (by[m] || 0) + n; }
		return Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0]);
	}

	/** Fold the audit's joins into a snapshot (the joins win: they are recomputed from the audit files on every load). Returns true if it changed. */
	join(snap){
		const core = this.joins.core.get(snap.id) ?? snap.core ?? [], category = this.joins.category.get(snap.id) ?? snap.category ?? null;
		const changed = !same(core, snap.core) || category !== snap.category;
		snap.core = core; snap.category = category; return changed;
	}

	// ---- the snapshot ---------------------------------------------------------------------------------------------
	/** A snapshot from a Session (its transcript totals) plus what we already knew (`prev`: the descendants total, the record, the registry row). */
	build(id, session, { prev, reg } = {}){
		const s = session.s, pv = session.preview(), age = s.last_at ? Date.now() - Date.parse(s.last_at) : Infinity;
		const tokens = Object.values(s.tokens ?? {}).reduce((n, v) => n + (typeof v === "number" ? v : 0), 0);
		// A real OpenRouter cost, once recorded, is kept: the registry row that carried it goes away when Servex restarts, and the transcript alone cannot give it back.
		// A snapshot from before usd_source existed keeps its number too, but labelled "unverified": it may be a Claude-rate guess.
		const keep_real = pv.usd_source === "unrecorded" && prev?.usd_source === "openrouter";
		const keep_old = pv.usd_source === "unrecorded" && prev && prev.provider === "openrouter" && (prev.usd_source == null || prev.usd_source === "unverified") && prev.usd > 0;
		const own = keep_real || keep_old ? r4(prev.usd) : r4(pv.usd), usd_source = keep_real ? "openrouter" : keep_old ? "unverified" : pv.usd_source, below = prev ? Math.max(0, (prev.tree_usd ?? 0) - (prev.usd ?? 0)) : 0;   // the descendants, which the transcript alone cannot give
		const snap = {
			id, state: age < AISessionIndex.ACTIVE_MS ? "active" : "idle", model: pv.model === "unknown" ? null : pv.model, effort: pv.effort ?? null,
			provider: pv.provider === "openrouter" ? "openrouter" : "claude", usd: own, usd_source, cost_v: AISession.STATE_V, tree_usd: r4(own + below),
			children: prev?.children ?? 0, wall_ms: Math.round(pv.wall_ms), flags: pv.flags.length, tokens, first_at: s.first_at ?? null, last_activity: s.last_at ?? null,
			day: AISession.day(s.first_at) ?? prev?.day ?? null, folder: this.dirs.has(id) ? path.basename(this.dirs.get(id)) : (this.snaps.get(id)?.folder ?? null), tags: prev?.tags ?? [], alerts: prev?.alerts ?? 0,
			parent: reg?.parent ?? prev?.parent ?? null, agent: reg?.id ?? prev?.agent ?? null,
			title: s.title ?? prev?.title ?? null,
			core: AISessionIndex.modules_of(s.touched), files: Object.keys(s.touched ?? {}).length,   // from the transcript's own Edit/Write calls; the task audit join (below) wins where it has one   // the tab's own title (VS Code sidebar / phone), from the transcript's title lines
		};
		this.join(snap);
		if (this.kids) snap.links = this.links(snap);   // keeps the links a rebuild would otherwise drop
		return snap;
	}

	async fill_record(id, snap){
		const rec = await AISession.record(id);
		snap.tags = rec.tags; snap.alerts = rec.alerts; snap.closed = !!rec.closed;
	}

	/** The owner's local day (Day.js) a snapshot is bundled under: the day of its last activity. */
	static day_of(snap){ return Day.of(snap.last_activity ?? snap.first_at ?? Date.now()); }

	/** Store a snapshot if anything changed. Tells the listeners (with the changed keys) and queues the file. Returns the changed keys. */
	set(snap){
		const before = this.snaps.get(snap.id);
		const changed = Object.keys(snap).filter(k => !before || !same(before[k], snap[k]));
		if (before && !changed.length) return [];
		this.snaps.set(snap.id, snap);
		this.listeners.forEach(fn => { try { fn(snap, changed, before) } catch (e){ this.log("AISessionIndex: listener — " + e.message); } });
		this.queue(snap.id); this.queue_day(AISessionIndex.day_of(snap));
		this.stream_line(snap, before);
		if (before && AISessionIndex.day_of(before) !== AISessionIndex.day_of(snap)) this.queue_day(AISessionIndex.day_of(before));
		return changed;
	}

	/** A session born in the last ten minutes, or one whose state or title changed, is one line on today's day stream (Server/AIIndexStream.mjs). A start-up read of old sessions writes none. */
	stream_line(snap, before){
		const fresh = !before && Date.now() - Date.parse(snap.first_at ?? 0) < 600000;
		if (!fresh && !(before && (before.state !== snap.state || before.title !== snap.title))) return;
		try {
			const dir = "public/framework/ai/sessions/" + snap.day + "/" + (snap.folder ?? "session-" + snap.id.slice(0, 8));
			AIIndexStream.append(this.root, "session", { id: snap.id, path: dir, url: "/framework/ai/sessions/" + snap.day + "/" + (snap.folder ?? "session-" + snap.id.slice(0, 8)) + "/", title: snap.title ?? snap.agent ?? snap.id.slice(0, 8), state: snap.state });
		} catch (e){ this.log("AISessionIndex: day stream — " + e.message); }
	}

	// ---- the single writer: index.json, temp file + rename, trailing-debounced: 5 s of quiet, at least every 60 s while changing ----------------
	/** Trailing debounce: run `fn` after QUIET_MS without another call, but never later than MAX_MS after the first call of a burst. */
	defer(map, key, fn){
		const now = Date.now(), cur = map.get(key), first = cur?.first ?? now;
		clearTimeout(cur?.timer);
		const timer = setTimeout(() => { map.delete(key); this.busy = this.busy.then(fn); }, Math.max(0, Math.min(AISessionIndex.QUIET_MS, first + AISessionIndex.MAX_MS - now)));
		timer.unref?.(); map.set(key, { timer, first });
	}

	queue(id){ this.defer(this.writes, id, () => this.write(id)); }

	/** The day composite is a REAL FILE at a stable URL, so a static host serves it unchanged. Debounced to a few seconds; the socket covers the gap. */
	queue_day(day){ this.defer(this.day_writes, day, () => this.write_day(day)); }

	async write_day(day, closed = false){
		clearTimeout(this.day_writes.get(day)?.timer); this.day_writes.delete(day);
		const file = AISessionIndex.day_file(day, this.root), snapshots = this.bundle(day).snapshots;
		if (!snapshots.length) return;
		try {
			await fsp.mkdir(path.dirname(file), { recursive: true });
			await fsp.writeFile(file + ".tmp.json", JSON.stringify({ day, closed, snapshots }));
			await fsp.rename(file + ".tmp.json", file);
		} catch (e){ this.log("AISessionIndex: write day " + day + " — " + e.message); }
	}

	async dir_of(id, snap){
		let dir = this.dirs.get(id);
		if (!dir){ dir = fileURLToPath(await AISession.locate(id, snap.first_at)); this.dirs.set(id, dir); }
		if (snap.folder !== path.basename(dir)) snap.folder = path.basename(dir);   // the folder name travels with the snapshot, so the browser can find the folder
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
		} catch (e){ this.log("AISessionIndex: write " + id + " — " + e.message); }
	}

	// ---- following transcripts ------------------------------------------------------------------------------------
	schedule(id, main_path){
		clearTimeout(this.timers.get(id));
		this.timers.set(id, setTimeout(() => {
			this.timers.delete(id);
			this.busy = this.busy.then(() => this.process(id, main_path)).catch(e => this.log("AISessionIndex: " + id + " — " + e.message));
		}, AISessionIndex.DEBOUNCE_MS));
	}

	registry_row(id){
		if (Date.now() - this.registry.at > 10000) this.registry = { at: Date.now(), rows: registry_rows() };
		return this.registry.rows.find(r => r.session_id === id);
	}

	async entry(id, main_path){
		let e = this.entries.get(id);
		if (e) return e;
		e = { session: (await AISession.load_cached(id)) ?? new AISession(id), main_path, active: false, dirty: false, saved_at: 0, rec_at: 0 };
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
		if (!prev || Date.now() - e.rec_at > AISessionIndex.RECORD_MS){ e.rec_at = Date.now(); await this.fill_record(id, snap); }
		e.active = snap.state === "active";
		const changed = this.set(snap);
		if (Date.now() - e.saved_at > AISessionIndex.SAVE_MS) await this.save(e);
		return changed;
	}

	async save(e){
		if (!e.dirty) return;
		e.dirty = false; e.saved_at = Date.now();
		await e.session.save("session-index").catch(err => this.log("AISessionIndex: save failed — " + err.message));
	}

	/** Every few seconds: re-check the sessions in flight (a missed watch event, and the active -> idle flip after five quiet minutes). */
	sweep(){
		for (const [id, e] of this.entries) if (e.active || e.dirty) this.schedule(id, e.main_path);
	}

	// ---- composites, built from memory ----------------------------------------------------------------------------
	snapshot(id){ return this.snaps.get(id) ?? null; }

	/** One bundle for a day ("YYYY-MM-DD") or a month ("YYYY-MM"): every snapshot whose last activity falls in it, oldest first. */
	bundle(prefix){
		const snapshots = [...this.snaps.values()].filter(s => AISessionIndex.day_of(s).startsWith(prefix)).sort((a, b) => (a.last_activity ?? "").localeCompare(b.last_activity ?? ""));
		return { prefix, snapshots };
	}

	// ---- closed days: the closed day composite and the month / year totals ---------------------------------------------
	static day_file(day, root = SESSIONS_DIR){ return path.join(root, ...day.split("-"), "index.json"); }

	/** Close every day before today that has no active session: its `index.json` is written once more with `closed:true`, and is never rewritten after. Returns the days closed. */
	freeze(){
		const today = Day.of(), by = new Map();
		for (const s of this.snaps.values()) (by.get(AISessionIndex.day_of(s)) ?? by.set(AISessionIndex.day_of(s), []).get(AISessionIndex.day_of(s))).push(s);
		const written = [];
		for (const [day, list] of by){
			if (day >= today || list.some(s => s.state === "active")) continue;
			const file = AISessionIndex.day_file(day, this.root);
			try { if (JSON.parse(fs.readFileSync(file, "utf8")).closed) continue; } catch {}
			fs.mkdirSync(path.dirname(file), { recursive: true });
			list.sort((a, b) => a.id.localeCompare(b.id));
			fs.writeFileSync(file + ".tmp.json", JSON.stringify({ day, closed: true, snapshots: list }));
			fs.renameSync(file + ".tmp.json", file);
			clearTimeout(this.day_writes.get(day)?.timer); this.day_writes.delete(day);
			written.push(day);
		}
		if (written.length) AISessionIndex.roll(this.root);
		return written;
	}

	static numbered(dir, width){
		try { return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && new RegExp(`^\\d{${width}}$`).test(d.name)).map(d => d.name).sort(); } catch { return []; }
	}

	/** The totals the closed day files imply: { "2026/10": { "08": {count, usd, flagged} }, ... } and per year. usd is Claude API-equivalent dollars only; usd_openrouter is OpenRouter's own billed dollars, never added to it. A day's usd is the lifetime cost of the sessions whose last activity was that day. */
	static compute(root = SESSIONS_DIR){
		const months = {}, years = {};
		for (const y of AISessionIndex.numbered(root, 4)) for (const m of AISessionIndex.numbered(path.join(root, y), 2)) for (const d of AISessionIndex.numbered(path.join(root, y, m), 2)){
			let day; try { day = JSON.parse(fs.readFileSync(path.join(root, y, m, d, "index.json"), "utf8")); } catch { continue; }
			if (!day.closed) continue;
			const list = day.snapshots ?? [];
			(months[`${y}/${m}`] ??= {})[d] = { count: list.length, usd: r4(list.reduce((n, s) => n + (s.provider === "openrouter" ? 0 : s.usd || 0), 0)), usd_openrouter: r4(list.reduce((n, s) => n + (s.provider === "openrouter" ? s.usd || 0 : 0), 0)), flagged: list.filter(s => s.flags > 0 || s.alerts > 0).length };
		}
		for (const [ym, days] of Object.entries(months)){
			const [y, m] = ym.split("/"), all = Object.values(days);
			(years[y] ??= {})[m] = { days: all.length, count: all.reduce((n, x) => n + x.count, 0), usd: r4(all.reduce((n, x) => n + x.usd, 0)), usd_openrouter: r4(all.reduce((n, x) => n + (x.usd_openrouter || 0), 0)), flagged: all.reduce((n, x) => n + x.flagged, 0) };
		}
		return { months, years };
	}

	static files(root = SESSIONS_DIR){
		const c = AISessionIndex.compute(root), out = new Map();
		for (const [ym, days] of Object.entries(c.months)) out.set(path.join(root, ...ym.split("/"), "index.json"), JSON.stringify({ days }));
		for (const [y, months] of Object.entries(c.years)) out.set(path.join(root, y, "index.json"), JSON.stringify({ months }));
		return out;
	}

	static roll(root = SESSIONS_DIR){
		let n = 0;
		for (const [file, text] of AISessionIndex.files(root)){
			let old = null; try { old = fs.readFileSync(file, "utf8"); } catch {}
			if (old !== text){ fs.writeFileSync(file, text); n++; }
		}
		return n;
	}

	/** Re-read the logs of every session whose last activity is in `days` ("YYYY-MM-DD"), from byte 0, with the current counting rule (AISession STATE_V),
	 *  and rewrite its snapshot, its ancestors' tree totals and the day files. Needed once after the rule changes: a session nobody touches is never re-read on its own.
	 *  Returns { sessions, before, after } in Claude dollars. Rule: ai/AISession/doc/cost-accounting.md. */
	async recost(days){
		const { find_transcript } = await import("./AISessionAudit.mjs");
		let sessions = 0, before = 0, after = 0;
		for (const snap of [...this.snaps.values()]){
			if (!days.includes(AISessionIndex.day_of(snap))) continue;
			const main = find_transcript(snap.id); if (!main) continue;
			const old = snap.usd ?? 0;
			await this.process(snap.id, main);
			const now = this.snaps.get(snap.id), delta = (now.usd ?? 0) - old;
			sessions++; if (now.provider !== "openrouter"){ before += old; after += now.usd ?? 0; }
			for (let p = now.parent, hops = 0; delta && p && this.snaps.has(p) && hops < 20; p = this.snaps.get(p).parent, hops++){   // ancestors' totals carry the child's dollars
				const up = this.snaps.get(p); this.snaps.set(p, { ...up, tree_usd: r4(Math.max(0, (up.tree_usd ?? 0) + delta)) }); this.queue(p);
			}
			await this.save(this.entries.get(snap.id)); this.entries.delete(snap.id);   // the summary on disk is the new one; the entry's totals can be re-read later
		}
		for (const id of [...this.writes.keys()]) await this.write(id);
		for (const day of days){
			let closed = false; try { closed = !!JSON.parse(fs.readFileSync(AISessionIndex.day_file(day, this.root), "utf8")).closed; } catch {}
			await this.write_day(day, closed);
		}
		AISessionIndex.roll(this.root);
		return { sessions, before: r4(before), after: r4(after) };
	}

	/** The audit: the month and year totals must equal what the day files say. Returns the names that differ. */
	static check(root = SESSIONS_DIR){
		const bad = [];
		for (const [file, text] of AISessionIndex.files(root)){
			let old = null; try { old = fs.readFileSync(file, "utf8"); } catch {}
			if (old !== text) bad.push(path.relative(root, file) + (old === null ? " (missing)" : " (differs)"));
		}
		return bad;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	// node ai/AISession/AISessionIndex.mjs --build   write every missing index.json, freeze the closed days, rebuild the totals
	// node ai/AISession/AISessionIndex.mjs --recost [day...]   re-read those days' logs with the current counting rule (doc/cost-accounting.md)
	// node ai/AISession/AISessionIndex.mjs --check   audit: month/year totals match the day files; every cached session has an index.json
	const cmd = process.argv[2];
	if (cmd === "--build"){
		const ix = new AISessionIndex({ log: console.log }); await ix.load(); for (const id of [...ix.writes.keys()]) await ix.write(id);
		const days = new Set([...ix.snaps.values()].map(AISessionIndex.day_of)); for (const d of days) await ix.write_day(d);
		console.log(`${ix.snaps.size} snapshots; froze ${ix.freeze().length} day(s); ${AISessionIndex.roll()} total file(s) written`);
	} else if (cmd === "--recost"){      // node ai/AISession/AISessionIndex.mjs --recost [YYYY-MM-DD ...]   (default: yesterday and today, local)
		const days = process.argv.slice(3).length ? process.argv.slice(3) : [Day.of(Date.now() - 864e5), Day.of()];
		const ix = new AISessionIndex({ log: console.log }); ix.no_heal = true; await ix.load();
		console.log(JSON.stringify({ days, ...await ix.recost(days) }));
	} else if (cmd === "--check"){
		const bad = AISessionIndex.check(), ix = new AISessionIndex({ log: () => {} }), dirs = await ix.session_dirs();
		// A cache-only folder whose id already has an index.json in another folder is a leftover from the rename (the rest of the session moved), not a missing snapshot.
		const has = new Set(); for (const { id, dir } of dirs) if (fs.existsSync(path.join(dir, "index.json"))) has.add(id);
		let missing = 0, leftovers = 0; for (const { id, dir } of dirs) if (!fs.existsSync(path.join(dir, "index.json")) && fs.existsSync(path.join(dir, "cache.jsonl"))) has.has(id) ? leftovers++ : missing++;
		console.log(bad.length ? "totals out of date:\n  " + bad.join("\n  ") : "month and year totals match the day files");
		console.log(`${dirs.length} session folders, ${missing} cached without an index.json (${leftovers} more are cache-only leftovers of a renamed session; left in place)`);
		process.exit(bad.length || missing ? 3 : 0);
	} else console.log("usage: node ai/AISession/AISessionIndex.mjs --build | --recost [day...] | --check");
}
