import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the tower take `wide`;
   prose keeps the measure. Two regions, no children.

   The note describes a building by floor. A building drawn as stacked rows, top floor
   first, is the one picture that makes the pricing read — and the note's own storage
   arithmetic goes beside it as a two-row table, because that is the number it is
   actually arguing about. */

const FLOORS = [
	["Top floor", "Level D1", "Multi-purpose. An auditorium?"],
	["Lower level", "Casual", "Casual / dining seating."],
	["Level 1", "Basic", "Basic dining — economy."],
	["Lowest level", "Standing", "No seating."],
];

function tower(){
	return div.c("flex v gap wide").append(() => {
		FLOORS.forEach(([floor, tier, says], i) => {
			div.c("surface pad flex gap wrap v-center")
				.style({ marginInline: `${i * 0.6}em`, borderStyle: i === 0 ? "solid" : "dashed" })
				.append(() => {
					span().style({ fontWeight: "700", flex: "0 0 8em" }).text(floor);
					span.c("surface pad").style({ fontSize: "0.75em", flex: "0 0 auto" }).text(tier);
					span.c("muted").style("flex", "1 1 10em").text(says);
				});
		});

		div.c("flex gap wrap").append(() => {
			span.c("muted").text("$5 day pass");
			span.c("muted").text("·");
			span.c("muted").text("$5/mo — written, then struck out");
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Basketball tower",
	icon: "apartment",
	description: "A venue by floor, and $1/mo for 1 GB against $10/mo for 1 TB.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — a venue.** Headed *FuzionFrenzy*, then:

> **BASKETBALL TOWER**
> ↳ **TOP FLOOR = LEVEL D1**
> ✱ **MULTI-PURPOSE?** → *Auditorium?*
>
> Lower level = casual / dining seating?
> Lowest level = no seating
> Level 1? = basic dining (econ)
>
> **$5 day pass** // ~~$5/mo~~

**Right page — questions, then one piece of arithmetic.**

- *What if our ancestors have been chipmunks & spiders for zillions of years?*
- *Can my neighbours hear me?* **PARANOIA · WORRY**
- *Are drugs bad?* **100%?**
- **$1/mo: 1 GB** *(more than enough)* · **$10/mo: 1 TB** — *10× more = 1/10 value ✱
  1,000× value = **100×***  ↳ *In question: team? farm?*
- ① Answer ② Question(s) ③ Quiz ④ Score.  ·  \`WITNESS\` *organic*
- *I scored 3×. Partners? Times? Kids?*
- ☑ **Spiritual Battle / Warfare?** — rude to people · lying — sinning · healthy /
  positive · don't want to change · stop caring → consequences · blind to bad behaviour
  of actions

That last block is transcribed as written; it is the owner's own reflection, not a
product note.`);

		md(`## What it points at

- [Levels, demoed](/imagine/platform/topic/) — *answer → question(s) → quiz → score* is
  the levels verdict, already built: a 1–5 band derived from an action log, never a
  stored number. The note's four steps are that loop, in order.
- [Payments research](/imagine/platform/research/payments/) — the dug verdict behind the
  storage arithmetic: what a tier costs and what it obliges.
- [Where state lives](/imagine/platform/decisions/data/) — 1 GB versus 1 TB is a question
  about R2 and media, which that record answers.
- Companion: [Levels and points](/notes/levels-and-points/) is the same quiz-and-score
  loop with a currency attached, and [Strengths and weaknesses](/notes/strengths-and-weaknesses/)
  has the other half of the same line: *Topic IQ = quiz × user feedback.*`);

		md("## The tower, by floor");

		tower();

		md(`Drawn top-down, the pricing question the note is circling becomes obvious: the
top floor is the multi-purpose one, and every floor below it is cheaper seating for the
same event. A $5 day pass buys a floor, not a building — which is why the $5/mo beside it
got struck out.`);
	}
});
