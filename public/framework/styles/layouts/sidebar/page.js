import { Page, demo, Sidebar, div, span, md } from "/app.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Sidebar",
	description: "A fixed panel beside fluid content — two utility classes, no rule.",
	icon: "view_sidebar",
	group: "Apps",

	note: "One row, edge to edge. The panel is `basis` at `--sidebar`; the article is a `22em` basis, so the pair re-flows on its own width.",

	layout(){

		/* `full`, because a navigation panel that stops short of the region's edge is a
		   list, not a rail. NO `fill`, and that was measured: a wrapping flex row sizes
		   its line to its CONTENT, so `fill`'s clip would cut the bottom of the article
		   with nothing to scroll it. The page grows and the region scrolls. */
		return div.c("page full flex v", () => {

			/* `wrap` plus a `22em` basis on the article, and no breakpoint: 19em + 22em
			   fits at 1440 and at 1000, and runs out at 390, where the panel drops above
			   the reading. The Sidebar's own query turns it into a top bar at 52em, so the
			   stacked result is a bar over an article. */
			div.c("flex gap wrap flex-1").style("minHeight", "0").append(() => {

				/* ⚠ The header REPLACES Sidebar's `brand()`, which is the element carrying
				   the panel's inset — a bare span sits flush against the edge. */
				new Sidebar({
					pages: this.parent.rail(),
					header: () => div.c("brand", () => span.c("h4", "LAYOUTS")),
					footer: null,
				}).ac("basis").style("--basis", "var(--sidebar)");

				div.c("pad flex v gap").style({ flex: "1 1 22em", minWidth: "0" }).append(() => {

					md(`## A panel beside the reading

The panel is as tall as the page, the column beside it holds the words, and the whole
thing scrolls as one. That last part is a choice: to make the rail hold still while
only the article moves, the rail needs a region of its own to scroll inside — which is
what \`/framework/\` does with the sidebar on your left, and it costs a nested
\`.pages\` and a media query. **This is the no-rule version.**

**The rail is a real \`Sidebar\`.** A \`View\` subclass that brings its own stylesheet,
reads exactly the \`{ url, label, icon }\` that \`nav_for()\` returns, and gets its
active row lit by \`Router.mark_links()\`. Click one and this page becomes that layout.

## No rule at all

\`\`\`js
new Sidebar({ pages }).ac("basis").style("--basis", "var(--sidebar)");
\`\`\`

\`flex-1\` names the fluid half of a two-column row and \`basis\` names the fixed half —
\`flex: 0 0 var(--basis, var(--column)); min-width: 0\`, in \`framework.css\`.
\`--sidebar\` is the same token the site's own rail reads, which is why this
demonstration and the real navigation cannot disagree about a width.

## Where it stacks

Side by side at 1440 and at 1000, stacked at 390 — and the bar keeps its \`19em\` when
it wraps, because a fixed basis is fixed on every line it lands on. Making it *fill*
the narrow line is the one thing that needs a query, which is the third of the three
lines \`/framework/\` spends on its own rail. **That is the honest price of the
intrinsic version: it re-flows for free and it does not re-shape.** Side by side with
the alternatives: [Flex](/framework/styles/layouts/flex/).

## What you would build with it

- A documentation section — this site's \`/framework/\` is exactly this layout
- Any app screen with persistent navigation
- A settings page with a category list

To stack it deliberately instead of intrinsically, swap the fixed basis for \`flex gap
auto\`: every child gets \`flex: 1 1 var(--column)\` and the two panes become equals.
That is [flex gap auto](/framework/styles/layouts/flex/auto/).`);
				});
			});
		});
	},
}));
