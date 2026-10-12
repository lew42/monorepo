import { View, div, p, h1, h2, h4, a, span, ul, li, button, icon, code, table, thead, tbody, tr, th, td, is } from "../View/View.js";
import PageFrame from "./Frame.js";
import Item from "../Item/Item.js";
import List from "../List/List.js";
import { page_settings } from "./settings/settings.js";
import { track } from "../track/track.js";
import ai_cost from "./weight/ai-cost.js";
import PageChildren from "./Children.js";
import PageLogReader from "./Reader.js";
import PageListing from "./Listing.js";
import PagePrefs from "./Prefs.js";
import PageRelated from "./Related.js";
import PagePreviews from "./Previews.js";

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

// "kid/page.jsonl" → ["kid", "jsonl"]; key_of() keys a file line by its FIRST path segment, latest wins. (doc/decisions.md)
const { CHILD, key_of } = PageListing;

// Page extends Item directly (no PageLog middle class). (doc/decisions.md)
export class Page extends Item {

	// ════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) runs Ext.setup(page) on EVERY page ═══
	// ⚠ Nobody calls it by default, so the loop below is empty for a page with no extensions. (doc/jsonl.md)
	static _ext = [];
	static use(Ext){ Page._ext.push(Ext); return Page; }

	// ⚠ Nothing is FETCHED here: a module page constructs itself at import. The caller budgets (doc/declaring.md).
	constructor(...args){
		super(...args);
		this.assign(...args);
		if (!this.data || typeof this.data !== "object" || Array.isArray(this.data)) this.data = Object.create(null);
		Page.track(this);
		this.naming();
		this.declare();
		Page._ext.forEach(Ext => Ext.setup?.(this));
		this.initialize?.();
	}

	assign(...args){ return Object.assign(this, ...args); }

	log_label(){ return `page{${this.url ?? "…"}}`; }

	// ════ PAGE.JSONL — folded in from the deleted PageLog class ══════════════════

	// A page's own preferences (today: `nav`). Never a plain object, so a repeat `settings` line merges. (doc/jsonl.md)
	settings = { set(obj){ Object.assign(this, obj); } };

	// A page is a BOUNDARY: its own events (and a content/pages List's, which
	// bubble to the page first) never climb past it to a PARENT page. Each page's
	// Store only ever hears changes inside its own subtree.
	bubbles(){ return false; }

	// A page's id is its folder name, not a random one — `naming()` below sets
	// `this.id ??= this.name` once the url (and so the name) is known. Nothing
	// here can invent one before that.
	static new_id(){ return undefined; }

	// `title`/`icon`/`description` live in `data`, read through Item's define_fields() accessors. (doc/decisions.md)
	static fields = ["title", "icon", "description"];

	// Item.apply() routing, plus: an array of lines, every line kept for late listeners, one `line` event each, lazy content. (doc/jsonl.md)
	set(obj){
		if (Array.isArray(obj)){ for (const one of obj) this.set(one); return this; }

		(this.jsonl_lines ??= []).push(obj);
		this.emit("line", obj);
		obj = this.take_words(obj);

		if ("content" in obj && !(this.content instanceof List)){
			const { content, ...rest } = obj;
			this.ensure_content().set(content);
			return super.set(rest);
		}

		// Compat, one release (2026-10-03): an old {"at": "content/…"} line needs page.content to exist first. (doc/decisions.md)
		if (typeof obj.at === "string" && obj.at.split("/")[0] === "content") this.ensure_content();

		return super.set(obj);
	}

	// Made on the first content delta, never up front. (doc/jsonl.md)
	ensure_content(){
		return this.content instanceof List ? this.content
			: (this.content = new List({ owner: this, name: "content" }));
	}

	// My sub-pages, the real storage. `of: null` keeps a stub plain. (doc/jsonl.md)
	get pages(){ return this._pages ??= new List({ owner: this, name: "pages", of: null }); }

