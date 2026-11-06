import { Page, View, div, span, a, h1, h4, select, option, md } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import DefaultView from "/framework/ux/Content/Object/DefaultView.js";

View.stylesheet(import.meta, "LivePage.css");

/* /live/ — the screen voice Claude drives with the item tool: item({path: "/live/", delta}).
 * The page IS page.jsonl: line 1 names this class, every later line is one set(). A data key is state
 * (light, header, footer), saved and replayed; a key naming a method calls it (flash, alert, toggle).
 * The cards are the page's own `content` List: the stock add / remove / move / order / clear verbs.
 * To add a test method: write it below, reload /live/, send {"<name>": <argument>}. readme.md lists the deltas. */
export default class LivePage extends Page {

	// The version dropdown: the newest first, and the default.
	static versions = [
		{ label: "v2", url: "/live/" },
		{ label: "v1", url: "/live/v1/" },
	];

	// ════ METHODS A DELTA CAN CALL ═══
	// An effect runs only for a line that arrives while the page is open; a reload replays the log without re-running it.

	// {"toggle": {}} — turn the light the other way (saved, like {"light": true}).
	toggle(){ this.set({ light: !this.get("light") }); }

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

	// True while a line is being replayed (opening the page), false for a line another writer just saved.
	replaying(){ return Item.source === "replay"; }

	// ════ HOW FAST A LINE ARRIVES ═══
	// The item tool stamps `ts` when it writes; this is how long after that the page applied the line.
	listen(){
		this.on("line", line => {
			if (Item.source !== "remote" || !line?.ts) return;
			const ms = Date.now() - Date.parse(line.ts);
			View.frame(() => { this.last_ms = ms; this.$ms?.text(`${ms} ms`).attr("title", "From the item tool's write to this screen"); });
		});
	}

	// ════ DRAWING ═══
	render(){
		if (this.view) return this.view;
		this.listen();
		this.view = div.c("page live-page", () => {
			this.$alerts = div.c("live-alerts");
			this.draw_head();
			this.draw_cards();
			this.draw_foot();
		});
		Page.views.set(this.view.el, this);
		return this.view;
	}

	// Title, the light, the last line's latency, the version dropdown; `header` (a line of text) under them when set.
	draw_head(){
		div.c("live-head", () => {
			div.c("live-head-row", () => {
				span.c("live-light").bind(this, "light", function(on){ this.tc("is-on", !!on).attr("title", on ? "Light on" : "Light off"); });
				h1.c("live-title").bind(this, "title", function(t){ this.text(t ?? "Live"); });
				this.$ms = span.c("live-ms");
				select.c("live-version", () => {
					this.constructor.versions.forEach(v => option(v.label).attr("value", v.url));
				}).attr("aria-label", "Version").on("change", e => { location.href = e.target.value; });
			});
			div.c("live-sub").bind(this, "header", function(text){ this.tc("is-empty", !text).empty(() => { if (text) md(String(text)); }); });
		});
	}

	// The cards: one white card per member of `content`, kept in step by DefaultView.place (only changed cards redraw).
	draw_cards(){
		const $main = div.c("live-main");
		const cards = new Map(), list = this.content;
		const draw = () => {
			const members = list.items.filter(i => !i.transient);   // a transient item is the page's own code, never a card
			DefaultView.place($main.el, members, cards, item => this.draw_card(item));
			$main.tc("is-empty", !members.length);
		};
		["add", "remove", "move", "order", "clear"].forEach(verb => list.on(verb, draw));
		draw();
	}

	// One card: its title and text are bound, so {"content": {"<id>": {"text": "…"}}} redraws only that card.
	// (Made while some other view may be capturing; place() moves it into the cards box either way.)
	draw_card(item){
		return div.c("live-card", () => {
			h4.c("live-card-title").bind(item, "title", function(t){ this.tc("is-empty", !t).text(t ?? ""); });
			div.c("live-card-text").bind(item, "text", function(t){ this.empty(() => { if (t) md(String(t)); }); });
		}).attr("id", item.id).attr("data-kind", item.constructor.name);
	}

	// `footer` (a line of text) at the bottom when set, plus the links that were on v1.
	draw_foot(){
		div.c("live-foot", () => {
			div.c("live-foot-text").bind(this, "footer", function(text){ this.tc("is-empty", !text).empty(() => { if (text) md(String(text)); }); });
			div.c("live-foot-links", () => {
				a("Sessions").href("/live/sessions/");
				a("Archive").href("/live/archive/");
				a("v1").href("/live/v1/");
			});
		});
	}
}
Item.register(LivePage, "LivePage");
