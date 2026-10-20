import Day from "/framework/core/Session/Day.js";
import DashState from "../rail/DashState.js";
import SessionTree from "./SessionTree.js";

/** SessionStore — reads the one store (sessions/YYYY/MM/DD/index.json, written only by AISessionIndex) for a day and builds its SessionTree.
 *  It streams: each new line on ai/tasks/state.jsonl (DashState) reloads the day, so the page never needs an agent or a timer. */
export default class SessionStore {
	static DAYS = 7;
	static url(day){ return new URL(`../sessions/${Day.path(day)}/index.json`, import.meta.url).pathname; }

	day = null; tree = null; ok = true; tasks = null;
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

	/** One fetch at a time; a stream line that lands mid-fetch asks for one more after it. */
	async load(){
		if (this.loading) return void (this.again = true);
		this.loading = true;
		try {
			const day = this.day, res = await fetch(SessionStore.url(day), { cache: "no-store" }).catch(() => null);
			const json = res?.ok && !(res.headers.get("content-type") ?? "").includes("html") ? await res.json().catch(() => null) : null;
			if (day === this.day){
				this.ok = !!json;
				this.tree = new SessionTree(json?.snapshots ?? []);
				this.listeners.forEach(fn => fn(this));
			}
		} finally {
			this.loading = false;
			if (this.again){ this.again = false; this.load(); }
		}
	}
}
