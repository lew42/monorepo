import { Page, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "MVP",
	description: "The smallest page.js.",
	content(){
		p("The smallest possible page: a title and some content. `meta: import.meta` lets it derive its own URL, so links are never hard-coded.");

		pre(`import { Page, h1, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Text",
    content(){
        h1("Heading");
        p("Body copy.");
    }
});`);

		p("Creating a Page renders nothing — it is *dormant* — so importing a page.js is always safe. It renders only when placed: by a Pager, or by `View.append`.");

		p("`content` can also be a plain string, a view, or an array — `render()` handles them all. A function gets `this` bound to the page.");
	}
});
