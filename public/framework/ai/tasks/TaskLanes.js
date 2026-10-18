import { View, div, a, span, small, h2 } from "/framework/core/View/View.js";
import TaskStateLog from "./TaskStateLog.js";
import TasksPage from "./TasksPage.js";

/** The alternate view of the same state: three columns side by side, so all of today reads at one glance. */
export default class TaskLanes {
	log = new TaskStateLog();
	constructor(...args){ Object.assign(this, ...args); }

	mount(){
		this.$box = div.c("tasks-lanes");
		this.log.live(() => this.draw()).then(() => this.draw());
		return this;
	}

	draw(){
		const s = this.log.state;
		this.$box.empty(() => {
			if (!s) return div.c("tasks-note muted", () => span("No live task state yet (node Server/TaskState.mjs --watch)."));
			TasksPage.GROUPS.forEach(g => div.c("tasks-lane", () => {
				const rows = g.key === "landed" ? (s.landed ?? []).filter(r => !r.day || r.day === s.today) : (s[g.key] ?? []);   // the lanes show today only
				h2.c("tasks-group-head", () => { span(g.key === "landed" ? "Landed today" : g.title); small.c("inbox-badge").text(String(rows.length)); });
				if (!rows.length) small.c("tasks-empty muted", g.empty);
				rows.forEach(r => a.c("tasks-card" + (r.quiet ? " tasks-quiet" : "")).href(this.base + r.id + "/").append(() => {
					span.c("tasks-card-title").text((r.quiet ? "⚠ " : "") + r.title);
					small.c("muted").text(g.key === "landed" ? `${TasksPage.when(r.landed_at)} · ${r.line}` : g.key === "in_flight" ? TasksPage.quiet(r) : r.agent);
				}));
			}));
		});
		this.page.app?.router?.mark_links?.();
	}
}
