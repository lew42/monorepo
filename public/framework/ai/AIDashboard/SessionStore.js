import Day from "/framework/core/Session/Day.js";
import DashState from "../rail/DashState.js";
import SessionTree from "./SessionTree.js";

/** SessionStore — reads the one store (sessions/YYYY/MM/DD/index.json, written only by AISessionIndex) and builds the SessionTree of the sessions created that day.
 *  It streams: each new line on ai/index.jsonl (DashState) reloads the day, so the page never needs an agent or a timer. */
export default class SessionStore {
	static DAYS = 7;
	static url(day){ return new URL(`../sessions/${Day.path(day)}/index.json`, import.meta.url).pathname; }

	day = null; tree = null; ok = true; tasks = null;
	closed = new Map();   // day -> { ok, snaps } of a closed day file
	listeners = new Set();

	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }

	/** The seven days ending today, newest first. */
	static days(today = Day.of()){
		const base = new Date(today + "T12:00:00");
		return Array.from({ length: SessionStore.DAYS }, (_, i) => Day.of(new Date(base.getTime() - i * 864e5)));
	}

	async open(day){
		this.day = day;
		await this.load();
		if (!this.dash){
			this.dash = new DashState();
			this.dash.on(d => { this.tasks = d.full?.counts?.tasks ?? null; this.load(); });
			this.dash.start();
		}
	}

	/** The day files to read for `day`: its own, then every later one up to today (at most LATER), because a session
	 *  that ran past midnight is filed under its last day but belongs to the day it was created. */
	static files(day, today = Day.of()){
		const out = [], base = new Date(day + "T12:00:00");
		for (let i = 0; i <= SessionStore.LATER; i++){ const d = Day.of(new Date(base.getTime() + i * 864e5)); if (d > today) break; out.push(d); }
		return out;
	}
	static LATER = 31;

	/** One day file's snapshots; a closed day never changes, so it is read once and kept. Each snapshot learns `dir`, the folder it is filed under. */
	async file(day){
		if (this.closed.has(day)) return this.closed.get(day);
		const res = await fetch(SessionStore.url(day), { cache: "no-store" }).catch(() => null);
		const json = res?.ok && !(res.headers.get("content-type") ?? "").includes("html") ? await res.json().catch(() => null) : null;
		const snaps = (json?.snapshots ?? []).map(s => ({ ...s, dir: Day.path(day) }));
		const got = { ok: !!json, snaps };
		if (json?.closed) this.closed.set(day, got);
		return got;
	}

	/** The sessions CREATED on `day` (a snapshot's `day` field), wherever they are filed. One load at a time; a stream line that lands mid-load asks for one more after it. */
	async load(){
		if (this.loading) return void (this.again = true);
		this.loading = true;
		try {
			const day = this.day, files = await Promise.all(SessionStore.files(day).map(d => this.file(d))), want = Day.path(day);
			if (day === this.day){
				this.ok = files[0].ok;
				const born = s => (s.day ?? s.dir).replaceAll("-", "/") === want;
				this.tree = new SessionTree(files.flatMap(f => f.snaps).filter(born));
				this.listeners.forEach(fn => fn(this));
			}
		} finally {
			this.loading = false;
			if (this.again){ this.again = false; this.load(); }
		}
	}
}
