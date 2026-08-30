import { Page, div, span, p, md } from "/app.js";

// Container: data/'s row. Size: `large`, a grid wants more than 40em. Own layout:
// `grid auto` — one utility class, `--column` the only number. Regions: one.

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "The filtered rows as a wall of cards.",
	icon: "grid_view",
	width: "large",

	content(){
		md("Every card the same shape; the filter above decides how many show.");

		div.c("grid auto gap bleed", $wall => this.parent.watch(() => $wall.empty(() => {
			const rows = this.parent.filtered();

			if (rows === null) return p.c("muted", "Loading…");
			if (!rows.length) return p.c("muted", "Nothing matches.");

			rows.forEach(r => div.c("feeds-card", () => {
				span.c("feeds-card-name", r.name);
				div.c("feeds-card-meta", () => { span(r.place); span(r.year); });
				span.c("feeds-card-type", r.type);
			}));
		}))).style("--column", "14em");

		md("**Verdict:** `grid auto` plus one card class — the wall never touches the filter's code, only its answer.");
	},
});
