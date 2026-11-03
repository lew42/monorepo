import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose and the strip keep the measure — four sketches at a 10em floor is two rows at 400
   and one row from 1280 up, and each sketch is a bounded 5em box so nothing overflows.
   Own layout: `flex gap wrap`. Two regions, no children. Preview: the photo thumb.

   Built: the four multi-column sketches the right page draws, as a strip. They are the
   note's own argument — the same content area, four ways of splitting it — and seeing them
   in a row is what makes the last sketch read as "the window slid", not "a new layout". */

// [caption, cells] — a cell is a label, or "" for an empty frame.
const SKETCHES = [
	["Three columns, each opening the next", ["1", "2", "3"]],
	["One column, framed inside the pane", [""]],
	["Two columns — the first two of the three", ["1", "2"]],
	["Two columns — the window slid one along", ["2", "3"]],
];

function sketch(caption, cells){
	return div.c("flex v gap").style({ minWidth: "0" }).append(() => {
		div.c("surface").style({ height: "5em", padding: "0.4em", display: "flex",
			gap: "0.3em" }).append(() => cells.forEach(label => {
			div.c("muted").style({
				flex: "1 1 0", minWidth: "0",
				border: "1px solid var(--line)", borderRadius: "2px",
				display: "grid", placeItems: "center", fontSize: "0.85em",
			}).append(() => { if (label) span().text(label); });
		}));

		span.c("muted").style("fontSize", "0.85em").text(caption);
	});
}

function column_strip(){
	/* A wall of four, so `grid auto-fit` with a floor rather than `flex wrap` — the same
	   reason as /notes/property-screens/: wrapping landed an odd row in a half-width
	   prose column and stretched the leftover sketch across it. Measured: 2x2 at 400, 4x1 at
	   1280 / 1920 / 3440, and 3 + 1 in a narrow band around 900 — property-screens/page.js
	   says why that band is left alone. */
	return div.c("grid gap").style("gridTemplateColumns", "repeat(auto-fit, minmax(7.9em, 1fr))")
		.append(() => SKETCHES.forEach(([c, cells]) => { sketch(c, cells); }));
}

export default new NotesNote({
	meta: import.meta,
	title: "The problem with individual sidebars",
	icon: "view_column",
	description: "To share space they need one parent.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is a compression problem.**

> **STORE BIG STRINGS AS SMALLER STRINGS…**
>
> **Query Factors:** most common var names? But, relative to **ALL OTHER STR**…
>
> \`STRING\` → **Encoding Algo** → **Enc-Specific Data Structure(s)**?
> ↓
> **How you chunk?** — Could have multiple viable methods…
>
> Identify patterns? **Chunk freq.** → **uniqueness** (× topic/scope)

Halfway down the page it turns into layout, and the two halves never meet again. A small
box \`c\` points into a frame holding \`#\` and \`c\`, labelled **Layout?**; under it a
\`[1|2|3]\` strip and a bigger frame with \`#\` over \`1 2 3\`, labelled \`c?\`. Beside the
sketches, the line worth keeping:

> **Layout is an aspect, shouldn't be a div** • wrapper? • thing?

> \`thing.layout\`? zoom in/out? expand, collapse, close?
>
> menu ⇒ ▦ **Layout**

**The right page opens with a line in the owner's own voice** — *THE DEMONS ARE COMING
(10–20mg or 12?)* — and then goes straight back to boxes: a square, a square split in two,
a square with an inner box, a 3×3 grid. Under them:

> ☑ **Layout Library via DO?** *(Web Editor)*
> ☑ **Class (Str/Code) Config?**
> ☑ **Pkgs?** ☑ **Payments?**

Then the section this note is named for:

> **Multi Column Content** *(four sketches)*
>
> Each col could have a **min & max width**?
> **Resize = Reflow = Scroll Jump**

> **THE PROBLEM W/ INDIVIDUAL SIDEBARS:** In order to split/share the space, they have to
> be in the **same parent**…
>
> ✱ **This is basically the Pager…**`);

		md(`## The four sketches

The same content area, split four ways. Read left to right: three columns each opening the
next, one column framed inside the pane, then the same row showing only two of the three —
first \`1 2\`, then \`2 3\`. The last pair is the point. Nothing was rebuilt between them; the
window slid one column along.`);

		column_strip();

		md(`**"Each col could have a min & max width" is what the site built.** A column's width
is a *word*, and each word is a min and a max pair:

| word | min → max |
| --- | --- |
| \`small\` | 14em, then 16% of the row, capped at 24em |
| \`hug\` | its own content, floored at 6em and capped at 24em |
| \`large\` | 28em → 64em |
| \`fill\` | everything left over, floored at 16em |
| \`full\` | the whole host — the ancestors collapse into the crumb strip |

Six words instead of two numbers per column, because a number typed on one page cannot know
what the page beside it is doing. The measured numbers at 1280 / 1920 / 3440 are in
[\`doc/columns.md\`](/framework/core/Page/doc/columns/).`);

		md(`## What it points at

- [\`doc/columns.md\`](/framework/core/Page/doc/columns/) — the width words above, with the
  table of what each one measures at four viewports, and the "resize = reflow" caveats.
- [core/Page · columns](/framework/core/Page/overview/columns/) — the row itself, and
  [the Finder](/framework/core/Page/overview/columns/finder/) with real urls in it.
- [/imagine/paging/](/imagine/paging/) — "this is basically the Pager", correct: the realm
  where a page decides how its children open, and the four mechanisms that do it.
- [core/Layout](/framework/core/Layout/) — "Layout is an aspect, shouldn't be a div". The
  site agrees: a layout is a named tree, not a wrapper element you nest inside.
- [ext/Panel](/framework/ext/Panel/) — the closest thing to the individual sidebar the note
  is arguing against, and the module where the "same parent" constraint was measured.`);
	}
});
