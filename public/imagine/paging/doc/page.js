import { Page, md, div, a, span } from "/app.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s row. No page grid — content sits in
                `.page-column-prose`, so only `bleed` reaches the edge.
   2 SIZE       `large` — 28–64em. A wall of five cards wants more than the reading
                column and never more than 64em.
   3 OWN LAYOUT one sentence, then the wall. One rhythm.
   4 REGIONS    one — core's. The records are `route()` children, not columns.
   5 PREVIEW    core's default card.

   ── WHY THIS FILE EXISTS ──────────────────────────────────────────────────────
   `/imagine/paging/doc/` had no `page.js`, so it 404'd — and every link in the
   realm went straight to a `.md` file with no way to see what else was written
   beside it. Nothing crawls: a directory of markdown is invisible until a page
   names it. This is that page.

   ⚠ `route()`, NOT `children:` — the blog's `doc/` learned it first. A DECLARED
     child is loaded eagerly (`load_all_children()`), and a child whose directory
     has no `page.js` only resolves after that probe 404s. Declaring five markdown
     records would put five 404s in the console of every page under
     /imagine/paging/. `route()` is asked only for a name somebody navigated to. */

/* THE RECORDS, and one plain sentence each. The list you see and the pages you open
   come off the same object, so they cannot disagree. */
const RECORDS = {
	mechanisms: ["The four mechanisms", "What `launch`, `expand`, `swap` and `takeover` actually are, how each one is built out of parts the site already had, and the numbers measured at 1280 and 3440."],
	decisions: ["Decisions — the record", "Every verdict this realm has taken, what was rejected and why, and the traps that were found by measuring rather than by thinking. Start here if you are about to change something."],
	persistence: ["Persistence", "What remembers you, how you can tell, and how to put it back — the rule that demos never persist silently, the audit of every page under /imagine/ that saves anything, and where a page you make is written."],
	templates: ["Templates", "Which template family's machinery is imported from where, and what a made page cannot express yet."],
};

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "The long form — the mechanisms, the decisions, persistence, templates.",
	icon: "menu_book",
	width: "large",

	route(name){
		const record = RECORDS[name];
		if (!record) return null;

		const meta = this.meta;

		return {
			title: record[0],
			description: record[1],
			width: "large",
			content(){ return md.file(meta, name + ".md", { h1: false }); },
		};
	},

	content(){
		md("**The long form for [Paging](/imagine/paging/).** The hub and its pages show you the vocabulary; these four write down why it is that way, what was measured, and what was rejected. Every one of them is a plain markdown file in `public/imagine/paging/doc/`.");

		div.c("page-previews", () => Object.entries(RECORDS).forEach(([name, [title, says]]) => {
			a.c("page-preview").href(this.url + name + "/").append(() => {
				span.c("page-preview-title", title);
				div.c("page-preview-desc", says);
			});
		})).style("--column", "18em");

		md("The short version is the [readme](/imagine/paging/readme/); the shortest is the [hub](/imagine/paging/) itself, which shows all four mechanisms as small live examples you can click before reading anything.");
	},
});
