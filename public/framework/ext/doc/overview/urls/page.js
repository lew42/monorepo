import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Urls",
	description: "Which file becomes which page.",

	content(){

		md("```\ncore/View/\n    View.js\n    page.js                     ← calls classdoc.page()\n    overview/\n        demos/page.js           ← /framework/core/View/overview/demos/\n    doc/\n        capturing.md            ← /framework/core/View/docs/capturing/\n        method/\n            append.md           ← /framework/core/View/api/append/\n            ac.md\n        property/\n            capture.md          ← /framework/core/View/api/capture/\n```");

		md("Documenting a member is **writing a file**. No registration, no UI, no build step — which is the requirement, because the author here is usually an AI and a plain file is the only interface that needs nothing else present.");

		md("The two segments a reader sees, `api/` and `docs/`, are **group pages** — the tab bar is a nav over real children, so `/framework/core/View/api/` is a page you can link to, reload, and go back to.");

		md("This page is the same idea one level down: `overview: \"urls\"` on the [Classdoc](/framework/ext/classdoc/) call site, and a `page.js` at `ext/classdoc/overview/urls/`. Declare a name, write the file — an Overview can hold as many sub pages as it earns.");
	}
});
