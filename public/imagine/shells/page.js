import { Page, md } from "/app.js";

/* Container: /imagine/'s columns row — this index is one column in it. Size:
   `large`, so the wall gets four cards at 1920. Own layout: previews(). Regions:
   one. Preview: a real still of the shell itself (Shell.js), not an icon.

   ⚠ Every child opens FULL SCREEN, not as a column beside this one — the
     `takeover` mechanism (/imagine/paging/), unnamed here until this pass. A
     shell is the whole app, so it mounts in `app.$pages` as a sibling of
     /imagine/ and the row stands down — the arrangement contract's own rule.
     See Shell.js.

   A 3-column-card row (owner's brief, 2026-09-05 — title+intro left, the shell's
   own still centre, its `finding` text right) was built and measured against
   this wall: same width used and dead space either way (the column's own word
   caps both, regardless of what is inside it), but height went 998→3568 at
   1280 and 1289→4038 at 3440 — roughly 3.5x taller for ten rows of one shell
   each, and the right column only repeated words the still already shows.
   Reverted; the wall reads all ten shapes in one glance instead of one long
   scroll. Numbers: doc/decisions.md. */

export default new Page({
	meta: import.meta,
	title: "Shells",
	description: "App shell layouts — rails, bars, a canvas, and chrome inside chrome.",
	icon: "dashboard",
	width: "large",

	// THE CARDS ARE THE NAV. `previews()` below already draws these ten pages, so core
	// leaves its own rail out — one word where this page used to restate the whole of
	// `column()` (doc/columns.md).
	index: true,

	children: "left right both foot head-foot rail-foot canvas inner-rail inner-bar columns",

	content(){
		md(`**"Chrome"** is everything around a page that isn't the content itself — the nav rails, header bars, and footers framing it. Below are ten complete example apps, one per way of arranging that chrome — **each card is a real screenshot of its own shell**, so you can see the shape before you click. **Click a card** to open one at its own url.

The first six wrap the **same document**, so the chrome is the only thing that changes between them. And every shell's chrome links to every other shell, so once you're inside, switching between them IS the demo. [The findings](/imagine/shells/readme/).`);

		this.previews();
	},
});
