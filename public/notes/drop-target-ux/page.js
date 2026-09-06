import { md, div } from "/app.js";
import { NotesNote } from "../note.js";
import Draggable from "/framework/ext/Draggable/Draggable.js";

/* Layout: the app's main region under /notes/ — a plain page grid, so the photo and
   the demo take `wide` and the prose keeps the measure. One column, two regions
   (crumbs, content), no children. Preview: the photo, from NotesNote. The demo is one
   `flex gap wrap` row inside a `.surface` box, which stacks by itself at 400.

   The note names four moments of a drag — before, dragging, hover, release — and asks
   for two different previews (one while a drag is in flight, one when you are actually
   over the target). So the built thing is exactly that: drag the chip and watch the
   target change state, with the state named as it happens. `ext/Draggable` already
   owns pointer capture, hit-testing and Escape, so this is a subclass, not a rewrite. */

const STATES = {
	before:   ["before",   "Nothing is moving. The target is a plain box."],
	dragging: ["dragging", "Something is in flight. The target previews that it CAN take it — before you ever reach it."],
	hover:    ["hover",    "You are over it. Now it previews what would actually land."],
	dropped:  ["dropped",  "Released. The value is committed, and the clock stopped."],
};

// The chip you grab. `Draggable` is a plain class, so subclassing it mints no CSS
// class; `on_state` is handed in by the demo that built the boxes.
class NoteDragChip extends Draggable {
	start(){ this.on_state("dragging"); }

	move(dx, dy, e){
		this.view.style("translate", `${dx}px ${dy}px`);
		// ⚠ `under()` is the whole trick: hover is "a hit-test found the target",
		// not "the pointer entered an element" — the chip is under the cursor.
		this.on_state(this.under(e) ? "hover" : "dragging");
	}

	drop(){ this.view.style("translate", "0 0"); this.on_state("dropped"); }
	restore(){ this.view.style("translate", "0 0"); this.on_state("before"); }
}

function drop_target_demo(){
	return div.c("surface pad flex v gap wide", () => {
		let $chip, $target;

		div.c("flex gap wrap v-center").style("minHeight", "6em").append(() => {
			$chip = div.c("surface pad").style({ cursor: "grab", touchAction: "none",
				userSelect: "none", position: "relative", zIndex: "2" }).text("Item");
			$target = div.c("pad flex v-center h-center").style({ border: "2px solid var(--line)",
				borderRadius: "var(--radius)", minWidth: "9em", minHeight: "4em" });
		});

		const $state = div().style("fontWeight", "700");
		const $says = div.c("muted");

		const on_state = name => {
			const [label, says] = STATES[name];
			$state.text(label);
			$says.text(says);
			$target.text(name === "before" ? "drop target" : name === "dropped" ? "landed" : "preview");
			$target.style("borderStyle", name === "before" ? "solid" : "dashed");
			$target.style("background", name === "hover" ? "var(--fill-a16)"
				: name === "dragging" ? "var(--fill-a08)" : "transparent");
		};

		new Draggable({ view: $target, handle: false });   // a drop site, nothing to grab
		new NoteDragChip({ view: $chip, on_state });
		on_state("before");
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Drop target UX",
	icon: "drag_indicator",
	description: "Four moments of a drag, and two different previews.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page.** It opens on a doubt — *"There are too many words… Nobody wants my words?
Maybe not…"* — and then gets specific about what a page is made of:

1. **Word(s)** — a string
2. **Layout** — sketched as a little grid

∴ **DROP TARGET UX** — *drag, preview before hover · hover preview, drop*, with an
\`Item\` box and a dashed box beside it. Under that, the four moments as a ladder:

\`\`\`
event ──→  before
           dragging
           hover
           release?  drop?
\`\`\`

and the line that makes it a model rather than a checklist:

> **dragging = state = value ± time**

Then ☐ Bittersweet…  ☐ WIP. Lower down, headed **AI IMAGE SURFING** written up the
margin: *colour picker × Categories*, a row of swatch boxes, *guide AI with branching
style files & config*, a bracket tree, and three sketches labelled **sequence** and
**process**. Then **GREATNESS** ☑ Rich ☑ Famous, and **BRAIN FRIED / DEAD** ☑ TOO HIGH…

**Right page.** **WHAT AM I DOING WRONG?** Then, for the platform:

- **For each, start an email chain?** ① *Privacy 2-step?* — 1. opt in without email
  exposure, 2. join the email chain.
- **HIRE & RECORD PEOPLE?** → *Need waiver?*
- **openmike.net ← Topic Browser** — with \`#openmike.net\` and \`@openmike.net\`.

There is also a short personal list headed **Straight Talk**, and one line above it about
faith. Those are private moral notes; they are in the photo and are not re-typed here.

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-003.jpg](/notes/inbox/2026-09-06-003.jpg).`);

		md(`## What it points at

- [ext/Draggable](/framework/ext/Draggable/) — the drop-target machinery already exists:
  pointer capture held for the whole gesture, \`elementsFromPoint\` hit-testing, Escape
  cancels and commits nothing. The note's four moments map to \`start\` · \`move\` ·
  \`under()\` · \`drop\`/\`restore\`.
- [Platform](/imagine/platform/) — *openmike.net ← Topic Browser* is this realm's front
  door, and the topic browser is the thing it is a browser of.
- [What a topic is in code](/imagine/platform/decisions/topic-model/) — an ordinary page
  that says \`is: "topic"\`. No registry, no subclass.
- [Users research](/imagine/platform/research/users/) — the dug verdict behind "opt in
  without email exposure": who a user is before they have given you anything.
- **AI image surfing has nothing built.** A colour picker crossed with categories, and
  style files that branch, is a described product with no page on this site yet.`);

		md(`## The four moments, live

Drag the **Item** onto the box. The state name under it changes as you go, and the two
previews the note asks for are the two different looks: one while something is merely in
flight, one when you are actually over the target. Let go anywhere else to cancel.`);

		drop_target_demo();

		md("Nothing is saved — let go, reload, and it is the note's own diagram again.");
	}
});
