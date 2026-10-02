import { Page, View, div, span, small, a, h1 } from "/app.js";
import AIRail, { card_page } from "./rail.js";
import overview from "./overview.js";
import needs_view from "./needs.js";
import log_view from "./log.js";
import { LIVE } from "./live.js";

// ai2.css is only the v1 screens this file routes to (needs/, log/, overview/);
// everything about a card's own look is the ux block, loaded here too because this
// page is the shell every card opens inside (merge 7, inbox-ext, 2026-10-01).
View.stylesheet(import.meta, "ai2.css");
View.stylesheet("/framework/ux/Card/Card.css");

/**
 * AI 2 — A LIST ON THE LEFT, ONE PAGE ON THE RIGHT, AND NOTHING EVER JUMPS
 * (the owner, 2026-09-22: "as a new card is added, the whole thing gets pushed
 * down. It's jumpy… We need a left sidebar that previews the things, and then
 * when we click on one it stays selected and then I have a persistent page").
 *
 * THE SELECTION IS THE URL. A preview is a plain `<a>` to `/framework/ai2/<id>/`
 * and `route()` below makes that a real address, so the Router navigates it,
 * marks the row, and Back, a reload and a pasted link all just work. Nothing
 * here draws a selection by hand.
 *
 * NOTHING JUMPS, for three separate reasons: the page on the right is a
 * DIFFERENT PAGE from the list; the rail and the page each SCROLL INSIDE
 * THEMSELVES; and a new row only enters the list WHEN THE LIST IS QUIET —
 * otherwise it waits behind the pill. `doc/decisions.md` has the measurements
 * and what was tried instead.
 *
 * The parts: `inbox.js` decides what there is to draw, `card.js` draws a card
 * (small in the rail, whole on the page), `compose.js` is the box you talk to,
 * `ai2.css` is the look. This file is the shell and the selection.
 */
export default new Page({
	meta: import.meta,
	title: "AI 2",
	description: "Everything that happened and everything you said, as one inbox.",
	icon: "smart_toy",
	classes: "full fill",

	/* ⚠ "I present myself, not my children" (core/Page). Without it every card
	   you open becomes a row in the SITE'S nav tree: `route()` memoises each
	   card page into `children` and the sidebar walks that map. */
	leaf: true,

	/* THE DEFAULT VIEW IS INBOX AGAIN (the owner, 2026-09-30: "the AI 2 root is confusing and
	   jumpy" — Needs You as the bare-url default, tried 2026-09-29, is reverted). The rail + a
	   card's own page is back at the bare url, same as every day before 2026-09-29; "Needs
	   you" moved to its own address, `needs/`, drawn exactly like `overview/` — a routed page
	   that takes over the whole shell. EVERY view here is a url, never a class flipped by a
	   button (the owner, 2026-09-23: "we can't just have these buttons that when clicked
	   switch the view manually").
	   ⚠ CARD PAGES STILL LIVE AT `this.url + id + "/"`, unchanged. Inbox alone wears
	     `.tab-default` (ext/tabs' own "not really a match" flag — see `.tab-bar` rules,
	     `tabs.css`) because its href IS the root url, a prefix of every other route — without
	     it `.in-path` would light Inbox for a card, Needs you or Overview too. With nothing
	     else matching, `ext/tabs`' own fallback lights the tab-bar's DOM `:first-child` — which
	     is Inbox, kept first in the markup on purpose (`ai2.css`'s `order` then draws it
	     wherever it visually belongs). A card route matches no tab's own href, so it always
	     falls through to that same fallback: Inbox lights, same as the bare url itself. */
	/* ⚠ "NEEDS YOU" LEFT THE TAB STRIP, 2026-09-30 (the mastermind's own correction to this
	   task's brief): it is now the rail's own filter CHIP (`InboxRail.needs_chip()`),
	   carrying the same count badge this tab used to. `needs/` is still a real, working address (`route()` still answers it, just
	   below) for an old link or a bookmark — it is only unlinked from the strip. */
	content(){
		div.c("inbox-head ai2-head", () => {
			div.c("doc-well", () => h1.c("doc-title h2", "AI 2"));
			div.c("tabs block", () => div.c("tab-bar", () => {
				a.c("tab tab-default ai2-tab-inbox").href(this.url).text("Inbox");
				a.c("tab ai2-tab-log").href(this.url + "log/").text("Log");
				a.c("tab ai2-tab-overview").href(this.url + "overview/").text("Overview");
			}));
		});
		// THE RAIL IS ALWAYS MOUNTED — every route shows it; `needs/`, `log/` and `overview/`
		// take over the whole shell instead (`inbox-takeover`, ux/Inbox/Inbox.css). It is one
		// class, `AIRail` (rail.js), the same one the AI page's Inbox and Log tabs build.
		this.ai2 = new AIRail({ page: this }).mount();
	},

	/* A card's own address — or the overview's, Needs you's, or the Log's. ⚠ A name with a dot
	   in it is a real file, and claiming it would answer a 404 with a card page that can
	   never load. `overview`, `needs`, `log`, `live` and `now` are reserved: no card can be
	   called any of them. `live` is an ordinary card page whose card comes from `live.js`;
	   `now` (followup.md item 2, 2026-09-30) is a REAL card folder, `ai/now/`, routed the
	   same plain way as any other card id below — the only thing special about it is that
	   the rail also pins its preview at the top, imported by hand (`AIRail.render_pinned()`).
	   `live`, `view` and a card folder's year (`2026/09/24/<slug>/`) are answered by
	   `AIRail.route()`, so every page with the rail opens them the same way. */
	route(id){
		if (id.includes(".")) return undefined;
		if (id === "overview") return this.overview_page ??= overview_page(this);
		if (id === "needs") return this.needs_page ??= needs_page(this);
		if (id === "log") return this.log_page ??= log_page(this);
		// THE OLD ADDRESS STILL WORKS (2026-09-29 to 2026-09-30, briefly the default) — a link
		// or a bookmark made during that window still opens the same rail-and-card view the
		// bare url shows again now.
		if (id === "inbox") return this.inbox_page ??= inbox_page(this);
		if (id === LIVE || id === "view" || id === "framework" || /^\d{4}$/.test(id)) return AIRail.route(this, id);
		if (id === "now") return this.now_page ??= card_page(this, "now");
		return card_page(this, id);
	},
});

