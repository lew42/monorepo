import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built: the note asks a measuring tool to change one
   unit, and that tool is ext/DesignTool, which already scores against ideal ranges. */

export default new NotesNote({
	meta: import.meta,
	title: "Analyze the spacing as a percent",
	icon: "straighten",
	description: "Spacing and scale measured 0 → 1, relative to their relatives.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is about finding things, and then about measuring them.**

> How does Amazon do it? — filters & grids

> **MAP UX:** find things on the map — <u>your</u> stores… <u>your</u> buds

> 41? · God allows success? *Sounds a bit sinister —* · Get high & talk to your kids? →
> *They don't like when I ramble*

> Resizable Columns → **Modes?**

Then, underlined, the part this note is named for:

> **LAYOUT TOOL**
> ☑ Analyze the spacing as % = spacey, 0 → 1?
> ☑ Analyze the scale (font-size)
> ☑ Analyze both relative to relatives.

and the last line on the page: *There's a future coming…*

**The right page is personal, and is transcribed as written.**

> Believe in yourself like Jesus believed in himself.
>
> My godfather: Uncle C.
>
> **BRANDPOWER** — Snap On · Christian Brothers · Bella Bronze …
>
> I feel like I'm walking into fires:
> ☑ I keep getting high, chasing the dreams — too high, burned out
> ☑ sometimes it feels like spiritual hazing — very uncomfortable, sometimes
> painful/overwhelming
>
> **YOUNGLING?** · UNBEARABLE

The bottom corner turns back to the product:

> **PREMIUM** ↓ Live events · Chasing \`[ Software ▾ ]\` Success ·
> **LEVELS × TOPICS × USERS**`);

		md(`## What it points at

- [ext/DesignTool](/framework/ext/DesignTool/) — the Layout Tool, built. Its \`rate()\`
  grades eleven weighted **ideal ranges** and the generator searches against that score,
  which is the note's "0 → 1" as it actually shipped: not one number per page, but a
  band per property that a measurement falls inside or outside.
- [/imagine/design/spacing/](/imagine/design/spacing/) — "analyze the spacing": spacing is
  now a clamp, not a constant, so every gap on the site is already expressed as a range
  rather than a pixel count.
- [/imagine/design/size/](/imagine/design/size/) — "analyze the scale (font-size)", and
  [/imagine/design/scale/](/imagine/design/scale/) for the type scale itself.
- [/imagine/paging/room/](/imagine/paging/room/) — "Resizable Columns → Modes?": how much
  of the screen a box gets became a set of behaviour **words** rather than numbers, which
  is the "modes" the note is reaching for.
- [Topic model](/imagine/platform/decisions/topic-model/) — the **LEVELS × TOPICS ×
  USERS** line, decided: a topic opts into levels by having a \`levels/\` child page, and a
  level is *derived from an action log, never a stored number*.`);

		md(`Nothing is built on this page. The note asks an existing tool to change one
**unit** — percentages instead of pixels — and that is a change to
[ext/DesignTool](/framework/ext/DesignTool/)'s scoring, not a new interface. Its
\`rate()\` already normalises every measurement into a 0–1 band, so the ask is met.

The relative named on the right page is reduced to an initial.
[The original photo](/notes/inbox/2026-09-06-028.jpg) — which only opens on a local
checkout (the inbox is not in the repo) — has the name.`);
	}
});
