import { Page, demo, md, div, span } from "/app.js";

/* A ResizeObserver fires the moment it observes, so the first number arrives AFTER
   layout instead of while the box is still detached and measuring zero. */
const live = (el, fn) => new ResizeObserver(fn).observe(el);

/* One lit band per track, wearing its own width. `offsetWidth` is the element's OWN
   box, so a stage's `zoom` cannot lie to it — and a band fills its track exactly, so
   this number IS the track. */
const band = (classes, name) => div.c(classes + " pad", $v => {
	let $px;

	div.c("flex split v-center gap", () => {
		span.c("h4", name);
		$px = span.c("h4");
	});

	live($v.el, () => $px.text(Math.round($v.el.offsetWidth) + "px"));
}).style("--pad", "0.7em");

/* A bare page — no region, no demo app, so the tokens are the ones `.page` declares for
   itself. A new Page per call: render() caches its view, and the card and the stage must
   not fight over one node.
   ⚠ `default`, NEVER `active-page`. `default` is the contract's own word for "shown
     without being routed to" (Page.css:8), and it is what ext/demo marks. This board also
     renders inside the wall's thumb on the Doc above — and ONE `.page.active-page` in
     there makes that whole Doc match `.active-ancestor:has(.page.active-page)`, so it
     stays on screen as a PEER of the routed leaf and both pages get half the region. */
// No title: the routed page already carries the `h1`, and a second Page called
// "Shell" also stamps a second `page--shell` on the document.
const board = () => new Page({
	content(){
		// `.surface` on all three: the two washes differ by 6 greys, and what a reader
		// has to see here is where a track STARTS and ENDS — that is an edge, not a fill.
		band("surface", "main");
		band("wide surface wash", "wide");
		band("bleed surface tint", "bleed");
	},
}).render().ac("default");

export default new Page({
	meta: import.meta,
	title: "Shell",
	group: "The box",
	description: "main / wide / bleed — the three tracks every page already has, lit.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", board)); },

	content(){
		md("Every page is one grid with three tracks and **no class asks for it**. `main` is `--measure`, `wide` is everything left over, `bleed` spends the two gutters. A child claims a track with `.wide` or `.bleed`; with neither it lands in `main`.");

		md("**Press mobile, then mega.** Wherever the page is narrower than `--measure`, `main` and `wide` read the *same* number — there is nothing left over to give. At 3440 `wide` is several times `main`, and only `bleed` ever reaches the edge.");

		demo.stage(() => board()).ac("bleed");
		demo.source(board, "Source");
	},
});
