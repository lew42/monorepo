import { View, div, p, h1, h2, h4, a, span, icon, is } from "../View/View.js";
import PageFrame from "./Frame.js";

View.stylesheet(import.meta, "Page.css");

// ⚠ Localhost only, the gate dev/Socket keeps: nothing below may ship behaviour.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const marked = el => el?.matches(".page.active-page, .page.active-ancestor, .page.default");

// The two page words that mean the same thing under an older name. `card` used to be
// `surface` (the theme's own tone list still says so, styles/sections/tone.js:11) and
// `tint` used to be `wash`. Read on the way in; never mentioned again.
const ALIAS = { surface: "card", wash: "tint" };

// A `content` string that starts with `/` is an ADDRESS, not text; a `.md` one is
// prose, anything else is the `page.json` at that address.
const is_address = value => is.str(value) && value.startsWith("/");
const is_md = url => /\.md(\?|#|$)/i.test(url);

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
		return this.words();
	}

	// ════ THE SIX PAGE WORDS ══════════════════════════════════════════════════
	// `navigation` `width` `arrangement` `surface` `background` `type_size` — the
	// six things a page can say about its own shape, resolved ONCE here so nothing
	// downstream can disagree about what the page said. `Frame.js` is the box they
	// open; the map from each word to what core already did is
	// `ai/2026-09-06/graduate-plan/plan.md` until doc/ catches up.
	//
	// EVERY DEFAULT IS `undefined`: a word nobody says writes no class at all, which
	// is what lets the whole feature land without moving a pixel on any page.
	//
	// ⚠ IDEMPOTENT ON PURPOSE. `naming()` runs twice for an adopted page — once in the
	//   constructor and again from `add()` — so every line here has to survive being
	//   run on its own output. `??=` does; so does the ALIAS pass, because ALIAS has
	//   no entry for its own answers (`card` and `tint` are not keys).
	// ⚠ THERE IS NO LINE FOR `type`. `type` is already a page METHOD
	//   (`generator/page.js:261`); the page's key is `type_size` everywhere except
	//   inside a `mode` object, where it is data and shadows nothing.
	words(){
		this.width      ??= this.room;                                  // the lab's older key
		this.surface     = ALIAS[this.surface]    ?? this.surface;
		this.background  = ALIAS[this.background] ?? this.background;
		return this;
	}

	// The classes those words stamp. ONE method, so `render()` and `render_column()`
	// cannot drift — and `render()` asks whether this list is empty to decide whether
	// the page needs a `Frame` at all.
	word_classes(){
		return [
			this.navigation  && "page-nav-" + this.navigation,
			this.arrangement && "page-arr-" + this.arrangement,
			this.surface     && "page-surface-" + this.surface,
			this.background  && "page-bg-" + this.background,
			this.type_size   && "page-type-" + this.type_size,
		].filter(Boolean);
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

	// ⚠ THE SPA FALLBACK ANSWERS EVERY MISS WITH index.html AT 200, so `res.ok` is not
	//   "the file is there" — the CONTENT-TYPE is the 404. The identical guard is in
	//   Page.file() above, in imagine/paging/stage.js and in make/made.js.
	static async read_json(url){
		const res = await fetch(url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
		return res.json().catch(() => null);
	}

	/* A `page.json` — an object, or the url of a directory holding one — AS A REAL PAGE.
	   Parents first, children by DIRECTORY NAME, which is exactly the shape
	   `imagine/paging/make/made.js` writes:

	       { "title": "Notes", "icon": "description",
	         "mode": { "navigation": "tabs", "room": "reading", … },
	         "children": ["today", "later"] }

	   THE THIRD WAY A PAGE ARRIVES. `Page.load()` is "the page.js at this url" and
	   `Page.file()` is "the .md beside me"; this one is "the data that describes a
	   page". It reads the way `Array.from` does.

	   ⚠ DO NOT WIRE IT INTO `child()`'s PROBE CHAIN. A third fetch on every would-be-404
	     child is paid by every `.md` child on the site. A page that owns a JSON subtree
	     calls this itself — the pattern `cms/json/page.js` documents. If you write that
	     override, carry core's own guard across (`if (levels <= this.loaded) return this;`)
	     or a second call reads back the promise being assigned and throws "Chaining cycle
	     detected for promise" with no file, no line and no stack. */
	static async from(source, adopt){
		const url  = is.str(source) ? source.replace(/\/?$/, "/") : null;
		const data = url ? await Page.read_json(url + "page.json") : source;
		if (!data) return null;

		const mode = data.mode ?? {};
		const page = new Page({
			title: data.title, icon: data.icon, description: data.description,
			navigation: mode.navigation, arrangement: mode.arrangement,
			surface: mode.surface, background: mode.background,
			type_size: mode.type,                       // the disk key is older than the label
			width: mode.room ?? mode.width,
			content: mode.content,                      // a url, or the page's own function
		}, adopt);

		// ⚠ `url &&` — an object handed in directly has no address for its children to
		//   hang off, so they are declared by name and left to resolve the ordinary way.
		for (const name of data.children ?? [])
			page.add(name, (url && await Page.from(url + name + "/")) ?? { title: name });

		return page;
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

			// A page that said one of the six words gets a FRAME: the chrome its
			// arrangement word asks for, around the box its content goes in. A page
			// that said none has no frame at all and draws exactly what it drew before
			// the words existed. Frame.js.
			if (this.word_classes().length) return void new this.constructor.Frame({ page: this });

			return this.render_content();
		})
			.ac(this.name && "page--" + this.name)
			.ac(this.width && !this.column_host() && "page-w-" + this.width)
			.ac(...this.word_classes())
			.ac(this.classes ?? "standard");

		return this.view;
	}

	// WHAT IS IN THE BOX: a function, a string of text, or — a string starting with
	// `/` — an ADDRESS to render. Split out of `render()` because `Page.Frame` needs
	// to draw the same thing inside its own canvas.
	render_content(){
		if (is_address(this.content)) return this.content_at(this.content);
		return is.fn(this.content) ? this.content() : this.content;
	}

	/* A PAGE OR A FILE, AT AN ADDRESS, DRAWN IN THIS PAGE'S BOX. `content: "/notes/x.md"`
	   is that file as prose; `content: "/notes/x/"` is the `page.json` at that address,
	   run as a real page. There is no `content: "/…"` anywhere on the site today, so no
	   existing page changes. `imagine/paging/stage.js:466` is where this was learned.

	   ⚠ A LOOP FUSE, and it is needed BECAUSE content takes a url: a page whose content
	     is its OWN address would read itself, draw itself, read itself… for ever, with
	     nothing thrown — and the bar on a page you made can produce exactly that in two
	     clicks. Two levels draw; the third hands over a link.
	   ⚠ NO DOM AFTER THE AWAIT. The box is captured synchronously and filled in the
	     callback — this framework's oldest trap. */
	content_at(url){
		const level = (this.content_level ?? 0) + 1;

		if (level > 2) return a.c("page-link", "Open " + url + " on its own").href(url);

		return div.c("page-content-at", $box => {
			$box.append(() => { p.c("muted", "Reading " + url + "…"); });

			(is_md(url) ? Page.file(url) : Page.from(url))
				.then(source => $box.empty(() => { this.drew_content(source, url, level); }))
				.catch(() => $box.empty(() => { this.drew_content(null, url, level); }));
		});
	}

	// What came back, on screen — or the one sentence that says nothing did. A page
	// read from an address is BUILT here, never the module page at that url, so
	// nothing is shared with the real page and `render()`'s view cache is not stolen.
	drew_content(source, url, level){
		if (!source) return p.c("muted", "Nothing could be read at " + url + ".");

		const page = source instanceof Page ? source : new Page(source);
		page.content_level = level;
		return page.render().ac("default");
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

		// ⚠ No `page-w-*` here: a column's width is already stamped by `column()` below,
		//   and under a columns host the page grid the width words move things in does
		//   not exist. The other five words are plain classes and work in both hosts.
		return this.view.ac(this.name && "page--" + this.name).ac(...this.word_classes()).ac(this.classes);
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

	// ════ STORAGE — the page's own url IS the id ══════════════════════════════
	// A handle over localStorage: `get` / `set` / `patch` / `clear`. Production is
	// static, so there is no server to hand out ids — and a page already has one
	// thing that is unique, stable and human-readable: its address, derived by
	// naming(), so it cannot drift out of step with the tree the way a hand-typed
	// `id: "team-board"` would. doc/method/store.md.
	// ⚠ Storage, not STATE — nothing here notifies. A page that wants a redraw
	//   calls its own watcher after the write; a subscription API in core would
	//   make ~160 pages pay for a pattern four of them want (doc/roles.md).
	store(){ return new this.constructor.Store({ page: this }); }

	// ext/tabs patches `tabs()` onto this prototype and fills `regions`, which
	// container() reads. Nothing here declares either.
}

