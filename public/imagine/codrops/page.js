import { Page, View, div, span, a, img, md, icon } from "/app.js";
import { table } from "/framework/ui/table/table.js";

View.stylesheet(import.meta, "codrops.css");

/* Container: a column of /imagine/'s row (the hub already calls columns()). Size: `large`
   — a 3-up card wall plus a wide table both fit without the measure. Own layout: prose,
   a `.grid.auto` card wall (one per ported demo), then a data table. Regions: one.
   Preview: default card. */

/* Single source for the card wall and the table below — one row per ported demo, checked
   against the actual `LICENSE` file on github.com/codrops/<repo> (never the badge) before
   it landed here; `licence_url` is that exact file. */
const DEMOS = [
	{
		slug: "grid-hover",
		title: "Grid item hover effect",
		original: "https://github.com/codrops/GridItemHoverEffect",
		licence_url: "https://github.com/codrops/GridItemHoverEffect/blob/main/LICENSE",
		needed: "CSS + JS (GSAP, Splitting.js, imagesloaded)",
		changed: "Grid: framework's `.grid.auto` + `--column`, not a fixed 300px track. Hover: one plain CSS `:hover` transition, not the original's direction-aware pointermove JS (three classes) or GSAP/Splitting — a library we cannot take without vendoring GSAP, so dropped. Placeholder colour tiles stand in for the original's photography.",
	},
	{
		slug: "line-hover",
		title: "Menu hover effects",
		original: "https://github.com/codrops/LineHoverStyles",
		licence_url: "https://github.com/codrops/LineHoverStyles/blob/main/LICENSE",
		needed: "CSS only — no JS in the original either",
		changed: "Row: framework's `.flex.wrap.gap`, not a fixed CSS grid track. 6 of the original's 15 styles kept — the ones built from `::before`/`::after`; the 9 drawn with an inline SVG path and `stroke-dashoffset` are dropped for this round. Classes renamed from mythological figures to what each style does.",
	},
	{
		slug: "scroll-bend",
		title: "Scroll-based letter bend",
		original: "https://github.com/codrops/OnScrollLetterAnimations",
		licence_url: "https://github.com/codrops/OnScrollLetterAnimations/blob/main/LICENSE",
		needed: "JS (Locomotive Scroll, Splitting.js) + CSS",
		changed: "Locomotive Scroll and Splitting.js dropped — both a library we cannot take (npm-only; this site has no smooth-scroll wrapper to hang one on). Reads each heading's own `getBoundingClientRect()` every animation frame instead of a scroll listener; the character split is one `[...word]`. The bend formula itself is unchanged.",
	},
];

export default new Page({
	meta: import.meta,
	title: "Codrops",
	description: "Free web-effect demos from Codrops, rebuilt as pages on this framework — what carries over and what does not.",
	icon: "auto_fix_high",
	width: "large",
	index: true,

	children: "grid-hover line-hover scroll-bend",

	content(){
		md("**Codrops publishes free demos of web effects; these are a few of them rebuilt as pages on this framework, so you can see what carries over and what does not.**");

		div.c("grid auto gap", () => {
			DEMOS.forEach(demo => {
				div.c("codrops-demo-card", () => {
					a().href(this.url + demo.slug + "/").append(() => {
						img.c("codrops-demo-still").attr("src", new URL(`./${demo.slug}/still.png`, import.meta.url).pathname).attr("alt", `${demo.title} — a still of the effect`).attr("loading", "lazy");
					});
					div.c("codrops-demo-body", () => {
						a.c("codrops-demo-title", demo.title).href(this.url + demo.slug + "/");
						a.c("codrops-demo-original page-link", () => { icon("open_in_new"); span("the original"); }).href(demo.original).attr("target", "_blank").attr("rel", "noopener");
					});
				});
			});
		}).style("--column", "16em");

		md("## What each one needed, and what changed");

		table(["demo", "original", "licence", "what it needed", "what changed to fit the framework"], DEMOS.map(demo => [
			() => a.c("page-link", demo.title).href(this.url + demo.slug + "/"),
			() => a.c("page-link", "repo ↗").href(demo.original).attr("target", "_blank").attr("rel", "noopener"),
			() => a.c("page-link", "MIT ↗").href(demo.licence_url).attr("target", "_blank").attr("rel", "noopener"),
			demo.needed,
			demo.changed,
		])).ac("wide");

		md("**The rule for a licence:** read the actual `LICENSE` file on `github.com/codrops/<repo>`, never the badge — the licence column above links straight to the three files read for this round. **The rule for a substitution:** where the demo's own layout was a grid or a row, this framework's own word replaced it (`.grid.auto`, `--column`, `.flex.wrap.gap`) before any of the demo's original CSS did; every substitution is named in the table. `readme.md` has the porting rules, for whoever ports the next one.");
	},
});
