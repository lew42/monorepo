import { Sidebar, div, span, md } from "/app.js";
import Layout from "../Layout.js";
import recipe from "../recipe.js";
import { next } from "../../parts.js";

export default new Layout({
	meta: import.meta,
	title: "Holy grail",
	description: "Header, sidebar, main, aside, footer — the five-region page, full size.",
	icon: "view_quilt",

	// two columns and two rows on the index, so the gallery reads as a hierarchy
	card: "big",

	/* `full` zeroes the sheet, `fill` makes the page BE the region's height rather
	   than size to its content, `flex v` stacks the bands. Three words, no CSS. */
	classes: "full fill flex v",

	layout(){

		// [ title | count ] — a masthead's job, at a masthead's height
		div.c("flex v-center split pad wash", () => {
			span.c("h4", "HOLY GRAIL");
			span.c("h4 muted", "5 regions");
		});

		/* `flex gap wrap` and NOT a media query: both rails hold `var(--column)` and
		   the article holds a `22em` basis, so the row re-flows on its own width —
		   three across at 1440, the recipe dropping below at 1000, one column at 390.
		   ⚠ `overflow-y` lives HERE, not on the article. A WRAPPING flex line sizes to
		   its content, so a scroller one level deeper never engages and the last two
		   sections render permanently below the fold. */
		div.c("flex gap wrap flex-1").style({ minHeight: "0", overflowY: "auto" }).append(() => {

			/* A real `Sidebar`, not eight hand-rolled anchors: it brings its own
			   stylesheet by its own import, reads exactly what `nav_for()` returns, and
			   `Router.mark_links()` lights the row you are standing on.
			   ⚠ `basis`, not `flex-1` — a NAV RAIL IS THE FIXED HALF OF THE ROW. As
			   `flex-1` it split the slack with the article and rendered wider than the
			   reading. And the header replaces Sidebar's `brand()`, so it has to bring
			   `.brand` with it or the word sits flush against the panel's edge. */
			new Sidebar({
				pages: this.parent.rail(),
				header: () => div.c("brand", () => span.c("h4", "LAYOUTS")),
				footer: null,
			}).ac("basis");

			div.c("pad").style({ flex: "1 1 22em", minWidth: "0" }).append(() => {
				md(`## The five-region page

Header across the top, two rails, an article between them, a footer at the bottom.
It is the shape of nearly every application you have ever used, and it is the one
layout that most wants width — at a documentation column the rails eat the middle.

**The middle band is \`flex-1\`.** That is what pins the footer to the bottom of the
region rather than to the bottom of the content, and it is the only part of this
that a screenshot cannot show you.

## What you would build with it

- An IDE or an admin console — nav left, inspector right, work in the middle
- A mail client
- A monitoring board with a filter rail

## The rails

\`basis\` is \`flex: 0 0 var(--basis, var(--column))\` — the fixed half of a row, where
\`flex-1\` is the fluid half. It is a utility, not a rule this page wrote: the rail
asks for the default and the [Sidebar](/framework/styles/layouts/sidebar/) layout's
panel sets \`--basis: var(--sidebar)\`. More variations, and where each one breaks:
[Flex](/framework/styles/layouts/flex/).

## Where it wraps

Nothing here is a breakpoint. Both rails hold \`var(--column)\` and this article holds
a \`22em\` basis, so the row runs out of room and re-flows on its own. That is the same
intrinsic behaviour \`grid auto\` uses.`);
			});

			div.c("basis").style("--basis", "17em").append(() =>
				recipe(this, "Three bands stacked, the middle one taking the slack. Zero rules of its own."));
		});

		next("[Sidebar](/framework/styles/layouts/sidebar/) — the same row with one rail.",
			"styles/layouts/holy-grail/").ac("pad wash");
	},
});
