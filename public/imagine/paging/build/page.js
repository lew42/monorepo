import { a, icon, span, md } from "/app.js";
import { Paging } from "../paging.js";

/* ── THE BUILDER MOVED ─────────────────────────────────────────────────────────

   This page WAS the page builder: controls on the left, the page assembling live in
   the middle, the `page.json` and the `page.js` underneath. Make was the other half —
   the list of every page you had made, with no live page anywhere on it.

   Two screens for one job was the defect. You made a page here and found out what it
   looked like there, or the other way round, and neither could finish the job alone
   (the owner, 2026-09-13: *"i have no idea what this is… are they rendered somewhere?
   were they supposed to be?"*). So the builder is now the RIGHT PANE of
   `/imagine/paging/make/`, beside the tree it always needed and over the live page it
   already had. Nothing was lost: the seven-word bar, the name fields, the icon, the
   blocks, the file and the `page.js` are all there, and the tree is there too.

   ⚠ THIS URL STAYS ALIVE ON PURPOSE. The rail links it, the docs link it, and so do
     five task logs — a 404 is a worse answer than a sentence and a link. What it may
     never become again is a second editor.
   ⚠ WHAT IS STILL IN THIS DIRECTORY, and why it is not dead code: `words.js` is the
     node vocabulary (the blocks, the icons, the default flag, the `page.js` printer)
     and `draw.js` is the one renderer for a page's blocks — Make's settings pane and
     `../stage.js` both import them. `build.css` is `draw.js`'s sheet. `stage.js` went
     with the builder: `../stage.js`'s `PagingStage` draws the page now, which is the
     same class a saved page draws at its own url.                                 */

export default new Paging({
	meta: import.meta,
	title: "Build",
	description: "The builder is part of Make now — one screen, with the tree and the live page.",
	icon: "construction",
	heading: true,

	content(){
		md("**The builder moved into [Make](/imagine/paging/make/).**").ac("paging-lede");

		md("It was two screens for one job: this page had the live page and no tree, Make had the tree and no live page. Now there is one screen — the tree on the left, the page itself in the middle, and every control that used to be here on the right.");

		a.c("paging-act").href("/imagine/paging/make/").append(() => {
			icon("add_circle_outline");
			span("Open Make");
		});

		md.details(import.meta, "readme.md", "What was here, and where each part went");
	},
});
