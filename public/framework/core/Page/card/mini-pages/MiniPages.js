import { Page, div, h3, p, a } from "/app.js";

/* MiniPages — the owner's decision, 2026-09-29 about 8:40 PM: "a card is
 * kind of a tiny page and doesn't need a directory of its own" — its data is
 * a LINE in the nearest existing parent page.jsonl, with a virtual routed
 * url through that parent's `route()`. A folder is made only on demand,
 * when a card outgrows a line.
 *
 * This file IS that parent. `page.jsonl` beside it names this class as its
 * line 1 (`"class": "./MiniPages.js"`), so every line after that is one
 * `set()` call (core/Page/Log.js) — a key that names a method calls it, and
 * `card` below is a NEW method this page.jsonl format just learned, the same
 * way `place` and `file` already work. Nothing below this file is a folder:
 * open card/mini-pages/ on disk and you will find exactly two files, this
 * one and page.jsonl, however many cards the list shows.
 */
export default class MiniPages extends Page {

	// The new page.jsonl verb: `{"card": {"slug": ..., "title": ..., "body": ..., "ground": ...}}`.
	// One call per line; `this.cards` is built before anyone can ask for a card, because
	// every line in the file is read before render() or route() ever runs.
	card(data){
		(this.cards ??= []).push(data);
	}

	// A name nobody declared — this page's own `children` map has nothing in it,
	// so child() (Page.class.js) asks route() for every url under this one. Found
	// data becomes a real page, built on the spot: no fetch, no folder, because
	// `this.cards` already has every card's data, read off the SAME page.jsonl
	// this list itself came from.
	route(name){
		const found = this.cards?.find(c => c.slug === name);
		if (!found) return null;

		return {
			title: found.title,
			icon: found.icon || "description",
			content(){
				div.c(`card ${found.ground || ""}`.trim(), () => {
					h3(found.title);
					p(found.body);
				});
			},
		};
	}

	// A naming collision, found 2026-09-30 wiring this page into a preview wall:
	// `Page.nav()` reads `this.card` expecting a CSS-class STRING (the `card`
	// property, Page.class.js's own doc/api.md), but this class also has a
	// METHOD named `card` (above — the page.jsonl verb that records each mini
	// page). The method wins, so `nav().card` is a function, and the default
	// `preview_card()` throws trying to `.ac()` it. Only a page.jsonl that
	// declares its own `card` line hits this, so the fix lives here rather
	// than in the shared `Page.class.js`.
	preview(nav = this.nav()){ return this.preview_card({ ...nav, card: undefined }); }

	content(){
		p("Every card below is one line in this folder's own `page.jsonl` — open the file (the `ext/files` tree at the bottom of this page) and you will see it in full. Click one: its url is real, a reload lands on the same card, and there is no folder anywhere on disk for it — only this one file and the class beside it.");

		div.c("grid auto gap", () => (this.cards ?? []).forEach(c =>
			a.c(`card ${c.ground || ""}`.trim(), () => {
				h3(c.title);
				p(c.body);
			}).attr("href", this.url + c.slug + "/")));

		this.log_view();
	}
}

export { MiniPages };
