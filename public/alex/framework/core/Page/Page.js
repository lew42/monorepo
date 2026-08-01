import { View, is } from "../View/View.js";

/* A Page is an inert-on-import, re-activatable View.
 *
 * Importing (or constructing) a Page renders nothing:
 *  - capture = false, so it's never auto-appended to the captor
 *  - initialize() is a noop, so render() is deferred to the first activate()
 *
 * The Router activates/deactivates pages as the URL changes, and caches
 * one Page per path, so revisiting re-activates the same instance
 * (state preserved, render() runs once).
 */
export default class Page extends View {

	constructor(...args) {
		super(...args);
		this.page_stylesheets = []; // tracked <link> views, removed on deactivate
	}

	// defer render until first activate() — see View.initialize
	initialize() {}

	activate(parent) {
		if (parent)
			this.parent_view = parent;

		this.active = true;
		this.parent_view.append(this);

		// re-attach page stylesheets (removed on deactivate)
		for (const link of this.page_stylesheets)
			link.append_to(document.head);

		if (!this.rendered) {
			this.rendered = true;
			this.append(this.render); // append_fn: captor = this while rendering
		}

		this.on_activate();
		return this;
	}

	deactivate() {
		this.active = false;
		this.on_deactivate();

		for (const link of this.page_stylesheets)
			link.remove();

		this.remove();
		return this;
	}

	on_activate() {
		if (this.title)
			document.title = this.title;
	}

	on_deactivate() {}

	// this.stylesheet("/abs/path.css") or this.stylesheet(import.meta, "rel/path.css")
	stylesheet(meta, url) {
		url = View.url(meta, url);

		var link = this.page_stylesheets.find(link => link.attr("href") === url);
		if (link)
			return link.loaded;

		link = new View({ tag: "link", capture: false })
			.attr("rel", "stylesheet").attr("href", url);

		link.loaded = new Promise(res => link.on("load", res));
		View.stylesheets.push(link.loaded); // initial app load awaits these

		this.page_stylesheets.push(link);

		if (this.active)
			link.append_to(document.head);

		return link.loaded;
	}

	// normalize any page module default export into a Page (or null for legacy)
	static from(def) {
		// no default export — legacy side-effect page
		if (!is.def(def) || def === null)
			return null;

		if (def instanceof Page)
			return def;

		if (is.fn(def)) {
			// Page subclass
			if (def.prototype instanceof Page)
				return new def();
			// plain render function
			return new Page({ render: def });
		}

		// a view instance
		if (def.el)
			return new Page({ render(){ this.append(def); } });

		// object with .render() — keep `this` bound to def
		if (is.fn(def.render))
			return new Page({ render: (...args) => def.render(...args) });

		console.warn("Page.from: unsupported default export", def);
		return null;
	}
}

Page.prototype.capture = false; // never auto-append on construction

export { Page };
