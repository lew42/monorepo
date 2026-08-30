import { View, div, p, h1, h2, h4, a, span, icon, is } from "../View/View.js";

View.stylesheet(import.meta, "Page.css");

// ⚠ Localhost only, the gate dev/Socket keeps: nothing below may ship behaviour.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const marked = el => el?.matches(".page.active-page, .page.active-ancestor, .page.default");

export class Page {

	// ⚠ Nothing is FETCHED here. A module page constructs ITSELF at import, so a
	// constructor that loaded its subtree would pull the whole site down from whatever
	// url you opened — 261 modules for every page under /framework/, measured. The
	// caller budgets instead: Page.load(), child(), load_all_children(). doc/declaring.md.
	constructor(...args){
		this.assign(...args);
		this.naming();
		this.declare();
		this.initialize?.();
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

	// ════ ROLES — the nearest ancestor that claims one ═══════════════════════
	// A page says `is: "topic"` about itself and its whole subtree can find it,
	// however deep. `findLast`, so the CLOSEST claim wins — an inner document
	// inside an outer one is still your document. Me included: a topic is its own.
	// doc/method/nearest.md.
	nearest(role){ return this.chain().findLast(page => page.is === role); }

	topic(){ return this.nearest("topic"); }
	document(){ return this.nearest("document"); }

	// Memory, then route(), then a filesystem probe. One of the two places `app` is
	// handed down — `render_column()` is the other, for the child nothing routes to.
	// route() sees undeclared names only, so it cannot shadow a child.
	//
	// `levels` is how deep the child then loads: my remaining budget while I walk my
	// own subtree, and NOTHING when the Router walked in here — which means the child
	// loads as deep as its own `depth` reaches. doc/declaring.md.
	async child(name, levels){
		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app }).load_all_children(levels);

		const claimed = known === undefined && is.fn(this.route) && this.route(name);
		if (claimed) return this.add(name, claimed).load_all_children(levels);

		const page = await Page.load(this.url + name + "/", 0);
		if (page) return this.add(name, page).load_all_children(levels);

