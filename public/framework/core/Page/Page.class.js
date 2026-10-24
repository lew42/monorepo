import { View, div, p, h1, h4, a, span, icon, is } from "../View/View.js";
import PageFrame from "./Frame.js";
import Item from "../Item/Item.js";
import List from "../List/List.js";
import { track } from "../track/track.js";
import ai_cost from "./weight/ai-cost.js";
import PageWork from "./ai/PageWork.js";
import PageInbox from "./PageInbox.js";
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

// history and reasons: doc/Page-notes.md

View.stylesheet(import.meta, "Page.css");

// ⚠ Localhost only, the gate dev/Socket keeps: nothing below may ship behaviour.
const dev = PageLogReader.dev;   // one localhost test, in Reader.js
const marked = el => el?.matches(".page.active-page, .page.active-ancestor, .page.default");

const ALIAS = { surface: "card", wash: "tint" };

const is_md = url => /\.md(\?|#|$)/i.test(url);

export class Page extends Item {

	// ════ EXTENSIONS, CODE-REGISTERED — Page.use(Ext) runs Ext.setup(page) on EVERY page ═══
	// ⚠ Nobody calls it by default, so the loop below is empty for a page with no extensions. (doc/jsonl.md)
	static _ext = [];
	static use(Ext){ Page._ext.push(Ext); return Page; }

	// ⚠ Nothing is FETCHED here: a module page constructs itself at import. The caller budgets (doc/declaring.md).
	constructor(...args){
		super(...args);
		this.hoist_content();
		this.build_assign(...args);   // again, so args win over Page's own class fields; build_assign: no set(), no line
		if (!this.data || typeof this.data !== "object" || Array.isArray(this.data)) this.data = Object.create(null);
		Page.track(this);
		this.naming();
		this.declare();
		Page._ext.forEach(Ext => Ext.setup?.(this));
		this.initialize?.();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// Page.replay(lines) in node (the item tool, Page.test.mjs): the lines are only being REPLAYED, so a `file` line records itself and imports nothing.
	static replay_new(lines){
		const page = new this();
		page.store = { replaying: true };
		return page;
	}

	log_label(){ return `page{${this.url ?? "…"}}`; }

	// ════ PAGE.JSONL ══════════════════

	settings = { set(obj){ Object.assign(this, obj); } };

	bubbles(){ return false; }

	static new_id(){ return undefined; }

	static fields = ["title", "icon", "description"];

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

	// ════ CONTENT — (doc/content.md) ═══
	get content(){ return this._content ??= new this.constructor.Content({ owner: this, name: "content" }); }
	set content(value){ this.content.fill(value); }

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

	has_content(){ return !!this._content?.drawn; }

	take_content(){ const list = this._content; this._content = undefined; return list; }

	get(key){ return key === "content" ? this.content : super.get(key); }

	lists(){
		const { _content, ...lists } = super.lists();
		if (_content?.items.some(item => !item.transient)) lists.content = _content;
		return lists;
	}

	get pages(){ return this._pages ??= new List({ owner: this, name: "pages", of: null }); }

	get children(){ return this._children ??= new PageChildren(this); }

	// ⚠ A config `children: […]` is only STAGED here; declare() reads it. A `new Map()` means "forget everything". (doc/watch-out.md)
	set children(list){
		if (list instanceof Map){
			const entries = [...list];
			[...this.pages].forEach(page => this.pages.release(page));
			entries.forEach(([name, page]) => this.children.set(name, page));
			return;
		}
		this._raw_children = list;
	}

	// ════ EXTENSIONS ═══
	ext(name){
		const ready = import(new URL(`./ext/${name}/${name}.js`, import.meta.url).href)
			.then(({ default: Ext }) => Ext.setup?.(this))
			.catch(error => console.error(`${this.log_label()} — ext("${name}") failed to load:`, error));
		(this.ext_ready ??= []).push(ready);
	}

	// ════ PAGE.JSONL HOOKS (Jsonl.js, doc/jsonl.md) ═══
	file(name){ return new this.constructor.Jsonl({ page: this }).file(name); }
	gone(yes){ return new this.constructor.Jsonl({ page: this }).gone(yes); }
	child_file(entry){ return new this.constructor.Jsonl({ page: this }).child_file(entry); }
	link_child(name){ return new this.constructor.Jsonl({ page: this }).link_child(name); }
	unlink_child(key){ return new this.constructor.Jsonl({ page: this }).unlink_child(key); }
	tab(obj){ return new this.constructor.Jsonl({ page: this }).tab(obj); }

	static WORDS = ["navigation", "width", "arrangement", "surface", "background", "type_size"];

	take_words(obj){ return new this.constructor.Jsonl({ page: this }).take_words(obj); }
	overlay(line){ return new this.constructor.Jsonl({ page: this }).overlay(line); }

	reshape(){
		if (!this.view || this._reshaping) return;
		this._reshaping = true;
		queueMicrotask(() => { this._reshaping = false; this.rerender(); });
	}

	// Draw me again in place, no reload. ⚠ Not `redraw()`: Card already has its own. (doc/watch-out.md)
	rerender(){
		const old = this.view?.el;
		if (!old) return this;

		this.emit("left");
		this.deactivated?.();
		const was_default = old.classList.contains("default");
		Page.views.delete(old);
		this.view = null; this.regions = null; this._tab_redraws = null; this.default_tab = undefined; this.related_drawn = false;

		this.render();
		if (was_default) this.view.ac("default");
		old.replaceWith(this.view.el);
		globalThis.$page = this;
		this.emit("entered");
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

	// ════ THE SIX PAGE WORDS ═══
	words(){
		this.width      ??= this.room;
		this.surface     = ALIAS[this.surface]    ?? this.surface;
		this.background  = ALIAS[this.background] ?? this.background;
		return this;
	}

	word_classes(){
		return [
			this.navigation  && "page-nav-" + this.navigation,
			this.arrangement && "page-arr-" + this.arrangement,
			this.background  && "page-bg-" + this.background,
			this.type_size   && "page-type-" + this.type_size,
		].filter(Boolean);
	}

	words_said(){ return !!(this.surface || this.word_classes().length); }

	declare(list = this._raw_children ?? []){
		if (is.fn(list)) { this.child_source = list; list = []; }

		// `children: "Named words auto"` — the word `auto` also adopts every subfolder holding a
		// page.js / page.jsonl, read from this folder's files.jsonl, alphabetical, after the named
		// ones. A new page appears with no edit here. doc/indexing-2026-10-08.md.
		if (is.str(list) && /(^|\s)auto(\s|$)/.test(list)){
			list = list.replace(/(^|\s)auto(?=\s|$)/, "");
			this.child_source = async () => [...(await Page.listing(this.url))?.pages.keys() ?? []].filter(name => !this.children.has(name)).sort();
		}

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

			throw new Error(`children.${title} — got a value, not a function; write ${title}(){ … } so content runs when the page renders`);
		});

		return this;
	}

	add(name, child = {}){
		const adopt = { name, parent: this, app: this.app };

		const page = child instanceof Page ? child.assign(adopt)
			: new Page(is.fn(child) || typeof child === "string" ? { content: child } : child, adopt);

		if (this.url) page.move(this.url + name + "/");

		page.naming();

		const stub = this.pages.find(name);
		stub ? this.pages.replace(stub, page) : this.children.put(page);
		return page;
	}

	move(url){
		if (this.url === url) return this;

		this.url = url;
		this.pages.forEach(child => { if (!child.stub) child.move(url + child.id + "/"); });
		return this;
	}

	chain(){
		const chain = [this];
		for (let page = this; page.parent; ) chain.unshift(page = page.parent);
		return chain;
	}

	// ════ ROLES ═══
	nearest(role){ return this.chain().findLast(page => page.is === role); }

	topic(){ return this.nearest("topic"); }
	document(){ return this.nearest("document"); }

	// A `children()` function is called ONCE, on the first ask. ⚠ Memoised on `this.sourcing`. (doc/watch-out.md)
	source_children(){
		return this.sourcing ??= Promise.resolve(this.child_source.call(this))
			.then(list => this.declare(list ?? []));
	}

	async child(name, levels){
		if (this.child_source) await this.source_children();

		const known = this.children.get(name);

		if (known) return known.assign({ app: this.app }).load_all_children(levels);

		if (this.child_kinds?.get(name) === "jsonl") {
			const page = await Page.jsonl(this.url + name + "/");
			return page && this.add(name, page).load_all_children(levels);
		}

		if (name === "md" && known === undefined) return this.add(name, await this.md_folder()).load_all_children(levels);

		if (name === "fs" && known === undefined) return this.add(name, await this.fs_folder()).load_all_children(levels);

		if (name === "inbox" && known === undefined && !this.no_inbox) return this.add(name, PageInbox.route(this)).load_all_children(levels);

		const claimed = known === undefined && is.fn(this.route) && this.route(name);
		if (claimed) return this.add(name, claimed).load_all_children(levels);

		await Page.listing(this.url);   // a child named only in this folder's page.jsonl / files.jsonl (doc/subpages.md)
		const [listing, docs] = [Page.loaded_listing(this.url), Page.loaded_listing(this.md_dir())];
		const kind = listing?.pages.get(name);
		const md = !listing?.folder(name) && docs?.files.includes(name + ".md");

		if (kind === "jsonl") {
			const page = await Page.jsonl(this.url + name + "/");
			if (page) return this.add(name, page).load_all_children(levels);
		}

		if (name === "ai" && known === undefined && !kind && !this.no_ai) return this.add(name, await this.ai_page()).load_all_children(levels);   // <path>/ai/: the Sheet about this page; a real ai/ page wins (ext/drawer/doc/sheet.md)

		if (name === "tasks" && kind !== "js") return this.add(name, await this.tasks_folder()).load_all_children(levels);   // a tasks/ with no page.js of its own: no import probe, no 404 (core/Task/readme.md)

		const doc = md && await this.child_md(name, levels);
		if (doc) return doc;

		const readme = !kind && await this.child_readme(name, listing, levels);   // the listing shows no page.js, so it is not probed (a 404)
		if (readme) return readme;

		const page = await Page.load(this.url + name + "/", 0);
		if (page) return this.add(name, page).load_all_children(levels);

		return md ? null : this.child_md(name, levels);
	}

	// A folder with no page.js or page.jsonl but its own readme.md opens as a page showing that readme (doc/subpages.md). Only a folder the parent's listing knows is asked.
	async child_readme(name, listing, levels){
		if (!listing?.folder(name)) return null;

		const url = this.url + name + "/", own = await Page.listing(url);
		if (!own?.files.includes("readme.md")) return null;

		const file = await Page.file(url + "readme.md");
		if (!file) return null;

		const label = file.title?.split(/\s+[—–]\s+/)[0].replaceAll("`", "") || name;   // the sidebar gets "Events", not the readme's whole first heading
		const more = own.dirs.includes("doc") || own.files.some(f => f.endsWith(".md") && f !== "readme.md");   // its other .md files get one link to the Markdown Explorer, since a plain Page has no md tab
		const content = more ? () => file.content().then(doc => doc && doc.append(() => { p.c("muted").append(() => { a("Every .md file in this folder").href(url + "md/"); }); })) : file.content;
		return this.add(name, { ...file, content, label, folder: url }).load_all_children(levels);
	}

	// ⚠ Imported on first use, like md_folder: core/Task imports Page.
	async tasks_folder(){
		const { default: TasksPage } = await import("../Task/TasksPage.js");
		return new TasksPage({ title: "Tasks", icon: "task_alt" });
	}

	// ⚠ Imported on first use, like tasks_folder: AIPage extends Page.
	async ai_page(){
		const { default: AIPage } = await import("../../ext/drawer/AIPage.js");
		return AIPage.route(this);
	}

	async child_md(name, levels){
		const file = await Page.file(this.md_dir() + name + ".md");
		return file ? this.add(name, { ...file, folder: this.md_dir() }).load_all_children(levels) : null;
	}

	// ⚠ Imported on first use: Markdown extends Page, so a static import is a cycle.
	async md_folder(){
		const { default: PageMarkdown } = await import("./Markdown.js");
		return new PageMarkdown({ folder: this.md_dir(), title: "Markdown", name: "md" });
	}

	// This directory's real files, full screen, at my own `fs/` (`?v=1` is the old view). ⚠ Dynamic import. (doc/decisions.md)
	async fs_folder(){
		const v1 = new URLSearchParams(location.search).get("v") === "1";
		const module = v1 ? "../../ext/files/fs.js" : "../../ext/files/explorer.js";
		const { default: PageFiles } = await import(module);
		return new PageFiles({ folder: this.md_dir() });
	}

	// ════ WHERE A CLICKED LINK OPENS ══

	md_dir(){ return this.folder ?? this.url; }

	open_link(link){ return new this.constructor.Links({ page: this }).open(link); }
	swap_link(link){ return new this.constructor.Links({ page: this }).swap(link); }
	swap_url(file){ return new this.constructor.Links({ page: this }).swap_url(file); }
	md_files(names){ return new this.constructor.Links({ page: this }).files(names); }
	static md_page(file){ return this.Links.md_page(file); }
	static md_file(link){ return this.Links.md_file(link); }
	static md_url(file){ return this.Links.md_url(file); }

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

		md.cache[href] ??= Promise.resolve(text);

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

	static async from(source, adopt){
		const url  = is.str(source) ? source.replace(/\/?$/, "/") : null;
		const data = url ? await this.read_json(url + "page.json") : source;
		if (!data) return null;

		const page = new this({ url, ...this.props(data, data.mode ?? {}) }, adopt);

		for (const name of data.children ?? [])
			page.add(name, (url && await this.from(url + name + "/")) ?? { title: name });

		return page;
	}

	static props(data, mode){
		return {
			title: data.title, icon: data.icon, description: data.description,
			navigation: mode.navigation, arrangement: mode.arrangement,
			surface: mode.surface, background: mode.background,
			type_size: mode.type,
			width: mode.room ?? mode.width,
			content: mode.content,
		};
	}

	static missing(error){
		return /Failed to fetch dynamically imported module|error loading dynamically imported module|MIME type|Expected a JavaScript/i
			.test(error?.message ?? "");
	}

	static slug(title){
		return String(title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	}

	container(){
		const mine = this.parent?.regions?.get(this.name);
		if (mine) return this.mounts_in(mine, `region of ${this.parent.log_label()}`);

		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return this.mounts_in(page.$pages, `$pages of ${page.log_label()}`);

		return this.mounts_in(this.app.$pages, "app.$pages");
	}

	mounts_in(view, claim){ return view; }

	activate(){
		// The page streams started during render/activated belong to (ext/JSONL/live.js drops them on "left").
		globalThis.$page = this;
		const container = this.container();

		if (this.render().el.parentNode !== container.el)
			container.append(this.view);

		// ⚠ The fallback for a page whose own render() replaced this class's (ext/Doc): related still draws. (doc/watch-out.md)
		if (this.related && !this.related_drawn)
			this.view.append(() => { this.related_aside(); });

		this.emit("entered");
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
		this.emit("left");
		this.deactivated?.();

		// ⚠ Going UP the chain activates nothing, so the columns host is told here. (doc/decisions.md)
		const host = this.column_host();
		if (host && host !== this) host.reveal_column(this.parent);

		return this;
	}

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

		this.view = div.c("page flow", () => {
			if (this.title) h1.c("page-title", this.title);

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
		if (this.title && this.url) this.view.append(() => {
			span.c("page-ai-cost muted").append(ai_cost(this.url).then(c => {
				if (!c || !(c.usd > 0)) return undefined;
				return a(`$${c.usd.toFixed(2)} of AI work · ${c.tasks} task${c.tasks === 1 ? "" : "s"}`)
					.href(`/framework/ai/log/?page=${encodeURIComponent(this.url)}`);
			}));
		});

		if (this.title && this.url) this.view.append(() => { span.c("page-open").append(PageWork.line(this.url)); });

		if (this.title && this.url && !this.no_inbox) this.view.append(() => { span.c("page-inbox-chip").append(PageInbox.chip(this)); });

		Page.views.set(this.view.el, this);
		this.emit("render", this.view);
		return this.view;
	}

	render_content(){ return this.content.render(); }

	render_content_list(list = this.content){ return new this.constructor.Content.View({ list, page: this, box: true }).result; }

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

	drew_content(source, url, level){
		if (!source) return p.c("muted", "Nothing could be read at " + url + ".");

		const page = source instanceof Page ? source : new Page(source);
		page.content_level = level;
		return page.render().ac("default");
	}

	link(text){ return a.c("page-link", text ?? this.title).href(this.url); }

	crumbs(from){
		const chain = this.chain(), start = Math.max(chain.indexOf(from), 0);

		return div.c("page-crumbs", () => chain.slice(start).forEach((page, i) => {
			if (i) icon("chevron_right");
			page.link();
		}));
	}

	// ════ RELATED ═══
	related_aside(){ return new this.constructor.Related({ page: this }).aside(); }

	// ════ COLUMNS ═══
	columns({ even = false, fit = "floor" } = {}){ this.columnar = true; this.column_even = even; this.column_fit = fit; return this; }

	column_floor = 96;

	// Asked at render time, never walked. ⚠ A page under a tab strip is a tab, not a column. (doc/decisions.md)
	column_host(){
		// `navigation: "columns"` is the word for calling `columns()`: the first time a render asks, it does.
		const chain = this.chain(), at = chain.findIndex(page => page.columnar || page.navigation === "columns" && page.columns().columnar);
		if (at < 0 || chain.slice(at, -1).some(page => page.navigation === "tabs")) return undefined;
		return chain[at];
	}

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

	nav(){ return { url: this.url, label: this.label ?? this.title, icon: this.icon, card: this.card, description: this.description }; }

	nav_for(name){
		const child = this.children.get(name);

		return { ...child?.nav(), url: this.url + name + "/", label: child?.label ?? child?.title ?? name };
	}

	// ════ PREVIEWS ═══
	previews(pages, opts){ return new this.constructor.Previews({ page: this }).list(pages, opts); }
	walls(){ return new this.constructor.Previews({ page: this }).walls(); }
	wall_rungs(){ return new this.constructor.Previews({ page: this }).rungs(); }

	preview(nav){ return this.preview_card(nav); }
	preview_card(nav = this.nav(), thumb){ return new this.constructor.Previews({ page: this }).card(nav, thumb); }
	preview_thumb(thumb){ return new this.constructor.Previews({ page: this }).thumb(thumb); }
	preview_link(nav){ return new this.constructor.Previews({ page: this }).link(nav); }

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

	prefs(){ return new this.constructor.Prefs({ page: this }); }
}

// The box the six page words open. ⚠ `PageFrame`, never `Frame`/`Stage`: View.classify() mints a CSS class from the name. (doc/watch-out.md)
Page.Frame = PageFrame;

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
Page.Inbox = PageInbox;

track(Page);

export default Page;