	// A Map-shaped view over `pages` for the ~215 `.children` callers. New code says `page.pages`. (doc/jsonl.md)
	get children(){ return this._children ??= new PageChildren(this); }

	// ⚠ A config `children: […]` is only STAGED here; declare() reads it. A `new Map()` means "forget everything". (doc/watch-out.md)
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

	// ════ EXTENSIONS — a page.jsonl line names one: {"ext": "Inbox"} (the data path) ═══
	// ⚠ core never statically imports ext, and the import is ASYNC: a late setup() catches up from `jsonl_lines`. (doc/jsonl.md)
	ext(name){
		const ready = import(new URL(`./ext/${name}/${name}.js`, import.meta.url).href)
			.then(({ default: Ext }) => Ext.setup?.(this))
			.catch(error => console.error(`${this.log_label()} — ext("${name}") failed to load:`, error));
		(this.ext_ready ??= []).push(ready);
	}

	// ════ STEP 1 — the file EXISTS (recorded, never rendered; a code call returns the real FsFile) ═══ (doc/jsonl.md)
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

	// ════ STEP 2 — a child page is LINKED, automatically ("kid/page.jsonl" → child "kid") ═══ (doc/jsonl.md)
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

	// ════ TAB STATE — {"tab": {"name": "x", "disabled": true, "nav": false, "order": 3}} ═══
	// ⚠ Repeat lines for a name MERGE, never replace. (doc/jsonl.md)
	tab(obj){
		const { name, title, icon, description, content, ...state } = obj;
		if (!name) return;

		(this.tabs_state ??= new Map()).set(name, { ...this.tabs_state.get(name), ...state });
		const data = Object.fromEntries(Object.entries({ title, icon, description, content }).filter(([, v]) => v !== undefined));
		if (!Object.keys(data).length){
			if (!this.children.has(name)) this.children.set(name, null);
			return;
		}

		const had = this.children.get(name);
		if (had instanceof Page){
			const { content: text, ...labels } = data;
			if (Object.keys(labels).length) had.set(labels);
			if (text !== undefined && !(had.content instanceof List)) had.content = text;
			had.rerender();
			if (this.view) queueMicrotask(() => this.nav_redraw?.());
			return;
		}

		this.add(name, data).from_tab = true;
		if (!this.navigation && !this._tab_redraws?.size){ this.navigation = "tabs"; this.words(); }
		this.reshape();
	}

	// ════ THE SIX WORDS AS A DELTA — a word on a live page.jsonl reshapes the page, redrawn once ═══ (doc/jsonl.md)
	static WORDS = ["navigation", "width", "arrangement", "surface", "background", "type_size"];

	take_words(obj){
		const said = Page.WORDS.filter(word => word in obj);
		if (!said.length) return obj;

		const rest = { ...obj };
		let changed = false;
		for (const word of said){
			if (this[word] !== rest[word]){ this[word] = rest[word]; changed = true; }
			delete rest[word];
		}
		if (changed){ this.words(); this.reshape(); }
		return rest;
	}

	// A log on top of a template: only the SHAPE of a line applies (the words, `tab`, `title`). (doc/jsonl.md)
	overlay(line){
		if (!line || typeof line !== "object" || Array.isArray(line)) return null;
		const shape = {};
		for (const [key, value] of Object.entries(line))
			if (Page.WORDS.includes(key) || key === "tab" || key === "title" || this.children.get(key)?.from_tab) shape[key] = value;
		return Object.keys(shape).length ? (this.set(shape), shape) : null;
	}

	// One redraw per burst of lines: a batch of lines read together (a replay, or a
	// delta naming three words) lands as ONE rerender, on the next microtask.
	reshape(){
		if (!this.view || this._reshaping) return;
		this._reshaping = true;
		queueMicrotask(() => { this._reshaping = false; this.rerender(); });
	}

