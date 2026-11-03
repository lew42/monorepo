import { Page, View, div, span, h3, p, a, img, md, icon } from "/app.js";
import { table } from "/framework/ui/table/table.js";
import { MECHANISMS } from "/imagine/paging/paging.js";

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
		mech: null,
	},
	{
		slug: "line-hover",
		title: "Menu hover effects",
		original: "https://github.com/codrops/LineHoverStyles",
		licence_url: "https://github.com/codrops/LineHoverStyles/blob/main/LICENSE",
		needed: "CSS only — no JS in the original either",
		changed: "Row: framework's `.flex.wrap.gap`, not a fixed CSS grid track. 6 of the original's 15 styles kept — the ones built from `::before`/`::after`; the 9 drawn with an inline SVG path and `stroke-dashoffset` are dropped for this round. Classes renamed from mythological figures to what each style does.",
		mech: null,
	},
	{
		slug: "scroll-bend",
		title: "Scroll-based letter bend",
		original: "https://github.com/codrops/OnScrollLetterAnimations",
		licence_url: "https://github.com/codrops/OnScrollLetterAnimations/blob/main/LICENSE",
		needed: "JS (Locomotive Scroll, Splitting.js) + CSS",
		changed: "Locomotive Scroll and Splitting.js dropped — both a library we cannot take (npm-only; this site has no smooth-scroll wrapper to hang one on). Reads each heading's own `getBoundingClientRect()` every animation frame instead of a scroll listener; the character split is one `[...word]`. The bend formula itself is unchanged.",
		mech: null,
	},
	{
		slug: "circle-reveal",
		title: "Circle reveal",
		original: "https://github.com/codrops/UnrevealEffects",
		licence_url: "https://github.com/codrops/UnrevealEffects/blob/main/LICENSE",
		needed: "JS (GSAP, imagesloaded) + CSS clip-path",
		changed: "This realm's own `swap` mechanism (/imagine/paging/mechanisms/swap/), drawn as a fifth swap visual: a circular `clip-path` wipe from the click point, instead of a tab strip, a sliding card, a cross-fade or a flip — same stage, no url change. GSAP's multi-property timeline (image position, four text blocks and a back control staggered over ~1s) dropped for one CSS `transition: clip-path`; placeholder gradients stand in for the original's photography.",
		mech: "swap",
	},
	{
		slug: "sticky-stack",
		title: "Sticky stack",
		original: "https://github.com/codrops/StickySections",
		licence_url: "https://github.com/codrops/StickySections/blob/main/LICENSE",
		needed: "JS (GSAP ScrollTrigger, Lenis) + CSS",
		changed: "GSAP's `ScrollTrigger` (`scrub: true`) and Lenis (a smooth-scroll wrapper around the whole page) dropped — both a library we cannot take. The stage is its own bounded scroll container (`overflow-y: auto`), so a plain `scroll` listener on that one element (not the page, not the window) drives the same dim/scale/drift formula from demo1 and demo3, throttled to one `requestAnimationFrame` per burst.",
		mech: null,
	},
	{
		slug: "type-shuffle",
		title: "Type shuffle",
		original: "https://github.com/codrops/TypeShuffleAnimation",
		licence_url: "https://github.com/codrops/TypeShuffleAnimation/blob/main/LICENSE",
		needed: "JS (Splitting.js) + CSS",
		changed: "Splitting.js dropped for one `[...word].forEach()` per word — the three loops kept (fx1 `cascade`, fx3 `scramble`, fx6 `glitch`) are otherwise the original's own cache-copy and stagger tricks, unchanged. 3 of the original's 6 effects ported this round.",
		mech: null,
	},
	{
		slug: "expand-menu",
		title: "Expanding menu",
		original: "https://github.com/codrops/ExpandingRoundedMenu",
		licence_url: "https://github.com/codrops/ExpandingRoundedMenu/blob/main/LICENSE",
		needed: "JS (GSAP) + CSS",
		changed: "This realm's own `expand` mechanism (/imagine/paging/mechanisms/expand/) — a pill bar that grows in place into a full nav panel, nothing else moves. GSAP's seven-tween timeline (a background image reveal, four content elements drifting, the panel sliding, a tagline and social links fading in 0.6s later) dropped for two CSS transitions: `grid-template-rows: 0fr → 1fr` for the panel's height (no JS measuring it), `opacity` for a plain colour scrim standing in for the image reveal.",
		mech: "expand",
	},
	{
		slug: "grid-zoom",
		title: "Grid zoom",
		original: "https://github.com/codrops/GridZoom",
		licence_url: "https://github.com/codrops/GridZoom/blob/main/LICENSE",
		needed: "JS (GSAP + Flip plugin, 5 modules) + CSS",
		changed: "GSAP's Flip plugin dropped for the textbook 3-line version: measure the clicked tile's own rect, compute the `translate() scale()` that lands it on the content panel's spot, one CSS `transition: transform` does the rest. The original's 5 extra JS modules (per-character text reveals, a prev/next thumbnail strip) dropped for a plain fade. Grid keeps its own fixed `grid-template-columns`, not `.grid.auto` — like circle-reveal, a bounded geometric composition the transform measures, not a flowing wall.",
		mech: "swap",   // not named as such in round 3 — click replaces the stage's content
		                // (grid ↔ detail), the box never moves, the url never changes, and
		                // "Back to grid" returns it: `swap`'s own definition, spotted while
		                // sorting every card for this round's regroup.
	},
	{
		slug: "make-way",
		title: "Make way",
		original: "https://github.com/codrops/MakeWayGridEffect",
		licence_url: "https://github.com/codrops/MakeWayGridEffect/blob/main/LICENSE",
		needed: "JS (GSAP) + CSS",
		changed: "Grid: framework's `.grid.auto` + `--column`, not a fixed `repeat(13,1fr)` track. Trigger changed from the original's click to hover (`mouseenter`/`mouseleave`), per this round's ask for a hover-driven layout change. GSAP's timeline (skew, staggered z-index, `elastic.out`/`power4` eases) dropped for one CSS `transition: transform`; the maths that decides how far each tile moves (`map`/`getDistance`/`getTranslationDistance` from the original's `utils.js`) is unchanged.",
		mech: null,
	},
	{
		slug: "layer-reveal",
		title: "Layer reveal",
		original: "https://github.com/codrops/RapidLayersAnimation",
		licence_url: "https://github.com/codrops/RapidLayersAnimation/blob/master/LICENSE",
		needed: "JS (GSAP) + CSS",
		changed: "GSAP's timeline (ten layers, `Power2`/`Expo` eases, a random 100-500px per-tile spring) dropped for one class toggle driving CSS transitions staggered by a `--i` custom property, with fixed per-tile offsets so a screenshot is reproducible. An intro sequence — closest in spirit to this realm's own `takeover` (it fills its stage) but it never routes and never returns, so it keeps its own name rather than borrowing a half-fit one.",
		mech: null,
	},
	{
		slug: "warp-cursor",
		title: "Warp cursor",
		original: "https://github.com/codrops/AnimatedCustomCursor",
		licence_url: "https://github.com/codrops/AnimatedCustomCursor/blob/master/LICENSE",
		needed: "JS (GSAP) + CSS + SVG filters",
		changed: "GSAP's tween on the SVG filter's `baseFrequency` dropped for one SMIL `<animate begin=\"indefinite\">`, fired by `beginElement()`. The cursor is confined to its own stage (`position: absolute` inside it), not `position: fixed` over the whole document like the original — a page here keeps its real pointer over its own nav. A pointer effect, not a paging one: nothing about it pages, so it sorts under `none`.",
		mech: null,
	},
	{
		slug: "shape-swap",
		title: "Shape swap",
		original: "https://github.com/codrops/ShapesSlideshow",
		licence_url: "https://github.com/codrops/ShapesSlideshow/blob/main/LICENSE",
		needed: "JS (GSAP) + CSS clip-path",
		changed: "GSAP's twelve-step timeline (staggered clip-path, counter-translated imagery, per-row text slides, a fading link, mirrored on the way in and out) dropped for one CSS `transition: clip-path` on the incoming slide only, anchored at the edge you moved toward. A card stack framed as this realm's own `swap` — a sixth swap visual (tabs, card-in, cross-fade, flip, circle-reveal's click-wipe, and now this edge-anchored iris) — same stage, no url change, only the current slide interactive.",
		mech: "swap",
	},
];

