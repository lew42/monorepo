import { Doc, md, code, h2, files } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Files",
	description: "A tree of real files, and the one you clicked — plain, resizable columns, no panels.",
	icon: "folder_open",

	notes: "about tree fetched columns",
	files: "files.js files.css page.js readme.md",

	overview: [
		{
			title: "With about",
			icon: "sticky_note_2",
			description: "The about hook, live — the same wiring ext/Doc's Files tab uses.",
			content(){

				code.js(`files(meta, names, { about: path => md.file(meta, "doc/file/" + path + ".md", { h1: false }) })`);

				md("The same files as this page's own **Files** tab, with the same hook wired up — click one, then drag the seam between the prose and the source:");

				files(import.meta, "files.js files.css page.js readme.md", {
					about: path => md.file(import.meta, `doc/file/${path}.md`, { h1: false }),
				}).ac("wide");

				md("Pass `about` and the browser is **three** columns instead of two. It is called once per shown path with a view — or a promise of one — and its return fills the `about` column. [About](/framework/ext/files/doc/about/) has the full contract and the capture trap.");
			},
		},
		{
			title: "Folders open and close",
			icon: "account_tree",
			description: "A folder opens to a depth you choose; deeper ones build their rows on first click.",
			content(){
				code.js(`files(meta, names, { open: 1 })`);

				md("`about/` starts open; `about/team/` doesn't — click it. A closed folder's rows don't exist until that click, which is what lets [`ext/files/fs.js`](/framework/ext/files/) hand this browser a whole directory of thousands of paths without building all of it up front:");

				files(import.meta, "../../start/example/index.html ../../start/example/app.js ../../start/example/page.js ../../start/example/about/page.js ../../start/example/about/team/page.js", { open: 1, route: false }).ac("wide");
			},
		},
	],

	content(){

		code.js(`files(import.meta, "example/index.html example/app.js example/page.js")`);

		md("Renders this — click a name, then drag the seam between the two columns:");

		files(import.meta, "../../start/example/index.html ../../start/example/app.js ../../start/example/page.js ../../start/example/about/page.js ../../start/example/about/team/page.js").ac("wide");

		md("Those are **real files on disk**, fetched. Not string literals in this page — so they can't drift, and if one is deleted the pane says so instead of quietly lying. [Fetched](/framework/ext/files/doc/fetched/) is the full argument.");

		h2("Two or three plain columns");

		md("The tree, and the one file you clicked, sit side by side in an ordinary flex row — no [ext/Panel](/framework/ext/Panel/) underneath it, since 2026-09-28. Drag the seam between two columns (an [ext/grip](/framework/ext/grip/) strip) to resize the one on its left; the other one just slides over, exactly like `core/Page`'s own resizable columns. Nothing is saved — every visit starts at the same width, the same trade the old panel arrangement made.");

		md("A folder opens and closes on click (`open: <n>` in the **Folders open and close** card above controls how many levels start open); the tree is never fully repainted on a selection, only the clicked row's highlight moves, so clicking around never loses your scroll position.");

		h2("Paths");

		md("Every path resolves against `import.meta`, never the document — the SPA fallback makes the document url a *route*, so a document-relative fetch misses.");

		md("The longest common directory is stripped for display, which is the one rule that makes a doc folder read as a project: `example/app.js` shows as `app.js`, and `example/about/page.js` shows as `about/page.js` — so the tree shows the structure you're teaching, not where you happened to park the files. [Tree](/framework/ext/files/doc/tree/) has the algorithm, and the selection bug it replaced.");

		h2("Highlighting");

		md("Soft dependency on [highlight](/framework/ext/highlight/): loaded, and a file arrives syntax-highlighted and **cached** by `code.file()` — which is what makes redrawing the source column on every click free. Not loaded, and it's plain text in a `pre` — an ext may lean on an ext, only **core** may never.");

		h2("Prose beside the source");

		md("`about` turns the tree into a small pseudo-IDE — a `.md` file's worth of *why*, next to the code it's about. **With about**, in the rail beside this text, shows it live on this module's own files. It's how [`ext/Doc`](/framework/ext/Doc/) builds every module's **Files** tab.");

		md("Next: [Toc](/framework/ext/toc/) — the section nav on the right of this page.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
