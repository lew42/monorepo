import { md, div, a, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the `layout` skill's five):
   1. Container — the app's main region under /notes/, a plain page grid.
   2. Size — one reading column; the photo takes `wide`. The strip below takes `wide`
      too, because it IS a three-column grid: at the reading measure the three cells
      would each be ~11em and the subdivisions inside them illegible.
   3. Own layout — `.md` prose, plus one `flex gap wrap` of three `surface` cells,
      each `flex: 1 1 13em` so the strip is 3-up from 1280 and stacks at 400.
   4. Regions — two: crumbs, then content. No children.
   5. Preview — the photo, from NotesNote.

   The note draws a 3-column grid and then subdivides one cell three ways. Built here
   as that exact strip: three cells, three subdivisions, each cell linking to the page
   on this site that is the built version of that arrangement. */

// The "picture goes here" mark, same as the note's crossed boxes. Two gradients, no asset.
const CROSS = "linear-gradient(to top right, transparent calc(50% - 1px), var(--line) 50%,"
	+ " transparent calc(50% + 1px)), linear-gradient(to bottom right, transparent"
	+ " calc(50% - 1px), var(--line) 50%, transparent calc(50% + 1px))";

const tile = (h = "2.4em") => div().style({ height: h, border: "1px solid var(--line)",
	borderRadius: "var(--radius)", background: CROSS });

/* One cell of the strip: a subdivision, its name, and where it is real on this site. */
function nav_strip(){
	const cell = (label, url, body) => div.c("surface pad flex v gap")
		.style({ flex: "1 1 13em", minWidth: "0" })
		.append(() => {
			body();
			a(label).href(url);
		});

	return div.c("flex gap wrap wide", () => {

		// Four equal tiles — the note's first variant.
		cell("Four equal", "/notes/", () => {
			div.c("flex gap", () => { tile(); tile(); });
			div.c("flex gap", () => { tile(); tile(); });
		});

		// One big, two small — the second.
		cell("One big, two small", "/framework/core/Page/overview/columns/", () => {
			tile("3.4em");
			div.c("flex gap", () => { tile("1.4em"); tile("1.4em"); });
		});

		// A full-width band — the third.
		cell("A full-width band", "/imagine/sections/", () => {
			tile("1.4em");
			tile("3.4em");
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "page ≠ prose",
	icon: "format_align_left",
	description: "The lobotomized owl, an opt-in .prose class, and why a page is not a document.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page starts wide and narrows fast.**

> Typography ⇒ Site ⇒ Portfolio?
>   ↓ socials?  ↓ design?  ↘ ai?
>       ↓ ai      ↓ web     ↓ presi   ↘ logo?

Then a 3-column grid of six boxes, and one cell subdivided three ways — four equal, one
big with two small, a full-width band:

> **3-col grid** → [ ▢▢ / ▢▢ ]  or  [ ▢ / ▢▢ ]  or  [ ▬ / ▢ ]
>
> Good for **Visual Nav**: ☑ Preview ☑ Clickable ☑ Interactive… ☑ Long/Scrollable?
>   ↓ Icon? Rendered? & Zoomed?

Then, under a rule, the CSS half — and it is a real debugging session on paper:

> **Typographic Rhythm:** \`* + * { margin-top }\` (lobotomized owl?)
>
> Use sections w/ flex & gap? = most figma like but pita?
>
> hx → auto adds?  \`:is(hx):not(:first-of-type)\` ↓ **fails for first h2…**
>
> [H2 with *H3 Subheading* under it]  [H1 with *H2 First Section* under it]
>   ↳ just don't use h3?     aka \`* + :is(hx)\`
>
> \`:is(h2,h3,h4,h5,h6):not(:first-child) { mt: 4em }\` ?
> ☑ fails if invis 1st child… OR [+mt on H2] ⇒ \`.prose, .md\`

**The right page settles it.**

> \`.prose\`, ~~.md~~ \`.markdown\`
>
> \`:is(.prose, .markdown) > :is(h2, h3) { margin-top: 2em }\`
> ☑ **opt-in** (must add \`.prose\`)
>
> You could add this to a (page) class…?
>   → need to be careful here… max-width? **page ≠ prose…**
>
> \`app.$root.ac("page")\` ⇒ root.page? ⇒ appearance?
>
> \`app.$layout.ac("full")\` → removes white, max, etc?
>
> **bg > layout > page?**
>
> To get dashboards & content out of the same system…
>
> **Markdown w/ Nav?**
> \`dir/page.js\` → just \`md({file: "filename.md"})\`?
> (\`/markdown/\`) \`page("Name", md({file: "name.md"}))\`
>
> Or, use directory?`);

		md(`## The 3-column strip, built

The note's grid, and the three subdivisions it draws inside one cell. Each links to the
place on this site where that arrangement is doing real work.`);

		nav_strip();

		md(`## What it points at

The owl argument on the left page has an exact answer in this repo's own CSS, and the
note reached it first.

- [The cascade](/framework/styles/rules/cascade/) — \`framework.css\` ships
  \`:where(.flow, blockquote) > * + * { margin-block-start: var(--flow) }\`. That is the
  lobotomized owl, **opt-in** under the name \`.flow\` instead of \`.prose\`, with
  \`blockquote\` getting it for free — and a second rule right after it gives \`h3\`/\`h4\`
  "half again" more space, which is the note's *H3 Subheading* problem solved by
  ordering rather than by \`:not()\` gymnastics.
- [Page.css](/framework/core/Page/doc/css/) — **page ≠ prose**, enforced. The page grid
  and the reading measure are separate things, so a dashboard and an article come out of
  the same system without one wearing the other's max-width. That is the note's last
  question, answered.
- [/imagine/design/spacing/](/imagine/design/spacing/) — the rhythm as a scale: every
  space in the site is a clamp, so \`2em\` and \`4em\` became one ramp instead of two magic
  numbers.
- [/imagine/design/type/](/imagine/design/type/) — the typographic scale itself.
- [ext/markdown](/framework/ext/markdown/) — \`md({file})\`, built as
  \`md.file(import.meta, "name.md")\`. It resolves against the **module**, not the
  document, which matters here because the document URL is a route.
- [/notes/](/notes/) — the visual nav the left page is drawing, running: a wall of
  preview cards, each one a picture and a title.
- [core/Page — columns](/framework/core/Page/overview/columns/) — the "one big, two
  small" arrangement, as real pages side by side.

One trap from the note is still live, and it is written on the wall of this repo: a
utility layer rule beats a component's own \`:first-child\` rule, so "fails if invis 1st
child" is not hypothetical — it is how the layer order works, on purpose.`);
	}
});
