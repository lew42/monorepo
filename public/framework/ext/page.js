import { Page, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Ext",
	label: "Extensions",
	description: "Opt-in addons. They may extend core; core never depends on them.",
	icon: "extension",
	children: "markdown demo highlight files toc Doc tabs catalog layout drawer depth DesignTool Saver Draggable editor Panel Timeline AITask JSONL Ask",

	content(){

		code.js(`import md from "/framework/ext/markdown/md.js";`);

		md("Opting in is an import. Nothing else.");

		this.previews();

		md("Addons are allowed to do what core won't: patch `View`, bring a vendored dependency, ship their own CSS. Two rules — **core never imports an ext**, and **vendor the dependency** (a CDN import would make every render wait on someone else's uptime).");

		md("This site opts in for every page, once, in `app.js` — which is why `md()` and `demo()` come straight from `/app.js` here.");

		md("**An ext may lean on an ext** — `demo` renders highlighted code when `highlight` is loaded and plain code when it isn't, with no import either way. `Doc` leans on `tabs` for its vertical rail and on `files` for its Files tab. Only **core** may never.");

		md("Next: [Markdown](/framework/ext/markdown/) — the ext every other page on this site is written in.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
