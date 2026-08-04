import App, { View, div, a } from "./framework/core/App/App.js";
import Socket from "./framework/dev/Socket/Socket.js";

App.stylesheet("/styles.css");

/* The site's chrome, built ONCE outside $pages so navigation can never touch it.
 *
 * [url, text] — hand-typed on purpose. A nav built from app.root's children would
 * have to import every one of them just to read their titles, which is the thing
 * laziness exists to avoid. */
const nav = [
	["/", "Home"],
	["/framework/", "Framework"],
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

	render(){
		this.$body = View.body();

		this.$app = div.c("app", () => {
			// $nav, matching its class. A topic hides it with `classes: "hides-nav"`
			// — an inert class, so nothing here has to know a topic exists.
			this.$nav = div.c("nav", () => {
				nav.forEach(([url, text]) => a.c("nav-link", text).href(url));
			});

			this.$pages = div.c("pages");
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

// Importing highlight is what turns highlighting on everywhere: it enhances the
// `code` factory in place (code.js/.fn/.html/.css/.md/.json, block-aware) and
// patches html_unsafe + prerender, so every markdown code fence on the site is
// highlighted synchronously, with no flash of un-highlighted code. `code` is
// already exported above via `export *`, so this import is for the side effect.
// See framework/ext/highlight/readme.md.
export { hljs, highlight } from "./framework/ext/highlight/highlight.js";
