import app, { a, h1, p } from "/app.js";
import { find } from "./nav.js";
import Router from "./Router.js";

// Every page imports Page, so this is the one place the theme has to be opted into.
// App awaits the stylesheet before it injects anything, so there is no unstyled flash.
// The class that scopes styles.css to `body.arya` waits for initialize() below —
// importing this module (as core/Search's corpus build does) must never touch the
// document a reader is already standing on.
app.stylesheet("/arya/styles.css");

/*
 * A page.js that renders when you import it can only ever be used one way.
 * A Page describes itself instead: title, path, and a body() that has not run yet.
 *
 *   export default new Page(import.meta, {
 *       title: "Flex",
 *       body(){ p("..."); }
 *   });
 *
 * Nothing touches the DOM until something calls .render(), so a parent page can
 * `import child from "./child/page.js"` just to draw a link to it, and the router
 * can re-render the same module on a second visit.
 */
export default class Page {

	constructor(meta, config) {
		this.path = Page.path_of(meta);
		Object.assign(this, find(this.path), config);
	}

	// App.load_page() appends the module's default export, and View.append()
	// calls .render() on anything that has one. That is the only hook we need.
	render() {
		this.initialize();
		Router.singleton().mount(this);
	}

	// Adds the theme class only when a page of mine is actually shown, never at
	// import. One class on <body> used to run at module scope, so merely reading
	// this file for the search index re-themed whatever page a reader was on.
	initialize() {
		app.$body.ac("arya");
	}

	// what the router swaps in and out: everything below the sidebar
	content() {
		h1(this.title);
		if (this.blurb) p.c("lede", this.blurb);
		this.body();
	}

	body() {}

	// a link to this page, from anywhere, without hardcoding the path twice
	link(text) {
		return a(text ?? this.title).href(this.path);
	}

	// "/arya/styles/flex/page.js" -> "/arya/styles/flex/"
	static path_of(meta) {
		return new URL(".", meta.url).pathname;
	}
}
