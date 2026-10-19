import { div, span, small } from "/framework/core/View/View.js";
import TasksPage from "../tasks/TasksPage.js";

/** DashChips — the Inbox's filter chips over the one row (DashRow). Every state is a url: `?live&new&recent=today&kind=task,card`.
 *  Chips of the When group (live, new, recent, older) add up; across groups (When, Needs you, Kind) every one must hold. Doc: ai/doc/one-dashboard.md */
export default class DashChips {
	static WHEN = [["live", "Live"], ["new", "New"], ["recent", "Recent"], ["older", "Older"]];
	static RECENT = [["today", "Today"], ["yesterday", "Yesterday"], ["week", "This week"]];
	static OLDER = [["week", "1–4 weeks ago"], ["month", "Over a month ago"]];
	static KINDS = ["task", "card", "session", "ask"];
	static LIVE_MIN = 10;      // a row changed this recently counts as live
	static NEWEST = 150;       // with no chip on, this many rows

	live = false; fresh = false; recent = null; older = null; needs = false; kinds = new Set();

	constructor(owner){ this.owner = owner; this.read(location.search); }

	/** The chips a url names; `?live&new` has no values, `recent=` and `older=` default to their first window. */
	read(search){
		const q = new URLSearchParams(search), pick = (k, list) => q.has(k) ? (list.find(([w]) => w === q.get(k)) ?? list[0])[0] : null;
		this.live = q.has("live"); this.fresh = q.has("new"); this.needs = q.has("needs");
		this.recent = pick("recent", DashChips.RECENT); this.older = pick("older", DashChips.OLDER);
		this.kinds = new Set((q.get("kind") ?? "").split(",").filter(k => DashChips.KINDS.includes(k)));
	}

	/** `?live&new`, or "" with no chip on. */
	query(){
		const parts = [this.live && "live", this.fresh && "new", this.recent && "recent=" + this.recent, this.older && "older=" + this.older, this.needs && "needs",
			this.kinds.size && "kind=" + [...this.kinds].join(",")].filter(Boolean);
		return parts.length ? "?" + parts.join("&") : "";
	}
	/** The url now: our chips replace ours, anything else in the query (a search, a floor) stays. */
	write(){
		const rest = new URLSearchParams(location.search);
		["live", "new", "recent", "older", "needs", "kind"].forEach(k => rest.delete(k));
		const keep = rest.toString(), mine = this.query().slice(1);
		const search = [mine, keep].filter(Boolean).join("&");
		history.replaceState(history.state, "", location.pathname + (search ? "?" + search : "") + location.hash);
	}
	any(){ return this.live || this.fresh || this.recent || this.older || this.needs || this.kinds.size > 0; }

	/* ── the rules: one place says what each chip selects ── */

	static age(r, s){ return r.day ? Math.round((Date.parse(s.today) - Date.parse(r.day)) / 864e5) : null; }
	static finished(r){ return r.bucket === "landed" || r.bucket === "done"; }
	static is_live(r, s){ return r.bucket === "in_flight" || (!!r.when && Date.parse(s.at) - Date.parse(r.when) < DashChips.LIVE_MIN * 60000 && Date.parse(s.at) >= Date.parse(r.when)); }
	static is_new(r, s){
		if (r.kind === "task") return r.bucket === "queued" || (r.bucket === "idle" && (DashChips.age(r, s) ?? 0) <= 7);   // an idle task older than a week is Older
		if (r.kind === "card") return (r.bucket === "open" || r.bucket === "working") && r.created_day === s.today;
		return r.kind === "ask" && r.bucket === "queued";     // every ask nobody has picked up, not only today's
	}
	static in_recent(r, s, w){ const n = DashChips.age(r, s); return DashChips.finished(r) && n != null && n >= 0 && (w === "today" ? n === 0 : w === "yesterday" ? n === 1 : n <= 7); }
	static in_older(r, s, w){ const n = DashChips.age(r, s); return (DashChips.finished(r) || r.bucket === "idle") && n != null && (w === "week" ? n >= 8 && n <= 34 : n >= 35); }

