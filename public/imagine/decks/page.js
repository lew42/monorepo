import { Page, md } from "/app.js";

/* Container: /imagine/'s column row, one `large` column. Size: 28–64em. Own layout: a
   line of prose and core's previews wall, grouped by the `group` each child declares.
   Regions: one, core's. Preview: the default card.

   This index is an ordinary column ON PURPOSE — it is the last thing you see before a
   screen takes over, so it keeps its head, its × and the crumb strip. Everything it
   links to has none of them. */

export default new Page({
	meta: import.meta,
	title: "Decks",
	description: "Presentational layouts — cutting a screen, and what belongs in each piece.",
	icon: "slideshow",
	width: "large",
	index: true,

	children: "half golden aside triptych poster four quarters persist swap pitch",

	content(){
		md("**Slide-grade layouts.** [`/imagine/screens/`](/imagine/screens/) found the two words a whole screen is made of — `full` replaces, `fill` joins. This lab is one rung in: once you have the screen, **how do you cut it**, and what kind of content survives the piece it lands in.");

		md("A region here is a **flex weight**, not a column: `flex: 61.8 1 0` beside `flex: 38.2 1 0` is the golden section at 400, 1920 and 3440 alike. The cards below are the cuts, and each cell is toned by the content kind that belongs in it.");

		this.previews();

		md("### The five kinds, and the one property that separates them");

		md(`| kind | how it answers a wider region | belongs in |
|---|---|---|
| **statement** | scales — the type is 13% of its own block | the major share, or the whole screen |
| **stage** | scales — an aspect box has no wrong width | any region of any cut |
| **wall** | adds columns — one token, no breakpoint | any share, and the only kind happy at 633px |
| **notes** | caps at its measure and centres | a minor share, 500–1200px |
| **list** | **does not scale** — a row is its label | a fixed track (\`small\`), never a share |`);

		md("That last row is the whole content-kind map in one line: four of the five kinds take a *share* and get better; a nav list takes a share and gets a chevron chasm. Every cut in this lab is a different answer to where the list goes.");

		md("The measured widths, the persistent-vs-swap verdict and what was cut: [readme](/imagine/decks/readme/) · [decisions](/imagine/decks/doc/decisions/).");
	},
});
