import { View, div, a, span, small, h1, h2 } from "/framework/core/View/View.js";
import DashState from "../rail/DashState.js";
import DashChips from "../rail/DashChips.js";

View.stylesheet({ url: import.meta.url }, "tasks.css");

/** The Lanes view: today's three columns (in flight, queued, landed today) over the same index.json the Inbox reads (DashState). Doc: doc/architecture.md */
export default class TaskLanes {
	static LANES = [
		{ key: "in_flight", title: "In flight", empty: "Nothing is working right now." },
		{ key: "queued", title: "Queued", empty: "Nothing is waiting." },
		{ key: "landed", title: "Landed today", empty: "Nothing has landed today." },
	];
	dash = new DashState();
	constructor(...args){ Object.assign(this, ...args); }

	static when(iso){ return iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""; }
	static quiet(r){ return r.quiet_min == null ? "" : r.quiet_min < 1 ? "just now" : r.quiet_min + " min ago"; }

	/** The way between the three task views: the list is the Inbox with the `tasks` chips (DashChips.SAVED). */
	static tabs(url, here){
		div.c("inbox-head", () => {
			div.c("doc-well", () => h1.c("doc-title h2", "Tasks"));
			div.c("tabs block", () => div.c("tab-bar", () => {
				a.c("tab").href(DashChips.saved("tasks")).text("List");
				a.c("tab" + (here === "lanes" ? " tab-default" : "")).href(url + "lanes/").text("Lanes");
				a.c("tab" + (here === "architecture" ? " tab-default" : "")).href(url + "architecture/").text("Architecture");
			}));
		});
	}

	mount(){
		this.$box = div.c("tasks-lanes");
		this.dash.on(() => this.draw());
		this.dash.start();
		return this;
	}

	draw(){
		const s = this.dash.full;
		this.$box.empty(() => {
			if (!s) return div.c("tasks-note muted", () => span("No task state yet: this page reads ai/index.json (node Server/AIIndex.mjs --watch writes it)."));
			TaskLanes.LANES.forEach(g => div.c("tasks-lane", () => {
				const rows = g.key === "landed" ? (s.landed ?? []).filter(r => !r.day || r.day === s.today) : (s[g.key] ?? []);
				h2.c("tasks-group-head", () => { span(g.title); small.c("inbox-badge").text(String(rows.length)); });
				if (!rows.length) small.c("tasks-empty muted", g.empty);
				rows.forEach(r => a.c("tasks-card" + (r.quiet ? " tasks-quiet" : "")).href(this.base + r.id + "/").append(() => {
					span.c("tasks-card-title").text((r.quiet ? "⚠ " : "") + r.title);
					small.c("muted").text(g.key === "landed" ? `${TaskLanes.when(r.landed_at)} · ${r.line}` : g.key === "in_flight" ? TaskLanes.quiet(r) : r.agent);
				}));
			}));
		});
		this.page.app?.router?.mark_links?.();
	}
}
