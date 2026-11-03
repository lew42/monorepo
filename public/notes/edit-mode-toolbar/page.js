import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose at the measure.
   Two regions, no children. Nothing built — the edit-mode toolbar is already live at
   /imagine/paging/toolbars/ on four edges, and the jumpy-resize line is a bug report,
   not an interface. Said in one line at the end. */

export default new NotesNote({
	meta: import.meta,
	title: "Edit mode with a toolbar",
	icon: "build",
	description: "Browse normally, but with a toolbar — and the devbar goes to the bottom on mobile.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page asks what an "edit mode" actually is.**

> **Default → "Edit" mode:**
> ☑ Browse normally, test ui/ux, but w/ a toolbar?
> ☑ Could hide devbar…

> **How do you see/edit the code?**
> → @ what resolution (both: user's device & page layout determine what kind of outcomes
> are even possible)
> → trying to visualize mega layout on mobile:

drawn as a phone frame with a page under it, and beside it:

> & see code? *maybe…* — **Mobile: devbar @ bottom?**

Then the scope of it:

> Any page could have edit mode: see the files, get a viewport?
>
> Should all pages have this… dev view? → list children?
>
> Or, maybe it's an app-level shell.
>
> Vs demos: stage? split? **demo = preview = mini app.**

**The right page is the \`Page\` constructor.**

> \`new Page({ title, content })\`
> \`icon, name, url, desc, meta, img\`
> \`{ name } / { fullName }\`

drawn beneath as a three-column frame — \`TITLE / content\`, a list of previews, and a
\`new Page\` form — and then the honest note under it:

> resizing w/ multiple columns is a little jumpy… responsiveness — isn't even always
> important?

Two more frames follow: a page with two stacked blocks, and the same page as
\`← Current Item →\` with arrows on both sides. Then a page-title frame opening a nested
page-title frame, captioned **Page edit controls?**, and at the foot:

> \`PageDemo extends Page\`? — Basic Intro: slowly evolving page ⇒ system? —
> \`Example 3.2\``);

		md(`## What it points at

- [core/Page](/framework/core/Page/) — \`new Page({ title, content })\` is the real
  constructor, and every property listed on the right page is a real key on it.
- [/imagine/paging/toolbars/](/imagine/paging/toolbars/) — "browse normally, but w/ a
  toolbar", built: the same bar on all four edges, so "devbar @ bottom on mobile" is a
  placement, not a rewrite.
- [/imagine/paging/navigation/](/imagine/paging/navigation/) — \`← Current Item →\`, built:
  nine navigation mechanisms, and preview walls do most of the work.
- [ext/demo](/framework/ext/demo/) — "demo = preview = mini app": the demo shell is
  exactly that, one component that is a preview on an index and a running app when opened.
- [core/Page/doc/](/framework/core/Page/doc/) — "\`PageDemo extends Page\`?" was tried and
  rejected across the docs: demos mark themselves \`.default\`, they do not subclass \`Page\`.
- [/imagine/paging/room/](/imagine/paging/room/) — "resizing w/ multiple columns is a
  little jumpy": columns are resizable there, and how much room a box gets is a word
  rather than a drag, which is what stopped the jump.`);

		md(`Nothing is built on this page. Every interface it draws is already live and
larger — the toolbar on four edges, the item pager, the page constructor — and the one
genuinely new line is a **bug report** ("a little jumpy"), which belongs beside the
resize code, not in a demo box.`);
	}
});
