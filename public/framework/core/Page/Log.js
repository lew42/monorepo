import { View, div, p, code, table, thead, tbody, tr, th, td, is } from "../View/View.js";
import { page_settings } from "./settings/settings.js";

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

	// ════ SETTINGS — `{"settings": {"nav": false}}` ═══════════════════════════════
	// A page's own preferences. Today there is exactly one: `nav` — "does this page
	// show up in its parent's navigation?" (core/Page/settings/, loading-study.md
	// section 4). `this.settings` is never a PLAIN object: it starts life as this tiny
	// object with its own `set()`, so `set()` below routes a `settings` line into
	// `settable()`'s branch and MERGES — the same trap `file()` avoids by keeping its
	// own state off `this.file`: a plain object here would get SHADOWED (fully
	// replaced) by the second settings line instead of merged with the first.
	settings = { set(obj){ Object.assign(this, obj); } };

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
	   ⚠ On localhost it STREAMS: a line appended later calls set() and redraws. */
	static async jsonl(url){
		const reader = new this.Reader({ url: url + "page.jsonl" });
		await reader.open();

		const [first] = reader.entries;
		if (!first) { reader.close(); return null; }

		const Class = first.class ? await this.log_class(first.class, url) : this;
		const { class: _, ...line } = first;
		const page = new Class(line, { url, jsonl_url: reader.url });

		page.content ??= page.log_view;
		reader.attach(page);
		return page;
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

			// What changed() (below) needs to know: did a `tab`, `file` or `settings`
			// key arrive? Reset once the INITIAL read is done (attach(), below), so
			// this only ever holds keys from lines that streamed in AFTER that —
			// finding 5's whole point, live lines redrawing the nav with no reload.
			for (const key of Object.keys(entry)) (this._seen ??= new Set()).add(key);
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
		this._seen = null;   // only track keys from lines that arrive FROM HERE ON
	}

	// ⚠ 2026-09-29 fix round, finding 5: a `tab` or `file` line describes MY OWN
	// children's state, so I redraw MY OWN tab strip (nav_redraw(), ext/tabs/
	// tabs.js). A `settings` line is a page's preference about ITSELF, read by
	// its PARENT's tab strip — so that redraw is asked of `this.page.parent`
	// instead. Either way this replaces the drawer's old `location.reload()` —
	// the strip (and the rail, which nav_redraw() bubbles up to) now fixes
	// itself with no reload at all.
	changed(){
		this.page?.report_unknown();
		this.page?.log_redraw();

		const seen = this._seen; this._seen = null;
		if (seen?.has("tab") || seen?.has("file")) this.page?.nav_redraw?.();
		if (seen?.has("settings")) this.page?.parent?.nav_redraw?.();
	}

	reset(){
		this.count = 0;
		this.page?.log_forget();
		delete this.loaded;
		return this;
	}
};

export default PageLog;