// The box the six page words open, in its own file because this one is long enough.
// `extends` copies the static side, so a Page subclass gets the whole machine with
// nothing to wire and a method inside reaches it as `this.constructor.Frame`.
// ⚠ `PageFrame`, never `Frame` or `Stage` — View.classify() mints a CSS class from
//   every constructor name in the chain, and `.stage` is a framework layout word that
//   would shrink-wrap the frame with nothing thrown. Frame.js says it at length.
Page.Frame = PageFrame;

// Where a save goes when localStorage will not take it — private mode, a full
// quota, a blocked third-party frame. It throws WHOLE, and a UI that loses its
// buttons because a save failed is worse than one that forgets: the page keeps
// working for the session and only the persistence is lost.
const memory = new Map();
let warned = false;

Page.Store = class PageStore {

	// The app's own namespace: one origin serves /notes/, /imagine/ and every demo,
	// so an unprefixed url is a collision waiting for the next site on this domain.
	prefix = "lew42:";

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// The whole idea, in one line. `store_key` is the seam for a page that MOVED:
	// move() re-addresses a whole subtree, so an adopted page would otherwise
	// change key silently and lose everything saved under its old address.
	key(){ return this.prefix + (this.page.store_key ?? this.page.url); }

	// null when nothing is saved OR the saved value is corrupt — `get()` decides
	// what that means, because only the caller knows its defaults.
	read(){
		try { return JSON.parse(localStorage.getItem(this.key()) ?? "null"); }
		catch { return memory.get(this.key()) ?? null; }
	}

	get(fallback = {}){ return { ...fallback, ...(this.read() ?? {}) }; }

	set(data){
		memory.set(this.key(), data);
		try { localStorage.setItem(this.key(), JSON.stringify(data)); }
		catch (error){ this.warn(error); }
		return data;
	}

	// The call every page actually makes: change one field, keep the rest.
	patch(part, fallback){ return this.set({ ...this.get(fallback), ...part }); }

	clear(){
		memory.delete(this.key());
		try { localStorage.removeItem(this.key()); } catch { /* already gone */ }
	}

	// ⚠ ONCE a session, not once a write: a run saves on every move, and a console
	//   filling with the same line is a console nobody reads.
	warn(error){
		if (warned) return;
		warned = true;
		console.warn(`store(${this.key()}) — localStorage is unavailable (${error.name}); this session is kept in memory only.`);
	}
};

export default Page;
