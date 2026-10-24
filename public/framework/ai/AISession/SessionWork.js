import { View, div, span, small, strong, a, button, details, summary } from "/app.js";
import Task from "/framework/core/Task/Task.js";
import SessionTree from "../sessions/doc/variants/SessionTree.js";
import TimeFilter from "/framework/ux/Filter/TimeFilter.js";
import Approvals from "./Approvals.js";
import Review from "./Review.js";
import Day from "/framework/core/Session/Day.js";
import { names } from "/framework/core/Router/listing.js";

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
		this.$bar = div.c("sw-head-top", () => { this.pill = TimeFilter.add({}); });   // no title here: the page head already shows it
		this.$head = div.c("sw-head");
		this.$list = div.c("sw-list");
		this.pill.watch(this.$list);
		this.streams = new Map();
		this.load();
	}

	async load(){
		const m = /sessions\/(\d{4}\/\d{2}\/\d{2})\/([^/]+)\/?$/.exec(this.dir ?? "");
		this.tree = m ? await SessionTree.load(m[1], m[2]).catch(() => null) : null;
		if (!this.tree) return this.$list.empty(() => small.c("muted", "No task records for this session."));
		if (!this.tree.snap && this.snap) this.tree.snap = this.snap;   // the session's own snapshot, filed under a later day than its folder
		await this.find_snaps(m[1]);
		await this.find_titles();
		const root = this.tree.root;
		if (this.tree.snap){ root.title = this.tree.snap.title || root.title; root.usd = this.tree.snap.usd ?? root.usd; }
		const snaps = [this.tree.snap, ...this.tree.root.all().map(n => n.snap)].filter(Boolean);
		for (const day of new Set(snaps.map(s => (s.day ?? "").replaceAll("-", "/")).filter(Boolean))){
			const st = Approvals.of_day(day); st.on(() => this.paint()); this.streams.set(day, st);
		}
		this.paint();
	}

	/** A task's agent session is filed under the day of its LAST activity, often later than the folder's day: read every day file from the folder's day to today (at most 31) and join by id, so its cost and Approve show. */
	async find_snaps(day){
		const want = this.tree.root.all().filter(n => n.session && !n.snap);
		if (!want.length) return;
		const base = new Date(day.replaceAll("/", "-") + "T12:00:00"), today = Day.of(), by_id = new Map();
		for (let i = 0; i <= 31; i++){
			const d = Day.of(new Date(base.getTime() + i * 864e5)); if (d > today) break;
			const res = await fetch(`/framework/ai/sessions/${Day.path(d)}/index.json`).catch(() => null);
			const json = res?.ok && !(res.headers.get("content-type") ?? "").includes("html") ? await res.json().catch(() => null) : null;
			json?.snapshots?.forEach(s => by_id.set(s.id, s));
		}
		want.forEach(n => { const s = by_id.get(n.session); if (s){ n.snap = s; n.usd = s.usd ?? null; } });
		if (!this.tree.snap) this.tree.snap = by_id.get(this.id) ?? null;
	}

	/** ai/index.json falls back to the folder name when a record has no title (Server/AIIndex.mjs); an agent's launch line names its card, so read that instead, and give a plain folder a capital at least. */
	async find_titles(){
		const slugs = this.tree.root.all().slice(1).filter(n => n.title === n.rel.split("/").pop().replaceAll("-", " "));
		await Promise.all(slugs.map(async n => {
			const listed = names(n.url);   // the folder says which record it keeps, so no fetch asks for a file that is not there
			const file = listed ? ["session.jsonl", "task.jsonl"].find(f => listed.includes(f)) : n.session ? "session.jsonl" : null;
			const text = file ? await fetch(n.url + file).then(r => r.ok ? r.text() : "").catch(() => "") : "";
			let card = null; try { card = JSON.parse(text.split("\n", 1)[0])?.assign?.card; } catch {}
			n.title = card || n.title[0].toUpperCase() + n.title.slice(1);
		}));
	}

	approval(snap){ return snap ? this.streams.get((snap.day ?? "").replaceAll("-", "/"))?.of(snap.id) ?? null : null; }

	/** Figures for one node and everything under it. */
	figures(n){
		const all = n.all(), below = all.slice(1), rolled = all.reduce((t, k) => t + (k.usd ?? 0), 0);
		const last = Math.max(0, ...all.map(k => Date.parse(k.ended ?? "") || 0));
		const open = below.filter(k => !SessionWork.DONE.includes(k.state) && !k.kids.some(c => !SessionWork.DONE.includes(c.state)));
		return { own: n.usd ?? 0, rolled, last, progress: Task.progress_of(below.filter(k => k.state !== "stopped")), open };   // a stopped task is dropped, not counted (mobile-cards.md)
	}

	/** approved (itself or above), live, leak, waiting: Review's numbers. */
	judge(n, up, now = Date.now()){
		const f = this.figures(n), own = this.approval(n.snap ?? (n === this.tree.root ? this.tree.snap : null));
		n.approved = own ?? up ?? null;
		n.review = Review.state({ approved: n.approved, finished: SessionWork.DONE.includes(n.state), rolled: f.rolled, last: f.last }, now);
		n.kids.forEach(k => this.judge(k, n.approved, now));
	}

	paint(){
		const root = this.tree.root;
		this.judge(root, null);
		let top = root; while (top.kids.length === 1 && top.kids[0].kids.length) top = top.kids[0];   // a lone wrapping folder (sessions-and-tasks/) is not a level
		const f = this.figures(root), kids = top.kids, t = { approved: 0, waiting: 0, leak: 0 };
		root.all().slice(1).forEach(n => t[Review.bucket(n.review)] += n.usd ?? 0);
		this.$head.empty(() => {
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
