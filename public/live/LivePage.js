import Page from "/framework/core/Page/Page.class.js";
import View, { div, span, a, h1, h4, select, option, icon, code } from "/framework/core/View/View.js";
import Item from "/framework/core/Item/Item.js";
import List from "/framework/core/List/List.js";
import DefaultView from "/framework/ux/Content/Object/DefaultView.js";
import "/framework/core/Page/parts/kinds.js";   // part-card, part-text, part-heading, part-link… as their real classes
import PageLink from "/framework/core/Page/parts/PageLink.js";
import LiveChecklist from "./LiveChecklist.js";
import LiveLight from "./LiveLight.js";
import LiveButton from "./LiveButton.js";
import LiveCode from "./LiveCode.js";
import LiveScreen from "./LiveScreen.js";
import LiveContent, { LiveScreens } from "./LiveContent.js";
import { PART_TYPES } from "/framework/core/Page/parts/kinds.js";

View.stylesheet(import.meta, "LivePage.css");

// Markdown draws only in a browser; in node (the item tool builds this class to replay page.jsonl) nothing is drawn.
const { default: md } = typeof document === "undefined" ? { default: () => {} } : await import("/framework/ext/markdown/md.js");

/* /live/ — the screen voice Claude drives with the item tool: item({path: "/live/", delta}). readme.md lists every delta.
 * The page IS page.jsonl: line 1 names this class, every later line is one set(). A data key is state (header, footer),
 * a key naming a method calls it (flash, alert, save, restore). The cards are the page's own `content` List.
 * What can be tapped is a card (a `part-link` to a sub-page: a LivePage of its own, made with pages.add); everything
 * else draws with no frame. A sub-page or a saved screen shows a breadcrumb instead of the version dropdown. */
export default class LivePage extends Page {

	// The content types with a View of their own (each registered under its type: live-checklist, live-light, live-button).
	static kinds = new Set([LiveChecklist, LiveLight, LiveButton]);

	// The version dropdown on /live/ itself: the newest first, and the default.
	static versions = [
		{ label: "v2", url: "/live/" },
		{ label: "v1", url: "/live/v1/" },
	];

	// How long the header light stays on after voice (any writer but the owner) wrote a line.
	static voice_ms = 30000;

	// content is a LiveContent: a removed card (or a clear) moves into `removed`, never gone (LiveContent.js).
	static Content = LiveContent;

	constructor(...args){
		super(...args);
		this.screens ??= new LiveScreens({ owner: this, name: "screens" });   // saved screens (LiveScreen), opened at /live/<name>/
		this.removed ??= new List({ owner: this, name: "removed" });   // what left content or screens, opened at /live/removed/
	}

	// ════ METHODS A DELTA CAN CALL ═══
	// An effect runs only for a line that arrives while the page is open; a reload replays the log without re-running it.
	// The item tool's help lists exactly these (plus Page's); a new one here is added to this list or it stays hidden.
	static callable = {
		...Page.callable,
		flash: "{\"flash\": {}} or {\"flash\": \"red\"}: the screen blinks once.",
		alert: "{\"alert\": \"Text\"}: a banner at the top for a few seconds.",
		save: "{\"save\": {name, title?}} or {\"save\": \"name\"}: keep the cards on screen as /live/<name>/, then clear.",
		restore: "{\"restore\": \"name\"}: put a saved screen's cards back (the current ones move to removed); {\"restore\": \"<id>\"} brings back one removed card or screen.",
	};
	static data_keys = ["header", "footer"];   // {"header": "a line under the title"}, {"footer": "…"}; null hides it
	static card_types = [...Page.card_types, "live-light", "live-checklist", "live-button", "live-code"];   // the help prints each one's `static example`

	// {"flash": {}} or {"flash": "red"} — the screen blinks once.
	flash(color){
		if (this.replaying()) return;
		const el = this.on_screen()?.view?.el;
		if (!el) return;
		el.style.setProperty("--live-flash", typeof color === "string" ? color : "var(--prime)");
		el.classList.remove("is-flashing");
		void el.offsetWidth;   // restart the animation
		el.classList.add("is-flashing");
	}

	// {"alert": "Text"} — a banner at the top for a few seconds (never window.alert: it would block the page).
	alert(text){
		const $alerts = this.on_screen()?.$alerts;
		if (this.replaying() || !$alerts) return;
		const $note = div.c("live-alert", String(text ?? ""));
		$alerts.el.append($note.el);
		setTimeout(() => $note.ac("is-gone"), 4000);
		setTimeout(() => $note.el.remove(), 4600);
	}

	// {"save": {"name": "plan", "title": "The plan"}} (or {"save": "plan"}, or {"save": {}} for "screen-N") — keep the cards on
	// screen as a saved screen at /live/<name>/, then clear. Saving under a name that exists replaces that screen.
	save(spec){
		const s = typeof spec === "string" ? { name: spec } : spec ?? {};
		const name = String(s.name ?? `screen-${this.screens.length + 1}`);
		const cards = JSON.parse(JSON.stringify(this.content.toJSON()));
		if (this.screens.find(name)) this.screens.remove(name);
		this.screens.add({ type: "live-screen", id: name, data: { title: s.title ?? name }, content: cards });
		this.saving = true;   // the cards went into the screen, so the clear does not also keep them in `removed`
		try { this.content.set({ clear: true }); } finally { this.saving = false; }
	}

