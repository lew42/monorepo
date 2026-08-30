import { Page, md } from "/app.js";

/* Container: a column of /imagine/'s row — so content lands in `.page-column-prose`
   and only `bleed` reaches the edge (`previews()` already carries it). Size: the
   `large` word, 28–64em, because this is a wall and not prose. Own layout: one
   previews wall. Regions: one — `index: true` keeps core from listing the same eight
   candidates a second time as rows. Preview: the default card.

   Every candidate is a WHOLE SCREEN, not a column: each one escapes the row by
   drawing itself (`../Blog.js`), hides the site's strip, and takes the viewport. That
   is the first verdict here — a blog's own rail IS the navigation, and a second site
   rail beside it is two rails saying different things. */

export default new Page({
	meta: import.meta,
	title: "Blogx",
	description: "Eight blog shells, judged at 3440 first. Above-the-fold fronts, left rails, and two ways to read a four-part post.",
	icon: "newspaper",

	width: "large",
	index: true,

	children: "front board deck finder rail dig parts swap",

	content(){
		md(`**Eight shells, one blog.** All eight render the same eight posts, so the only variable on screen is the layout. Every card, row and chip is a real link — open one and dig; the strip along the floor of every candidate takes you to the next.

Judged at **3440 first**, then 1920, then 400. Read the verdicts in [readme.md](/imagine/blogx/readme.md).`);

		this.previews();

		md(`### What the eight are for

**Fronts** — [Magazine](/imagine/blogx/front/), [Dashboard](/imagine/blogx/board/), [Deck](/imagine/blogx/deck/), [Columns](/imagine/blogx/finder/): four answers to *what fills 3440 above the fold*.
**Rails** — [Two-level](/imagine/blogx/rail/) and [Dynamic](/imagine/blogx/dig/): the same archive as a fixed tree, and as a rail that changes with depth.
**Parts** — [As columns](/imagine/blogx/parts/) and [In place](/imagine/blogx/swap/): a four-part post read side by side, and swapped under a strip that never moves.

The one rule they all keep: **no reading column is ever over 42em.** A wide screen is filled with more columns, never a wider one.`);
	},
});
