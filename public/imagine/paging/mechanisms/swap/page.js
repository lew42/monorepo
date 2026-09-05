import { h2, md } from "/app.js";
import { Paging } from "../../paging.js";
import { PagingSwapper } from "./swap.js";

/* Container: the app's middle. Size: prose at the measure, both stages on `wide`.
   Own layout: a sentence, a tab strip and its panel, then the same swap drawn three
   other ways. Regions: one. Preview: core's card.

   ⚠ TABS FIRST, and nothing before them but one instruction. A swap IS the most
     familiar switcher there is, so the page opens by BEING one — the reader clicks
     a tab, sees the panel change and the box hold still, and only then meets the
     word. (Before 2026-09-05 this page opened with three sentences of definition
     and three rows labelled "Same box", "Same width", "One way back" — captions
     that are conclusions you can only check after you have already seen it work.
     The owner: "these buttons: Same box, Same width… swap content above??? It's
     like the most unintuitive version of tabs." doc/decisions.md.)               */

export default new Paging({
	meta: import.meta,
	title: "Swap",
	description: "A click replaces what is in the box. The box keeps its exact place on screen.",
	icon: "swap_horiz",

	content(){
		this.lede("Click **Pricing** on the page below, then **Docs**. Watch the white box: the line under it measures it for you every time.");

		this.stage({ navigation: "tabs", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" });

		h2("The same swap, drawn three other ways");

		md("A tab strip is one way to draw a swap, not the mechanism. Press **card-in**, **cross-fade** and **flip** below and watch the same rectangle.");

		new PagingSwapper();

		h2("Which one to reach for");

		md("**Tabs** and **cross-fade** move nothing at all, so they are the quiet ones. **Card-in** shows a direction, which is worth its 220ms when the panels are a sequence. **Flip** says *this is the other side of the same thing*, loudly enough that it is wrong for anything you switch often.");

		md("Measured before and after every click, at 1280 and 3440: [the proof](/framework/ai/2026-09-04/paging-core/) · [the four visuals](/framework/ai/2026-09-05/paging-mechanisms-v2/). Two more visuals live next door in [codrops](/imagine/codrops/) — a circular wipe and a card stack.");
	},
});
