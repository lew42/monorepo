import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the wall take `wide`;
   prose keeps the measure. Two regions, no children.

   Six wireframes are sketched. Rebuilding them as real boxes is the only way to test
   the note's own sentence — "layouts rely on proper fit" — so each sketch is a small
   box at the size it was drawn for, and the note's warning sits under the one it is
   about. Every box uses framework words only (flex, grid, gap, pad, surface): a
   sketch that needs new CSS is not a layout, it is a page. */

const SKETCH = (name, says, build) => ({ name, says, build });

const box = (h = "7em") => div.c("surface").style({ height: h, borderStyle: "dashed" });

const SKETCHES = [
	SKETCH("Rail · canvas · rail", "Two thin sides, one wide middle. The near-universal shell.",
		() => div.c("flex gap").style("height", "7em").append(() => {
			box("100%").style("flex", "0 0 3.5em");
			box("100%").style("flex", "1 1 auto");
			box("100%").style("flex", "0 0 3.5em");
		})),

	SKETCH("Framed hero", "A frame, a title, one big picture, a label down the edge.",
		() => div.c("surface pad flex gap").style("height", "7em").append(() => {
			div.c("flex v gap flex-1").append(() => {
				span.c("muted").style("fontSize", "0.75em").text("title");
				box("100%").style("flex", "1 1 auto");
			});
			div.c("surface").style({ flex: "0 0 1.2em", borderStyle: "dashed" });
		})),

	SKETCH("Header, content, header", "The one the note flags with a ⚠ — a second header, below the fold.",
		() => div.c("flex v gap").style("height", "7em").append(() => {
			div.c("surface pad").style("fontSize", "0.7em").text("HEADER");
			box("100%").style("flex", "1 1 auto");
			div.c("surface pad").style({ fontSize: "0.7em", outline: "2px solid var(--prim)" }).text("HEADER");
		})),

	SKETCH("Prose beside media", "Words on the left, one picture on the right, an action bottom-right.",
		() => div.c("surface pad flex gap").style("height", "7em").append(() => {
			div.c("flex v gap").style("flex", "0 0 6em").append(() => {
				span.c("muted").style("fontSize", "0.75em").text("title");
				box("100%").style({ flex: "1 1 auto", borderStyle: "dotted" });
			});
			div.c("flex v gap flex-1").append(() => {
				box("100%").style("flex", "1 1 auto");
				div.c("flex").style("justifyContent", "flex-end")
					.append(() => span.c("surface pad").style("fontSize", "0.7em").text("→"));
			});
		})),

	SKETCH("Two columns of text", "Same shape twice — but one column carries an image and the other does not.",
		() => div.c("flex gap").style("height", "7em").append(() => {
			div.c("flex v gap flex-1").append(() => {
				span.c("muted").style("fontSize", "0.75em").text("title");
				box("100%").style({ flex: "1 1 auto", borderStyle: "dotted" });
			});
			div.c("flex v gap flex-1").append(() => {
				span.c("muted").style("fontSize", "0.75em").text("title");
				box("2em");
				box("100%").style("flex", "1 1 auto");
			});
		})),

	SKETCH("A row of hero cards", "Five small cards in a row, then one wide one under them.",
		() => div.c("flex v gap").append(() => {
			div.c("flex gap wrap").append(() => [1, 2, 3, 4, 5].forEach(() =>
				div.c("surface").style({ flex: "1 1 4em", height: "3em", borderStyle: "dashed" })));
			box("3em");
		})),
];

function sketch_wall(){
	return div.c("flex auto gap wide").style("--column", "17em").append(() =>
		SKETCHES.forEach(({ name, says, build }) => {
			div.c("flex v gap").append(() => {
				build();
				span().style("fontWeight", "700").text(name);
				span.c("muted").style("fontSize", "0.85em").text(says);
			});
		}));
}

export default new NotesNote({
	meta: import.meta,
	title: "Layouts need fit",
	icon: "dashboard",
	description: "Cram large content into a small sidebar and it looks bad.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — six wireframes and three words.** In order down the sheet:

1. A **rail · canvas · rail** — two thin sides, one wide middle with a star in it.
2. A **framed hero**: a heading, a big media box, and a label running down the right edge.
3. **Disciplined UI → Memory** — written between the rows.
4. A box with a **HEADER** bar at the top, content, and a **second HEADER** lower down —
   with a ⚠ drawn in the margin pointing straight at it.
5. A card: a small tab at the top, prose down the left, a large media box, and a pill
   button at the bottom right.
6. **ENVY** · **GOOD FRIENDS**
7. A wide box with a title over one large rounded block; beside it, a two-column split
   where one column carries an X-ed image box and the other is text only.

**Right page — a row of hero cards and the rule.** Five small cards side by side (a
squiggle over a box, a squiggle over "?", an "i" over two lines, an X-ed image over a
squiggle, a lone "?"), then one wider card below them. And the sentence:

> **Layouts rely on proper fit. If you try to cram large content into a small sidebar,
> it looks bad.**`);

		md(`## What it points at

- [Approved layouts](/imagine/design/layout/approved/) — the closed set of five, each with
  a floor and a ceiling, each proven at 400 / 1000 / 2000 / 3440. "Proper fit", already a
  contract rather than an opinion.
- [core/Layout](/framework/core/Layout/) — the browsable tree of layouts, filtered and
  paged, with the rules that say what may go inside what.
- [Layout study](/imagine/design/layout/) — the three page-level shells this site is
  actually built from, counted across a 20-page sample at three widths.
- [The layout library](/framework/ext/DesignTool/library/) — eleven arrangements, each
  measured at four widths, with the don'ts beside them.
- [Spacing](/imagine/design/spacing/) — the other half of fit: spacing is a ramp × a
  level, so a box that grows takes its rhythm with it.`);

		md(`## The sketches, rebuilt

Each one drawn with framework words only — \`flex\`, \`grid\`, \`gap\`, \`pad\`, \`surface\` — at
about the size it was sketched for. Drag your browser narrow and they reflow; the third
one is the one the note put a ⚠ beside, and its second header is marked.`);

		sketch_wall();

		md(`The note's sentence is the test all six have to pass. Widen the window and the
rail-and-canvas keeps its proportions; narrow it and the two-column split stacks. The one
that fails is the one it warned about: a header repeated below the content has nowhere
good to sit at any width.`);
	}
});
