import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the flow take `wide`;
   prose keeps the measure. Two regions, no children.

   The note numbers a four-step user journey. Four steps in order is a strip, and a
   strip is the picture that makes "and then they can use the meme in chat" read as the
   payoff rather than a fifth bullet. */

const STEPS = [
	["1", "Browse", "A user browses memes.", "Nothing is owed yet."],
	["2", "Enter", "They click ENTER — or BEGIN — and level 1 begins.", "Level 1 = 10 minutes: a 5-minute video plus an activity."],
	["3", "Finish", "If and when they finish, they get the badge.", "The badge is the meme."],
	["4", "Use it", "They can use that meme in chat, and it displays their rank.", "Which is the only reason step 2 was worth ten minutes."],
];

function level_flow(){
	return div.c("flex auto gap wide").style("--column", "13em").append(() =>
		STEPS.forEach(([n, name, what, why]) => {
			div.c("surface pad flex v gap").append(() => {
				span.c("muted").style("fontSize", "0.8em").text("Step " + n);
				span().style("fontWeight", "700").text(name);
				span().style("fontSize", "0.95em").text(what);
				span.c("muted").style("fontSize", "0.85em").text(why);
			});
		}));
}

export default new NotesNote({
	meta: import.meta,
	title: "Levels and points",
	icon: "military_tech",
	description: "User × meme × level — and how you avoid inflating your own currency.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — notifications, then the economy.**

> **Primary Notifications** — ① I call ② they answer \`ENTER\`
> **A:** cold → *system* notification
> **B:** in-app → new item → "read" → \`RETURN\`

- **SPOTIFY × VOCAL PITCH × LYRICS ⇒ Scoring**
- **Memes → NFT?** ☑ *earn it*
- **Level 1 = < 10 min** (5 min video + activity) · **Level 2 = …**
- **Meme × level = $$?** *yes & no…*
- **Level 1 = $1?** *You can collect thousands from simple activities?* ⇒ **Massive
  inflation?**
- *Limited* ① Abundance ② Easy (little) money ③ Spending — with a rising arrow drawn
  beside it
- **How do you avoid inflation? _Taxation?_**
- A sketch: \`STARTUP\` → a framed screen labelled *STARTUP*

**Right page — the journey, and the ledger.**

> ~~SHOULD ALL~~ **WE WANT ~~DEFLATION~~?** ☑ **APPRECIATION OF DOLLAR** ⇒ ↳ price level?
> *(not "deflation" — money supply — necessarily? that's only if m/s is constant…)*

*Can they cash them out? Maybe, if I can collect membership fees. And limit the total
number of withdrawals.* Then:

> So… **user × meme (topic) × level**
> ① User browses memes
> ② Clicks \`ENTER\`, or \`BEGIN\`, and **level 1 begins**
> ③ If/when they finish, they get the **badge** ↓ *meme*
> ④ And now they can use that meme in chat, & it displays their **rank**?

- **USERS, ROLES, PERMISSIONS…** ↓ *Need DB? DO?*
- **USER PROFILE · SETTINGS · AUTH**
- **PAYMENTS:** $1? $10? for… **$10/mo** \`UNLIMITED →\`
- **BANTER → Video Interactions + AI?**
- A banner-ad sketch: *"Do you, or someone you know, ______?"* with a \`YES →\` button`);

		md(`## What it points at

- [Levels, demoed](/imagine/platform/topic/) — a 1–5 band **derived from an action log,
  never a stored number**. That verdict answers the note's whole inflation worry from the
  other side: if a level is derived, it cannot be farmed into existence.
- [Payments research](/imagine/platform/research/payments/) — the dug verdict on taking
  money, which is where "$10/mo unlimited" stops being a guess.
- [Who a user is](/imagine/platform/decisions/identity/) — users, roles and permissions,
  already decided: one row, one stateless cookie, one \`can(user, action, url)\`.
- [Where state lives](/imagine/platform/decisions/data/) — *"Need DB? DO?"* is this
  record's exact question: D1 the day a stranger writes, one Durable Object per live
  surface url.
- [Security research](/imagine/platform/research/security/) — cashing out is the point at
  which this stops being a game.
- Companion: [Each meme is a community](/notes/each-meme-is-a-community/) draws the same
  $10/mo card.`);

		md("## The four steps");

		level_flow();

		md(`Laid out in a row, the note's own answer to its inflation problem is visible in
step 3: the reward is a **badge**, not a payment. A badge cannot inflate — there is
exactly one per person per meme — which is why the site's own levels verdict derives a
level from the log instead of crediting a balance.`);
	}
});
