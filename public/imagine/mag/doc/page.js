import { Page, md, a, span, div } from "/app.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row, same as every other page in the
                magazine — `column_host()` takes the shallowest claim.
   2 SIZE       none — the default track. One record and one sentence do not need
                `large`'s 64em; this is an index, not a wall.
   3 OWN LAYOUT one sentence, one link.
   4 REGIONS    one — core's. `decisions` is a `route()` child, not a column here.
   5 PREVIEW    core's default card.

   ── WHY THIS FILE EXISTS ──────────────────────────────────────────────────────
   `/imagine/mag/doc/` had no `page.js`, so it 404'd outright, and the two links
   INSIDE `readme.md` and `decisions.md` that pointed at each other's `.md` file
   left the app for raw markdown instead — the same trap named in `doc/columns.md`,
   here twice over. `/imagine/paging/doc/page.js` solved this first; this is the
   one-record version of the same fix. */

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "The record — what was chosen, what it was measured against, what was rejected.",
	icon: "menu_book",

	// ⚠ `route()`, not `children:` — a declared child is probed eagerly
	// (`load_all_children()`); the magazine has exactly one record and it should
	// 404 nobody's console until somebody actually asks for it by name.
	route(name){
		if (name !== "decisions") return null;

		const meta = this.meta;

		return {
			title: "Decisions",
			description: "What was chosen, what it was measured against, and what was tried and dropped.",
			content(){ return md.file(meta, "decisions.md", { h1: false }); },
		};
	},

	content(){
		md("**The long form for [the magazine](/imagine/mag/).** The cover and the issue show you the thing; this writes down why it is built the way it is, what was measured, and what was rejected.");

		a.c("page-preview").href(this.url + "decisions/").append(() => {
			span.c("page-preview-title", "Decisions — the record");
			div.c("page-preview-desc", "The composition in three choices, what the numbers decided, what was rejected, and what bit.");
		});

		md("The short version is the [readme](/imagine/mag/readme/).");
	},
});