/* The Overview tab: one big card per concept (overview.js), as a page of its own — it
   mounts in the detail column like a card does, and takes the whole shell while it is
   the active page (`inbox-takeover`). */
function overview_page(root){
	return new Page({
		title: "Overview",
		url: root.url + "overview/",
		classes: "ai2-overview-page inbox-takeover",
		content(){ overview(); },
	});
}

/* The Needs you tab (was the bare url, 2026-09-29 to 2026-09-30): one ranked list of
   everything waiting on the owner, `needs_view()` (needs.js), as a page of its own — it takes
   over the whole shell like Overview does, right below. */
function needs_page(root){
	return new Page({
		title: "Needs you",
		url: root.url + "needs/",
		classes: "ai2-needs-page inbox-takeover",
		content(){ needs_view(); },
	});
}

/* The Log tab (the owner, 2026-09-30): everything in flight, one row per task, each with a
   status dot — `log_view()` (log.js). It reads the SAME task list Overview and a card's own
   Tasks tab already load (`root.ai2.on_tasks`, AIRail's group hook), so nothing is
   fetched twice; it takes over the whole shell like Overview and Needs you do. */
function log_page(root){
	return new Page({
		title: "Log",
		url: root.url + "log/",
		classes: "ai2-log-page inbox-takeover",
		content(){ log_view(fn => root.ai2.on_tasks(fn)); },
	});
}

/* The Inbox tab: exactly what the bare url used to show — nothing of its own beyond the
   rail (always mounted) and its usual empty state, so a first click here (or the
   `LIVEVIEW_KEY` redirect below) reads the same as it always has. */
function inbox_page(root){
	return new Page({
		title: "Inbox",
		url: root.url + "inbox/",
		classes: "ai2-inbox-page",
		content(){
			div.c("inbox-empty muted", () => {
				span("Pick something on the left.");
				small("It opens here and stays here while the list keeps filling.");
			});
		},
	});
}
