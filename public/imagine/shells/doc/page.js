import { Page, md } from "/app.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row. No page grid — content sits in
                `.page-column-prose`, so only `bleed` reaches the edge.
   2 SIZE       `large` — the record is measurements and tables, wants room.
   3 OWN LAYOUT one sentence, then the record itself.
   4 REGIONS    one — core's. The record is a `route()` child, not a column.
   5 PREVIEW    core's default card.

   ── WHY THIS FILE EXISTS ──────────────────────────────────────────────────────
   `/imagine/shells/doc/` had no `page.js`, so `/imagine/shells/doc/decisions/`
   404'd and the readme's link went straight to raw `.md` instead — the exact
   trap `/imagine/paging/doc/page.js` was built to close, found here 2026-09-05.
   `route()`, not `children:`: a declared child is loaded eagerly by every page
   under /imagine/shells/, and `decisions` has no page.js of its own to answer
   that probe with. */

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "The long form for Shells — every measurement, what was rejected, and what is still open.",
	icon: "menu_book",
	width: "large",

	route(name){
		if (name !== "decisions") return null;

		const meta = this.meta;

		return {
			title: "Decisions — the record",
			description: "Every verdict this lab has taken, what was rejected, and the numbers that decided the 2026-09-05 UX pass.",
			width: "large",
			content(){ return md.file(meta, name + ".md", { h1: false }); },
		};
	},

	content(){
		md("**The long form for [Shells](/imagine/shells/).** The lab shows you the ten shapes; [Decisions](/imagine/shells/doc/decisions/) writes down why the grid is one template, what was measured, and what was rejected — start there before you change anything.");

		md("The short version is the [readme](/imagine/shells/readme/).");
	},
});
