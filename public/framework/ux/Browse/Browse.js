import { View, div, span, small, a, button, details, summary } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";

View.stylesheet({ url: import.meta.url }, "Browse.css");

/** Browse — one list-and-detail view: a resizable list on the left, the clicked row's own page on the right.
 *  The orchestrator; Inbox.Rail extends it, Sessions and the catalog are next. Doc: doc/architecture.md. */
export default class Browse {
	key = "browse";   // localStorage prefix: `<key>-rail-w` (the list's dragged width), `<key>-ticked`
	pins = [];        // Browse.Pinned lists, drawn above the rows

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	get url(){ return this.page.url; }
	get router(){ return this.page.app?.router; }

	/* ════ the shell — call `mount()` synchronously, inside the page's content() ════ */

	mount(){
		this.before_mount();
		this.$shell = div.c(this.shell_classes(), () => {
			this.pane();
			this.detail();
			this.sub();
			this.shell_extra();
		});
		// The detail column is `page.$pages`, core's own "where my child pages mount": a row's page renders here.
		this.page.$pages = this.$detail;
		this.page.$sub = this.$sub;
		this.size(parseInt(this.store_get(this.key + "-rail-w"), 10) || null);
		this.listen();
		this.start();
		return this;
	}

	before_mount(){}
	/* `inbox-*` stay beside `browse-*` so every rule in ux/Inbox/Inbox.css still lands (doc/architecture.md). */
	shell_classes(){ return "browse inbox-shell bleed"; }
	shell_extra(){}
	listen(){}
	start(){}

	pane(){
		div.c("browse-list inbox-rail", () => {
			this.draw_list();
			this.grip();
		});
	}

	/** The rows: a subclass draws them (each a link to `<page url><id>/`). */
	draw_list(){}

	/** The pinned lists' box; a subclass places it where it wants it, at the top of its rows. */
	pins_box(){
		this.$pins = div.c("browse-pins");
		this.pins.forEach(p => this.$pins.append(() => p.view()));
		return this.$pins;
	}

	pin(p){
		this.pins.push(p);
		p.browse = this;
		this.$pins?.append(() => p.view());
		return p;
	}

	detail(){ this.$detail = div.c("browse-detail inbox-detail", () => { this.empty(); }); }

	empty(){
		div.c("inbox-empty muted", () => {
			span("Pick something on the left.");
			small("It opens here and stays here while the list keeps filling.");
		});
	}

	sub(){ this.$sub = div.c("inbox-sub"); }

	/** px from the grip, or null for the default (a third of the screen, Browse.css). */
	size(px){
		const w = px ? Math.round(Math.max(200, Math.min(px, innerWidth - 320))) : null;
		this.$shell.style("--inbox-rail", w ? w + "px" : "");
		return w;
	}

	grip(){
		const k = this.key + "-rail-w";
		grip({ from: "start", write: px => this.size(px), done: w => this.store_set(k, w + "px"),
			reset: () => { this.store_drop(k); this.size(); } });
	}

	/* ⚠ Storage can throw (a private window, blocked site data); every read and write goes through these. */
	store_get(k){ try { return localStorage.getItem(k); } catch { return null; } }
	store_set(k, v){ try { localStorage.setItem(k, v); } catch {} }
	store_drop(k){ try { localStorage.removeItem(k); } catch {} }

	/** A short titled list pinned above the rows: one line each, a link, a tick that makes it go. Hidden when empty. */
	static Pinned = class Pinned {
		title = "Pinned";
		rows = [];           // [{ id, title, href, sub, at }]
		key = "pinned";      // localStorage: the ids ticked in this browser, so a tick is gone at once
		tick = null;         // (row) => Promise — the real write (AIRail: archive the card); null = no tick button

		constructor(...args){ Object.assign(this, ...args); }

		view(){
			this.$box = div.c("browse-pinned");
			this.draw();
			return this.$box;
		}

		set(rows){ this.rows = rows; this.draw(); this.changed?.(); }

		shown(){ const t = this.ticked(); return this.rows.filter(r => !t.has(r.id)); }
		ids(){ return new Set(this.shown().map(r => r.id)); }

		ticked(){ try { return new Set(JSON.parse(localStorage.getItem(this.key + "-ticked") ?? "[]")); } catch { return new Set(); } }
		mark(ids){ try { localStorage.setItem(this.key + "-ticked", JSON.stringify([...new Set([...this.ticked(), ...ids])])); } catch {} }

		done(rows){
			this.mark(rows.map(r => r.id));
			this.draw();
			this.changed?.();
			if (this.tick) rows.forEach(r => Promise.resolve(this.tick(r)).catch(() => null));
		}

		draw(){
			if (!this.$box) return;
			const rows = this.shown();
			const sig = JSON.stringify(rows);
			if (sig === this.sig) return;
			this.sig = sig;
			this.$box.el.hidden = !rows.length;
			if (!rows.length) return this.$box.empty();
			const open = this.$details ? this.$details.el.open : true;
			this.$box.empty(() => {
				this.$details = details.c("browse-pinned-box", () => {
					summary.c("browse-pinned-head", () => {
						span.c("browse-pinned-title").text(this.title);
						small.c("inbox-badge").text(String(rows.length));
						if (this.tick && rows.length > 1) button.c("browse-pinned-all inbox-word").attr("type", "button")
							.attr("title", "tick every line: each card is archived, nothing is deleted").text("tick all")
							.click(e => { e.preventDefault(); if (confirm(`Tick all ${rows.length}? Each card is archived, nothing is deleted.`)) this.done(rows); });
					});
					div.c("browse-pinned-rows", () => rows.forEach(r => this.line(r)));
				});
				this.$details.el.open = open;
			});
			this.browse?.router?.mark_links?.();
		}

		line(r){
			div.c("browse-pinned-row", () => {
				if (this.tick) button.c("browse-tick").attr("type", "button").attr("title", "done: it leaves this list (the card is archived, never deleted)")
					.text("✓").click(() => this.done([r]));
				a.c("browse-pinned-link").href(r.href).attr("title", r.sub || r.title).append(() => {
					span.c("browse-pinned-name").text(r.title);
					if (r.sub) small.c("browse-pinned-sub muted").text(r.sub);
				});
				if (r.at) small.c("browse-pinned-when muted").text(Pinned.when(r.at)).attr("title", new Date(r.at).toLocaleString());
			});
		}

		static when(at){
			const d = new Date(at), now = new Date();
			if (isNaN(d)) return "";
			return d.toDateString() === now.toDateString() ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" });
		}
	};
}
