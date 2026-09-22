import { Page, View, h2, p, a, span, img, md } from "/app.js";
import { ColorStudy } from "./study.js";

View.stylesheet(import.meta, "color-study.css");
const here = new URL(".", import.meta.url).pathname;

/**
 * Lighten and darken — white at an alpha, black at an alpha — on five grounds, plus what a
 * vivid accent can and cannot carry.
 *
 * Layout (the five questions, 2026-09-17). Container: a plain page under
 * `styles/system/studies/` (moved from the /imagine/ columns host 2026-09-18,
 * `ai/2026-09-18/imagine-move-2/`). Size: `full`, the word every sibling study
 * wears. Own layout: `.grid.auto` with `--column: 17em`, the site's word for a
 * wall — one tile at 400, four or more at 3440. Regions: three, in importance order — the live
 * takeaway, the grounds wall, the accent lab. Preview: a screenshot of the wall.
 *
 * The 2026-09-01 palette crawl that used to live here is intact one click down, at ./palette/.
 */
export default new Page({
	meta: import.meta,
	title: "Color",
	description: "Lighten and darken on five grounds, and what a vivid accent can carry.",
	icon: "palette",
	width: "full",

	children: "palette sections",

	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/grounds.jpg").attr("alt", nav.label));
	},

	content(){
		// A fresh study per render: every cell holds a live View, so reusing one across
		// renders would measure boxes that are no longer on the page.
		// ⚠ The live sentence is NOT built here any more. It belongs to the accent lab,
		//   directly under the two sliders that write it — see `lab()` in study.js.
		const study = new ColorStudy();

		md("**Lighten** is white at some alpha; **darken** is black at some alpha. Six tokens say those two directions at three strengths that double — `--lighten-1/2/3` and `--darken-1/2/3`, 8%, 16% and 32%.");

		// No wrapper div: the page's own prose flow owns the rhythm between these, and a
		// box around them would take the flow — and the `--measure` cap on the headings
		// and paragraphs inside it — away.
		const $wall = study.wall();

		md("Every cell above is painted with the real token. The step's name is painted in the site's own `--ink`, so you watch it read or stop reading; beside it is the colour the browser actually composited and the contrast of that ink on it, forced legible so the number itself is always readable. **text ok** means 4.5:1 or better, enough for body text; **UI only** means 3:1, enough for large text and for shapes like a border or an icon; **no** means neither.").ac("muted");

		h2("The accent");
		md("A vivid accent is the colour most likely to fail, because vivid and readable are not the same thing. **Drag the two sliders.** Every rung is the same hue at the same lightness — only the saturation changes — so whatever moves in the numbers is saturation's doing and nothing else's.");
		study.lab();
		study.watch($wall);

		h2("Where the tokens live");
		md("The six names are aliases onto the alpha ladder that was already in `public/framework/framework.css` — `--lighten-2` and `--paper-a16` paint the identical pixel. Nothing moved; the ladder just gained the words you actually think in. Reach for `--fill-aNN` when you want the step to flip with the colour scheme (elevation is lighter on both sides), and for lighten/darken when you are painting onto a ground of your own and already know which direction you mean.");
		md("**The rule this study exists to serve:** a thing needs padding only when it needs a box — a background different from its parent's. Padding with no background change floats the thing in midair, off the margins its siblings line up with. The layout skill's *Boxes, padding and contrast* section is the long form, and it points back here.");

		// ⚠ The link is a few words, not the whole sentence. A three-line link reads as
		//   a paragraph that happens to be underlined, and this page already carries a
		//   "Palette" child link under it — two links to one place, one of them a blob.
		p(() => {
			a("Where two grounds meet").href(here + "sections/");
			span(" — the same question one level up: every pairing of the site's six grounds stacked, and every nesting, with the seam between them measured.");
		});

		p(() => {
			a("The palette crawl").href(here + "palette/");
			span(" — every colour token this theme defines, what each one paints, and the seven real contrast failures it found on the live site.");
		});

		md.details(import.meta, "decisions.md", "The record — why the six names are aliases, what the study measured, and what was refuted")
			.ac("color-record");
	},
});
