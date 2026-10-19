import TaskStateLog from "../tasks/TaskStateLog.js";
import DashRow from "./DashRow.js";

/** DashState — the whole ai/state.json, kept current by the one stream: each new line on ai/tasks/state.jsonl (written AFTER state.json, so it always points at fresh data) refetches it.
 *  `rows` are the dashboard's one row type (DashRow). Doc: ai/doc/one-dashboard.md */
export default class DashState extends TaskStateLog {
	static URL = new URL("../state.json", import.meta.url).pathname;
	full = null;      // the last state.json
	rows = [];        // DashRow.rows(full)
	listeners = new Set();

	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }

	/** The stream line sets `state` (counts, check); the full picture follows it. */
	apply(entry){ super.apply(entry); if (entry?.in_flight && this.started) this.load_soon(); }

	start(){
		this.started = true;
		return this.live(() => {}).then(() => this.load_soon());
	}

	/** One fetch at a time; a line that arrives mid-fetch asks for one more after it. */
	async load_soon(){
		if (this.loading) return void (this.again = true);
		this.loading = true;
		try {
			const res = await fetch(DashState.URL, { cache: "no-store" }).catch(() => null);
			if (res?.ok && !(res.headers.get("content-type") ?? "").includes("html")){
				this.full = await res.json();
				this.rows = DashRow.rows(this.full);
				this.listeners.forEach(fn => fn(this));
			}
		} finally {
			this.loading = false;
			if (this.again){ this.again = false; this.load_soon(); }
		}
	}
}
