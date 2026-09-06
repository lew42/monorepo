import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose keeps the measure. Own layout: `.md` flow. Two regions, no children. Preview: the
   photo thumb.

   Nothing is built. The spread describes three things that all exist and are better as
   themselves than as a sketch of themselves — a drag-and-drop list, a page built from json,
   and a sidebar — so this note links each one live instead of drawing a smaller copy. */

export default new NotesNote({
	meta: import.meta,
	title: "Drop, then rerender",
	icon: "drag_indicator",
	description: "Drag, drop, rerender - the view is fine.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page works out what drag and drop actually costs.**

> **Overlay?**
>
> Drag & Drop → **Preview as you drag?** = manipulate DOM & List?
>
> ✱ **When dropped → List Δ → Rerender?** The view should be fine?

That is the whole design, and it is the right one: while you drag, the browser shows a
preview; when you let go, you change the **list** and redraw from it. Nothing has to
carefully undo what the drag did to the DOM, because the list was always the truth.

> ① A "component"? Savable?
>
> \`json\` / \`jsonl\` } → **Autoload & render** → **UI** ↔

Then a small filesystem wish-list:

> ☑ new folder ☑ new file → json / jsonl
> ☑ new server / dir / proj…
>
> How to start/stop servers?

and the tool it all adds up to:

> **Simple Layout Library & Generator** — mobile ↔ mega
>
> \`json\` → **Layout** + **UI Δ**
>
> Can we consistently save & load? ✱ **Render view from json…**
>
> Currently w/ components: ① load json ② instantiate? (assign?) ③ instantiate children…

**The right page is the site's own chrome.**

> **My Sidebar…** ☑ Better nav items ☑ Categories? Top, Nav, bottom? (A). etc?

with a frame beside it, then **Layout Editor w/ Responsive Techniques?** over a wireframe,
and a phone frame:

> **Sticky header?** Smart sticky (shows on scroll up?)

Then, in capitals:

> **ADMIN SIDEBAR(S)?**
>
> **Don't let a good idea slow you down.**

A phone sketch \`LEW42 ☰\` beside:

> In the absence of a "main nav", users can just go back to homepage.
> ☑ fly ☑ 3D scroll

and a wide bar \`☰ LEW42 [CONTACT]\` beside:

> container + content… ☑ dep/breakage ☑ \`app.$root.ac("page")\` bullshit…?
>
> **Allow pages to be importable?**`);

		md(`## What it points at

- [ext/Draggable](/framework/ext/Draggable/) — drag and drop, built the way the note says:
  the drop changes the list, the list redraws the view, and the DOM is never the record.
- [core/Page](/framework/core/Page/) — **"render view from json" landed.**
  \`Page.from(json)\` is core's third way a page arrives: \`Page.load()\` is "the \`page.js\` at
  this url", \`Page.file()\` is "the \`.md\` beside me", and \`Page.from()\` is "the data that
  describes a page" — title, icon, mode, children, read straight off an object or a
  \`page.json\`. The note's three steps (load json → instantiate → instantiate children) are
  literally its three lines.
- [/imagine/cms/json/](/imagine/cms/json/) — that pattern running: a page whose whole
  subtree arrives from a fetch.
- [ext/Saver](/framework/ext/Saver/) — the "savable component" half, and where its limits
  are written down.
- [core/Layout](/framework/core/Layout/) — the "Simple Layout Library & Generator": a
  layout is a named tree you can browse, not a folder of pictures.
- [core/Sidebar](/framework/core/Sidebar/) — "My Sidebar", with the nav item categories the
  note asks for.
- [Paging · make](/imagine/paging/make/) — new page, new folder, organise. This is the one
  editor on the site that saves, and it says so on screen when it does.
- [ext/files](/framework/ext/files/) — the file tree the "new folder / new file" list wants.

**"Allow pages to be importable?"** is answered by the framework's own rule rather than by a
feature: a \`page.js\` is a module, so importing it is ordinary, but **imports flow down** and
a page only exists once its parent's \`children:\` names it. Importing a page sideways is what
breaks on a deep reload.`);

		md(`**Nothing is built here.** Every idea on the spread already runs somewhere on this
site, and a small copy beside the photo would be a worse version of the real one. The links
go to the working things.`);
	}
});
