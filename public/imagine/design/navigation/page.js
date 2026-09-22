import { Page, View, md, p, img } from "/app.js";
import { DnStudy } from "./lab.js";

View.stylesheet(import.meta, "navigation.css");

const here = new URL(".", import.meta.url).pathname;

/* Container: a column of /imagine/design/'s row — /imagine/ is the columns host.
   Size: `full`, the word every study in this realm wears; the lab needs the whole
   host or the two demo rows cannot sit side by side.
   Own layout: the column's own prose flow, plus ONE full-width band (the lab) —
   a plain `div`, so `.page-column-prose`'s 40em cap on p/h1-h6/ul does not reach it.
   Regions: none. Children: two, and they are the detail one click down.
   Preview: a real screenshot on the design/ index (see below). */

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Does the navigation stay still when a column opens? Today it moves up to 242px. One rule, side by side, that moves 0.",
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
		p("Open a column, and the columns that were already open should not move. On this site they do.");

		new DnStudy();

		md("**The rule, in one sentence.** A column that is already open never changes width when a column opens to its right; the new column takes what is left over, and when there is no leftover the row scrolls sideways — the Finder way — instead of squeezing what is open. The exact CSS, and what it would replace in `core/Page/Page.css`, is in [the proposal](/framework/ai/2026-09-17/nav-stability/).");

		md("On four real pages the worst click moved an open column **242px** sideways, changed its width by **181px** and dropped a nav link **170px** down the page — all at 1280. At 400 nothing moves at all: core already pages the row one column at a time and the crumb strip above it holds its place to the pixel. Every number is in **Numbers**, below.");

	},
});
