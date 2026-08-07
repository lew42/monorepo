import { Page, md, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Ext",
	description: "Opt-in addons. They may extend core; core never depends on them.",
	icon: "extension",
	children: "markdown demo highlight files toc classdoc",

	// No `nav` map: every label and icon here is the child's own, and this page
	// holds all six so the tab bar can read them. Six small modules against six
	// duplicated declarations — see core/Page/readme.md §"nav".
	initialize(){ this.load_all_children(); },
	content(){

		code.js(`import md from "/framework/ext/markdown/md.js";`);

		md("Opting in is an import. Nothing else.");

		md("Addons are allowed to do what core won't: patch `View`, bring a vendored dependency, ship their own CSS. Two rules — **core never imports an ext**, and **vendor the dependency** (a CDN import would make every render wait on someone else's uptime).");

		md("This site opts in for every page, once, in `app.js` — which is why `md()` and `demo()` come straight from `/app.js` here.");

		md(`| | |
|---|---|
| [markdown](/framework/ext/markdown/) | \`md()\`, \`view.md()\`, \`md.file()\` — vendors marked |
| [demo](/framework/ext/demo/) | code, result and real HTML in one box |
| [highlight](/framework/ext/highlight/) | \`code.js()\`, and every markdown fence on the site |
| [files](/framework/ext/files/) | a tree of real files, fetched |
| [toc](/framework/ext/toc/) | a page's own headings, with scroll spy |
| [classdoc](/framework/ext/classdoc/) | a class's methods as pages, from real source |

**An ext may lean on an ext** — \`demo\` renders highlighted code when
\`highlight\` is loaded and plain code when it isn't, with no import either way. Only
**core** may never.`);

		/* previews(), not tabs(). This page carried a tab bar for a long time on the
		 * argument that its children are flat and you flip between them — but the bar
		 * mounts every child INSIDE this page, so each one inherited this page's
		 * reading measure. `files` is a tree beside a code pane and wants the room;
		 * measured, it had 847px of a 1253px region.
		 *
		 * Cards mount them in the region instead, at the region's width, where a page
		 * that needs to be wide can say so. And the sidebar already lists all six, so
		 * the bar was a second navigation for one set. */
		this.previews();
	}
});
