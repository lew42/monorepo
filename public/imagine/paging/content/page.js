import { h2, md } from "/app.js";
import { block } from "../block.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, one live page, a nav grid of eight, then the ninth answer.
   Regions: one. Preview: core's card.

   ⚠ CONTENT IS NOT A SIZE. Until 2026-09-05 this axis was one canned sample drawn at
     five heights (`xs`–`xl`), which the owner read as a content switcher because
     that is exactly what it was. Every value below is a different KIND of content,
     and each one is drawn by a module this site already ships.

   ⚠ AND IT IS THE ONE WORD THAT IS NOT A CLOSED LIST. `content` takes a url too, so
     the box can hold a page or a `.md` file nobody wrote when this realm was written
     — which is the last of the realm's three closed lists to open (paging-audit-5). */

export default block({
	meta: import.meta,
	title: "Content",
	icon: "article",
	description: "What is in the box — one of eight kinds, or the address of anything you like.",

	axis: "content",

	/* ⚠ THE LEDE SAYS THE NINTH ANSWER. It is the most powerful thing in the realm — the
	     one word that is not a closed list — and it was two folds down its own page, under
	     the eight cards (paging-audit-6, item 5). */
	lede_line: "Change the **content** dropdown in the bar. The box stays exactly where it is, and something else entirely appears inside it. There are eight kinds — and a ninth answer that is not a kind at all: **the address of any page you made, any ready-made page, or any `.md` file on this site**, fetched and drawn right there.",

	config: { navigation: "none", content: "cards", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },

	/* THE NINTH ANSWER. It is not a value, so it is not a card — it is a field, and
	   the two links below are the shortest way to see it work without typing. */
	extra(){
		h2("…or the address of any page or file");

		md("The eight above are a list. **The ninth answer is not**: pick **A page or file…** in the *content* dropdown and a field appears under it. Type an address and the box holds whatever is there.");

		md("- **A page you made** — its `page.json` is fetched and the page is *run* inside the box, wearing its own seven words, drawing its own children. [Put a page you made in the box →](/imagine/paging/?content=%2Fimagine%2Fpaging%2Fmake%2Fnotes%2F&room=wide)\n"
			+ "- **A ready-made page** — one of the twelve in the library, by its own address. [Put the blog post in the box →](/imagine/paging/?content=%2Fimagine%2Fpaging%2Flibrary%2Fblog-post%2F&room=wide)\n"
			+ "- **A `.md` file** — fetched and rendered as prose. [Put a note from `/notes/` in the box →](/imagine/paging/?content=%2Fnotes%2Fauth%2Freadme.md)");

		md("Those three are the whole list, and the box says so when an address is not one of them. An address on **another site** is kept in the address bar and refused out loud: this site is static, so it can only read the files it serves itself.");

		md("Both links are cold urls: open one in a fresh browser and you get exactly that page. That is what makes this the word that takes the realm's ~117,600 configurations off a ceiling — the box can hold anything on the site, and the address says which.");
	},
});
