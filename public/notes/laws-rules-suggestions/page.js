import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — this spread is a set of policies and one
   already-answered question about generating code. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "Laws, rules, suggestions",
	icon: "gavel",
	description: "Three strengths of instruction, and how to make the site simpler.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page grades instructions by how binding they are.**

> **LAWS** — always & never
> **RULES** — dos & don'ts
> **SUGGESTIONS?** — maybes?

Then how a choice gets made:

> **Decision Trees** — ① Problem ② Solutions ③ Vote, Debate, Vote

Then the measuring tool:

> **Layout Tool** ⇒ Reading width · Alignment

with the alignment idea drawn as letters sitting on different baselines, then three
framed boxes — the alignments themselves.

> Panel for everything?

And the question the whole page is really asking:

> **How do I make it simpler?** — fewer pages of AI slop… ↳ hide them away?
> ⚠ dynamic pages = good lazy loading

**The right page is about running several AIs at once.**

> For parallel AIs to work together — worktrees are slow / separate · separate dirs/files?
> ⇒ let an arbitrator do it? — *I tried this… it sorta works, but there's so much mess.*

> **Modular Classes?** — Toggle on/off features? · See the class def shrink · Edit? Ask AI
> to edit?

> **Interactive Classes:** \`class Whatever\` with \`method\`, \`method\`, and a box holding
> *tests (NIN?)* and *config?*
>
> ① Use json to dynamically build? Watchers → rewrite? ② Load & run dynamically, no
> writes? ③ Web DI → write?

> Maybe it just auto-regenerates when changed? · Ui → triggers rewrite?
>
> imports · name, extends, mixin? · methods · script (after) — } concat strings ⇒ file.
> **Why though? Very small gain.**

The margin carries a date stamp, \`8/20-25\`.`);

		md(`## What it points at

- [/framework/](/framework/) — the three grades exist and are in force: the repo's
  \`CLAUDE.md\` opens with **Laws**, the skills carry rules, and readmes are explicitly
  "mostly suggestions". This note is where that split was written down.
- [ext/DesignTool](/framework/ext/DesignTool/) — the **Layout Tool**, built. It measures
  reading width and alignment, and its hardest-won lesson is on this note's own subject:
  a mass finding usually means the *rule* is wrong, not the page.
- [ext/Panel](/framework/ext/Panel/) — "Panel for everything?", tried and answered:
  panels do a great deal, and \`fixed\`/\`sticky\` and a shared \`Item\` were rejected *with
  measurements* rather than by taste.
- [/framework/ai/](/framework/ai/) — parallel AIs with an arbitrator, run for real. The
  arbitrator briefs and judges; the work happens in separate task dirs with explicit file
  ownership, which is this note's "separate dirs/files?" answered by experience.
- [/imagine/paging/library/](/imagine/paging/library/) — "fewer pages of AI slop… hide
  them away": many examples behind one page, loaded only when opened.`);

		md(`Nothing is built on this page. The left page is a **policy** — three strengths
of instruction — and policies belong in the files that carry them, which is where these
went. The right page's last line answers its own question: concatenating strings into a
class file is a *"very small gain"*, and it was not built.`);
	}
});
