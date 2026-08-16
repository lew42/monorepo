import { Doc, md, code, h2, h3, toc } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Toc",
	description: "This page's own headings, as a nav, with the current one marked.",
	icon: "toc",

	notes: "skip-list",
	files: "toc.js toc.css page.js readme.md",

	content(){

		toc();

		code.js(`content(){
    toc();
    h2("One");   // …
}`);

		md("That's it. Widen this window past `82em` and the rail appears on the right — it found the headings on this page by itself.");

		h2("Nothing is declared");

		md("It scans the enclosing `.page` for `h2`/`h3` (and the `.h2`/`.h3` classes), gives each one an `id` derived from its text, and links to it. **Add a section and it's in the nav** — a table of contents you have to maintain is a table of contents that disagrees with the page.");

		h3("What it skips");

		md("A heading that is *part of an example* is not a section of the page. So `demo()` blocks, the collapsed `md.details` readme, file trees, tab bars and sidebars are all excluded — otherwise every `h1(\"Hello\")` in a demo would show up as a destination.");

		code.js(`div.c("grid gap auto toc-skip", () => stats())   // not sections`);

		md("`toc-skip` is the opt-out for the case that list cannot guess: a page rendering a **real component** rather than an example of one. A stat tile's value is an `.h2` because it is big, not because it is a section — [Versus](/framework/versus/) had `714 · 21 KB · 0 · 0 · 0` in its rail until it said so. Full story, including the gallery this defeated first: [Skip list](/framework/ext/toc/docs/skip-list/).");

		h2("Scroll spy");

		md("The current section is the last heading whose top has passed the reading line. **Not an `IntersectionObserver`** — between two widely spaced headings nothing is intersecting at all, and *\"no section is current\"* is never the answer a reader wants.");

		md("The scroll listener is on `.pages`, because **the region scrolls, not the page**. A `window` listener would never fire.");

		h2("Why it appears one microtask late");

		md("When `toc()` runs, `content()` is still on its first line — the headings don't exist yet. So it places the container **synchronously**, while the captor is still correct, and fills it in a microtask, naming its target explicitly.");

		md("That's the one blessed shape for late content here, and the timing matters: a microtask runs after `render()` returns and **before the browser paints**, so the rail is never on screen empty.");

		h2("Only on a plain reading page");

		md("Every current caller is a page with **no `overview:` rail of its own** — `toc()` is the only right-side nav they get. A `Doc` that *does* declare `overview:` already has a left rail (the catalog), and `toc()` there wouldn't add a second nav so much as build one that never shows: the catalog's active child mounts one grid level too deep for `toc.css`'s selector to ever match, so the rail would build, scan and spy in silence. Nobody has hit this yet — see the readme for the exact selector.");

		md("Next: [Doc](/framework/ext/doc/) — a module documented as a page.");

		md.details(import.meta, "readme.md", "Design record — fixed vs sticky, and the observer that didn't work");
	}
});
