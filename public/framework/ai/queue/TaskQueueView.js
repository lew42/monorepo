import { View, div, span, a, p, h2 } from "/app.js";
import QueryClient from "/framework/ext/Query/QueryClient.js";
import TaskQueue from "/framework/core/Task/TaskQueue.js";

View.stylesheet(import.meta, "TaskQueueView.css");

/** TaskQueueView — the task queue, three views of the same ranked rows (`mode`):
 *    "top"     the page itself: the count, the per-big-thing split and the first few tasks as preview cards; a click opens that task
 *    "all"     ?view=all: every queued task, one row each (rank, task, why, cost, big thing, re-asks, state, score)
 *    "ranking" ?view=ranking: how the score is worked out (needs no rows)
 *    "dropped" ?view=dropped: every open task whose owner is not working (Servex/Dropped.js, read once from queue/dropped.json; also a short list on the page itself)
 *  Rows come from the dev server's "taskqueue" query source (Server/TaskQueue.mjs, ranked by core/Task/TaskQueue.js); a changed row is pushed, never polled. Readme: readme.md. */
export default class TaskQueueView extends View {
	static PREVIEWS = 8;
	static BIG = { 1: "See and approve the work", 2: "Every ask becomes a task that finishes", 3: "Agents that know the rules" };
	static RETRY = [1000, 2000, 4000, 8000];
	static usd(n){ return "$" + (n || 0).toFixed(2); }

	/** The view is in the address (?view=all, ?view=ranking), so a reload or Back lands in the same place. */
	get mode(){ const v = new URLSearchParams(location.search).get("view"); return v === "all" || v === "ranking" || v === "dropped" ? v : "top"; }

