import { Page, md, code, h2, files } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Files",
	description: "A tree of real files, and the one you clicked.",
	icon: "folder_open",

	/* A tree beside a code pane is two columns, and two columns do not fit in a
	   reading measure — the pane was down to about 24em, which is narrower than the
	   lines it holds. So the prose keeps the measure and the component escapes it:
	   `classes: "grid"` plus `.ac("wide")` on the one thing that needs the room.
	   This is what the breakout grid is for, and it is the first real call site.
	   No `toc()` — the two layouts do not combine (see ext/toc/toc.css). */
	classes: "grid",

	content(){

		code.js(`files(import.meta, "example/index.html example/app.js example/page.js")`);

		md("Renders this — click a name:");

		files(import.meta, "../../start/example/index.html ../../start/example/app.js ../../start/example/page.js ../../start/example/about/page.js ../../start/example/about/team/page.js").ac("wide");

		md("Those are **real files on disk**, fetched. Not string literals in this page — so they can't drift, and if one is deleted the pane says so instead of quietly lying.");

		h2("Paths");

		md("Every path resolves against `import.meta`, never the document — the SPA fallback makes the document url a *route*, so a document-relative fetch misses.");

		md("The longest common directory is stripped for display, which is the one rule that makes a doc folder read as a project: `example/app.js` shows as `app.js`, and `example/about/page.js` shows as `about/page.js` — so the tree shows the structure you're teaching, not where you happened to park the files.");

		h2("Highlighting");

		md("Soft dependency on [highlight](/framework/ext/highlight/): loaded, and a file arrives syntax-highlighted and cached by `code.file()`. Not loaded, and it's text in a `pre`. An ext may lean on an ext — only **core** may never.");

		md("Next: [Toc](/framework/ext/toc/) — the section nav on the right of this page.");

		md.details(import.meta, "readme.md", "Design record — why fetch, and the one option it doesn't have");
	}
});
