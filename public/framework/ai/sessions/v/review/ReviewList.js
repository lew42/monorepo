import { div, span, strong, small, button, icon } from "/framework/core/View/View.js";
import MobileAll from "../mobile/MobileAll.js";
import MobileData from "../mobile/MobileData.js";
import TimeFilter from "/framework/ux/Filter/TimeFilter.js";
import Approvals from "../../../AIDashboard/Approvals.js";
import Review from "../../../AIDashboard/Review.js";
import ReviewRow from "./ReviewRow.js";

/* The owner's review of recent sessions: every session nested under the one that spawned it, the last day by default
   (a Today ▾ pill picks Week, Month, Year), each with its state (approved, working, waiting, leak in red), an Approve button,
   and the window's approved / waiting / leaking dollars. Extends the phone variant's nested list (v/mobile, MobileAll). Doc: readme.md here. */
export default class ReviewList extends MobileAll {
	static Row = ReviewRow;
	static ORDER = ["leak", "waiting", "live", "approved"];
	static WINDOW = { today: 1, week: 7, month: 30, year: 60 };   // days read; "year" stops at 60 day files for now

	constructor(...args){ super({ title: "Review", icon: "fact_check", classes: "mob-page rv-page", width: "full", description: "Recent sessions, nested, with Approve and the leaks in red." }, ...args); }

	get when(){ const w = new URLSearchParams(location.search).get("when"); return w in ReviewList.WINDOW ? w : "today"; }
	get days(){ return ReviewList.WINDOW[this.when]; }
	get end(){ return new Date(); }

	content(){ this.$out = div.c("rv-day"); this.load(this.$out); }

	/** The parent of a row: session-tree.json's, else the snapshot's `parent` agent name joined to the session that agent ran. */
	parent_of(r, tree, by_id, by_agent){
		const up = MobileData.parent(r.snap, tree);
		if (up && up !== r.snap.id && by_id.has(up)) return up;
		const named = r.snap.parent && by_agent.get(r.snap.parent);
		return named && named !== r.snap.id ? named : null;
	}

	async load(out){
		const [rows, tree] = [await this.rows(), await MobileData.tree()];
		const by_id = new Map(rows.map(r => [r.snap.id, r])), by_agent = new Map(rows.filter(r => r.snap.agent).map(r => [r.snap.agent, r.snap.id]));
		const kids = new Map();
		rows.forEach(r => { r.page = this; r.kids = []; r.snap = { ...r.snap, dir: MobileData.dir_day(r.snap) }; });
		for (const r of rows){
			const up = this.parent_of(r, tree, by_id, by_agent);
			if (up && by_id.has(up)){ r.up = by_id.get(up); r.up.kids.push(r); (kids.get(up) ?? kids.set(up, []).get(up)).push(r); }
		}
		const top = rows.filter(r => !r.up).sort((a, b) => String(b.snap.last_activity).localeCompare(String(a.snap.last_activity)));
		top.forEach(r => this.settle(r));
		this.view = { rows, top, kids, tree };
		await this.approvals(rows);
		this.paint();
	}

	/** Rolled-up cost and the last activity of a row and everything under it. */
	settle(r){
		r.kids.forEach(k => this.settle(k));
		r.own = r.snap.usd ?? 0;
		r.rolled = r.own + r.kids.reduce((t, k) => t + k.rolled, 0);
		r.last = Math.max(Date.parse(r.snap.last_activity ?? "") || 0, ...r.kids.map(k => k.last));
	}

	/** One Approvals stream per creation day in the window; each repaints when a line arrives. */
	async approvals(rows){
		this.streams ??= new Map();
		for (const day of new Set(rows.map(r => r.snap.dir))) if (day && !this.streams.has(day)){
			const a = Approvals.of_day(day);
			a.on(() => this.view && this.paint());
			this.streams.set(day, a);
		}
	}
	approval(r){ return this.streams.get(r.snap.dir)?.of(r.snap.id) ?? null; }

	/** The same rule as Review (ai/AIDashboard/Review.js): approved (itself or a parent), working (active in the last hour), leak, waiting. */
	judge(r, up_approved = null, now = Date.now()){
		const own = this.approval(r);
		r.approved = own ?? up_approved;
		r.by_parent = !own && !!r.approved;
		r.finished = r.snap.state !== "active" && now - r.last >= Review.FINISHED_MS;
		r.state = r.approved ? "approved" : !r.finished ? "live" : r.rolled > Review.LEAK_USD && now - r.last >= Review.LEAK_AGE_MS ? "leak" : "waiting";
		r.kids.forEach(k => this.judge(k, r.approved, now));
	}

	paint(){
		const { rows, top, kids, tree } = this.view;
		top.forEach(r => this.judge(r));
		const rank = r => ReviewList.ORDER.indexOf(r.state);
		top.sort((a, b) => rank(a) - rank(b) || b.last - a.last);   // what needs you first: leaks, then waiting, working, approved
		this.$out.empty(() => div.c("rv-grid", () => {
			this.review_head(rows, top);
			div.c("mob-card rv-list", () => {
				div.c("mob-card-head", () => { icon("account_tree").ac("mob-group-icon"); strong("Sessions"); small.c("mob-count", `${top.length} · ${rows.length} with the ones they spawned`); });
				if (!rows.length) div.c("mob-empty", "No sessions in this window.");
				this.page_of(top, kids, tree, this.constructor.PAGE);
			});
		}));
	}

	/** The head card: the window pill, the three totals, Approve all. */
	review_head(rows, top){
		const t = { approved: 0, waiting: 0, leak: 0 }, n = { approved: 0, waiting: 0, leak: 0 };
		rows.forEach(r => { const k = r.state === "live" ? "waiting" : r.state; t[k] += r.own; n[k]++; });
		const ready = top.filter(r => r.finished && !r.approved);
		div.c("mob-card rv-head", () => {
			div.c("mob-card-head rv-head-top", () => {
				strong("Review");
				TimeFilter.add({ changed: () => this.load(this.$out) });
				small.c("mob-head-sub", `${rows.length} sessions · ${MobileData.usd(top.reduce((s, r) => s + r.rolled, 0))}`);
			});
			div.c("rv-stats", () => {
				for (const [k, label] of [["approved", "approved"], ["waiting", "waiting"], ["leak", "leaking"]])
					div.c("rv-stat rv-stat-" + k + (t[k] > 0 ? " rv-stat-some" : ""), () => { span.c("rv-stat-usd", MobileData.usd(t[k])); small(`${label} · ${n[k]}`); }).attr("title", Review.STATES[k]?.hint ?? "");
			});
			if (ready.length) button.c("rv-approve rv-approve-all", `Approve all finished · ${ready.length} · ${MobileData.usd(ready.reduce((s, r) => s + r.rolled, 0))}`)
				.attr("type", "button").attr("title", "Approve every finished session not approved yet, and everything under each").click(e => { e.target.disabled = true; this.approve(ready); });
			this.$note = div.c("rv-note");
		});
	}

	/** One approve line in each session's own record, plus its pointer in that day's log (Approvals). */
	async approve(list){
		const by_day = new Map();
		list.forEach(r => (by_day.get(r.snap.dir) ?? by_day.set(r.snap.dir, []).get(r.snap.dir)).push(r.snap));
		const ok = (await Promise.all([...by_day].map(([day, snaps]) => this.streams.get(day)?.approve(snaps)))).every(Boolean);
		this.paint();
		if (!ok) this.$note.text("Not saved: approving writes the session's own record, which needs the local dev server.");
	}
}
