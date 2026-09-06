import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the rail take `wide`;
   prose keeps the measure. Two regions, no children.

   One buildable line: "meme = button ⇒ interactive video", sketched as a swipe rail of
   cards under a header. So the rail is built — a horizontally scrolling row, which is
   the one place on this site a scrollbar is a DECISION rather than an accident (the
   layout skill: a region scrolls only when it was meant to). */

const CARDS = ["Intro", "Level 1", "Level 2", "Badge", "Chat", "Next"];

function swipe_rail(){
	return div.c("surface pad flex v gap wide").append(() => {
		span().style("fontWeight", "700").text("Meme = button ⇒ interactive video");

		// ⚠ A scrollbar on purpose: this rail is the gesture. `flex: none` on the items
		//   keeps them from shrinking to min-content instead of scrolling (css skill §4).
		div.c("flex gap").style({ overflowX: "auto", paddingBottom: "0.5em" }).append(() =>
			CARDS.forEach(name => div.c("surface flex v gap pad")
				.style({ flex: "none", width: "8em" }).append(() => {
					div.c("surface").style({ height: "4.5em", borderStyle: "dashed" });
					span().style("fontWeight", "700").text(name);
				})));

		span.c("muted").text("Swipe or drag sideways. Each card is a button, and a button "
			+ "is a piece of video — which is the note's whole equation.");
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Personal specs",
	icon: "swipe",
	description: "Meme = button ⇒ interactive video, beside a page of hard questions.",

	content(){
		this.crumbs();
		this.shot("A third party's name is reduced to an initial. "
			+ "Open the photo for the full scan.");

		md(`## What the page says

This is the most personal spread in the notebook, and it is transcribed as written.

**Left page.**

- **3-way call?** ⇒ *Riverside?* ⇒ **Auto-edits**
- **PERSONAL SPECS** → ① *Specify some value, precisely.* ② *If you share, I'll share…?*
- **HELL IS REAL?**
- **Meme = Button ⇒ _Interactive_ Video**
- \`TROLL\` · **MASK OF MADNESS** · **FREEDOM IS NEAR — DON'T F\\*\\*K IT UP**
- ☑ **FREE WILL** ☑ **TRUTH** ☑ **EXPERIENCE** — with a small doodle beside them
- **SPIRITUALLY LIMITED** ☑ *there's something you've been straining for* ☑ *there's
  something holding you back?*
- **GOD? ARE YOU THERE? · JESUS? YOU COMING BACK? · I CAN SAVE US…? I DOUBT IT…**
- \`BAD LIFE →\` · ☑ **KEEP TRYING**

**Right page.**

- ☑ **Payment** \`UX\` — and again as \`PAYMENT\` *(skill)* \`UX\`
- ☐ **BROKE** *(had money)* → ☑ **BROKE** *(now broke)*
- **I'LL PAY W/ MY LIFE?** · **MIRACLES?** *Not me… Life is a miracle.* ·
  **THE PARADOX OF EXISTENCE…**
- **MOMMARY** ☑ daycare ☑ social clubhouse
- **MEMORY × MONEY** ☑ join ☑ earn ☑ experience · **RISE**
- **BROTHER JESUS (E.)** ☐ Anger
- ☑ *I've had the skill* ☑ *I've been limited? held back?*
- ☑ Head ache ☑ Weed ☑ Hungover
- A sketch: a phone screen headed *xfinity* with a row of three small cards beneath a
  rule, marked **swipe rail**, beside an X-ed media box with an arrow out of it.

The original, which only opens on a local checkout (the inbox is not in the repo): [2026-09-06-019.jpg](/notes/inbox/2026-09-06-019.jpg).`);

		md(`## What it points at

- [The layout library](/framework/ext/DesignTool/library/) — eleven arrangements measured
  at four widths. The swipe rail is one of them, with the don'ts beside it.
- [Mechanisms](/imagine/paging/mechanisms/) — the four ways this site moves you between
  things. A rail you swipe is the one that costs no page load.
- [Payments research](/imagine/platform/research/payments/) — "payment UX" as a dug
  verdict rather than a phrase.
- [Levels, demoed](/imagine/platform/topic/) — *join · earn · experience* is the levels
  ladder, already built as a band derived from an action log.
- Companion: [Levels and points](/notes/levels-and-points/) is the same economy, worked
  out further.`);

		md("## The swipe rail");

		swipe_rail();

		md(`The rest of the spread is not an interface and does not become one. It is worth
saying plainly: most of this page is a person thinking about faith, money and being stuck,
and the one product line on it — a meme that is a button that is a piece of video — is
sitting in the middle of that.`);
	}
});
