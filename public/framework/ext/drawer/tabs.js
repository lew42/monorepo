import { div, button, span } from "/framework/core/View/View.js";
import drawer from "./drawer.js";

/* Is this the dev server? Settings and Admin drive it (edit mode, reload holds, the socket),
   so on a static host they are not shown, and the AI tab does not call Servex. */
export const DEV = /^(localhost|127\.0\.0\.1|.+\.localhost)$/.test(location.hostname);

/* THE DRAWER'S TABS — AI, Sessions, Dictation, Settings and Admin, plus Element while
   something on the page is selected (select.js) — opened by the ☰
   (menu.js) on every page. doc/tabs.md has the picture and the model.

   A tab is one row of `list`: a route word, a label, and `load()`, which imports
   the tab's own file only the first time that tab is shown — so a page nobody
   opens the drawer on never downloads the composer, the microphone or the
   playground. The file's default export draws the tab into the drawer's body.

   ROUTED. The open tab is `?drawer=<word>` in the url, written with
   `history.replaceState` (no new history entry per click), so a reload opens the
   drawer on the same tab. No `?drawer` means the drawer is shut. */
export class DrawerTabs {
	static KEY = "drawer";

	list = [
		{ name: "ai",        label: "AI",        load: () => import("./tabs/ai.js") },
		{ name: "sessions",  label: "Sessions",  load: () => import("./tabs/sessions.js") },
		{ name: "dictation", label: "Dictation", load: () => import("./tabs/dictation.js") },
		{ name: "settings",  label: "Settings",  load: () => import("./tabs/settings.js"), when: () => DEV },
		{ name: "admin",     label: "Admin",     load: () => import("./tabs/admin.js"),    when: () => DEV },
		// Only while something on the page is selected (select.js sets `selected`).
		{ name: "element",   label: "Element",   load: () => import("./tabs/element.js"),  when: () => !!this.selected },
	];

	// The element selected on the page, or null — select.js writes it, the Element tab reads it.
	selected = null;

	/** The tabs showing right now: a row with `when()` shows only while it answers true. */
	shown(){ return this.list.filter(t => !t.when || t.when()); }

	// The thread the AI tab talks into — set by a click on the Sessions tab,
	// `null` for a fresh, unrecorded conversation. {slug, task, resume, history}
	thread = null;

	// What the next AI message is about: elements picked on the page, each shown as a chip
	// in the AI tab's input. {kind, label, text, selector} — select.js's item().
	chips = [];

	chip(it){
		if (!this.chips.some(c => c.selector === it.selector)) this.chips.push(it);
		return this;
	}

	unchip(it){
		this.chips = this.chips.filter(c => c.selector !== it.selector);
		return this;
	}

	constructor(...args){
		this.assign(...args);
		// The one bound fill, so `drawer.filled_by()` can say whether the rail is ours.
		this.fill = this.fill.bind(this);
		window.addEventListener("drawer-close", () => this.write(null));
		// A host changed the page the drawer is about (drawer.page()) — the open tab redraws.
		window.addEventListener("drawer-page", () => { if (this.mine()) drawer.refresh(); });
	}
	assign(...args){ return Object.assign(this, ...args); }

	// The tab the url names, or null.
	routed(){ return new URLSearchParams(location.search).get(this.constructor.KEY); }

	// Is the rail open on these tabs (not on some other caller's content)?
	mine(){ return drawer.showing() && drawer.filled_by() === this.fill; }

	find(name){ return this.shown().find(t => t.name === name); }

	/** Open the drawer on a tab — the named one, else the one already open, else AI. */
	open(name){
		const was = this.current;
		this.current = this.find(name) ?? (this.shown().includes(was) ? was : this.shown()[0]);
		// Where to go back to when the Element tab goes away.
		if (this.current.name !== "element" && was !== this.current) this.before = this.current;
		this.write(this.current.name);
		drawer(this.fill);
		return this;
	}

	shut(){ drawer.close(); }

	toggle(){ this.mine() ? this.shut() : this.open(); }

	/* The route word, written back into the url without a new history entry.
	   ⚠ `history.state` is carried over as-is — Router keeps its own entry there. */
	write(name){
		const url = new URL(location.href);
		if ((url.searchParams.get(this.constructor.KEY) ?? null) === name) return;
		name ? url.searchParams.set(this.constructor.KEY, name) : url.searchParams.delete(this.constructor.KEY);
		history.replaceState(history.state, "", url);
	}

	/* A navigation is a new page, so every tab has something new to say (this page's
	   threads, this page's context). Router pushes the new url AFTER `navigated()`
	   (code skill §7), so the route word is written back on the next task. */
	navigated(){
		if (!this.mine()) return;
		setTimeout(() => { this.write(this.current.name); drawer.refresh(); });
	}

	/** What every tab is handed: the app, the page the drawer is about (drawer.page(),
	 *  never location.pathname), and the open card if that page IS a card (ai2/card.js
	 *  — duck-typed, so nothing here imports AI 2). */
	context(){
		const url = drawer.page();
		const active = this.app?.router?.active;
		const card = active?.shell?.ai2 && active.id && typeof active.subs === "function"
			&& active.url === url ? active : null;
		return { app: this.app, tabs: this, page: url, card };
	}

	fill($slot, $body){
		$slot.empty(() => {
			div.c("drawer-tabs flex", () => {
				this.shown().forEach(t => button.c("drawer-tab", t.label).attr("type", "button")
					.ac(t === this.current && "on").click(() => this.open(t.name)));
			});
		});

		// ⚠ The tab's file is imported, and an await drops the captor — so the body is
		// captured NOW and filled in a callback (code skill §1).
		const tab = this.current, ctx = this.context();
		$body.empty(() => { span.c("drawer-wait muted", "loading…"); });
		tab.load()
			.then(m => {
				if (this.current !== tab) return;   // another tab was clicked meanwhile
				$body.empty(() => { m.default(ctx); });
			})
			.catch(e => $body.empty(() => { span.c("drawer-wait muted", "This tab could not load: " + e.message); }));
	}
}

export const tabs = new DrawerTabs();
export default tabs;
