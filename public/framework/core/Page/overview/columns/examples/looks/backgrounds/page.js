import { Page, demo, div, h4, p, md } from "/app.js";

/* Container: examples/looks child, so `.page` main/wide/bleed apply — four boxes
   side by side need `wide`, never `main` (layout Q2: 2+ columns of content never
   live in the 40em reading track). Size: each box is two `width:"small"` columns
   (14em + 14em), so `--column` on the wall is 26em, not the wall's 18em default.
   Own layout: `wall wide` — the site's one card grid. Regions: one. Preview: the
   default card (this page is a plain link from ../, never walled itself). */

// One mini columns() tree: a Parent column and a Child column. `title` IS the CSS
// hook — Page.class.js stamps `page--<slug>`, and looks.css keys backgrounds off
// exactly those slugs, so naming a page is the whole opt-in (no config option
// anybody else has).
function pair(parentTitle, parentNote, childTitle, childNote){
	const root = new Page({
		title: parentTitle,
		width: "small",
		initialize(){ this.columns(); },
		content(){ p(parentNote); },
		children: { [childTitle]: { width: "small", content(){ p(childNote); } } },
	});

	return root.children.get(Page.slug(childTitle));
}

function box(label, child){
	div.c("flex v gap", () => {
		h4(label);
		demo.app(child).style("height", "16em");
	});
}

export default new Page({
	meta: import.meta,
	title: "Backgrounds",
	description: "Transparent (--wash) vs --tint vs --surface, and whether a child column matches its parent or the ambient fill.",
	icon: "format_color_fill",

	content(){
		md("Every column body is transparent by default — the fill you see is the host's own `background: var(--wash)` showing through. A page opts into a stronger fill by NAME (`looks.css` keys off `page--tint`, `page--surface`, …); nothing here is `--well` — it's a shadow, not a palette colour, and stacking it banded `/framework/ux/*`.");

		div.c("wall wide", $wall => {
			box("Ambient / ambient — both transparent", pair(
				"Ambient", "Transparent. The only fill is the host's ambient --wash.",
				"Child", "Also transparent — same ambient --wash, no seam.",
			));
			box("--tint parent / ambient child", pair(
				"Tint", "background: var(--tint).",
				"Child", "No override — back to ambient --wash, not the parent's tint.",
			));
			box("--surface parent / ambient child", pair(
				"Surface", "background: var(--surface), a card's own fill.",
				"Child", "No override — ambient --wash. Reads as a real edge here.",
			));
			box("--surface parent / --surface child — matched", pair(
				"Matched", "background: var(--surface).",
				"Matched Child", "Also var(--surface) — same fill both sides of the seam.",
			));
		}).style("--column", "36em");   // > the 32em row threshold (Page.css), or the box pages one column at a time and hides the very seam this recipe is about

		md("**Verdict:** a column never inherits its neighbour's background — only naming both sides the same token reads as one surface; naming just one makes the seam an edge, worst at `--surface` beside ambient `--wash`.");
	},
});
