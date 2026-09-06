import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. The photo and the two frames take
   `wide`; prose keeps the measure. Two regions, no children.

   The note draws one page, and an arrow to two futures: COLUMN (the child opens beside
   the parent) and SWAP (the child replaces it). Both frames are here at the note's own
   proportions, side by side, so the difference is the thing you see. */

const CHILDREN = ["A1", "A2", "A3"];

/* One frame. `mode` decides what clicking a child does — that IS the note's question, so
   both modes share every other line of this function. Nothing persists: the reset button
   puts it back, and so does a refresh. */
function frame(mode){
	let open = null;

	const label = mode === "column" ? "Column" : "Swap";
	const $frame = div.c("surface pad flex v gap").style({ flex: "1 1 16em", minWidth: "13em" });

	const draw = () => $frame.empty(() => {
		span().style("fontWeight", "700").text(label);

		// ⚠ `style(obj)` takes ONE argument — a callback passed beside it is dropped and
		// the box renders empty. Children go through `.append()`.
		div.c("flex gap").style({ alignItems: "stretch", minHeight: "9em" }).append(() => {
			// The parent. In swap mode it is gone once a child is open — that is the
			// whole difference, and it is one `if`.
			if (mode === "column" || !open) div.c("surface pad flex v gap")
				.style({ flex: "1 1 0" }).append(() => {
					span.c("muted").style("fontSize", "0.85em").text("Page A");
					CHILDREN.forEach(name => span.c("surface pad")
						.style({ cursor: "pointer", fontSize: "0.85em",
							outline: open === name ? "2px solid var(--prim)" : "none" })
						.text(name)
						.on("click", () => { open = open === name ? null : name; draw(); }));
				});

			// The child. In column mode it is the right-hand column; in swap mode it is
			// the only thing left.
			if (open) div.c("surface pad flex v gap").style({ flex: "1 1 0" }).append(() => {
				span().style("fontWeight", "700").text(open);
				span.c("muted").style("fontSize", "0.85em").text("21 · 22 · 23");
				span.c("surface pad").style({ cursor: "pointer", fontSize: "0.85em" })
					.text("← back").on("click", () => { open = null; draw(); });
			});
		});

		span.c("muted").style("fontSize", "0.85em").text(
			mode === "column"
				? (open ? `${open} opened BESIDE Page A — two columns, both live.`
					: "Click a child: it opens beside the page.")
				: (open ? `${open} REPLACED Page A — one column, and "back" returns.`
					: "Click a child: it replaces the page."));
	});

	draw();
	return $frame;
}

function column_vs_swap(){
	return div.c("flex gap wrap wide", () => { frame("column"); frame("swap"); });
}

export default new NotesNote({
	meta: import.meta,
	title: "Column vs swap",
	icon: "swap_horiz",
	description: "One page, two futures — and the note picks swap.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page draws the choice.** A page with a row of small blocks in it, and an arrow
to two different futures:

> ↗ a tall frame with a sidebar of blocks beside the content — **Column**
> ↘ the same frame with a single box in the middle — **Swap**

Under it, the same question in the small: a box holding \`A\` with children \`A1 A2 A3\`,
an arrow to a box holding \`A2\` with children \`21 22 23\`, and the reading:

> Each page has children in a right sidebar? ⇒ **no col needed, just swap**

Then what that means for reuse:

> **SECTIONS aren't really "lib"-able** (they need to be copy + pasted) — *examples*
> However, fillers can be useful…
>
> ☑ Example web page system ⇒ rendered differently

> Mobile / ui, el, etc? · Mega? Ultrawide? — } **How do we explore the in-between?**

**The right page is a list of systems.**

> \`page.activate()\` instead of \`"go"\`? · \`app.io\`
>
> **UI vs CODE**
>
> **DESIGN GENERATORS** — BG · Box Styles · Shadows
> ① Generate Something ② Have humans crowd-improve ③ Learn from it ④ Better generations
> — beside it, \`.sc(CSSModule)\` and \`.use(css.whatever())\`
>
> **PANEL SYSTEM** — sizes · colors/materials · grading
>
> **YOUTUBE VIDEO × TIMELINE**
>
> **PAGE SYSTEM** ⇒ \`page.json\`? \`jsonl\`? — pure fs (portable) · static · git · json
>
> SVG, Pixel, Video Editors?
>
> **SELECTION SYSTEM…** ⇒ History?`);

		md(`## What it points at

- [/imagine/paging/](/imagine/paging/) — the whole question, answered as a realm: four
  mechanisms with fixed icons, and swap is one of them.
- [/imagine/paging/mechanisms/](/imagine/paging/mechanisms/) — column and swap side by
  side as live demos, which is what the two frames below are a note-sized version of.
- [Make](/imagine/paging/make/) — **PAGE SYSTEM ⇒ page.json**, built: a page you edit,
  written back to the filesystem, portable and static exactly as the note wants.
- [ext/Panel](/framework/ext/Panel/) — the **PANEL SYSTEM**, built, including per-axis
  sizes.
- [/imagine/youtube/](/imagine/youtube/) — **YOUTUBE VIDEO × TIMELINE**, built.
- [/imagine/sections/](/imagine/sections/) — "sections aren't really lib-able": the realm
  agrees. A section is something you copy, and the site keeps examples rather than a
  library.`);

		md(`## The choice, both ways

Click a child in each frame. On the left it opens **beside** the page; on the right it
**replaces** it. That is the entire difference, and it is why the note lands on swap: with
children in a sidebar, the second column has nothing left to do.`);

		column_vs_swap();

		md(`Nothing here is saved — the frames reset on a refresh. The real mechanisms, at
full size and with their own code, are at
[/imagine/paging/mechanisms/](/imagine/paging/mechanisms/).`);
	}
});
