import { View, div, p, h1, h2, h4, a, span, ul, li, button, icon, code, table, thead, tbody, tr, th, td, is } from "../View/View.js";
import PageFrame from "./Frame.js";
import Item from "../Item/Item.js";
import List from "../List/List.js";
import { page_settings } from "./settings/settings.js";
import { track } from "../track/track.js";
import ai_cost from "./weight/ai-cost.js";

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

// `page.jsonl` plumbing, folded in from the deleted `PageLog` middle class (was
// `core/Page/Log.js`; 2026-10-03, the owner: "fold PageLog away, so Page extends Item
// directly"). "kid/page.jsonl" → ["kid", "jsonl"]; the server's watcher keys a file
// line by its FIRST path segment, so "kid/" and "kid/page.jsonl" are one entry and the
// latest line for it wins — key_of() below matches that.
const CHILD = /^([^/]+)\/page\.(jsonl|js)$/;
const key_of = name => name.split("/")[0];

// `Page extends Item` (core/Item/Item.js) directly: `page instanceof Item` is true,
// Page's `on`/`off`/`emit` are Item's (the Events mixin), and Page's `set()` below is
// Item's `apply()`-based routing with the thin jsonl-specific bits added on top (kept
// every line for a late `on("line", …)` listener, `page.content` lazily a List the
// moment a content delta arrives). There used to be a `PageLog` class in between
// (`core/Page/Log.js`) — folded in here 2026-10-03; `Log.js` is now a one-line
// re-export for its four outside callers (ext/Inbox, ai2/tasks.js, ai2/groups.js,
// ext/drawer/tabs/sessions.js — all read-only static callers, never a subclass).
export class Page extends Item {

	// ════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) turns Ext.setup(page) on for
	// EVERY page, the moment this runs. `ext(name)` below is the DATA path — one
	// page.jsonl line turns one extension on for one page. Both call the same
	// `Ext.setup(page)`. Model: `Server/Events.js`'s `static use(plugin)` /
	// `setup(instance)`; `core/Page/ext/readme.md` has the rest.
	// ⚠ Nobody calls this by default, so the forEach below is empty for every page —
	//   the "must not slow a page with no extensions" rule this exists to keep.
	static _ext = [];
	static use(Ext){ Page._ext.push(Ext); return Page; }

