import { Page, div, span, input, button, md } from "/app.js";

/* Container: feeds/'s row (the columns host is /imagine/, however deep). Size:
   `large` — a wall, a table and a tree all want more than the 40em default. Own
   layout: one filter bar, then a plain child list (core's default column()).
   Regions: one; my three children draw their own. Preview: default card.

   THE ONE FILE: `data.json` is fetched once, HERE, and never again — Cards, Tree
   and Table are all `this.parent.filtered()` plus their own markup. Controls over
   files: one text box and one chip row drive three renderings with no per-view
   filter code. `watch()` is the same shape `uses/inbox` uses for a cross-column
   ref, one hop instead of `topic()`'s many. `feeds.css` is loaded once, by the
   parent (`feeds/page.js`) — it is an ancestor on every url under here, so its
   stylesheet is already in the document by the time this module runs. */

export default new Page({
	meta: import.meta,
	title: "Data",
	description: "Twenty buildings, one data.json — a wall, a tree and a table, filtered together.",
	icon: "table_chart",
	width: "large",

	rows: null,   // null while loading
	q: "",
	facet: null,

	initialize(){
		this.watchers = [];

		fetch(new URL("data.json", import.meta.url))
			.then(r => r.json())
			.then(rows => { this.rows = rows; this.notify(); })
			.catch(() => { this.rows = []; this.failed = true; this.notify(); });
	},

	watch(fn){ this.watchers.push(fn); fn(); },
	notify(){ this.watchers.forEach(fn => fn()); },

	facets(){ return [...new Set((this.rows ?? []).map(r => r.type))].sort(); },

	filtered(){
		if (!this.rows) return null;

		const q = this.q.trim().toLowerCase();

		return this.rows.filter(r =>
			(!this.facet || r.type === this.facet) &&
			(!q || r.name.toLowerCase().includes(q) || r.place.toLowerCase().includes(q)));
	},

	content(){
		md("Twenty notable buildings, one `data.json`, drawn three ways below: **Cards**, **Tree**, **Table**. One filter — this bar — drives all three; nothing per-view re-implements it.");

		div.c("feeds-data feeds-filter flex gap wrap v-center", () => {
			input.c("feeds-search").attr("placeholder", "search name or place…")
				.on("input", e => { this.q = e.target.value; this.notify(); });

			div.c("feeds-chips", $chips => this.watch(() => $chips.empty(() => {
				const chip = (label, value) => button.c("feeds-chip").ac(this.facet === value && "feeds-chip-on")
					.text(label)
					.on("click", () => { this.facet = value; this.notify(); });

				chip("All", null);
				this.facets().forEach(f => chip(f, f));
			})));

			span.c("feeds-count", $count => this.watch(() => {
				const rows = this.filtered();
				$count.text(this.failed ? "offline" : rows === null ? "loading…" : rows.length + " of " + (this.rows?.length ?? 0));
			}));
		});
	},

	children: "cards tree table",
});
