import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "core/new",
	description: "The design proof for what's now core/App, core/Page and core/Router. None of it is imported.",
	icon: "science",

	children: "1",

	content(){

		code.js(`1/   WHERE THE SHIPPING DESIGN WAS PROVED — Router.js is line-for-line core/Router/`);

		md("`0/` (the Router-less MVP, no routing) and `starter/` (first real Router, lazy children, found the column layout's limit) were the two earlier drafts — deleted 2026-08-30 (simplify audit #1: 445 files, 2.8MB, zero importers), their value already fully extracted into `1/` and its readme. `1/`'s `readme.md` is the long-form record `core/App/`, `core/Page/` and `core/Router/` cite for their measurements.");

		md("**⚠ Don't import anything under here.** `public/` is the deploy artifact, so a stray `../new/1/Page.class.js` resolves to a real file and yields a *second, different* `Page` class — same name, silently wrong instance. That's the one framework-wide trap this directory is named in: see `instanceof across core/ and core/new/` in [the framework readme](/framework/).");

		md("Nobody imports this tree — grepped, zero live callers — and `core/`'s own page does not list `new` as a child, so it sits outside the site's navigation on purpose, the same way [`ext/DesignTool`](/framework/ext/DesignTool/)'s audit explicitly excludes it from its crawl. This page and its children exist to be read, not browsed to by accident.");

		md.details(import.meta, "readme.md", "What each tier proved, 0/ and starter/ included");
	}
});