	/** Does this row pass the chips that are on? */
	match(r, s){
		const when = [this.live && DashChips.is_live(r, s), this.fresh && DashChips.is_new(r, s), this.recent && DashChips.in_recent(r, s, this.recent), this.older && DashChips.in_older(r, s, this.older)];
		const on = [this.live, this.fresh, this.recent, this.older].some(Boolean);
		if (on && !when.some(Boolean)) return false;
		if (this.needs && !r.needs) return false;
		return !this.kinds.size || this.kinds.has(r.kind);
	}

	/** The count each chip would show on its own, over all rows. */
	counts(rows, s){
		const n = { live: 0, new: 0, recent: 0, older: 0, needs: 0, all: rows.length, today: 0, yesterday: 0, week: 0, older_week: 0, older_month: 0 };
		DashChips.KINDS.forEach(k => { n[k] = 0; });
		rows.forEach(r => {
			n[r.kind]++;
			if (DashChips.is_live(r, s)) n.live++;
			if (DashChips.is_new(r, s)) n.new++;
			if (r.needs) n.needs++;
			DashChips.RECENT.forEach(([w]) => { if (DashChips.in_recent(r, s, w)) n[w]++; });
			if (DashChips.in_recent(r, s, "week")) n.recent++;
			if (DashChips.in_older(r, s, "week")) n.older_week++;
			if (DashChips.in_older(r, s, "month")) n.older_month++;
		});
		n.older = n.older_week + n.older_month;
		return n;
	}

	/* ── drawing ── */

	/** The box the chips live in; call inside the head's builder. */
	mount(){ return this.$box = div.c("dash-chips"); }

	toggle(fn){ fn(); this.write(); this.owner.relist(); this.owner.paint_soon(); }

	/** Redraw from the rows and the state; `matched` rows pass the chips, `shown` of them are drawn (the cap). */
	update(rows, s, matched, shown){
		if (!this.$box) return;
		const n = this.counts(rows, s), c = s.check ?? {};
		const sig = JSON.stringify([n, this.query(), matched, shown, this.owner.search_q, c.ok === false ? TasksPage.why(c) : c.ok]);
		if (sig === this.sig) return;
		this.sig = sig;
		const chip = (label, count, on, click) => TasksPage.chip(count == null ? label : label + " " + count, on, () => this.toggle(click));
		this.$box.empty(() => {
			div.c("dash-chip-row", () => {
				chip("Live", n.live, this.live, () => { this.live = !this.live; });
				chip("New", n.new, this.fresh, () => { this.fresh = !this.fresh; });
				chip("Recent", n.recent, !!this.recent, () => { this.recent = this.recent ? null : "today"; });
				chip("Older", n.older, !!this.older, () => { this.older = this.older ? null : "week"; });
				chip("Needs you", n.needs, this.needs, () => { this.needs = !this.needs; });
			});
			if (this.recent) div.c("dash-chip-row dash-chip-sub", () => DashChips.RECENT.forEach(([w, label]) => chip(label, n[w], this.recent === w, () => { this.recent = w; })));
			if (this.older) div.c("dash-chip-row dash-chip-sub", () => DashChips.OLDER.forEach(([w, label]) => chip(label, n["older_" + w], this.older === w, () => { this.older = w; })));
			div.c("dash-chip-row", () => {
				span.c("dash-chip-head muted").text("Kind");
				DashChips.KINDS.forEach(k => chip(k, n[k], this.kinds.has(k), () => { this.kinds.has(k) ? this.kinds.delete(k) : this.kinds.add(k); }));
			});
			div.c("dash-total muted", () => span(matched > shown ? `newest ${shown} of ${matched}` : `${matched} of ${n.all}`));
			if (c.ok === false) TasksPage.note_bad(TasksPage.why(c));
		});
	}
}
