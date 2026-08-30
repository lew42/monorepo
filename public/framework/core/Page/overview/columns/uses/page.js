import { Page, View, md } from "/app.js";

/* One sheet for the four, loaded here: the Router imports THIS file to resolve any
   of them, so a cold deep link into an exemplar still gets it. */
View.stylesheet(import.meta, "uses.css");

/* Container: the app's page region. Size: prose, one column. Own layout: `.flow`
   plus the wall `previews()` draws. Regions: one — my four children are screens of
   their own, not panels of this one. Preview: the default card.

   Four apps, four MIXES of the same words. Nothing here is a new API: every page
   under this one is `new Page({ … })` with `columns()`, a `width:` word, `is:` and
   the odd one-line override. The generator writes trees like these from a seed;
   these four are the hand-written answer to "what goes where". */

export default new Page({
	meta: import.meta,
	title: "Uses",
	description: "Four real applications of the column shape — a docs tree, an inbox, a 3440 workbench, a split screen.",
	icon: "apps",

	children: "docs inbox workbench split",

	content(){
		md("The column words are cheap. The question the owner asked is **what goes where** — so here are four applications, each honest about the mix of words it needed and each ending in a one-line verdict on that mix.");

		md("| exemplar | the app | the mix |\n|---|---|---|\n| **Docs** | five levels of content | `columns()` + `width:` + `tabs()` in place |\n| **Inbox** | previews left, detail right | `width: \"small\"` + `is: \"topic\"` |\n| **Workbench** | 2, 3, 4 columns at 3440 | width words only — no new anything |\n| **Split** | height in two, both live | `solo flex v` + two `.pages` + `is: \"topic\"` |");

		md("The pieces they are built from: [`doc/columns.md`](/framework/core/Page/doc/columns/) (the row and the four width words), [`doc/roles.md`](/framework/core/Page/doc/roles/) (`is:` and `nearest()`), [`doc/panels.md`](/framework/core/Page/doc/panels/) (the height split).");

		this.previews();
	},
});
