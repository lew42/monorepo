import { View, div, span, small, strong, a, button, details, summary } from "/app.js";
import Task from "/framework/core/Task/Task.js";
import SessionTree from "../sessions/doc/variants/SessionTree.js";
import TimeFilter from "/framework/ux/Filter/TimeFilter.js";
import Approvals from "./Approvals.js";
import Review from "./Review.js";

View.stylesheet(import.meta, "SessionWork.css");

/** SessionWork — the Work tab of a session's page: everything the session set going, nested the way the task folders nest
 *  (a child's record lives inside its parent's folder; SessionTree reads them from ai/index.json). Each row: plain title, own and
 *  rolled-up cost, duration, tasks complete of created (Task.progress_of: only `complete` counts), the open tasks; its state
 *  (Review's rule) and Approve (Approvals). The head adds the Today ▾ pill and Approve all. `dir` = the session's folder url. */
export default class SessionWork extends View {
	static OPEN = 3;     // open task titles shown per row
	static DONE = ["complete", "stopped"];
	get classes(){ return "sw"; }

	render(){
		this.$head = div.c("sw-head");
		this.$list = div.c("sw-list");
		this.streams = new Map();
		this.load();
	}

	async load(){
		const m = /sessions\/(\d{4}\/\d{2}\/\d{2})\/([^/]+)\/?$/.exec(this.dir ?? "");
		this.tree = m ? await SessionTree.load(m[1], m[2]).catch(() => null) : null;
		if (!this.tree) return this.$list.empty(() => small.c("muted", "No task records for this session."));
		if (!this.tree.snap && this.snap) this.tree.snap = this.snap;   // the session's own snapshot, filed under a later day than its folder
		const root = this.tree.root;
		if (this.tree.snap){ root.title = this.tree.snap.title || root.title; root.usd = this.tree.snap.usd ?? root.usd; }
		const snaps = [this.tree.snap, ...this.tree.root.all().map(n => n.snap)].filter(Boolean);
		for (const day of new Set(snaps.map(s => (s.day ?? "").replaceAll("-", "/")).filter(Boolean))){
			const st = Approvals.of_day(day); st.on(() => this.paint()); this.streams.set(day, st);
		}
		this.paint();
	}

	approval(snap){ return snap ? this.streams.get((snap.day ?? "").replaceAll("-", "/"))?.of(snap.id) ?? null : null; }

	/** Figures for one node and everything under it. */
	figures(n){
		const all = n.all(), below = all.slice(1), rolled = all.reduce((t, k) => t + (k.usd ?? 0), 0);
		const last = Math.max(0, ...all.map(k => Date.parse(k.ended ?? "") || 0));
		const open = below.filter(k => !SessionWork.DONE.includes(k.state) && !k.kids.some(c => !SessionWork.DONE.includes(c.state)));
		return { own: n.usd ?? 0, rolled, last, progress: Task.progress_of(below), open };
	}

	/** approved (itself or above), live, leak, waiting: Review's numbers. */
	judge(n, up, now = Date.now()){
		const f = this.figures(n), own = this.approval(n.snap ?? (n === this.tree.root ? this.tree.snap : null));
		n.approved = own ?? up ?? null;
		const live = !SessionWork.DONE.includes(n.state) && now - f.last < Review.FINISHED_MS;
		n.review = n.approved ? "approved" : live ? "live" : f.rolled > Review.LEAK_USD && now - f.last >= Review.LEAK_AGE_MS ? "leak" : "waiting";
		n.kids.forEach(k => this.judge(k, n.approved, now));
	}

	paint(){
		const root = this.tree.root;
		this.judge(root, null);
		let top = root; while (top.kids.length === 1 && top.kids[0].kids.length) top = top.kids[0];   // a lone wrapping folder (sessions-and-tasks/) is not a level
		const f = this.figures(root), kids = top.kids, t = { approved: 0, waiting: 0, leak: 0 };
		root.all().slice(1).forEach(n => t[n.review === "live" ? "waiting" : n.review] += n.usd ?? 0);
		this.$head.empty(() => {
			div.c("sw-head-top", () => {
				strong.c("sw-title", root.title);
				TimeFilter.add({ root: this.$list });
			});
			this.facts(root, f, true);
			div.c("sw-stats", () => [["approved", "approved"], ["waiting", "waiting"], ["leak", "leaking"]].forEach(([k, label]) =>
				div.c("sw-stat sw-stat-" + k + (t[k] > 0 ? " sw-some" : ""), () => { strong("$" + t[k].toFixed(2)); small(label); }).attr("title", Review.STATES[k]?.hint ?? "")));
			if (this.tree.snap && !root.approved) button.c("sw-approve sw-approve-all", "Approve all: this session and everything in it").attr("type", "button")
				.click(e => { e.target.disabled = true; this.approve([this.tree.snap]); });
			const gap = root.all().slice(1).filter(n => n.session && !n.snap).length;
			if (gap) small.c("sw-gap muted", `${gap} task${gap > 1 ? "s" : ""} ran in sessions filed under another day: their cost and Approve are not shown here yet.`);
			this.$note = div.c("sw-note");
		});
		this.$list.empty(() => {
			if (!kids.length) small.c("muted", "No tasks recorded in this session.");
			kids.forEach(k => this.node(k));
		});
	}

	/** One row; its children fold under it. `data-at` (its subtree's last moment) is what the Today pill reads. */
	node(n){
		const f = this.figures(n);
		const box = (n.kids.length ? details : div).c("sw-node sw-" + n.review, () => {
			const line = () => div.c("sw-row", () => {
				span.c("sw-dot");
				div.c("sw-body", () => {
					a.c("sw-name", n.title || n.rel).href(n.url ?? "#");
					this.facts(n, f);
				});
				if (n.snap && !n.approved) button.c("sw-approve", "Approve").attr("type", "button").attr("title", "Approve this and everything under it")
					.click(e => { e.preventDefault(); e.target.disabled = true; this.approve([n.snap]); });
			});
			if (n.kids.length){ summary.c("sw-sum", line); div.c("sw-kids", () => n.kids.forEach(k => this.node(k))); }
			else line();
		});
		if (f.last) box.el.dataset.at = f.last;
	}

	/** The figures line, the state, and the open tasks by title. */
	facts(n, f, head = false){
		const p = f.progress, cost = f.rolled > f.own ? `$${f.own.toFixed(2)} own · $${f.rolled.toFixed(2)} with ${n.all().length - 1} below` : `$${f.own.toFixed(2)}`;
		small.c("sw-facts", [cost, SessionTree.dur(n.ms()), p.total ? `${p.done} of ${p.total} tasks complete` : "no tasks recorded", !head && (n.approved ? "approved" : Review.STATES[n.review]?.label)].filter(Boolean).join(" · "));
		if (f.open.length) small.c("sw-open", "Open: " + f.open.slice(0, SessionWork.OPEN).map(k => k.title).join(" · ") + (f.open.length > SessionWork.OPEN ? ` · +${f.open.length - SessionWork.OPEN} more` : ""));
	}

	async approve(snaps){
		const ok = (await Promise.all(snaps.map(s => this.streams.get((s.day ?? "").replaceAll("-", "/"))?.approve([s])))).every(Boolean);
		this.paint();
		if (!ok) this.$note.text("Not saved: approving writes the session's own record, which needs the local dev server.");
	}
}
