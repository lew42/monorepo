import { Page, View, md, p, img } from "/app.js";
import { DnStudy } from "./lab.js";

View.stylesheet(import.meta, "navigation.css");

const here = new URL(".", import.meta.url).pathname;

/* Container: a plain page under `web/nav/doc/` (moved from `/imagine/design/`'s columns
   row 2026-09-18, `ai/2026-09-18/imagine-move-2/`).
   Size: `full`, the word every study in this realm wears; the lab needs the whole
   host or the two demo rows cannot sit side by side.
   Own layout: the page's own prose flow, plus ONE full-width band (the lab) —
   a plain `div`, so the page's own measure cap on p/h1-h6/ul does not reach it.
   Regions: none. Children: two, and they are the detail one click down.
   Preview: a real screenshot, drawn by `preview()` below wherever a parent lists
   this page in a card wall. */

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Does the navigation stay still when a column opens? Since 2026-09-18 it does. Three rows, one click — core as it is, the proposal that became core, and the even mode — and all three now read 0.",
	icon: "explore",
	width: "full",

	children: "mechanisms numbers",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink). The shot IS the study: the two rows after
	// the same click, one reading 129px and 225px, the other reading 0px and 0px.
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/stability-card.png").attr("alt", nav.label));
	},

	content(){
		// ⚠ ONE line before the demo, not two paragraphs. The two rows carry their own
		//   labels (TODAY / THE STABLE ROW), the button carries its own hint, and each
		//   row writes its own sentence from its own measurement — so six lines
		//   explaining the defect before anything is shown were six lines telling the
		//   reader what they were about to see (2026-09-17).
		p("Open a column, and the columns that were already open should not move. Until 2026-09-18 they did: a column paid for the next one, and up to 242px of nav slid down the page. Click the button and watch all three rows read 0.");

		new DnStudy();

		md("**The rule, in one sentence.** A column that is already open never changes width when a column opens to its right; the new column takes what is left over, and when there is no leftover the row scrolls sideways — the Finder way — instead of squeezing what is open. That is now what core does. The declaration is one line of `core/Page/Page.css` (`flex: 0 0 <the width the column recommends>`), the before and after are in [core/Page — Columns](/framework/core/Page/doc/columns/), and the study that proposed it and measured the defect is [here](/framework/ai/2026-09-17/nav-stability/). **The first row is no longer a before-and-after — it is core now, so it reads 0 like the other two.**");

		md("**The third row is the one that shipped.** `this.columns({ even: true })` gives a row N columns of ONE width, where N is the room divided by the width a column recommends — so a column opens into a slot that was already there and nothing on screen changes size. Past N the row slides sideways by exactly one column, over 600ms, and the crumb strip above it is how you get back to the ones behind you. The mode, N at every screen width, and the three ways of animating that slide with their measured frame counts: [core/Page — Columns](/framework/core/Page/doc/columns/).");

		md("On four real pages, **before the change**, the worst click moved an open column **242px** sideways, changed its width by **181px** and dropped a nav link **170px** down the page — all at 1280. Re-crawled after it: **0px and 0px** on every one of them. At 400 nothing moves at all: core already pages the row one column at a time and the crumb strip above it holds its place to the pixel. Every number is in **Numbers**, below.");

	},
});
