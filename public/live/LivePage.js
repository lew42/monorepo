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
				return !/^(constructor|render|route|listen|replaying|on_screen|can_press|voice_at|paint_voice|link_url)$/.test(method);   // the machinery is not a button
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
	// In the house View style (core/View/readme.md): each part is a class with a render(), and its CSS class comes from its
	// name (LiveHeadView draws div.live-head). They are static parts, so a subclass of LivePage can swap one
	// (this.constructor.Card). Every title and text goes through markdown and mentions, scrubbed (md(text, { safe: true })):
	// "@Page" is an icon link, and no script runs.
	render(){
		LivePage.shown = this;
		if (this.view) return this.view;
		const P = this.constructor;
		this.view = div.c("page live-page", () => {
			this.$alerts = div.c("live-alerts");
			new P.Head({ page: this });
			if (this.focus) new P.Focus({ page: this, item: this.focus });
			new P.Main({ page: this, list: this.cards });
			new P.Foot({ page: this });
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

	// A title, in markdown with mentions, kept in step with the item: new LivePage.Heading({ tag: "h4", item }).
	// `only` is the url when the whole title is one mention ("@Page"), so a card can become that thing's card.
	static Heading = class LiveHeadingView extends View {
		render(){
			this.bind(this.item, this.key ?? "title", function(t){
				t ??= this.fallback;
				this.tc("is-empty", !t).empty();
				if (t) this.md(String(t), { safe: true });
				const one = this.el.children.length === 1 && this.el.firstElementChild.matches("a.mention") ? this.el.firstElementChild : null;
				this.only = one && one.textContent.trim() === this.el.textContent.trim() ? one.getAttribute("href") : null;
				this.on_text?.();
			});
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

	// The voice light, the title, the last line's delay, the version dropdown (on /live/) or the breadcrumb (below it).
	static Head = class LiveHeadView extends View {
		render(){
			const { page } = this, P = page.constructor;
			if (!page.is_top) new P.Crumbs({ page });
			div.c("live-head-row", () => {
				page.$dot = span.c("live-dot");
				new P.Heading({ tag: "h1", item: page.focus ?? page, fallback: "Live", classes: "live-title" });
				page.$ms = span.c("live-ms");
				if (page.is_top) select.c("live-version", () => {
					P.versions.forEach(v => option(v.label).attr("value", v.url));
				}).attr("aria-label", "Version").on("change", e => { location.href = e.target.value; });
			});
			new P.Md({ item: page, key: "header", classes: "live-sub" });
		}
	};

	// Where this page sits, every step a link: Live › design › foo (the folder names of the url, from /live/ down).
	static Crumbs = class LiveCrumbsView extends View {
		render(){
			const parts = String(this.page.url ?? "/live/").split("/").filter(Boolean);
			this.attr("aria-label", "Where you are");
			parts.forEach((name, i) => {
				if (i) span.c("live-crumb-sep", "›");
				const $a = a.c("live-crumb", i ? name : "Live").href("/" + parts.slice(0, i + 1).join("/") + "/");
				if (i === parts.length - 1) $a.attr("aria-current", "page");
			});
		}
	};

	// The card this page is (a card opened by itself): its text (the title is the page's), or a class's own View.
	static Focus = class LiveFocusView extends View {
		render(){
			const { item } = this, Own = item.constructor.View;
			this.attr("data-kind", item.constructor.name);
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
				DefaultView.place(this.el, members, drawn, item => new (card(item) ? P.Card : P.Block)({ page, item }));
				this.tc("is-empty", !members.length);
			};
			["add", "remove", "move", "order", "clear"].forEach(verb => list.on(verb, draw));
			draw();
		}
	};

	// What cannot be tapped draws with no frame: a class with its own View (a checklist, a Task, a button) draws with it;
	// a text or a heading draws its title and text.
	static Block = class LiveBlockView extends View {
		render(){
			const { page, item } = this, P = page.constructor, Own = item.constructor.View;
			this.attr("id", item.id).attr("data-kind", item.constructor.name);
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
			let $title;
			const go = () => {
				this.tc("live-entity", !!$title?.only);
				this.$go?.attr("href", $title?.only ?? own).attr("aria-label", String(item.get("title") ?? item.id));
			};
			this.attr("id", item.id).attr("data-kind", item.constructor.name);
			div.c("live-card-body", () => {
				$title = new P.Heading({ tag: "h4", item, classes: "live-card-title", on_text: go });
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

	// `footer` (a line of text) when set; on /live/ and its sub-pages, every child page, the saved screens and the removed
	// cards; on /live/ itself, the old views.
	static Foot = class LiveFootView extends View {
		render(){
			const { page } = this, P = page.constructor;
			new P.Md({ item: page, key: "footer", classes: "live-foot-text" });
			if (page.screen || page.focus) return;   // a saved screen or one opened card has no screens of its own
			const $pages = div.c("live-foot-pages is-empty");
			Page.listing(page.url).then(listing => {   // every child folder, so no page under /live/ is ever unlinked
				const names = [...listing?.pages.keys() ?? []].sort();
				$pages.tc("is-empty", !names.length).empty(() => { span("Pages here:"); names.forEach(n => { a(n).href(page.url + n + "/"); }); });
			}).catch(() => {});
			const $screens = div.c("live-foot-screens");
			const draw = () => $screens.tc("is-empty", !page.screens.length).empty(() => {
				span("Saved screens:");
				page.screens.forEach(s => { a(s.get("title") ?? s.id).href(page.url + s.id + "/"); });
			});
			["add", "remove"].forEach(verb => page.screens.on(verb, draw));
			draw();
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
