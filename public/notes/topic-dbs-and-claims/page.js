import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the shape take `wide`;
   prose keeps the measure. Two regions, no children.

   The note writes a record type down field by field. So the built thing is that record,
   as a shape you can read — each field beside what this site already stores for it,
   because `ext/Research` is the same idea already running. */

const CLAIM = [
	["confidence / weight", "how sure",
		"ext/Research calls it `credence`: established · contested · fringe · speculation."],
	["statement", "the claim itself",
		"`title` (140 chars) plus `summary` (700) — long enough to say it and its evidence."],
	["topic(s)", "what it is about",
		"One `topic` per entry today. The note wants many, via a topic-claim relation table."],
];

const EXTRA = [
	["at", "when it was written — the log is append-only, so time is the order."],
	["kind", "what sort of entry it is — a finding, a theory, an opinion."],
	["url", "where to check it. An `established` entry with no url is rejected."],
];

function claim_shape(){
	return div.c("surface pad flex v gap wide").append(() => {
		span().style("fontWeight", "700").text("Claim — the note's three fields");

		div.c("grid gap").style("gridTemplateColumns", "minmax(8em, 11em) minmax(5em, 8em) 1fr")
			.append(() => CLAIM.forEach(([field, means, built]) => {
				span().style("fontWeight", "700").text(field);
				span.c("muted").style("fontSize", "0.9em").text(means);
				span.c("muted").style("fontSize", "0.9em").text(built);
			}));

		span.c("muted").style("fontWeight", "700").text("And three the running system added");

		div.c("grid gap").style("gridTemplateColumns", "minmax(8em, 11em) 1fr")
			.append(() => EXTRA.forEach(([field, says]) => {
				span().style("fontWeight", "700").text(field);
				span.c("muted").style("fontSize", "0.9em").text(says);
			}));
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Topic dbs and claims",
	label: "Topic dbs",
	icon: "storage",
	description: "A claim is a confidence, a statement and a topic — and it already runs.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — encouragement, music, and one path.**

> **LEARN BY DOING ⇒ DIGITAL PRODUCTION**
>
> *Words of encouragement:* **LIFE IS HARD · NEVER GIVE UP · IF YOU BURN OUT, TAKE A BREAK
> AND THEN TRY AGAIN · IF YOU'RE STRUGGLING, COME JOIN ME, LET'S STRUGGLE TOGETHER.**

Then, with a pair of drawn quavers: *Low-fi? Ambient?* · *Slice all instruments together…*
· **A B** ← *could be a hard & simple transition for many clips.* ① *it needs the tail of A
at the beginning.* · *Can Suno export the **sections**?* And, ruled off at the foot:
\`topic / users / db\`.

**Right page — the research agent.** This is a design, written out:

> **topic dbs** — ① prompt → **research tool / agent** ↓ **shared knowledge base**
>
> Main agent uses the research tool for most prompts, to identify critical info for
> solving the prompt? → **Context bloat?**

> **FILLING THE DB** — During research you use your paid token usage to make useful
> conclusions. → This could potentially happen in one response:
> ① prompt → research → results → response
> ② the response contains a **json-formatted result** with **both** the user's answer
> **and** an update for the db, if appropriate.

> **Claim** — confidence / weight · ~~statement~~ · topic(s) → *topic-claim relation table
> with \`topic_id\` & \`claim_id\`?*

> **Sub topics assume parent topic basic knowledge…** (no need to explain all the basics,
> even AI knows these) — *unless it's very relevant & might be mistaken / confused ↳
> **importance**. If the essence of the prompt is about a very specific detail, adding it
> explicitly is wise.*`);

		md(`## What it points at

- [Research](/imagine/research/) — this design, running. An append-only \`research.jsonl\`,
  a validated writer, and a live front page. It is the note's "shared knowledge base",
  built before the note was photographed.
- [ext/Research](/framework/ext/Research/) — the module itself: the entry schema, the
  credence vocabulary, and the rule that an \`established\` entry with no url is rejected.
- [What a topic is in code](/imagine/platform/decisions/topic-model/) — an ordinary page
  that says \`is: "topic"\`. A subtopic is a page until it adds the same word — which is the
  note's "sub topics assume parent topic knowledge", as structure rather than prompt text.
- [Where state lives](/imagine/platform/decisions/data/) — \`topic/users/db\` is this
  decision's question, and the answer is: the url is the key.
- [AI research](/imagine/platform/research/ai/) — the dug verdict on what an agent should
  and should not be trusted to write.
- Companion: [The right people, not a lot](/notes/right-people-not-many/) writes the same
  \`topic/db\` line again, with sub-topics under it.`);

		md("## The claim, as a shape");

		claim_shape();

		md(`The one real gap between the note and the running system is the note's last
question: it wants **many** topics per claim, through a relation table. Today an entry
carries exactly one \`topic\`, so a claim that spans two is written twice.`);
	}
});
