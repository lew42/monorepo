import { View, div, p, code, table, thead, tbody, tr, th, td, is } from "../View/View.js";
import List from "../List/List.js";
import { page_settings } from "./settings/settings.js";
import PageListing from "./Listing.js";
import PageLogReader from "./Reader.js";

const dev = PageLogReader.dev;   // one localhost test, in Reader.js

// "kid/page.jsonl" → ["kid", "jsonl"]; key_of() keys a file line by its FIRST path segment, latest wins. (doc/decisions.md)
const { CHILD, key_of } = PageListing;

// What a page.jsonl does to a page: the loader, the three file steps, tab state, the word delta, nav visibility, the placed files. (doc/jsonl.md)
// `page.file()`, `tab()`, `place()` and the rest are facades on Page: a page overrides them, so every call back into
// the page goes through `this.page.*` and the override still wins. The state stays on the page (`listed`, `placed`, `child_kinds`, `tabs_state`).
export default class PageJsonl {

	page = null;
	static Page = null;   // Page.class.js sets it: importing Page here would be a cycle

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }
	get Page(){ return this.constructor.Page; }

	// ════ THE LOADER ═══
	// `url` is the folder; line 1 builds the page, later lines are set(). Streams on localhost.
	// ⚠ Two callers can race for one url: `reader._building` joins them. (doc/watch-out.md)
	static async load(host, url){
		const reader = host.Reader.for(url + "page.jsonl");

		// A page already built for this reader — a SECOND visit gets the SAME live object back.
		if (reader.host) return reader.host;
		if (reader._building) return reader._building;

		return reader._building = (async () => {
			await reader.open();

			// A log whose line 1 is a `file` line is a folder's listing, not a page.
			const [first] = reader.entries;
			if (!first || typeof first.file === "string") { reader.close(); return null; }

			const Class = first.class ? await host.log_class(first.class, url) : host;
			const { class: _, ...line } = first;
			const page = new Class(line, { url, jsonl_url: reader.url });

			if (!page.has_content()) page.content.fallback(page.log_view);
			reader.attach(page);
			(this.Page.log_pages ??= new Map()).set(page.log_folder(), page);   // listing() reads it for free
			return page;
		})().finally(() => { reader._building = null; });
	}

	static async log_class(host, module, url){
		const Class = (await import(new URL(module, location.origin + url).href)).default;
		if (Class?.prototype instanceof this.Page) return Class;

		console.error(`page.jsonl at ${url} — "class": "${module}" is not a Page subclass; building a ${host.name}.`);
		return host;
	}

	// ════ STEP 1 — the file EXISTS (recorded, never rendered; a code call returns the real FsFile) ═══ (doc/jsonl.md)
	file(name){
		const page = this.page;
		if (page.store?.replaying){
			(page.listed ??= new Map()).set(page.last_file = key_of(name), name);
			CHILD.test(name) ? page.link_child(name) : page.unlink_child(key_of(name));
			return undefined;
		}
		const path = (page.log_folder() + name).replace(/^\/+/, "");
		return import("../../ext/filesystem/FsFile.js").then(({ default: FsFile }) => new FsFile({ path, name }));
	}

	// `{"file": "x", "gone": true}` — `set()` calls file("x") first, then this.
	gone(yes){
		const page = this.page;
		if (!yes || !page.last_file) return;
		page.listed?.delete(page.last_file);
		page.unlink_child(page.last_file);
	}

	// ════ STEP 2 — a child page is LINKED, automatically ("kid/page.jsonl" → child "kid") ═══ (doc/jsonl.md)
	child_file(entry){
		const [, dir, kind] = entry.match(CHILD) ?? [];
		if (!kind) return entry;

		(this.page.child_kinds ??= new Map()).set(dir, kind);
		return dir;
	}

	link_child(name){
		const dir = this.page.child_file(name);
		if (!this.page.children.has(dir)) this.page.children.set(dir, null);
	}

	unlink_child(key){
		if (!this.page.child_kinds?.delete(key)) return;
		this.page.children.delete(key);
	}

	// ════ TAB STATE — {"tab": {"name": "x", "disabled": true, "nav": false, "order": 3}} ═══
	// ⚠ Repeat lines for a name MERGE, never replace. (doc/jsonl.md)
	tab(obj){
		const page = this.page;
		const { name, title, icon, description, content, ...state } = obj;
		if (!name) return;

		(page.tabs_state ??= new Map()).set(name, { ...page.tabs_state.get(name), ...state });
		const data = Object.fromEntries(Object.entries({ title, icon, description, content }).filter(([, v]) => v !== undefined));
		if (!Object.keys(data).length){
			if (!page.children.has(name)) page.children.set(name, null);
			return;
		}

		const had = page.children.get(name);
		if (had instanceof this.Page){
			const { content: text, ...labels } = data;
			if (Object.keys(labels).length) had.set(labels);
			if (text !== undefined && !had.content.has_parts) had.content = text;
			had.rerender();
			if (page.view) queueMicrotask(() => page.nav_redraw?.());
			return;
		}

		page.add(name, data).from_tab = true;
		if (!page.navigation && !page._tab_redraws?.size){ page.navigation = "tabs"; page.words(); }
		page.reshape();
	}

	// ════ THE SIX WORDS AS A DELTA — a word on a live page.jsonl reshapes the page, redrawn once ═══ (doc/jsonl.md)
	take_words(obj){
		const page = this.page;
		const said = this.Page.WORDS.filter(word => word in obj);
		if (!said.length) return obj;

		const rest = { ...obj };
		let changed = false;
		for (const word of said){
			if (page[word] !== rest[word]){ page[word] = rest[word]; changed = true; }
			delete rest[word];
		}
		if (changed){ page.words(); page.reshape(); }
		return rest;
	}

	// A log on top of a template: only the SHAPE of a line applies (the words, `tab`, `title`). (doc/jsonl.md)
	overlay(line){
		if (!line || typeof line !== "object" || Array.isArray(line)) return null;
		const shape = {};
		for (const [key, value] of Object.entries(line))
			if (this.Page.WORDS.includes(key) || key === "tab" || key === "title" || this.page.children.get(key)?.from_tab) shape[key] = value;
		return Object.keys(shape).length ? (this.page.set(shape), shape) : null;
	}

	// The state a `tab` line recorded for one name — `{}` when nobody set one, so callers read `.disabled` / `.nav` / `.order` with no guard.
	tab_state(name){ return this.page.tabs_state?.get(name) ?? {}; }

	// ════ NAV VISIBILITY — one rule for the rail, the tab strip and the drawer's checkbox ═══
	// Synchronous and optimistic (true first, corrected by nav_redraw()); nav_ready() is the awaited answer. (doc/jsonl.md)
	tab_visible(name){
		const page = this.page;
		const set = page.tab_state(name).nav;
		if (set === false) return false;
		if (set === true) return true;

		page._nav ??= new Map();
		if (!page._nav.has(name)){
			page._nav.set(name, true);
			page.nav_ready(name).then(nav => {
				if (page._nav.get(name) === nav) return;
				page._nav.set(name, nav);
				page.nav_redraw?.();
			});
		}
		return page._nav.get(name);
	}

	// The awaited answer tab_visible() above stands in for.
	async nav_ready(name){
		const set = this.page.tab_state(name).nav;
		if (typeof set === "boolean") return set;
		return (await page_settings(this.page.url + name + "/")).nav;
	}

	// An explicit `order` wins; the rest tie at `Infinity` and the stable sort keeps their order.
	tab_order(name){ return this.page.tab_state(name).order ?? Infinity; }

	// ════ STEP 3 — PLACED in the content, deliberately ════════════════════════
	// A name, an array of names, or `{"module": "x.js", …data}`. In order; once each.
	place(value){
		const page = this.page;
		page.placed ??= [];

		for (const entry of [value].flat()){
			const id = JSON.stringify(entry);
			if (!page.placed.some(had => JSON.stringify(had) === id)) page.placed.push(entry);
		}
	}

	// What a page.jsonl page draws when it has no `content()` of its own: its placed files, in order. The box is kept so a later line can redraw it.
	log_view(){
		const page = this.page;
		return div.c("flow", () => {
			page.$log = div.c("page-log flow", () => { page.log_draw(); });
			page.draw_folder();
		});
	}

	// The page shows its own folder (page.jsonl and the files its lines name). ⚠ core does not import ext: dynamic import. (doc/watch-out.md)
	draw_folder(){
		const url = location.origin + this.page.log_folder();
		const names = new Set(["page.jsonl", ...[...this.page.listed?.values() ?? []].filter(name => !CHILD.test(name))]);

		return div.c("page-log-files", $box => {
			import("../../ext/files/files.js")
				.then(({ default: files }) => $box.append(() => { files({ url }, [...names].join(" ")); }));
		});
	}

	log_draw(){ (this.page.placed ?? []).forEach(entry => this.page.draw_placed(entry)); }

	// Where the log's files really are. A page's `url` is its ADDRESS; a card shown at another address (AI 2) keeps its files in its own folder.
	log_folder(){ return String(this.page.jsonl_url ?? this.page.url).replace(/page\.jsonl$/, ""); }

	log_redraw(){ this.page.$log?.empty(() => { this.page.log_draw(); }); }

	// `.md` is prose. `.js` is a module: a default export with a `render` (a View) is built as `new Default({ page, …data })`, anything else called as `fn(page, box, data)`.
	draw_placed(entry){
		const { module, ...data } = is.str(entry) ? { module: entry } : entry;
		const url = new URL(module, location.origin + this.page.log_folder()).href;

		if (/\.md$/i.test(module)) return this.page.draw_md(url);
		if (/\.m?js$/i.test(module)) return this.page.draw_module(url, data);
	}

	// ⚠ core does not import ext: the import is dynamic, as in file() above.
	draw_md(url){
		return div.c("page-log-md", $box => {
			import("../../ext/markdown/md.js")
				.then(({ default: md }) => $box.append(() => md.file({ url }, url, { h1: false })));
		});
	}

	// ⚠ THE BOX IS CAPTURED NOW, before the import resolves: a dozen modules can arrive in any order and each fills the box it was given.
	draw_module(url, data){
		const page = this.page;
		return div.c("page-log-module", $box => {
			import(url).then(({ default: Default }) => $box.append(() => {
				if (!Default?.prototype?.render) return void Default?.(page, $box, data);

				const made = new Default({ page, ...data });
				if (!(made instanceof View)) made.render();   // a View drew itself already
			})).catch(error => console.error(`${page.log_label()} — ${url} failed to load:`, error));
		});
	}

	// ════ THE DEBUG VIEW — every file, and which of the three steps it reached ═══
	listing(){
		const page = this.page;
		const rows = new Map();
		page.listed?.forEach((name, key) => rows.set(key, { name, exists: true }));
		(page.placed ?? []).forEach(entry => {
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
					mark(page.child_kinds?.has(key));
					mark(row.placed);
				})));
			});

			if (page.unknown.length)
				p.c("muted", "Kept as data, no method or property knew them: " + page.unknown.join(", ") + ".");
		});
	}

	// One console.info per batch that taught the page a key nobody knew. Never a warn.
	report_unknown(){
		const page = this.page;
		const fresh = page.unknown.filter(key => !page.reported?.has(key));
		if (!dev || !fresh.length) return;

		fresh.forEach(key => (page.reported ??= new Set()).add(key));
		console.info(`${page.log_label()} — page.jsonl keys no method or property knew, kept as data:`, fresh);
	}

	// A rewritten (not appended) log replays from line 1 onto a clean slate.
	log_forget(){
		this.page.listed?.clear();
		this.page.placed = [];
	}
}
