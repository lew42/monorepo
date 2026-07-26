import { Page, p, h2, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page",
	description: "Page — a titled, linkable, dormant unit of content.",
	content(){

		p("A `Page` is a titled, linkable unit of content. It is dormant: creating one renders nothing, so a module can `export default new Page(...)` and importing it is always safe. It renders when it gets placed — appended to a view, or loaded by the app as THE page.");

		h2("Usage");

		pre(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "My Page",
    content(){
        p("Renders top-to-bottom, captured, synchronous.");
    }
});`);

		p("Passing `import.meta` lets the page derive its own `url`, so links are never hard-coded.");

		h2("Object form");

		pre(`export default new Page({
    meta: import.meta,
    title: "Docs",
    description: "Sets the meta description on activate.",
    content(){
        p("Inside content(), this === the page instance.");
    }
});`);

		p("Any extra properties you pass are simply assigned to the page — inert data until something reads them. Only `title`, `description`, `theme`, and `classes` have built-in behavior.");

		h2("link()");

		p("Import a page just to link to it — no render required: ", this.link(), " (that link is `this.link()` — this page linking to itself).");

		pre(`import guide from "./guide/page.js"; // dormant — nothing renders

p("Start with ", guide.link());`);

		h2("render() vs activate()");

		p("`render(target)` builds the DOM — it runs for embedded sub-pages too, and is idempotent. `activate()` means \"you are now THE page\": it sets `document.title`, the meta description, and the body `theme` class. The app calls `pg.activate?.()` on the loaded page's default export — embedded pages render but never activate, so composing pages can't clobber the document title.");

	}
});
