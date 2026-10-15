import { View, div, a, span, small, h2 } from "/framework/core/View/View.js";
import Browse from "/framework/ux/Browse/Browse.js";
import TaskStateLog from "./TaskStateLog.js";

View.stylesheet({ url: import.meta.url }, "tasks.css");

/** TasksPage's list: In flight, Queued, Landed today, from Server/TaskState.mjs, tailed live. Doc: doc/architecture.md */
export default class TasksPage extends Browse {
	key = "tasks";
	log = new TaskStateLog();

	static GROUPS = [
		{ key: "in_flight", title: "In flight", empty: "Nothing is working right now." },
		{ key: "queued", title: "Queued", empty: "Nothing is waiting." },
		{ key: "landed", title: "Landed today", empty: "Nothing has landed yet today." },
	];

	static when(iso){ return iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""; }
	static age_min(s){ return Math.round((Date.now() - Date.parse(s.at)) / 60000); }
	static quiet(r){ return r.quiet_min == null ? "" : r.quiet_min < 1 ? "just now" : r.quiet_min + " min ago"; }

	draw_list(){
		this.$rows = div.c("inbox-rows tasks-rows");
		this.draw();
	}

	start(){ this.log.live(() => this.draw()).then(() => this.draw());
		setInterval(() => this.draw(), 60000);   // only re-checks the age of the last line; the data itself is the stream
	}

	draw(){
		if (!this.$rows) return;
		const s = this.log.state;
		this.$rows.empty(() => {
			if (s && TasksPage.age_min(s) >= 3) div.c("tasks-note tasks-stale", () => span(`Not live: the last update was ${TasksPage.age_min(s)} min ago. Start node Server/TaskState.mjs --watch.`));
			if (!s) return div.c("tasks-note muted", () => span("No live task state yet: this page tails ai/tasks/state.jsonl, written while the dev server runs (node Server/TaskState.mjs --watch)."));
			TasksPage.GROUPS.forEach(g => this.group(g, s[g.key] ?? []));
		});
		this.router?.mark_links?.();
	}

	group(g, rows){
		div.c("tasks-group", () => {
			h2.c("tasks-group-head", () => { span(g.title); small.c("inbox-badge").text(String(rows.length)).el.hidden = !rows.length; });
			if (!rows.length) return small.c("tasks-empty muted", g.empty);
			rows.forEach(r => this.row(g.key, r));
		});
	}

	row(kind, r){
		const href = r.id ? this.url + r.id + "/" : null;
		(href ? a.c("inbox-row tasks-row").href(href) : div.c("inbox-row tasks-row")).append(() => {
			div.c("inbox-row-head flex gap-25", () => {
				if (r.quiet) span.c("tasks-warn").attr("title", `quiet for ${r.quiet_min} min`).text("⚠");
				span.c("inbox-row-title").text(r.title);
				small.c("inbox-row-when muted").text(kind === "landed" ? TasksPage.when(r.landed_at) : kind === "in_flight" ? TasksPage.quiet(r) : "");
			});
			const line = kind === "landed" ? r.line : [r.model, r.cost ? "$" + r.cost.toFixed(2) : null].filter(Boolean).join(" · ");
			if (line) div.c("inbox-row-foot", () => small.c("inbox-row-line muted").text(line));
		});
	}
}
