import { Page, md } from "/app.js";

/* ⚠ The note is a DECLARED CHILD holding its own `content()`, not a bare name.
   A bare name sends core down its probe chain — `page.js` first, the `.md` only
   as a last resort — so every visit to any page under here would log a 404 in
   the console for a `page.js` that was never going to exist. Naming the file
   costs one line and the console stays clean. (/layouts/doc/ measured it:
   3 console errors on every page, 0 after, 2026-09-08.) */

const note = (name, title, description) => [title, {
	description, icon: "article",
	content(){ return md.file(import.meta, name + ".md", { h1: false }); },
}];

export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "What was settled while building the three, what was measured, and what was left.",

	children: [
		note("decisions", "Decisions", "Every choice these three layouts make, what it was measured against, and the four that are the owner's to make."),
		/* ⚠ THE TITLE MUST SLUGIFY TO THE FILE NAME. The url comes from the title, the
		   `.md` from the first argument: "The critic's pass" routes to
		   `/doc/the-critics-pass/`, so `/doc/critique/` fell through to `Page.file()`
		   and logged a 404 for a `page.js` that was never going to exist — the very
		   thing the note above this list exists to avoid. */
		note("critique", "Critique", "Eleven things a four-width sweep could not see — what a second pass at six widths and an 80px wall sweep found in the three layouts, and what changed."),
	],

	content(){
		md("Two notes: the record behind the three layouts, and what a critic found in them afterwards.");
		this.previews();
	},
});
