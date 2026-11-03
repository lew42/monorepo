import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — both halves are decisions core already made,
   and the personas were retired. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "Load, but don't render",
	icon: "hourglass_empty",
	description: "A page can exist without being drawn — and three agents can answer the same prompt.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is about when a page becomes real.**

> \`app || parent\` ↑ \`page.activate() → container().show(this)\` ↓ *not a view…*
>
> Why not just \`this.view?.show()\`? — \`this.$page?.show/hide()\`, by default…

> **Columns: append** — Auto-Render & Activate at Once? · **vs** · Insert → Render? Don't
> inject? ⚠ don't pre-render if not going to inject…

and the line the note is named for:

> **Load, but don't render.**
> Can render links, np.
> Only place & activate when clicked.

> Add sub pages "inline" (in \`page.content()\`)? ⇒ *Too late?*

**The right page is about running agents.** In the top corner, a frame captioned *Split
Workspace (Desktop/Mobile)*.

> \`Class.prototype\` as "source of truth" — add property-specific things that get flagged
> if method changes…

> **Agentic:** \`/agents/\` — architect? planner? manager?
>
> \`claude --resume --fork-session ×10?\`
>
> Simple, elegant (simple, a little fancy?), durable, clear.

> **Decision flow:**
> ① load files
> ② give instructions (flavors/objectives, etc)?
> ③ fork 3×? ask each the same prompt?
> ④ let the original get the results of each, compare & contrast.

> **Testing Agentic Reasoning** — ① Starting FS ② Give Design Parameters ③ Compare Results

The last line names the personas: **Simple Steve, Elegant Eric, Technical Tim**, and a
fourth built from the owner's name, which is left out here.`);

		md(`## What it points at

- [core/Page](/framework/core/Page/) — "load, but don't render" is how it works. A child
  is imported when the router walks to it and its view is built on activation, so a link
  costs nothing until it is followed.
- [core/Router](/framework/core/Router/) — the walk itself, and the reason an undeclared
  directory cannot be reached: a page exists once its parent's \`children:\` names it.
- [/imagine/paging/library/](/imagine/paging/library/) — "only place & activate when
  clicked", as a page you can watch do it.
- [/framework/ai/](/framework/ai/) — the decision flow, run for real. Forked sessions and
  a comparing original are how the site's harder calls get made, and every run leaves its
  log here.
- [Research](/framework/ext/Research/) — "compare & contrast" as a permanent record rather
  than a chat: rounds of scouts, a skeptic, then a verdict.`);

		md(`Nothing is built on this page. The left half is a **decision core already
made** — pages load lazily and render on activation — and the right half is a way of
working, not an interface.

The personas were tried and **retired**: the prototype tree that carried them sits
deliberately outside the site's navigation, so there is no page to link. What survived is
the shape of the idea — several independent answers to one prompt, compared by whoever
asked.

The fourth persona's name is built from the owner's name and is left out.
[The original photo](/notes/inbox/2026-09-06-036.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has it.`);
	}
});
