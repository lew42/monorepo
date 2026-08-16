import App, { View, div, a } from "./framework/core/App/App.js";
import Socket from "./framework/dev/Socket/Socket.js";
import devbar from "./framework/dev/DevBar/DevBar.js";
import { lew42 } from "./framework/styles/layers/theme/lew42/lew42.js";
import mode from "./framework/core/App/mode.js";

/* ⚠ The default resource-timing buffer holds ~250 entries and then silently stops
 * recording, so a long-lived tab would stop recognising its own files as loaded
 * and Socket.changed() would stop reloading it. Raise it before anything fetches. */
performance.setResourceTimingBufferSize(100000);

App.stylesheet("/styles.css");

/* The site's chrome, built ONCE outside $pages so navigation can never touch it.
 *
 * [url, text] — hand-typed on purpose. A nav built from app.root's children would
 * have to import every one of them just to read their titles, which is the thing
 * laziness exists to avoid. */
const nav = [
	["/", "Home"],
	["/framework/", "Framework"],
	["/web/", "Web"],
	["/alex/", "Alex"],
	["/arya/", "Arya"],
	["/castin/", "Castin"],
	["/edric/", "Edric"],
	["/michael/", "Michael"],
];

const app = window.app = new App({

	socket: Socket.singleton(),

	/* The mark, painted by CSS rather than by the file.
	 *
	 * An <img> can't inherit a colour and inlining the markup would make a second
	 * copy of the artwork, so `.logo` masks the svg and paints the shape with
	 * `--prim`. The file stays the only copy; its own fill is ignored. Alpha-only,
	 * which is exactly right for a one-path monochrome mark.
	 *
	 * Decorative: the brand text beside it already says the name. */
	logo(){ return div.c("logo").attr("aria-hidden", "true"); },

	// logo + wordmark. The logo always goes home; the text goes wherever the
	// page that asked for it says.
	brand(text, href){
		return div.c("brand", () => {
			a.c("brand-logo", () => { this.logo(); }).href("/");
			a.c("brand-text", text).href(href);
		});
	},

	/* The theme's behaviour, called once by the site — not triggered by the CSS
	 * class, which can appear any number of times on a page. See lew42.js. */
	config(){ lew42(this); },

	render(){
		this.$body = View.body();

		// `theme-lew42` is the site's look now. It's a class on a div: swap the
		// word and the whole site is a different theme, with no component edited.
		this.$app = div.c("app theme-lew42", () => {
			// $nav, matching its class. A topic hides it with `classes: "hides-nav"`
			// — an inert class, so nothing here has to know a topic exists.
			this.$nav = div.c("nav", () => {
				nav.forEach(([url, text]) => a.c("nav-link", text).href(url));
			});

			/* The measure is the REGION's default now (`.pages` in Page.css hands
			 * every page the sheet), so there is nothing to declare here — `papers`
			 * retired once the opt-in every region typed became the default.
			 * A topic opts out (`.page.topic` in /styles.css) — it IS the row. */
			this.$pages = div.c("pages");

			// The toggle lives in sidebar FOOTERS now; this applies the reader's
			// stored mode on routes that don't render one.
			mode.apply(this);
		});

		// Ctrl + \ — the dev rail, on <body> beside the shell rather than inside it.
		devbar(this);

		// $pages, not $app — a page's view is built by an element factory, which
		// auto-appends to the captor, so the captor has to be where pages live.
		View.set_captor(this.$pages);
	},

	/* Router's seam, called after every navigation. The rail's route section reads
	 * the url at render time, so it is stale until something says so — and the dev
	 * server addresses a tab by the page it last announced, which an SPA navigation
	 * (no new socket) would otherwise leave at wherever the tab connected.
	 * Off localhost `rpc` no-ops. dev/Socket/doc/wire.md. */
	navigated(page){
		this.socket.rpc("hello", page.url);
		devbar.refresh();
	},
});

export default app;
export { app };

// App + View factories + Page + Router
export * from "./framework/core/App/App.js";
export { Sidebar } from "./framework/core/Sidebar/Sidebar.js";

// ext/ is opt-in by import — these are the site's choice, made once here so
// every page.js can write md("**docs**") and demo(() => …) with no extra import.
export { default as md, marked } from "./framework/ext/markdown/md.js";
export { default as demo } from "./framework/ext/demo/demo.js";

// Patches demo.app() on: a real Page tree playing App and Router inside a box.
// The side effect IS the export — same shape as tree and tabs below.
import "./framework/ext/demo/app.js";

// Patches demo.exhibit(), demo.page() and demo.tree() on: a demo as a PAGE — the
// render, a layout bar over it, its definition. The side effect IS the export —
// same shape as tabs below. It imports ext/layout, the one control surface.
import "./framework/ext/demo/exhibit.js";

// Patches demo.layout() on: the third exhibit sugar — a whole page as a demo page,
// with the two-up card and the `parts:` chips. Same side-effect shape.
import "./framework/ext/demo/layout.js";

// Doc turns "a member has a .md file next to the page.js" into a child page
// showing that member's real source. A Page subclass, so a module with a
// different shape overrides a method instead of the config growing an option.
// Imports markdown (the notes ARE markdown) and files (the Files tab); leans on
// highlight only if it's loaded. See ext/doc/readme.md.
export { Doc } from "./framework/ext/doc/Doc.js";

// Patches this.tabs() onto every Page — the side effect IS the export, same
// shape as highlight below. ext/doc already imports it for its own vertical
// rail; this import is what makes `this.tabs("guide api")` work on any OTHER
// page.js too. See ext/tabs/readme.md.
import "./framework/ext/tabs/tabs.js";

// Patches this.catalog() the same way: previews() as a persistent rail beside
// the region the children mount in. ext/doc's Overview tab is built on it.
import "./framework/ext/catalog/catalog.js";

// The right rail, one per document: drawer(($slot, $body) => …) opens it, its own ✕
// shuts it, and nothing else does. Here rather than inside ext/layout — which owned it
// until 2026-08-16 and could only open it for its own selection — so a panel's
// properties and a selected element's words are the same surface. See ext/drawer.
export { default as drawer } from "./framework/ext/drawer/drawer.js";

// files() shows real files on disk, fetched — so a "here is a whole project"
// section can't drift from the project. toc() reads a page's own headings.
export { default as files } from "./framework/ext/files/files.js";
export { default as toc } from "./framework/ext/toc/toc.js";

// Importing highlight is what turns highlighting on everywhere: it enhances the
// `code` factory in place (code.js/.fn/.html/.css/.md/.json, block-aware) and
// patches html_unsafe + prerender, so every markdown code fence on the site is
// highlighted synchronously, with no flash of un-highlighted code. `code` is
// already exported above via `export *`, so this import is for the side effect.
// See framework/ext/highlight/readme.md.
export { hljs, highlight } from "./framework/ext/highlight/highlight.js";

// AITask renders a task's session.json — the spend, the agents, a transcript
// replay off the dev server. See ext/AITask/readme.md.
export { AITask } from "./framework/ext/AITask/AITask.js";

// The UI components, as one namespace: `ui.table(head, rows)`, `ui.timeline(…)`,
// `ui.keys("Ctrl", "K")`. Three functions — the other sixteen are documented as
// copy-paste markup and deliberately have nothing to import. See ui/readme.md.
export { ui } from "./framework/ui/ui.js";
