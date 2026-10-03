import { View, div, p, code, table, thead, tbody, tr, th, td, is } from "../View/View.js";
import { page_settings } from "./settings/settings.js";
import Item from "../Item/Item.js";
import LiveList from "../List/LiveList.js";

/* A PAGE AS A LOG — `page.jsonl`, the page format that needs no page.js.

       {"title": "Notes", "icon": "description"}      line 1: the constructor
       {"file": "note.md"}                             the file EXISTS
       {"file": "kid/page.jsonl"}                      …and a child page is LINKED
       {"place": "note.md"}                            it is PLACED in the content

   Every line after the first is one `set()` call, and there is no table mapping JSON
   keys to what they do: a key that names a method calls it, anything else is data.
   `place` does what `place()` below does. Page `extends` this class, so a subclass
   (a Card) adds a word by adding a method. doc/jsonl.md.

   PageLog extends Item (core/Item/Item.js): `page instanceof Item` is true, Page's
   `on`/`off`/`emit` are Item's (the Events mixin), and Page's `set()` is Item's
   `apply()`-based routing — PageLog only adds the thin jsonl-specific bits below.
   core/Page/doc/decisions.md records the move; core/2026-09-30/proposal-flow/
   page-item-design.md ("LATEST … fourth pass") is the design this follows. */

// ⚠ Localhost only, the same gate Page.class.js keeps.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");

// "kid/page.jsonl" → ["kid", "jsonl"]. A plain "kid/" is a folder, not a page.
const CHILD = /^([^/]+)\/page\.(jsonl|js)$/;

// The server's watcher keys a file line by its FIRST path segment, so "kid/" and
// "kid/page.jsonl" are one entry, and the latest line for it wins. Keyed the same here.
const key_of = name => name.split("/")[0];

export class PageLog extends Item {

	// ════ SETTINGS — `{"settings": {"nav": false}}` ═══════════════════════════════
	// A page's own preferences. Today there is exactly one: `nav` — "does this page
	// show up in its parent's navigation?" (core/Page/settings/, loading-study.md
	// section 4). `this.settings` is never a PLAIN object: it starts life as this tiny
	// object with its own `set()`, so Item's `set_one()` routes a `settings` line into
	// its "has its own `.set()`" branch and MERGES — the same trap `file()` avoids by
	// keeping its own state off `this.file`: a plain object here would get SHADOWED
	// (fully replaced) by the second settings line instead of merged with the first.
	settings = { set(obj){ Object.assign(this, obj); } };

	// A page is a BOUNDARY: its own events (and a content/pages LiveList's, which
	// bubble to the page first) never climb past it to a PARENT page. Each page's
	// Store only ever hears changes inside its own subtree.
	bubbles(){ return false; }

	// A page's id is its folder name, not a random one — `naming()` (Page.class.js)
	// sets `this.id ??= this.name` once the url (and so the name) is known. Nothing
	// here can invent one before that.
	static new_id(){ return undefined; }

	// Data lives ON THE INSTANCE (`this.title`, `this.icon`, …), not in a nested
	// `data` bag — that's what makes `page.title` real. `unknown` tracks a key
	// nobody — no method, no own property — already knew, the same census
	// `report_unknown()` reads below.
	get(key){ return this[key]; }
	put(key, value){
		if (!(key in this)) (this.unknown ??= new Set()).add(key);
		this[key] = value;
	}

	// `assign()` that calls methods instead of overwriting them — Item's `apply()`
	// does the real routing (a method key calls it, a value with its own `set()`
	// gets the nested delta, anything else is data via `get`/`put` above, emitting
	// `change` + `delta`). PageLog's own job is three things on top: keep every
	// line for a late `on("line", …)` listener to catch up on, emit `line` exactly
	// ONCE per line the reader hands this page (never once per recursive nested
	// `set()` call `apply()` makes along the way — those land on a DIFFERENT
	// object, never back through this override), and make `page.content` lazily
	// the moment a content delta arrives (doc/method/set.md).
	set(obj){
		(this.jsonl_lines ??= []).push(obj);
		this.emit("line", obj);

		if ("content" in obj && !(this.content instanceof LiveList)){
			const { content, ...rest } = obj;
			this.ensure_content().set(content);
			return super.set(rest);
		}

		// The Store writes a live content change as `{"at": "content/…", …}`; on replay
		// `locate()` needs `page.content` to be a LiveList already, so make it here too.
		if (typeof obj.at === "string" && obj.at.split("/")[0] === "content") this.ensure_content();

		return super.set(obj);
	}

	// Made the first time a content DELTA arrives (a `{"content": {...}}` line) or a
	// code caller reaches for it directly — never up front, so a page with no visible
	// blocks of its own pays nothing. Once it exists, Item's own `set_one()` routes
	// straight to its `.set()` without this method running again (deliverable 6).
	ensure_content(){
		return this.content instanceof LiveList ? this.content
			: (this.content = new LiveList({ owner: this, name: "content" }));
	}

