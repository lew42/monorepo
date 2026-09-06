import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — the demo bar and stage are ext/demo, already
   the shape this note draws. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "My docs are bad",
	icon: "menu_book",
	description: "A demo bar over a stage, a master/detail pair, and components you can track.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is short and blunt.**

> demo? viewport ⇄, ⤢ full screen, js() \`<html>\`
>
> demo list 1 → 2 → 3 → … add 1 simple change = easy
>
> previews… ⇒ ∅ chrome? organized?
>
> **Better doc of all the things? My docs are bad.**
>
> page demos need code ⇄ simple renders, so you can "<u>get it</u>" easier.

**The right page draws the fix.** A frame with a strip across its top:

> demo bar / stage

Then the questions that follow from making a demo a page:

> Should all demos be pages? → comments, etc? · <u>tracking usage</u> · \`page.demo()\`?

Two pairs of sketches. First a wide two-pane frame with an arrow to a narrow one,
labelled **MASTER · DETAIL**. Then a frame with \`SECTION\` blocks beside a \`DETAIL\` pane,
and the same again with a \`related\` block under it.

And the vocabulary at the foot:

> **Base/Theme:** Elements, Inputs, Fonts
>
> **Components:** \`.scoped-namespace\` — *where?* ☑ Should be tracked — *"Are we using
> this?"*
>
> \`ui.thing()\`? vs \`div.c("ui-thing")\`?`);

		md(`## What it points at

- [ext/demo](/framework/ext/demo/) — the demo bar over a stage, built and now the shell
  every demo on the site uses: five blocks, a path, a title and a foot, with the code one
  tab away. This note is its brief.
- [/imagine/paging/stage/](/imagine/paging/stage/) — the **stage** itself, as a thing you
  can point at.
- [/framework/styles/rules/](/framework/styles/rules/) — "components should be tracked —
  *are we using this?*": every CSS rule on the site, listed. \`ext/CSSDoc\` reads the live
  CSSOM for the same answer, but ships as a module with no page of its own yet, so this
  is the page that shows the census.
- [/imagine/design/system/](/imagine/design/system/) — **Base/Theme:** elements, inputs
  and fonts, as one system rather than a pile of rules.
- [/framework/ux/](/framework/ux/) — "\`ui.thing()\` vs \`div.c("ui-thing")\`": the ux tier
  answers it, and the answer is the class name — a word you can find, count and delete.
- [/framework/core/Page/doc/](/framework/core/Page/doc/) — "should all demos be pages?"
  was decided against: a demo marks itself \`.default\`, it does not become a route.`);

		md(`Nothing is built on this page. The interface it draws — a bar over a stage — is
[ext/demo](/framework/ext/demo/), which is on nearly every page of this site already; a
note-sized copy would teach less than opening one.`);
	}
});
