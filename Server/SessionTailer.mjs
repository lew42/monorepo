// Server/SessionTailer.mjs — follows every Claude transcript as it grows and appends the changed fields to today's DAY index.
//
//   transcript line appended -> fs.watch -> Session.update() reads ONLY the new bytes (apply_line per line)
//   -> if a field changed, one delta line goes to sessions/YYYY/MM/DD/index.jsonl (a session's first line each day is a full keyframe)
//   -> the dev socket tails that file to the browser (JSONL.live()) -> SessionLive folds it into a light Session -> that session's
//   row redraws. The month and year roll-ups are rebuilt from the day files a minute after something changed (Server/SessionDays.mjs).
//
// Hosted by Server/plugins/SessionTail.js (on the main checkout's dev server). Doc: public/framework/ai/sessions/doc/realtime.md
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../public/framework/ai/sessions/Session.js";
import { files_of, registry_rows, slim_of } from "./session-summary.mjs";
import SessionDays from "./SessionDays.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.join(here, "..", "public", "framework", "ai", "sessions");
// "<id>.jsonl" is a main transcript; "<id>/subagents/agent-*.jsonl" is an in-process subagent of that session.
const TRANSCRIPT = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\.jsonl|[\\/]subagents[\\/][^\\/]+\.jsonl)$/;

export default class SessionTailer {

	static ACTIVE_MS = 5 * 60 * 1000;   // "in flight" = a transcript line in the last five minutes (same window as SessionRows)
	static DEBOUNCE_MS = 30;            // a burst of lines from one turn is read once
	static SWEEP_MS = 5000;             // safety net for a missed watch event, and the active -> idle flip
	static SAVE_MS = 30000;             // cache.jsonl is rewritten at most this often per session
	static ROLL_MS = 60000;             // month and year roll-ups are rebuilt at most this often, and only after a change

	constructor({ base = path.join(os.homedir(), ".claude", "projects"), root = SESSIONS_DIR, log = () => {} } = {}){
		this.base = base;
		this.root = root;
		this.today_ids = new Set();   // sessions that already have a line in today's day file (the next line for one of them is a delta)
		this.today = null;
		this.roll_due = 0;
		this.log = log;
		this.sessions = new Map();   // id -> { session, main_path, last, active, extra, dirty, saved_at }
		this.timers = new Map();     // id -> debounce timer
		this.watchers = [];
		this.registry = { at: 0, rows: [] };
		this.busy = Promise.resolve();
	}

	start(){
		this.load_index();
		this.open_day(new Date().toISOString());
		for (const d of this.project_dirs()) this.watch(d);
		this.sweeper = setInterval(() => this.sweep(), SessionTailer.SWEEP_MS);
		this.sweeper.unref?.();
		this.log(`SessionTailer: following ${this.watchers.length} transcript folders, writing ${path.relative(path.join(here, ".."), this.root)}/YYYY/MM/DD/index.jsonl`);
		return this;
	}

	stop(){
		clearInterval(this.sweeper);
		this.watchers.forEach(w => w.close());
		this.watchers = [];
		return this.busy.then(() => this.save_all());
	}

	project_dirs(){
		try { return fs.readdirSync(this.base).filter(d => /^c--code-lew42-/i.test(d)).map(d => path.join(this.base, d)); } catch { return []; }
	}

	watch(dir){
		try {
			this.watchers.push(fs.watch(dir, { recursive: true }, (_, name) => {
				const m = name && TRANSCRIPT.exec(String(name));
				if (m) this.schedule(m[1], path.join(dir, m[1] + ".jsonl"));
			}));
		} catch (e){ this.log("SessionTailer: cannot watch " + dir + " — " + e.message); }
	}

	/** What each session looked like last, field by field: the old whole-file index first, then every line of today's day file on top (a restart repeats nothing). */
	load_index(){
		this.cur = new Map(); this.index = {};
		try {
			const ix = JSON.parse(fs.readFileSync(path.join(this.root, "session-index.json"), "utf8"));
			this.index = ix.rows ?? {};
			for (const [id, v] of Object.entries(this.index)) this.cur.set(id, Object.fromEntries(ix.columns.map((c, i) => [c, v[i]])));
		} catch {}
	}

