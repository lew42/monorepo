import { Page, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Interception",
	description: "One delegated listener; safe upgrades only.",
	content(){
		p("There are no per-link handlers. The Router adds ONE click listener on `document` and upgrades a click to no-reload navigation only when it's safe:");

		pre(`• we're on a re-renderable Page   (app.page instanceof Page)
• the target is a registered Page (Page.registry.has(pathname))
• same origin, no ⌘/ctrl/shift/middle click`);

		p("Everything else — external links, bare pages, unknown routes, modified clicks — falls through to a normal full navigation. That's what keeps history correct: you never `pushState` into a page you can't later redraw, so Back/Forward never strand you (the classic bug when SPA and full loads mix).");

		p("The upshot: pages write ordinary `a().href(url)` (or `page.link()`) and get SPA for free — or stay full-load links when there's no Router. Same code, behavior scales to context.");

		p("The registry check is also synchronous — no import, no side effects — so merely *considering* a link never loads anything.");
	}
});
