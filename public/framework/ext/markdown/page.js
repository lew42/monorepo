import { Page, p, h2, pre } from "/app.js";
import md from "./md.js"; // importing also installs View.prototype.md()

export default new Page({
	meta: import.meta,
	title: "Markdown",
	description: "Markdown as a View addon — md(), view.md(), md.file().",
	content(){
		md("Markdown rendering as a **View addon**, not a class. Importing `md.js` installs `View.prototype.md()`; the default export is the `md()` factory. `marked` is vendored next to it — no CDN, no runtime dependency on anyone else.");

		h2("view.md() — inline, on any element");
		p().md("A `p()` with **bold**, *italic*, and a [link](/framework/). Block containers get `marked.parse()`; phrasing elements like this one get `parseInline()`, so you don't nest a `<p>` inside a `<p>`.");

		h2("md() — you get the element you wrote");
		p("Content is parsed, and a single root block is adopted directly — so `md(\"Hi.\")` really is a `<p>` and chains like one. Multiple blocks get wrapped in a `div.md`. Either way it captures into the surrounding view like any factory:");
		md("Single paragraph → a real `<p>`, chainable.").ac("note");
		md.c("note", "And `md.c()` — classes first, like `div.c()`.");
		md("### Single heading → a real `<h3>`");
		md("Multiple blocks are wrapped:\n\n- with a list\n- of items\n\n> and a quote");

		h2("md.file() — a readme is a page");
		p("`md.file(import.meta, url)` fetches and parses a file, resolved against the **module's** url — not the document's. That matters here: with the SPA fallback the document url is the route, so a document-relative fetch would miss from any page without a trailing slash.");

		pre(`export default new Page({
    meta: import.meta,
    title: "Pager",
    content(){ return md.file(import.meta, "readme.md", { h1: false }); }
});`);

		p("That `{ h1: false }` drops the readme's leading heading — a readme opens with its own title and a `Page` already renders `title` as an h1. See `core/Pager/` in the sidebar: that page is nothing but its readme.");

		p("It returns a *promise* of a `div.md`, which is why that works with no change to `Page`: `View.append` already dispatches promises to `append_promise`. Returning a promise also lets `App.load_page` await the fetch before it swaps the DOM, preserving the no-flash guarantee.");

		h2("The rest of this page is `readme.md`");
		p("Everything below is `md.file(import.meta, \"readme.md\", { h1: false })` — the module's design record, rendered by the module it documents.");

		return md.file(import.meta, "readme.md", { h1: false });
	}
});
