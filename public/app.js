import App, { View, div, a } from "./framework/core/App/App.js";
import Socket from "./framework/dev/Socket/Socket.js";
import { lew42 } from "./framework/styles/layers/theme/lew42/lew42.js";
import mode from "./framework/core/App/mode.js";

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

		// $pages, not $app — a page's view is built by an element factory, which
		// auto-appends to the captor, so the captor has to be where pages live.
		View.set_captor(this.$pages);
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
// same shape as tabs below. It imports ext/Layout, the one control surface.
import "./framework/ext/demo/exhibit.js";

// classdoc turns "a method has a .md file next to the page.js" into a child
// page showing that method's real source. Imports markdown (the notes ARE
// markdown); leans on highlight only if it's loaded. See ext/classdoc/readme.md.
export { default as classdoc } from "./framework/ext/classdoc/classdoc.js";

// Patches this.tabs() onto every Page — the side effect IS the export, same
// shape as highlight below. classdoc already imports it for its own vertical
// rail; this import is what makes `this.tabs("guide api")` work on any OTHER
// page.js too. See ext/tabs/readme.md.
import "./framework/ext/tabs/tabs.js";

// Patches this.catalog() the same way: previews() as a persistent rail beside
// the region the children mount in. classdoc's Overview tab is built on it.
import "./framework/ext/catalog/catalog.js";

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

// The UI components, as one namespace: `ui.table(head, rows)`, `ui.timeline(…)`,
// `ui.keys("Ctrl", "K")`. Three functions — the other sixteen are documented as
// copy-paste markup and deliberately have nothing to import. See ui/readme.md.
export { ui } from "./framework/ui/ui.js";
