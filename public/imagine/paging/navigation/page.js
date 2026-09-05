import { View, div, span, p, a, h2, md } from "/app.js";
import { Paging } from "../paging.js";
import { PagingNavLab } from "./lab.js";
import { FINDINGS, WORST } from "./findings.js";

View.stylesheet(import.meta, "navigation.css");

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the paging realm's middle (`.pages.paging-app-centre`). `Paging`
                returns `undefined` from `column_host()`, so a page here is an
                ordinary page with the page grid — `main` capped at the 40em measure,
                `wide` starting on the same left edge and taking every leftover pixel.
   2 SIZE       the middle is the viewport minus the realm's rail: ~1040px at 1280
                and ~3000px at 3440. Prose stays in `main`; the two lab boxes and the
                measured wall claim `wide`, so they stack at 1280 and spread at 3440.
   3 OWN LAYOUT one sentence, the two labs, the measured wall, the four demos. One
                rhythm per box, the `gap` utility throughout.
   4 REGIONS    one. The four demos are pages of the realm's middle, reached from the
                wall at the bottom — not regions of this page.
   5 PREVIEW    core's default card, on /imagine/paging/'s wall.

   ⚠ NO MODE TOOLBAR (`axes: ""`). This page is about what a click does to the
     screen; a strip of chips that changes the screen on every press would be
     competing with the thing being measured.                                     */

// Calmest first, so the wall reads from "nothing moved" to "everything did".
const worst = f => (f.moved && f.jumped) ? Math.max(...f.moved, ...f.jumped) : Infinity;
const ROWS = [...FINDINGS].sort((a, b) => worst(a) - worst(b));

export default new Paging({
	meta: import.meta,
	title: "Navigation",
	description: "Stable or dynamic: does the click move what you were reading?",
	icon: "swipe_left",
	axes: "",
	index: true,
	depth: 1,

	takeaway: "**Press the buttons in both boxes below.** The left box moves the thing you were reading; the right box does not. That is the whole difference between the two kinds of navigation on this site.",

	children: "columns stage tabs screen doc",

	content(){
		this.lede();

		div.c("grid auto gap paging-nav-labs wide", () => {
			new PagingNavLab({ says: "Something moves. A column appears and the row reflows; a panel changes height and the page under it slides." });
			new PagingNavLab({ steady: true, says: "Nothing you were looking at moves. The columns keep their widths; the panel keeps its height." });
		});

		md("Same three columns, same two panels, same two buttons. **Two CSS rules** are the only difference, and both are on the next page: [columns that keep their width](/imagine/paging/navigation/columns/).");

		h2("Every way this site navigates, measured");

		md("Two numbers per card — how far the thing you were reading slid **sideways**, and how far it slid **up or down**. Each pair is `1280 · 3440`, and **clicking a card performs that gesture on the real page**, so you can feel the number. (The bars are a square-root scale so the small ones stay visible; the numbers are exact.)");

		div.c("grid auto gap paging-nav-grid wide", () => ROWS.forEach(row => this.finding(row)));

		h2("Four demos that measure zero");

		md("One idea, four places: **give the thing that changes a size of its own, before it changes.**");

		this.previews();

		md("How each number was taken, and the raw before/after boxes: [the measurements](/imagine/paging/navigation/doc/measurements/). The rule this realm now runs on: [decisions](/imagine/paging/doc/decisions/).");
	},

	/* ONE CARD — the badge, the name, the two numbers, and the sentence a reader
	   should leave with. The whole card is the link, so "read the finding" and "go
	   and do it" are one gesture rather than two.
	   ⚠ NOT `card()`. `card` is DATA core reads off a page (`Page.nav()` returns
	     `card: this.card` as the preview's class list), so a method by that name
	     dies three frames away inside core, on the PARENT's wall:
	     `arg.split is not a function`. Bit here on the first load, 2026-09-05. */
	finding(row){
		return a.c("paging-nav-card").href(row.url).append(() => {
			span.c("paging-nav-kind paging-nav-kind-" + row.kind, row.kind);
			span.c("paging-nav-card-name", row.name);
			this.metric("moved", row.moved);
			this.metric("jumped", row.jumped);
			p.c("paging-nav-card-say", row.says);
		});
	},

	// `null` is the takeover: there is no distance, because the thing you were
	// reading left the screen. A full bar and the words, rather than a fake number.
	metric(label, pair){
		const px = pair ? Math.max(...pair) : null;
		const share = px === null ? 100 : Math.round(Math.sqrt(px / WORST) * 100);

		return div.c("paging-nav-metric").ac(px === 0 && "paging-nav-good").append(() => {
			span.c("paging-nav-metric-name", label);
			span.c("paging-nav-metric-px", pair ? pair.join(" · ") + "px" : "off screen");
			div.c("paging-nav-bar", () => { div.c("paging-nav-bar-fill").style("width", share + "%"); });
		});
	},
});
