import { Page, div, h2, p, span, button, md } from "/app.js";
import { issue } from "../issue.js";
import { Article } from "../Article.js";

/* THE CONTENTS — the index column, and the only list in the magazine.

   Container: /imagine/'s column row, one column of it. Size: `large` (28–64em) — the
   entries are two-per-row at the top of that range and one at the bottom, and this is
   the column that shares the row with the cover's 38.2%. Own layout: a masthead block
   and core's `previews()` wall, told a real 22em column so entries do not deal like
   tiles. Regions: one, holding whichever article is open. Preview: the default card.

   ⚠ `index: true` — the wall below IS the navigation, so core leaves its automatic
     rail out and the six articles are listed exactly once (doc/columns.md).

   THE ARTICLES ARE BUILT HERE, from the issue. A page exists once its parent's
   `children:` names it, so the running order in `issue.json` is the running order on
   screen, the reading order of the next-hop, and the url of every article — one list,
   said once. `issue.js` uses a top-level await so all of that is settled before this
   module finishes evaluating and a cold load of an article url can resolve. */

export default new Page({
	meta: import.meta,
	title: "Contents",
	description: "Six pieces, in reading order.",
	icon: "toc",

	width: "large",
	classes: "mag-contents",
	index: true,

	children: issue.articles.map((article, i) => new (article.kind === "data" ? Article.Data : Article)({
		...article,
		name: article.slug,
		description: article.standfirst,
		classes: "mag-read",
		no: String(i + 1).padStart(2, "0"),
	})),

	content(){
		div.c("mag-head", () => {
			div.c("mag-eyebrow", `Issue ${issue.number} · ${issue.date}`);
			h2.c("mag-masthead", issue.title);
			p.c("mag-stand", issue.masthead);

			// READ STATE, one quiet line. Reactive because this column stays mounted
			// beside an open article (a page builds ONCE — doc/method/render.md) — the
			// count has to move without a reload while you read the sixth piece.
			div.c("mag-read-line", $line => this.watch(() => $line.empty(() => {
				span(`${this.read.size} of ${issue.articles.length} read`);
				if (this.read.size) button.c("mag-read-reset", "Reset").click(() => this.reset_read());
			})));
		});

		this.previews();

		// The colophon. A magazine says who set it; this one says what out of.
		md("Set in the column program's own words — width words, `index`, `bleed`, the tone verdicts and the feeds filter. [How, and what it cost](/imagine/mag/readme/).");
	},

	// ════ READ STATE — one record, kept where the whole issue already lives ═══
	// An article has no list of its own; it asks ME (`this.parent` from Article.js).
	// One key (`lew42:/imagine/mag/contents/`), one array of slugs — never nine.
	initialize(){
		this.read = new Set(this.store().get({ read: [] }).read);
	},

	// Storage is not state (doc/method/store.md) — a redraw is three lines this
	// page already owns, the same shape `/imagine/game/` uses for its own store.
	watch(fn){ (this.watchers ??= []).push(fn); fn(); },
	bump(){ this.watchers?.forEach(fn => fn()); },

	mark_read(slug){
		if (this.read.has(slug)) return;
		this.read.add(slug);
		this.store().set({ read: [...this.read] });
		this.bump();
	},

	is_read(slug){ return this.read.has(slug); },

	// The one eraser. `clear()`, not `set({ read: [] })` — until the next article is
	// opened this browser holds nothing about the issue's read state at all.
	reset_read(){
		this.read.clear();
		this.store().clear();
		this.bump();
	},
});
