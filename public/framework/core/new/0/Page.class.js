import { div, h1, a, is } from "../../View/View.js";

export class Page {

	constructor(...args){
		this.assign(...args);
		this.naming();

		const declared = this.children;
		this.children = new Map();
		this.declare(declared);

		this.initialize?.();

		console.log(`new ${this.log_label()} constructed — "${this.title}", children [${[...this.children.keys()].join(", ")}]`);
	}

	assign(...args){ return Object.assign(this, ...args); }

	/* Everything I can work out from what I've been given. Runs in the
	 * constructor AND again in add(), because a page built inline learns its
	 * `name` and `parent` only when someone adopts it.
	 *
	 * One method rather than a `??` at every call site: a default applied by a
	 * caller is a rule nobody can find, and two ways of building a page would
	 * quietly produce two different pages. See "Derive inside the class" in
	 * CLAUDE.md. Every line is `??=`, so it is idempotent and an explicit value
	 * always wins.
	 *
	 * Order matters: a page.js knows `meta` and derives name from url; an inline
	 * page is given `name` and derives url from its parent. Each fills the gap
	 * the other started from.
	 */
	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname       // "/docs/page.js" -> "/docs/"
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : undefined;

		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);           // "/docs/api/" -> "api"
		this.title ??= this.name;
		this.label ??= this.title;

		return this;
	}

	// STRICTLY for logging — hence the prefix. `label()` is left free for a
	// human-facing short name (nav links, breadcrumbs) if we add one.
	//
	// The url is the identity: two pages can share a title, never a path.
	// "…" means constructed but not adopted, so no url has been derived yet.
	log_label(){ return `page{${this.url ?? "…"}}`; }

	// ── the tree ──────────────────────────────────────────────
	// ONE map, name -> Page | null. null means "declared, not loaded yet".
	//
	// A Map rather than a plain object because object keys that look like
	// integers are hoisted and sorted numerically — a child named "42" would
	// jump to the front of the list. Map keeps true insertion order.

	//   children: "intro api"        names, loaded when asked for
	//   children: [intro, api]       already-imported pages
	//   children: [intro, "api"]     both
	declare(children = []){
		const list = typeof children === "string" ? children.trim().split(/\s+/) : children;

		list.forEach(child => typeof child === "string"
			? this.children.set(child, null)
			: this.add(child.name, child));

		return this;
	}

	// Attach a child. Call it from initialize() to build pages that have no file —
	// the walk finds them in `children` before it ever touches the filesystem.
	// Three shapes, cheapest first:
	//
	//   add("alpha", () => p("hi"))                 a content function
	//   add("alpha", { title: "A", content(){} })   options
	//   add("alpha", new Page({ … }))               a Page you built
	//
	// The url is MINE + the name I'm giving it, so an inline page never writes a
	// path and moving a parent moves its whole subtree with it. An explicit
	// `url` still wins — that's what `??` is for.
	add(name, child){
		const page = child instanceof Page ? child
			: new Page(is.fn(child) ? { content: child } : child);

		page.assign({ name, parent: this, app: this.app }).naming();

		this.children.set(name, page);
		this.alias(name, page);

		console.log(`${this.log_label()}.add("${name}") → ${page.log_label()}`);
		return page;
	}

	/* `children` is the store; this is a convenience handle — `page.opt_in`
	 * rather than `page.children.get("opt-in")`.
	 *
	 * Names are hyphenated because they ARE url segments and directory names:
	 * `child()` is handed a raw segment by the router and looks it up directly,
	 * so converting on lookup would mean converting in the hot path, and
	 * `children: "opt-in plain"` would stop matching the folders it names. The
	 * underscore form is therefore an alias, made once, here.
	 *
	 * Never clobbers: a child called `url` or `title` can't overwrite the page
	 * it attaches to.
	 */
	alias(name, page){
		const key = name.replaceAll("-", "_");
		if (!(key in this)) this[key] = page;
	}

	// one path segment -> a page. what I already know, then the filesystem, then me.
	//
	// Flat logs, no group: this awaits, and a group left open across an await
	// captures every unrelated message until it closes.
	async child(name){
		console.group(`${this.log_label()}.child("${name}")`);

		const known = this.children.get(name);

		// every early return needs its own groupEnd — miss one and the console
		// nests one level deeper on every navigation, forever
		if (known){
			console.log(`  ↳ memory hit — ${known.log_label()}, not re-imported`);
			console.groupEnd();
			return known.assign({ parent: this, app: this.app });
		}

		console.log(`  ↳ import("${this.url + name}/page.js")`);
		let page = await Page.import(this.url + name + "/");

		if (!page && this.route){
			console.log(`  ↳ no file — ${this.log_label()}.route("${name}") claims it`);
			page = this.route(name);
		}

		console.log(page ? `  ↳ resolved ${page.log_label()}` : `  ↳ nothing resolves "${name}"`);
		console.groupEnd();
		return page ? this.add(name, page) : null;
	}

	static async import(url){
		try { return (await import(url + "page.js")).default ?? null; }
		catch { return null; }
	}

	// [root … me]
	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	// whoever holds me: my parent, or the app if I'm the root
	container(){ return this.parent ?? this.app; }

	// ── entering and leaving the chain ────────────────────────
	// A page puts ITSELF on screen. There is no show(child)/hide(child) pair —
	// those collided with View's own show()/hide(), and the split bought nothing:
	// `parent.show(child)` and `child.activate()` were one action wearing two names.
	//
	// What the parent supplies is a PLACE, `$pages`. Everything else is the
	// child's own business, which is why a takeover page can simply answer
	// differently (see /layouts/takeover/).
	//
	// MOUNTING IS PERMANENT. `render()` holds `this.view` forever, so detaching a
	// page frees nothing — it only throws away scroll position and focus. Pages
	// therefore stay in the DOM once shown, and what you can SEE is decided
	// entirely by CSS, from the .active-page / .active-ancestor classes the
	// Router already maintains. Nothing here hides anything.

	activate(){
		const parent = this.container();
		const view = this.render();

		// Append only if I'm not already there. Re-appending an attached node
		// MOVES it, which would reorder siblings on every revisit.
		if (view.el.parentNode === parent.$pages.el)
			console.log(`${this.log_label()}.activate() — already mounted, CSS reveals it`);
		else {
			console.log(`${this.log_label()}.activate() → mounted into ${parent.log_label()}.$pages`);
			parent.$pages.append(view);
		}

		return this;
	}

	// Nothing to undo. The Router drops my .active-* class a moment later and CSS
	// takes me off screen. Override this if a page must release something real —
	// a socket, a timer, a <video>.
	deactivate(){
		console.log(`${this.log_label()}.deactivate() — stays mounted, CSS hides it`);
		return this;
	}

	// ── drawing ───────────────────────────────────────────────
	// built once, so nothing is ever thrown away and rebuilt

	render(){
		if (this.view){
			console.log(`${this.log_label()}.render() — already built, same DOM node`);
			return this.view;
		}

		// synchronous start to finish, so this one can be a real group —
		// everything the page's own content() logs nests underneath it
		console.groupCollapsed(`${this.log_label()}.render() — first build`);

		this.view = div.c("page", () => {
			this.$page_content = div.c("page-content", () => {
				if (this.title) h1.c("page-title", this.title);
				this.content?.();
			});

			// content() may have claimed the slot for itself (tabs put it inside
			// a tab panel), so only make the default one if it didn't
			this.$pages ??= div.c("pages");
		})
			.ac(this.name && "page-" + this.name)   // style THIS page
			.ac(this.classes);                      // style pages LIKE this one

		console.groupEnd();
		return this.view;
	}

	// ── names ─────────────────────────────────────────────────
	// `title` is the h1 and the default for everything else; `label` is the short
	// form for links and tabs, and derives from title unless you set it. Both are
	// plain data (naming() fills them), because that is what they are.
	//
	// The one that has to be computed is the document title: it needs the app,
	// which a page has no way of knowing at construction.

	seo_title(){
		const site = this.app?.title;
		return site && site !== this.title ? `${site} — ${this.title}` : this.title;
	}

	// ── links ─────────────────────────────────────────────────

	link(text){ return a.c("page-link", text ?? this.label).href(this.url); }

	preview(){ return a.c("page-preview", this.label).href(this.url); }

	// The container is built and placed NOW, while the captor is still ours; the
	// children arrive later and are appended into it by name. Building the div
	// after the await instead put it in `body > div.app`, outside the page —
	// see "Capturing is synchronous" in CLAUDE.md.
	previews(){
		return div.c("page-previews", async $previews => {
			const names = [...this.children.keys()];
			const children = await Promise.all(names.map(name => this.child(name)));
			children.forEach(child => child && $previews.append(child.preview()));
		});
	}

	// navigate to me — the programmatic twin of clicking my link()
	go(){ return this.app.router.go(this.url); }
}

export default Page;