	// My sub-pages — the real storage `page.pages`. `of: null` keeps a plain stub
	// object (`{id, name, stub: true}`) plain: LiveList.make() hydrates a plain value
	// through `of` only when `of` is truthy, so a stub is never turned into an Item.
	// A REAL loaded page is a `Page` instance already (never plain), so it is
	// inserted/replaced UNCHANGED either way — see `add()`, Page.class.js.
	get pages(){ return this._pages ??= new LiveList({ owner: this, name: "pages", of: null }); }

	// A Map-SHAPED VIEW over `pages`, so the ~215 existing `.children` callers across
	// ~94 files keep working unchanged while the real storage is the LiveList above.
	// New code and docs say `page.pages`. `PageChildren extends Map` so
	// `instanceof Map` stays true and a page.jsonl line can never REPLACE it (see the
	// setter below) — only `declare()` (Page.class.js) ever builds the real tree.
	get children(){ return this._children ??= new PageChildren(this); }

	// A config `children: […]` arrives here through ordinary `Object.assign` (the
	// constructor's own `this.assign(...args)`, Page.class.js) — this only STAGES it;
	// `declare()` is the one place that actually reads it (after `naming()` has set
	// `this.url`, which children need to move into). That's what "routes through
	// declare()" means: nothing can hand `this.children` a plain array/Map and have
	// it stick — only `declare()`'s own building, quietly, into `pages`.
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

	// ════ EVENTS — kept as data for ext/Inbox and ext/Page/demo.js's `page.on("line", …)` ═
	// `on`/`off`/`emit` themselves are Item's now (the Events mixin) — deleted here on
	// purpose. Grepped first: nothing outside this file ever read `page.listeners`
	// directly, so there was nothing to carry over except the two event NAMES this
	// class itself still emits, `"line"` (every jsonl line, above) and `"render"`
	// (Page.class.js's `render()`, once, after content is drawn).

	// ════ EXTENSIONS — a page.jsonl line names one on: `{"ext": "Inbox"}` ══════════
	// The DATA path — one page at a time. `Page.use(Ext)` (Page.class.js) is the CODE
	// path — every page, the moment the module that calls it is loaded. Both end up
	// calling the same `Ext.setup(page)`. Model: `Server/Events.js`'s
	// `static use(plugin)` / `setup(instance)`, and how `Server/run.js` wires them.
	// ⚠ core never statically imports ext code — resolved against Log.js's OWN url
	//   (not the page's), so it always finds `core/Page/ext/<Name>/<Name>.js`.
	// ⚠ This import is ASYNC; the replay of an already-fetched page.jsonl is NOT —
	//   see `jsonl_lines` below, which is what lets a late setup() catch up.
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
	// TWO CALLERS, split (deliverable 4/11): a REPLAYED `{"file": …}` line (this.store
	// is mid-`read()`, `this.store.replaying` is true) registers the listing, same as
	// always. A CODE call — `page.file("demo.jsonl")`, not a line — never touches the
	// listing (that would double-count a file the code already knows about) and
	// instead hands back the real file: ext/filesystem's `FsFile`, the one file
	// class, dynamically imported because core never statically imports ext. Its own
	// lazy `.store` getter is `Item.Store.for(url)` — one Store per file, the same
	// one `page.store` is for page.jsonl itself.
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
	// weight fallback (below 1 is out of nav too). 2026-09-29 fix round, finding 3:
	// before this, a page.js child (no page.jsonl of its own, like ux/Dictate/)
	// never had settings.jsonl read into it at all, so unticking "Appears in
	// navigation" on one did nothing — only a loaded page.jsonl child's own,
	// already-in-memory `.settings` was ever checked.
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

	// ⚠ core does not import ext: the import is dynamic, as in Page.file().
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