	get classes(){ return "tq-view block wide tq-" + this.mode; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set state in initialize().
	initialize(){
		this.rows = new Map();
		this.error = "";
		this.loaded = this.mode === "ranking";
		this.dropped = null;   // { at, dropped, rows } once queue/dropped.json has been read; null when there is no such file (a static copy)
		this.failed = false;
		this.client = new QueryClient("taskqueue", { row: r => this.change(r), stale: () => this.ask() });
		super.initialize();
	}

	render(){
		this.$side = div.c("tq-side");
		this.$main = div.c("tq-main");
		this.paint();
		if (this.mode !== "ranking") this.ask();
		this.read_dropped();
	}

	/** One read, not a poll: the snapshot Servex/Dropped.js rewrites every task-loop tick. Reload to refresh. No file = no section. */
	async read_dropped(){
		try { const res = await fetch("/framework/ai/queue/dropped.json", { cache: "no-store" }); if (res.ok) this.dropped = await res.json(); } catch {}
		try { const res = await fetch("/framework/ai/queue/done-check.json", { cache: "no-store" }); if (res.ok) this.done_check = await res.json(); } catch {}
		this.paint();
	}

	/** A count is drawn only from a successful answer. Until one arrives the page says "Reading…" and asks again, a few times with a growing delay; only then does it say what is wrong, with no number. */
	async ask(){
		if (this.asking) return;
		this.asking = true;
		for (let n = 0; ; n++){
			const res = await this.client.ask({ sort: { by: "score", dir: "desc" }, limit: 500 }, { timeout: 30000 });
			if (!res.error){
				this.error = ""; this.failed = false; this.loaded = true;
				this.rows = new Map(res.rows.map(r => [r.url, r]));
				break;
			}
			this.error = res.error;
			if (this.loaded) break;
			if (n >= TaskQueueView.RETRY.length){ this.failed = true; break; }
			this.paint();
			await new Promise(r => setTimeout(r, TaskQueueView.RETRY[n]));
		}
		this.asking = false;
		this.paint();
	}

	problem(){
		return this.error === "no socket" ? "This list needs the dev server (a static copy has no one to ask)."
			: this.error === "no source" ? "The dev server has not loaded the queue yet: it starts the next time the dev server restarts (Server/TaskQueue.mjs)."
			: this.error === "timeout" ? "The dev server is still reading the task records and has not answered after several tries. Reload in a minute."
			: "Could not ask the server: " + this.error;
	}

	change(r){ this.rows.set(r.url, r); this.paint(); }

	sorted(){ return [...this.rows.values()].sort((x, y) => y.score - x.score); }

	crumb(r){ const parts = String(r.parent ?? "").split("/").filter(Boolean); return [r.module, parts.at(-1)].filter(Boolean).join(" › "); }

	/** The triage note "serves priority N: <name>" only repeats the big-thing chip; a card shows a why only when it says more. */
	own_why(r){ return r.why && !/^serves priority \d+:/.test(r.why) ? r.why : ""; }

	state(r){ return r.state + (r.state === "running" && r.agent ? " · " + r.agent : ""); }

	paint(){
		if (this.el) this.el.dataset.ready = String(this.loaded);
		const all = this.sorted();
		this.$side.empty(() => this.mode === "ranking" || this.mode === "dropped" ? this.drawBack() : this.drawSide(all));
		this.$main.empty(() => {
			if (this.mode === "dropped") return void this.drawDropped(this.dropped?.rows ?? [], true);
			if (!this.loaded) return void p.c("tq-empty muted", this.failed ? this.problem() : "Reading the task records…");
			if (this.mode === "ranking") return void this.drawRanking();
			if (this.mode === "all") return void (all.length ? this.drawAll(all) : p.c("tq-empty muted", "Nothing is queued."));
			if (all.length) this.drawPreviews(all); else p.c("tq-empty muted", "Nothing is queued.");
			this.drawDropped((this.dropped?.rows ?? []).slice(0, TaskQueueView.PREVIEWS), false);
		});
	}

	drawBack(){
		h2.c("tq-h muted", "Task queue");
		a.c("tq-go").href("/framework/ai/queue/").attr("target", "_self").text("← Back to the top of the queue");
	}

	drawSide(all){
		h2.c("tq-h muted", "Queued tasks");
		if (!this.loaded) return void p.c("tq-note muted", this.failed ? this.problem() : "Reading the task records…");
		const total = all.length, n = f => all.filter(f).length;
		div.c("tq-big", () => { span.c("tq-count", String(total)); span.c("tq-what", total === 1 ? "task queued" : "tasks queued"); });
		div.c("tq-bigs", () => {
			[1, 2, 3].forEach(b => div.c("tq-bigrow", () => { span.c("tq-n", String(n(r => r.big === b))); span.c("tq-bname", `#${b} ${TaskQueueView.BIG[b]}`); }));
			div.c("tq-bigrow", () => { span.c("tq-n", String(n(r => !r.big))); span.c("tq-bname", "accepted earlier, no big thing"); });
		});
		p.c("tq-note muted", `${n(r => r.state === "running")} running, ${n(r => r.state === "waiting")} waiting on someone. Estimated cost of all: ${TaskQueueView.usd(all.reduce((s, r) => s + r.est_usd, 0))}.`);
		a.c("tq-go").href("/framework/ai/queue/?view=all").attr("target", "_self").text(`All ${total} ranked →`);
		if (this.dropped) a.c("tq-go tq-dropped-go").href("/framework/ai/queue/?view=dropped").attr("target", "_self").text(`${this.dropped.dropped} dropped →`);
		a.c("tq-go").href("/framework/ai/queue/?view=ranking").attr("target", "_self").text("How the ranking works →");
	}

	drawPreviews(all){
		const top = all.slice(0, TaskQueueView.PREVIEWS);
		div.c("tq-head", () => span.c("tq-what", `Next up: the top ${top.length}, best score first`));
		div.c("tq-cards", () => top.forEach(r => a.c("tq-card card tq-" + r.state).href(r.url).append(() => {
			div.c("tq-cardtop", () => { span.c("tq-rank", "#" + r.rank); span.c("tq-state", this.state(r)); });
			div.c("tq-title", r.title);
			if (this.own_why(r)) div.c("tq-why", r.why);
			div.c("tq-chips muted", () => {
				span.c("tq-chip", TaskQueueView.usd(r.est_usd)).attr("title", r.est_basis);
				span.c("tq-chip", TaskQueueView.BIG[r.big] ?? "No big thing").attr("title", r.big ? `Big thing #${r.big}` : "accepted before the three big things");
				span.c("tq-chip", this.crumb(r));
			});
		})));
	}

	drawAll(all){
		div.c("tq-head", () => span.c("tq-what", `All ${all.length}, best score first`));
		div.c("tq-cols muted", () => ["#", "Task and where it lives", "Why", "Cost", "Big", "Re-asks", "State", "Score"].forEach(h => span.c("tq-colh", h)));
		div.c("tq-list", () => all.forEach(r => div.c("tq-row tq-" + r.state, () => {
			span.c("tq-rank muted", String(r.rank));
			div.c("tq-task", () => {
				a.c("tq-title").href(r.url).text(r.title);
				div.c("tq-crumb muted", this.crumb(r));
			});
			div.c("tq-meta", () => {
				div.c("tq-why", () => {
					if (r.why) span(r.why + " ");
					if (r.why_url) a.c("tq-link").href(r.why_url).text(r.why ? "(source)" : "the owner's ask");
					else if (!r.why) span("no source recorded");
				});
				div.c("tq-cell", () => { span.c("tq-label muted", "Cost "); span(TaskQueueView.usd(r.est_usd)); }).attr("title", r.est_basis);
				div.c("tq-cell", () => { span.c("tq-label muted", "Big thing "); span(r.big ? `#${r.big}` : "none"); }).attr("title", TaskQueueView.BIG[r.big] ?? "accepted before the three big things");
				div.c("tq-cell", () => { span.c("tq-label muted", "Re-asked "); span(r.re_asks + "×"); });
				div.c("tq-state", this.state(r));
			});
			span.c("tq-score").attr("title", "importance × (1 + 0.5 × re-asks) ÷ (1 + estimate ÷ $2)").text(r.score.toFixed(2));
		})));
	}

	/** Dropped: an open task nobody is working (owner stopped, dormant, gone or never assigned, or a deferral with no home or past its time). Computed by code, doc: core/Task/doc/completion.md. */
	drawDropped(rows, full){
		if (!this.dropped) return void (full && p.c("tq-empty muted", "Reading the dropped list… (needs the dev server and a task-loop tick; it appears within 5 minutes of a Servex start)"));
		this.drawRed();
		this.drawProof(full);
		div.c("tq-head tq-dropped", () => span.c("tq-what", full ? `${this.dropped.dropped} dropped, as of ${this.dropped.at}` : `Dropped: ${this.dropped.dropped} open tasks nobody is working`));
		if (!rows.length) return void p.c("tq-empty muted", "Nothing is dropped.");
		div.c("tq-list", () => rows.forEach(r => div.c("tq-row tq-dropped-row", () => {
			div.c("tq-task", () => { a.c("tq-title").href(r.url).text(r.title); div.c("tq-crumb muted", r.owner ? `owner ${r.owner}` : "no owner"); });
			div.c("tq-meta", () => { div.c("tq-why", r.why); div.c("tq-state", r.code); div.c("tq-cell muted", `quiet ${r.quiet_min} min`); });
		})));
		if (!full && this.dropped.dropped > rows.length) a.c("tq-go").href("/framework/ai/queue/?view=dropped").attr("target", "_self").text(`All ${this.dropped.dropped} dropped →`);
	}

	/** Completed owner asks with no outcome or evidence (code, Dropped.js) and asks Haiku judged "marked done, not done" (Server/DoneCheck.mjs). Reopen from the task's page. */
	drawProof(full){
		const none = this.dropped?.unproven ?? [], bad = this.done_check?.flagged ?? [], cap = full ? 500 : 5;
		const list = (head, rows, why) => { if (!rows.length) return;
			div.c("tq-head tq-dropped", () => span.c("tq-what", head));
			div.c("tq-list", () => rows.slice(0, cap).forEach(r => div.c("tq-row tq-dropped-row", () => {
				div.c("tq-task", () => { a.c("tq-title").href(r.url).text(r.title); div.c("tq-crumb muted", "completed owner ask"); });
				div.c("tq-meta", () => div.c("tq-why", why(r)));
			}))); };
		list(`${none.length} completed owner asks with no proof`, none, r => r.why);
		list(`${bad.length} marked done, not done`, bad, r => r.why);
	}

	/** A session whose owner asks are more than 20% deferred or stopped (Task.rates(), flagged by Servex/Dropped.js). */
	drawRed(){
		const red = this.dropped?.red ?? [];
		if (!red.length) return;
		div.c("tq-list tq-red", () => red.forEach(r => div.c("tq-row tq-dropped-row", () => {
			div.c("tq-task", () => { a.c("tq-title").href(r.url).text(r.title); div.c("tq-crumb muted", "red-flagged session"); });
			div.c("tq-meta", () => div.c("tq-why", `${Math.round(r.rates.owner.rate * 100)}% of ${r.rates.owner.total} owner asks are deferred or stopped (${r.rates.owner.deferred} deferred, ${r.rates.owner.stopped} stopped); the limit is 20%`));
		})));
	}

	drawRanking(){
		const I = TaskQueue.IMPORTANCE;
		div.c("tq-head", () => span.c("tq-what", "How the ranking works"));
		p.c("tq-formula", "score = importance × (1 + re-asks × 0.5) ÷ (1 + estimated cost ÷ $2)");
		div.c("tq-rules", () => {
			div.c("tq-rule", () => { span.c("tq-label muted", "Importance "); span(`the big thing it serves: #1 = ${I[1]}, #2 = ${I[2]}, #3 = ${I[3]}, none = 1 (priority.md)`); });
			div.c("tq-rule", () => { span.c("tq-label muted", "Cost "); span("the median real cost of the 5 landed tasks with the most title words in common (else the module median)"); });
			div.c("tq-rule", () => { span.c("tq-label muted", "Re-asks "); span("sessions that asked for it again while it stayed unfinished (the refined asks)"); });
		});
		p.c("tq-note muted", "Every number is computed from the task records, never written by an agent. It updates live.");
	}
}
