import { div, h2, h3, p, span, md } from "/app.js";
import { Paging } from "../../paging.js";
import { SURFACES } from "../../blocks.js";

// The five surface words, in the realm's one list. `blocks.js` holds them as
// objects now; this wall only ever wanted the words.
const STYLES = SURFACES.map(surface => surface.id);
import { TYPE as TYPE_WORDS } from "../../blocks.js";

const TYPE = TYPE_WORDS.map(step => step.id);
import { family } from "../families.js";
import { Post } from "/blog/Post.js";
import { listed } from "/blog/posts.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  a column in /imagine/'s row. `full` — the whole row, every ancestor
                folded into the crumb strip, which is also the way back.
   2 SIZE       the viewport: 1280 gives the wall three legible columns, 3440 gives
                all fifteen cells side by side, which is the point of the page.
   3 OWN LAYOUT one grid: a label column plus one column per type scale, five rows,
                one per surface. `bleed` on the grid so it spends the column's own
                inset rather than sitting inside the prose measure.
   4 REGIONS    one, core's. No children.
   5 PREVIEW    core's default card.

   ⚠ `full` and NO stage: this page is a wall, not a demo with chips over it. The
     fifteen cells ARE the chips, all pressed at once — which is the only way to see
     colour × typography as one picture instead of as fifteen clicks.               */

const blog = family("blog");

/* ONE CELL'S CONTENT — the blog front's own two levels, drawn by the blog's own
   statics: `Post.hero()` is the lead, `Post.card()` is a row of the wall under it.
   Two levels is what makes HIERARCHY visible: a type scale that only moved one size
   would look like a font-size change rather than a ramp. */
const cell = () => { blog.example(null, false); Post.card(listed()[1]).ac("templates-cell-card"); };

// WHAT ACTUALLY DOES EACH SURFACE — read off `paging.css`, one line each, so the
// picture always has the declaration that made it beside it.
const SURFACE_TOKEN = {
	plain: "background: var(--wash)",
	card:  ".paging-box: var(--surface) + --shade-a08/a16",
	tint:  "background: var(--surface)",
	prim:  "color-mix(in srgb, var(--prim) 10%, var(--surface))",
	dark:  "color-scheme: dark — every light-dark() token flips",
};

const TYPE_TOKEN = {
	compact: "--templates-step: 0.88 · --templates-ramp: 0.8",
	regular: "--templates-step: 1 · --templates-ramp: 1",
	display: "--templates-step: 1.06 · --templates-ramp: 1.35",
};

export default new Paging({
	meta: import.meta,
	title: "Theming",
	description: "Five surfaces x three type scales, at once.",
	icon: "palette",
	width: "full",
	axes: "",

	takeaway: "**One template, fifteen times: five surfaces across, three type scales down — every combination this site can make, in one screen.** Every cell is the same real blog section — `Post.hero()` for the lead and `Post.card()` for the row under it, over the same two real posts. Nothing but the two words on the box changed.",

	content(){
		this.lede();

		md("**Colour is one class and typography is another, and neither knows about the other.** That is why there are fifteen cells and not fifteen designs: a surface is one declaration on the page's box (`paging.css`), a type scale is one custom property on the same box, and any pair composes. The token that does each one is printed beside it.");

		h2("The wall");

		div.c("templates-theming bleed", () => {
			// The head row: nothing over the labels, then one heading per type scale.
			div.c("templates-theming-corner", "surface ↓ / type →");

			TYPE.forEach(type => div.c("templates-theming-head", () => {
				h3(type);
				span.c("templates-theming-token", TYPE_TOKEN[type]);
			}));

			STYLES.forEach(style => {
				div.c("templates-theming-label", () => {
					h3(style);
					span.c("templates-theming-token", SURFACE_TOKEN[style]);
				});

				TYPE.forEach(type => div.c("templates-cell paging-surface-" + style + " templates-type-" + type, () => {
					div.c("paging-box", () => { cell(); });
				}));
			});
		});

		h2("What you are looking at");

		md("**Down the page, colour.** `plain` is the ambient floor with no frame · `card` puts a white padded box on that floor with a real drop shadow · `tint` is one subtle step off it · `prim` tints the same surface with 10% of the accent · `dark` is a **colour-scheme island** — one declaration, and every `light-dark()` token below it resolves to its dark value, ink and lines and fills together. No cell names a colour.");

		md("**Across the page, hierarchy.** One custom property moves the type step, and the heading ramp follows it: `compact` is a dense index or a rail, `regular` is every page you have read on this site, `display` is a cover or a slide. The words are identical in all fifteen cells — only the ratio between them moved.");

		md("**What this proves for templates.** A template family and a theme are independent choices, the same way a mechanism and a surface are ([Paging](/imagine/paging/)). Any of the eleven [templates](/imagine/paging/templates/) can be worn in any of these fifteen ways, which is why a made page needs FOUR words and not two: a template, a surface, a type scale, and what a click does. [The proposal](/imagine/paging/doc/templates.md).");

		p.c("muted", "Every cell is a real link — the lead in it goes to the real post it names.");
	},
});
