import FilterPill from "./FilterPill.js";

/**
 * class TimeFilter extends FilterPill — the "Today ▾" pill: Today, Week, Month, Year (Year is everything, for now).
 * It filters by hiding: every element under `root` that carries `data-at` (ms or an ISO time) outside the window is
 * hidden, and new ones are checked as they arrive. An element matching `follows` (a chat's "12 tool calls" line)
 * has no time of its own and goes with the element before it. One line on a page:
 *
 *   TimeFilter.add({ root: $box, changed: () => … });   // ?when=week in the url
 */
export default class TimeFilter extends FilterPill {
	static DAY = 864e5;

	/** The window's first moment, in ms: local midnight for Today, 7 and 30 days back, 0 for Year (all). */
	since(now = Date.now()){
		if (this.value === "today"){ const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime(); }
		if (this.value === "week") return now - 7 * TimeFilter.DAY;
		if (this.value === "month") return now - 30 * TimeFilter.DAY;
		return 0;
	}

	/** Is a time (ms, an ISO string, or nothing) inside the window? No time at all is always kept. */
	keeps(t){
		const ms = typeof t === "number" ? t : Number(t) || Date.parse(t ?? "");
		return !Number.isFinite(ms) || !ms || ms >= this.since();
	}

	/** row => boolean over one field, for a caller that filters data instead of elements. */
	predicate(field = "at"){ return row => this.keeps(row?.[field]); }

	draw(){
		const view = super.draw();
		if (this.root) this.watch(this.root);
		return view;
	}

	pick(value){ super.pick(value); this.apply(); }

	/** Hide what falls outside the window under every watched root; returns { shown, hidden }. */
	apply(){
		const n = { shown: 0, hidden: 0 };
		for (const root of this.roots ?? []){
			let prev = false;
			for (const el of root.querySelectorAll("[data-at], " + this.follows)){
				const out = el.matches("[data-at]") ? !this.keeps(el.dataset.at) : prev;
				el.classList.toggle("filter-pill-out", out);
				if (el.matches("[data-at]")){ prev = out; n[out ? "hidden" : "shown"]++; }
			}
		}
		this.counted = n;
		this.after?.(n, this);
		return n;
	}

	/** Filter `root` (an element or a View) now and whenever something is added under it. */
	watch(root){
		const el = root.el ?? root;
		(this.roots ??= []).push(el);
		let queued = false;
		new MutationObserver(() => { if (!queued){ queued = true; queueMicrotask(() => { queued = false; this.apply(); }); } }).observe(el, { childList: true, subtree: true });
		this.apply();
		return this;
	}
}

TimeFilter.prototype.param = "when";
TimeFilter.prototype.title = "Show only what happened in this window";
TimeFilter.prototype.follows = ".chatbox-update";
TimeFilter.prototype.options = [
	{ value: "today", label: "Today" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
	{ value: "year", label: "Year" },
];

export { TimeFilter };