	// {"restore": "plan"} — put a saved screen's cards back on /live/ (what is on screen now moves to `removed`).
	// {"restore": "<id>"} for a card or screen in `removed` puts that one back where it was (content or screens).
	restore(name){
		const screen = this.screens.find(String(name));
		if (!screen){
			const gone = this.removed.find(String(name));
			if (gone) (gone instanceof LiveScreen ? this.screens : this.content).move(gone, { from: this.removed, after: (gone instanceof LiveScreen ? this.screens : this.content).items.at(-1)?.id ?? null });
			return;
		}
		const cards = JSON.parse(JSON.stringify(screen.content.toJSON()));
		this.content.set({ clear: true });
		cards.forEach(card => this.content.add(card));
	}

	// May a button card run `method`? Only a method this page class (or a subclass) defines itself, never one of Page's.
	can_press(method){
		for (let C = this.constructor; C && C !== Page; C = Object.getPrototypeOf(C))
			if (typeof method === "string" && Object.hasOwn(C.prototype, method) && typeof C.prototype[method] === "function")
				return !/^(constructor|render|route|listen|replaying|replay_line|caught|tab|on_screen|can_press|voice_at|paint_voice|link_url)$/.test(method);   // the machinery is not a button
		return false;
	}

	// Where an effect shows: this page if it is on screen, else the live page that is (a card opened as a page is drawn by
	// another LivePage instance, but its buttons still belong to this one).
	on_screen(){ return [this, LivePage.shown].find(p => p?.view?.el?.isConnected && p.view.el.getClientRects().length); }

	// True while a line is being replayed (opening the page), false for a line another writer just saved.
	replaying(){ return Item.source === "replay"; }

	// ════ NOTHING BLANKS THE PAGE ═══
	// One bad line (on load or arriving live) is skipped: the page draws the rest and an error card at the top says so.
	replay_line(line){
		try { return super.replay_line(line); }
		catch (error){ this.caught(error, { where: "line", line }); }
	}

	// Every error the page caught (a line, a card, a part of the page): kept for its error card (LivePage.Errors), and one
	// line in the shared error log, ext/ErrorLog: /framework/ai/errors/<date>.jsonl (one file a day), and /live/failures.jsonl,
	// which the agent owning /live/ follows, so it hears of it. In node (the item tool replaying a page) only the console.
	caught(error, { where, line, item } = {}){
		const entry = { where, message: String(error?.message ?? error), id: item?.id, line: line === undefined ? undefined : JSON.stringify(line).slice(0, 2000) };
		console.error(`LivePage ${this.url ?? ""}: a ${where} failed and was skipped —`, line ?? item?.id ?? "", error);
		if (!this.caught_errors) Object.defineProperty(this, "caught_errors", { value: [], enumerable: false });
		this.caught_errors.push(entry);
		this.emit?.("caught", entry);
		if (typeof document !== "undefined") import("/framework/ext/ErrorLog/ErrorLog.js")
			.then(({ default: ErrorLog }) => ErrorLog.report(error, { module: "/live/", kind: "error", where: `LivePage ${where}`, url: this.url, id: entry.id, line: entry.line }))
			.catch(() => {});
	}

	// Draw with fn; if it throws, the captor stack is put back as it was (a View that threw mid-render leaves its own on
	// it), the error is caught (above), and a small error card stands where the part would be. `capture: false` views only:
	// the caller places what this returns.
	static safely(page, where, fn, item){
		const depth = View.previous_captors.length, captor = View.captor;
		try { return fn(); }
		catch (error){
			while (View.previous_captors.length > depth) View.restore_captor();
			View.captor = captor;
			page.caught(error, { where, item });
			return new this.Broken({ item, where, error, capture: false });
		}
	}

	// {"tab": {"name": "x", "tab": true}} is a pick (picks_of reads it from the raw lines): the folder x/ stays its own
	// LivePage. Core's tab() would build a plain Page from a line with a `title` and turn on ext/tabs, which blanked
	// /live/plan/ (2026-11-07); here the name is only marked as a child to load.
	tab(obj){
		const name = obj?.name;
		if (typeof name === "string" && !this.children.has(name)) this.children.set(name, null);
	}

	// ════ EVERYTHING ON IT HAS A URL ═══
	// /live/<screen>/ is a saved screen, /live/removed/ what was removed, /live/<id>/ any card on screen opened by itself
	// (a Task, a checklist…; also inside a screen: /live/<screen>/<id>/). A sub-page folder wins over all of them.
	// Every page under /live/ is a LivePage (its header, breadcrumb and settings): a sub-page whose page.jsonl names a plain
	// Page, or no class, is built as a LivePage; a LivePage subclass (DesignPage) stays itself. A page.js page is its own.
	static async log_class(module, url){
		const Class = await super.log_class(module, url);
		if (Class.prototype instanceof LivePage) LivePage.srcs.set(Class, new URL(module, location.origin + url).pathname);
		return Class === LivePage || Class.prototype instanceof LivePage ? Class : LivePage;
	}

	// The file a page class lives in (settings shows it first): LivePage's own, or what a page.jsonl's line 1 named.
	static srcs = new Map([[LivePage, new URL(import.meta.url).pathname]]);
	static src_of(Class){
		for (let C = Class; C && C !== Page; C = Object.getPrototypeOf(C)) if (LivePage.srcs.has(C)) return LivePage.srcs.get(C);
		return null;
	}

