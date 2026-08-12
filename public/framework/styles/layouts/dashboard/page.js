import { Page, div, span, p, md } from "/app.js";
import detail from "../detail.js";
import { next } from "../../parts.js";

const tile = (label, value) => div.c("pad flex v gap surface").style("--gap", "0.2em").append(() => {
	span.c("h1", value);
	span.c("h4 muted", label);
});

const event = (when, what) => div.c("flex v").style("gap", "0.1em").append(() => {
	p.c("h4 muted", when);
	p(what);
});

export default new Page(detail({
	meta: import.meta,
	title: "Dashboard",
	description: "Stat tiles over a wide panel and a rail — a grid retuned by one token.",
	icon: "dashboard",

	// `fill` sizes the page to its region; on a stage the exhibit supplies the height.
	height: "40em",

	note: "Tiles, then a row that takes the slack. `--column: 8em` is the only difference from a card wall.",

	layout(){

		/* `fill` is earned here: the panel row is `flex-1`, which is a no-op on a page
		   sized to its content, and a board that stops halfway down the region is not a
		   board. Both panels own their `overflow-y`, so `fill`'s clip costs nothing. */
		return div.c("page pad fill flex v gap", () => {

			// one wrapper, so a 3440 monitor gets a board and not a spreadsheet. `flex-1`
			// carries the page's `fill` height down; `min-height: 0` lets the row scroll.
			div.c("measure flex v gap flex-1").style({ "--measure": "78em", minHeight: "0" }).append(() => {

				// `--column: 8em` is the whole difference between a tile and a card
				div.c("grid gap auto").style("--column", "8em").append(() => {
					tile("Layouts", this.parent.rail().length);
					tile("CSS rules", "0");
					tile("Media queries", "0");
					tile("Dependencies", "0");
				});

				/* ⚠ The `overflow-y` is on the ROW, not on the panel inside it. A WRAPPING
				   flex line is sized by its content and `align-content` can only grow one,
				   so a scroller on the panel never engages — the row is the last box with a
				   definite height. Without this, `fill` clips with no way down. */
				div.c("flex gap wrap flex-1").style({ minHeight: "0", overflowY: "auto" }).append(() => {

					div.c("pad flex v gap surface").style({ flex: "1 1 22em", minWidth: "0" }).append(() => {
						md(`## A board is two grids

The tiles across the top are \`grid gap auto\` with \`--column: 8em\`. The row below is
\`flex gap wrap\`: this panel takes what is left, the rail beside it holds \`14em\`.
Two arrangements, **no stylesheet.**

## The numbers are real

The first tile counts the layouts nav this page read off its parent, so a dashboard's
one job — not lying about a number — is structural rather than promised.

## Why the panel row is \`flex-1\`

The page wears \`fill\`, so it is the region's height rather than its content's, and
\`flex-1\` on this row hands it everything the tiles did not take. That is what makes
a board reach the bottom of the screen instead of floating above it, and it is the
part of this layout a screenshot cannot show you.

Scroll this panel: the tiles stay put and the footer stays put, because the row
between them is the only box that moves.

## What you would build with it

- A metrics overview or an analytics home
- A status board
- An order summary, with the rail as the activity feed`);
					});

					// the rail: the feed a board puts beside its panel
					div.c("basis pad flex v gap surface").style({ maxWidth: "100%", "--gap": "0.9em" }).append(() => {
						div.c("h4", "Activity");
						event("11:04", "framework.css — one flow token, four retired.");
						event("09:37", "Page.css — align-content: start, and a short page stopped stretching.");
						event("Yesterday", "ext/demo — one exhibit, four hand-rolled detail pages retired.");
					});
				});

				next("[Split](/framework/styles/layouts/split/) — two panes that stack themselves.",
					"styles/layouts/dashboard/");
			});
		});
	},
}));
