import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the flow take `wide`;
   prose keeps the measure. Two regions, no children.

   The note draws four labelled boxes, three of which point at something. A flow is a
   picture: each row is `from → to`, wrapping to a stack at 400 with no media query. */

const FLOW = [
	["Join Group", "", "The group itself is the destination. Nothing after it."],
	["Send Message", "Discord Link", "A message thread, answered with the invite."],
	["Form", "email", "A form collects the address; the address is the product."],
	["Direct", "Discord · Landing", "Straight through — two ways out of one door."],
];

function flow_diagram(){
	return div.c("surface pad flex v gap wide").append(() => FLOW.forEach(([from, to, says]) => {
		div.c("flex gap wrap v-center").append(() => {
			div.c("pad").style({ border: "1px solid var(--ink)", borderRadius: "var(--radius)",
				fontWeight: "700", minWidth: "9em", flex: "0 0 auto" }).text(from);

			if (to){
				span().style("flex", "0 0 auto").text("→");
				div.c("surface pad").style({ minWidth: "9em", flex: "0 0 auto" }).text(to);
			}

			span.c("muted").style({ flex: "1 1 12em", fontSize: "0.9em" }).text(says);
		});
	}));
}

export default new NotesNote({
	meta: import.meta,
	title: "Sign-up flow",
	icon: "login",
	description: "Four ways in — and only one of them ends nowhere.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — four boxes.** Nothing else on the sheet:

\`\`\`
Join Group
Send Message  ──→  Discord Link
Form          ──→  email
Direct        ──→  Discord
              ──→  Landing
\`\`\`

**Right page — two complaints and a plan.** First, about this framework:

> Some of the biggest challenges w/ the framework involve **organization**.
> It shouldn't require such complex package management to use a framework.
> Better npm = snippet manager? Maybe it's just… esbuild + npm? **F\\*\\*k…**

Then the group:

- **OpenMike Group?** → *Remote interviews*, *Live events*
- *I'm building a ~~team~~ **Facebook Group** to help me succeed?*
- **Dramatic instrumental?**
- **Group Ad → \`Join Group\`** — *for what gain? → to meet / interact? → **to find my
  intro**? → **community to help each other get started, grow & succeed***
- **Message Ad → \`Discord\` / \`Group\`** — *(like the video?)*`);

		md(`## What it points at

- [The framework](/framework/) — the complaint is already the design: no build step, no
  bundler, no package manager at runtime. \`public/\` runs in the browser as native ESM and
  every import is a real \`.js\` url. The note wishes for the thing it is written about.
- [Start](/framework/start/) — three files and a working site, which is the shortest
  answer to "it shouldn't require such complex package management".
- [Platform](/imagine/platform/) — the community this flow signs people up for.
- [Community research](/imagine/platform/research/community/) — the dug verdict on what a
  group needs before anyone joins it.
- [Who a user is](/imagine/platform/decisions/identity/) — what happens the moment someone
  comes through any of these four doors.
- Companion: [One video, everywhere](/notes/one-video-everywhere/) has the same ladder in
  its bottom corner.`);

		md("## The four doors");

		flow_diagram();

		md(`Drawn as the note draws it, and the shape says the thing the boxes alone do not:
**Join Group** is the only door with nothing on the other side of it. Every other route
hands the person something — an invite, an address, a landing page.`);
	}
});
