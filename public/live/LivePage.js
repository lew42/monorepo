import Page from "/framework/core/Page/Page.class.js";
import View, { div, span, a, h1, h4, select, option } from "/framework/core/View/View.js";
import Item from "/framework/core/Item/Item.js";
import List from "/framework/core/List/List.js";
import DefaultView from "/framework/ux/Content/Object/DefaultView.js";
import "/framework/core/Page/parts/kinds.js";   // part-card, part-text, part-heading, part-link… as their real classes
import PageLink from "/framework/core/Page/parts/PageLink.js";
import LiveChecklist from "./LiveChecklist.js";
import LiveLight from "./LiveLight.js";
import LiveButton from "./LiveButton.js";
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
 * else draws with no frame. A sub-page or a saved screen shows a back link instead of the version dropdown. */
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
	static card_types = [...Page.card_types, "live-light", "live-checklist", "live-button"];   // the help prints each one's `static example`

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
				return !/^(constructor|render|route|listen|replaying|on_screen|can_press|voice_at|paint_voice|link_url|draw_.*)$/.test(method);   // the machinery is not a button
		return false;
	}

	// Where an effect shows: this page if it is on screen, else the live page that is (a card opened as a page is drawn by
	// another LivePage instance, but its buttons still belong to this one).
	on_screen(){ return [this, LivePage.shown].find(p => p?.view?.el?.isConnected && p.view.el.getClientRects().length); }

	// True while a line is being replayed (opening the page), false for a line another writer just saved.
	replaying(){ return Item.source === "replay"; }

	// ════ EVERYTHING ON IT HAS A URL ═══
	// /live/<screen>/ is a saved screen, /live/removed/ what was removed, /live/<id>/ any card on screen opened by itself
	// (a Task, a checklist…; also inside a screen: /live/<screen>/<id>/). A sub-page folder wins over all of them.
	route(name){
		const page = super.route?.(name);
		if (page) return page;
		const url = this.url + name + "/";
		const screen = !this.screen && !this.focus && this.screens.find(name);
		if (screen) return new this.constructor({ title: screen.get("title") ?? name, url, screen });
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
	render(){
		LivePage.shown = this;
		if (this.view) return this.view;
		this.view = div.c("page live-page", () => {
			this.$alerts = div.c("live-alerts");
			this.draw_head();
			this.draw_cards();
			this.draw_foot();
		});
		this.listen();
		this.paint_voice();
		Page.views.set(this.view.el, this);
		return this.view;
	}

	// The voice light, the title, the last line's delay, and the version dropdown (on /live/) or a back link (below it).
	draw_head(){
		div.c("live-head", () => {
			if (!this.is_top) this.draw_crumbs();
			div.c("live-head-row", () => {
				this.$dot = span.c("live-dot");
				h1.c("live-title").bind(this.focus ?? this, "title", function(t){ this.text(t ?? "Live"); });
				this.$ms = span.c("live-ms");
				if (this.is_top) select.c("live-version", () => {
					this.constructor.versions.forEach(v => option(v.label).attr("value", v.url));
				}).attr("aria-label", "Version").on("change", e => { location.href = e.target.value; });
			});
			div.c("live-sub").bind(this, "header", function(text){ this.tc("is-empty", !text).empty(() => { if (text) md(String(text)); }); });
		});
	}

	// Where this page sits, every step a link: Live › design › foo (the folder names of the url, from /live/ down).
	draw_crumbs(){
		const parts = String(this.url ?? "/live/").split("/").filter(Boolean);
		div.c("live-crumbs", () => parts.forEach((name, i) => {
			if (i) span.c("live-crumb-sep", "›");
			const $a = a.c("live-crumb", i ? name : "Live").href("/" + parts.slice(0, i + 1).join("/") + "/");
			if (i === parts.length - 1) $a.attr("aria-current", "page");
		})).attr("aria-label", "Where you are");
	}

	// The cards, kept in step by DefaultView.place (only the changed ones redraw). A card opened as a page shows itself
	// first (its text, or its own View), then its own cards.
	draw_cards(){
		if (this.focus) this.draw_focus();
		const $main = div.c("live-main");
		const drawn = new Map(), list = this.cards;
		const draw = () => {
			const members = list.items.filter(i => !i.transient);   // a transient item is the page's own code, never a card
			DefaultView.place($main.el, members, drawn, item => this.draw_card(item));
			$main.tc("is-empty", !members.length);
		};
		["add", "remove", "move", "order", "clear"].forEach(verb => list.on(verb, draw));
		draw();
	}

	// The card this page is: its text (the title is the page's), or a class's own View (a Task, a checklist…).
	draw_focus(){
		const item = this.focus, Own = item.constructor.View;
		if (Own && Own !== Item.View && !PART_TYPES.includes(item.wire?.())) return div.c("live-block live-focus", () => { new Own({ item, subject: item }); }).attr("data-kind", item.constructor.name);
		div.c("live-sub live-focus").bind(item, "text", function(t){ this.tc("is-empty", !t).empty(() => { if (t) md(String(t)); }); });
	}

	// A card (part-card) and a link to a sub-page are framed and open a page: a card opens /live/<id>/ (every card is a
	// page, LiveContent.js), a link its folder. Text, headings and the classes with their own View draw with no frame. Title and text are bound, so an edit
	// ({"content": {"<id>": {"text": "…"}}}) redraws only that one. (Made while another view may capture; place() moves it.)
	draw_card(item){
		const kind = item.constructor.name;
		if (item instanceof PageLink) return a.c("live-card live-link", () => {
			div.c("live-link-body", () => this.draw_words(item));
			span.c("live-link-go", "›");
		}).attr("href", this.link_url(item.get("path"))).attr("id", item.id).attr("data-kind", kind);
		if (item.wire?.() === "part-card") return a.c("live-card live-link", () => {
			div.c("live-link-body", () => { this.draw_words(item); this.draw_inside(item); });
			span.c("live-link-go", "›");
		}).attr("href", this.url + item.id + "/").attr("id", item.id).attr("data-kind", kind);
		// A class with its own View (live-checklist, a Task…) draws with it; the part-* text cards draw as words, frameless.
		const Own = item.constructor.View;
		if (this.constructor.kinds.has(item.constructor) || (Own && Own !== Item.View && !PART_TYPES.includes(item.wire?.())))
			return div.c("live-block", () => { new Own({ item, subject: item }); }).attr("id", item.id).attr("data-kind", kind);
		return div.c("live-block", () => this.draw_words(item)).attr("id", item.id).attr("data-kind", kind);
	}

	// "3 inside" under a card that holds cards of its own.
	draw_inside(item){
		const list = item.content, $n = span.c("live-inside");
		if (!list?.on) return;
		const count = () => $n.tc("is-empty", !list.length).text(`${list.length} inside`);
		["add", "remove", "clear"].forEach(verb => list.on(verb, count));
		count();
	}

	draw_words(item){
		h4.c("live-card-title").bind(item, "title", function(t){ this.tc("is-empty", !t).text(t ?? ""); });
		div.c("live-card-text").bind(item, "text", function(t){ this.empty(() => { if (t) md(String(t)); }); });
	}

	// A link's path ("./plan/" or "plan/") against the url of the page its card was written on: this page, or for a saved
	// screen the page it was saved from (its cards still point where they pointed on /live/).
	link_url(path){
		const base = (this.screen ? this.parent?.url : this.url) ?? "/live/";
		return new URL(String(path ?? ""), location.origin + base).pathname;
	}

	// `footer` (a line of text) when set; on /live/ and its sub-pages, the saved screens and the removed cards; on /live/ itself, the old views.
	draw_foot(){
		div.c("live-foot", () => {
			div.c("live-foot-text").bind(this, "footer", function(text){ this.tc("is-empty", !text).empty(() => { if (text) md(String(text)); }); });
			if (this.screen || this.focus) return;   // a saved screen or one opened card has no screens of its own
			const $pages = div.c("live-foot-pages is-empty");
			Page.listing(this.url).then(listing => {   // every child folder, so no page under /live/ is ever unlinked
				const names = [...listing?.pages.keys() ?? []].sort();
				$pages.tc("is-empty", !names.length).empty(() => { span("Pages here:"); names.forEach(n => { a(n).href(this.url + n + "/"); }); });
			}).catch(() => {});
			const $screens = div.c("live-foot-screens");
			const draw = () => $screens.tc("is-empty", !this.screens.length).empty(() => {
				span("Saved screens:");
				this.screens.forEach(s => { a(s.get("title") ?? s.id).href(this.url + s.id + "/"); });
			});
			["add", "remove"].forEach(verb => this.screens.on(verb, draw));
			draw();
			const $removed = a.c("live-foot-removed").href(this.url + "removed/");
			const count = () => $removed.tc("is-empty", !this.removed.length).text(`Removed cards (${this.removed.length})`).attr("title", "Every card taken off this screen (removed or cleared) is kept here; {\"restore\": \"<id>\"} brings one back");
			[this.content, this.screens].forEach(list => ["remove", "clear", "move"].forEach(verb => list.on(verb, () => queueMicrotask(count))));   // after the card reached removed
			count();
			if (this.is_top) div.c("live-foot-links", () => {
				a("Sessions").href("/live/sessions/");
				a("Archive").href("/live/archive/");
				a("v1").href("/live/v1/");
			});
		});
	}
}
Item.register(LivePage, "LivePage");
