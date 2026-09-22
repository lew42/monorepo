import { Page, div, a, span, p, h2, h3, icon } from "/app.js";
import Practice from "../Practice.js";
import { load } from "../../Layout.js";
import { mount } from "/framework/ext/Ask/chat.js";

/* ── /layouts/practice/catalog/ — bands, not columns ──────────────────────────
   LAYOUT, the five questions.

   1. CONTAINER. A page in `app.$pages` under `/layouts/`, so the page grid. Each
      band is a DIRECT child of the page wearing `bleed`, because that is the one
      class that spends the gutter tracks and reaches the viewport edge.
   2. SIZE. Full width at every one of 400 · 1280 · 1920 · 3440. The only height
      decision is the hero's, and it is a FOLD budget — `clamp(13rem, 34vh,
      26rem)` — because a hero's job is to be seen over, and `vh` is the only
      unit that knows how tall the fold is.
   3. OWN LAYOUT. Four bands stacked. Inside the middle one, a wall of twelve
      cards whose COLUMN COUNT IS WRITTEN OUT — 1, 2, 3, 4, 6, every one of them a
      divisor of 12, so no row is ever short at any width at all. Written as an
      `auto-fill` column width instead, the wall sat on 5 columns from 2800 to
      3360 (a last row of 2 of 5) and was ONE column all the way from 400 to 1040,
      where a card was 920px of paint holding a 584px sentence.
   4. REGIONS. Four bands, plus the fold: nav, hero, wall, footer.
   5. PREVIEW. The 1920 shot on `/layouts/practice/`.

   THE LAYOUT IT IS AN INSTANCE OF: `1-bands`.
   THE APPROVED SHAPE: 1 (the page grid), with 4 (Tile wall) inside.

   ⚠ EVERY BAND BLEEDS, AND ONLY TWO OF THEM PAINT. `bleed` is for paint (the
     layout skill): a band with a background may butt the viewport, and a band
     without one carries no padding at all — it only restores the page's own
     gutter on the inline axis, so its cards sit on exactly the axis the hero's
     words sit on. Padding with no background change is what makes a box look
     like it is floating in midair off the margins, which is the single commonest
     way a page looks wrong with nothing obviously wrong in it.                  */

export default new Page({
	meta: import.meta,
	title: "Catalog",
	icon: "grid_view",
	description: "A hero with a fold budget, a wall of twelve cards that has no hole at any width, and a footer of real links — bands all the way down.",

	content(){
		const entry = Practice.find("Catalog");
		mount({ app: this.app, url: this.url });

		/* THE NAV BAND — the same markup `Practice.rail()` draws as a column on the
		   other two layouts, in its horizontal form. One nav, two shapes: a reader
		   who has seen it as a rail recognises it as a bar. */
		div.c("std-practice std-practice-topbar bleed", () => { Practice.rail("Layouts"); });

		div.c("std-practice std-practice-hero bleed", () => {
			div.c("std-practice-hero-inner", () => { Practice.head(entry); hero(); });
		});

		/* The unpainted band: no background, so no block padding at all. Its air
		   comes from the hero's bottom padding above it and the footer's top
		   padding below it, and its own rhythm is the framework's `.flow`. */
		div.c("std-practice std-practice-band bleed", () => {
			div.c("std-practice-band-inner flow", () => {
				h2.c("std-practice-band-title", "Twelve layouts");
				p.c("std-practice-band-say", "Every one of them drawn, defined and named. Click a card for the drawing at three widths, what it becomes on a phone, and the CSS.");

				div.c("std-practice-wall std-practice-cards", $wall => {
					load().then(data => {
						$wall.append(() => { data.layouts.forEach(item => { card(item); }); });
					});
				});

				Practice.fold(entry, ANSWERS, POLISH);
			});
		});

		div.c("std-practice std-practice-footer bleed", () => {
			div.c("std-practice-foot-cols", () => {
				GROUPS.forEach(([title, links]) => {
					div.c("std-practice-foot-col", () => {
						h3.c("std-practice-foot-title", title);
						links.forEach(([label, href]) => {
							a.c("std-practice-foot-link").href(href).append(() => { span(label); });
						});
					});
				});
			});
			p.c("std-practice-foot-note", "lew42 — a no-build, native-ESM web framework. Every page on this site is the framework documenting itself.");
		});
	},
});

/* The hero's own words and its two ways out. A hero that says what the page is
   and gives you somewhere to go is doing its whole job; one that also holds a
   form, a search box and three badges is a band that needed to be a page. */
