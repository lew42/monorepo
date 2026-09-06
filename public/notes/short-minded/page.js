import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — the one interface on the spread (hover-based
   layout actions) is /imagine/paging/mechanisms/, already live and better. Said at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "Short-minded",
	icon: "psychology_alt",
	description: "A hard morning, then per-module sessions, 3D web, and Full Swap.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page opens with how the day is going.** It is transcribed as written.

> **SHORT-MINDED**
> My brain power flatlines for moments here & there.
>
> It's not pleasant…
>
> It's harder to breath. What exactly are we doing here?

Then the work resumes:

> **per-module sessions?** — rebuild them from time to time, & after skill updates, &
> \`claude.md\`? · are sessions forked from file system?

> dashboards & zooming… ⇒ **3D Space.**

> not bad at something ⇒ *"What are you good at?"*

> **3D Web via** — CSS 3D transforms ← *can you 3D menu w/ only CSS* · WebGL

and, boxed at the foot of the page: **Full [Swap]**.

**The right page starts with a component ladder.** \`ELEMENTS\` over one empty frame;
\`SECTIONS\` over three; and the rule that sizes the ladder:

> 3–5 of the most categorical examples, as a quick starting point.

Then the gesture:

> **Hover-based layout actions?** — \`ctrl+S\` → Split

drawn as four small frames: one with a cursor in it, one already split in two, one with an
arrow leaving its edge, one with the arrow landing.

Lower down, a habits list belonging to a friend, **C.** — *no porn, drugs · run daily ·
cook · hike · less phone · grow beard* — with *nicotine, alcohol, coffee → weed*
annotated beside the name.

The page ends on the framework again:

> **Personas @ forks?** · We need consistent lessons. · Are all basic framework forks? (?)

The margin carries two timestamps, \`22:17\` and \`22:11\`.`);

		md(`## What it points at

- [/imagine/paging/mechanisms/](/imagine/paging/mechanisms/) — **Full Swap**, built and
  named: swap is one of the four paging mechanisms, and "full" is its takeover mode. The
  four small frames on the right page are what its demos do.
- [/imagine/layouts/](/imagine/layouts/) — "3–5 of the most categorical examples, as a
  quick starting point": the realm is exactly that, a small approved set rather than a
  catalogue.
- [/imagine/sections/](/imagine/sections/) — the \`SECTIONS\` half of the ladder, as three
  frames become a real stack.
- [/imagine/scenes/](/imagine/scenes/) — "3D Web via CSS 3D transforms", answered by
  building it: transforms, no WebGL.
- [/framework/ai/](/framework/ai/) — "per-module sessions?" and "personas @ forks?", both
  run for real. Sessions are per *task*, not per module; the persona experiment was tried
  and retired, and the independent-seats idea survived it.`);

		md(`Nothing is built on this page. The one interface it draws —
\`ctrl+S\` splitting the frame under the cursor — is already live and better at
[/imagine/paging/mechanisms/](/imagine/paging/mechanisms/), and drawing a worse copy in a
note would be the duplication the previous spread complains about.

A friend's name is reduced to initials, and one annotation beside it is left as written.
[The original photo](/notes/inbox/2026-09-06-027.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has the name.`);
	}
});
