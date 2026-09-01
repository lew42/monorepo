import { Page, div, h2, h3, p, a, span, md } from "/app.js";
import { axes, sites } from "./tags.js";

/* Container: a column of /imagine/design/'s row (the hub calls columns()). Size:
   `full` — a glossary plus a tagged table wants the whole row, same call as its
   sibling studies. Own layout: two sections, each a plain list — no grid needed at
   this row count. Regions: none, plain content(). Preview: the default card. */

const AXIS_ORDER = ["navigation", "shell", "scroll", "content-kind"];

// This page is a plain column under /imagine/design/'s columns host (nested
// columns() is inert), so `width: "full"` hands prose the whole row's width —
// cap it, or a paragraph runs 130+ chars/line at 3440 (layout-study's own catch).
const prose = text => div.c("measure start flow").append(() => md(text));

const chip = tag => span.c("code", tag).style({
	fontSize: "0.85em", padding: "0.1em 0.5em", borderRadius: "1em",
	border: "1px solid var(--line)",
});

const tag_row = t => div.c("flex gap wrap v-center").style({ padding: "0.3em 0", borderBlockEnd: "1px solid var(--line)" }).append(() => {
	chip(t.tag);
	p.c("muted", t.def).style({ margin: 0, flex: "1 1 20em" });
});

const axis_block = name => {
	const own = axes.filter(a => a.axis === name);
	h3(name).style({ marginBlockEnd: "0.2em" });
	if (name === "navigation") prose(
		"The marked subset (deep-nav) is what actually carries a trail past one level — everything else here is one flat bar or panel."
	);
	div(() => own.map(tag_row));
};

const site_card = s => div.c("flex v gap").style({
	border: "1px solid var(--line)", borderRadius: "0.4em", padding: "0.9em 1em",
}).append(() => {
	div.c("flex gap wrap v-center").style({ justifyContent: "space-between" }).append(() => {
		a(s.site).href(s.url).style({ fontWeight: "700" });
		span.c("muted", s.url);
	});
	div.c("flex gap wrap").style({ marginBlock: "0.4em" }).append(() => s.tags.map(t => chip(t)));
	p.c("muted", s.notes).style({ margin: 0, fontSize: "0.92em" });
});

export default new Page({
	meta: import.meta,
	title: "Vocabulary",
	description: "A tag vocabulary for describing any site's structure, applied first to our own realms — the blog, the docs, the columns world — as the seed corpus.",
	icon: "sell",
	width: "full",

	content(){
		const used = new Set(sites.flatMap(s => s.tags));
		prose(`**${axes.length} tags across ${AXIS_ORDER.length} axes**, most lifted verbatim from tonight's navigation and layout studies. **${used.size}** are demonstrated somewhere in the ${sites.length}-site corpus below; the rest (mega-menu, footer-nav, holy-grail, split-view, infinite-scroll, horizontal-scroll, sticky-header) describe shapes *no page on this site has* — reserved for the first foreign site that does. That absence is itself a finding: navigation-study already noted no sticky-on-scroll header exists anywhere here.`);

		h2("The glossary");
		prose("Grouped by axis — how you move, the page's own regions, what scrolling does, and what a section IS.");
		AXIS_ORDER.forEach(axis_block);

		h2("Tagged: our own realms");
		prose("The first corpus — each of our own sections, tagged as if it were a site found on the web.");
		div.c("flex v gap", () => sites.map(site_card));

		h2("Adding a site");
		prose("Edit `tags.js` — append one object to `sites`: `{ site, url, tags: [...], notes }`. Reuse a tag from `axes` above; add a new one there first if nothing fits. External sites go in the *same* array, once this container's egress opens — from the owner's PC, not from here.");
	},
});
