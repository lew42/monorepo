import { div, button, small, strong, details, summary, icon } from "/framework/core/View/View.js";
import MobileHome from "./MobileHome.js";
import MobileData from "./MobileData.js";
import MobileRow from "./MobileRow.js";

/* Page 2, every recent session nested by parent: a spawned session sits inside the session that spawned it, collapsed under
   a count ("+6 minions"). The parent of each session is session-tree.json's (MobileData.parent); a child whose parent is
   not in the list stays at the top, so nothing disappears. */
export default class MobileAll extends MobileHome {

	static DAYS = 7;
	static PAGE = 40;   // top-level rows drawn at once; "show more" adds the next page
	mode = "all";

	/** How many days back: `?days=30` in the url, else DAYS. */
	get days(){ return Math.min(60, +new URLSearchParams(location.search).get("days") || this.constructor.DAYS); }
	/** `?end=2026-10-08` looks back from that day instead of today (the parent data of the last two weeks is stale: see the readme). */
	get end(){ const e = new URLSearchParams(location.search).get("end"); return e ? new Date(e + "T12:00:00") : new Date(); }
	head_info(){ return { title: this.end.toDateString() === new Date().toDateString() ? this.days === 1 ? "Today" : `Last ${this.days} days` : `${this.days} d to ${new URLSearchParams(location.search).get("end")}` }; }

	async rows(){
		const snaps = await MobileData.days(this.days, this.end);
		return Promise.all(snaps.map(async snap => { const tasks = await MobileData.tasks(snap).catch(() => null); return { snap, tasks, group: MobileData.group(snap, tasks) }; }));
	}

	async load(out){
		const [rows, tree] = [await this.rows(), await MobileData.tree()];
		const by_id = new Map(rows.map(r => [r.snap.id, r]));
		const kids = new Map();
		for (const r of rows){
			const up = MobileData.parent(r.snap, tree);
			if (up && up !== r.snap.id && by_id.has(up)) (kids.get(up) ?? kids.set(up, []).get(up)).push(r);
		}
		const newest = (a, b) => String(b.snap.last_activity).localeCompare(String(a.snap.last_activity));
		const top = rows.filter(r => { const up = MobileData.parent(r.snap, tree); return !(up && up !== r.snap.id && by_id.has(up)); }).sort(newest);
		out.empty(() => {
			this.header(rows);
			div.c("mob-card", () => {
				div.c("mob-card-head", () => { icon("account_tree").ac("mob-group-icon"); strong("Sessions"); small.c("mob-count", String(top.length)); });
				this.page_of(top, kids, tree, this.constructor.PAGE);
			});
		});
	}

	/** The first `n` of `top`, then a button for the next page (a month is thousands of rows). */
	page_of(top, kids, tree, n){
		top.slice(n - this.constructor.PAGE, n).forEach(r => this.nest(r, kids, tree));
		if (top.length <= n) return;
		const more = button.c("mob-more", `Show ${Math.min(this.constructor.PAGE, top.length - n)} more of ${top.length - n}`).click(() => { more.el.remove(); this.page_of(top, kids, tree, n + this.constructor.PAGE); });
	}

	/** A session row; its children, if any, are folded under "+N minions" (one indent, a 2 px rail) and drawn when first opened: a parent can hold hundreds. */
	nest(r, kids, tree){
		new MobileRow({ ...r, tree });
		const mine = (kids.get(r.snap.id) ?? []).sort((a, b) => String(b.snap.last_activity).localeCompare(String(a.snap.last_activity)));
		if (!mine.length) return;
		let $kids, built = false;
		const box = details.c("mob-nest", () => {
			summary.c("mob-nest-sum", this.count_words(mine, tree));
			$kids = div.c("mob-nest-kids");
		});
		box.on("toggle", () => { if (box.el.open && !built){ built = true; $kids.append(() => mine.forEach(k => this.nest(k, kids, tree))); } });
	}

	/** "+6 minions", "+1 mastermind, 3 minions": the direct children counted by kind. */
	count_words(mine, tree){
		const n = {};
		mine.forEach(k => { const kind = MobileData.kind(k.snap, tree); n[kind] = (n[kind] ?? 0) + 1; });
		return "+" + Object.entries(n).map(([k, c]) => `${c} ${k}${c > 1 && !k.endsWith("s") ? "s" : ""}`).join(", ");
	}
}
