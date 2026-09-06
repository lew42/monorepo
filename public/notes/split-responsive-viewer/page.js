import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. The photo takes `wide`, prose keeps
   the measure. Two regions, no children. Nothing is built here — see the last line of
   content(): every sketch on this spread is a product name, and each one already has a
   page of its own, so the links ARE the deliverable. */

export default new NotesNote({
	meta: import.meta,
	title: "Split responsive viewer",
	icon: "vertical_split",
	description: "Two viewports side by side, synced scroll — and the whole product list.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page asks one question about demos.** It splits the framework's audience —

> Lew42 → Agencies / Non-Agencies?

— and then draws the thing this note is named for:

> **Split Responsive Viewer?** — a wide frame beside a narrow tall one, captioned *"For
> full length sites, rendering like this doesn't work as well."*
>
> **Synced Scroll?**

That is the whole left page: one idea, one sketch, one caveat, one follow-up question.

**The right page is a list of everything to build.**

> **Midjourney?** → Themed Sections of Photo Cards · **Homepage** — OpenMike · **Video?**
> → *Maybe not necessary?*

> **3D Interactive** — 3D Cursor · 3D objects · Geometry, Grid/Pattern · Vector Scene ⇒
> Animation/Control/Interaction?

> **AI Dashboard** — Tasks, Sessions, Caching, Clients, Skills

> **Layout Generator, Panels, Editor**

> **Responsive Viewer** — a two-pane frame → *Add Column*

> **Drag & Drop** — nine small frames, the same box arranged nine ways

Down the right margin: **\$ BILLIONS \$** — Figma, Discord, Notion, *SuperApp* — then
**OOP JS**, with *Content · Donations? · Sponsors?* and *Auth · Payment* under it. The
last word on the page is **LostMinds**.`);

		md(`## What it points at

- [ext/demo](/framework/ext/demo/) — the demo shell every demo on this site uses. It
  already has the viewport control the split viewer is about: a demo can be rendered at
  a chosen width, and its code shown beside it.
- [ext/Panel](/framework/ext/Panel/) — *Panels*, built: twelve gestures, per-axis sizing,
  live duplicates, and the overlay toolbar.
- [core/Layout](/framework/core/Layout/) — *Layout Generator* and *Editor*, built as
  one lab: edges are insert points, sizes write nothing, and the chrome does not jank.
- [/framework/ai/](/framework/ai/) — *AI Dashboard*, built: one page per working day
  showing tasks, their sessions and what each one landed.
- [ext/Draggable](/framework/ext/Draggable/) — *Drag & Drop*: sorting, crossing lists and
  nesting on one code path.
- [/imagine/paging/arrangement/](/imagine/paging/arrangement/) — the nine-frames sketch,
  as a real page: one box, arranged every way the system allows.`);

		md(`Nothing is built on this page. Every line on the right is a **product name**, and
each of the six that the site has actually built has its own page above — a second, worse
copy here would be the "AI slop" the next spread complains about. The split viewer itself
is a real proposal with a real caveat, and it belongs in
[ext/demo](/framework/ext/demo/), not in a note.

The line at the top of the left page is a personal reminder about an apartment, and is
left out. [The original photo](/notes/inbox/2026-09-06-024.jpg) — which only opens on a
local checkout (the inbox is not in the repo) — has it.`);
	}
});