	// ⚠ Nothing is FETCHED here. A module page constructs ITSELF at import, so a
	// constructor that loaded its subtree would pull the whole site down from whatever
	// url you opened — 261 modules for every page under /framework/, measured. The
	// caller budgets instead: Page.load(), child(), load_all_children(). doc/declaring.md.
	constructor(...args){
		super();
		this.assign(...args);
		Page.track(this);
		this.naming();
		this.declare();
		Page._ext.forEach(Ext => Ext.setup?.(this));
		this.initialize?.();
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	// ════ PAGE.JSONL — folded in from the deleted PageLog class ══════════════════

	// A page's own preferences. Today there is exactly one: `nav` — "does this page
	// show up in its parent's navigation?" (core/Page/settings/, loading-study.md
	// section 4). `this.settings` is never a PLAIN object: it starts life as this tiny
	// object with its own `set()`, so Item's `set_one()` routes a `settings` line into
	// its "has its own `.set()`" branch and MERGES — a plain object here would get
	// SHADOWED (fully replaced) by the second settings line instead of merged with it.
	settings = { set(obj){ Object.assign(this, obj); } };

	// A page is a BOUNDARY: its own events (and a content/pages List's, which
	// bubble to the page first) never climb past it to a PARENT page. Each page's
	// Store only ever hears changes inside its own subtree.
	bubbles(){ return false; }

	// A page's id is its folder name, not a random one — `naming()` below sets
	// `this.id ??= this.name` once the url (and so the name) is known. Nothing
	// here can invent one before that.
	static new_id(){ return undefined; }

	// (2026-10-03, the owner's data decision) `title`/`icon`/`description` live
	// in `data`, like every other value — reading/writing `page.title` directly
	// still works exactly as before, through the accessor `define_fields()`
	// (Item.js) builds from this list. Page used to override `get_one`/`put` to
	// write straight onto the instance instead; that override is GONE — one
	// behaviour everywhere, Item's own. A key that names neither a method, a
	// field above, nor a List/child id just lands in `data` too, read back by
	// `report_unknown()` below.
	static fields = ["title", "icon", "description"];

	// `apply()` that calls methods instead of overwriting them — Item's `apply()`
	// does the real routing (a method key calls it, a value with its own `set()`
	// gets the nested delta, anything else is data via `get`/`put` above, emitting
	// `change` + `delta`). This override's own job is four things on top: handle
	// an ARRAY of lines (Item.set() does this itself, but this override replaces
	// that whole method, so it has to again), keep every line for a late
	// `on("line", …)` listener to catch up on, emit `line` exactly ONCE per line
	// the reader hands this page (never once per recursive nested `set()` call
	// `apply()` makes along the way — those land on a DIFFERENT object, never
	// back through this override), and make `page.content` lazily the moment a
	// content delta arrives.
	set(obj){
		if (Array.isArray(obj)){ for (const one of obj) this.set(one); return this; }

		(this.jsonl_lines ??= []).push(obj);
		this.emit("line", obj);

		if ("content" in obj && !(this.content instanceof List)){
			const { content, ...rest } = obj;
			this.ensure_content().set(content);
			return super.set(rest);
		}

		// ⚠ compat only, one release (2026-10-03 — the owner: "drop the special `at`
		// key"): an OLD line can still carry `{"at": "content/…", …}`; `locate()`
		// (Item.js, compat-only itself) needs `page.content` to already be a List
		// before it can find anything inside it. A FRESH nested line never needs
		// this at all — `get()` finds a content child by id with no `at` in sight.
		if (typeof obj.at === "string" && obj.at.split("/")[0] === "content") this.ensure_content();

		return super.set(obj);
	}

	// Made the first time a content DELTA arrives (a `{"content": {...}}` line) or a
	// code caller reaches for it directly — never up front, so a page with no visible
	// blocks of its own pays nothing. Once it exists, Item's own `set_one()` routes
	// straight to its `.set()` without this method running again.
	ensure_content(){
		return this.content instanceof List ? this.content
			: (this.content = new List({ owner: this, name: "content" }));
	}

	// My sub-pages — the real storage `page.pages`. `of: null` keeps a plain stub
	// object (`{id, name, stub: true}`) plain: List.make() hydrates a plain value
	// through `of` only when `of` is truthy, so a stub is never turned into an Item.
	// A REAL loaded page is a `Page` instance already (never plain), so it is
	// inserted/replaced UNCHANGED either way — see `add()` above.
	get pages(){ return this._pages ??= new List({ owner: this, name: "pages", of: null }); }

	// A Map-SHAPED VIEW over `pages`, so the ~215 existing `.children` callers across
	// ~94 files keep working unchanged while the real storage is the List above.
	// New code and docs say `page.pages`. `PageChildren extends Map` so
	// `instanceof Map` stays true and a page.jsonl line can never REPLACE it (see the
	// setter below) — only `declare()` above ever builds the real tree.
	get children(){ return this._children ??= new PageChildren(this); }

	// A config `children: […]` arrives here through ordinary `Object.assign` (the
	// constructor's own `this.assign(...args)` above) — this only STAGES it;
	// `declare()` is the one place that actually reads it (after `naming()` has set
	// `this.url`, which children need to move into).
	// ⚠ `this.children = new Map()` is also how a LIVE page throws its whole tree
	//   away and starts over (core/Page/generator/page.js's `grow()`, a regrow on
	//   every spec change) — nobody hand-builds a config as a real `Map`, so that
	//   shape unambiguously means "forget everything now", not "stage this for
	//   declare() later". Cleared quietly: a Map never announced either.
	set children(list){
		// A Map with entries (core/Page/page.js reorders its tabs this way) is copied
		// back in, in its own order, after the clear.
		if (list instanceof Map){
			const entries = [...list];
			[...this.pages].forEach(page => this.pages.release(page));
			entries.forEach(([name, page]) => this.children.set(name, page));
			return;
		}
		this._raw_children = list;
	}

	// ════ EXTENSIONS — a page.jsonl line names one on: `{"ext": "Inbox"}` ══════════
	// The DATA path — one page at a time. `Page.use(Ext)` above is the CODE
	// path — every page, the moment the module that calls it is loaded. Both end up
	// calling the same `Ext.setup(page)`.
	// ⚠ core never statically imports ext code — resolved against THIS file's OWN url
	//   (not the page's), so it always finds `core/Page/ext/<Name>/<Name>.js`.
	// ⚠ This import is ASYNC; the replay of an already-fetched page.jsonl is NOT —
	//   see `jsonl_lines` above, which is what lets a late setup() catch up.
	// `ext_ready` — every extension's own import+setup promise, so anything that
	// reads what an extension set up (a `place`-d module, say) can
	// `await Promise.all(page.ext_ready ?? [])` first rather than race it.
	ext(name){
		const ready = import(new URL(`./ext/${name}/${name}.js`, import.meta.url).href)
			.then(({ default: Ext }) => Ext.setup?.(this))
			.catch(error => console.error(`${this.log_label()} — ext("${name}") failed to load:`, error));
		(this.ext_ready ??= []).push(ready);
	}

	// ════ STEP 1 — the file EXISTS ════════════════════════════════════════════
	// Recorded, never rendered. A repeat changes nothing: the latest line per name wins.
	// TWO CALLERS, split: a REPLAYED `{"file": …}` line (this.store is mid-`read()`,
	// `this.store.replaying` is true) registers the listing, same as always. A CODE
	// call — `page.file("demo.jsonl")`, not a line — never touches the listing (that
	// would double-count a file the code already knows about) and instead hands back
	// the real file: ext/filesystem's `FsFile`, the one file class, dynamically
	// imported because core never statically imports ext. Its own lazy `.store`
	// getter is `Item.Store.for(url)` — one Store per file, the same one `page.store`
	// is for page.jsonl itself.
	file(name){
		if (this.store?.replaying){
			(this.listed ??= new Map()).set(this.last_file = key_of(name), name);
			CHILD.test(name) ? this.link_child(name) : this.unlink_child(key_of(name));
			return undefined;
		}

		const path = (this.log_folder() + name).replace(/^\/+/, "");
		return import("../../ext/filesystem/FsFile.js").then(({ default: FsFile }) => new FsFile({ path, name }));
	}

	// `{"file": "x", "gone": true}` — `set()` calls file("x") first, then this.
	gone(yes){
		if (!yes || !this.last_file) return;
		this.listed?.delete(this.last_file);
		this.unlink_child(this.last_file);
	}

	// ════ STEP 2 — a child page is LINKED, automatically ══════════════════════
	// "kid/page.jsonl" → the child "kid", remembered as a jsonl child so child()
	// loads it from the right file without probing. Also what `declare()` calls for a
	// page.js parent's `children: "kid/page.jsonl"`.
	child_file(entry){
		const [, dir, kind] = entry.match(CHILD) ?? [];
		if (!kind) return entry;

		(this.child_kinds ??= new Map()).set(dir, kind);
		return dir;
	}

	link_child(name){
		const dir = this.child_file(name);
		if (!this.children.has(dir)) this.children.set(dir, null);
	}

	unlink_child(key){
		if (!this.child_kinds?.delete(key)) return;
		this.children.delete(key);
	}

	// ════ TAB STATE — `{"tab": {"name": "x", "disabled": true, "nav": false, "order": 3}}` ═══
	// A child that already exists — a declared child, a `file` line, a `children:`
	// entry on a page.js parent — is already a tab the moment Doc.bar() or tabs()
	// (ext/tabs/tabs.js) sees it: this only adds STATE to it. `disabled` draws it
	// greyed and unclickable; `nav: false` drops it from the tab STRIP entirely (it
	// is still a real page at its own url); `order` breaks a tie when more than one
	// tab wants a position. A name with none of the three still gets DECLARED as a
	// child here (the same thing declare()'s own string form does), so a `tab` line
	// can be how a tab comes to exist at all, with nothing yet to draw there.
	// ⚠ Repeat lines for the same name MERGE (the new keys land on top of the old),
	//   never replace — set() calling this again is just one more spread.
	tab(obj){
		const { name, ...state } = obj;
		if (!name) return;

		(this.tabs_state ??= new Map()).set(name, { ...this.tabs_state.get(name), ...state });
		if (!this.children.has(name)) this.children.set(name, null);
	}

	// The state a `tab` line recorded for one name — `{}` when nobody ever set one, so
	// every caller (Doc.bar(), tabs()) reads `.disabled` / `.nav` / `.order` with no guard.
	tab_state(name){ return this.tabs_state?.get(name) ?? {}; }

	// ════ NAV VISIBILITY — one rule, read in one place, for the rail, the tab strip
	// and the drawer's own checkbox ═══════════════════════════════════════════════
	// Shown unless: MY OWN `tab` line says `nav: false` for this child (explicit,
	// always wins, and an explicit `nav: true` always wins the other way — see
	// `section()` in ext/Doc/Doc.js, which pins its own OVERVIEW/API/DOCS/FILES
	// chrome this way so those never depend on a real page's settings). Otherwise
	// this asks the exact question the drawer's own checkbox asks —
	// `page_settings()`, core/Page/settings/settings.js — which already unifies an
	// explicit `{"settings": {"nav": false}}` line on the CHILD's own log with the
	// weight fallback (below 1 is out of nav too).
	//
	// That real answer needs a fetch, so this stays SYNCHRONOUS the way every
	// caller (Doc.bar(), tabs(), Sidebar's rail) needs at render time: the first
	// ever ask answers optimistically `true` — a tab is never hidden before it's
	// actually been checked — then checks for real in the background, and if the
	// answer disagrees, corrects the cache and calls `nav_redraw()`
	// (ext/tabs/tabs.js) so the strip (and the rail, which bubbles up to it) fixes
	// itself with no reload. `nav_ready()` below is the same answer, awaited, with
	// no flash — used the one place that can afford to await before its first
	// paint (Sidebar.visible_nodes()).
	tab_visible(name){
		const set = this.tab_state(name).nav;
		if (set === false) return false;
		if (set === true) return true;

		this._nav ??= new Map();
		if (!this._nav.has(name)){
			this._nav.set(name, true);
			this.nav_ready(name).then(nav => {
				if (this._nav.get(name) === nav) return;
				this._nav.set(name, nav);
				this.nav_redraw?.();
			});
		}
		return this._nav.get(name);
	}

	// The real, awaited answer tab_visible() above is a synchronous, cached,
	// eventually-consistent stand-in for.
	async nav_ready(name){
		const set = this.tab_state(name).nav;
		if (typeof set === "boolean") return set;
		return (await page_settings(this.url + name + "/")).nav;
	}

	// Sort key: an explicit `order` wins; everyone else ties at `Infinity`, and
	// `Array.prototype.sort` is stable — a tie keeps the names in whatever order they
	// already had, so a page that names no order at all is untouched.
	tab_order(name){ return this.tab_state(name).order ?? Infinity; }

	// ════ STEP 3 — PLACED in the content, deliberately ════════════════════════
	// A name, an array of names, or `{"module": "x.js", …data}`. In order; once each.
	place(value){
		this.placed ??= [];

		for (const entry of [value].flat()){
			const id = JSON.stringify(entry);
			if (!this.placed.some(had => JSON.stringify(had) === id)) this.placed.push(entry);
		}
	}

	// What a page.jsonl page draws when it has no `content()` of its own: its placed
	// files, in order. The box is kept so a line appended later can redraw it.
	log_view(){
		return div.c("flow", () => {
			this.$log = div.c("page-log flow", () => { this.log_draw(); });
			this.draw_folder();
		});
	}

	// THE PAGE SHOWS ITS OWN FOLDER: page.jsonl and every file its lines name, as
	// ext/files draws them — a tree, and the one you click as highlighted source. A
	// reader sees where things are and reads the real thing. `file` lines that name
	// a child (`kid/page.jsonl`) are pages, not files, and are left out.
	// ⚠ core does not import ext: the import is dynamic, as in draw_md().
	draw_folder(){
		const url = location.origin + this.log_folder();
		const names = new Set(["page.jsonl", ...[...this.listed?.values() ?? []].filter(name => !CHILD.test(name))]);

		return div.c("page-log-files", $box => {
			import("../../ext/files/files.js")
				.then(({ default: files }) => $box.append(() => { files({ url }, [...names].join(" ")); }));
		});
	}

	log_draw(){ (this.placed ?? []).forEach(entry => this.draw_placed(entry)); }

	// Where the log's files really are. A page's `url` is its ADDRESS; a card shown at
	// another address (AI 2) still keeps its files in its own folder.
	log_folder(){ return String(this.jsonl_url ?? this.url).replace(/page\.jsonl$/, ""); }

	log_redraw(){ this.$log?.empty(() => { this.log_draw(); }); }

	// `.md` is prose. `.js` is a module, one rule: a default export with a `render`
	// (a View) is constructed as `new Default({ page, …data })`; anything else is
	// called as `fn(page, box, data)`. A child's name draws nothing — it is linked.
	draw_placed(entry){
		const { module, ...data } = is.str(entry) ? { module: entry } : entry;
		const url = new URL(module, location.origin + this.log_folder()).href;

		if (/\.md$/i.test(module)) return this.draw_md(url);
		if (/\.m?js$/i.test(module)) return this.draw_module(url, data);
	}

	// ⚠ core does not import ext: the import is dynamic, as in file() above.
	draw_md(url){
		return div.c("page-log-md", $box => {
			import("../../ext/markdown/md.js")
				.then(({ default: md }) => $box.append(() => md.file({ url }, url, { h1: false })));
		});
	}

	// ⚠ THE BOX IS CAPTURED NOW, before the import resolves — a dozen modules can
	//   arrive in any order and each fills the box it was given.
	draw_module(url, data){
		return div.c("page-log-module", $box => {
			import(url).then(({ default: Default }) => $box.append(() => {
				if (!Default?.prototype?.render) return void Default?.(this, $box, data);

				const made = new Default({ page: this, ...data });
				if (!(made instanceof View)) made.render();   // a View drew itself already
			})).catch(error => console.error(`${this.log_label()} — ${url} failed to load:`, error));
		});
	}

	// ════ THE DEBUG VIEW — every file, and which of the three steps it reached ═══
	listing(){
		const rows = new Map();
		this.listed?.forEach((name, key) => rows.set(key, { name, exists: true }));
		(this.placed ?? []).forEach(entry => {
			const name = is.str(entry) ? entry : entry.module;
			rows.set(key_of(name), { name, exists: false, ...rows.get(key_of(name)), placed: true });
		});

		const mark = yes => td(yes ? "yes" : "—");

		return div.c("page-log-listing", () => {
			table(() => {
				thead(() => { tr(() => { ["File", "Exists", "Linked", "Placed"].forEach(head => th(head)); }); });
				tbody(() => rows.forEach((row, key) => tr(() => {
					td(() => { code(row.name); });
					mark(row.exists);
					mark(this.child_kinds?.has(key));
					mark(row.placed);
				})));
			});

			if (this.unknown.length)
				p.c("muted", "Kept as data, no method or property knew them: " + this.unknown.join(", ") + ".");
		});
	}

	// Every `data` key that isn't one of my own declared `fields` — the only
	// kind of key that ever LANDS in `data` now (2026-10-03: everything else is
	// a method call or a field/List/child-id accessor, none of which touch
	// `data` at all). Was a separately-tracked Set `put()` built by hand; `data`
	// itself already says the same thing, now that fields have their own home.
	get unknown(){ return Object.keys(this.data).filter(key => !this.constructor.fields.includes(key)); }

	// One console.info per batch that taught the page a key nobody knew. Never a warn.
	report_unknown(){
		const fresh = this.unknown.filter(key => !this.reported?.has(key));
		if (!dev || !fresh.length) return;

		fresh.forEach(key => (this.reported ??= new Set()).add(key));
		console.info(`${this.log_label()} — page.jsonl keys no method or property knew, kept as data:`, fresh);
	}

	// A rewritten (not appended) log replays from line 1 onto a clean slate.
	log_forget(){
		this.listed?.clear();
		this.placed = [];
	}

	/* THE LOADER. `url` is the folder, ending in `/`. Line 1 is the constructor —
	   `new this(line1)`, so `Card.jsonl(url)` makes a Card — unless it names a
	   `"class": "<module url>"`, whose default export (a Page subclass) is built
	   instead. Every later line is `set()`. Null when there is no log.
	   ⚠ On localhost it STREAMS: a line appended later calls set() and redraws.
	   `Store.for(url)` — one Store per file: a second visit to the same page.jsonl
	   reaches the SAME live reader, never a second one racing it. */
	// ⚠ TWO CALLERS CAN EASILY RACE for the exact same url: `load_all_children()`
	//   crawls EVERY child of a page (including "jsonl") the moment its PARENT
	//   loads, at the same time the Router's own sequential walk is reaching
	//   "jsonl" as the NEXT path segment on that identical parent. `reader._building`
	//   is the fix: the first call's whole build is ONE promise, and a second call
	//   made before it resolves joins THAT SAME promise instead of starting its own.
	static async jsonl(url){
		const reader = this.Reader.for(url + "page.jsonl");

		// A page already built for this reader — the common case on a SECOND visit,
		// well after the first call settled. One page, built once, every later
		// caller gets the SAME live object back.
		if (reader.host) return reader.host;
		if (reader._building) return reader._building;

		return reader._building = (async () => {
			await reader.open();

			// A log whose line 1 is a `file` line is a folder's listing, not a page.
			const [first] = reader.entries;
			if (!first || typeof first.file === "string") { reader.close(); return null; }

			const Class = first.class ? await this.log_class(first.class, url) : this;
			const { class: _, ...line } = first;
			const page = new Class(line, { url, jsonl_url: reader.url });

			page.content ??= page.log_view;
			reader.attach(page);
			(Page.log_pages ??= new Map()).set(page.log_folder(), page);   // listing() reads it for free
			return page;
		})().finally(() => { reader._building = null; });
	}

	/* A FOLDER'S OWN FILE LIST — what used to cost the whole site's directory.json.
	   `url` is the folder (a trailing `/` is added). Where the list lives
	   (Server/plugins/PageFiles.js, doc/jsonl.md):
	     - a jsonl page keeps it in its own page.jsonl — if that page is already loaded,
	       its `listed` lines ARE the listing, with no fetch at all;
	     - every other folder keeps it in files.jsonl.
	   So: the loaded page, else files.jsonl, else page.jsonl (a jsonl page nobody has
	   loaded, or a log from before files.jsonl), else null and the caller falls back to
	   directory.json. When the parent's listing already says `kid/page.jsonl`, page.jsonl
	   is asked first, so a card costs one request, not a 404 and then one.
	   Memoised per folder (`fresh` refetches); no page is built.
	   ⚠ Not live unless it came from a loaded page: a file added after the fetch is
	   missing until `fresh`. */
	static listing(url, fresh){
		url = String(url).replace(/\/?$/, "/");
		if (Page.UNLOGGED.test(url)) return Promise.resolve(null);

		const own = Page.page_listing(url);
		if (own) return Promise.resolve(own);

		const memo = Page.listings ??= new Map();
		if (fresh || !memo.has(url)) memo.set(url, Page.fetch_listing(url)
			.then(listing => { (Page.loaded_listings ??= new Map()).set(url, listing); return listing; }));
		return memo.get(url);
	}

	// The two files, in the order the parent's listing suggests; the first one there wins.
	static async fetch_listing(url){
		const [, parent, name] = url.match(/^(.*\/)([^/]+)\/$/) ?? [];
		const jsonl_first = parent && Page.loaded_listing(parent)?.pages.get(name) === "jsonl";
		const order = jsonl_first ? ["page.jsonl", "files.jsonl"] : ["files.jsonl", "page.jsonl"];

		for (const file of order){
			const reader = await new Page.Reader({ url: url + file }).load();
			if (reader.loaded) return Page.Listing.from(reader.entries, file === "page.jsonl" ? undefined : false, file);
		}
		return null;
	}

	// A jsonl page already loaded at `url` (jsonl() registers it): its lines, as a listing.
	static page_listing(url){
		const page = Page.log_pages?.get(url);
		if (!page) return null;
		return Page.Listing.from([...page.listed?.values() ?? []].map(file => ({ file })), true, "page.jsonl");
	}

	// ⚠ Folders INSIDE a dated task folder get no log (Server/plugins/PageFiles.js
	//   covers()), so asking would only log a 404: listing() answers null at once and
	//   the caller falls back. The card style (ai/YYYY/MM/DD/) is left out on purpose:
	//   a sub-card's folder can hold a real page.jsonl.
	static UNLOGGED = /^\/framework\/ai\/\d{4}-\d\d-\d\d\/[^/]+\/[^/]+\//;

	// The listing, only if it is already here — a loaded jsonl page, or a `listing()`
	// call that has come back; never fetches.
	// undefined = not asked yet, null = asked, no file list.
	static loaded_listing(url){
		url = String(url).replace(/\/?$/, "/");
		return Page.page_listing(url) ?? Page.loaded_listings?.get(url);
	}

	static async log_class(module, url){
		const Class = (await import(new URL(module, location.origin + url).href)).default;
		if (Class?.prototype instanceof Page) return Class;

		console.error(`page.jsonl at ${url} — "class": "${module}" is not a Page subclass; building a ${this.name}.`);
		return this;
	}

	naming(){
		this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
		             : this.parent && this.name ? this.parent.url + this.name + "/"
		             : this.title ? "/" + Page.slug(this.title) + "/"
		             : undefined;
		this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
		// `put()`, not `this.title = …`: a construction-time DEFAULT is not a
		// change (same "loading is not a change" rule `List.insert()` follows) —
		// `title` is a real `data`-backed accessor now (2026-10-03), and the plain
		// `=` form would fire a `change`/`delta` event, and even try to WRITE this
		// default back out through the Store, on every single page that never set
		// its own title.
		if (this.title === undefined) this.put("title", this.name);

		// A page's id is its folder name — `static new_id()` above deliberately
		// returns undefined, so this is the ONLY place a page ever gets one. Without
		// it, `page.pages`'s `key(x) => x.id` never matches anything by name, and
		// every `add()`-ed child becomes permanently unfindable by `children.get()`/
		// `.has()` — found 2026-10-02 chasing a 404 in core/Page/generator/, whose
		// own `grow()` adds children exactly this way.
		this.id ??= this.name;
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

	/* The classes those words stamp ON THE PAGE. ONE method, so `render()` and
	   `render_column()` cannot drift.

	   ⚠ `surface` IS NOT IN THIS LIST, and that is the difference between a card and a
	     card inside a card. The two colour words paint two DIFFERENT boxes: the page
	     wears `background`, and the content box — the one `Frame.box()` draws — wears
	     `surface`. One word, one class, one element. Stamped in both places for one
	     build, `surface: "card"` drew a bordered, shadowed card and then drew a second
	     one inside it (measured 2026-09-06 at 1280 with the paging lab's `card` word). */
	word_classes(){
		return [
			this.navigation  && "page-nav-" + this.navigation,
			this.arrangement && "page-arr-" + this.arrangement,
			this.background  && "page-bg-" + this.background,
			this.type_size   && "page-type-" + this.type_size,
		].filter(Boolean);
	}

	// DID THE PAGE SAY ANY WORD AT ALL? This is what `render()` asks before it builds a
	// `Frame`, rather than `word_classes().length` — `surface` writes no class up here
	// and still needs the frame, because the frame draws the very box it paints.
	words_said(){ return !!(this.surface || this.word_classes().length); }

	// My sub-pages, in declaration order: undefined = not mine, null = declared, Page
	// = here — the Map-shaped shim over `page.pages` (above) that is the real
	// storage now. A POJO declares by title — the key is the title, Page.slug(key)
	// the url segment.
	// ⚠ `list` IS THE DECLARATION — the config's own `children` (staged by the
	//   `set children()` the moment the constructor's `assign()` sees one, read here
	//   once `naming()` has given me a `url` to move them into) and whatever a data
	//   source answered with later, so a SECOND call ADDS and the children declared
	//   by name keep their places. A FUNCTION is a data SOURCE: it declares nothing
	//   now and is called on the first ask, by source_children() below. doc/data-children.md.
	declare(list = this._raw_children ?? []){
		if (is.fn(list)) { this.child_source = list; list = []; }

		const entries = is.str(list) ? list.trim().split(/\s+/)
		              : is.arr(list) ? list
		              : Object.entries(list);

		entries.forEach(child => {
			if (is.str(child)) return this.children.set(this.child_file(child), null);   // "kid/page.jsonl" → kid

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

		// Quietly — declaring a child is not a live edit. A stub already holding this
		// name (an earlier `file`/`tab` line, or `declare()`'s own string form) is
		// REPLACED in place (`List.replace`, never announces); otherwise this is
		// a fresh insert. `page.pages` (above) is the real storage; `this.children`
		// above is only the Map-shaped view over it.
		const stub = this.pages.find(name);
		stub ? this.pages.replace(stub, page) : this.pages.insert(page);
		return page;
	}

	// Adoption hands a page a new address; the resolved subtree moves with it. Stubs
	// (not yet loaded) have no `.move()` of their own and are skipped, same as the
	// old `child?.move(...)` did when `child` was `null`.
	move(url){
		if (this.url === url) return this;

		this.url = url;
		this.pages.forEach(child => { if (!child.stub) child.move(url + child.id + "/"); });
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

	// A `children()` FUNCTION is called here, ONCE — the first time anyone asks for a
	// child: child() asks for the Router's walk, load_all_children() for a landing with
	// no segment to walk. So a page whose children live in data costs nothing until it
	// is visited, and it answers with anything `children:` takes — or a promise of it.
	// ⚠ Memoised on `this.sourcing`: the second ask reuses the first one's promise.
	source_children(){
		return this.sourcing ??= Promise.resolve(this.child_source.call(this))
			.then(list => this.declare(list ?? []));
	}

	// Memory, then route(), then a filesystem probe. One of the two places `app` is
	// handed down — `render_column()` is the other, for the child nothing routes to.
	// route() sees undeclared names only, so it cannot shadow a child.
	//
	// `levels` is how deep the child then loads: my remaining budget while I walk my
	// own subtree, and NOTHING when the Router walked in here — which means the child
	// loads as deep as its own `depth` reaches. doc/declaring.md.
	async child(name, levels){
		if (this.child_source) await this.source_children();

		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app }).load_all_children(levels);

		// A child the listing named as `kid/page.jsonl` is read from that file — no probe.
		if (this.child_kinds?.get(name) === "jsonl") {
			const page = await Page.jsonl(this.url + name + "/");
			return page && this.add(name, page).load_all_children(levels);
		}

		// Every page has an `md/`: its markdown files, as pages. Before route(), so a
		// page that routes every name still has one. Markdown.js.
		if (name === "md" && known === undefined) return this.add(name, await this.md_folder()).load_all_children(levels);

		// Every page has an `fs/`: this directory's real files, full screen — the
		// owner's "any path slash fs" route (2026-09-28). The same seam as `md`
		// above, one door over in ext, so no page.js exists for it anywhere.
		if (name === "fs" && known === undefined) return this.add(name, await this.fs_folder()).load_all_children(levels);

		const claimed = known === undefined && is.fn(this.route) && this.route(name);
		if (claimed) return this.add(name, claimed).load_all_children(levels);

		// My folder's own page.jsonl (listing() above), IF something already loaded it,
		// says which file makes `name`, so the probe that would 404 is skipped. Not
		// fetched here: every folder the Router walks would pay a fetch, and a folder
		// with no log a 404. A name it does not list keeps the probe order below: a
		// stale list must never hide a real page.
		const [listing, docs] = [Page.loaded_listing(this.url), Page.loaded_listing(this.md_dir())];
		const kind = listing?.pages.get(name);
		const md = !listing?.folder(name) && docs?.files.includes(name + ".md");

		if (kind === "jsonl") {
			const page = await Page.jsonl(this.url + name + "/");
			if (page) return this.add(name, page).load_all_children(levels);
		}

		const doc = md && await this.child_md(name, levels);
		if (doc) return doc;

		const page = await Page.load(this.url + name + "/", 0);
		if (page) return this.add(name, page).load_all_children(levels);

		return md ? null : this.child_md(name, levels);
	}

	// `name.md` beside me, as a page — the last probe, or the first when my list names it.
	async child_md(name, levels){
		const file = await Page.file(this.md_dir() + name + ".md");
		return file ? this.add(name, { ...file, folder: this.md_dir() }).load_all_children(levels) : null;
	}

	// ⚠ Imported on first use: Markdown extends Page, so a static import is a cycle.
	async md_folder(){
		const { default: PageMarkdown } = await import("./Markdown.js");
		return new PageMarkdown({ folder: this.md_dir(), title: "Markdown" });
	}

	// This directory's own files, full screen, at my own `fs/` — ext/files/fs.js is
	// the classic view (v1: no site nav at all); ext/files/explorer.js is v2 (the
	// framework's own nav stays, tree + code columns fill the rest) and is the
	// DEFAULT now — the owner's own words, 2026-09-29: "on framework pages, we
	// want to leave the framework navigation there as much as possible." `?v=1` in
	// the url is the one-click way back to v1, same as every other page word: the
	// page never decides for itself, the url does.
	// ⚠ core does not import ext: the import is dynamic, same as md_folder() above.
	async fs_folder(){
		const v1 = new URLSearchParams(location.search).get("v") === "1";
		const module = v1 ? "../../ext/files/fs.js" : "../../ext/files/explorer.js";
		const { default: PageFiles } = await import(module);
		return new PageFiles({ folder: this.md_dir() });
	}

	// ════ WHERE A CLICKED LINK OPENS — the page decides, the link carries no target ══
	// The Router hands every in-app click to the page that holds the link. doc/open.md.

	// The real folder my own .md files live in. A card whose url is a view of a folder
	// elsewhere overrides this.
	md_dir(){ return this.folder ?? this.url; }

	// A url to navigate to, or nothing when I showed the link myself. The default
	// navigates; in a columns tree, a doc from my own folder opens as the next column.
	open_link(link){
		const file = Page.md_file(link);
		if (!file) return link.pathname;

		const dir = this.md_dir(), rel = dir && file.startsWith(dir) && file.slice(dir.length);
		if (!rel || !this.column_host()) return Page.md_url(file);

		// A doc beside me becomes my child, so it opens as the very next column.
		// One in a subfolder goes through my md/, which is a column of its own.
		if (rel.includes("/")) return this.url + "md/" + rel.replace(/\.md$/i, "/");

		const name = rel.slice(0, -3);
		if (!this.children.has(name)) this.add(name, Page.md_page(file));
		return this.url + name + "/";
	}

	// A page that is one .md file, headed by its file name; the file keeps its own h1.
	static md_page(file){
		return {
			folder: file.replace(/[^/]*$/, ""),
			content(){ return import("../../ext/markdown/md.js").then(({ md }) => md.file({ url: location.href }, file)); },
		};
	}

	// Draw the doc INSIDE me, over what I was showing, with a way back. A card or any
	// small box says `open_link(link){ return this.swap_link(link); }`.
	// ROUTE EVERYTHING: the swap gets its own address, `<my url>md/<doc>/` — the md/
	// route every page already has — so a reload lands on the same doc and Back closes
	// it. doc/open.md.
	swap_link(link){
		const file = Page.md_file(link);
		if (!file) return link.pathname;

		this.swap_close?.();
		const shown = [...this.view.el.children].filter(el => !el.matches(".page-swap"));
		shown.forEach(el => el.style.display = "none");

		const url = this.swap_url(file);
		const back = () => location.pathname === url ? history.back() : close();
		const on_pop = () => { if (location.pathname !== url) close(); };
		let $shell;
		const close = () => {
			$shell?.el.remove();
			shown.forEach(el => el.style.display = "");
			removeEventListener("popstate", on_pop);
			this.swap_close = null;
		};

		this.view.append(() => {
			div.c("page-swap pad", $swap => {
				$shell = $swap;
				button.c("page-swap-back flex v-center gap", () => { icon("arrow_back"); span("Back"); }).on("click", back);
				Page.file(file).then(doc => {
					$swap.append(() => { doc ? doc.title && h2(doc.title) : p.c("muted", "Nothing could be read at " + file + "."); });
					if (doc) $swap.append(doc.content());
				});
			});
		});

		this.swap_close = close;
		if (location.pathname !== url) history.pushState({}, "", url + link.hash);
		addEventListener("popstate", on_pop);
	}

	// Where a swapped doc lives: my own md/ when the doc is in my folder, else its module's.
	swap_url(file){
		const dir = this.md_dir();
		return dir && file.startsWith(dir) ? this.url + "md/" + file.slice(dir.length).replace(/\.md$/i, "/") : Page.md_url(file);
	}

	// My own folder's .md files, as links — the Router hands each click back to me.
	// `names` when the caller knows them (a card's own file lines); else the dev
	// server's file list, which production does not have (so: nothing there).
	md_files(names){
		const dir = this.md_dir();

		return ul.c("page-md-files", $list => {
			const list = names ? Promise.resolve(names)
				: import("./Markdown.js").then(({ default: PageMarkdown }) => PageMarkdown.files(dir));

			list.then(files => $list.append(() => {
				(files ?? []).filter(name => /\.md$/i.test(name) && !name.includes("/"))
					.forEach(name => li(() => { a(name.slice(0, -3)).href(dir + name); }));
			}));
		});
	}

	// The .md file a link points at — its href, or what md.route() rewrote it from.
	static md_file(link){
		return link.dataset?.md ?? (/\.md$/i.test(link.pathname) && !link.search ? link.pathname : null);
	}

	/* A .md file's page when nothing nearer claims it: its module's md/. The module is
	   the folder above `doc/`, or else the file's own folder.

	       /framework/ext/Panel/readme.md    → /framework/ext/Panel/md/readme/
	       /framework/ext/Panel/doc/flow.md  → /framework/ext/Panel/md/doc/flow/

	   ⚠ THE TRAILING SLASH IS LOAD-BEARING. ext/Panel documents `flow.js` in
	     `doc/file/flow.js.md`, and a url ending in `.js` is answered as a FILE — a 404,
	     never the app. Ending in `/`, every route reaches the SPA fallback.
	   ⚠ A guess: 68 of 2,276 .md files (13 folders with no page.js, measured 2026-09-24)
	     sit where no page is, and a link to one 404s. */
	static md_url(file){
		const doc = file.indexOf("/doc/");
		const base = doc >= 0 ? file.slice(0, doc + 1) : file.replace(/[^/]*$/, "");
		return base + "md/" + file.slice(base.length).replace(/\.md$/i, "/");
	}

	// Which page drew this element — the nearest one up. Filled by render().
	static views = new WeakMap();
	static of(el){
		for (; el; el = el.parentElement) if (Page.views.has(el)) return Page.views.get(el);
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
	// `opts` passes straight to `fetch` — e.g. `{ priority: "low" }`, so a big census
	// file (directory.json) never queues ahead of the page's own small requests on
	// a slow connection (ai/2026-09-29/slow-card-fix/).
	static async read_json(url, opts){
		const res = await fetch(url, opts).catch(() => null);
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
	/* ⚠ `new this(…)` AND `this.from(…)`, NEVER `new Page(…)`. A static is inherited, so
	     `Section.from(url)` reaches this method — and with `Page` hard-coded it handed
	     back a plain `Page`, which is why `core/Section` had a near-copy of the whole
	     thing. One word each, and the subclass is the thing that gets built, root and
	     children alike. (2026-09-06; the copy in `Section.js` is deleted.)
	   ⚠ THE KEYS ARE `props()`, one method down, so a subclass ADDS its own without
	     copying the reader — `Section` reads `layout` and `editing` that way. */
	static async from(source, adopt){
		const url  = is.str(source) ? source.replace(/\/?$/, "/") : null;
		const data = url ? await this.read_json(url + "page.json") : source;
		if (!data) return null;

		const page = new this({ url, ...this.props(data, data.mode ?? {}) }, adopt);

		// ⚠ `url &&` — an object handed in directly has no address for its children to
		//   hang off, so they are declared by name and left to resolve the ordinary way.
		for (const name of data.children ?? [])
			page.add(name, (url && await this.from(url + name + "/")) ?? { title: name });

		return page;
	}

	/* WHAT A `page.json` BECOMES — the six page words plus the three labels, read off
	   the file's own shape. Its own method so a subclass overrides ONE thing:

	       static props(data, mode){ return { ...super.props(data, mode),
	           layout: data.layout ?? mode.layout }; }                              */
	static props(data, mode){
		return {
			title: data.title, icon: data.icon, description: data.description,
			navigation: mode.navigation, arrangement: mode.arrangement,
			surface: mode.surface, background: mode.background,
			type_size: mode.type,                       // the disk key is older than the label
			width: mode.room ?? mode.width,
			content: mode.content,                      // a url, or the page's own function
		};
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

		// ⚠ THE FALLBACK for a page whose OWN `render()` replaced this class's —
		//   `ext/Doc`'s well-and-tabs shell is the one on the site today. render()
		//   above already draws the aside for the ordinary grid page and for a
		//   columns row (column()); `related_drawn` is how those two say "already
		//   mine", so this never fires twice. `activate()` is generic and Doc
		//   does not override it, which is what makes this the one place related:
		//   still reaches a page whose chrome core does not own — appended after
		//   whatever that chrome already built, so it reads as a block at the
		//   end rather than a right rail (`.page-related`'s own `flex-basis:
		//   100%` is for exactly this shape; doc/decisions.md).
		if (this.related && !this.related_drawn)
			this.view.append(() => { this.related_aside(); });

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

	// An ancestor drawn by ext/Doc (its top-level well-and-tabs shell, or one of its
	// nested tab-panel sections) already gives a Files tab to the same directory this
	// page's own Folder link would open — a second way there is just noise. Checked
	// by the ancestor's own DOM class, not `instanceof Doc`: core/Page doesn't (and
	// shouldn't) import ext/Doc. Measured 2026-09-29: 50px of dead space (a 22px row
	// plus its 28px flow gap) on every doc-page section.
	// ⚠ `page.view` is the VIEW WRAPPER (`div.c(...)` returns a `View`, not a raw
	//   element) — its class list lives at `page.view.el.classList`, one level down.
	//   A first version read `page.view.classList` (always undefined) and measured
	//   the Folder link still there after "shipping" the fix. `this.chain()` itself
	//   is safe to use here even though this ancestor Doc's own `tabs()` fills its
	//   panel on a microtask (ext/tabs/tabs.js): by the time that microtask runs
	//   `first.render()`, the ancestor's own `div.c(...)` call already returned and
	//   assigned `.view`, so every ancestor in the chain has it set.
	in_doc(){
		return this.chain().slice(0, -1).some(page => {
			const cls = page.view?.el?.classList;
			return cls?.contains("doc-page") || cls?.contains("doc-section");
		});
	}

	render(){
		if (this.view) return this.view;

		const host = this.column_host();
		if (host) return this.render_column(host);

		// `standard` is the default page shape; a declared `classes` replaces it whole.
		this.view = div.c("page flow", () => {
			if (this.title) h1.c("page-title", this.title);

			// ⚠ NOT a floating "Folder" link here any more. One existed briefly
			// (2026-09-28, "any path slash fs") and michael/dev re-added a refined
			// version of it (in_doc()-guarded) in the SAME merge this comment
			// resolves — but the owner found it unclear ON ITS OWN PAGE and it was
			// deliberately deleted same-day (dbe94242, "a 'Files' item in the
			// mobile-nav drawer replaces it"), which is real, separate, already-
			// landed work (the mobile-nav task, several merges into michael/dev).
			// Kept deleted: reintroducing it here would undo a dated, reasoned
			// owner decision that the merge otherwise has no way to know about.
			// `/fs/` itself is unaffected — every folder still has one, this was
			// only ever the inline link TO it.

			/* A page that said one of the six words gets a FRAME: the chrome its
			   arrangement word asks for, around the box its content goes in. A page
			   that said none has no frame at all and draws exactly what it drew before
			   the words existed. Frame.js.
			   ⚠ `page-frame-page` — THIS frame is the page's own, as opposed to one
			     drawn as a picture of a page inside a cell. It is the only frame whose
			     body becomes a container, so it is the only one the `< 34em` stacking
			     query can reach (Page.css says what that cost when every frame had
			     one). A demo that draws a page-sized frame of its own opts in with the
			     same class. */
			if (this.words_said()) return void new this.constructor.Frame({ page: this }).ac("page-frame-page");

			return this.render_content();
		})
			.ac(this.name && "page--" + this.name)
			.ac(this.width && !this.column_host() && "page-w-" + this.width)
			.ac(...this.word_classes())
			.ac(this.classes ?? "standard");

		// ⚠ APPENDED, not woven into the callback above: the two branches above
		//   this line already return their own value on purpose (the Frame or
		//   render_content()'s own view, which `.append()` — the capturing trap
		//   this whole codebase is built around — would otherwise re-append A
		//   SECOND TIME). `.append(fn)` on the finished view re-opens it as the
		//   captor for exactly this one call, the same shape content_at() uses,
		//   so nothing about the two branches above has to change.
		if (this.related) this.view.append(() => { this.related_aside(); });
		// "$N.NN of AI work · M tasks" — computed by Server/page-ai-cost.mjs onto this
		// page's own log, never by this code (law 7). It goes at the END of the page: at
		// the top it sat above a Doc page's tab title with no padding and pushed the whole
		// page down (owner, 2026-10-03). Fails soft: no figure draws nothing.
		if (this.title && this.url) this.view.append(() => {
			span.c("page-ai-cost muted").append(ai_cost(this.url).then(c => {
				if (!c || !(c.usd > 0)) return undefined;
				return a(`$${c.usd.toFixed(2)} of AI work · ${c.tasks} task${c.tasks === 1 ? "" : "s"}`)
					.href(`/framework/ai/log/?page=${encodeURIComponent(this.url)}`);
			}));
		});

		Page.views.set(this.view.el, this);
		this.emit("render", this.view);   // once, here — the early return above skips a second draw
		return this.view;
	}

	// WHAT IS IN THE BOX: a function, a string of text, or — a string starting with
	// `/` — an ADDRESS to render. Split out of `render()` because `Page.Frame` needs
	// to draw the same thing inside its own canvas.
	/* ⚠ A PLAIN STRING BECOMES A PARAGRAPH, never a bare text node. `.page` is a GRID,
	     and its `main` / `wide` / `bleed` tracks are assigned by `.page > *` — a rule
	     that cannot reach a text node. So a returned string became an ANONYMOUS grid
	     item in the first implicit track, which is the gutter: measured 2026-09-06, a
	     40-word `content: "…"` drew one character a line and 4,766px tall at 1280, with
	     nothing in the console. `p()` puts it in the same element the function form
	     produces, in the reading track, and reads backticks as code the way every other
	     paragraph on the site does. */
	render_content(){
		if (this.content instanceof List) return this.render_content_list();
		if (is_address(this.content)) return this.content_at(this.content);
		if (is.str(this.content)) return p(this.content);
		return is.fn(this.content) ? this.content() : this.content;
	}

	/* ════ A CONTENT LIVELIST, DRAWN — the one reusable view (deliverable 6,
	   page-item-design.md). One row per item, each item's own `.view`; drag to
	   reorder with `ext/Draggable/Sortable` (dynamic import — core never imports
	   ext); redrawn from the list's own events, never polled.
	   ⚠ `item: { items: list, … }` on the CONTAINER's own Sortable, and `item: item`
	     (the real content Item) on each ROW's — `Sortable.release()` (ext/Draggable)
	     commits a drop through `where.list.item.items.move(dragged, { from:
	     dragged.parent?.items })`, a name every OTHER caller of Sortable (Panel, the
	     editor's blocks) happens to have chosen for its own list too. `content`'s
	     real name everywhere else is `content`; `items` here is only that one seam,
	     confined to this method. A page has no `.items` of its own, so `from`
	     resolves to `undefined` and `move()` reorders within THIS list — exactly
	     right for a flat list with no nesting. */
	render_content_list(){
		const list = this.content;
		let $rows;

		// ⚠ `item.view` is undefined until core/Item grows a real default view (the
		//   `static View` wiring Item.js's own comment names, not yet built) — so a
		//   plain, untyped item (no view of its own) falls back to its own title or
		//   text, read straight off its data bag, rather than drawing an empty row.
		const draw_row = item => {
			const $row = div.c("page-content-row card", () => {
				if (item.view) return void $rows.append(() => item.view);
				const title = item.get("title"), text = item.get("text");
				if (title || !text) h4.c("page-content-title", title ?? String(item.id));
				// The text under the title, as markdown. ext/markdown is dynamically imported
				// (core never imports ext statically); the box is captured now and filled in the
				// callback, never DOM after an await. Before 2026-10-03 a titled item dropped its
				// text entirely (the owner's "Now" card showed three bare titles).
				if (text){
					const $text = div.c("page-content-text");
					import("../../ext/markdown/md.js").then(({ default: md }) => $text.append(md(text)));
				}
			});
			import("../../ext/Draggable/Sortable.js").then(({ default: Sortable }) => {
				new Sortable({ view: $row, item });
			});
			return $row;
		};

		// ⚠ A BLOCK BODY, not `() => list.forEach(draw_row)` — `forEach()` returns the
		//   list itself, and an arrow function's IMPLICIT return hands that back to
		//   `div.c()` as one more thing to append, which stringifies it into a stray
		//   "[object Object]" text node after the real rows (found taking this
		//   method's own screenshot, 2026-10-02).
		const box = div.c("page-content-list flow", () => {
			$rows = div.c("page-content-rows drag-items", () => { list.forEach(draw_row); });
		});

		import("../../ext/Draggable/Sortable.js").then(({ default: Sortable }) => {
			new Sortable({ view: $rows, handle: false, $items: $rows, item: { items: list, root(){ return this; } } });
		});

		const redraw = () => $rows.empty(() => { list.forEach(draw_row); });
		["add", "remove", "move", "order"].forEach(verb => list.on(verb, redraw));

		return box;
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

	// ════ RELATED — a pinned aside of links to other pages ═══════════════════
	// `related: "/a/ /b/"` — a string of urls, one row each. doc/property/related.md.
	related_list(){ return (this.related ?? "").trim().split(/\s+/).filter(Boolean); }

	// Is there already a heading with this word ON MY OWN VIEW? Unlike ext/toc's
	// headings (scanned before content() has drawn any), the aside is always
	// appended AFTER whatever it sits beside, so the check can run synchronously
	// against the real DOM — no microtask needed.
	has_heading(word){
		return [...this.view?.el.querySelectorAll("h1,h2,h3,h4,h5,h6") ?? []]
			.some(node => node.textContent.trim().toLowerCase() === word);
	}

	// The aside itself: a small "Related" heading (skipped if the page already
	// has one of its own), then one row per url — its target's OWN icon and
	// title, read live so a renamed target updates this row without anyone
	// touching this page.
	// ⚠ `Page.load(url, 0)`, not `Page.from(url)`. `Page.from()` reads a
	//   `page.json` beside the url and answers null when there is none — which
	//   is every ordinary page.js-backed page on the site, our two consumers
	//   included. `Page.load()` is the one that already does what a related
	//   link needs: a DYNAMIC `import(url + "page.js")`, so it costs no static
	//   import (no cycle) and reads the target's real, current title and icon —
	//   `0` for its depth budget, so it fetches none of the target's own
	//   children. doc/property/related.md has the alternative this gave up.
	// ⚠ A url that 404s, or whose module throws, drops its row SILENTLY — the
	//   `.catch(() => null)` here, not Page.load()'s own partial logging (which
	//   still consoles a real syntax error). `related:` is a small nicety; it
	//   must never be the thing that puts a red line in someone's console.
	related_aside(){
		this.related_drawn = true;
		const urls = this.related_list();
		if (!urls.length) return null;

		return div.c("page-related", () => {
			if (!this.has_heading("related")) span.c("page-related-title h4", "Related");

			div.c("page-related-links", () => urls.forEach(url => {
				const $row = div.c("page-related-row");

				Page.load(url, 0).catch(() => null).then(page => {
					if (!page?.title) return void $row.remove();

					$row.empty(() => a.c("page-related-link", () => {
						if (page.icon) icon(page.icon);
						span(page.title);
					}).href(page.url ?? url));
				});
			}));
		});
	}

	// ════ COLUMNS — the Finder shape ══════════════════════════════════════════
	// One call on a host page and its whole subtree lays out as full-height columns,
	// each child opening to the right. The arrangement is CSS (Page.css); this is the
	// box each page needs. doc/columns.md.
	// ⚠ `this.columns({ even: true })`, never a declared `columns: "even"` field. A
	//   page's config is Object.assign'd OVER the prototype, so `columns:` as data
	//   would shadow this very method and the next page to write
	//   `initialize(){ this.columns(); }` would die on "this.columns is not a
	//   function" — the `opens()` collision below, one line higher up. The option is
	//   translated into a PREFIXED field for the same reason: a bare `even` is a word
	//   a page may well want for itself. (The owner asked for the mode by name on
	//   2026-09-17, which is what stands in for the propose-a-name step.)
	// `fit` is how the even mode turns a room into a COUNT, and it only means
	//   something when `even` is on:
	//     floor  (the default) N = floor(room / recommended). A column is never
	//            narrower than the width it recommends, so prose never falls under its
	//            measure; the cost is room left over, spent as padding inside the
	//            columns - about 227px a column at 3440.
	//     round  N = round(room / recommended). Fills the room tighter, and a column
	//            CAN go under its recommendation to do it.
	//   `floor` is the default because a reading column under its measure is the
	//   failure this site has been fighting; `round` is one word away for a host that
	//   would rather fill the room. doc/columns.md has the N at three widths for both.
	//   ⚠ `column_fit`, prefixed, for the same reason `column_even` is: a page's config
	//     is assigned OVER the prototype, so a bare `fit` is a word a page may want.
	columns({ even = false, fit = "floor" } = {}){ this.columnar = true; this.column_even = even; this.column_fit = fit; return this; }

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
			//   in its content threw (`layouts/labs/screens/deck`, 2026-08-29).
			this.$pages = div.c("page-column-pages", () => this.default_column()?.assign({ app: this.app }).render());
		};

		// The mode is the HOST's, so the class is the host's too — Page.css reads it as
		// `.page.columns.page-columns-even`, one row, one answer for N.
		this.view = div.c("page")
			.ac(this === host ? "columns" : "column")
			.ac(this === host && this.column_even && "page-columns-even");

		this.view.append(this === host ? () => {
			this.$crumbs = div.c("page-columns-bar");
			this.$row = div.c("page-columns-row", stack);
		} : stack);

		// ⚠ No `page-w-*` here: a column's width is already stamped by `column()` below,
		//   and under a columns host the page grid the width words move things in does
		//   not exist. The other five words are plain classes and work in both hosts.
		Page.views.set(this.view.el, this);
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

			/* ⚠ `render_content()`, NOT the two-branch version written out by hand. It is
			     the SAME reader `render()` uses, so `content: "/notes/columns.md"` is that
			     file drawn HERE too. Written out here for one build, a `content` url in a
			     columns row printed its own address as a line of text (2026-09-06) — one
			     of the two places what-is-in-the-box is decided, disagreeing with the
			     other. There is one now. */
			if (this.content)
				div.c("page-column-prose flow", () => this.render_content());

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

			// A COLUMN IS ALREADY A RAIL, so `related:` here is a short list at
			// the end of it, never a second pinned region — there is no page
			// grid under a columns host for a third region to open in (Q1 of
			// the layout skill). `page-column-prose`, unclassed `flow`, so it
			// gets the column's own pad-x/pad-y without the prose rhythm's
			// bigger vertical gaps between the rows.
			if (this.related) div.c("page-column-prose", () => this.related_aside());
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

	// ── `even` — N columns, all the same width, N computed from the ROOM ──
	// N = max(1, floor(available / recommended)); width = available / N. `available`
	// is the ROW's own inline size, not the window's — the owner asked "screen or
	// container?" and the answer is container, because a row can be a panel, a demo
	// box or one half of a split and still has to get this right. `floor` is what
	// buys the guarantee: a column is never narrower than the width it recommends.
	// Page.css turns the ONE value written here into every column's width.
	// ⚠ STATIC, so the lab at /imagine/design/navigation/ sizes its `even` row with
	//   the very function a real host uses. The page's own readout and a headless
	//   measurement of the same click then cannot disagree, because there is one
	//   copy of the arithmetic.
	// ⚠ THE STAMP COMES OFF BEFORE THE READ. `max-width` is the recommendation only
	//   while `--page-column-even-w` is unset (Page.css spells out why); with the
	//   stamp on, max-width IS the even width and the row would divide its own
	//   answer again, halving the columns on every resize.
	// ⚠ `max-width: none` means the `< 32em` PHONE REGIME has taken over — it writes
	//   the three properties directly and pages the row one column at a time. There
	//   is nothing to compute down there and nothing of that regime is touched: the
	//   stamp comes off and stays off. Core's own threshold, read off core's own
	//   rule, so the two can never drift apart.
	static even_columns(row, fit = "floor"){
		if (!row) return null;

		row.style.removeProperty("--page-column-even-w");

		const body = row.querySelector(".page-column-body");
		const recommended = parseFloat(body && getComputedStyle(body).maxWidth);
		const available = row.clientWidth;
		if (!(recommended > 0) || !available) return null;

		// `floor` never lets a column fall under its recommendation; `round` fills the
		// room tighter and lets it. Never below 1 either way: one column that is too
		// narrow still beats none.
		const slots = available / recommended;
		const n = Math.max(1, fit === "round" ? Math.round(slots) : Math.floor(slots));
		const width = available / n;

		row.style.setProperty("--page-column-even-w", width + "px");
		return { n, width, available, recommended, fit };
	}

	// My row's N and column width, or null when I am not in the mode. `column_fit`
	// rides along so the host's own answer and the static one cannot differ.
	even_columns(){ return this.column_even ? this.constructor.even_columns(this.$row?.el, this.column_fit) : null; }

	// The room changed, or a column opened. Size the columns FIRST and scroll second,
	// so the scroll is measured against widths that are already final — the other
	// order scrolls to where the newest column was about to stop being.
	// `slide` is the ONE caller-known fact: this settle came from a NAVIGATION, so
	// the move is worth animating. The resize observer leaves it off, and that is
	// the whole reason it is an argument rather than a CSS declaration on the row —
	// `scroll-behavior: smooth` in the sheet would also animate the ARRIVAL, and a
	// page that slides 3153px while you are trying to read it is not a still page.
	settle_columns(slide){ this.even_columns(); this.scroll_column(slide); }

	// Should a navigation inside this row slide, or jump? Measured headless,
	// 5 runs × 2 widths, frames over 50ms during the move (doc/columns.md):
	// native smooth scroll 0 · FLIP (translateX + Web Animations) 0 · View
	// Transitions 23, worst frame 116.7ms. Smooth scroll and FLIP tie on jank, so
	// the cheaper one wins: a scroll is ALREADY what this row does, and asking the
	// browser to animate it costs one word.
	// ⚠ Reduced motion is read HERE, not in a media query, for the same reason
	//   `slide` is an argument: the sheet cannot tell an arrival from a click.
	// ⚠ Only the `even` mode slides today. In the elastic mode the columns RESIZE
	//   as the row scrolls, and animating a reflow is how you get the jank this
	//   mode exists to remove. Dropping `this.column_even &&` is all it would take.
	column_slide(){ return !!this.column_even && !matchMedia("(prefers-reduced-motion: reduce)").matches; }

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
		if (!this.watching) (this.watching = new ResizeObserver(() => this.settle_columns())).observe(row);

		// ⚠ One frame, for every navigation after that: Router.mark() marks what shows
		// AFTER activate(), so right now the newest column is still `display: none`.
		// … and it is the one settle that SLIDES: the observer above owns the arrival
		// and the resize, this owns the click.
		requestAnimationFrame(() => this.settle_columns(true));
	}

	// The deepest column on screen, brought in by the smallest move — the columns to
	// its left stay exactly where they are.
	// ⚠ `scrollBy` on the row, never `scrollIntoView`: that walks up and scrolls the
	// document around the whole host too.
	scroll_column(slide){
		const row = this.$row?.el;
		const body = [...row?.querySelectorAll(".page-column-body") ?? []].filter(el => el.offsetWidth).at(-1);
		if (!body) return;

		const to = body.getBoundingClientRect(), from = row.getBoundingClientRect();
		const dx = to.right > from.right ? to.right - from.right
			: to.left < from.left ? to.left - from.left : 0;

		if (dx) row.scrollBy({ left: dx, behavior: slide && this.column_slide() ? "smooth" : "auto" });
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
	//
	// Split into `wall_rungs()` (the array, built DETACHED from whatever capture is
	// open — same reason `ext/Mention`'s `build_row()` does it, core/View/doc/
	// capturing.md) and this thin wrapper (the one flex column every existing caller
	// still gets) so a caller that wants to place the SAME rungs a different way —
	// `ext/sprawl`'s balanced columns, `public/framework/page.js` — can ask for the
	// array instead of this one fixed arrangement, with no second copy of the "which
	// child counts as a section" judgment call above.
	walls(){
		return div.c("page-walls bleed flex v gap", $box => this.wall_rungs().forEach(rung => $box.append(rung)))
			.style("--gap", "3em");
	}

	wall_rungs(){
		const saved = View.captor;
		View.captor = null;
		try {
			const rungs = [];
			this.children.forEach((page, name) => {
				if (!page?.children.size || page.leaf) return;

				const nav = this.nav_for(name);

				rungs.push(div.c("page-wall flex v gap", () => {
					h2.c("page-wall-title", () => a.c("page-link", nav.label).href(nav.url));
					page.previews();
				}).style("--gap", "1em"));
			});
			return rungs;
		} finally {
			View.captor = saved;
		}
	}

	// The one card shape. A page that wants a live render overrides this method:
	// `preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }`
	preview(nav){ return this.preview_card(nav); }

	// ⚠ The thumb is INERT (Page.css): the label below it is a link, so a live render
	// in here would be an `<a>` inside an `<a>` — invalid, and the browser un-nests it.
	// `nav.class_card` (set by `ext/Doc`'s own `nav()`, true when `Doc.is_class(this.subject)`
	// says the page documents a real ES class) wears the SAME always-dark island every other
	// "dark" surface on the site already uses (`page-surface-dark`, `core/Page/words.js`'s
	// `dark` SURFACE word) — one card look for "this names a class", not a new one invented
	// for this task (CLAUDE.md law 6).
	preview_card(nav = this.nav(), thumb){
		return div.c("page-preview", () => {
			if (thumb) this.preview_thumb(thumb);
			this.preview_link(nav);
			if (!thumb && nav.description) p.c("page-preview-desc", nav.description);
		}).ac(nav.card).ac(nav.class_card && "page-surface-dark");
	}

	// THE THUMB, plus the one measurement Page.css can't make on its own: whether a
	// live render (a `zoom-*` board, Page.css's own `:has([class*="zoom-"])` rule)
	// actually came in taller than its `--stage-max` cap. `.capped` is what turns the
	// hard `overflow: hidden` into a fade — set only when there is something to fade,
	// never on a thumb that already fits. `requestAnimationFrame`, not a plain read:
	// the thumb has to be in the document and laid out first, which is true by the
	// time this callback runs everywhere except a HIDDEN tab (doc/method/preview.md) —
	// there the frame never fires and the thumb just keeps the plain hard crop.
	preview_thumb(thumb){
		const $thumb = div.c("page-preview-thumb", thumb);

		requestAnimationFrame(() => {
			if ($thumb.el.scrollHeight > $thumb.el.clientHeight + 1) $thumb.ac("capped");
		});

		return $thumb;
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

		// ⚠ THE GUARD ABOVE IS WHY THE WAIT BELONGS HERE, IN CORE. A page whose children
		//   arrive from a fetch used to write this override itself, and had to restate that
		//   guard or read back the very promise being assigned on the next line — a
		//   `p.then(() => p)` cycle, "Chaining cycle detected for promise", from the
		//   microtask queue with no file and no stack. Both callers shipped that bug.
		const walk = () => Promise.all([...this.children.keys()].map(name =>
			this.child(name, 0).then(child => child?.load_all_children(child.leaf ? 0 : levels - 1).loading)));

		this.loading = this.child_source ? this.source_children().then(walk) : walk();

		return this;
	}

	// ════ PREFERENCES — the page's own url IS the id ═══════════════════════════
	// A handle over localStorage: `get` / `set` / `patch` / `clear`. Production is
	// static, so there is no server to hand out ids — and a page already has one
	// thing that is unique, stable and human-readable: its address, derived by
	// naming(), so it cannot drift out of step with the tree the way a hand-typed
	// `id: "team-board"` would. doc/method/prefs.md.
	// ⚠ Storage, not STATE — nothing here notifies. A page that wants a redraw
	//   calls its own watcher after the write; a subscription API in core would
	//   make ~160 pages pay for a pattern four of them want (doc/roles.md).
	// ⚠ Renamed from `store()` (was `Page.Store`) — `page.store` is now the LIVE
	//   jsonl Store (Item.Store, core/Item/Store.js, attached by `Page.jsonl()`),
	//   and the two must never share a name again.
	prefs(){ return new this.constructor.Prefs({ page: this }); }

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

// Registered (2026-10-03) so `define_fields()` actually runs and builds the
// `title`/`icon`/`description` accessors above — every other Item subclass
// that wants fields already goes through `register()` for its wire name; Page
// never had, until now, a reason to.
Item.register(Page, "Page");

/* THE SHIM — a Map-shaped VIEW over `page.pages` (the real List storage), so
   every existing `.children` caller keeps working unchanged. `instanceof Map` is
   real (this class extends it), but the base Map's own storage is never touched —
   every method here reads or writes `page.pages` instead. Folded in from the
   deleted PageLog class, 2026-10-03. */
class PageChildren extends Map {

	constructor(page){ super(); this.page = page; }

	get pages(){ return this.page.pages; }

	// The page, `null` for a stub (declared but not yet loaded), `undefined` if the
	// name is absent altogether.
	get(name){
		const found = this.pages.find(name);
		return found === undefined ? undefined : found.stub ? null : found;
	}

	has(name){ return this.pages.find(name) !== undefined; }

	// `null` adds a stub (quietly — declaring a child is not a live edit); a real
	// page quietly inserts, or quietly REPLACES the stub that already held this name
	// (`List.replace`, which never announces: loading is not a change).
	set(name, value){
		const had = this.pages.find(name);

		if (value === null){
			if (!had) this.pages.insert({ id: name, name, stub: true });
			return this;
		}

		had ? this.pages.replace(had, value) : this.pages.insert(value);
		return this;
	}

	// Quiet — a Map never announced either. `release()` is List's quiet remove
	// (core/List/List.js), the counterpart to `remove()`'s announcing one.
	delete(name){
		const had = this.pages.find(name);
		if (!had) return false;
		this.pages.release(had);
		return true;
	}

	get size(){ return this.pages.length; }

	// Returns undefined, like Map.forEach: a View capture `() => x.children.forEach(…)` renders its return value.
	forEach(fn, thisArg){ this.pages.forEach(page => fn.call(thisArg, page.stub ? null : page, page.id, this)); }
	keys(){ return this.pages.map(page => page.id)[Symbol.iterator](); }
	values(){ return this.pages.map(page => page.stub ? null : page)[Symbol.iterator](); }
	entries(){ return this.pages.map(page => [page.id, page.stub ? null : page])[Symbol.iterator](); }
	[Symbol.iterator](){ return this.entries(); }

	clear(){ [...this.pages].forEach(page => this.pages.release(page)); }
}

/* `Item.Store`, specialised for a page.jsonl file — one per URL (`Reader.for`), so
   `page.store` IS this once a jsonl page has loaded. Keeps every name this had
   before the fold-in: `open`, `close`, `parse`, `read`, `attach`, `changed`, `reset`
   — `page` is now an ALIAS for Item.Store's own `host`. */
Page.Reader = class PageLogReader extends Item.Store {

	get page(){ return this.host; }
	set page(host){ this.host = host; }

	// ⚠ core never statically imports ext; live.js is imported only on localhost.
	// `this.live` (kept, not on the base Store) is what `close()` needs to drop the
	// subscription — Item.Store itself never tails more than once and never closes.
	open(){
		if (!dev) return this.load();
		return import("../../ext/JSONL/live.js")
			.then(live => (this.live = live).stream(this, () => this.changed()));
	}

	close(){ this.live?.drop(this); }

	// Tracks which KEYS arrived in this batch — `changed()` below reads it to decide
	// whether a live line is worth a nav redraw, same as before the fold-in.
	read(entries){
		for (const entry of entries) for (const key of Object.keys(entry)) (this._seen ??= new Set()).add(key);
		return super.read(entries);
	}

	// Line 1 already built the page (`Page.jsonl()` above) — HOLD UNTIL LINE 1,
	// never replay it a second time. Everything else is Item.Store's own `attach()`
	// (the "delta" listener, the echo skip, the replaying flag).
	attach(host){
		this.host = host;
		host.store = this;
		host.on("delta", (line, origin) => {
			if (this.replaying) return;
			this.append(this.line_for(line, origin, host));
		});

		const held = this.entries.splice(0).slice(1);
		this.read(held);
		this._seen = null;   // the load's keys are not news; changed() redraws for live lines only

		host.report_unknown();
		return this;
	}

	// A `tab` or `file` line describes MY OWN children's state, so I redraw MY OWN
	// tab strip (nav_redraw(), ext/tabs/tabs.js). A `settings` line is a page's
	// preference about ITSELF, read by its PARENT's tab strip — so that redraw is
	// asked of `this.host.parent` instead. Either way this replaces what used to be
	// a `location.reload()` — the strip (and the rail, which nav_redraw() bubbles up
	// to) fixes itself with no reload at all.
	changed(){
		this.host?.report_unknown();
		this.host?.log_redraw();

		const seen = this._seen; this._seen = null;
		if (seen?.has("tab") || seen?.has("file")) this.host?.nav_redraw?.();
		if (seen?.has("settings")) this.host?.parent?.nav_redraw?.();
	}

	// A REWRITTEN (not appended) file replays from line 1 onto a clean slate.
	reset(){
		this.count = 0;
		this.host?.log_forget();
		delete this.loaded;
		return this;
	}
};

/* WHAT `listing()` ANSWERS — the entries directly inside one folder, replayed the way
   file() replays them (keyed by first segment, latest line wins, `gone` removes):
       files  ["readme.md", …]         plain files
       dirs   ["doc", …]               plain folders (each may have its own page.jsonl)
       pages  Map { "kid" → "js" }     child pages, and which file makes each one
       page   true/false               is this log itself a page (line 1 is not a file line)?
       log    "files.jsonl" | "page.jsonl"   the file the list was read from */
Page.Listing = class PageListing {

	files = [];
	dirs = [];
	pages = new Map();

	// `page`: is this folder a jsonl page? Unknown (undefined) means "read line 1".
	// `log`: the file the list came from ("files.jsonl" or "page.jsonl") — a real file there too.
	static from(entries, page, log = "page.jsonl"){
		const latest = new Map();
		for (const { file, gone } of entries){
			if (typeof file !== "string") continue;
			gone ? latest.delete(key_of(file)) : latest.set(key_of(file), file);
		}

		const listing = new this();
		listing.log = log;
		listing.page = page ?? (!!entries[0] && typeof entries[0].file !== "string");   // line 1 builds a page; a listing-only log starts with a file line
		latest.forEach((name, key) => {
			const kind = name.match(CHILD)?.[2];
			if (kind) listing.pages.set(key, kind);
			else if (name.includes("/")) listing.dirs.push(key);
			else listing.files.push(name);
		});
		return listing;
	}

	// Is `name` a folder here, page or not?
	folder(name){ return this.dirs.includes(name) || this.pages.has(name); }
};

// `track()` installs `Page.track(instance)` / `Page.instances()` — opt-in instance
// tracking, installed once here so every Page (and every subclass that doesn't
// override the constructor — `Section`, `Doc`, …) shares ONE list. Called from the
// constructor above; the owner asked for exactly this by name (2026-09-29): "every
// class can easily track its new instances by just in the constructor calling the
// class dot track". core/track/track.js.
track(Page);

// Where a save goes when localStorage will not take it — private mode, a full
// quota, a blocked third-party frame. It throws WHOLE, and a UI that loses its
// buttons because a save failed is worse than one that forgets: the page keeps
// working for the session and only the persistence is lost.
const memory = new Map();
let warned = false;

// ⚠ ONCE a session, not once a write: a run saves on every move, and a console
//   filling with the same line is a console nobody reads.
function warn(key, error){
	if (warned) return;
	warned = true;
	console.warn(`prefs(${key}) — localStorage is unavailable (${error.name}); this session is kept in memory only.`);
}

Page.Prefs = class PagePrefs {

	// The app's own namespace: one origin serves /notes/, /imagine/ and every demo,
	// so an unprefixed url is a collision waiting for the next site on this domain.
	prefix = "lew42:";

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// The whole idea, in one line. `id` is the seam for a caller that is not a
	// page at all, one fixed key regardless of url — `core/Sidebar`'s rail
	// (merged 2026-09-18, `Sidebar.Store` deleted: `new Page.Prefs({ id:
	// "sidebar" })` is the same `lew42:sidebar` key that file always wrote).
	// `store_key` is still the seam for a page that MOVED: move() re-addresses
	// a whole subtree, so an adopted page would otherwise change key silently
	// and lose everything saved under its old address.
	key(){ return this.prefix + (this.id ?? this.page.store_key ?? this.page.url); }

	// THE GUARDED PAIR (plus `clear_raw`) — one JSON-able value under one
	// literal key, never throwing, even when `localStorage` itself throws on
	// touch (private mode) or is not there at all (Node). The one place this
	// guard lives now: `ext/Saver`'s `LocalStorageSaver` calls these three
	// directly instead of its own copy (doc/decisions.md says why it still
	// needs a separate class).
	static read_raw(key){
		try { return JSON.parse(localStorage.getItem(key) ?? "null"); }
		catch { return undefined; }   // JSON.parse never legitimately yields undefined
	}

	static write_raw(key, value){
		try { localStorage.setItem(key, JSON.stringify(value)); return true; }
		catch (error){ warn(key, error); return false; }
	}

	static clear_raw(key){
		try { localStorage.removeItem(key); return true; }
		catch { return false; }
	}

	// null when nothing is saved OR the saved value is corrupt — `get()` decides
	// what that means, because only the caller knows its defaults.
	read(){
		const value = PagePrefs.read_raw(this.key());
		return value === undefined ? memory.get(this.key()) ?? null : value;
	}

	get(fallback = {}){ return { ...fallback, ...(this.read() ?? {}) }; }

	// Always "succeeds" from the caller's own point of view — write_raw's own
	// return is ignored here on purpose, the same silent-degrade Page.Prefs has
	// always promised (see the comment above `memory`).
	set(data){
		memory.set(this.key(), data);
		PagePrefs.write_raw(this.key(), data);
		return data;
	}

	// The call every page actually makes: change one field, keep the rest.
	patch(part, fallback){ return this.set({ ...this.get(fallback), ...part }); }

	clear(){
		memory.delete(this.key());
		PagePrefs.clear_raw(this.key());
	}
};

export default Page;