	// The folder this page's data lives in: its own; for a card or a saved screen the page's it is inside; for a
	// settings page the folder of the page it is the settings of.
	get folder(){
		if (this.settings_of) return this.settings_of.folder;
		return this.focus || this.screen ? (this.parent?.url ?? this.url.replace(/[^/]+\/$/, "")) : this.url;
	}
	async child(name, levels){
		if (!this.children.get(name)){   // not built yet (undefined), or named by a {"file": "x/page.jsonl"} line (null)
			const kind = this.child_kinds?.get(name) ?? (await Page.listing(this.url).catch(() => null))?.pages.get(name);
			if (kind === "jsonl" && !LivePage.tab_skip.has(this.url + name + "/")){   // the old views keep their own classes
				const page = await LivePage.jsonl(this.url + name + "/");   // LivePage as the host, so log_class above decides
				if (page) return this.add(name, page).load_all_children(levels);
			}
		}
		return super.child(name, levels);
	}

	route(name){
		// Under settings/ every name is a folder or a file of the page's own folder (LivePage.Files). A settings page has no
		// settings of its own: its gear is an X back to the page (LivePage.Head), so settings/settings/ is only a folder there.
		if (this.settings_of){
			return new this.constructor({ title: name, url: this.url + name + "/", settings_of: this.settings_of, at: (this.at ?? "") + name + "/" });
		}
		const page = super.route?.(name);
		if (page) return page;
		const url = this.url + name + "/";
		const screen = !this.screen && !this.focus && this.screens.find(name);
		if (screen) return new this.constructor({ title: screen.get("title") ?? name, url, screen });
		if (name === "settings" && !this.settings_of) return new this.constructor({ title: "Settings", url, settings_of: this });   // a folder or a screen named settings wins
		if (name === "removed" && !this.screen && !this.focus) return new this.constructor({ title: "Removed", url, screen: { content: this.removed } });
		const item = (this.focus ? this.focus.content : this.cards)?.find?.(name);   // a card on this page, or one inside the card opened here
		if (item && !(item instanceof PageLink)) return new this.constructor({ title: item.get("title") ?? name, url, focus: item });
	}

	// The cards this view draws: a saved screen's, the removed ones, the page's own, or (a card opened as a page) the card's own.
	get cards(){ return this.focus ? this.focus.content : this.screen?.content ?? this.content; }

	// /live/ itself, or a page under it (a sub-page, a saved screen, a card opened by itself)?
	get is_top(){ return !(this.parent instanceof LivePage) && !this.screen && !this.focus; }

	// ════ THE HEADER LIGHT: VOICE IS DRIVING ═══
	// On while a writer other than the owner wrote a line in the last 30 s; the delay of the last line beside it.
	listen(){
		const agent = line => line?.by && line.by !== "owner" ? Date.parse(line.ts) : NaN;
		for (const line of this.jsonl_lines ?? []) this.voice_at(agent(line));
		this.on("line", line => {
			this.voice_at(agent(line));
			if (Item.source !== "remote" || !line?.ts) return;
			const ms = Date.now() - Date.parse(line.ts);
			View.frame(() => { this.$ms?.text(`${ms} ms`).attr("title", "From the item tool's write to this screen"); });
		});
	}

	voice_at(t){
		if (!(t > (this.last_voice ?? 0))) return;
		this.last_voice = t;
		this.paint_voice();
	}

	paint_voice(){
		if (!this.$dot) return;
		const left = (this.last_voice ?? 0) + this.constructor.voice_ms - Date.now(), on = left > 0;
		LiveLight.paint(this.$dot, { on, color: "#22c55e" }).attr("title", on ? "Voice is driving this screen" : "Voice is quiet");
		clearTimeout(this.voice_off);
		if (on) this.voice_off = setTimeout(() => this.paint_voice(), left + 50);   // one timer to turn it off, no polling
	}

	// ════ DRAWING ═══
	// In the house View style (core/View/readme.md): each part is a class with a render(), and its CSS class comes from its
	// name (LiveHeadView draws div.live-head). They are static parts, so a subclass of LivePage can swap one
	// (this.constructor.Card). Every title and text goes through markdown and mentions, scrubbed (md(text, { safe: true })):
	// "@Page" is an icon link, and no script runs.
	render(){
		LivePage.shown = this;
		if (this.view) return this.view;
		const P = this.constructor;
		// Each part is drawn on its own (safely): one that throws becomes a small error card, and the rest still draw.
		const part = (where, Part, opts) => { const v = P.safely(this, where, () => new Part({ page: this, ...opts, capture: false })); View.captor?.append(v); };
		this.view = div.c("page live-page", () => {
			this.$alerts = div.c("live-alerts");
			part("header", P.Head);
			part("header", P.Md, { item: this, key: "header", classes: "live-sub" });   // below the sticky header, so the header stays one size
			new P.Errors({ page: this });
			if (this.settings_of) return void part("settings", P.Settings, { of: this.settings_of, at: this.at });
			if (this.focus) part("card", P.Focus, { item: this.focus });
			part("cards", P.Main, { list: this.cards });
			part("pages", P.Pages);
			part("footer", P.Foot);
		});
		this.listen();
		this.paint_voice();
		Page.views.set(this.view.el, this);
		return this.view;
	}

	// A link's path ("./plan/" or "plan/") against the url of the page its card was written on: this page, or for a saved
	// screen the page it was saved from (its cards still point where they pointed on /live/).
	link_url(path){
		const base = (this.screen ? this.parent?.url : this.url) ?? "/live/";
		return new URL(String(path ?? ""), location.origin + base).pathname;
	}