function hero(){
	div.c("std-practice-hero-acts", () => {
		a.c("std-practice-act std-practice-act-prim").href("/layouts/").append(() => {
			span("Open the encyclopedia");
			icon("arrow_forward");
		});
		a.c("std-practice-act").href("/websites/patterns/").append(() => {
			span("What 47 real sites do");
		});
	});
}

/* A CARD. Real title, the real `when` sentence off `layouts.json`, and a real
   url — never a made-up one, because a layout judged on invented content is not
   judged. */
function card(item){
	a.c("std-practice-card2").href("/layouts/" + item.id + "/").append(() => {
		span.c("std-practice-card2-id", item.id);
		span.c("std-practice-card2-name", item.title);
		p.c("std-practice-card2-say", item.when);
	});
}

/* SIX GROUPS, and six is the count for the same reason twelve is the wall's: it
   divides by 6, 3, 2 and 1, which are exactly the column counts this footer
   reaches. Every url here is a real page on this site. */
const GROUPS = [
	["Sections", [
		["Home", "/"], ["Framework", "/framework/"], ["Web", "/web/"], ["Imagine", "/imagine/"],
		["Layouts", "/layouts/"], ["Websites", "/websites/"], ["Notes", "/notes/"], ["Blog", "/blog/"],
	]],
	["The standard", [
		["Every layout, drawn", "/layouts/"], ["Approve or improve", "/layouts/browse/"],
		["Naming rules", "/layouts/doc/naming/"], ["The wire spec", "/layouts/doc/wire/"],
		["Decisions", "/layouts/doc/decisions/"],
	]],
	["Framework", [
		["Start", "/framework/start/"], ["Core", "/framework/core/"], ["Styles", "/framework/styles/"],
		["UI", "/framework/ui/"], ["Ext", "/framework/ext/"], ["Dev", "/framework/dev/"],
	]],
	["Practice", [
		["All three", "/layouts/practice/"], ["Workbench", "/layouts/practice/workbench/"],
		["Reader", "/layouts/practice/reader/"], ["Catalog", "/layouts/practice/catalog/"],
		["The approved five", "/layouts/doc/studies/approved/"],
	]],
	["The corpus", [
		["47 real sites", "/websites/"], ["What they do", "/websites/patterns/"],
		["The layout words", "/framework/styles/doc/layout-system.md"],
	]],
	["Working", [
		["The AI board", "/framework/ai/"], ["Research", "/framework/research/"],
		["Résumé", "/resume/"],
	]],
];

const ANSWERS = [
	["Layout", "Four bands stacked, each one edge to edge. A band is never a column and never becomes one: at 400 this page is the same four bands it is at 3440, which is what `1-bands` means and why it is the only arrangement a phone leaves alone."],
	["Navigation", "A bar across the top, holding the same eight links, in the same order, that the Workbench and the Reader hold in their rails — one nav in two shapes. It is the first thing on the page at every width, so it is above the fold by construction rather than by luck."],
	["Structure", "Page → four bands → each band one inner block on the page's own gutter axis. The wall lives INSIDE the middle band; it is never a band itself, because a wall from top to bottom is not a page (not one of the 47 real sites is)."],
	["Visual hierarchy", "The hero is loudest — the only band with large type, and the only one with a fold budget. The wall is second and does the work. The footer is quietest: 0.9em links on the heaviest ground on the page, which reads as the end."],
	["Iceberg UX", "A card is a name and one sentence. The drawing, the three widths, what it becomes on a phone and the CSS are all on the layout's own page, one click away. Nothing about a layout is deleted; almost all of it is one click down."],
	["Color", "Three grounds, one step apart on the alpha ladder: the page's `--surface` under the wall, `--fill-a04` under the hero and the bar, `--fill-a08` under the footer. A band that paints gets padding; a band that does not paint gets none. The accent is one filled button in the hero, `--ink` on `--prim`; `--prim` never carries a word on its own. The measured ratios are in this task's log."],
	["Focus", "The hero's heading, then the filled button under it. The bar above is deliberately small and grey so the eye passes over it on the way in and finds it again on the way out."],
	["Interaction", "Click a nav link, a hero button, a card or a footer link. Nothing on this page changes this page — every interaction is a url, which is what makes a catalog a catalog rather than an app."],
	["Purpose and outcome", "A reader leaves having seen all twelve layouts at once and knowing which one to open — and having seen a hero that leaves room for the thing under it."],
];

const POLISH = "Eight checks at four widths said 8 of 8 — and a critic then swept every 80px from 400 to 3440 and measured six widths in full, including the two a four-width sweep skips. What it found and what was done is in [the critic's log](/framework/ai/2026-09-17/practice-critic/).";
