import { md, div, a, span } from "/app.js";
import { Paging } from "../paging.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the app's middle — a `.pages` region with core's page grid in it.
   2 SIZE       prose at the 40em measure; the wall of five cards is `.page-previews`,
                which pays its own gutter back and spreads with the middle.
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
     has no `page.js` only resolves after that probe 404s. Declaring four markdown
     records would put four 404s in the console of every page under
     /imagine/paging/. `route()` is asked only for a name somebody navigated to. */

/* THE RECORDS, and one plain sentence each. The list you see and the pages you open
   come off the same object, so they cannot disagree. */
const RECORDS = {
	mechanisms: ["The four mechanisms", "What launch, expand, swap and takeover actually are, how each is built out of parts the site already had, and the numbers measured at 1280 and 3440."],
	decisions: ["Decisions — the record", "Every verdict this realm has taken, what was rejected, and the traps found by measuring. Start here before you change anything."],
	persistence: ["Persistence", "What remembers you, how you can tell, and how to put it back — the rule that demos never persist silently, and where a page you make is written."],
	templates: ["Templates", "Which template family's machinery is imported from where, and what a page you make cannot express yet."],
	builder: ["Builder", "How a page is built with a UI: the census of every page file (22% pure configuration, 42% one renderer away, 35% code), the controls in order, and why a tab is just a child page."],
};

export default new Paging({
	meta: import.meta,
	title: "Docs",
	description: "The long form — the mechanisms, the decisions, persistence, templates.",
	icon: "menu_book",
	route(name){
		const record = RECORDS[name];
		if (!record) return null;

		const meta = this.meta;

		return new Paging({
			title: record[0],
			description: record[1],
			content(){ return md.file(meta, name + ".md", { h1: false }); },
		});
	},

	content(){
		md("**The long form for [Paging](/imagine/paging/).** The hub and its pages show you the vocabulary; these four write down why it is that way, what was measured, and what was rejected. Every one of them is a plain markdown file in `public/imagine/paging/doc/`.");

		div.c("page-previews wide", () => Object.entries(RECORDS).forEach(([name, [title, says]]) => {
			a.c("page-preview").href(this.url + name + "/").append(() => {
				span.c("page-preview-title", title);
				div.c("page-preview-desc", says);
			});
		})).style("--column", "18em");

		md("The short version is the [readme](/imagine/paging/readme/); the shortest is the [hub](/imagine/paging/) itself, which shows all four mechanisms as small live examples you can click before reading anything.");
	},
});
