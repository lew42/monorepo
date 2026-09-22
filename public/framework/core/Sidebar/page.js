import { Sidebar, Doc, md, demo, div, h2, toc } from "/app.js";
import sample from "/framework/ext/demo/sample.js";

/* Real urls, so `.active` / `.in-path` light up on their own as you navigate —
 * nothing here compares window.location. */
const pages = [
	{ title: "Framework", pages: [
		{ title: "Start",  url: "/framework/start/",  icon: "flag" },
		{ title: "Core",   url: "/framework/core/",   icon: "dashboard" },
		{ title: "Styles", url: "/framework/styles/", icon: "view_quilt" },
	]},
	{ title: "Core classes", pages: [
		{ title: "View",   url: "/framework/core/View/",   icon: "image" },
		{ title: "Page",   url: "/framework/core/Page/",   icon: "description" },
		{ title: "Router", url: "/framework/core/Router/", icon: "alt_route" },
	]},
];

export default new Doc({
	meta: import.meta,
	title: "Sidebar",
	description: "A brand over a tree of links, resizable by its own edge. Not owned by any layout — any page can render one.",
	icon: "view_sidebar",

	subject: Sidebar,

	properties: "root pages brand brand_url logo logo_url app",

	methods: "render bar header toggle open menu filter nav filtered apply_filter fold_state restore_fold tree_nodes reveal footer grab size store favicon",

	notes: "entries placement views tokens narrow comp decisions",

	files: "Sidebar.js Sidebar.css page.js readme.md",

	content(){

		toc();

		demo(() => {
			new Sidebar({ brand: "LEW42", pages: [
				{ title: "Start", url: "/framework/start/" },
				{ title: "Core",  url: "/framework/core/" },
			]}).style({ width: "13em" });
		}, "`brand` and `pages`. That is the whole API for a hand-typed list — an entry is a `{title, url}` or a real `Page`. Every row is a real [`ux/Tree`](/framework/ux/Tree/) row now: the keyboard works, and so does the handle on the right edge — **drag it.**");

		h2("A live page, five levels and all");

		demo(() => {
			div.c("flex gap", $box => {
				// Fictional urls (`sample()`'s tree lives only in memory) — this stops
				// a row's real `<a href>` from reaching the real Router, same problem
				// `ext/demo/app.js`'s `followed()` solves, one line instead of a box.
				$box.on("click", e => e.target.closest("a") && e.preventDefault());

				new Sidebar({ brand: "Web", root: sample() }).style({ width: "15em" });
			});
		}, "`root: <a real Page>` — the whole subtree, walked lazily by `Tree.from()`: a branch fetches its own children the first time you open it, so a fifty-page section still costs one row until you ask. Folding is always on: open **HTML**, then open a sibling, and watch the first one shut — that is `adapt`, showing the path you are on and nothing else. **Type into the box above the tree** — try `syn` once HTML or JS is open — and it narrows to the rows that match, keeping every branch that leads to one visible and open; clear the box (or press **Escape**) and the tree folds back to exactly how you left it. This is what `/framework/`'s own sidebar will read once its `page.js` passes `root: this` instead of `pages: this.sections()` — one line, outside this module; [Decisions](/framework/core/Sidebar/doc/decisions/) has the rest of the list.");

		h2("Groups and icons");

		demo(() => {
			new Sidebar({ brand: "LEW42", pages }).style({ width: "15em" });
		}, "An entry with **`pages` of its own** is a titled group — a branch with no link of its own, same as a group heading always was. An entry with **`icon`** gets a glyph. Both are inert data, so a real `Page` takes them straight in its constructor.");

		md("```js\nnew Sidebar({\n    brand: \"LEW42\",\n    pages: [\n        { title: \"Core classes\", pages: [\n            { title: \"View\", url: \"/framework/core/View/\", icon: \"image\" },\n        ]},\n    ],\n});\n```");

		h2("It has no colours of its own");

		demo(() => {
			div.c("flex gap", () => {
				new Sidebar({ brand: "Dark", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
				new Sidebar({ brand: "Light", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#fff", "--sidebar-ink": "#3f3f3f" });
			});
		}, "**Two tokens.** `--sidebar-bg` and `--sidebar-ink` — the group title, the icons, the hover fill and the active row are all `color-mix` off that one ink, so they cannot be set inconsistently. Same component, two values apart.");

		md("The rows light themselves up: `.active` is this exact url and `.in-path` is a directory above it, both written by `Router.mark_links()` after every navigation — `ux/Tree`'s own click highlight is turned off in `Sidebar.css` so there is only ever one mark. **No view compares `window.location` itself.**");

		h2("Resizable, and it remembers");

		md("Drag any demo above by its right edge — 12rem to half the box, **double-click to reset**. The width lives under one localStorage key, `lew42:sidebar`, shared by every `Sidebar` on the site: it is one piece of persistent chrome, not a per-page setting, so resizing the framework's own rail is remembered the next time you open any topic. [Decisions](/framework/core/Sidebar/doc/decisions/) says why the default moved from `19em` to `18rem`.");

		h2("What it doesn't decide");

		md("- **Where it goes.** No width, no position — one line at the call site: `.topic > .sidebar { flex: 0 0 var(--sidebar) }`. [Placement](/framework/core/Sidebar/doc/placement/)\n- **What a narrow screen does.** Below `52em` the panel becomes a sticky top bar with a burger, with nothing to drag; CSS decides, so there is no resize listener. **Shrink this window** to watch it. [Narrow](/framework/core/Sidebar/doc/narrow/)\n- **What the top and bottom contain.** Passing `header` or `footer` *replaces* them — pass a function, never a View. The default footer is the colour-scheme toggle and an avatar slot; it needs `app: this.app`.");

		md("Next: [Extensions](/framework/ext/) — everything core deliberately refused to do.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