/* One line per bucket — how the hub regroups its cards below, by what a click on the
   card's OWN stage actually does. `null` reuses this realm's `MECHANISMS` table (one
   source, page.js's words can't drift from paging.js's); `none` is plain-language, not
   imported, because no MECHANISMS entry describes "nothing is being paged here". */
const MECH_GROUPS = [
	{ key: "swap", label: "Swap", icon: MECHANISMS.swap.icon, does: MECHANISMS.swap.does },
	{ key: "expand", label: "Expand", icon: MECHANISMS.expand.icon, does: MECHANISMS.expand.does },
	{ key: "launch", label: "Launch", icon: MECHANISMS.launch.icon, does: MECHANISMS.launch.does },
	{ key: "takeover", label: "Takeover", icon: MECHANISMS.takeover.icon, does: MECHANISMS.takeover.does },
	{ key: null, label: "None", icon: "block", does: "a click, hover or scroll changes something on the page, but nothing is being paged — no box swaps, grows, opens a column or takes over the screen" },
];

export default new Page({
	meta: import.meta,
	title: "Codrops",
	description: "Free web-effect demos from Codrops, rebuilt as pages on this framework — what carries over and what does not.",
	icon: "auto_fix_high",
	width: "large",
	index: true,

	children: "grid-hover line-hover scroll-bend circle-reveal sticky-stack type-shuffle expand-menu grid-zoom make-way layer-reveal warp-cursor shape-swap",

	content(){
		md("**Codrops publishes free demos of web effects; these are a few of them rebuilt as pages on this framework, so you can see what carries over and what does not.** Grouped below by what a click does — Codrops effects, sorted by paging mechanism.");

		MECH_GROUPS.forEach(group => {
			const demos = DEMOS.filter(demo => demo.mech === group.key);

			div.c("codrops-mech-head", () => {
				icon(group.icon);
				h3(group.label);
				span.c("codrops-mech-does", group.does + ".");
			});

			if (!demos.length){
				p.c("codrops-mech-empty", `No ported demo lands here yet — ${group.does}.`);
				return;
			}

			div.c("grid auto gap", () => {
				demos.forEach(demo => this.demo_card(demo));
			}).style("--column", "16em");
		});

		md("## What each one needed, and what changed");

		table(["demo", "mechanism", "original", "licence", "what it needed", "what changed to fit the framework"], DEMOS.map(demo => [
			() => a.c("page-link", demo.title).href(this.url + demo.slug + "/"),
			demo.mech ?? "none",
			() => a.c("page-link", "repo ↗").href(demo.original).attr("target", "_blank").attr("rel", "noopener"),
			() => a.c("page-link", "MIT ↗").href(demo.licence_url).attr("target", "_blank").attr("rel", "noopener"),
			demo.needed,
			demo.changed,
		])).ac("wide");

		md("**The rule for a licence:** read the actual `LICENSE` file on `github.com/codrops/<repo>`, never the badge — the licence column above links straight to the files read across all four rounds. **The rule for a substitution:** where the demo's own layout was a grid or a row, this framework's own word replaced it (`.grid.auto`, `--column`, `.flex.wrap.gap`) before any of the demo's original CSS did; every substitution is named in the table. `readme.md` has the porting rules, for whoever ports the next one.");
	},

	demo_card(demo){
		div.c("codrops-demo-card", () => {
			a().href(this.url + demo.slug + "/").append(() => {
				img.c("codrops-demo-still").attr("src", new URL(`./${demo.slug}/still.png`, import.meta.url).pathname).attr("alt", `${demo.title} — a still of the effect`).attr("loading", "lazy");
			});
			div.c("codrops-demo-body", () => {
				a.c("codrops-demo-title", demo.title).href(this.url + demo.slug + "/");
				a.c("codrops-demo-original page-link", () => { icon("open_in_new"); span("the original"); }).href(demo.original).attr("target", "_blank").attr("rel", "noopener");
			});
		});
	},
});
