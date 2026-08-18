import { Doc, md, code, h2, files } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Files",
	description: "A tree of real files, and the one you clicked — as panels you can resize, split and rearrange.",
	icon: "folder_open",

	notes: "about tree panels fetched decisions",
	files: "files.js panels.js files.css page.js readme.md",

	overview: [
		{
			title: "With about",
			icon: "sticky_note_2",
			description: "The about hook, live — the same wiring ext/Doc's Files tab uses.",
			content(){

				code.js(`files(meta, names, { about: path => md.file(meta, "doc/file/" + path + ".md", { h1: false }) })`);

				md("The same files as this page's own **Files** tab, with the same hook wired up — click one, then drag the seam between the prose and the source:");

				files(import.meta, "files.js panels.js files.css page.js readme.md", {
					about: path => md.file(import.meta, `doc/file/${path}.md`, { h1: false }),
				}).ac("wide");

				md("Pass `about` and the browser is **three** regions instead of two. It is called once per shown path with a view — or a promise of one — and its return fills the `about` panel. [About](/framework/ext/files/doc/about/) has the full contract and the capture trap.");
			},
		},
	],

	content(){

		code.js(`files(import.meta, "example/index.html example/app.js example/page.js")`);

		md("Renders this — click a name, then drag the seam between the two panels:");

		files(import.meta, "../../start/example/index.html ../../start/example/app.js ../../start/example/page.js ../../start/example/about/page.js ../../start/example/about/team/page.js").ac("wide");

		md("Those are **real files on disk**, fetched. Not string literals in this page — so they can't drift, and if one is deleted the pane says so instead of quietly lying. [Fetched](/framework/ext/files/doc/fetched/) is the full argument.");

		h2("Each region is a panel");

		md("The tree, the prose and the source are [ext/Panel](/framework/ext/Panel/) leaves, so the seams are grips: **drag** one to resize, **hover** a region for its bar, and split, move or close it from there. The `T` menu offers this browser's own four regions — not the site's section bands, and not `random`.");

		md("Nothing is saved. A `MemorySaver` means an arrangement lives as long as the page and every visit gets the seeded one — arranging here is exploring, not authoring. The axis is seeded too: a column below 640px, a row above, because a split holds its axis at every width. [Panels](/framework/ext/files/doc/panels/) has the whole argument, and what the flex columns it replaced were doing.");

		h2("Paths");

		md("Every path resolves against `import.meta`, never the document — the SPA fallback makes the document url a *route*, so a document-relative fetch misses.");

		md("The longest common directory is stripped for display, which is the one rule that makes a doc folder read as a project: `example/app.js` shows as `app.js`, and `example/about/page.js` shows as `about/page.js` — so the tree shows the structure you're teaching, not where you happened to park the files. [Tree](/framework/ext/files/doc/tree/) has the algorithm, and the selection bug it replaced.");

		h2("Highlighting");

		md("Soft dependency on [highlight](/framework/ext/highlight/): loaded, and a file arrives syntax-highlighted and **cached** by `code.file()` — which is what makes redrawing the source panel on every click free. Not loaded, and it's plain text in a `pre` — an ext may lean on an ext, only **core** may never.");

		h2("Prose beside the source");

		md("`about` turns the tree into a small pseudo-IDE — a `.md` file's worth of *why*, next to the code it's about. **With about**, in the rail beside this text, shows it live on this module's own files. It's how [`ext/Doc`](/framework/ext/Doc/) builds every module's **Files** tab.");

		md("Next: [Toc](/framework/ext/toc/) — the section nav on the right of this page.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
