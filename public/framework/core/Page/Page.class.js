import { View, div, p, h1, h2, h4, a, span, icon, is } from "../View/View.js";

View.stylesheet(import.meta, "Page.css");

// ⚠ Localhost only, the gate dev/Socket keeps: nothing below may ship behaviour.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const marked = el => el?.matches(".page.active-page, .page.active-ancestor, .page.default");

export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();
		this.declare();
		this.initialize?.();
		if (this.url) this.load_all_children();   // no url yet = standalone; add() re-triggers on adoption
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : this.title ? "/" + Page.slug(this.title) + "/"
		             : undefined;
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
		this.title ??= this.name;
		return this;
	}

	// One Map, in declaration order: undefined = not mine, null = declared, Page = here.
	// A POJO declares by title — the key is the title, Page.slug(key) the url segment.
	declare(){
		const source = this.children ?? [];
		const list = is.str(source) ? source.trim().split(/\s+/)
		           : is.arr(source) ? source
		           : Object.entries(source);

		this.children = new Map();

		list.forEach(child => {
			if (is.str(child)) return this.children.set(child, null);

			if (!is.arr(child)) {
				const name = child.name ?? Page.slug(child.title);
				if (this.children.has(name))
					console.warn(`${this.log_label()} — two children named "${name}"; only the last survives. Give one an explicit \`name\`.`);
				return this.add(name, child);
			}

			const [title, value] = child;
			const name = Page.slug(title);

			if (value === null) return this.children.set(name, null);
			if (value instanceof Page) return this.add(name, value.assign({ title: value.title ?? title }));
			if (is.fn(value) || is.str(value)) return this.add(name, { title, content: value });
			if (is.pojo(value)) return this.add(name, { title, ...value });

			// The eager form ran under whatever captor was current at declaration time.
			throw new Error(`children.${title} — got a value, not a function; write ${title}(){ … } so content runs when the page renders`);
		});

		return this;
	}

	// The one place `parent` is assigned. Adoption goes in through the CONSTRUCTOR:
	// initialize() runs inside it, and a child added there needs my url already set.
	add(name, child = {}){
		const adopt = { name, parent: this, app: this.app };

		const page = child instanceof Page ? child.assign(adopt)
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

		// The url is MINE plus the name — a page built standalone (its url derived
		// from its own title) moves here, resolved children included.
		if (this.url) page.move(this.url + name + "/");

		page.naming();
		if (page.loading === undefined) page.load_all_children();   // built standalone — its url only just arrived
		this.children.set(name, page);
		return page;
	}

	// Adoption hands a page a new address; the resolved subtree moves with it.
	move(url){
		if (this.url === url) return this;

		this.url = url;
		this.children.forEach((child, name) => child?.move(url + name + "/"));
		return this;
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

	// "Default Page Title" → "default-page-title"
	static slug(title){
		return String(title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	}

	// A region, an ancestor's $pages, or the app — most specific claim first.
	container(){
		const mine = this.parent?.regions?.get(this.name);
		if (mine) return this.mounts_in(mine, `region of ${this.parent.log_label()}`);

		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return this.mounts_in(page.$pages, `$pages of ${page.log_label()}`);

		return this.mounts_in(this.app.$pages, "app.$pages");
	}

	// The claim string names the parent that decided — the seam to log when debugging.
	mounts_in(view, claim){ return view; }

	// Router.activate() calls this root-to-leaf, so my ancestors — and their
	// regions — already exist by the time I look for a container.
	activate(){
		const container = this.container();

		if (this.render().el.parentNode !== container.el)
			container.append(this.view);

		this.activated?.();
		this.warn_if_hidden();
		return this;
	}

	// Dev only: an unmarked `.page` is `display: none` by the arrangement contract and
	// nothing throws. Deferred, so whatever marks it — the Router or a demo box — has
	// run; quiet when a sibling in the same box is marked, which is an ancestor
	// standing aside rather than a mistake.
	warn_if_hidden(){
		if (!dev) return;

		queueMicrotask(() => {
			if (marked(this.view.el) || [...this.view.el.parentNode?.children ?? []].some(marked)) return;

			console.warn(`${this.log_label()} was placed with no mark, so the arrangement contract hides it — add \`default\`, or route to it.`);
		});
	}

	deactivate(){
		this.deactivated?.();
		return this;
	}

	render(){
		if (this.view) return this.view;

		// `standard` is the default page shape; a declared `classes` replaces it whole.
		this.view = div.c("page flow", () => {
			if (this.title) h1.c("page-title", this.title);
			return is.fn(this.content) ? this.content() : this.content;
		})
			.ac(this.name && "page-" + this.name)
			.ac(this.classes ?? "standard");

		return this.view;
	}

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	// One menu entry: mine.
	nav(){ return { url: this.url, label: this.label ?? this.title, icon: this.icon, card: this.card, description: this.description }; }

	// The child's own entry, at the url this list gives it. Weakest label last: the
	// child's `label`, its title, then the segment — a declared child may still be null.
	nav_for(name){
		const child = this.children.get(name);

		return { ...child?.nav(), url: this.url + name + "/", label: child?.label ?? child?.title ?? name };
	}

	// A card per child, drawn BY the child. A declared-but-unresolved one has no
	// page to ask, so its entry gets the default card. A child may claim a `group`
	// the way it claims a `card`, and each run of one gets a heading — categories
	// before specifics, on a wall or in a rail.
	// `pages` defaults to all of mine; a caller hands in a subset when some children are
	// chrome rather than content — a Doc's derived Overview/API/Docs/Files sections are
	// the case that asked for it (ext/Doc's `wall()`).
	previews(pages = this.children){
		let group;

		return div.c("page-previews bleed", () => pages.forEach((page, name) => {
			if (page?.group && page.group !== group)
				h4.c("page-previews-group", group = page.group);

			const nav = this.nav_for(name);
			page ? page.preview(nav) : this.preview_card(nav);
		}));
	}

	// One rung per child: its name as a link, then ITS children as cards. An index of
	// indexes — `previews()` is my children, `walls()` is my grandchildren under their
	// parent's name. Depth 1 on purpose, and a childless child has no rung: a heading
	// over nothing is this method quietly turning back into `previews()`.
	// ⚠ `leaf` opts a child out whole: it presents ITSELF, not its children — and a
	// child that overrode `previews()` into something else entirely (a rail, a
	// timeline) would otherwise render that thing here, on someone else's index.
	walls(){
		return div.c("page-walls bleed flex v gap", () => this.children.forEach((page, name) => {
			if (!page?.children.size || page.leaf) return;

			const nav = this.nav_for(name);

			div.c("page-wall flex v gap", () => {
				h2.c("page-wall-title", () => a.c("page-link", nav.label).href(nav.url));
				page.previews();
			}).style("--gap", "1em");
		})).style("--gap", "3em");
	}

	// The one card shape. A page that wants a live render overrides this method:
	// `preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }`
	preview(nav){ return this.preview_card(nav); }

	// ⚠ The thumb is INERT (Page.css): the label below it is a link, so a live render
	// in here would be an `<a>` inside an `<a>` — invalid, and the browser un-nests it.
	preview_card(nav = this.nav(), thumb){
		return div.c("page-preview", () => {
			if (thumb) div.c("page-preview-thumb", thumb);
			this.preview_link(nav);
			if (!thumb && nav.description) p.c("page-preview-desc", nav.description);
		}).ac(nav.card);
	}

	// The card's only real link — Page.css spreads its ::after over the whole card.
	preview_link(nav){
		return a.c("page-preview-link", () => {
			if (nav.icon) icon(nav.icon);
			span.c("page-preview-title", nav.label);
		}).href(nav.url);
	}

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
