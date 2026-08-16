import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Urls",
	description: "Which file becomes which page.",

	content(){

		md("```\ncore/View/\n    View.js\n    View.css\n    page.js                     ← calls new Doc()\n    overview/\n        demos/page.js           ← /framework/core/View/overview/demos/\n    doc/\n        capturing.md            ← /framework/core/View/docs/capturing/\n        method/\n            append.md           ← /framework/core/View/api/append/\n        property/\n            capture.md          ← /framework/core/View/api/capture/\n        file/\n            View.js.md          ← /framework/core/View/files/, beside the source\n```");

		md("Documenting anything is **writing a file**. No registration, no UI, no build step — which is the requirement, because the author here is usually an AI and a plain file is the only interface that needs nothing else present.");

		md("The segments a reader sees — `api/`, `docs/`, `files/` — are **section pages**. The tab bar is a nav over real children, so `/framework/core/View/api/` is a page you can link to, reload, and go back to.");

		md("`doc/file/` mirrors the module's own tree: a file at `overview/urls/page.js` is documented at `doc/file/overview/urls/page.js.md`. One `.md` per file, sitting beside the source in the [Files](/framework/ext/doc/files/) tab.");

		md("This page is the same idea one level down: `overview: \"urls\"` on the [Doc](/framework/ext/doc/) call site, and a `page.js` at `ext/doc/overview/urls/`. Declare a name, write the file — an Overview can hold as many sub pages as it earns.");
	}
});
