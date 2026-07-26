import { View, div, h1, a, is } from "../View/View.js";

/**
 * Page — a titled, linkable, dormant unit of content.
 *
 * Dormant: creating a Page renders nothing, so `export default new Page(...)`
 * is always import-safe. It renders when appended (View.append calls
 * .render()) or when render() is called directly.
 *
 * activate() is the "you are now THE page" hook — document-level side
 * effects (document.title, meta description, body theme). The App calls
 * it on the loaded module's default export; embedded pages render but
 * never activate, so they can't clobber the document title.
 */
export default class Page {

	constructor(...args){
		this.assign(...args);
	}

	assign(...args){
		return Object.assign(this, ...args);
	}

	// derived from this.meta (import.meta), so links are never hard-coded
	// "/docs/page.js"   -> "/docs/"
	// "/docs/x.page.js" -> "/docs/x"
	// settable for meta-less pages that still want link()
	set url(url){
		this._url = url;
	}

	get url(){
		if (this._url)
			return this._url;

		const path = new URL(this.meta.url).pathname;

		if (path.endsWith("/page.js"))
			return path.slice(0, -"page.js".length); // keep the trailing slash

		if (path.endsWith(".page.js"))
			return path.slice(0, -".page.js".length);

		return path;
	}

	// build the DOM — one div.c("page"), captured wherever the page is placed
	// (View.append sets the captor before calling render, so no target needed).
	// Override with new Page({ render(){ ... } }) for full control.
	render(){
		return this.view = div.c("page", () => {
			if (this.title)
				h1.c("page-title", this.title);

			if (is.fn(this.content))
				return this.content.call(this, this); // this = the page
			else
				return this.content; // string / view / array / undefined — append handles all
		}).ac(this.classes);
	}

	// a link to this page — works while dormant (no render required)
	link(text){
		return a.c("page-link", text ?? this.title).href(this.url);
	}

	// document-level side effects — only THE current page activates
	activate(){
		if (this.title)
			document.title = this.title;

		if (this.description)
			this.describe(this.description);

		if (this.theme)
			View.body().ac(this.theme);

		return this;
	}

	describe(text){
		let meta = document.head.querySelector('meta[name="description"]');

		if (!meta){
			meta = document.createElement("meta");
			meta.setAttribute("name", "description");
			document.head.append(meta);
		}

		meta.setAttribute("content", text);
	}
}

export { Page };
