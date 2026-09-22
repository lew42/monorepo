import { Page, md } from "/app.js";

/* Container: a plain page under /web/nav/, one level of the ordinary tree — not a
   columns host. Size: default (a reading column) — one card, nothing to lay out wide.
   Own layout: one previews() wall of the single child. Regions: none.
   Preview: the default card. */
export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "The study behind these nine patterns: does the page stay still when a column opens.",

	children: "study",

	content(){
		md("One study lives here: does navigation stay still when a column opens. Moved from `/imagine/design/navigation/` 2026-09-18 (`ai/2026-09-18/imagine-move-2/`) — the old address still answers.");
		this.previews();
	},
});
