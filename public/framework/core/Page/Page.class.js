import { View, div, p, h1, h4, a, span, icon, is } from "../View/View.js";
import PageFrame from "./Frame.js";
import Item from "../Item/Item.js";
import List from "../List/List.js";
import { track } from "../track/track.js";
import ai_cost from "./weight/ai-cost.js";
import PageWork from "./ai/PageWork.js";
import PageChildren from "./Children.js";
import PageLogReader from "./Reader.js";
import PageListing from "./Listing.js";
import PagePrefs from "./Prefs.js";
import PageRelated from "./Related.js";
import PagePreviews from "./Previews.js";
import PageColumns from "./Columns.js";
import PageLinks from "./Links.js";
import PageJsonl from "./Jsonl.js";
import PageContent from "./PageContent.js";

View.stylesheet(import.meta, "Page.css");

// ⚠ Localhost only, the gate dev/Socket keeps: nothing below may ship behaviour.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");
const marked = el => el?.matches(".page.active-page, .page.active-ancestor, .page.default");

// The two page words that mean the same thing under an older name. `card` used to be
// `surface` (the theme's own tone list still says so, styles/sections/tone.js:11) and
// `tint` used to be `wash`. Read on the way in; never mentioned again.
const ALIAS = { surface: "card", wash: "tint" };

