import { md, div, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the switcher take
   `wide`; prose keeps the measure. Two regions, no children.

   The note draws a control — `item ▾` that opens a list of options, and the same
   control again as a grid of previews. So the built thing is that switcher, both ways:
   a list you read and a grid you recognise. The point the note is making is the last
   line under it — a switch and a transition are two different navigations. */

const OPTIONS = [
	["circled", "◍"], ["squared", "▣"], ["barred", "▤"],
	["split", "◨"], ["stacked", "▤"], ["framed", "▢"],
];

function switcher(){
	return div.c("surface pad flex v gap wide", () => {
		let $list, $grid, $read;
		let open = false, chosen = OPTIONS[0], as_grid = false;

		const draw = () => {
			$list.empty(() => {
				if (!open) return;
				OPTIONS.forEach(opt => {
					const [name, glyph] = opt;
					button(`${glyph}  ${name}`).style({ display: as_grid ? "inline-flex" : "flex",
						width: as_grid ? "auto" : "100%", justifyContent: "flex-start" })
						.on("click", () => { chosen = opt; open = false; draw(); });
				});
			});
			$list.style({ display: open ? "flex" : "none",
				flexDirection: as_grid ? "row" : "column", flexWrap: "wrap" });
			$read.text(open ? "Open — pick one." : `Chosen: ${chosen[1]} ${chosen[0]}.`);
			$toggle.text(`${chosen[1]}  item  ▾`);
		};

		let $toggle;
		div.c("flex gap wrap v-center", () => {
			$toggle = button("").on("click", () => { open = !open; draw(); });
			button("list / grid").on("click", () => { as_grid = !as_grid; draw(); });
			$read = span.c("muted");
		});

		$list = div.c("flex gap").style({ maxWidth: "22em" });
		draw();
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Switch or transition",
	icon: "swap_horiz",
	description: "A switcher, and the question of whether A→B should animate.",

	content(){
		this.crumbs();
		this.shot("The right page's shopping list is left untranscribed. "
			+ "Open the photo for the full scan.");

		md(`## What the page says

**Left page — the control.** At the top, a dropdown drawn twice:

\`\`\`
[ ✱ item        ▾ ]  ← Switch…
   ◉ circled
   ▣ squared        [ ✱  item              ▾ ]
\`\`\`

> **Can we use small previews of a layer in the tree?**

Under it, two cards each headed \`item ▾\` with a drawn star inside, an arrow, and then a
**3 × 3 grid of nine small previews** — each one a different little glyph. Labelled:

> **modal in-place switcher**

Then the same control opening into a panel: \`item ▸\` → a tall box of stacked previews
with a scrollbar, marked **fixed top: 0, bot: 0**. Beside it three framed sketches — one
with a shaded left region, one small one labelled **1 alt**, one bordered.

**Right page.** A shopping and moving list (kitchen table, sofa, TV, bedframe, spices,
groceries, *job?*) — not transcribed here. Then the part that matters:

- A sketch marked **ATF** (above the fold) — **Animated transitions?** with a filmstrip:
  \`[A] → [A·] → [A|B]\`
- **NAVIGATION TRANSITIONS** — **SWITCH (A→B)** *vs* **ANIMATED TRANSITION**
- **Nav w/o unnecessary reflow…**
- **NAV vs config: a right sidebar tree could persist, and navigate to child variants?**
  *Child, related, etc — it's like, "is this what you want?" Or, maybe, it changes the tree?*

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-015.jpg](/notes/inbox/2026-09-06-015.jpg).`);

		md(`## What it points at

- [Navigation](/imagine/paging/navigation/) — stable versus dynamic navigation, which is
  exactly "nav without unnecessary reflow": the realm reserves the box so nothing jumps.
- [Mechanisms](/imagine/paging/mechanisms/) — the four ways this site moves you between
  things, each with its own fixed icon. A switch is one of them; a transition is not.
- [ext/Panel](/framework/ext/Panel/) — the modal in-place switcher's nearest built thing:
  a panel that overlays, sizes per axis, and remembers.
- [ext/Playground](/framework/ext/Playground/) — small previews of a layer, already
  running, as the lab's own way of picking a layout.
- [core/Layout](/framework/core/Layout/) — the tree of variants a right sidebar would
  navigate.`);

		md(`## The switcher, live

The note's control, both ways it drew it. **item ▾** opens the options; **list / grid**
switches between reading them and recognising them — which is the note's own question
about small previews.`);

		switcher();

		md(`Switching is instant here, on purpose: the note asks whether A→B should animate,
and the honest answer is that you can only judge that against the instant version. Nothing
is saved — reload and it is back on the first option.`);
	}
});
