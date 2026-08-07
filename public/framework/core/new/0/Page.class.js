import { div, h1, a } from "../../View/View.js";

/* A node: a url, some content, and children that are DIRECT IMPORTS —
 *
 *     import intro from "./intro/page.js";
 *     export default new Page({ meta: import.meta, children: [intro] });
 *
 * so by the time this module's `new Page(...)` runs, every child already exists
 * and adoption is plain assignment. Nothing here is lazy, nothing is declared
 * but unloaded, and child() is an array lookup.
 */
export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();
		this.children?.forEach(child => child.parent = this);

		console.log(`new ${this.log_label()} — "${this.title}"${this.mode ? `, mode: ${this.mode}` : ""}`);
	}

	assign(...args){ return Object.assign(this, ...args); }

	// STRICTLY for logging, hence the prefix. Pages are identified by path:
	// two can share a title, never a url.
	log_label(){ return `page{${this.url ?? "…"}}`; }

	naming(){
		this.url   ??= this.meta && new URL(".", this.meta.url).pathname;   // "/docs/page.js" -> "/docs/"
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);         // "/docs/api/" -> "api"
		this.title ??= this.name;
		return this;
	}

	// `parent` is assigned by whoever declares me; `app` cannot be, because no
	// App exists at module-execution time. App calls this once on the root, and
	// since imports are eager one pass reaches every page there is.
	adopt(app){
		this.app = app;
		this.children?.forEach(child => child.adopt(app));
		return this;
	}

	// [root … me]
	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	// one url segment -> a child, or null
	child(name){ return this.children?.find(child => child.name === name) ?? null; }

	// Ancestors first, so a chain is never partially mounted. Idempotent — the
	// guard matters because re-appending an attached node MOVES it.
	mount(){
		this.parent?.mount();

		if (this.render().el.parentNode !== this.app.$pages.el)
			this.app.$pages.append(this.view);

		return this;
	}

	// THE verb. Becomes go() once a Router exists to call it for you.
	activate(){
		console.log(`${this.log_label()}.activate()`);

		this.mount();
		if (this.title) document.title = this.title;
		this.app.mark(this);

		return this;
	}

	// built once, so nothing is ever thrown away and rebuilt
	render(){
		if (this.view) return this.view;

		console.groupCollapsed(`${this.log_label()}.render() — first build`);

		this.view = div.c("page", () => {
			if (this.title) h1.c("page-title", this.title);
			this.content?.();
		})
			.ac(this.name && "page-" + this.name)   // style THIS page
			.ac(this.classes);                      // style pages LIKE this one

		console.groupEnd();
		return this.view;
	}

	// A plain anchor. With no Router this is a real navigation — the SPA
	// fallback serves index.html and App resolves the url cold. When a Router
	// lands it upgrades the click from one delegated listener, and this method
	// never changes.
	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	preview(){ return a.c("page-preview", this.title).href(this.url); }

	// synchronous: every child is already a Page, not a name to resolve
	previews(){
		return div.c("page-previews", () => this.children?.forEach(child => child.preview()));
	}
}

export default Page;
