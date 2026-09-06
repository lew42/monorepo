import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the cards take `wide`;
   prose keeps the measure. Two regions, no children.

   Three drafts of one pitch is a comparison, and a comparison wants them side by side —
   which is a `flex auto` row of three cards, stacking by itself well before 400. */

const PROMOS = [
	["1", "The plain one",
		"I want to help people succeed. Come join my group.",
		"Shortest. Says nothing about who it is for."],
	["2", "The one that names you",
		"If you've thought about making a channel, or maybe you tried, and like most of us "
		+ "find it exhausting — come join my group.",
		"Longest, and the only one that describes the reader rather than the writer."],
	["3", "The one that promises",
		"On my channel, Open Mike, I will interview others.",
		"A commitment, not an invitation. It gives a reason to watch, not to join."],
];

function promo_cards(){
	return div.c("flex auto gap wide").style("--column", "15em")
		.append(() => PROMOS.forEach(([n, name, text, note]) => {
			div.c("surface pad flex v gap").append(() => {
				span.c("muted").style("fontSize", "0.8em").text("Draft " + n + " · " + name);
				span().style({ fontSize: "1.05em", lineHeight: "1.5" }).text("“" + text + "”");
				span.c("muted").style("fontSize", "0.85em").text(note);
			});
		}));
}

export default new NotesNote({
	meta: import.meta,
	title: "What is OpenMike?",
	label: "What is OpenMike",
	icon: "campaign",
	description: "Three drafts of one pitch, and 1,000 people to help launch.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — four questions about building it.**

- **Topic / dir-based research agent?** → *spawn the agent in that dir, & use that db…*
- **View ⟷ JSON w/ custom classes (js classes)**
- **Can web-components handle hydration?** *You still need a UI web editor ⟷ json ⟷ html
  → custom elements.* ✱ *If you want a handle on each element, it's best to just CSR?*
- *I'm struggling to focus & stay organized, esp. w/ my code.*
- **Loops** — *In order to get a seamless loopable, the section needs to…* (unfinished)

**Right page — the pitch, drafted out loud.**

> **WHAT IS OPENMIKE?**
> ~~I'm creating a brand new social media brand, OpenMike~~
>
> **I'm Open Mike** → *Logo* — and I'm looking for **1,000 people** to help me ~~get
> started on~~ **launch**.
> ① Get 1,000 people into the Facebook Group

Then, ruled off: *I'm looking for **10 people** to help launch a new Discord server.* ·
*Here's* · *"Hey Dad" → cut to interview.*

And, ruled off again: **Group promo, posted to page + $100** — three numbered drafts,
each one crossed and rewritten. They are the three cards below.`);

		md(`## What it points at

- [Platform](/imagine/platform/) — "topics as worlds": the research, decisions and
  prototypes behind exactly this community, on this framework.
- [Community research](/imagine/platform/research/community/) — the dug verdict on what a
  group needs, which is the question "1,000 people to help me launch" is really asking.
- [What a topic is in code](/imagine/platform/decisions/topic-model/) — an ordinary page
  that says \`is: "topic"\`; "topic/dir-based research agent" is that same idea one layer
  down, in the filesystem.
- [Page builder (Make)](/imagine/paging/build/) — **View ⟷ JSON with custom classes**,
  running: a page is a \`page.json\`, and the builder writes it back to a file.
- [ext/Research](/framework/ext/Research/) — the research agent, already spawned per topic
  and already writing to a per-topic log.
- Companion: [The right people, not a lot](/notes/right-people-not-many/) is the ad this
  pitch pays for.`);

		md("## The three drafts");

		promo_cards();

		md(`Side by side they are not three wordings of one idea — they are three different
offers, and only the middle one describes the person reading it. That is the whole reason
to put them next to each other.`);
	}
});
