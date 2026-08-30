import { Page, div, h2, p, md } from "/app.js";
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
		});

		this.previews();

		// The colophon. A magazine says who set it; this one says what out of.
		md("Set in the column program's own words — width words, `index`, `bleed`, the tone verdicts and the feeds filter. [How, and what it cost](/imagine/mag/readme/).");
	},
});
