import TaskStateLog from "../tasks/TaskStateLog.js";
import DashRow from "./DashRow.js";
import DayIndexLog from "./DayIndexLog.js";

/** DashState — the whole ai/index.json, kept current by two streams. Today's day stream (DayIndexLog) patches one task row the moment it changes; a line on ai/index.jsonl (written AFTER index.json, so it always points at fresh data) refetches the whole file, at most once every REFETCH_MS.
 *  `rows` are the dashboard's one row type (DashRow). Doc: ai/doc/one-dashboard.md */
export default class DashState extends TaskStateLog {
	static URL = new URL("../index.json", import.meta.url).pathname;
	full = null;      // the last index.json
	rows = [];        // DashRow.rows(full)
	static REFETCH_MS = 5000;   // the whole file is 2.4 MB: a burst of stream lines costs one fetch, the day stream carries the fast part
	listeners = new Set();
	day = new DayIndexLog();

	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }

	/** The stream line sets `state` (counts, check); the full picture follows it. */
	apply(entry){ super.apply(entry); if (entry?.in_flight && this.started) this.refetch_soon(); }

	start(){
		this.started = true;
		this.day.live(() => this.patch());
		return this.live(() => {}).then(() => this.load_soon());
	}

	/** Coalesce stream lines: the first fetches now, the rest wait out REFETCH_MS and fetch once. */
	refetch_soon(){
		const wait = DashState.REFETCH_MS - (Date.now() - (this.fetched_at ?? 0));
		if (wait <= 0) return this.load_soon();
		this.refetch_timer ??= setTimeout(() => { this.refetch_timer = null; this.load_soon(); }, wait);
	}

	/** Merge the day stream's newest line per task into the loaded picture: the changed row, drawn now. A task not yet in the picture waits for the next fetch. */
	patch(){
		if (!this.full) return;
		const by = new Map((this.full.tasks ?? []).map(r => [r.id, r]));
		let n = 0;
		for (const l of this.day.latest.values()){
			const r = l.kind === "task" && by.get(l.id);
			if (!r || (r.state === l.state && r.title === l.title && r.line === (l.line ?? r.line))) continue;
			Object.assign(r, { state: l.state, title: l.title, line: l.line ?? r.line, landed_at: l.landed_at ?? null,
				bucket: { complete: "landed", stopped: "stopped", waiting: "waiting" }[l.state] ?? r.bucket });
			n++;
		}
		if (n){ this.rows = DashRow.rows(this.full); this.listeners.forEach(fn => fn(this)); }
	}

	/** One fetch at a time; a line that arrives mid-fetch asks for one more after it. */
	async load_soon(){
		if (this.loading) return void (this.again = true);
		this.loading = true;
		try {
			const res = await fetch(DashState.URL, { cache: "no-store" }).catch(() => null);
			if (res?.ok && !(res.headers.get("content-type") ?? "").includes("html")){
				this.full = await res.json();
				this.fetched_at = Date.now();
				this.rows = DashRow.rows(this.full);
				this.listeners.forEach(fn => fn(this));
			}
		} finally {
			this.loading = false;
			if (this.again){ this.again = false; this.load_soon(); }
		}
	}
}
