import { View, div, p, code, table, thead, tbody, tr, th, td, is } from "../View/View.js";

/* A PAGE AS A LOG — `page.jsonl`, the page format that needs no page.js.

       {"title": "Notes", "icon": "description"}      line 1: the constructor
       {"file": "note.md"}                             the file EXISTS
       {"file": "kid/page.jsonl"}                      …and a child page is LINKED
       {"place": "note.md"}                            it is PLACED in the content

   Every line after the first is one `set()` call, and there is no table mapping JSON
   keys to what they do: a key that names a method calls it, anything else is data.
   `place` does what `place()` below does. Page `extends` this class, so a subclass
   (a Card) adds a word by adding a method. doc/jsonl.md. */

// ⚠ Localhost only, the same gate Page.class.js keeps.
const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");

// "kid/page.jsonl" → ["kid", "jsonl"]. A plain "kid/" is a folder, not a page.
const CHILD = /^([^/]+)\/page\.(jsonl|js)$/;

// The server's watcher keys a file line by its FIRST path segment, so "kid/" and
// "kid/page.jsonl" are one entry, and the latest line for it wins. Keyed the same here.
const key_of = name => name.split("/")[0];

const skipped = key => key === "constructor" || key === "__proto__" || key.startsWith("_");

// ⚠ A Map has a `set` too, but it takes TWO arguments — `children` is core's own
//   bookkeeping, and a line may neither pass a value into it nor replace it.
const settable = value => value && typeof value === "object" && is.fn(value.set) && !(value instanceof Map);

export class PageLog {

	// `assign()` that calls methods instead of overwriting them. One argument, always.
	set(obj){
		for (const key in obj){
			const here = this[key];

			if (skipped(key) || here instanceof Map) continue;
			if (is.fn(here)) { here.call(this, obj[key]); continue; }
			if (settable(here)) { here.set(obj[key]); continue; }

			if (!(key in this)) (this.unknown ??= new Set()).add(key);   // a typo, or new data
			this[key] = obj[key];
		}
		return this;
	}

	// ════ STEP 1 — the file EXISTS ════════════════════════════════════════════
	// Recorded, never rendered. A repeat changes nothing: the latest line per name wins.
	file(name){
		(this.listed ??= new Map()).set(this.last_file = key_of(name), name);
		CHILD.test(name) ? this.link_child(name) : this.unlink_child(key_of(name));
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
	   ⚠ On localhost it STREAMS: a line appended later calls set() and redraws. */
	static async jsonl(url){
		const reader = new this.Reader({ url: url + "page.jsonl" });
		await reader.open();

		// A log whose line 1 is a `file` line is a folder's listing, not a page.
		const [first] = reader.entries;
		if (!first || typeof first.file === "string") { reader.close(); return null; }

		const Class = first.class ? await this.log_class(first.class, url) : this;
		const { class: _, ...line } = first;
		const page = new Class(line, { url, jsonl_url: reader.url });

		page.content ??= page.log_view;
		reader.attach(page);
		return page;
	}

	/* A FOLDER'S OWN FILE LIST, from its page.jsonl — what used to cost the whole
	   site's directory.json. `url` is the folder (a trailing `/` is added). One fetch
	   per folder, memoised (`fresh` refetches); no page is built. Null when the folder
	   has no page.jsonl: the caller falls back. A log with no `file` lines is an empty folder.
	   ⚠ Not live: a file added after the fetch is missing until `fresh`. */
	static listing(url, fresh){
		url = String(url).replace(/\/?$/, "/");
		if (PageLog.UNLOGGED.test(url)) return Promise.resolve(null);
		const memo = PageLog.listings ??= new Map();
		if (fresh || !memo.has(url)) memo.set(url, new PageLog.Reader({ url: url + "page.jsonl" }).load()
			.then(reader => reader.loaded ? PageLog.Listing.from(reader.entries) : null)
			.then(listing => { (PageLog.loaded_listings ??= new Map()).set(url, listing); return listing; }));
		return memo.get(url);
	}

	// ⚠ Folders INSIDE a dated task folder get no log (Server/plugins/PageFiles.js
	//   covers()), so asking would only log a 404: listing() answers null at once and
	//   the caller falls back. The card style (ai/YYYY/MM/DD/) is left out on purpose:
	//   a sub-card's folder can hold a real page.jsonl.
	static UNLOGGED = /^\/framework\/ai\/\d{4}-\d\d-\d\d\/[^/]+\/[^/]+\//;

	// The listing, only if a `listing()` call has already brought it in; never fetches.
	// undefined = not asked yet, null = asked, no page.jsonl.
	static loaded_listing(url){
		return PageLog.loaded_listings?.get(String(url).replace(/\/?$/, "/"));
	}

	static async log_class(module, url){
		const Class = (await import(new URL(module, location.origin + url).href)).default;
		if (Class?.prototype instanceof PageLog) return Class;

		console.error(`page.jsonl at ${url} — "class": "${module}" is not a Page subclass; building a ${this.name}.`);
		return this;
	}
}

/* WHAT ext/JSONL's live.js DRIVES — `url`, `offset`, `parse()`, `read()`, `load()`,
   `reset()`. Lines are held until line 1 has built the page, then every line is set(). */
PageLog.Reader = class PageLogReader {

	entries = [];
	count = 0;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// ⚠ core never statically imports ext; live.js is imported only on localhost.
	open(){
		if (!dev) return this.load();
		return import("../../ext/JSONL/live.js")
			.then(live => (this.live = live).stream(this, () => this.changed()));
	}

	close(){ this.live?.drop(this); }

	// A torn line is lost, never the log.
	parse(text){
		return text.split("\n").filter(line => line.trim()).flatMap(line => {
			try { return [JSON.parse(line)]; }
			catch { console.warn(`page.jsonl: unparsed line in ${this.url} —`, line); return []; }
		});
	}

	read(entries){
		for (const entry of entries){
			const { class: _, ...line } = entry;
			this.page ? this.page.set(this.count ? entry : line) : this.entries.push(entry);
			this.count++;
		}
		return this;
	}

	// ⚠ The SPA fallback answers a miss with index.html at 200 — content-type is the 404.
	async load(){
		const res = await fetch(this.url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return this;
		this.loaded = true;
		return this.read(this.parse(await res.text()));
	}

	attach(page){
		this.page = page;
		this.entries.splice(0).slice(1).forEach(entry => page.set(entry));
		page.report_unknown();
	}

	changed(){
		this.page?.report_unknown();
		this.page?.log_redraw();
	}

	reset(){
		this.count = 0;
		this.page?.log_forget();
		delete this.loaded;
		return this;
	}
};

/* WHAT `listing()` ANSWERS — the entries directly inside one folder, replayed the way
   file() replays them (keyed by first segment, latest line wins, `gone` removes):
       files  ["readme.md", …]         plain files
       dirs   ["doc", …]               plain folders (each may have its own page.jsonl)
       pages  Map { "kid" → "js" }     child pages, and which file makes each one
       page   true/false               is this log itself a page (line 1 is not a file line)? */
PageLog.Listing = class PageListing {

	files = [];
	dirs = [];
	pages = new Map();

	static from(entries){
		const latest = new Map();
		for (const { file, gone } of entries){
			if (typeof file !== "string") continue;
			gone ? latest.delete(key_of(file)) : latest.set(key_of(file), file);
		}

		const listing = new this();
		listing.page = !!entries[0] && typeof entries[0].file !== "string";   // line 1 builds a page; a listing-only log starts with a file line
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
