import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid; photo `wide`, prose keeps the
   measure. Two regions, no children.

   Nothing is built. The left page proposes a page CONSTRUCTOR and the site shipped one —
   so the honest thing is to show the shape it landed as, in prose, beside the link to
   its doc. The right page's typography list is styles/elements, live, one click away. */

export default new NotesNote({
	meta: import.meta,
	title: "Perfectly simple syntax?",
	icon: "code",
	description: "What a page constructor should take — and the day the basics were declared fine.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is trying to find the shortest way to declare a page.** Three spellings,
in order:

> \`app.page = current page?\`
>
> or \`app.page("Title & H1", () => { … }),\`
>
> or just \`page("Title/H1", () => { … });\`
>
> **PERFECTLY SIMPLE SYNTAX?**
> → Might not matter, soon…

Then it asks what a page really is:

> Types of Pages? Extend \`Page\`? \`new Page({…})\`?
>
> \`page("Name", {\`     — 1st → Name, pojo → constructs, else → append
>   \`preview(){…},\`
>   \`title: "Custom",\`
>   \`icon: "whatever",\`
>   \`img: "./path.jpg",\`
>   \`layout: Layout.Four,\`
>   \`classes: "prose another"\`
> \`}\`
>
> Default pager? = ✳layout? ✳background > ✳pager?
>
> \`app.pager?\`
>
> Does each page need its own pager? Sounds complicated

**The right page is dated and timed** — *2:35*, then *2:43 pm*, then *7/9/2026, 9:57 am*
— and it opens by clearing the decks:

> **BASICS**
>
> ∅ Routing? ∅ Tabs? **They aren't hurting anything.**
>
> **TYPOGRAPHY**
>
> \`dum.p1()\` \`dum.p2()\`, etc? ⇒ Static/predictable?
>
> hx → [h1 / p] [h2 / p] [h1 / h2 / p]     blockquote? callout?
>                                          ul/ol/li  +icon? +header? +footer? } Card?
>                                          inline…

Then the auto-render question one last time:

> \`page("One"),\`  vs  \`h1("One")\`  vs  \`export default page(\`
>   ↓ auto-render                          ↓ do not

and, at the foot, the price:

> Level 1 = Free
> Level 2 = \\$10/mo Unlimited`);

		md(`## What it points at

The left page's proposal shipped, almost line for line. A page here is:

> \`export default new Page({ meta: import.meta, title, icon, description, children,
> content(){} })\`

— a plain object into a constructor, with \`preview()\`, \`classes\` and a layout all
optional, exactly as the note drew it. What did **not** ship is the pager: the note's own
"sounds complicated" was right, and the tier was removed. A page's parent is its pager.

- [core/Page](/framework/core/Page/) — the blessed shape, and every field the note lists.
- [Declaring children](/framework/core/Page/doc/declaring/) — the constructor and
  \`children:\`, in detail: how a page gets its sub-pages without a pager.
- [previews](/framework/core/Page/doc/previews/) — the note's \`preview()\`, built.
- [core/Layout](/framework/core/Layout/) — \`layout: Layout.Four\`, built as a tree of rows
  and columns rather than a fixed set of four.
- [styles/elements](/framework/styles/elements/) — the whole typography list on the right
  page, rendered rather than named: headings, paragraphs, lists, quotes, code, tables.
- [/imagine/design/type/](/imagine/design/type/) — \`dum.p1()\` / \`dum.p2()\` as it was
  actually settled: one clamped scale, so sizes are predictable without being static.
- [Levels and points](/notes/levels-and-points/) — *Level 1 = Free, Level 2 = \\$10/mo*,
  as its own note.
- [Payments](/imagine/platform/research/payments/) — the research behind the price, each
  claim carrying a credence.

*"∅ Routing? ∅ Tabs? They aren't hurting anything"* is the best line on the spread and it
held: routing and tabs were both left alone for weeks after this, and neither one broke.`);

		md(`Nothing is built on this page — the syntax it is designing is the syntax this
page is written in, so the demo is the file itself.`);
	}
});
