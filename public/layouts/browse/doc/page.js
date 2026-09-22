import { Page, md } from "/app.js";

/* The two notes behind the browser, one topic each.

   ⚠ Each note is a DECLARED CHILD holding its own `content()`, not a bare name — the
     same shape `/layouts/doc/page.js` uses, and for the same reason. A bare name sends
     core down its probe chain (`page.js` first, the `.md` only as a last resort), so
     every visit to any page under here would log a 404 for a `page.js` that is never
     going to exist. Naming the file costs one line and the console stays clean. */

const note = (name, title, description) => [title, {
	description, icon: "article",
	content(){ return md.file(import.meta, name + ".md", { h1: false }); },
}];

export default new Page({
	meta: import.meta,
	title: "Docs",
	icon: "menu_book",
	description: "Where the ninety-nine came from, and what was settled while building the browser.",

	children: [
		note("inventory", "Inventory", "What an item is, which manifest each tier was read out of, and how the pictures were taken."),
		note("decisions", "Decisions", "Three tiers, pictures not instances, append-only verdicts — what was measured, and what is still the owner's call."),
	],

	content(){
		md("Two notes, one topic each.");
		this.previews();
	},
});
