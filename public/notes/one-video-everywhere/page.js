import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the fan-out take `wide`;
   prose keeps the measure. Two regions, no children.

   The note draws one box with six arrows leaving it, braced "auto post?". A fan-out is a
   picture, so it is drawn as one: the source on the left, the six destinations wrapping
   beside it. `flex` with `wrap` means it becomes a stack at 400 with no media query. */

const NETWORKS = ["FB", "IG", "TT", "YT", "X?", "LI?"];

function fanout(){
	return div.c("surface pad flex gap wrap v-center wide").append(() => {
		div.c("pad flex v-center h-center").style({ border: "2px solid var(--ink)",
			borderRadius: "var(--radius)", fontWeight: "700", flex: "0 0 auto",
			minWidth: "7em", minHeight: "4em" }).text("1 video");

		span().style({ fontSize: "1.6em", flex: "0 0 auto" }).text("→");

		div.c("flex gap wrap flex-1").style("minWidth", "12em").append(() =>
			NETWORKS.forEach(name => div.c("surface pad").style({ fontWeight: "700",
				minWidth: "3.5em", textAlign: "center" }).text(name)));
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "One video, everywhere",
	icon: "share",
	description: "One recording, six networks, braced with a question: auto post?",

	content(){
		this.crumbs();
		this.shot("A third party's name is reduced to an initial. "
			+ "Open the photo for the full scan.");

		md(`## What the page says

**Left page — rates and a list.**

- **Hitch?** — *$50 / 25 min?* ⇒ *$25 / 25 min, to start*
- **Personal branding?** — *$1/min = $60/hr = $120k* 🙂
- **DESIGN TIMELAPSE?** *w/ narration? Bob Ross?* ⇒ *teach branding / logo design?*
- **Bad Game** — *Is life a Matrix? Maybe? Probably… Is life a game? Probably? → WW2?
  Dani? Is life a bad game?*
- **FB → Team** ☑ email ☑ discord, then the topic list the group would be built from:
  ☐ Business, Money, Startups · ☐ Tech → *Hardware — Robots · Software — AI* · ☐ Life →
  *Love → Friends → Community* · ☐ Politics · ☐ Gamers · ☐ Social Media, Content Creation

**Right page — a meeting, then the plan.** *C., 6/5/2026* — ☑ Money… ☐ Uncertainty…
*"I can't easily quote a 'safe' flat rate, because I don't know."* Tools named:
**Figma, Webflow, Notion, Blender, Discord.**

Then, in the middle of the page, the line this site cares about:

> **Layout Fundamentals** — Padding? BG? Color? Spacing?      *(1:20)*

and beside it **Intro + Outcome + ToC**. Then the distribution sketch: a box marked
**1 video** with arrows to **FB**, **IG**, **TT**, **YT**, **X?**, **LI?**, braced
**auto post?**. And the launch ladder:

> ① Open Mike — *Getting started on* ☐ Social media ☐ Paying to boost yourself
> ② OpenMike Discord server
> ③ Group, Form, Message → **1,000 group members → launch Discord** → *100 will care?*

Then: *FB → explain OpenMike, Discord? Live events, Stream ↓ Stage, $, Roles, etc* and
*Join Group? ↓ Send message? ↓ Form? On Record?*

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-008.jpg](/notes/inbox/2026-09-06-008.jpg).`);

		md(`## What it points at

- [Spacing](/imagine/design/spacing/) — *"Padding? BG? Color? Spacing?"* is this site's own
  question, and it has an answer: spacing is a ramp × a level, never a constant.
- [Ceilings](/imagine/design/spacing/ceilings/) — where that ramp is told to stop.
- [Approved layouts](/imagine/design/layout/approved/) — five layouts, closed set, each
  proven at 400 / 1000 / 2000 / 3440. That is "layout fundamentals", already landed.
- [Colour](/imagine/design/color/) and [Type](/imagine/design/type/) — the other two words
  in the note's list, each already a study.
- [Video research](/imagine/platform/research/video/) — the platform's verdict on video.
- [Community research](/imagine/platform/research/community/) — the dug verdict behind
  "1,000 group members → launch Discord → 100 will care?"
- Companion: [Sign-up flow](/notes/sign-up-flow/) draws the *Join Group? Send message?*
  ladder at the foot of this page as boxes.`);

		md("## One video, six places");

		fanout();

		md(`Auto-posting is a question the note asks, not an answer it gives — and nothing on
this site posts anywhere. The picture is worth drawing anyway: six destinations from one
recording is the whole reason the edit notes care about a 60-second cut.`);
	}
});
