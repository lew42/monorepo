import { md, div, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the card take `wide`;
   prose keeps the measure. Two regions, no children.

   The note draws a pricing card — a price on the left, three ticks on the right — and
   annotates a second sketch with "button hover: prim". So the card is built exactly
   that way, with the framework's own `.prim` button, because that is the note asking
   for a word the site already has. */

const INCLUDED = ["1,000 points / month", "voice chat", "join teams"];

function price_card(){
	return div.c("surface flex gap wrap wide").style("padding", "0").append(() => {
		div.c("pad flex v gap v-center h-center").style({ flex: "1 1 10em",
			borderInlineEnd: "1px solid var(--line)" }).append(() => {
			span().style({ fontSize: "2.2em", fontWeight: "900" }).text("$10/mo");
			span.c("surface pad").style({ fontSize: "0.7em", letterSpacing: "0.08em" })
				.text("UNLIMITED");
		});

		div.c("pad flex v gap").style("flex", "2 1 14em").append(() => {
			INCLUDED.forEach(item => span("☑  " + item));
			button.c("prim", "Join").on("click", e => e.preventDefault());
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Each meme is a community",
	label: "Meme = community",
	icon: "diversity_3",
	description: "$10/mo, unlimited, a thousand points — and transfers are the hard part.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — what a meme is.**

> **Each meme is a community / group with the inherent task of making that meme better &
> helping newcomers.**

- **Voice on?** ← *like Discord*
- **SUPER FOLLOW** → *follows on all connected platforms. Automatically follows-back.*
- *Payments, ~~Ana~~* \`JOIN\` *? Or just… tracking? View / behaviour analytics.*
- **Knowledge Base** \`use\` — \`/team/\` · \`/topic/team/\`
- **NOTE TO (FUTURE) SELF:** *Reminder emails?*

**Right page — the money.**

> **Penny Points:** $10/mo unlimited ⇒ **1,000 points per month?**  ·  **CENTS? → DOLLARS**

drawn as a card: **$10/mo · UNLIMITED** on the left, and on the right ☑ 1,000 points/mo
☑ voice chat ☑ join teams. Then:

- **OASIS**
- **ABRAXIS INSTITUTE · GAME THEORY, PENNY GAMES**
- **REAL** ☑ **GAMES** — with three boxes \`A [M] B\`, and *AMA · AAA*
- **POINT TRANSACTIONS?** ☑ income ☑ taxes ☑ kyc ☑ id ☑ address? · ☑ **Verified** \`REAL\`
- *If people can't **trade**, only deposit, earn, withdraw, bet against the house —*
  ✱ **TRANSFERS are what they care about** *(criminal transfers)*
- A card sketch at the foot: an X-ed image over a title and an arrow, annotated
  *← title* and *← button hover: prim*`);

		md(`## What it points at

- [Payments research](/imagine/platform/research/payments/) — the dug verdict on taking
  money here: what it costs, what it obliges, and what a points system turns into.
- [Decisions](/imagine/platform/decisions/) — the hard-to-reverse calls, one record each.
  Anything with KYC in it belongs on that list before it is built.
- [Who a user is](/imagine/platform/decisions/identity/) — one \`users\` row and a stateless
  cookie. "Verified REAL" is that record's hardest open question.
- [Security research](/imagine/platform/research/security/) — where "transfers are what
  they care about (criminal transfers)" gets taken seriously rather than noted.
- [What a topic is in code](/imagine/platform/decisions/topic-model/) — *"each meme is a
  community"* is the same sentence as *"a topic is an ordinary page"*, from the other end.
- Companion: [Levels and points](/notes/levels-and-points/) works the same economy out in
  more detail, and worries about inflation.`);

		md(`## The card

Built the way the note annotates it — a price, three ticks, and one \`prim\` button, which
is the framework's own accent word rather than a new colour.`);

		price_card();

		md(`Nothing here charges anything: the button does nothing on purpose. What the card
is for is the note's own arithmetic — $10 a month buying 1,000 points makes a point worth
a cent, and that is the number every later question about inflation depends on.`);
	}
});
