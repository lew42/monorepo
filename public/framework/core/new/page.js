import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "core/new",
	description: "Three sketches, in order: the design proof for what's now core/App, core/Page and core/Router. None of it is imported.",
	icon: "science",

	children: "0 starter 1",

	content(){

		code.js(`0/         the Router-less MVP — App↔Page, three UI modes, no routing
starter/   first real Router — lazy children, found the column layout's limit
1/         WHERE THE SHIPPING DESIGN WAS PROVED — Router.js is line-for-line core/Router/`);

		md("Three prototypes that got smaller and more certain in that order, not three redundant drafts. Each is what the previous one's open questions became — read [0](/framework/core/new/0/), then [starter](/framework/core/new/starter/), then [1](/framework/core/new/1/), the one whose `readme.md` is the long-form record `core/App/`, `core/Page/` and `core/Router/` cite for their measurements.");

		md("**⚠ Don't import anything under here.** `public/` is the deploy artifact, so a stray `../new/1/Page.class.js` resolves to a real file and yields a *second, different* `Page` class — same name, silently wrong instance. That's the one framework-wide trap this directory is named in: see `instanceof across core/ and core/new/` in [the framework readme](/framework/).");

		md("Nobody imports this tree — grepped, zero live callers — and `core/`'s own page does not list `new` as a child, so it sits outside the site's navigation on purpose, the same way [`ext/DesignTool`](/framework/ext/DesignTool/)'s audit explicitly excludes it from its crawl. This page and its children exist to be read, not browsed to by accident.");

		md.details(import.meta, "readme.md", "What each tier proved, and why three instead of one");
	}
});
