import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — this is the mastermind skill's brief, and the
   skill is the deliverable. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "We think",
	icon: "groups",
	description: "Where the mastermind skill came from — vote, write to the filesystem, don't pollute the prompt.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is the brief for what became the mastermind skill.** It opens with what
the skill is for — *turning Claude into a code ninja* — and then sets the tone:

> **"We think"…**
>
> Don't overthink. If more than one acceptable option exists, consider them all.
>
> **RECOMMENDATIONS** — MVP → Exploration → v1 · Phase 1: Base API · Phase 2: Exact Code

Then how it should be run, addressed to the owner:

> pay attention to response times? If agents take longer than normal? **Kill them.**
>
> Decide democratically: by vote. Begin by comparing/contrasting each other's responses?
>
> ⚠ Generate all work onto **FS**… (\`page.js\`? \`readme\`?)
> ⚠ **THIS ALLOWS CROSS-REFERENCING?**

and the rule that names the failure mode:

> ⚠ **PROMPT POLLUTION** ⚠ — don't load more
> ☑ Don't do more work than asked for; ask if you think more…
> ☑ Don't be overly specific; be careful w/ strong absolute statements

**The right page asks how an app takes over the screen.**

> How did my Claude agents talk before? — \`app\` · \`/path/\` · \`loading | active\` ·
> \`.page → { Page }\` · \`.root → { Home }\`

> Replace ← \`app.$pages\` w/ CSS only? · Takeover ← \`app.$mains\`? \`app.takeover?\` ·
> Columns → add to \`app.$pages\`, use CSS? — \`full?\` \`modal?\` etc.

> \`app\` should allow "fullscreen"? Well, true fs? Each app should allow full takeover…
> window/device full screen is diff.
>
> ⇒ \`app\` can have any \`app.$containers\` / \`$pages\` that keep sidebar, header, etc.

Then the regions themselves — \`header\`, \`meat [left main right]\`, \`footer\` — with
\`app.full? → ∅ header, ∅ footer, ∅ left, ∅ right?\` and \`& meat ⇒ full × full?\` beside
them. At the foot: \`app > $pages\`, a frame captioned \`full = full what? device? window?
main?\`, and *"Can any link have any mode? Could be too total. ↳ maybe, but not
shareable?"*`);

		md(`## What it points at

- [/framework/ai/](/framework/ai/) — the skill itself is not a page, but everything it
  produces is here: one dashboard per working day, every task's log, and the
  cross-referencing the note asks for — because the work really is generated onto the
  filesystem, exactly as this page demands.
- [/imagine/paging/mechanisms/](/imagine/paging/mechanisms/) — **takeover**, built and
  named. It is one of the four paging mechanisms, and "full" is its mode.
- [/imagine/paging/arrangement/](/imagine/paging/arrangement/) — \`header / meat [left main
  right] / footer\` as a real set of arrangements around one box.
- [/imagine/paging/room/](/imagine/paging/room/) — "full = full what? device? window?
  main?", answered: how much of the screen the box gets is its own vocabulary, and the
  three answers are three different words.
- [Research](/framework/ext/Research/) — "decide democratically: by vote", as it actually
  works now: scouts, then a skeptic, then a verdict, with every claim carrying a credence.`);

		md(`Nothing is built on this page. It is the **brief for a skill**, and the skill is
the deliverable — it lives in the repo's \`.claude/skills/\`, which has no url, so
[/framework/ai/](/framework/ai/) is where you see it running.

The skill's name is built from the owner's name, and one line here is addressed to the
owner by name; both are written as "the owner" above.
[The original photo](/notes/inbox/2026-09-06-035.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has them as written.`);
	}
});