	/** Start (or roll over to) a UTC day: make its file so a page can tail it before the first line, and learn which sessions already have a line in it. */
	open_day(iso){
		const day = iso.slice(0, 10);
		if (day === this.today) return;
		this.today = day;
		fs.mkdirSync(SessionDays.day_dir(iso, this.root), { recursive: true });
		const file = SessionDays.day_file(iso, this.root);
		if (!fs.existsSync(file)) fs.writeFileSync(file, "");
		const lines = SessionDays.lines(file);
		this.today_ids = new Set(lines.map(l => l.id));
		for (const [id, fields] of SessionDays.fold(lines)){ const { at, ...rest } = fields; this.cur.set(id, { ...this.cur.get(id), ...rest }); }
	}

	schedule(id, main_path){
		clearTimeout(this.timers.get(id));
		this.timers.set(id, setTimeout(() => {
			this.timers.delete(id);
			this.busy = this.busy.then(() => this.process(id, main_path)).catch(e => this.log("SessionTailer: " + id + " — " + e.message));
		}, SessionTailer.DEBOUNCE_MS));
	}

	registry_row(id){
		if (Date.now() - this.registry.at > 10000) this.registry = { at: Date.now(), rows: registry_rows() };
		return this.registry.rows.find(r => r.session_id === id);
	}

	async entry(id, main_path){
		let e = this.sessions.get(id);
		if (e) return e;
		const session = (await Session.load_cached(id)) ?? new Session(id);
		const prev = this.index[id];   // [usd, tree_usd, children, ...]
		e = { session, main_path, last: null, active: false, extra: prev ? prev[1] - prev[0] : 0, children: prev ? prev[2] : 0, dirty: false, saved_at: 0 };
		this.sessions.set(id, e);
		return e;
	}

	/** Read the transcript's new bytes and, if the row changed, append one line to the feed. Returns the line, or null. */
	async process(id, main_path){
		const e = await this.entry(id, main_path);
		const files = files_of(id, e.main_path);
		if (!files.length) return null;
		const { new_lines } = await e.session.update(files);
		const reg = this.registry_row(id);
		e.session.set_configured(reg ? { model: reg.model, effort: reg.effort, parent: reg.parent, role: reg.role, agent: reg.id, cost: reg.cost, turns: reg.turns } : null);
		if (new_lines) e.dirty = true;
		const s = e.session.s, pv = e.session.preview();
		const age = s.last_at ? Date.now() - Date.parse(s.last_at) : Infinity;
		e.active = age < SessionTailer.ACTIVE_MS;
		const state = e.active ? "active" : "idle";
		const row = slim_of({ usd: pv.usd, tree_usd: pv.usd + e.extra, children: e.children, wall_ms: pv.wall_ms, model: pv.model, effort: pv.effort, flags: pv.flags.length, first_at: s.first_at, provider: pv.provider });
		const next = { ...Object.fromEntries(Session.INDEX_COLUMNS.map((c, i) => [c, row[i]])), state, first_at: s.first_at, last_activity: s.last_at };
		const now = new Date().toISOString();
		this.open_day(now);
		const before = this.cur.get(id) ?? {}, delta = {};
		const keyframe = !this.today_ids.has(id);   // the first line of a session in a day carries every field, so the day stands alone
		for (const k of Object.keys(next)) if (keyframe || next[k] !== before[k]) delta[k] = next[k];
		if (!keyframe && !Object.keys(delta).length) return null;
		this.cur.set(id, { ...before, ...next });
		this.today_ids.add(id);
		const line = { id, at: now, ...delta };
		SessionDays.append(now, line, this.root);
		this.roll_due ||= Date.now() + SessionTailer.ROLL_MS;
		if (Date.now() - e.saved_at > SessionTailer.SAVE_MS) await this.save(e);
		return line;
	}

	async save(e){
		if (!e.dirty) return;
		e.dirty = false; e.saved_at = Date.now();
		await e.session.save("session-tailer").catch(err => this.log("SessionTailer: save failed — " + err.message));
	}

	async save_all(){ for (const e of this.sessions.values()) await this.save(e); }

	/** Every few seconds: re-check the sessions that are in flight (a missed watch event, and the active -> idle flip once five quiet minutes pass). */
	sweep(){
		this.open_day(new Date().toISOString());
		if (this.roll_due && Date.now() >= this.roll_due){ this.roll_due = 0; try { SessionDays.roll(this.root); } catch (e){ this.log("SessionTailer: roll-up failed — " + e.message); } }
		for (const [id, e] of this.sessions) if (e.active || e.dirty) this.schedule(id, e.main_path);
	}
}
