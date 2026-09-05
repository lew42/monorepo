import { h2, md } from "/app.js";
import { Paging } from "../../paging.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide`.
   Own layout: a sentence, the live page, one short section. Regions: one.
   Preview: core's card.

   `expand` is the one mechanism that is deliberately NOT a place: there is nothing
   to link to and nothing for the Back button to do. The page says that after you
   have seen it happen, not before. */

export default new Paging({
	meta: import.meta,
	title: "Expand",
	description: "A click opens BELOW, in place. Nothing else moves and the url never changes.",
	icon: "expand_more",

	content(){
		this.lede("Click a page name in the rail on the page below. Watch the address bar: it does not change.");

		this.stage({ navigation: "rail", content: "article", room: "reading", arrangement: "plain", surface: "card", background: "plain", type: "regular" });

		h2("When it is the right answer");

		md("When the thing you are opening is short enough to read without losing your place — a definition, a count, a caption, one row of detail. **When it is the wrong one:** when what you opened has children of its own, or is worth sending to somebody. A panel with no url is a dead end wearing a link's clothes.");

		md("The site's own no-JavaScript version of this gesture is [`ui/accordion`](/framework/ui/accordion/) — a `<details>` element and one stylesheet.");
	},
});
