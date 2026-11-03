import { md, div, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose and the picker keep the measure — the picker is a control (flat padding, fixed
   2.4em cells) beside a 9em stage, and the pair fits the measure at 400 by wrapping. Own
   layout: `flex gap wrap`. Two regions, no children. Preview: the photo thumb.

   Built: the arrow grids on the right page, live. The note draws BOTH a 3x3 and a 4x4, and
   the two are the same rule — a cell points away from the centre, and only the outer band
   has a direction — so the picker takes its size as a parameter and draws either.

   ⚠ Note 004 (/notes/anchor-point-optional/) has a 3x3 anchor picker of its own. It is a
     module-local function inside another note's page.js, so there is nothing to import; a
     shared part would have to live in notes/note.js, which this task does not own. This one
     is not a copy — it is the size-parameterised version, which is what THIS note draws —
     and the two are cross-linked so a reader meets the idea once. */

const ARROWS = {
	"-1,-1": "↖", "0,-1": "↑", "1,-1": "↗",
	"-1,0":  "←", "0,0":  "•", "1,0":  "→",
	"-1,1":  "↙", "0,1":  "↓", "1,1":  "↘",
};

const NAMES = {
	"-1,-1": "top left",    "0,-1": "top",    "1,-1": "top right",
	"-1,0":  "left",        "0,0":  "centre", "1,0":  "right",
	"-1,1":  "bottom left", "0,1":  "bottom", "1,1":  "bottom right",
};

// The whole rule: only the outer band of a grid has a direction. Works for any size.
const axis  = (i, n) => i === 0 ? -1 : i === n - 1 ? 1 : 0;
const place = v => v < 0 ? "start" : v > 0 ? "end" : "center";

function arrow_grid(){
	return div.c("surface pad flex gap wrap", () => {
		let $grid, $stage, $read, size = 3;

		const pick = (x, y) => {
			$stage.style({ justifyItems: place(x), alignItems: place(y) });
			$read.text(`(${x}, ${y}) — ${NAMES[x + "," + y]}. Same rule at both sizes: only `
				+ `the outer band points anywhere.`);
		};

		const draw = () => $grid.empty(() => {
			$grid.style("gridTemplateColumns", `repeat(${size}, 2.4em)`);
			for (let row = 0; row < size; row++)
				for (let col = 0; col < size; col++){
					const x = axis(col, size), y = axis(row, size);
					button(ARROWS[x + "," + y]).style({ padding: "0.3em", minWidth: "0" })
						.on("click", () => pick(x, y));
				}
		});

		div.c("flex v gap").style({ flex: "0 0 auto" }).append(() => {
			div.c("flex gap").append(() => [3, 4].forEach(n => {
				button(`${n} × ${n}`).style({ padding: "0.3em 0.7em", fontSize: "0.8em" })
					.on("click", () => { size = n; draw(); });
			}));
			$grid = div.c("grid gap");
		});

		div.c("flex v gap flex-1").style("minWidth", "13em").append(() => {
			$stage = div.c("grid").style({ border: "2px dashed var(--line)",
				borderRadius: "var(--radius)", height: "9em", padding: "0.5em",
				justifyItems: "center", alignItems: "center" });
			$stage.append(() => div.c("surface pad").text("box"));
			$read = span.c("muted").text("Pick a direction. The box moves; the box does not change.");
		});

		draw();
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Maybe it's just a note",
	icon: "sticky_note_2",
	description: "A sub page without a page.js - like this one.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is about sharding, and about who owns a screen.**

> So what if users are sharded?
> ☑ Can't query all users…
> ☑ Can still query 1 user's data at a time?
>
> \`user_id\` → \`user's_db\` ← query user actions?
>
> **neon?** if it can port to Postgres…?

Then a small three-column box with an arrow into it — *click to toggle?* — and a bigger
frame with arrows pushing outward, which is the same box expanded. Under them, the question
this whole notebook keeps circling:

> **How does the page & parent (layout? app?) interact?**
> ○ Page creates workspace?

drawn as three nested things: **App** (a plain frame), **Workspace** (a frame split into
panes), **Page** (a sheet with text on it). And at the foot:

> How to allow **user uploads**? ↳ Meter their usage ↳ Private data?

**The right page is about how long a page should be.**

> **Main Sidebar Nav?** For documentation-heavy pages…?
> *(a sketch)* top nav for main sub-pages? · sidenav for sub topics? · **scroll spy?**
> ↓ less useful for short pages?

> Use pages for bigger concepts w/ lots of parts?
>
> But, don't we want to **limit long pages**? ☑ interactive ☑ navigation ☑ video

and then the line this note is named for:

> And so, for many pages (topics), we might just have… **a note?** A sub page w/o a
> \`page.js\`? A \`note.js\` that gets loaded directly? Or just a \`page.js\` that gets
> imported, not linked to?

Under it, two grids of arrows: a **3×3** marked \`1x\`, and a **4×4**.`);

		md(`## The arrow grid, live

The note draws the grid twice, at two sizes, which is the interesting part — the arrows are
not nine drawings, they are one rule. **A cell points away from the centre, and only the
outer band points anywhere at all.** That holds at any size, so the picker below takes its
size as a switch and draws either grid from the same three lines of code.`);

		arrow_grid();

		md(`Note 004, [Anchor point, optional](/notes/anchor-point-optional/), draws the 3×3
version of this as a placement model — position = anchor = origin, with an (x, y) of ±1 per
axis. Same idea, one notebook page apart.`);

		md(`## What it points at

- [/notes/](/notes/) — **the question answered itself.** "A sub page without a \`page.js\`"
  is what this realm is: short working notes that are not documentation, kept where anyone
  can read them, without a module or a doc tree around each one.
- [core/Page](/framework/core/Page/) — and it turned out you do not need a \`note.js\` at
  all. A \`.md\` file beside a page is already a child page: core falls back from
  \`./thing/\` to \`./thing.md\` when no \`page.js\` claims the name, which is exactly "a sub
  page without a page.js". The rule is in
  [\`doc/declaring.md\`](/framework/core/Page/doc/declaring/).
- [ext/Panel](/framework/ext/Panel/) — the anchor grid as a working machine: a panel places
  and sizes itself against its parent, which is what the arrows are for.
- [The data decision](/imagine/platform/decisions/data/) — sharding, answered. One \`users\`
  row per person in one place, and per-surface state in a Durable Object keyed by url —
  so "can't query all users" never becomes true.
- [core/Sidebar](/framework/core/Sidebar/) — the documentation nav the right page sketches:
  a top row for sub-pages, a rail for sub-topics.
- [ext/toc](/framework/ext/toc/) — the scroll spy, and the note's own caveat about it
  (less useful on a short page) is why it is opt-in rather than automatic.`);
	}
});
