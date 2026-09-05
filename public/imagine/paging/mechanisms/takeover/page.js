import { h2, md } from "/app.js";
import { Paging } from "../../paging.js";

/* Container: the app's middle. Size: prose at the measure; the stage opens on
   `room: full`, which leaves the flow and covers the region (z-index 35, under
   ext/drawer's 40). Own layout: a sentence, the live page, one short section.
   Regions: one. Preview: core's card.

   ⚠ The way back is at the stage's own top-left, where the eye already is — a
     takeover whose only exit is the browser's Back button is a trap. */

export default new Paging({
	meta: import.meta,
	title: "Takeover",
	description: "One child fills the screen; everything behind it collapses into the trail above.",
	icon: "open_in_full",

	content(){
		this.lede("The page below has taken the screen. Click a page name in it, then use the trail at the top to come back — and *leave full screen* to put it in its box again.");

		this.stage({ navigation: "takeover", content: "article", room: "full", arrangement: "plain", surface: "dark", background: "dark", type: "display" });

		h2("What it is made of");

		md("One word. `width: \"full\"` on a page under a columns host, and one `:has()` rule in `Page.css` stands its ancestors down while it is the deepest thing open — nothing is unmounted, nothing is fixed-positioned, and clicking a crumb brings the row straight back. [Columns](/framework/core/Page/doc/columns/).");

		md("Reach for it when the content IS the whole experience — a kiosk, a walkthrough, a picker. Reach for a rail instead when the chrome has to survive every click.");
	},
});
