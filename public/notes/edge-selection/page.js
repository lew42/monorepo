import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the demo take `wide`;
   prose keeps the measure. Two regions, no children.

   The note draws a box, an edge with handles, and a `+` region that fills a void and
   disappears when you leave edit mode. So the demo has one switch — edit mode — and
   everything the note describes hangs off it: click an edge to select it, buttons
   appear, and the `+` voids show only while editing. */

function edge_demo(){
	return div.c("surface pad flex v gap wide", () => {
		let editing = true, selected = null;
		let $stage, $read, $toggle;

		const draw = () => {
			$toggle.text(editing ? "editing — click to leave" : "not editing — click to edit");

			$stage.empty(() => {
				["Header", "Body"].forEach(name => {
					const on = selected === name;

					div.c("surface pad flex gap wrap v-center").style({
						cursor: editing ? "pointer" : "default",
						outline: on ? "2px solid var(--prim)" : "none",
					}).append(() => {
						span().style({ fontWeight: "700", flex: "1 1 6em" }).text(name);
						if (on) div.c("flex gap").append(() => {
							span.c("surface pad").style("fontSize", "0.75em").text("T");
							span.c("surface pad").style("fontSize", "0.75em").text("▣");
							span.c("surface pad").style("fontSize", "0.75em").text("⇕ drag to resize");
						});
					}).on("click", () => { if (editing){ selected = on ? null : name; draw(); } });

					// The + region: a void you may fill, and only while editing.
					if (editing) div.c("flex h-center").style({ opacity: "0.6" })
						.append(() => span.c("surface pad").style("fontSize", "0.8em").text("+"));
				});
			});

			$read.text(!editing ? "Edit mode off: the + regions are gone and nothing selects."
				: selected ? `${selected} selected — its buttons are on its edge.`
				: "Edit mode on. Click a box's edge to select it.");
		};

		div.c("flex gap wrap v-center", () => {
			$toggle = span.c("surface pad").style("cursor", "pointer")
				.on("click", () => { editing = !editing; selected = null; draw(); });
			$read = span.c("muted");
		});

		$stage = div.c("flex v gap");
		draw();
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Edge selection",
	icon: "highlight_alt",
	description: "Click an edge to select, drag it to resize, and + fills the voids.",

	content(){
		this.crumbs();
		this.shot("The right-hand page of this spread is personal logistics — an address, "
			+ "account numbers and a password hint — so the picture is cropped to the left page.");

		md(`## What the page says

Only the left page is shown and transcribed: the right-hand page of this spread carries a
home address, two utility account numbers and a password hint, so it is cropped out of the
image and left out of the words.

**The left page — an editor's selection model.** Three framed sketches across the top: a
split box with a small label, an empty frame, and a frame holding a stack of blocks.

> **Adaptive Left Sidebar** → *shows selected layers?*

> **Hover → Cursor → Click → Cursor is placed** *(or)* ↳ **Select**

drawn beneath as a page with a small \`+ ▣\` control at its top edge, an
\`— INSERT [T] [▣]\` strip beside it, and a tall thin panel on the right.

> **Edge Selection: click to select → buttons · drag to resize**

and then the part that makes it an editor rather than a toolbar:

> ← **Fill voids with a \`+\` region** → *they disappear when you exit edit mode?*
> ☑ *drag to reorder, nest?*

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-021.jpg](/notes/inbox/2026-09-06-021.jpg).`);

		md(`## What it points at

- [ext/Playground](/framework/ext/Playground/) — the layout lab, where an edge IS the
  insert point: the sibling-insert model, pad and gap floors, and the zero-jank chrome
  this note is describing from the outside.
- [Page builder (Make)](/imagine/paging/build/) — controls, stage and file side by side: a
  page you edit and a \`page.json\` that gets written back.
- [ext/Draggable](/framework/ext/Draggable/) — *drag to reorder, nest?* — \`Sortable\`
  already reorders, crosses lists and nests on one code path.
- [ext/Panel](/framework/ext/Panel/) — the per-axis sizing and overlay toolbar an
  adaptive sidebar would be built on.
- [core/Layout](/framework/core/Layout/) — the tree of layouts a sidebar of selected
  layers would be showing you.`);

		md(`## Edit mode, live

One switch. Turn editing on and every box can be selected — click one and its buttons
appear on its edge — and the \`+\` regions show between them. Turn it off and, exactly as
the note asks, the \`+\` regions disappear and nothing selects.`);

		edge_demo();

		md(`Nothing here is saved, and the resize handle is drawn rather than draggable: the
gesture the note wants is [ext/Playground](/framework/ext/Playground/)'s, and it already
works there. What this box is for is the note's own question — what edit mode should
*hide* — and the answer it gives is: the affordances, all of them, the moment you leave.`);
	}
});
