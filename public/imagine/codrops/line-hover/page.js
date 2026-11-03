import { Page, View, div, span, a, h3, p, md } from "/app.js";

/* Ported from Codrops' "CSS Line Hover Styles for Links" (MIT) — see line-hover.css for
   the licence note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "line-hover.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, claims the row's leftover
   past its `large` parent — see grid-hover/page.js's comment for the measurement). Own
   layout: `.flex.wrap.gap` — a
   row of link tiles, framework's word for "as many as fit, wrap the rest" — instead of the
   original's fixed CSS grid (`repeat(auto-fill, minmax(280px,1fr))`); a menu is a row, not
   a grid of squares. Regions: one. Preview: default card. */

const STYLES = [
	["scale", "Overview", "An underline scales in from the left on hover, out to the right when you leave."],
	["swap", "Pricing", "The label slides left while an identical copy slides in from the right, under one underline."],
	["grow", "Docs", "The underline sweeps in and the label itself scales up 10%."],
	["double", "Support", "Two hairlines — above and below — fade up into place, one a beat after the other."],
	["sweep", "Blog", "A bar wipes down from the baseline, then back up, in one keyframe pass."],
	["pill", "Contact", "A rounded pill flattens into a baseline as the label lifts off it."],
];

export default new Page({
	meta: import.meta,
	title: "Menu hover effects",
	description: "Six CSS-only underline animations for a nav — hover any word.",
	icon: "menu",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' line hover styles, rebuilt as a menu.** Hover any word below — each one animates its underline (and sometimes itself) a different way. Every effect here is CSS only: no JavaScript runs on this page at all, in the original or in this port.");

		div.c("flex wrap gap codrops-line-wall", () => {
			STYLES.forEach(([variant, text, caption]) => {
				div.c("flex v gap codrops-line-item", () => {
					h3.c("codrops-line-label", variant);

					// every label sits in its own <span> — harmless for the variants whose
					// CSS doesn't target it, required for the three whose hover moves the
					// label itself (`grow`, `pill`) or swaps it for `data-text` (`swap`).
					const link = a.c(`codrops-link codrops-link--${variant}`, () => span(text)).attr("href", "#");
					if (variant === "swap") link.attr("data-text", text);

					p.c("codrops-line-caption muted", caption);
				}).style("--column", "14em");
			});
		}).style("--column", "14em");

		md("**What carried over:** all six animations are the original's CSS, mechanism for mechanism (the same `transform: scale3d`/`translate3d` pairs, the same keyframes for `sweep`) — only the class names changed, from mythological figures (`link--metis`, `link--leda`…) to what each one does, so a reader who has never seen the original can still tell them apart. **What didn't:** the row (`.flex.wrap.gap` here, a fixed CSS grid there), and nine of the original's fifteen styles — the ones drawn with an inline SVG path and `stroke-dashoffset` — dropped for this round; the table on the realm's index says why. `prefers-reduced-motion` turns every transition and keyframe here instant.");
	},
});
