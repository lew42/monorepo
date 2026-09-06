import { h2, md } from "/app.js";
import { Paging } from "../../paging.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, the live page, one short section. Regions: one.
   Preview: core's card.

   ⚠ THE PAGE CALLED EXPAND NOW EXPANDS. Until 2026-09-05 three of the four mechanisms
     were navigation words and `expand` was not, so this page ran `navigation: "rail"`
     and nothing on its first screen opened in place — the label did not deliver what
     it promised, which was the newcomer's whole reason for holding `intuitive` at 4
     (paging-audit-5, item 2). `expand` is a navigation word now (`../../blocks.js`),
     drawn as `<details>` rows by the one renderer.

   ⚠ IT IS ALSO THE ONE MECHANISM THAT IS DELIBERATELY NOT A PLACE: there is nothing
     to link to and nothing for the Back button to do. The page says that AFTER you
     have seen it happen, not before. */

export default new Paging({
	meta: import.meta,
	title: "Expand",
	description: "A click opens BELOW, in place. Nothing else moves and the url never changes.",
	icon: "expand_more",

	content(){
		this.lede("**Open a page name on the page below.** The row grows downward, the line under the box says how many pixels the box grew by, and the address bar does not change at all.");

		this.stage({ navigation: "expand", content: "article", room: "reading", arrangement: "plain", surface: "card", background: "plain", type: "regular" });

		h2("What it is made of");

		md("A `<details>` element and one hairline — the site's own [`ui/accordion`](/framework/ui/accordion/), which has no JavaScript in it at all. The browser opens the row; nothing here listens for the click except the line that measures the box afterwards.");

		h2("When it is the right answer");

		md("When the thing you are opening is short enough to read without losing your place — a definition, a count, a caption, one row of detail. **When it is the wrong one:** when what you opened has children of its own, or is worth sending to somebody. **`expand` never routes** — an opened row has no address, so it cannot be linked to, bookmarked, or reached with the Back button. A panel with no url is a dead end wearing a link's clothes; when a child deserves an address, reach for **columns** or **takeover** instead ([the four mechanisms](/imagine/paging/mechanisms/)).");
	},
});
