import { Page, md, div, a, span } from "/app.js";

/* Container: a column under `/imagine/`. Size: the default track, prose. Own layout:
   `.flow`, then the wall of records. Regions: one. Preview: the default card.

   ⚠ `route()`, NOT `children:` — a declared child whose directory has no `page.js` puts
     a console 404 on every page in the subtree. `route()` is asked only for a name
     somebody actually navigated to. Copied from `/imagine/paging/doc/`, which says why. */

const RECORDS = {
	storage: ["Storage — the decision", "Why three committed `.jsonl` files beside the pages, what each line looks like, the month shard rule, and what a SQLite build artifact would be later."],
	scoring: ["Scoring — the seam", "Why the number is a weighted win rate today, exactly which method Elo or Bradley–Terry would replace, and why neither needs a column added."],
	live: ["Live — two windows, 9 ms", "A judgment cast in one window on screen in every other, without a reload: how nine lines of `ext/JSONL` do it, and the three rules it cost — including why a control is never inside the redrawn region."],
	decisions: ["Decisions — the record", "Every verdict taken here, what was left and why, and the one line this module still owes `css-scopes.txt`."],
};

export default new Page({
	meta: import.meta,
	title: "Docs",
	description: "The long form — storage, scoring, the record",
	icon: "menu_book",

	route(name){
		const record = RECORDS[name];
		if (!record) return null;

		const meta = this.meta;

		return new Page({
			title: record[0],
			description: record[1],
			content(){ return md.file(meta, name + ".md", { h1: false }); },
		});
	},

	content(){
		md("**The long form for [Importance](/imagine/importance/).** Three plain markdown files in `public/imagine/importance/doc/`.");

		div.c("page-previews", () => Object.entries(RECORDS).forEach(([name, [title, says]]) => {
			a.c("page-preview").href(this.url + name + "/").append(() => {
				span.c("page-preview-title", title);
				div.c("page-preview-desc", says);
			});
		})).style("--column", "18em");

		md("The short version is the [readme](/imagine/importance/readme/).");
	},
});
