import { div, span, button } from "/framework/core/View/View.js";

/** DashChips — the Inbox's filter chips over the one row (DashRow). Every state is a url: `?live&new&recent=today&kind=task,card`.
 *  Chips of the When group (live, new, recent, older) add up; across groups (When, Needs you, Kind, Home) every one must hold.
 *  The old task pages are saved filters of these (`DashChips.SAVED`). Doc: ai/doc/one-dashboard.md */
export default class DashChips {
	static WHEN = [["live", "Live"], ["new", "New"], ["recent", "Recent"], ["older", "Older"]];
	static RECENT = [["today", "Today"], ["yesterday", "Yesterday"], ["week", "This week"]];
	static OLDER = [["week", "1–4 weeks ago"], ["month", "Over a month ago"]];
	static KINDS = ["task", "card", "session", "ask"];
	static LIVE_MIN = 10;      // a row changed this recently counts as live
	static NEWEST = 150;       // with no chip on, this many rows
	static AI = "/framework/ai/";

	/** The old pages as filters: each keeps its url and forwards here with these chips on (ai/tasks/SavedFilter.js). */
	static SAVED = {
		tasks: "?live&recent=today&kind=task",           // /framework/ai/tasks/: in flight (Live) and landed today (Recent); Queued is the New chip, left off: it also holds 289 idle module tasks
		"all-tasks": "?kind=task&home",                   // /tasks/: every task a module keeps in its own tasks/ folder
	};

	/** The url a saved filter forwards to; the tasks page's old `?landed=yesterday|week` becomes `recent=`. */
	static saved(name, search = ""){
		const landed = new URLSearchParams(search).get("landed"), base = DashChips.SAVED[name];
		return DashChips.AI + (name === "tasks" && DashChips.RECENT.some(([w]) => w === landed) ? base.replace("recent=today", "recent=" + landed) : base);
	}

	live = false; fresh = false; recent = null; older = null; needs = false; home = false; kinds = new Set();

	constructor(owner){ this.owner = owner; this.read(location.search); }

	/** The chips a url names; `?live&new` has no values, `recent=` and `older=` default to their first window. */
	read(search){
		const q = new URLSearchParams(search), pick = (k, list) => q.has(k) ? (list.find(([w]) => w === q.get(k)) ?? list[0])[0] : null;
		this.live = q.has("live"); this.fresh = q.has("new"); this.needs = q.has("needs"); this.home = q.has("home");
		this.recent = pick("recent", DashChips.RECENT); this.older = pick("older", DashChips.OLDER);
		this.kinds = new Set((q.get("kind") ?? "").split(",").filter(k => DashChips.KINDS.includes(k)));
	}

	/** `?live&new`, or "" with no chip on. */
	query(){
		const parts = [this.live && "live", this.fresh && "new", this.recent && "recent=" + this.recent, this.older && "older=" + this.older, this.needs && "needs", this.home && "home",
			this.kinds.size && "kind=" + [...this.kinds].join(",")].filter(Boolean);
		return parts.length ? "?" + parts.join("&") : "";
	}
	/** The url now: our chips replace ours, anything else in the query (a search, a floor) stays. */
	write(){
		const rest = new URLSearchParams(location.search);
		["live", "new", "recent", "older", "needs", "home", "kind"].forEach(k => rest.delete(k));
		const keep = rest.toString(), mine = this.query().slice(1);
		const search = [mine, keep].filter(Boolean).join("&");
		history.replaceState(history.state, "", location.pathname + (search ? "?" + search : "") + location.hash);
	}
	any(){ return this.live || this.fresh || this.recent || this.older || this.needs || this.home || this.kinds.size > 0; }

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

	/** The groups that hold side by side with When: Needs you, Home, Kind. `skip` leaves one out (a chip's own count ignores its own group). */
	others(r, skip){
		return (skip === "needs" || !this.needs || r.needs) && (skip === "home" || !this.home || r.home != null) && (skip === "kind" || !this.kinds.size || this.kinds.has(r.kind));
	}

	/** Does this row pass the chips that are on? */
	match(r, s){
		const when = [this.live && DashChips.is_live(r, s), this.fresh && DashChips.is_new(r, s), this.recent && DashChips.in_recent(r, s, this.recent), this.older && DashChips.in_older(r, s, this.older)];
		const on = [this.live, this.fresh, this.recent, this.older].some(Boolean);
		if (on && !when.some(Boolean)) return false;
		return this.others(r);
	}

	/** The count each chip shows: the rows it would add, with the other groups' chips applied (Today under Kind task counts tasks only). */
	counts(rows, s){
		const n = { live: 0, new: 0, recent: 0, older: 0, needs: 0, home: 0, all: rows.length, today: 0, yesterday: 0, week: 0, older_week: 0, older_month: 0 };
		DashChips.KINDS.forEach(k => { n[k] = 0; });
		rows.forEach(r => {
			if (this.others(r, "kind")) n[r.kind]++;
			if (this.others(r, "needs") && r.needs) n.needs++;
			if (this.others(r, "home") && r.home != null) n.home++;
			if (!this.others(r)) return;
			if (DashChips.is_live(r, s)) n.live++;
			if (DashChips.is_new(r, s)) n.new++;
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

	/** One filter chip (the Lanes page's tabs and the Inbox's chips are drawn with this). */
	static chip(label, on, click){ return button.c("sessions-chip" + (on ? " sessions-chip-on" : ""), label).on("click", click); }

	/** The red line of a failed self-check: always this one, so a wrong count is never quiet. */
	static note_bad(text){ const note = div.c("tasks-note tasks-check-bad", () => span(text)); note.el.style.color = "#c62828"; return note; }

	/** The sentence naming every count that differs: landed today, tasks, cards, asks, sessions. */
	static why(c){
		const l = c.landed_today ?? {}, ids = [...(l.only_state ?? []), ...(l.only_walk ?? [])], two = (k, x) => x && x.ok === false ? `${k}: ${x.rows} rows, ${x.sum} in buckets, ${x.ids} found by a text scan` : null;
		const parts = [l.state !== l.walk || ids.length ? `landed today is ${l.state} by the task rules but ${l.walk} by a plain walk${ids.length ? " (" + ids.join(", ") + ")" : ""}` : null,
			c.total !== c.sum ? `${c.total} tasks, ${c.sum} in buckets` : null, two("cards", c.cards), two("asks", c.asks),
			c.sessions?.ok === false ? `sessions: ${c.sessions.in_sessions} tasks in sessions, ${c.sessions.with_session} task rows with a session` : null].filter(Boolean);
		return "Counts disagree: " + (parts.length ? parts.join("; ") : `${c.total} tasks, ${c.sum} in buckets`) + ".";
	}

	/** Redraw from the rows and the state; `matched` rows pass the chips, `shown` of them are drawn (the cap). */
	update(rows, s, matched, shown){
		if (!this.$box) return;
		const n = this.counts(rows, s), c = s.check ?? {};
		const sig = JSON.stringify([n, this.query(), matched, shown, this.owner.search_q, c.ok === false ? DashChips.why(c) : c.ok]);
		if (sig === this.sig) return;
		this.sig = sig;
		const chip = (label, count, on, click) => DashChips.chip(count == null ? label : label + " " + count, on, () => this.toggle(click));
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
				chip("in a module's tasks/", n.home, this.home, () => { this.home = !this.home; });
			});
			div.c("dash-total muted", () => span(matched > shown ? `newest ${shown} of ${matched}` : `${matched} of ${n.all}`));
			if (c.ok === false) DashChips.note_bad(DashChips.why(c));
		});
	}
}
