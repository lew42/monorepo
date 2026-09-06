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

	lede_line: "Change the **content** dropdown in the bar. The box stays exactly where it is, and something else entirely appears inside it.",

	config: { navigation: "none", content: "cards", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },

	/* THE NINTH ANSWER. It is not a value, so it is not a card — it is a field, and
	   the two links below are the shortest way to see it work without typing. */
	extra(){
		h2("…or the address of any page or file");

		md("The eight above are a list. **The ninth answer is not**: pick **A page or file…** in the *content* dropdown and a field appears under it. Type an address and the box holds whatever is there.");

		md("- **A page's address** — its `page.json` is fetched and the page is *run* inside the box, wearing its own seven words, drawing its own children. [Put a page you made in the box →](/imagine/paging/?content=%2Fimagine%2Fpaging%2Fmake%2Fnotes%2F&room=wide)\n"
			+ "- **A `.md` file's address** — fetched and rendered as prose. [Put a note from `/notes/` in the box →](/imagine/paging/?content=%2Fnotes%2Fauth%2Freadme.md)");

		md("Both links are cold urls: open one in a fresh browser and you get exactly that page. That is what makes this the word that takes the realm's ~117,600 configurations off a ceiling — the box can hold anything on the site, and the address says which.");
	},
});
