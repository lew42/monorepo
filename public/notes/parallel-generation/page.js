import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the table take `wide`;
   prose keeps the measure. Two regions, no children.

   The note works out one small arithmetic — how many columns are left when an activated
   item takes some — and answers it in a column of numbers. A table is the picture: what
   you have, what you need, and what the layout must then do. */

const NEED = [
	["3", "1", "2", "Room to spare. Nothing has to move."],
	["3", "2", "1", "Tight, but everything still fits."],
	["3", "3", "0", "Exactly full. The next thing you open has nowhere to go."],
	["0", "1", "—", "Nothing spare: compact the context, or hide the first column."],
];

function need_table(){
	return div.c("surface pad flex v gap wide").append(() => {
		span().style("fontWeight", "700").text("Three columns — how much do you need?");

		div.c("grid gap").style("gridTemplateColumns", "repeat(3, minmax(4em, 6em)) 1fr")
			.append(() => {
				["Have", "Using", "Left", "So"].forEach(h =>
					span().style({ fontWeight: "700", fontSize: "0.9em" }).text(h));

				NEED.forEach(([have, using, left, says]) => {
					span(have); span(using);
					span().style("fontWeight", left === "0" || left === "—" ? "700" : "400").text(left);
					span.c("muted").style("fontSize", "0.9em").text(says);
				});
			});

		span.c("muted").text("How big is an activated item — 1? 2? 3? — and is it default, "
			+ "small, large, ×1, or full? That is the same question from the other side.");
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Parallel generation",
	icon: "grid_on",
	description: "Nine generations at once, and the column arithmetic underneath it.",

	content(){
		this.crumbs();
		this.shot("The right-hand page of this spread is apartment logistics — rents, "
			+ "deposits and people — so the picture is cropped to the left page.");

		md(`## What the page says

Only the left page is shown: the right-hand page carries apartment hunting — rents,
deposits, dates and people's names — so it is cropped out of the image and its personal
half is left out of the words. Its two product lines are kept below, because they belong
with this note: **collaborative parallel generation — AIs see each other's work by tailing
the log**, and **columnar pages (varying widths, interactive, compaction / context? just
h-scroll?)**.

**The left page.**

> **9-GRID PARALLEL AI GEN** — drawn as a 3-wide strip beside a lettered grid
> \`A B C D / E F G H\`

> **ADAPTIVE — H-I-L:**
> ① Prompt ② Parallel generations? ↓
>   Ⓐ If conclusive, settle on **"the best"**
>   Ⓑ If not, **itemize alternatives**
> ③ **Choose Focus** — *like Midjourney, click to regen…*

> **ITEMIZE**
> \`class Thing extends Item\`
> \`set().save()\`
> \`buffer().set().set().save()\`

> **Column Pages**
> *How much do you need?* (*How big is an activated item? 1? 2? 3? — default, small,
> large, ×1, full?*)
>
> If you have 3 col, using 1 you have 2 · using 2, you have 1 · using 3, you have 0.
> *If you need 1 and have 0 ⇒ compact (context) = hide 1st?*
> If you need 3, you take 3 · need 2, take 2 · need 1, take 2.

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-022.jpg](/notes/inbox/2026-09-06-022.jpg).`);

		md(`## What it points at

- [core/Item](/framework/core/Item/) — \`class Thing extends Item\` is not a proposal: Item
  already exists, with \`set()\` and \`save()\` on it. The note is writing against the real
  API from memory.
- [Columns](/framework/core/Page/doc/columns.md) — the columns doc, which is where "how
  much do you need" is answered: nested pages are peers, and a column that opens beside
  you takes its width from the row.
- [Miller columns, live](/framework/core/Page/overview/columns/) — the arithmetic on the
  page, running: open one, open another, watch what is left.
- [ext/Saver](/framework/ext/Saver/) — the buffered write the note sketches as
  \`buffer().set().set().save()\`.
- [AI](/framework/ai/) — *"AIs see each other's work by tailing the log"* is how this site
  already runs: one append-only \`task.jsonl\` per task, streamed to any open page.
- [Make](/imagine/paging/make/) — a page as JSON, which is what an itemized alternative
  would have to be before you could choose between nine of them.`);

		md("## The column arithmetic");

		need_table();

		md(`Written out, the note's own last line is the interesting one: *if you need 1 and
have 0, compact the context — hide the first column.* That is a rule about what a layout
does when it runs out, and it is the rule this site's columns already follow.`);
	}
});
