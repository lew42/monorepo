import { Page, div, demo } from "/app.js";
import { sitemap } from "../parts.js";
import { columns } from "./columns.js";

export default new Page(demo.tree({
	meta: import.meta,
	title: "Columns",
	description: "Click a row and the next column opens beside it, as deep as the tree goes.",
	icon: "view_column",

	tree: () => columns(sitemap()),
	height: "24em",

	/* `demo.tree()`'s own card is deliberately bare — no label, an invisible link over
	   the tree. Correct in a rail of nothing but trees; in a wall of labelled cards it
	   reads as the one whose title failed to load. The standard card, with the tree as
	   its (inert) thumb, halved so it stands the same height as its siblings. */
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", () => this.box("22em"))); },

	note: "**Click down four levels** — Color › Tokens › Prim — and the trail stays on screen. Each column is one page's `children`; the lit rows are `demo.app`'s own `aria-current`, the same mark a sidebar reads. The last track is the leaf page itself, content and all.",

	/* `demo.tree()` prints its TREE as the lesson. Here the tree is filler and the
	   arrangement is the point, so this names the function that does the work —
	   four lines, because `...config` spreads last. */
	content(){
		demo.exhibit({
			page: this,
			stage: steer => this.stage(steer),
			def: columns,
			file: new URL("columns.js", this.meta.url).pathname,
			note: this.note,
		});
	},
}));
