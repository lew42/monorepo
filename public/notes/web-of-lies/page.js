import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose keeps the measure. Own layout: `.md` flow. Two regions, no children. Preview: the
   photo thumb.

   Nothing is built. Every idea on the spread is a business model or a governance question —
   a marketplace, a leaderboard, a coin, an intercepted token — and the site has already
   answered each of them with a research verdict, which is a page, not a widget. So the
   links are the deliverable and there is no demo. */

export default new NotesNote({
	meta: import.meta,
	title: "Web of lies",
	icon: "forum",
	description: "Topics, questions, answers - claims or facts?",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page opens with a shape for arguing in public.**

> **Crowd-Sourced Visual Feedback UX**
> ☑ Topics  ☑ Important Questions ↳ **Potential Answers**
> **Facts? Claims?**

That last pair is the whole design problem in two words: a topic collects questions, a
question collects answers, and every answer is either something that can be checked or
something someone believes. Beside it, a spiderweb drawn in pencil with **WEB OF LIES**
lettered inside it, a **Join** button, and the domain: \`lies.lew42.com\`.

Below that, a second idea:

> **CHASING SUCCESS**  ↓  [▶] → **UX…**

a video series, where the play button is the product. And one security question, on its own
line and underlined:

> **Can an intercepted JWT be used?**

Then the mechanism that would make a profile out of participation:

> How hard would it be, to create **interactive profiles**?
> → You participate in various web activity,
> → The choices you make **build your profile**
> → Subsequent activities build on that…

At the foot: *Record to R2?* and **✱ Build Together ✱**.

**The right page is the money.**

> **Meme × Responsive / Automated Generative (AI)**
> ↳ Have humans in the loop, ranking images ⇒ **Cool, New, Wow…** — **EMOJI**

> **Get it right, earn \$!**

> **AI generation × MARKETPLACE = \$\$\$**
> = Money Generator? = **FREE MONEY!**

and then, under a heading written in capitals, what the thing is actually for:

> **RETIRED ⇒**
> ☐ **A community** — → frequent/regulars → leaderboard → coin? *(global, not restricted)*
> ☐ **A shared state of life**
> ☐ Deep State?`);

		md(`## What it points at

- [ext/Research](/framework/ext/Research/) — "Facts? Claims?" is this module's whole
  vocabulary: an entry carries a source, a claim and a **credence**, and scouts, a skeptic
  and a verdict run in rounds over them. The note asks for the distinction; the site has it
  as a data structure.
- [Security verdict](/imagine/platform/research/security/) — the adversary pass answers
  "can an intercepted JWT be used?" directly: a stolen session cookie is threat **#1** on
  the ranked list, and the mitigation is where that verdict spends its first section.
- [Payments verdict](/imagine/platform/research/payments/) — "AI generation × marketplace"
  and "get it right, earn \$" priced out. Its ruling is blunt: ship the membership, ship
  **no** spendable balance, because a balance users can send each other is money
  transmission and a \$0.50 floor makes per-cent payouts impossible.
- [Community verdict](/imagine/platform/research/community/) — the leaderboard, the
  regulars and the coin. Levels 1–5 over a topic-scoped reputation derived from an
  append-only action log; no voting; no coin.
- [AI verdict](/imagine/platform/research/ai/) — the fal.ai call for the generative half:
  fal for images, video, 3D and audio only, Workers AI for embeddings and moderation, and
  **never called from the browser**.
- [/imagine/platform/](/imagine/platform/) — all nine verdicts and the decisions ruled off
  them, which is what this spread became.`);

		md(`## What was left off

Three margin doodles sit between the paragraphs on the left page — a scribbled aside, a
tower labelled \`MANCHURIA\` (?), and the word \`CRYPTO\`. They are not part of the argument
and are not transcribed here. The [original](/notes/inbox/2026-09-06-059.jpg) has them, and
that link only opens on a local checkout (the inbox is not in the repo).

**Nothing on the spread is buildable.** Every line is a business decision — what to charge,
who ranks, whether there is a coin — and each already has a verdict page that argues it out
with numbers. A widget would say less than the links do.`);
	}
});