	// ════ TITLES AND TABS ═══
	// What a page says about itself, read from its own file (small): { title, cls, tab, js }. The title is the last `title` in
	// its page.jsonl, else its page.js's export, else its folder name: one per url per load, so its link card, its tab and
	// its h1 always agree. `cls` is the class its line 1 names, `tab` a `{"tab": false}` line (never a tab), `js` a page.js page.
	static metas = new Map();
	static meta_of(url){
		return this.metas.get(url) ?? this.metas.set(url, (async () => {
			const name = url.split("/").filter(Boolean).at(-1), meta = { title: name };
			const listing = await Page.listing(url.replace(/[^/]+\/$/, "")).catch(() => null);
			if (!listing){ this.metas.delete(url); return meta; }   // a failed read is not kept: the next ask tries again
			const kind = listing.pages.get(name);   // "jsonl", "js", or not a page
			const res = kind === "jsonl" ? await fetch(url + "page.jsonl").catch(() => null) : null;
			if (res?.ok){
				(await res.text()).split("\n").forEach((line, i) => { try {
					const o = JSON.parse(line);
					if (typeof o?.title === "string") meta.title = o.title;
					if (i === 0 && typeof o?.class === "string") meta.cls = o.class;
					if (typeof o?.tab === "boolean") meta.tab = o.tab;
					if (typeof o?.icon === "string") meta.icon = o.icon;
				} catch {} });
				return meta;
			}
			const js = kind === "js" ? await import(url + "page.js").catch(() => null) : null;
			const own = js?.default?.icon;
			return { title: js?.default?.title ?? name, js: kind === "js", ...typeof own === "string" && { icon: own } };
		})()).get(url);
	}
	static title_of(url){ return this.meta_of(url).then(m => m.title); }

	// A page's own pages: { tabs, cards, screens }, each [{url, title, icon}]. A page is EITHER a tab OR a link card, never both.
	// A TAB is a permanent core section of this page, one that becomes familiar: a sub-page says so itself with a
	// {"tab": true} line, and it must draw as this page's content (a plain LivePage, not a page.js or a DesignPage).
	// Switching tabs keeps the same row and the same h1 (the parent's). Everything else (plans, demos, labs, saved
	// screens) is a link card under the content (LivePage.Pages), except one the content already links to. More than
	// tab_max tabs are a list, not a row: then every page is a card.
	// The old version's views (/live/sessions/, /live/archive/, /live/v1/) are neither: the footer of /live/ links them.
	// The parent's choices, {"tab": {"name": "next", "tab": true}}: name → true or false, the last line winning.
	static picks_of(lines){
		const picks = new Map();
		for (const o of lines ?? []) if (typeof o?.tab?.name === "string" && typeof o.tab.tab === "boolean") picks.set(o.tab.name, o.tab.tab);
		return picks;
	}
	static tab_skip = new Set(["/live/sessions/", "/live/archive/", "/live/v1/"]);
	static tab_max = 5;
	static async pages_of(url, loaded){
		const listing = await Page.listing(url).catch(() => null);
		const folders = [...listing?.pages.keys() ?? []].map(name => url + name + "/").filter(u => !this.tab_skip.has(u));
		const plain = cls => !cls || /(^|\/)LivePage\.js$/.test(cls) || /\/core\/Page\/Page\.class\.js$/.test(cls);   // drawn as a LivePage
		const picks = this.picks_of(loaded?.jsonl_lines);   // the parent's own {"tab": {"name": x, "tab": true}} lines win
		const rows = await Promise.all(folders.map(async u => {
			const m = await this.meta_of(u), name = u.slice(url.length, -1);
			return { url: u, title: m.title, icon: m.icon ?? this.stored.folder, tab: (picks.get(name) ?? m.tab) === true && !m.js && plain(m.cls) };
		}));
		const linked = new Set((loaded?.content?.items ?? []).filter(i => i instanceof PageLink).map(i => loaded.link_url(i.get("path"))));
		const shown = loaded && !loaded.screen && !loaded.focus && !loaded.settings_of;
		const screens = shown ? loaded.screens.items.map(s => ({ url: url + s.id + "/", title: s.get("title") ?? s.id, icon: s.get("icon") ?? this.stored.item })) : [];
		let tabs = rows.filter(r => r.tab), cards = rows.filter(r => !r.tab);
		if (tabs.length > this.tab_max) [tabs, cards] = [[], rows];
		const by_title = (x, y) => String(x.title).localeCompare(String(y.title));
		return { tabs, cards: cards.filter(c => !linked.has(c.url)).sort(by_title), screens: screens.filter(s => !linked.has(s.url)) };
	}

	// The tab row for a page: { owner, title, tabs: [{url, title}] }. Its own tabs when it has any, itself first; else, when
	// it is one of its parent's tabs, the parent's row (the same row, the parent's title). Else no row: a page with its
	// own tabs elsewhere is reached by a link card, and the breadcrumb takes it back.
	static async tabs_of(page){
		const own = page.focus || page.settings_of ? { tabs: [] } : await this.pages_of(page.url, page);
		if (own.tabs.length) return { owner: page.url, title: null, tabs: [{ url: page.url, title: page.title ?? "Live" }, ...own.tabs] };
		const up = page.url.replace(/[^/]+\/$/, "");
		if (page.is_top || page.focus || page.settings_of || !up.startsWith("/live/")) return { owner: null, tabs: [] };
		const parent = page.parent instanceof LivePage ? page.parent : null;
		const theirs = await this.pages_of(up, parent);
		if (!theirs.tabs.some(t => t.url === page.url)) return { owner: null, tabs: [] };
		const title = parent?.title ?? await this.title_of(up);
		return { owner: up, title, tabs: [{ url: up, title }, ...theirs.tabs] };
	}