		const file = await Page.file(this.url + name + ".md");
		return file ? this.add(name, file).load_all_children(levels) : null;
	}

	// Last resort, so a real page.js always wins: a `.md` file beside me IS a page —
	// `./x/` renders `./x.md`. Nothing crawls; a LINK is the naming. doc/declaring.md.
	// ⚠ The SPA fallback answers every miss with index.html at 200 — content-type is the 404.
	// ⚠ core does not import ext: the import is dynamic, and only on a would-be-404.
	static async file(url){
		const res = await fetch(url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;

		const text = await res.text();
		const { default: md } = await import("../../ext/markdown/md.js");
		const href = new URL(url, location.origin).href;

		md.cache[href] ??= Promise.resolve(text);   // the fetch above IS md.file's fetch

		// The first `# ` is the title, which render() already draws — so md.file drops it.
		return {
			title: text.match(/^#\s+(.+?)\s*$/m)?.[1],
			content(){ return md.file({ url: href }, href, { h1: false }); },
		};
	}

	// A module that throws is NOT a module that isn't there — swallowing both turns a
	// syntax error in a page you just wrote into a silent 404.
	// ⚠ `levels` — a module page constructs itself at import, so this is the first
	//   moment anyone can bound its subtree. Nothing means the page's own `depth`,
	//   which is what App.load("/") wants for the site root; child() passes 0 and
	//   budgets afterwards.
	static async load(url, levels){
		try {
			const page = (await import(url + "page.js")).default ?? null;
			return page instanceof Page ? page.load_all_children(levels) : page;
		}
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
		this.column_host()?.reveal_column(this);
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

		// ⚠ Going UP the chain activates NOTHING — Router.activate() only touches what
		// changed, so a columns host told to refresh only from activate() kept the
		// departed leaf in its trail forever (measured 2026-08-26). Deactivation runs
		// deepest-first, so the LAST page to leave is the shallowest and its parent is
		// exactly where you landed; a sideways move activates after this and wins.
		const host = this.column_host();
		if (host && host !== this) host.reveal_column(this.parent);

		return this;
	}

	render(){
		if (this.view) return this.view;

		const host = this.column_host();
		if (host) return this.render_column(host);

		// `standard` is the default page shape; a declared `classes` replaces it whole.
		this.view = div.c("page flow", () => {
			if (this.title) h1.c("page-title", this.title);
			return is.fn(this.content) ? this.content() : this.content;
		})
			.ac(this.name && "page--" + this.name)
			.ac(this.classes ?? "standard");

		return this.view;
	}

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	// The trail to me, one link per page — DERIVED, so it cannot be wrong. `from` is
	// where it starts (the site root by default); the marks are Router.mark_links()'s.
	crumbs(from){
		const chain = this.chain(), start = Math.max(chain.indexOf(from), 0);

		return div.c("page-crumbs", () => chain.slice(start).forEach((page, i) => {
			if (i) icon("chevron_right");
			page.link();
		}));
	}

	// ════ COLUMNS — the Finder shape ══════════════════════════════════════════
	// One call on a host page and its whole subtree lays out as full-height columns,
	// each child opening to the right. The arrangement is CSS (Page.css); this is the
	// box each page needs. doc/columns.md.
	columns(){ this.columnar = true; return this; }

	// The narrowest a DRAG may leave a column: past this the head's title and its `×`
	// have nowhere to sit, and a column you cannot read is a column you cannot widen
	// again. A field, not a constant, so a page with bigger rows can raise it — it
	// initializes before `assign()`, so `new Page({ column_floor: 140 })` wins.
	column_floor = 96;

	// Asked at RENDER time, never walked — so a child that only loads when you
	// navigate to it is a column too. Undefined when I am not in a columns tree.
	column_host(){ return this.chain().find(page => page.columnar); }

	// My column, then the region MY children mount in — so the DOM stays an ordinary
	// tree and the visibility contract holds; Page.css flattens only the LAYOUT. The
	// host wraps both in the row every column lands in, under its crumb strip.
	// ⚠ No `page-title` and no `flow`: the head below IS the title, and the two
	//   framework rhythm rules (`.flow > * + *`, `.page-title + *`) would each hand a
	//   column body a top margin it has no room for.
	// ⚠ `classes` is ADDITIVE here, where `render()` lets it REPLACE the shape. A column
	//   has no shape to choose — it is `.page.column` or it is not in the row — so a
	//   declared class can only be an extra. Without this a columns host could not be
	//   marked `default`, which is the only way to show one that is never routed to
	//   (a panel, a demo box): `uses/split` had to write `activated(){ … }` by hand.
	render_column(host){
		const stack = () => {
			this.column_grab(this.column(host));
			// ⚠ A page is BUILT when it activates, so a child marked `default` would
			//   never exist for the contract to show. The host builds it — and hands down
			//   `app`, the SECOND place that happens (`child()` is the other). Nothing
			//   routes to a default column, so `child()` never runs for it and the `app`
			//   it was adopted with at module scope is still undefined: `this.app.router`
			//   in its content threw (`imagine/screens/deck`, 2026-08-29).
			this.$pages = div.c("page-column-pages", () => this.default_column()?.assign({ app: this.app }).render());
		};

		this.view = div.c("page").ac(this === host ? "columns" : "column");

		this.view.append(this === host ? () => {
			this.$crumbs = div.c("page-columns-bar");
			this.$row = div.c("page-columns-row", stack);
		} : stack);

		return this.view.ac(this.name && "page--" + this.name).ac(this.classes);
	}

	// The child that opens when nothing deeper is routed — a column browser that arrives
	// showing only its own rail leaves 80–93% of the row empty (measured 2026-08-27).
	// `default` is the arrangement contract's own word for "shown without being routed
	// to" (doc/css.md), so a page opts in with the word it already knows and Page.css
	// stands it down the moment a real column opens beside it.
	// ⚠ NOT `opens()`, which is what this was called for one build. A core method named
	//   after a plain noun squats a name a page may already be using as its own state:
	//   `overview/columns/uses/inbox` counts opened messages in `opens: 0`, the field
	//   shadowed the method, and the whole page died on `this.opens is not a function`.
	//   Every other method in this family is `*_column` / `column_*` for that reason.
	default_column(){ return [...this.children.values()].find(child => child?.classes?.split(/\s+/).includes("default")); }

	// ONE COLUMN: a sticky head, my own content, my children as rows. `width` is the
	// page's own word — `small`, `large`, `full`; none is the default.
	column(host){
		return div.c("page-column-body", () => {
			div.c("page-column-head", () => {
				span.c("page-column-title", this.title);
				if (this !== host) a.c("page-column-close", () => icon("close")).href(this.parent.url);
			});

			if (this.content)
				div.c("page-column-prose flow", () => is.fn(this.content) ? this.content() : this.content);

			// ⚠ `index: true` — my content ALREADY shows my children, as a `previews()`
			//   wall, so this rail would say the same things a second time (`layout` Q4:
			//   a page shows each thing once). Three pages had written the whole method
			//   out by hand to say it. A FIELD, not a method — and not `nav:` (`nav()` is
			//   a method here) or `rail:` (four pages already declare it as their own
			//   word): the `opens()` collision, avoided by grepping first. doc/columns.md.
			if (!this.index) this.children.forEach((child, name) => {
				const nav = this.nav_for(name);

				a.c("page-column-item").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-column-label", nav.label);
					if (child?.children.size) icon("chevron_right");
				});
			});
		}).ac(this.width && "page-column-" + this.width);
	}

	// ── the seam — drag it and this column keeps the width you left it at ──
	// A SIBLING of the body, so it is a real flex item of the row: `.page.column` is
	// `display: contents` and cannot host an event, and the body is a scroller, so an
	// overlay inside it would scroll out of view. It measures 0 — the 6px hit zone is a
	// `::before` straddling the hairline — so the row's px still add up to the columns.
	// ⚠ `lostpointercapture`, not `pointerup`: it fires for a cancelled drag too, so one
	//   handler ends the gesture however it ended.
	// ⚠ `preventDefault` on the DOWN, or the drag selects the text either side of it.
	column_grab($body){
		const $grab = div.c("page-column-grab");
		let from, width;

		$grab.on("pointerdown", e => {
			from = e.clientX;
			width = $body.el.getBoundingClientRect().width;
			$grab.el.setPointerCapture(e.pointerId);
			$grab.ac("page-column-grabbing");
			e.preventDefault();
		});

		$grab.on("pointermove", e => is.num(from) && this.resize_column($body, width + e.clientX - from));
		$grab.on("lostpointercapture", () => { from = undefined; $grab.rc("page-column-grabbing"); });
		$grab.on("dblclick", () => this.resize_column($body));

		return $grab;
	}

	// The width a drag leaves behind, written as the SAME three tokens the width words
	// set — one level stronger, because an inline custom property out-ranks a class.
	// ⚠ NO `px` = back to the page's word: `setProperty(prop, "")` REMOVES the
	//   declaration, so the class's tokens are what the body reads again. That is the
	//   double-click, and it is why nothing here remembers a previous value.
	// ⚠ Per VISIT. The columns are rebuilt on reload and the width goes with them; where
	//   a width would be stored, and whether a url or a page owns it, is open (doc).
	resize_column($body, px){
		const row = this.column_host()?.$row?.el;
		const width = px && Math.round(Math.max(this.column_floor, Math.min(px, row?.clientWidth ?? px)));

		return $body.style({
			"--page-column-flex": width ? `0 0 ${width}px` : "",
			"--page-column-min":  width ? "0" : "",
			"--page-column-max":  width ? "none" : "",
		});
	}

	// Called on the HOST after every activation in its tree: the trail says where you
	// are — and gets back whatever a `full` page collapsed — then the newest column
	// scrolls itself in.
	reveal_column(page){
		this.$crumbs?.empty(() => page.crumbs(this));

		const row = this.$row?.el;
		if (!row) return;

		// ⚠ The row has no box yet on a cold load, and no frame you can count will give
		// it one: a page is BUILT detached, so every rect at rAF is 0. The observer
		// fires the moment it gets a size — and again on every resize, which is exactly
		// when the deepest column needs revealing again.
		if (!this.watching) (this.watching = new ResizeObserver(() => this.scroll_column())).observe(row);

		// ⚠ One frame, for every navigation after that: Router.mark() marks what shows
		// AFTER activate(), so right now the newest column is still `display: none`.
		requestAnimationFrame(() => this.scroll_column());
	}

	// The deepest column on screen, brought in by the smallest move — the columns to
	// its left stay exactly where they are.
	// ⚠ `scrollBy` on the row, never `scrollIntoView`: that walks up and scrolls the
	// document around the whole host too.
	scroll_column(){
		const row = this.$row?.el;
		const body = [...row?.querySelectorAll(".page-column-body") ?? []].filter(el => el.offsetWidth).at(-1);
		if (!body) return;

		const to = body.getBoundingClientRect(), from = row.getBoundingClientRect();
		const dx = to.right > from.right ? to.right - from.right
			: to.left < from.left ? to.left - from.left : 0;

		if (dx) row.scrollBy({ left: dx });
	}

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

	// How deep my declared subtree is FETCHED, and the one number that decides what a
	// url costs. `1` — my children: a card wall, a rail, my own list in a sidebar.
	// `2` — theirs too, which is what `walls()` and a two-level sidebar draw, and the
	// default. A page that only previews its children says `depth: 1`; one that draws
	// none of them says `0`. A field, so a declared `depth:` still wins (it
	// initializes before `assign()`). doc/declaring.md.
	depth = 2;
	loaded = 0;

	// My children fetched, and theirs, until the budget runs out. `levels` is what the
	// CALLER needs; nothing means my own `depth`, which is what navigating to me asks
	// for. Awaiting each child's `loading` makes this mean "the next `levels` are
	// ready"; Router.load() awaits it, so a page draws once, complete.
	// ⚠ Idempotent — `loaded` is what is already here, so revisiting costs nothing and
	//   a deeper ask tops up. It returns `this`, which is what lets child() chain it.
	// ⚠ A `leaf` child spends NONE of my budget: leaf already means "I present myself,
	//   not my children" — walls() and framework's sections() both skip it — so its
	//   subtree waits until you open it. 50 modules on /framework/ alone.
	load_all_children(levels = this.depth){
		if (levels <= this.loaded) return this;
		this.loaded = levels;

		this.loading = Promise.all([...this.children.keys()].map(name =>
			this.child(name, 0).then(child => child?.load_all_children(child.leaf ? 0 : levels - 1).loading)));

		return this;
	}

	// ext/tabs patches `tabs()` onto this prototype and fills `regions`, which
	// container() reads. Nothing here declares either.
}

export default Page;