			if (this.unknown?.size)
				p.c("muted", "Kept as data, no method or property knew them: " + [...this.unknown].join(", ") + ".");
		});
	}

	// One console.info per batch that taught the page a key nobody knew. Never a warn.
	report_unknown(){
		const fresh = [...this.unknown ?? []].filter(key => !this.reported?.has(key));
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
	   `Store.for(url)` — one Store per file (deliverable 4): a second visit to the
	   same page.jsonl reaches the SAME live reader, never a second one racing it. */
	// ⚠ TWO CALLERS CAN EASILY RACE for the exact same url: `load_all_children()`
	//   crawls EVERY child of a page (including "jsonl") the moment its PARENT
	//   loads, at the same time the Router's own sequential walk is reaching
	//   "jsonl" as the NEXT path segment on that identical parent. Before
	//   `Store.for()` (deliverable 4) each call built its OWN independent reader,
	//   so a race just meant double work, never a wrong answer. Sharing one reader
	//   means two concurrent calls would otherwise both call `reader.open()` and
	//   read `reader.entries[0]` against the SAME array as it fills out from under
	//   them — one twentieth of the time silently wrong, consistently wrong under
	//   real app-boot load (measured: `Page.jsonl()` for a never-before-loaded url
	//   racing `load_all_children()`'s own crawl of the same parent 404'd a real
	//   page every single time in testing, 2026-10-02). `reader._building` is the
	//   fix: the first call's whole build is ONE promise, and a second call made
	//   before it resolves joins THAT SAME promise instead of starting its own.
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
			(PageLog.log_pages ??= new Map()).set(page.log_folder(), page);   // listing() reads it for free
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
		if (PageLog.UNLOGGED.test(url)) return Promise.resolve(null);

		const own = PageLog.page_listing(url);
		if (own) return Promise.resolve(own);

		const memo = PageLog.listings ??= new Map();
		if (fresh || !memo.has(url)) memo.set(url, PageLog.fetch_listing(url)
			.then(listing => { (PageLog.loaded_listings ??= new Map()).set(url, listing); return listing; }));
		return memo.get(url);
	}

	// The two files, in the order the parent's listing suggests; the first one there wins.
	static async fetch_listing(url){
		const [, parent, name] = url.match(/^(.*\/)([^/]+)\/$/) ?? [];
		const jsonl_first = parent && PageLog.loaded_listing(parent)?.pages.get(name) === "jsonl";
		const order = jsonl_first ? ["page.jsonl", "files.jsonl"] : ["files.jsonl", "page.jsonl"];

		for (const file of order){
			const reader = await new PageLog.Reader({ url: url + file }).load();
			if (reader.loaded) return PageLog.Listing.from(reader.entries, file === "page.jsonl" ? undefined : false, file);
		}
		return null;
	}

	// A jsonl page already loaded at `url` (jsonl() registers it): its lines, as a listing.
	static page_listing(url){
		const page = PageLog.log_pages?.get(url);
		if (!page) return null;
		return PageLog.Listing.from([...page.listed?.values() ?? []].map(file => ({ file })), true, "page.jsonl");
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
		return PageLog.page_listing(url) ?? PageLog.loaded_listings?.get(url);
	}

	static async log_class(module, url){
		const Class = (await import(new URL(module, location.origin + url).href)).default;
		if (Class?.prototype instanceof PageLog) return Class;

		console.error(`page.jsonl at ${url} — "class": "${module}" is not a Page subclass; building a ${this.name}.`);
		return this;
	}
}

/* THE SHIM — a Map-shaped VIEW over `page.pages` (the real LiveList storage), so
   every existing `.children` caller keeps working unchanged. `instanceof Map` is
   real (this class extends it), but the base Map's own storage is never touched —
   every method here reads or writes `page.pages` instead. */
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
	// (`LiveList.replace`, which never announces: loading is not a change).
	set(name, value){
		const had = this.pages.find(name);

		if (value === null){
			if (!had) this.pages.insert({ id: name, name, stub: true });
			return this;
		}

		had ? this.pages.replace(had, value) : this.pages.insert(value);
		return this;
	}

	// Quiet — a Map never announced either. `release()` is LiveList's quiet remove
	// (core/List/LiveList.js), the counterpart to `remove()`'s announcing one.
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

/* `Item.Store`, specialised for a page.jsonl file — one per URL (`Store.for`), so
   `page.store` IS this once a jsonl page has loaded (deliverable 4). Keeps every
   name this class had before the rename: `open`, `close`, `parse`, `read`, `attach`,
   `changed`, `reset` — `page` is now an ALIAS for Item.Store's own `host`. */
PageLog.Reader = class PageLogReader extends Item.Store {

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
	// whether a live line is worth a nav redraw, same as before the rename.
	read(entries){
		for (const entry of entries) for (const key of Object.keys(entry)) (this._seen ??= new Set()).add(key);
		return super.read(entries);
	}

	// Line 1 already built the page (PageLog.jsonl, above) — HOLD UNTIL LINE 1,
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

	// 2026-09-29 fix round, finding 5: a `tab` or `file` line describes MY OWN
	// children's state, so I redraw MY OWN tab strip (nav_redraw(), ext/tabs/
	// tabs.js). A `settings` line is a page's preference about ITSELF, read by
	// its PARENT's tab strip — so that redraw is asked of `this.host.parent`
	// instead. Either way this replaces the drawer's old `location.reload()` —
	// the strip (and the rail, which nav_redraw() bubbles up to) now fixes
	// itself with no reload at all.
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
PageLog.Listing = class PageListing {

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

export default PageLog;