	// A title, in markdown with mentions, kept in step with the item: new LivePage.Heading({ tag: "h4", item }).
	// `only` is the url when the whole title is one mention ("@Page"), so a card can become that thing's card.
	// `fix(t)` shows t instead from then on (a link card shows the title its page gives itself).
	static Heading = class LiveHeadingView extends View {
		render(){
			this.bind(this.item, this.key ?? "title", function(t){ this.show(this.fixed ?? t); });
		}
		fix(t){ if (t) this.show(this.fixed = t); }
		show(t){
			t ??= this.fallback;
			this.tc("is-empty", !t).empty();
			if (t) this.md(String(t), { safe: true });
			const one = this.el.children.length === 1 && this.el.firstElementChild.matches("a.mention") ? this.el.firstElementChild : null;
			this.only = one && one.textContent.trim() === this.el.textContent.trim() ? one.getAttribute("href") : null;
			this.on_text?.();
		}
	};

	// A text in markdown with mentions, kept in step with one key of an item: new LivePage.Md({ item, key: "text" }).
	static Md = class LiveMdView extends View {
		render(){
			this.bind(this.item, this.key, function(t){
				const has = t != null && t !== "";
				this.tc("is-empty", !has).empty(() => { if (has) md(String(t), { safe: true }); });
			});
		}
	};

	// A page's icon, the one in its header and on every card that links to it: what the page names itself
	// ({"icon": "⚡"} or a Material name like "folder"), else where it is stored (LivePage.stored), else the gear on settings.
	get icon_name(){
		const own = (this.focus ?? this).get?.("icon");
		if (own) return own;
		if (this.settings_of) return this.at ? this.constructor.stored.folder : "settings";
		return this.constructor.stored[this.focus || this.screen ? "item" : "folder"];
	}
	// The icon a page has when it names none says where it is stored: a small circle for an item inside its parent's
	// page.jsonl (a card, a saved screen), a file for a loose .jsonl file of its own, a folder for a folder of its own
	// (folder/page.jsonl). The voice light is a separate dot, by the gear.
	static stored = { item: "circle", file: "description", folder: "folder" };
	// The icon a page names for itself at a url (its page.jsonl or page.js), or null: a link card shows it, else `stored`.
	static icon_of(url){
		if (/\.jsonl\/?$/.test(url)) return Promise.resolve(null);
		return this.meta_of(url).then(m => m.icon ?? null);
	}
	// A link card's icon before its page answers: the link's own, else a file for a .jsonl url, else a folder.
	static link_icon(link, url){ return link.get("icon") ?? (/\.jsonl\/?$/.test(url) ? this.stored.file : this.stored.folder); }
	static icon(page, name){
		if (!page.$icon) return void this.glyph(null, name);
		this.glyph(page.$icon, name);
	}
	// Draw an icon name into $box (or, with no box, where we are): a Material name, else the text itself (an emoji).
	static glyph($box, name){
		const draw = () => name && (/^[a-z_]+$/.test(name) ? icon(name).ac(name === this.stored.item && "is-small") : span(name));
		if (!$box) return void draw();
		$box.empty(draw).tc("is-empty", !name);
	}

	// The header, sticky and under 100 px at any depth: the breadcrumb, the voice light and the settings icon, then the
	// page's icon, the title, the last line's delay and (on /live/) the version dropdown, then the tab row.
	static Head = class LiveHeadView extends View {
		render(){
			const { page } = this, P = page.constructor;
			div.c("live-head-top", () => {
				new P.Crumbs({ page });
				if (page.at) page.$raw = a.c("live-raw is-empty", "raw").attr("target", "_blank").attr("title", "The file itself, as text");   // a file's page shows it (LivePage.Files)
				page.$dot = span.c("live-dot");   // the voice light: small, by the gear, never beside the title (that is the page's own icon)
				// The gear opens settings; on a settings page (or a file under it) the same spot is an X back to the page.
				const back = page.settings_of?.url;
				if (back) a.c("live-gear is-close", () => icon("close")).href(back).attr("aria-label", "Close settings").attr("title", "Back to the page");
				else a.c("live-gear", () => icon("settings")).href(page.url + "settings/").attr("aria-label", "Settings: where this page comes from").attr("title", "Where this page comes from");
			});
			div.c("live-head-row", () => {
				page.$icon = span.c("live-icon", () => P.icon(page, page.icon_name));
				const $h1 = new P.Heading({ tag: "h1", item: page.focus ?? page, fallback: "Live", classes: "live-title" });
				P.tabs_of(page).then(({ title }) => title && $h1.fix(title)).catch(() => {});   // a tab keeps its parent's h1: the tab says which one
				page.$ms = span.c("live-ms");
				if (page.is_top) select.c("live-version", () => {
					P.versions.forEach(v => option(v.label).attr("value", v.url));
				}).attr("aria-label", "Version").on("change", e => { location.href = e.target.value; });
			});
			new P.Tabs({ page });
		}
	};

