import { Page } from "/framework/core/new/1/Page.class.js";
import { Router } from "/framework/core/new/1/Router.js";

/* PROTOTYPES — the Router changes still pending, installed here so this section
 * can measure them instead of describing them. Importing this file patches
 * Router and Page for the whole app.
 *
 * R1–R5 are ONE reconciled diff, merging this seat's proposals with the async
 * seat's. The full record — who won each disagreement, and the combined test
 * set — is agents/urls/router.md. P3 is a Page change, gated on R2.
 *
 * P5 (class fields) and P6 (adopt in the constructor) were APPLIED upstream and
 * are gone from here: a prototype of something already shipped is a copy
 * waiting to drift.
 *
 * Every patch is additive and inert until its trigger fires — no hash, no
 * query, no `aliases`, no late-rendered link means byte-identical behaviour.
 * Measured across every other seat's routes, before and after.
 *
 * Written as named functions called at the bottom so the pages can render the
 * real installed source with code.fn(), never a copy of it.
 */

/* R1 — carry what the Router does not interpret.
 *
 * click() passed link.pathname only, so ?filter=red died on the first click and
 * #section never reached the address bar at all. Both seats found one half of
 * this; the merge is that the query and the hash are the same defect.
 *
 * Parsed ONCE, in go(), with the platform's own parser. The async seat proposed
 * `url.split("?")[0]` inside load_segments instead — that handles a query and
 * not a hash, and pushes parsing down into the walk. load_segments keeps taking
 * a pathname, because it has never wanted anything else. */
export const carry_the_rest = () => {

	Router.prototype.click = function(e){
		const link = this.link_clicked(e);
		if (!link) return;

		e.preventDefault();
		this.go(link.pathname + link.search + link.hash);   // was: link.pathname
	};
};

/* R2 — push the page's url, not the url you asked for.
 *
 * /tabs, /tabs//, /tabs/./ and /tabs/ all resolve to one page, and all four
 * stayed in the address bar. One page, four urls, is exactly what "the url IS
 * the state" cannot survive. The page that answered knows where it lives.
 *
 * The second guard is history: three clicks on the tab you are already reading
 * should not cost three Back presses. */
export const push_the_canonical_url = () => {

	Router.prototype.go = async function(url){
		const to = new URL(url, location.origin);
		const token = ++this.navigation;                       // R5

		const ok = await this.load(to.pathname + to.search + to.hash, token);

		if (token !== this.navigation) return;                 // R5 — a newer click won
		if (!ok) return location.assign(url);

		const next = this.active.url + to.search + to.hash;

		if (next !== location.pathname + location.search + location.hash)
			history.pushState({}, "", next);
	};
};

/* R3 — scroll to the hash after the target has been rendered.
 *
 * A deep link to #section navigated and then sat at the top: the browser looked
 * for the target while the page was still a name in a children map. Nothing can
 * scroll until activate() has built the DOM and inject() has put it in the
 * document, which is precisely what app.ready means.
 *
 * load() also carries R1's search, R2's first-load correction and R5's token,
 * because all four want the same parse and there should only be one. */
export const scroll_to_the_hash = () => {

	Router.prototype.load = async function(url, token = ++this.navigation){
		const to = new URL(url, location.origin);
		const first = !this.active;                        // nothing activated yet IS "the browser did this one"
		const hash = first ? location.hash : to.hash;      // …so the browser's hash is the one to honour
		const page = await this.load_segments(to.pathname);

		if (!page) return console.log(`router.load("${url}") — 404, nothing resolves it`), false;
		if (token !== this.navigation) return false;       // R5 — superseded, do not touch the DOM

		/* Carried, never read. A page cannot take the query from `location` at
		   render time: go() loads BEFORE it pushes, so mid-navigation the bar
		   still shows the url being left — the same reason mark_links() asks the
		   page for `here` instead of asking the browser. */
		this.search = first ? location.search : to.search;

		this.activate(page);
		if (first) history.replaceState({}, "", this.active.url + this.search + hash);
		this.app.ready.then(() => this.scroll_to_hash(hash));

		return true;
	};

	// $app is still detached while load() runs, and scrollIntoView on a detached
	// node does nothing at all — hence the app.ready above.
	Router.prototype.scroll_to_hash = function(hash){
		if (!hash) return;
		this.root().querySelector("#" + CSS.escape(hash.slice(1)))?.scrollIntoView({ block: "start" });
	};
};

/* R4 — re-mark links when links appear. The async seat's proposal, adopted.
 *
 * A bar filled after an await missed the mark() that already ran, so every
 * late-rendered link owes mark_links() a call it cannot discover from its own
 * call site. Page.tabs() makes that call and comments it, which is both the
 * framework's worked example and the evidence that it is forgettable.
 *
 * Batched to a microtask, which is the whole reason this is not a
 * requestAnimationFrame: microtasks run BEFORE paint, so no frame ever shows an
 * unmarked link. No loop — mark_links() only toggles classes, and this watches
 * childList. */
export const watch_links = () => {

	Router.prototype.watch_links = function(){
		let queued = false;

		new MutationObserver(() => {
			if (queued) return;
			queued = true;
			queueMicrotask(() => { queued = false; this.mark_links(); });
		}).observe(this.root(), { childList: true, subtree: true });
	};
};

/* R5 — one token, so a superseded navigation cannot land.
 *
 * Two fast clicks on different unresolved urls race, and the slower import
 * lands last and wins. Reproduced deterministically by the async seat, who
 * named the shape exactly: the captor is a global you READ across an await,
 * `router.active` is a global you WRITE across one. Naming your target fixes
 * the first; only a generation token fixes the second.
 *
 * Checked twice, because activate() and pushState() sit on either side of the
 * await and each has to be refused separately — and because "superseded" must
 * not be confused with "did not resolve", which would hand a perfectly good url
 * to location.assign(). */
export const one_navigation_wins = () => {
	Router.prototype.navigation = 0;
};

/* P3 — `aliases`: names that used to be mine.
 *
 * One lookup at the top of child(), before the children Map. Deliberately NOT
 * recursive: a single substitution, so aliases: { a: "b", b: "a" } resolves a
 * to b and stops. A cycle is unrepresentable rather than guarded against.
 *
 * With R2 in place this is a redirect, not an alias — the old url resolves and
 * the address bar immediately reads the page's real url. One canonical url
 * survives, which is the whole reason to prefer it to two live ones. */
export const aliases = () => {
	const child = Page.prototype.child;

	Page.prototype.child = function(name){
		return child.call(this, this.aliases?.[name] ?? name);
	};
};

one_navigation_wins();
carry_the_rest();
push_the_canonical_url();
scroll_to_the_hash();
watch_links();
aliases();

/* The one thing a prototype cannot do from here: fix the load it is inside.
 *
 * This module is imported BY the page the first load is resolving, so by the
 * time it runs, Router.load() is already on the stack — the unpatched one — and
 * listen() bound its handlers long before that. In the framework these lines
 * live inside load() and listen(); here they run once, after ready, and reach
 * the same state a beat later. It is site code, so reading window.app is
 * allowed; framework code takes `app` as a constructor argument and never
 * would. */
window.app?.ready.then(() => {
	const router = window.app.router;
	if (!router?.active) return;

	if (location.pathname !== router.active.url)
		history.replaceState({}, "", router.active.url + location.search + location.hash);

	router.scroll_to_hash(location.hash);
	router.watch_links();
});

console.log("urls/proposals.js — R1 carry · R2 canonical · R3 hash · R4 watch · R5 token · P3 aliases");