	// Draw me again in place, no reload. ⚠ Not `redraw()`: Card already has its own. (doc/watch-out.md)
	rerender(){
		const old = this.view?.el;
		if (!old) return this;

		this.deactivated?.();
		const was_default = old.classList.contains("default");
		Page.views.delete(old);
		this.view = null; this.regions = null; this._tab_redraws = null; this.default_tab = undefined; this.related_drawn = false;

		this.render();
		if (was_default) this.view.ac("default");
		old.replaceWith(this.view.el);
		this.activated?.();

		const router = this.app?.router, open = router?.chain?.() ?? [];
		const at = open.indexOf(this);
		if (at >= 0) open.slice(at + 1).forEach(page => page.activate());
		if (router?.active) router.mark();
		return this;
	}

	// The state a `tab` line recorded for one name — `{}` when nobody ever set one, so
	// every caller (Doc.bar(), tabs()) reads `.disabled` / `.nav` / `.order` with no guard.
	tab_state(name){ return this.tabs_state?.get(name) ?? {}; }

	// ════ NAV VISIBILITY — one rule for the rail, the tab strip and the drawer's checkbox ═══
	// Synchronous and optimistic (true first, corrected by nav_redraw()); nav_ready() is the awaited answer. (doc/jsonl.md)
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

	// The page shows its own folder (page.jsonl and the files its lines name). ⚠ core does not import ext: dynamic import. (doc/watch-out.md)
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

	// Every `data` key that is not a declared field. (doc/decisions.md)
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

	// THE LOADER: `url` is the folder; line 1 builds the page, later lines are set(). Streams on localhost.
	// ⚠ Two callers can race for one url: `reader._building` joins them. (doc/watch-out.md)
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

	// A folder's own file list: a loaded page's lines, else files.jsonl, else page.jsonl, else null. Memoised per folder. (doc/decisions.md)
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

	// ⚠ Folders inside a dated task folder get no log (PageFiles.js covers()): answer null at once. (doc/watch-out.md)
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
		// `put()`, not `this.title = …`: a construction-time default is not a change. (doc/decisions.md)
		if (this.title === undefined) this.put("title", this.name);