	// The one way to move between pages: one row of underlined tabs (ext/tabs' look). A page with pages under it shows them,
	// its own content first; a page with none shows its siblings, itself selected. The row scrolls sideways and fades at
	// an edge that has more. Every label is the page's own title (title_of), the same as its h1 and its preview card.
	static Tabs = class LiveTabsView extends View {
		render(){
			const { page } = this, P = page.constructor;
			this.ac("tabs");
			const $bar = div.c("tab-bar"), $fade = () => {
				const el = $bar.el, more = el.scrollWidth - el.clientWidth;
				this.tc("more-left", el.scrollLeft > 2).tc("more-right", el.scrollLeft < more - 2);
			};
			$bar.on("scroll", $fade);
			const seen = new ResizeObserver($fade); seen.observe($bar.el);
			this.tc("is-empty", true);
			const draw = () => P.tabs_of(page).then(({ owner, tabs }) => {
				this.tc("is-empty", tabs.length < 2);
				if (tabs.length < 2) return;
				$bar.empty(() => tabs.forEach(tab => a.c("tab", tab.title).href(tab.url).ac(tab.url === owner && "tab-default")));
				mark();
			}).catch(() => {});
			// The selected tab is the one the url is in (the longest match), so a plain page opened under this header lights its tab too.
			const mark = () => {
				const here = globalThis.location?.pathname ?? page.url, links = [...$bar.el.querySelectorAll("a.tab")];
				const best = links.filter(l => here.startsWith(l.pathname)).sort((x, y) => y.pathname.length - x.pathname.length)[0];
				links.forEach(l => l === best ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current"));
				if (best && (best.offsetLeft + best.offsetWidth > $bar.el.scrollLeft + $bar.el.clientWidth || best.offsetLeft < $bar.el.scrollLeft)) $bar.el.scrollLeft = best.offsetLeft - 24;   // in view (never scrollIntoView: it would move the page too)
				$fade();
			};
			LivePage.on_url(this, mark);
			const top = page.is_top ? page : page.parent instanceof LivePage ? page.parent : null;
			// The row lives as long as its page is shown: the first change heard after it left lets go of everything.
			const picked = line => line?.tab !== undefined && heard();   // a {"tab": …} line changes the row
			const heard = () => queueMicrotask(() => {
				if (this.el.isConnected) return draw();
				seen.disconnect();
				["add", "remove"].forEach(verb => top.screens.off?.(verb, heard));
				top.off?.("line", picked);
			});
			if (top?.screens?.on) ["add", "remove"].forEach(verb => top.screens.on(verb, heard));
			top?.on?.("line", picked);
			draw();
		}
	};

	// Where this page sits, every step a link: live / design / foo. It is the address bar a phone hides, so it is the url
	// itself (location.pathname, decoded), word for word; every tab is a page, so a tab switch redraws it with the new url.
	static Crumbs = class LiveCrumbsView extends View {
		render(){
			this.attr("aria-label", "Where you are");
			const draw = () => {
				const path = globalThis.location?.pathname ?? this.page.url ?? "/live/";
				if (this.attr("data-path") === path) return;
				const parts = path.split("/").filter(Boolean);
				this.attr("data-path", path).empty(() => parts.forEach((name, i) => {
					if (i) span.c("live-crumb-sep", "/");
					let label = name; try { label = decodeURIComponent(name); } catch {}
					const $a = a.c("live-crumb", label).href("/" + parts.slice(0, i + 1).join("/") + "/");
					if (i === parts.length - 1) $a.attr("aria-current", "page");
				}));
			};
			draw();
			LivePage.on_url(this, draw);
		}
	};

	// Run fn after every change of the url (a link, back, forward) while the view is on the page; the first change after it
	// left lets go. The Navigation API hears pushState; popstate covers a browser without it (back and forward only).
	static on_url(view, fn){
		const heard = () => view.el.isConnected ? fn() : off();
		const off = () => { globalThis.navigation?.removeEventListener("currententrychange", heard); globalThis.removeEventListener?.("popstate", heard); };
		globalThis.navigation?.addEventListener("currententrychange", heard);
		globalThis.addEventListener?.("popstate", heard);
	}

	// The card this page is (a card opened by itself): its text (the title is the page's), or a class's own View.
	static Focus = class LiveFocusView extends View {
		render(){
			const { item } = this, Own = item.constructor.View;
			this.attr("data-kind", item.constructor.name);
			if (Item.foreign(item)) return;   // a registered class that is not an Item ({"type":"View"}) draws itself
			if (Own && Own !== Item.View && !PART_TYPES.includes(item.wire?.())) return void new Own({ item, subject: item });
			new this.page.constructor.Md({ item, key: "text", classes: "live-sub" });
		}
	};

	// The cards, kept in step by DefaultView.place (only the changed ones redraw): a Card for what opens a page, a Block
	// for everything else.
	static Main = class LiveMainView extends View {
		render(){
			const { page, list } = this, P = page.constructor, drawn = new Map();
			const card = item => item instanceof PageLink || item.wire?.() === "part-card";
			const draw = () => {
				const members = list.items.filter(i => !i.transient);   // a transient item is the page's own code, never a card
				DefaultView.place(this.el, members, drawn, item => P.safely(page, "card", () => new (card(item) ? P.Card : P.Block)({ page, item, capture: false }), item));   // one card that throws is an error card in its place
				this.tc("is-empty", !members.length);
			};
			["add", "remove", "move", "order", "clear"].forEach(verb => list.on(verb, draw));
			draw();
		}
	};

	// A part or a card that threw while drawing (LivePage.safely): one small line where it would be. The error is logged.
	static Broken = class LiveBrokenView extends View {
		render(){
			const { item, where, error } = this;
			this.attr("role", "alert").attr("title", String(error?.stack ?? error));
			if (item?.id) this.attr("id", item.id);
			icon("error_outline");
			span(`${item?.id ? `Card “${item.id}”` : `The ${where ?? "part"}`} could not be drawn: ${error?.message ?? error}`);
		}
	};

	// Lines the page could not apply (replay_line): one small card at the top, kept in step as more arrive.
	static Errors = class LiveErrorsView extends View {
		render(){
			const { page } = this;
			const draw = () => {
				const lines = (page.caught_errors ?? []).filter(e => e.where === "line");
				this.tc("is-empty", !lines.length).empty(() => {
					if (!lines.length) return;
					icon("error_outline");
					span(`${lines.length === 1 ? "One line" : `${lines.length} lines`} in this page's file could not be applied and ${lines.length === 1 ? "was" : "were"} skipped: ${lines.at(-1).message}`);
				});
			};
			page.on?.("caught", () => queueMicrotask(() => this.el.isConnected && draw()));
			draw();
		}
	};

	// What cannot be tapped draws with no frame: a class with its own View (a checklist, a Task, a button) draws with it;
	// a text or a heading draws its title and text.
	static Block = class LiveBlockView extends View {
		render(){
			const { page, item } = this, P = page.constructor, Own = item.constructor.View;
			this.attr("id", item.id).attr("data-kind", item.constructor.name);
			if (Item.foreign(item)) return;   // a registered class that is not an Item ({"type":"View"}) draws itself
			if (P.kinds.has(item.constructor) || (Own && Own !== Item.View && !PART_TYPES.includes(item.wire?.())))
				return void new Own({ item, subject: item });
			new P.Heading({ tag: "h4", item, classes: "live-card-title" });
			new P.Md({ item, key: "text", classes: "live-card-text" });
		}
	};

	// A card (part-card) or a link to a sub-page: framed, and the whole card is a link (the chevron, stretched over it).
	// A card opens /live/<id>/ (every card is a page, LiveContent.js), a link its folder, and a card whose title is one
	// mention ("@Page") opens that thing. Its buttons sit inside it, in one row (Children); a mention or a button
	// inside stays tappable on its own.
	static Card = class LiveCardView extends View {
		render(){
			const { page, item } = this, P = page.constructor;
			const own = item instanceof PageLink ? page.link_url(item.get("path")) : page.url + item.id + "/";
			let $title, $icon;
			const go = () => {
				this.tc("live-entity", !!$title?.only);
				$icon?.tc("is-hidden", !!$title?.only);   // "@Page" brings that thing's own icon in its mention
				this.$go?.attr("href", $title?.only ?? own).attr("aria-label", String(item.get("title") ?? item.id));
			};
			this.attr("id", item.id).attr("data-kind", item.constructor.name);
			div.c("live-card-body", () => {
				div.c("live-card-head", () => {
					// The icon its page's header shows (LivePage.icon_name): a link asks the page, a card is an item stored here.
					$icon = span.c("live-icon live-card-icon");
					if (item instanceof PageLink){
						const fallback = P.link_icon(item, own);
						P.glyph($icon, fallback);
						if (own.startsWith("/live/")) P.icon_of(own).then(n => P.glyph($icon, n ?? fallback)).catch(() => {});   // the page's own icon wins: the same as its header
					} else this.bind(item, "icon", n => P.glyph($icon, n ?? P.stored.item));
					$title = new P.Heading({ tag: "h4", item, classes: "live-card-title", on_text: go });
				});
				if (item instanceof PageLink && own.startsWith("/live/")) P.title_of(own).then(t => $title.fix(t)).catch(() => {});
				new P.Md({ item, key: "text", classes: "live-card-text" });
				if (!(item instanceof PageLink)) new P.Children({ list: item.content });
			});
			this.$go = a.c("live-card-go", "›");
			go();
		}
	};

	// What a card holds, shown on the card: its buttons in one row, and "3 inside" for the rest (they show on its page).
	static Children = class LiveChildrenView extends View {
		render(){
			const { list } = this;
			if (!list?.on) return;
			const $row = div.c("live-buttons"), $n = span.c("live-inside");
			const draw = () => {
				const kids = list.items.filter(x => !x.transient), buttons = kids.filter(x => x instanceof LiveButton), rest = kids.length - buttons.length;
				$row.tc("is-empty", !buttons.length).empty(() => buttons.forEach(b => new LiveButton.View({ item: b, subject: b })));
				$n.tc("is-empty", !rest).text(`${rest} inside`);
				this.tc("is-empty", !kids.length);
			};
			["add", "remove", "move", "order", "clear"].forEach(verb => list.on(verb, draw));
			draw();
		}
	};

	// /<page>/settings/: first the class file that draws the page (LivePage.js, a tap opens its code), then where a card
	// or a saved screen sits, then the page's folder: its files, page.jsonl among them (LivePage.Files).
	static Settings = class LiveSettingsView extends View {
		render(){
			const { of, page } = this, folder = page.folder;
			if (this.at) return void new LivePage.Files({ page, folder, at: this.at });   // one folder or file inside it
			const src = LivePage.src_of(of.constructor);
			if (src){
				const dir = src.replace(/[^/]+$/, ""), name = src.split("/").at(-1);
				a.c("live-files-row live-settings-class", () => { icon("code"); span(name); span.c("live-settings-note", "draws this page"); }).href(dir + "settings/" + name + "/");
			}
			const row = (label, text) => div.c("live-settings-row", () => { span.c("live-settings-label", label); span.c("live-settings-value", text); });
			if (of.focus) row("Card", `id ${of.focus.id}, saved inside ${folder}page.jsonl`);
			else if (of.screen) row("Saved screen", `saved inside ${folder}page.jsonl`);
			new LivePage.Files({ page, folder, at: "" });
			h4.c("live-settings-files-title", "What it is made of");
			div.c("live-settings-inspect").append(import("/framework/ext/Inspect/ItemInspector.js").then(({ default: ItemInspector }) => new ItemInspector({ item: of })));
			h4.c("live-settings-files-title", "How it got here");
			div.c("live-settings-inspect").append(import("/framework/ext/Inspect/DeltaHistory.js").then(({ default: DeltaHistory }) => new DeltaHistory({ url: folder, Class: of.constructor })));
		}
	};

	// The folder's files, one list top to bottom: folders first, then files. Every row is a page under settings/: a folder
	// shows its own list (<page>/settings/doc/), a file its text, highlighted and wrapped to the screen (<page>/settings/a.js/).
	// `folder` is the page's folder url, `at` the path inside it ("" or "doc/" or "doc/a.md/").
	static Files = class LiveFilesView extends View {
		render(){
			const { page, folder, at } = this, path = folder + at;
			const name = at.split("/").filter(Boolean).at(-1), up = folder + at.replace(/[^/]+\/$/, "");
			this.$box = div.c("live-files-body", () => span.c("live-files-said", "Loading…"));
			(async () => {
				const listing = name ? await Page.listing(up).catch(() => null) : null;
				if (name && (listing?.files.includes(name) || listing?.log === name)) return this.file(path.slice(0, -1));
				const here = await Page.listing(path).catch(() => null);
				this.el.prepend(new View({ tag: "h4", capture: false }).ac("live-files-title").text(path.replace(/\/$/, "")).el);   // the folder's own path, "/live" (after an await: no captured factory)
				this.$box.empty(() => {
					if (!here) return void span.c("live-files-said", `No file list for ${path} (a folder with no page and no files.jsonl).`);
					const dirs = [...new Set([...here.pages.keys(), ...here.dirs.map(d => d.replace(/\/.*$/, ""))])].sort();
					const files = [...new Set([...here.files, ...here.log ? [here.log] : []])].sort();   // the log (page.jsonl or files.jsonl) is a file here too
					if (!dirs.length && !files.length) span.c("live-files-said", "Nothing in this folder yet.");
					dirs.forEach(d => a.c("live-files-row is-dir", () => { icon("folder"); span(d); }).href(page.url + d + "/"));
					files.forEach(f => a.c("live-files-row", () => { icon("description"); span(f); }).href(page.url + f + "/"));
				});
			})().catch(e => this.$box.empty(() => span.c("live-files-said", "Could not read " + path + ": " + e.message)));
		}
		// One file's text on its own page, the full width: the site's highlighter (ext/highlight, code.file), no line numbers
		// (on a phone the width matters more), and the raw file behind the header's "raw" link.
		async file(url){
			await import("/framework/ext/highlight/highlight.js");   // adds code.file to View's `code`
			const block = await code.file(import.meta, url, { lang: /\.jsonl$/.test(url) ? "json" : undefined });
			this.ac("is-file");
			LivePage.icon(this.page, "description");
			this.$box.empty().el.append(block.el);
			this.page.$raw?.href(url + "?raw").tc("is-empty", false);
		}
	};

	// `footer` (a line of text) when set; on /live/ and its sub-pages, the removed cards; on /live/ itself, the old views.
	// The pages that are somewhere else (LivePage.pages_of): a link card each, under the content, in two groups: this
	// page's pages, then its saved screens. Drawn by code from the folder and the screens, never written into page.jsonl.
	static Pages = class LivePagesView extends View {
		render(){
			const { page } = this, P = page.constructor;
			const group = (label, list) => list.length && div.c("live-pages-group", () => {
				h4.c("live-pages-label", label);
				list.forEach(c => div.c("live-card live-page-card", () => {
					div.c("live-card-body", () => div.c("live-card-head", () => {
						span.c("live-icon live-card-icon", () => P.glyph(null, c.icon));
						h4.c("live-card-title", c.title);
					}));
					a.c("live-card-go", "›").href(c.url).attr("aria-label", c.title);
				}));
			});
			const draw = () => P.pages_of(page.url, page).then(({ cards, screens }) => {
				this.tc("is-empty", !cards.length && !screens.length).empty(() => { group("Pages", cards); group("Saved screens", screens); });
			}).catch(() => {});
			this.tc("is-empty", true);
			if (page.screen || page.focus || page.settings_of) return;
			const picked = line => (line?.tab !== undefined || line?.content) && heard();   // a tab choice or a new link card
			const heard = () => queueMicrotask(() => {
				if (this.el.isConnected) return draw();
				["add", "remove"].forEach(v => page.screens.off?.(v, heard));
				page.off?.("line", picked);
			});
			["add", "remove"].forEach(v => page.screens.on?.(v, heard));
			page.on?.("line", picked);
			draw();
		}
	};

	static Foot = class LiveFootView extends View {
		render(){
			const { page } = this, P = page.constructor;
			new P.Md({ item: page, key: "footer", classes: "live-foot-text" });
			if (page.screen || page.focus) return;   // a saved screen or one opened card has no removed list of its own
			const $removed = a.c("live-foot-removed").href(page.url + "removed/");
			const count = () => $removed.tc("is-empty", !page.removed.length).text(`Removed cards (${page.removed.length})`).attr("title", "Every card taken off this screen (removed or cleared) is kept here; {\"restore\": \"<id>\"} brings one back");
			[page.content, page.screens].forEach(list => ["remove", "clear", "move"].forEach(verb => list.on(verb, () => queueMicrotask(count))));   // after the card reached removed
			count();
			if (page.is_top) div.c("live-foot-links", () => {
				a("Sessions").href("/live/sessions/");
				a("Archive").href("/live/archive/");
				a("v1").href("/live/v1/");
			});
		}
	};
}
