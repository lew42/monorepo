import { View, div, span, a, p } from "/app.js";
import QueryClient from "/framework/ext/Query/QueryClient.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";

View.stylesheet(import.meta, "AINow.css");

/** AINow — everything running right now, one card each: who, what it is doing, where it lives, what it has cost.
 *  The rows come from the dev server's "inflight" query source (Server/InFlight.mjs → DatedFiles.sessions.in_flight, computed from the session index);
 *  a changed row is pushed over the socket, so the list moves without a refresh. Readme: readme.md. */
export default class AINow extends View {
	static HOUR = 3600e3;
	static HOT = 5 * 60e3;   // moved in the last 5 minutes = working now (the sessions grid's own test); older but within the hour = quiet
	static usd(n){ return n >= 100 ? "$" + Math.round(n) : "$" + (n || 0).toFixed(2); }

	get classes(){ return "an-now"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){
		this.rows = new Map();
		this.error = "";
		this.loading = true;   // until the first answer: never show a false zero
		this.client = new QueryClient("inflight", { row: r => this.change(r), stale: () => this.ask() });
		super.initialize();
	}

	render(){
		this.$head = div.c("an-head");
		this.$list = div.c("an-list");
		div.c("an-foot", () => {
			a.c("an-link").href("/framework/ai/").attr("target", "_self").text("Today's sessions");
			a.c("an-link").href("/framework/ai/sessions/").text("All sessions");
		});
		this.paint();
		this.ask();
		// Ages and the one-hour edge are worked out in the browser from last_activity: a repaint, not a fetch.
		this.tick = setInterval(() => this.$list.el.isConnected ? this.paint() : clearInterval(this.tick), 60000);
	}

	async ask() {
		const res = await this.client.ask({ where: [{ field: "state", op: "eq", value: "active" }], sort: { by: "last_activity", dir: "desc" }, limit: 100 }, { timeout: 20000 });
		this.loading = false;
		if (res.error) { this.error = res.error; return this.paint(); }
		this.error = ""; this.rows = new Map(res.rows.map(r => [r.id, r]));
		this.paint();
	}

	change(r) { r.state === "active" ? this.rows.set(r.id, r) : this.rows.delete(r.id); this.paint(); }

	/** Rows that are running and moved in the last hour, newest first. */
	live() {
		const now = Date.now();
		return [...this.rows.values()].filter(r => r.state === "active" && now - Date.parse(r.last_activity) < AINow.HOUR).sort((x, y) => Date.parse(y.last_activity) - Date.parse(x.last_activity));
	}

	paint() {
		const rows = this.live(), now = Date.now(), hot = r => now - Date.parse(r.last_activity) < AINow.HOT, n_hot = rows.filter(hot).length, total = rows.reduce((n, r) => n + (r.usd || 0), 0);
		this.el.dataset.ready = String(!this.loading);
		this.$head.empty(() => {
			if (this.loading) return void span.c("an-what", "Asking the server who is running…");
			span.c("an-count", String(n_hot));
			span.c("an-what", n_hot === 1 ? " session working now" : " sessions working now");
			if (rows.length) span.c("an-total", ` · ${rows.length - n_hot} quiet in the last hour · ${AINow.usd(total)} so far`);
		});
		this.$list.empty(() => {
			if (this.loading) return;
			if (this.error) return void p.c("an-empty", this.error === "no socket" || this.error === "no source"
				? "This list needs the dev server (a static copy has no one to ask). Today's sessions are on the page linked below."
				: "Could not ask the server: " + this.error);
			if (!rows.length) return void p.c("an-empty", "Nothing is running right now. The day's sessions are linked below.");
			rows.forEach(r => div.c("an-row" + (hot(r) ? "" : " an-quiet"), () => {
				div.c("an-top", () => {
					span.c("an-dot").attr("title", hot(r) ? "working now" : "quiet for a while");
					a.c("an-name").href(r.url).text(r.agent || r.title || r.id.slice(0, 8));
					span.c("an-usd", AINow.usd(r.usd));
				});
				if (r.doing && r.title && r.title !== r.agent) div.c("an-title", r.title);
				div.c("an-doing", r.doing || r.title || "(no log line yet)");
				div.c("an-sub", [age(r.last_activity), r.model].filter(Boolean).join(" · "));
			}));
		});
	}
}
