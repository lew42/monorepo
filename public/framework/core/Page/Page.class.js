import { View, div, h1, a, span, icon, is } from "../View/View.js";

View.stylesheet(import.meta, "Page.css");

export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();
		this.declare();
		this.initialize?.();
		if (this.url) this.load_all_children();   // no url yet = standalone; add() re-triggers on adoption

		console.log(`new ${this.log_label()} — "${this.title}", children [${[...this.children.keys()].join(", ")}]`);
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : undefined;
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
		this.title ??= this.name;
		return this;
	}

	// One Map, in declaration order: undefined = not mine, null = declared, Page = here.
	declare(){
		const list = typeof this.children === "string" ? this.children.trim().split(/\s+/)
		           : this.children ?? [];

		this.children = new Map();

		list.forEach(child => typeof child === "string"
			? this.children.set(child, null)
			: this.add(child.name, child));

		return this;
	}

	// The one place `parent` is assigned. Adoption goes in through the CONSTRUCTOR:
	// initialize() runs inside it, and a child added there needs my url already set.
	add(name, child = {}){
		const adopt = { name, parent: this, app: this.app };

		const page = child instanceof Page ? child.assign(adopt)
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

		page.naming();
		if (page.loading === undefined) page.load_all_children();   // built standalone — its url only just arrived
		this.children.set(name, page);

		console.log(`${this.log_label()}.add("${name}") → ${page.log_label()}`);
		return page;
	}

	// [root … me]
	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	// Memory, then route(), then a filesystem probe. Also the one place `app` is
	// handed down. route() sees undeclared names only, so it cannot shadow a child.
	async child(name){
		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app });

		const claimed = known === undefined && is.fn(this.route) && this.route(name);
		if (claimed) return this.add(name, claimed);

		const page = await Page.load(this.url + name + "/");
		return page ? this.add(name, page) : null;
	}

	// A module that throws is NOT a module that isn't there — swallowing both turns a
	// syntax error in a page you just wrote into a silent 404.
	static async load(url){
		try { return (await import(url + "page.js")).default ?? null; }
		catch (error){
			if (!Page.missing(error))
				console.error(`Page.load("${url}page.js") — the file EXISTS but failed to load:`, error);
			return null;
		}
	}

	static missing(error){
		return /Failed to fetch dynamically imported module|error loading dynamically imported module|MIME type|Expected a JavaScript/i
			.test(error?.message ?? "");
	}

	// A region, an ancestor's $pages, or the app — most specific claim first.
	container(){
		const mine = this.parent?.regions?.get(this.name);
		if (mine) return this.mounts_in(mine, `region of ${this.parent.log_label()}`);

		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return this.mounts_in(page.$pages, `$pages of ${page.log_label()}`);

		return this.mounts_in(this.app.$pages, "app.$pages");
	}

	// Logged, not silent: a parent this file never mentions decided the answer.
	mounts_in(view, claim){
		console.log(`${this.log_label()}.container() → ${claim}`);
		return view;
	}

	// Router.activate() calls this root-to-leaf, so my ancestors — and their
	// regions — already exist by the time I look for a container.
	activate(){
		const container = this.container();

		if (this.render().el.parentNode !== container.el)
			container.append(this.view);

		this.activated?.();
		return this;
	}

	deactivate(){
		this.deactivated?.();
		return this;
	}

	render(){
		if (this.view) return this.view;

		console.groupCollapsed(`${this.log_label()}.render() — first build`);

		this.view = div.c("page flow", () => {
			if (this.title) h1.c("page-title", this.title);
			return is.fn(this.content) ? this.content() : this.content;
		})
			.ac(this.name && "page-" + this.name)
			.ac(this.classes);

		console.groupEnd();
		return this.view;
	}

	go(){ return this.app.router.go(this.url); }

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	// Weakest first: the segment, the child's own title, the child's `label`.
	nav_for(name){
		const child = this.children.get(name);

		return {
			url: this.url + name + "/",
			label: child?.label ?? child?.title ?? name,
			icon: child?.icon,
			card: child?.card,
		};
	}

	previews(){
		return div.c("page-previews", () => this.children.forEach((page, name) => {
			const nav = this.nav_for(name);

			a.c("page-preview").href(nav.url).append(() => {
				if (nav.icon) icon(nav.icon);
				span.c("page-preview-title", nav.label);
			});
		}));
	}

	preview(){ return a.c("page-preview", this.title).href(this.url); }

	// Awaiting each child's own `loading` makes this mean "my subtree is ready";
	// Router.load() awaits it, so a page draws once, complete.
	load_all_children(){
		return this.loading = Promise.all([...this.children.keys()]
			.map(name => this.child(name).then(child => child?.loading)));
	}

	// ext/tabs patches `tabs()` onto this prototype and fills `regions`, which
	// container() reads. Nothing here declares either.
}

export default Page;
