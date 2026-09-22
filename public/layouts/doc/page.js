import { Page, md } from "/app.js";

/* The three notes behind the standard, one topic each.

   ⚠ Each note is a DECLARED CHILD holding its own `content()`, not a bare name.
     A bare name would send core down its probe chain — `page.js` first, the `.md`
     only as a last resort — so every visit to any page under /layouts/ logged three
     404s in the console for `page.js` files that were never going to exist. Naming
     the file here costs one line and the console stays clean. (Measured 2026-09-08:
     3 console errors on every page, 0 after.) */

const note = (name, title, description) => [title, {
	description, icon: "article",
	content(){ return md.file(import.meta, name + ".md", { h1: false }); },
}];

export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "The rules of the namespace, the wire spec, and the record.",

	children: [
		note("naming", "Naming", "What an id is, how to add a layout, and every word the standard defines."),
		note("wire", "Wire", "The drawing spec, field by field — enough to write one from a screenshot."),
		note("decisions", "Decisions", "What was settled and why, what was measured, and what is still open."),
		"studies",
	],

	content(){
		md("Three notes, one topic each, and the study that closed the set below them: real screenshots of every failure this book's approved five actually fixed. Moved here 2026-09-18 from `/imagine/design/layout/` — the old address still answers (`ai/2026-09-18/imagine-move-2/`).");
		this.previews();
	},
});
