import { md, div, span, textarea } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the two boxes take
   `wide`; prose keeps the measure. Two regions, no children.

   The note literally draws two labelled empty boxes. So the built thing is two labelled
   empty boxes you can type in — and nothing more, because that is the whole sketch.
   ⚠ Demos do not persist (minion rules): a reload empties them, on purpose. */

const BOXES = [
	["Strengths", "What you are already good at."],
	["Weaknesses", "What you are not — which is the half people leave blank."],
];

function sw_boxes(){
	return div.c("flex auto gap wide").style("--column", "16em")
		.append(() => BOXES.forEach(([name, hint]) => {
			div.c("flex v gap").append(() => {
				span().style("fontWeight", "700").text(name);
				textarea().attr("rows", "4").attr("placeholder", hint)
					.style({ width: "100%", resize: "vertical" });
			});
		}));
}

export default new NotesNote({
	meta: import.meta,
	title: "Strengths and weaknesses",
	label: "Strengths & weaknesses",
	icon: "balance",
	description: "Two empty boxes, drawn on the page — and a claim about held-back knowledge.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — organising the web.**

- \`test.lew42.com\`
- **Organizing web modules / content** — ① *Lock down the version via cdn import with a
  \`v#\`… & never change it ⇒ always works?*
- **Sub Tropical Content → Anywhere.** *The AI chat system should connect to anything, go
  anywhere…*
- **Social Network for Coders?** *dev.to? X?*
- A map of a life, braced together: *Careers · Products · Dating · Homes · DNA ·
  Sex, babies · Clothes* **} Life**

**Right page — a UI, a metric, and a suspicion.**

> **UI to identify strengths & weaknesses**

drawn as two labelled empty rectangles, one headed **Strengths**, one **Weaknesses**.
Beside them:

> **Physics × Part Design** ⇒ *standardized metrics, like compressive strength & tensile
> strength, break weight?*

> **TOPIC IQ = QUIZ × USER FEEDBACK**

> **Forbidden Knowledge?** *I've sensed we're being held back? Not helped in a consistent
> way.*

and at the foot, a sketch of cylinders with forces marked **F** and **B**, and one shape
labelled **airfoil**.`);

		md(`## What it points at

- [The framework](/framework/) — *"lock down the version via cdn import with a \`v#\` and
  never change it"* is this project's own constraint, already true: no build step, and
  every import is a real \`.js\` url that resolves against \`import.meta\`.
- [Start](/framework/start/) — three files and a working site, which is what "always
  works" looks like when nothing is compiled.
- [Levels](/imagine/platform/topic/) — **TOPIC IQ = QUIZ × USER FEEDBACK** is the levels
  verdict, already demoed: a 1–5 band derived from an action log, never a stored number.
- [Users research](/imagine/platform/research/users/) — the dug verdict on what a profile
  may know about a person, which is where "strengths & weaknesses" would live.
- [What a topic is in code](/imagine/platform/decisions/topic-model/) — the record behind
  "Physics × Part Design" as two topics that cross.`);

		md("## The two boxes");

		sw_boxes();

		md(`That is the whole sketch: two labelled boxes, no scoring, no scale. Type in them
if you like — nothing is saved, and a reload gives you the note's own empty pair back.
The interesting half of the note is what it says *next to* them: that a strength should be
measured the way a material is, with a standard metric and a break weight.`);
	}
});
