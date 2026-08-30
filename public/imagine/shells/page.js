import { Page, md } from "/app.js";

/* Container: /imagine/'s columns row — this index is one column in it. Size:
   `large`, so the wall gets four cards at 1920. Own layout: previews(). Regions:
   one. Preview: the default card.

   ⚠ Every child opens FULL SCREEN, not as a column beside this one. A shell is
     the whole app, so it mounts in `app.$pages` as a sibling of /imagine/ and the
     row stands down — the arrangement contract's own rule. See Shell.js. */

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
		md(`Ten app shells, each at its own url, each wearing its own chrome and nothing of the site's. The first six wrap the **same document**, so the chrome is the only thing that changes.

Every shell's chrome links to every other one, so once you are in, the way you browse is the thing being shown. [The findings](/imagine/shells/readme/).`);

		this.previews();
	},
});
