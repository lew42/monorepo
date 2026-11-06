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

	constructor(...args){
		super(...args);
		this.screens ??= new List({ owner: this, name: "screens" });   // saved screens (LiveScreen), opened at /live/<name>/
	}

	// ════ METHODS A DELTA CAN CALL ═══
	// An effect runs only for a line that arrives while the page is open; a reload replays the log without re-running it.

	// {"flash": {}} or {"flash": "red"} — the screen blinks once.
	flash(color){
		if (this.replaying()) return;
		const el = this.view?.el;
		if (!el) return;
		el.style.setProperty("--live-flash", typeof color === "string" ? color : "var(--prime)");
		el.classList.remove("is-flashing");
		void el.offsetWidth;   // restart the animation
		el.classList.add("is-flashing");
	}

	// {"alert": "Text"} — a banner at the top for a few seconds (never window.alert: it would block the page).
	alert(text){
		if (this.replaying() || !this.$alerts) return;
		const $note = div.c("live-alert", String(text ?? ""));
		this.$alerts.el.append($note.el);
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
		this.content.set({ clear: true });
	}

	// {"restore": "plan"} — put a saved screen's cards back on /live/ (what is on screen now is cleared first; save it before).
	restore(name){
		const screen = this.screens.find(String(name));
		if (!screen) return;
		const cards = JSON.parse(JSON.stringify(screen.content.toJSON()));
		this.content.set({ clear: true });
		cards.forEach(card => this.content.add(card));
	}

	// May a button card run `method`? Only a method this page class (or a subclass) defines itself, never one of Page's.
	can_press(method){
		for (let C = this.constructor; C && C !== Page; C = Object.getPrototypeOf(C))
			if (typeof method === "string" && Object.hasOwn(C.prototype, method) && typeof C.prototype[method] === "function")
				return !/^(constructor|render|route|listen|replaying|can_press|voice_at|paint_voice|link_url|draw_.*)$/.test(method);   // the machinery is not a button
		return false;
	}

	// True while a line is being replayed (opening the page), false for a line another writer just saved.
	replaying(){ return Item.source === "replay"; }

	// ════ A SAVED SCREEN OPENS AT /live/<name>/ ═══
	route(name){
		const screen = this.screens.find(name);
		if (!screen) return super.route?.(name);
		return new this.constructor({ title: screen.get("title") ?? name, url: this.url + name + "/", screen });
	}

	// The cards this view draws: a saved screen's, or the page's own.
	get cards(){ return this.screen?.content ?? this.content; }

	// /live/ itself, or a page under it (a sub-page or a saved screen)?
	get is_top(){ return !(this.parent instanceof LivePage) && !this.screen; }

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
			if (!this.is_top) a.c("live-back", "‹ " + (this.parent?.title ?? "Live")).href(this.parent?.url ?? "/live/");
			div.c("live-head-row", () => {
				this.$dot = span.c("live-dot");
				h1.c("live-title").bind(this, "title", function(t){ this.text(t ?? "Live"); });
				this.$ms = span.c("live-ms");
				if (this.is_top) select.c("live-version", () => {
					this.constructor.versions.forEach(v => option(v.label).attr("value", v.url));
				}).attr("aria-label", "Version").on("change", e => { location.href = e.target.value; });
			});
			div.c("live-sub").bind(this, "header", function(text){ this.tc("is-empty", !text).empty(() => { if (text) md(String(text)); }); });
		});
	}

	// The cards, kept in step by DefaultView.place (only the changed ones redraw).
	draw_cards(){
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

	// A link to a sub-page is a card you can tap; anything else draws with no frame. Title and text are bound, so an edit
	// ({"content": {"<id>": {"text": "…"}}}) redraws only that one. (Made while another view may capture; place() moves it.)
	draw_card(item){
		const kind = item.constructor.name;
		if (item instanceof PageLink) return a.c("live-card live-link", () => {
			div.c("live-link-body", () => this.draw_words(item));
			span.c("live-link-go", "›");
		}).attr("href", this.link_url(item.get("path"))).attr("id", item.id).attr("data-kind", kind);
		if (this.constructor.kinds.has(item.constructor))
			return div.c("live-block", () => { new item.constructor.View({ item }); }).attr("id", item.id).attr("data-kind", kind);
		return div.c("live-block", () => this.draw_words(item)).attr("id", item.id).attr("data-kind", kind);
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

	// `footer` (a line of text) when set; on /live/ itself, the saved screens and the old views.
	draw_foot(){
		div.c("live-foot", () => {
			div.c("live-foot-text").bind(this, "footer", function(text){ this.tc("is-empty", !text).empty(() => { if (text) md(String(text)); }); });
			if (!this.is_top) return;
			const $screens = div.c("live-foot-screens");
			const draw = () => $screens.tc("is-empty", !this.screens.length).empty(() => {
				span("Saved screens:");
				this.screens.forEach(s => { a(s.get("title") ?? s.id).href(this.url + s.id + "/"); });
			});
			["add", "remove"].forEach(verb => this.screens.on(verb, draw));
			draw();
			div.c("live-foot-links", () => {
				a("Sessions").href("/live/sessions/");
				a("Archive").href("/live/archive/");
				a("v1").href("/live/v1/");
			});
		});
	}
}
Item.register(LivePage, "LivePage");
