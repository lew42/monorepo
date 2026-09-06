import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the grid take `wide`;
   prose keeps the measure. Two regions, no children.

   The note circles two audience axes and lands on their intersection. A 2x2 is the
   picture that makes that legible — and the money sits beside it, because the whole
   point of the sketch is that one cell costs the same as the other three. */

const CELLS = [
	["", "Everyone", "Social media / marketing"],
	["No demo", "The widest, cheapest reach and the least interest.",
		"Interested, but anywhere on earth."],
	["Chicago", "Local, but no reason to care.",
		"The circled one: Chi + Soc. Local AND interested."],
];

function targeting_grid(){
	return div.c("surface pad flex v gap wide").append(() => {
		span().style("fontWeight", "700").text("Targeting — two axes, and the one that was circled");

		div.c("grid gap").style("gridTemplateColumns", "minmax(5em, 8em) 1fr 1fr").append(() =>
			CELLS.forEach((row, r) => row.forEach((cell, c) => {
				const head = r === 0 || c === 0;
				const picked = r === 2 && c === 2;
				div.c(head ? "" : "surface pad").style({ fontWeight: head ? "700" : "400",
					fontSize: "0.9em", padding: head ? "0.35em 0" : null,
					outline: picked ? "2px solid var(--prim)" : null }).text(cell);
			})));

		div.c("flex gap wrap").append(() => {
			span.c("muted").text("$400 written beside the four cells;");
			span.c("muted").text("$100 named inside the ad itself.");
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "The right people, not a lot",
	label: "Right people",
	icon: "ads_click",
	description: "Two audience axes, and the money goes on the intersection.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — who it is for, and where it lives.**

> For any group, the group software kinda sucks.
> ☑ Content Creators ☑ Internet Marketers ☑ Social Media Managers
> *"I don't need a lot of people, just the right people."*

- **SQLite via static + wasm?** → *users, user-level…?*
- \`topic/db\` → \`/sub-topic/db?\` ← *articles, claims, conclusions, **questions***
- **TOPIC + NETWORK ⇒** ☑ biggest / best channels to follow ☑ summarize, highlight
  content? ☑ project into the future
- **$ / video?** → *50? 150?*
- **Original content:** *Everyday Bio*

**Right page — the ad.**

> **Reasons to join?** → Host **live events** for group members.

Then the targeting sketch: ☐ **No demo** · ☐ **Chicago** · ☐ **Social, Media, Mkt** —
with a loop drawn round the last two and an arrow down to ☐ **Chi** + ☐ **Soc**. **$400**
is written beside it. And the ad copy itself, redrafted in place:

> *"I'm OpenMike, and I'm hosting live events for my group members. If you want to learn
> how this works, click the button to join (my) Group!*
>
> *I'm spending $100 on this ad, and targeting &lt;everyone, Chicagoans, SMM, & Chi+SMM&gt;.*
>
> *If you want to see the results, join my group! It's free!"*

with an alternate beside it: *"I'm moving back to Chi soon, so if I can help you or your
company with social media & marketing, join my group & send me a message."*`);

		md(`## What it points at

- [Where state lives](/imagine/platform/decisions/data/) — \`topic/db\`, \`/sub-topic/db\` is
  exactly this record's shape: the url is the key, per topic where there are no channels.
- [What a topic is in code](/imagine/platform/decisions/topic-model/) — a topic is an
  ordinary page, and a subtopic is a page until it adds the same word. The note's slash is
  the site's directory.
- [Research](/imagine/research/) — *articles, claims, conclusions, questions* is the entry
  vocabulary already running, one append-only log per topic.
- [Community research](/imagine/platform/research/community/) — the dug verdict on group
  software, which is what the first line of this page is complaining about.
- Companion: [What is OpenMike?](/notes/what-is-openmike/) drafts the pitch this ad spends
  money on.`);

		md("## The targeting, as a grid");

		targeting_grid();

		md(`Drawn out, the sketch says what the circle on the page says: three of the four
cells are cheap reach, and the fourth — local **and** interested — is the one worth paying
for. "Not a lot of people, just the right people" is the same sentence, at the top of the
other page.`);
	}
});