		// A page's id is its folder name; new_id() returns undefined on purpose, so this is the only place one is set. (doc/decisions.md)
		this.id ??= this.name;
		return this.words();
	}

	// ════ THE SIX PAGE WORDS — resolved ONCE here; every default is undefined ═══
	// ⚠ Idempotent on purpose (naming() runs twice for an adopted page). There is no word for `type`: the key is `type_size`. (doc/words.md)
	words(){
		this.width      ??= this.room;                                  // the lab's older key
		this.surface     = ALIAS[this.surface]    ?? this.surface;
		this.background  = ALIAS[this.background] ?? this.background;
		return this;
	}

	// The classes the words stamp on the page. `surface` is NOT here: it paints the Frame's box, not the page. (doc/decisions.md)
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

	// My sub-pages, in declaration order: undefined = not mine, null = declared, Page = here.
	// ⚠ `list` is the declaration; a second call ADDS; a function is a data source (doc/data-children.md).
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

		// Quietly: declaring a child is not a live edit (a stub holding the name is replaced in place). (doc/words.md)
		const stub = this.pages.find(name);
		stub ? this.pages.replace(stub, page) : this.children.put(page);   // put(): a child may share a config key's name (PageChildren.put)
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

	// ════ ROLES — the nearest ancestor that claims one ═══ (doc/roles.md)
	nearest(role){ return this.chain().findLast(page => page.is === role); }

	topic(){ return this.nearest("topic"); }
	document(){ return this.nearest("document"); }

	// A `children()` function is called ONCE, on the first ask. ⚠ Memoised on `this.sourcing`. (doc/watch-out.md)
	source_children(){
		return this.sourcing ??= Promise.resolve(this.child_source.call(this))
			.then(list => this.declare(list ?? []));
	}

	// Memory, then route(), then a filesystem probe. `levels` is how deep the child then loads. (doc/declaring.md)
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

		// A loaded page.jsonl listing says which file makes `name`, so the probe is skipped; a stale list never hides a page. (doc/declaring.md)
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

	// This directory's real files, full screen, at my own `fs/` (`?v=1` is the old view). ⚠ Dynamic import. (doc/decisions.md)
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

	// Draw the doc inside me with a way back, at its own address `<my url>md/<doc>/`. (doc/decisions.md)
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

	// A .md file's page when nothing nearer claims it: `<module>/md/<path>/` (module = the folder above doc/).
	// ⚠ The trailing slash is load-bearing: a url ending in `.js` is answered as a file.
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

	// Last resort: a `.md` beside me IS a page. ⚠ The SPA fallback answers a miss with index.html at 200: content-type is the 404. (doc/watch-out.md)
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

	// A module that throws is NOT a module that isn't there. ⚠ `levels` bounds its subtree (nothing = its own `depth`). (doc/watch-out.md)
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

	// ⚠ The SPA fallback answers a miss with index.html at 200: content-type is the 404. `opts` goes to fetch. (doc/decisions.md)
	static async read_json(url, opts){
		const res = await fetch(url, opts).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
		return res.json().catch(() => null);
	}

	// A page.json (an object, or a directory url) AS A REAL PAGE: parents first, children by directory name.
	// ⚠ Not in child()'s probe chain. ⚠ `new this` / `this.from`, never `new Page`. The keys are props(). (doc/decisions.md)
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

	// What a page.json becomes: the six words plus three labels. A subclass overrides props() alone. (doc/api.md)
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

		// ⚠ The fallback for a page whose own render() replaced this class's (ext/Doc): related still draws. (doc/watch-out.md)
		if (this.related && !this.related_drawn)
			this.view.append(() => { this.related_aside(); });

		this.activated?.();
		this.column_host()?.reveal_column(this);
		this.warn_if_hidden();
		return this;
	}

	// Dev only: an unmarked .page is display:none and nothing throws, so say so. (doc/api.md)
	warn_if_hidden(){
		if (!dev) return;

		queueMicrotask(() => {
			if (marked(this.view.el) || [...this.view.el.parentNode?.children ?? []].some(marked)) return;

			console.warn(`${this.log_label()} was placed with no mark, so the arrangement contract hides it — add \`default\`, or route to it.`);
		});
	}

	deactivate(){
		this.deactivated?.();

		// ⚠ Going UP the chain activates nothing, so the columns host is told here. (doc/decisions.md)
		const host = this.column_host();
		if (host && host !== this) host.reveal_column(this.parent);

		return this;
	}

	// Is an ancestor drawn by ext/Doc? Then its Files tab already covers the Folder link (read off the DOM class).
	// ⚠ `page.view` is a View: the class list is `page.view.el.classList`. (doc/decisions.md)
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

			// No floating "Folder" link here: deleted on purpose (2026-09-28); read doc/decisions.md before re-adding one.

			// A page that said any of the six words gets a Frame (Frame.js). ⚠ `page-frame-page` marks THIS frame as the page's own. (doc/watch-out.md)
			if (this.words_said()) return void new this.constructor.Frame({ page: this }).ac("page-frame-page");

			return this.render_content();
		})
			.ac(this.name && "page--" + this.name)
			.ac(this.width && !this.column_host() && "page-w-" + this.width)
			.ac(...this.word_classes())
			.ac(this.classes ?? "standard");

		// ⚠ Appended, not woven into the callback above: those branches return their own value on purpose. (doc/watch-out.md)
		if (this.related) this.view.append(() => { this.related_aside(); });
		// "$N.NN of AI work · M tasks": computed by Server/page-ai-cost.mjs, drawn at the END of the page. (doc/decisions.md)
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

	// What is in the box: a function, text, or a "/…" address to render (Frame draws it too).
	// ⚠ A plain string becomes a paragraph, never a bare text node (the grid has no track for it). (doc/decisions.md)
	render_content(){
		if (this.content instanceof List) return this.render_content_list();
		if (is_address(this.content)) return this.content_at(this.content);
		if (is.str(this.content)) return p(this.content);
		return is.fn(this.content) ? this.content() : this.content;
	}

	// ════ A CONTENT LIVELIST, DRAWN — one row per item, drag to reorder (ext/Draggable, dynamic import) ═══
	// ⚠ `item: { items: list }` on the container's Sortable, `item` on each row's. (doc/content.md)
	render_content_list(){
		const list = this.content;
		let $rows;
		// Drag-to-reorder is OPT-IN (the owner, 2026-10-03): only a list that is a ranking
		// the reader may override says `{"sortable": true}` on its page. A plain card body
		// is read, not rearranged, so it gets no grab cursor and no drag.
		const sortable = !!this.get?.("sortable");

		// ⚠ `Item.View` does not exist yet (no default view) — so a plain, untyped
		//   item (its class has no `View`) falls back to its own title or
		//   text, read straight off its data bag, rather than drawing an empty row.
		const draw_row = item => {
			// A kind with its own `View` draws itself in a bare row; a plain item gets the card chrome.
			const Draw = item.constructor.View;
			const $row = div.c("page-content-row" + (Draw ? "" : " card"), () => {
				// A ref row ({"ref": "/framework/core/Page/"}) is drawn as that page's dark class card. (doc/decisions.md)
				const ref = item.get("ref");
				const title = item.get("title"), text = item.get("text");
				// The text under the title, as markdown (dynamic import; the box is captured now, filled in the callback). (doc/decisions.md)
				const draw_body = () => {
					if (title || !text) h4.c("page-content-title", title ?? String(item.id));
					if (text){
						const $text = div.c("page-content-text");
						import("../../ext/markdown/md.js").then(({ default: md }) => $text.append(md(text)));
					}
				};
				if (ref){
					// A ref row is the inline "#Page" chip upgraded to a card; only its header links through. (doc/decisions.md)
					const $card = div.c("page-content-ref card page-surface-dark");
					import("../../ext/Mention/Mention.js").then(({ ref_entry, build_row }) => {
						const entry = ref_entry(ref) ?? { name: ref, icon: "link", url: ref };
						// build_row nulls View.captor and returns the raw element: appended by hand so draw_body() can follow. (doc/content.md)
						$card.append(() => { $card.append(build_row(entry.name, entry, "mention")); draw_body(); });
					});
					return;
				}
				// The View is reached through `constructor` (the code skill's view pattern),
				// so a subclass can swap it; it captures into this row on construction.
				if (Draw) return void new Draw({ item });
				draw_body();
			});
			if (sortable) import("../../ext/Draggable/Sortable.js").then(({ default: Sortable }) => {
				new Sortable({ view: $row, item });
			});
			return $row;
		};

		// ⚠ A block body, not `() => list.forEach(draw_row)`: forEach's return value would append "[object Object]". (doc/decisions.md)
		const box = div.c("page-content-list flow", () => {
			$rows = div.c("page-content-rows", () => { list.forEach(draw_row); }).ac(sortable && "drag-items sortable");
		});

		if (sortable) import("../../ext/Draggable/Sortable.js").then(({ default: Sortable }) => {
			new Sortable({ view: $rows, handle: false, $items: $rows, item: { items: list, root(){ return this; } } });
		});

		const redraw = () => $rows.empty(() => { list.forEach(draw_row); });
		["add", "remove", "move", "order"].forEach(verb => list.on(verb, redraw));

		return box;
	}

	// A page or file at an address, drawn in this page's box (`content: "/notes/x.md"`).
	// ⚠ A loop fuse: two levels draw, the third is a link. (doc/decisions.md)
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

	// ════ RELATED — a pinned aside of links to other pages (Related.js; `related: "/a/ /b/"`, doc/property/related.md) ═══
	related_aside(){ return new this.constructor.Related({ page: this }).aside(); }

	// ════ COLUMNS — the Finder shape ═══
	// ⚠ `this.columns({ even: true })`, never a declared `columns:` field: it would shadow this method.
	// `fit`: "floor" (default) never narrower than recommended; "round" fills tighter. (doc/columns.md)
	columns({ even = false, fit = "floor" } = {}){ this.columnar = true; this.column_even = even; this.column_fit = fit; return this; }

	// The narrowest a DRAG may leave a column. A field, so `new Page({ column_floor: 140 })` wins. (doc/columns.md)
	column_floor = 96;

	// Asked at render time, never walked. ⚠ A page under a tab strip is a tab, not a column. (doc/decisions.md)
	column_host(){
		const chain = this.chain(), at = chain.findIndex(page => page.columnar);
		if (at < 0 || chain.slice(at, -1).some(page => page.navigation === "tabs")) return undefined;
		return chain[at];
	}

	// My column, then the region my children mount in. ⚠ No `page-title` or `flow` here; `classes` is additive. (doc/watch-out.md)
	render_column(host){
		const stack = () => {
			this.column_grab(this.column(host));
			// ⚠ The host builds a `default` child (nothing routes to it) and hands down `app`. (doc/decisions.md)
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

	// The child that opens when nothing deeper is routed (the `default` word).
	// ⚠ Not `opens()`: a core method named for a noun gets shadowed by page state. (doc/decisions.md)
	default_column(){ return [...this.children.values()].find(child => child?.classes?.split(/\s+/).includes("default")); }

	// ONE COLUMN: a sticky head, my own content, my children as rows. `width` is the
	// page's own word — `small`, `large`, `full`; none is the default.
	column(host){
		return div.c("page-column-body", () => {
			div.c("page-column-head", () => {
				span.c("page-column-title", this.title);
				if (this !== host) a.c("page-column-close", () => icon("close")).href(this.parent.url);
			});

			// ⚠ `render_content()`, not a hand-written two-branch copy: one reader decides what is in the box. (doc/decisions.md)
			const tabbed = this.navigation === "tabs" && is.fn(this.tabs);
			if (tabbed) this.tabs(undefined, { home: () => div.c("page-column-prose flow", () => this.render_content()) });
			else if (this.content)
				div.c("page-column-prose flow", () => this.render_content());

			// ⚠ `index: true` — my content already shows my children, so no rail. A field, not a method. (doc/watch-out.md)
			if (!this.index && !tabbed) this.children.forEach((child, name) => {
				const nav = this.nav_for(name);

				a.c("page-column-item").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-column-label", nav.label);
					if (child?.children.size) icon("chevron_right");
				});
			});

			// A column is already a rail, so `related:` is a short list at its end. (doc/columns.md)
			if (this.related) div.c("page-column-prose", () => this.related_aside());
		}).ac(this.width && "page-column-" + this.width);
	}

	// ── the seam — drag it and this column keeps the width you left it at ──
	// ⚠ `lostpointercapture` ends the drag however it ended; `preventDefault` on the DOWN. (doc/watch-out.md)
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

	// The width a drag leaves behind, as the same three tokens the width words set. ⚠ No `px` = back to the page's word. (doc/watch-out.md)
	resize_column($body, px){
		const row = this.column_host()?.$row?.el;
		const width = px && Math.round(Math.max(this.column_floor, Math.min(px, row?.clientWidth ?? px)));

		return $body.style({
			"--page-column-flex": width ? `0 0 ${width}px` : "",
			"--page-column-min":  width ? "0" : "",
			"--page-column-max":  width ? "none" : "",
		});
	}

	// ── `even` — N columns of equal width, N computed from the ROW's room ──
	// ⚠ STATIC, so the lab sizes with the host's own arithmetic. The stamp comes off BEFORE the read. `max-width: none` = the phone regime. (doc/watch-out.md)
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

	// The room changed, or a column opened: size first, scroll second. `slide` is true only for a navigation. (doc/decisions.md)
	settle_columns(slide){ this.even_columns(); this.scroll_column(slide); }

	// Slide or jump? Native smooth scroll beat FLIP and View Transitions (measured).
	// ⚠ Reduced motion is read HERE. Only `even` slides. (doc/watch-out.md)
	column_slide(){ return !!this.column_even && !matchMedia("(prefers-reduced-motion: reduce)").matches; }

	// Called on the HOST after every activation in its tree: the trail says where you
	// are — and gets back whatever a `full` page collapsed — then the newest column
	// scrolls itself in.
	reveal_column(page){
		this.$crumbs?.empty(() => page.crumbs(this));

		const row = this.$row?.el;
		if (!row) return;

		// ⚠ The row has no box on a cold load: the observer fires when it gets one, and on every resize. (doc/watch-out.md)
		if (!this.watching) (this.watching = new ResizeObserver(() => this.settle_columns())).observe(row);

		// ⚠ One frame later: Router.mark() marks after activate(). This is the one settle that SLIDES. (doc/watch-out.md)
		requestAnimationFrame(() => this.settle_columns(true));
	}

	// The deepest column on screen, by the smallest move. ⚠ `scrollBy` on the row, never `scrollIntoView`. (doc/watch-out.md)
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

	// ════ PREVIEWS — a card per child, a wall of rungs, one card (Previews.js, doc/previews.md) ═══
	// Facades: a page overrides `preview(nav)` and calls `preview_card` (the hook below), so these stay Page methods.
	previews(pages){ return new this.constructor.Previews({ page: this }).list(pages); }
	walls(){ return new this.constructor.Previews({ page: this }).walls(); }
	wall_rungs(){ return new this.constructor.Previews({ page: this }).rungs(); }

	// The one card shape. A page that wants a live render overrides this method:
	// `preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }`
	preview(nav){ return this.preview_card(nav); }
	preview_card(nav = this.nav(), thumb){ return new this.constructor.Previews({ page: this }).card(nav, thumb); }
	preview_thumb(thumb){ return new this.constructor.Previews({ page: this }).thumb(thumb); }
	preview_link(nav){ return new this.constructor.Previews({ page: this }).link(nav); }

	// How deep my declared subtree is FETCHED (default 2; 1 = my children; 0 = none). A declared `depth:` wins. (doc/declaring.md)
	depth = 2;
	loaded = 0;

	// My children fetched, and theirs, until the budget runs out. ⚠ Idempotent; a `leaf` child spends none of it. (doc/watch-out.md)
	load_all_children(levels = this.depth){
		if (levels <= this.loaded) return this;
		this.loaded = levels;

		// ⚠ The guard above is why the wait belongs here in core (no "Chaining cycle detected for promise"). (doc/decisions.md)
		const walk = () => Promise.all([...this.children.keys()].map(name =>
			this.child(name, 0).then(child => child?.load_all_children(child.leaf ? 0 : levels - 1).loading)));

		this.loading = this.child_source ? this.source_children().then(walk) : walk();

		return this;
	}

	// ════ PREFERENCES — the page's own url IS the id (localStorage) ═══
	// ⚠ Storage, not STATE: nothing here notifies. (doc/method/prefs.md)
	prefs(){ return new this.constructor.Prefs({ page: this }); }

	// ext/tabs patches `tabs()` onto this prototype and fills `regions`, which
	// container() reads. Nothing here declares either.
}

// The box the six page words open. ⚠ `PageFrame`, never `Frame`/`Stage`: View.classify() mints a CSS class from the name. (doc/watch-out.md)
Page.Frame = PageFrame;

// Registered so define_fields() builds the title/icon/description accessors. (doc/decisions.md)
Item.register(Page, "Page");

Page.Reader = PageLogReader;
Page.Listing = PageListing;
Page.Prefs = PagePrefs;
Page.Related = PageRelated;
Page.Previews = PagePreviews;

// Opt-in instance tracking, installed once so every Page shares one list (core/track/track.js). (doc/decisions.md)
track(Page);

export default Page;
