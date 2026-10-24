import { View, div, span, a, p, h2 } from "/app.js";
import QueryClient from "/framework/ext/Query/QueryClient.js";
import TaskQueue from "/framework/core/Task/TaskQueue.js";

View.stylesheet(import.meta, "TaskQueueView.css");

/** TaskQueueView — the top of the task queue. Beside the list: how many are queued, per big thing, and the one score formula with its numbers.
 *  The list: one row per task (rank, task and breadcrumb, why, estimated cost, priority, re-asks, state, score); a card per task on a phone, columns when wide.
 *  Rows come from the dev server's "taskqueue" query source (Server/TaskQueue.mjs, ranked by core/Task/TaskQueue.js); a changed row is pushed, never polled. Readme: readme.md. */
export default class TaskQueueView extends View {
	static LIMIT = 20;
	static BIG = { 1: "See and approve the work", 2: "Every ask becomes a task that finishes", 3: "Agents that know the rules" };
	static usd(n){ return "$" + (n || 0).toFixed(2); }

	get classes(){ return "tq-view"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){
		this.rows = new Map();
		this.error = "";
		this.loading = true;
		this.client = new QueryClient("taskqueue", { row: r => this.change(r), stale: () => this.ask() });
		super.initialize();
	}

	render(){
		this.$side = div.c("tq-side");
		this.$main = div.c("tq-main", () => {
			this.$head = div.c("tq-head");
			this.$cols = div.c("tq-cols", () => ["#", "Task and where it lives", "Why", "Cost", "Big", "Re-asked", "State", "Score"].forEach(h => span.c("tq-colh", h)));
			this.$list = div.c("tq-list");
		});
		this.paint();
		this.ask();
	}

	async ask(){
		const res = await this.client.ask({ sort: { by: "score", dir: "desc" }, limit: 500 }, { timeout: 30000 });
		this.loading = false;
		if (res.error){ this.error = res.error; return this.paint(); }
		this.error = ""; this.rows = new Map(res.rows.map(r => [r.id, r]));
		this.paint();
	}

	change(r){ this.rows.set(r.id, r); this.paint(); }

	top(){ return [...this.rows.values()].sort((x, y) => y.score - x.score).slice(0, TaskQueueView.LIMIT); }

	crumb(r){ const parts = String(r.parent ?? "").split("/").filter(Boolean); return [r.module, parts.at(-1)].filter(Boolean).join(" › "); }

	paint(){
		const rows = this.top(), all = [...this.rows.values()], total = all.length;
		if (this.el) this.el.dataset.ready = String(!this.loading);
		this.$side.empty(() => {
			h2.c("tq-h", "What is in the queue");
			if (this.loading) return void p.c("tq-note", "Reading the task records…");
			div.c("tq-big", () => { span.c("tq-count", String(total)); span.c("tq-what", total === 1 ? " task queued" : " tasks queued"); });
			div.c("tq-bigs", () => [1, 2, 3].forEach(b => div.c("tq-bigrow", () => {
				span.c("tq-n", String(all.filter(r => r.big === b).length));
				span.c("tq-bname", `#${b} ${TaskQueueView.BIG[b]}`);
			})));
			div.c("tq-bigrow", () => { span.c("tq-n", String(all.filter(r => !r.big).length)); span.c("tq-bname", "accepted earlier, no big thing"); });
			p.c("tq-note", `The top ${rows.length} are listed. Estimates add up to ${TaskQueueView.usd(rows.reduce((n, r) => n + r.est_usd, 0))}; ${all.filter(r => r.state === "running").length} running, ${all.filter(r => r.state === "waiting").length} waiting on someone.`);
			h2.c("tq-h", "How it is ranked");
			p.c("tq-formula", "score = importance × (1 + re-asks × 0.5) ÷ (1 + estimated cost ÷ $2)");
			div.c("tq-rules", () => {
				div.c("tq-rule", () => { span.c("tq-label", "Importance "); span(`the big thing it serves: #1 = ${TaskQueue.IMPORTANCE[1]}, #2 = ${TaskQueue.IMPORTANCE[2]}, #3 = ${TaskQueue.IMPORTANCE[3]}, none = 1 (priority.md)`); });
				div.c("tq-rule", () => { span.c("tq-label", "Cost "); span("the median cost of landed tasks in the same module (real cost lines)"); });
				div.c("tq-rule", () => { span.c("tq-label", "Re-asks "); span("sessions that asked for it again while it stayed unfinished (the refined asks)"); });
			});
			p.c("tq-note", "Every number is computed from the task records, never written by an agent. It updates live.");
		});
		this.$head.empty(() => {
			if (this.loading) return;
			span.c("tq-what", `Top ${rows.length} of ${total}, best score first`);
		});
		this.$list.empty(() => {
			if (this.loading) return;
			if (this.error) return void p.c("tq-empty", this.error === "no socket" || this.error === "no source"
				? "This list needs the dev server (a static copy has no one to ask)."
				: "Could not ask the server: " + this.error);
			if (!rows.length) return void p.c("tq-empty", "Nothing is queued.");
			rows.forEach(r => div.c("tq-row tq-" + r.state, () => {
				span.c("tq-rank", String(r.rank));
				div.c("tq-task", () => {
					a.c("tq-title").href(r.url).text(r.title);
					div.c("tq-crumb", this.crumb(r));
				});
				div.c("tq-meta", () => {
					div.c("tq-why", () => r.why_url ? a.c("tq-link").href(r.why_url).text("the owner's ask").attr("title", r.why) : span("no source recorded"));
					div.c("tq-cell", () => { span.c("tq-label", "Cost "); span(TaskQueueView.usd(r.est_usd)); }).attr("title", r.est_basis);
					div.c("tq-cell", () => { span.c("tq-label", "Big thing "); span(r.big ? `#${r.big}` : "none"); }).attr("title", TaskQueueView.BIG[r.big] ?? "accepted before the three big things");
					div.c("tq-cell", () => { span.c("tq-label", "Re-asked "); span(r.re_asks + "×"); });
					div.c("tq-state", r.state + (r.state === "running" && r.agent ? " · " + r.agent : ""));
				});
				span.c("tq-score").attr("title", "importance × (1 + 0.5 × re-asks) ÷ (1 + estimate ÷ $2)").text(r.score.toFixed(2));
			}));
		});
	}
}