// A `.md` address is prose, anything else is the `page.json` at that address.
const is_md = url => /\.md(\?|#|$)/i.test(url);

// Page extends Item directly (no PageLog middle class). (doc/decisions.md)
export class Page extends Item {

	// ════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) runs Ext.setup(page) on EVERY page ═══
	// ⚠ Nobody calls it by default, so the loop below is empty for a page with no extensions. (doc/jsonl.md)
	static _ext = [];
	static use(Ext){ Page._ext.push(Ext); return Page; }

	// ⚠ Nothing is FETCHED here: a module page constructs itself at import. The caller budgets (doc/declaring.md).
	constructor(...args){
		super(...args);
		this.hoist_content();
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

		if ("content" in obj){
			const { content, ...rest } = obj;
			this.content.fill(content);
			return super.set(rest);
		}

		return super.set(obj);
	}

	// ════ CONTENT — one PageContent List for the page's life; a function, string or address is one item in it (doc/content.md) ═══
	get content(){ return this._content ??= new this.constructor.Content({ owner: this, name: "content" }); }
	set content(value){ this.content.fill(value); }

	// A class-body `content(){}` would hide the accessor: move it into the list and put the accessor on the instance.
	hoist_content(){
		const own = Object.getOwnPropertyDescriptor(this, "content");
		let method;
		for (let proto = Object.getPrototypeOf(this); proto && proto !== Page.prototype; proto = Object.getPrototypeOf(proto)){
			const desc = Object.getOwnPropertyDescriptor(proto, "content");
			if (desc) { method = desc.value; break; }
		}
		if (!own && !method) return;

		Object.defineProperty(this, "content", Object.getOwnPropertyDescriptor(Page.prototype, "content"));
		if (method) this.content.fill(method);
		if (own && "value" in own) this.content.fill(own.value);
	}

	// Anything to draw? An empty list with no parts draws nothing.
	has_content(){ return !!this._content?.drawn; }

	// Hand the list away and start a new one (ext/catalog moves the old content into its intro).
	take_content(){ const list = this._content; this._content = undefined; return list; }

	get(key){ return key === "content" ? this.content : super.get(key); }

	// The content list is a saved list only when it holds parts; code, addresses and text live in the page's code.
	lists(){
		const { _content, ...lists } = super.lists();
		if (_content?.items.some(item => !item.transient)) lists.content = _content;
		return lists;
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

	// ════ PAGE.JSONL HOOKS — the file steps, tab state, the word delta (Jsonl.js, doc/jsonl.md) ═══
	// The state stays here (`listed`, `placed`, `child_kinds`, `tabs_state`); a page overrides a facade and Jsonl calls back through it.
	file(name){ return new this.constructor.Jsonl({ page: this }).file(name); }
	gone(yes){ return new this.constructor.Jsonl({ page: this }).gone(yes); }
	child_file(entry){ return new this.constructor.Jsonl({ page: this }).child_file(entry); }
	link_child(name){ return new this.constructor.Jsonl({ page: this }).link_child(name); }
	unlink_child(key){ return new this.constructor.Jsonl({ page: this }).unlink_child(key); }
	tab(obj){ return new this.constructor.Jsonl({ page: this }).tab(obj); }

	// The six page words a delta may carry. (doc/jsonl.md)
	static WORDS = ["navigation", "width", "arrangement", "surface", "background", "type_size"];

	take_words(obj){ return new this.constructor.Jsonl({ page: this }).take_words(obj); }
	overlay(line){ return new this.constructor.Jsonl({ page: this }).overlay(line); }

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

	tab_state(name){ return new this.constructor.Jsonl({ page: this }).tab_state(name); }
	tab_visible(name){ return new this.constructor.Jsonl({ page: this }).tab_visible(name); }
	nav_ready(name){ return new this.constructor.Jsonl({ page: this }).nav_ready(name); }
	tab_order(name){ return new this.constructor.Jsonl({ page: this }).tab_order(name); }

	place(value){ return new this.constructor.Jsonl({ page: this }).place(value); }
	log_view(){ return new this.constructor.Jsonl({ page: this }).log_view(); }
	draw_folder(){ return new this.constructor.Jsonl({ page: this }).draw_folder(); }
	log_draw(){ return new this.constructor.Jsonl({ page: this }).log_draw(); }
	log_folder(){ return new this.constructor.Jsonl({ page: this }).log_folder(); }
	log_redraw(){ return new this.constructor.Jsonl({ page: this }).log_redraw(); }
	draw_placed(entry){ return new this.constructor.Jsonl({ page: this }).draw_placed(entry); }
	draw_md(url){ return new this.constructor.Jsonl({ page: this }).draw_md(url); }
	draw_module(url, data){ return new this.constructor.Jsonl({ page: this }).draw_module(url, data); }
	listing(){ return new this.constructor.Jsonl({ page: this }).listing(); }

	// Every `data` key that is not a declared field. (doc/decisions.md)
	get unknown(){ return Object.keys(this.data).filter(key => !this.constructor.fields.includes(key)); }

	report_unknown(){ return new this.constructor.Jsonl({ page: this }).report_unknown(); }
	log_forget(){ return new this.constructor.Jsonl({ page: this }).log_forget(); }

	static jsonl(url){ return this.Jsonl.load(this, url); }

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

	static log_class(module, url){ return this.Jsonl.log_class(this, module, url); }

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

	// The link's decision lives in Links.js; a page overrides these and the Router calls them. (doc/open.md)
	open_link(link){ return new this.constructor.Links({ page: this }).open(link); }
	swap_link(link){ return new this.constructor.Links({ page: this }).swap(link); }
	swap_url(file){ return new this.constructor.Links({ page: this }).swap_url(file); }
	md_files(names){ return new this.constructor.Links({ page: this }).files(names); }
	static md_page(file){ return this.Links.md_page(file); }
	static md_file(link){ return this.Links.md_file(link); }
	static md_url(file){ return this.Links.md_url(file); }

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

		// "N open tasks touch this page", computed into ai/page-work.json; nothing drawn when there is none. (ai/doc/page-work-line.md)
		if (this.title && this.url) this.view.append(() => { span.c("page-open").append(PageWork.line(this.url)); });

		Page.views.set(this.view.el, this);
		this.emit("render", this.view);   // once, here — the early return above skips a second draw
		return this.view;
	}

	// What is in the box: the content list draws its items in order; the page does not know the kinds. (doc/content.md)
	render_content(){ return this.content.render(); }

	// The row box for any List (the Now card's dashboard too): one row per item, redrawn from the list's events. (doc/content.md)
	render_content_list(list = this.content){ return new this.constructor.Content.View({ list, page: this, box: true }).result; }

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

	// ════ COLUMNS — the Finder shape (Columns.js, doc/columns.md) ═══
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

	// Facades: a page overrides `column(host)` and the others call each other through `this`, so these stay Page methods.
	render_column(host){ return new this.constructor.Columns({ page: this }).render(host); }
	column(host){ return new this.constructor.Columns({ page: this }).body(host); }
	default_column(){ return new this.constructor.Columns({ page: this }).default(); }
	column_grab($body){ return new this.constructor.Columns({ page: this }).grab($body); }
	resize_column($body, px){ return new this.constructor.Columns({ page: this }).resize($body, px); }
	static even_columns(row, fit){ return this.Columns.even(row, fit); }
	even_columns(){ return new this.constructor.Columns({ page: this }).even(); }
	settle_columns(slide){ return new this.constructor.Columns({ page: this }).settle(slide); }
	column_slide(){ return new this.constructor.Columns({ page: this }).slide(); }
	reveal_column(page){ return new this.constructor.Columns({ page: this }).reveal(page); }
	scroll_column(slide){ return new this.constructor.Columns({ page: this }).scroll(slide); }

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
	previews(pages, opts){ return new this.constructor.Previews({ page: this }).list(pages, opts); }
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
Page.Jsonl = PageJsonl;
Page.Content = PageContent;
PageJsonl.Page = Page;
Page.Related = PageRelated;
Page.Previews = PagePreviews;
Page.Columns = PageColumns;
Page.Links = PageLinks;

// Opt-in instance tracking, installed once so every Page shares one list (core/track/track.js). (doc/decisions.md)
track(Page);

export default Page;
