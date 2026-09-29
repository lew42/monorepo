import { div, button, span, a } from "/framework/core/View/View.js";
import drawer from "./drawer.js";
import { http_ask_ready, ask_probe } from "/framework/ext/Ask/Ask.js";

/* Is this the dev server? Settings and Admin drive it (edit mode, reload holds, the socket),
   so on a static host they are not shown, and the AI tab does not call Servex.
 *
 * The hostname check alone is only right ON THIS MACHINE — a phone reads the dev
 * server by its LAN address (`http://10.0.0.135:8137/`), which matches neither
 * `localhost` nor `127.0.0.1`, so `DEV` used to come back false there even though
 * the dev server is real and answering, and the LAN path in `tabs/ai.js`'s `send()`
 * (the `servex_url()` swap) never ran on a phone (review #4, 2026-09-29). Off the
 * local hostname, this reuses `ext/Ask/Ask.js`'s OWN probe (`ask_probe` /
 * `http_ask_ready`) rather than sending a second `POST /ask/turn` — one fetch per
 * page load, not two. ⚠ It must be the SAME check: a status-code test alone is
 * wrong, because this site's own static production host answers 405 (not 404) to
 * an unknown POST route, which would have flipped `DEV` on for every reader in
 * production (review, 2026-09-29). Only a JSON body proves a real dev server is
 * behind the page — `Ask.js`'s probe already checks exactly that. `export let`,
 * not `const`: this starts as the synchronous, always-right localhost answer and
 * flips true once the probe resolves — an ES module export is a live binding, so
 * every importer (`tabs/ai.js`, this file's own tab list) sees the flip without
 * re-importing anything, the same shape `ai2/inbox.js`'s `servex_up()` already
 * uses for the same kind of "ask once, remember" check. */
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|.+\.localhost)$/.test(location.hostname);
export let DEV = LOCAL_HOST;
if (!DEV) ask_probe.then(() => { if (http_ask_ready) DEV = true; });

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

	/** This page's own file browser — itself if the reader is already in one
	 *  (never `fs/fs/`), else its own `fs/` one level deeper. A plain link at the
	 *  end of the tab strip, not a tab (the task mastermind, 2026-09-29): it goes
	 *  straight to the files, no tab body of its own to load first. */
	files_href(){
		const path = location.pathname;
		return path.includes("/fs/") ? path : path.replace(/\/?$/, "/") + "fs/";
	}

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
				a.c("drawer-tab drawer-files-link", "Files").href(this.files_href())
					.attr("title", "This page's own files, full screen");
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
