import { md, div, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo and the picker take `wide`,
   prose keeps the measure. Two regions, no children. The picker is a 3-column grid of
   nine cells at a fixed 12em — a control, so its own padding stays flat (the layout
   skill: a CONTROL's padding is never a ramp).

   The note asks "Point + Orientation? (1,1) (1,-1) (-1,1) (-1,-1)" and draws a little
   arrow for each quadrant. That is an anchor picker, so that is what is built: click a
   corner and watch the box place itself against its parent from that anchor. */

// Each anchor as the note writes it: (x, y) in -1..1, and where the box lands.
const ANCHORS = [
	[-1, -1, "top left"],    [0, -1, "top"],    [1, -1, "top right"],
	[-1,  0, "left"],        [0,  0, "centre"], [1,  0, "right"],
	[-1,  1, "bottom left"], [0,  1, "bottom"], [1,  1, "bottom right"],
];

const place = v => v < 0 ? "start" : v > 0 ? "end" : "center";

function anchor_picker(){
	return div.c("surface pad flex gap wrap wide", () => {
		let $stage, $read;

		div.c("grid gap").style({ gridTemplateColumns: "repeat(3, 2.4em)", flex: "0 0 auto" })
			.append(() => ANCHORS.forEach(([x, y, name]) => {
				button(`${x},${y}`).style({ padding: "0.35em", fontSize: "0.7em", minWidth: "0" })
					.on("click", () => {
						$stage.style({ justifyItems: place(x), alignItems: place(y) });
						$read.text(`(${x}, ${y}) — ${name}. The box is placed from that corner; `
							+ `nothing about the box itself changed.`);
					});
			}));

		div.c("flex v gap flex-1").style("minWidth", "14em").append(() => {
			$stage = div.c("grid").style({ border: "2px dashed var(--line)",
				borderRadius: "var(--radius)", height: "9em", padding: "0.5em",
				justifyItems: "center", alignItems: "center" });
			$stage.append(() => div.c("surface pad").text("box"));
			$read = span.c("muted").text("(0, 0) — centre. Pick a corner.");
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Anchor point, optional",
	icon: "control_camera",
	description: "Position = anchor = origin, with an (x, y) that is ±1 per axis.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — a placement model.**

- **Anchor Point optional?** → *Might default it to origin? = origin? = movable origin?*
- **Parent + Pos** *(a sketch: an arrow landing on a labelled point)* **= Point P**
- **Position = Anchor = Origin** with an (x, y) — the sketch marks +x rightward and +y down.
- **Point + Orientation?** with a small arrow drawn for each of the four signs:
  **(1, 1)** · **(1, −1)** · **(−1, 1)** · **(−1, −1)**
- **Center vs Align L/R? When items are added…**

**Left page — the camera rig**, on the same sheet:

- **LAV:** better for a handheld mic… ☑ tripod + handheld mode
- **USB-C for mobile ≠ Analog**
- A sketch of a camera on a selfie stick: *Selfie Stick + Rig? = too heavy?* ☑ MagCase
  ☑ Mic ☑ etc… ☑ Big Phone
- *Selfie-stick + usb-c mic* · *Tripod + cage w/ shotgun &…*
- **3.5 to usb-c for mics?** · **Battery life?**

**Right page.** \`1/3 · 3/4 = 3/12 = 1/4\` and ☐ haircut. *21st → 28th (29th) = 8 nights.*
A talk, in three beats:

> ① Thank you ② Results ③ Onward! → my story → your story(ies) → ideas, plans, worries…

Then **How do I speed up?** — *Video ①②③ } stay focused until completion* — beside a
column of one-word aims: **PURPOSE ↓ FOCUS** (scope) · **BRAND / better CONTENT** ·
**COMMUNITY** (me & you all) · **Mission ↗ CTA**. And:

> **TITLE ①②③ } Record first = Real ⇒ fill in the visuals**`);

		md(`## The numbers at the foot

| Facebook | | YouTube (?) | |
| --- | --- | --- | --- |
| Page visits | 213 | Views | 9k |
| Views | 2,047 | Likes | 116 |
| Viewers | 1,175 | Subscribers | 126 |
| Follows (?) | 20 | Avg watch time | 4s |
| Reactions | 68 | | |
| Clicks | 28 | | |
| Shares | 3 | | |

An average watch time of **4 seconds** against 9,000 views is the number the rest of the
video notes are all reacting to.`);

		md(`## What it points at

- [ext/Panel](/framework/ext/Panel/) — the site's existing placement machine: a panel
  already sizes and places itself against a parent, which is what "Parent + Pos → Point P"
  is asking for.
- [ext/Playground](/framework/ext/Playground/) — the layout lab where placement is a
  gesture rather than a number.
- [Video research](/imagine/platform/research/video/) — the dug verdict on what video the
  platform actually needs, which is where "hire & record people" gets answered.
- [Feeds · video](/imagine/feeds/video/) — the realm that renders video on this site today.
- Companions in this notebook: [Shotgun or lav](/notes/shotgun-or-lav/) and
  [Record long, cut to 60s](/notes/record-long-cut-to-60s/) are the same rig argument.`);

		md(`## The anchor, live

Nine buttons, one per (x, y) the note writes down. Click one: the box places itself from
that corner of its parent, and **the box does not change** — only where it is anchored.
That is the note's own point, and it is why the anchor can default to the origin.`);

		anchor_picker();

		md(`The gear list and the talk outline describe no interface — they are a shopping
list and a running order, and neither becomes a screen. So the anchor grid is the one
buildable thing on this spread, and it is built.`);
	}
});
