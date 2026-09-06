import { md, div, a, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the `layout` skill's five):
   1. Container — the app's main region under /notes/, a plain page grid.
   2. Size — one reading column; the photo takes `wide`. The three cards sit in the
      reading column in a `flex gap wrap`, each `flex: 1 1 11em`, so they are three
      across at 1280 and stack at 400 — the note draws them small, and a preview card
      that fills a 3440 screen is not a preview.
   3. Own layout — `.md` prose, plus one `flex gap wrap` of three `surface` boxes.
   4. Regions — two: crumbs, then content. No children.
   5. Preview — the photo, from NotesNote.

   The note sketches a preview card three ways and asks "Why does this resist me?".
   Built here as the three shapes, side by side, so the question has an answer you can
   look at: they differ only in where the picture goes. */

// The "image goes here" mark the note draws — a box with a cross through it. Two
// gradients, because that is exactly what the sketch is and it needs no asset.
const CROSS = "linear-gradient(to top right, transparent calc(50% - 1px), var(--line) 50%,"
	+ " transparent calc(50% + 1px)), linear-gradient(to bottom right, transparent"
	+ " calc(50% - 1px), var(--line) 50%, transparent calc(50% + 1px))";

const thumb = () => div().style({ height: "4em", border: "1px solid var(--line)",
	borderRadius: "var(--radius)", background: CROSS });

const lines = n => div.c("flex v").style("gap", "0.35em").append(() => {
	for (let i = 0; i < n; i++) div().style({ height: "0.4em", borderRadius: "999px",
		background: "var(--line)", width: (i === n - 1 ? "60%" : "100%") });
});

/* The three cards. Each is a real link to the page on this site that is the built
   version of that shape. Nothing here has state, so nothing here persists. */
function preview_shapes(){
	const card = (label, url, body) => div.c("surface pad flex v gap")
		.style({ flex: "1 1 11em", minWidth: "0" })
		.append(() => {
			body();
			a(label).href(url);
		});

	return div.c("flex gap wrap", () => {
		card("Picture on top", "/framework/core/Page/doc/previews/", () => {
			thumb();
			lines(2);
		});

		card("Picture beside", "/framework/core/Page/", () => {
			// ⚠ Block bodies: a captured callback's return value is appended too, and
			// the second append MOVES the element.
			div.c("flex gap").append(() => {
				div().style("flex", "0 0 3.5em").append(() => { thumb(); });
				div().style("flex", "1 1 auto").append(() => { lines(3); });
			});
		});

		card("Words only", "/framework/core/Page/overview/columns/", () => {
			lines(4);
			div.c("flex gap", () => {
				div().style({ height: "1.2em", width: "3em", borderRadius: "var(--radius)",
					border: "1px solid var(--line)" });
				div().style({ height: "1.2em", width: "3em", borderRadius: "var(--radius)",
					border: "1px solid var(--line)" });
			});
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Page previews, & columns",
	icon: "grid_view",
	description: "A card for every page — three shapes, and the question of what auto-renders.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is headed, underlined:**

> **Page Previews, & Columns**

and then draws the same card three ways — a picture with words under it, words with a
picture beside them, words with two little buttons — before saying the thing everyone
who has tried this has felt:

> **Why does this resist me?**

An arrow off the sketches asks what a preview is *for*:

> variants · examples (compositions) · code (js)

Then a run of API sketches:

> **Sections**
> \`section.c(\`      \`page.md?\`      \`.md({file})\`
>
> **Themes:**
> a) switch the whole \`<link>\`?
> → b) just switch the class (on body)
>
> [a wide short box] header? Maybe not
> [a box with a narrow left column] dev sidebar(s)? ctrl + backslash ?  Slide for responsive?
>
> \`page({ icon: "w/e", title: "Page Title", meta: import.meta ← path, render(), sub page()? })\`

**The right page is about where a page's children come from.**

> \`pg.add?\`
>
> \`/path/page.js\` — import subs? \`const sub-pages = [a, b, c]\` ?
>
> \`pg.sub("one", "two", "three")\` ← auto import?

drawn as a checkbox list — ☐ one ○ two ▽ three ☐ four — beside two cards: one headed
*☐ One* with a \`</>\` tab and a preview captioned *section 1*, one headed *usage* holding
\`section.c("s34", () => {…})\`. Then the auto-render question again:

> \`export default section.c("s34", () => {…})\`  ↓ auto-renders…
>
> \`page(() => {\`  // wrap in a page to stop auto-render?
>     \`section(…\`
>     \`preview…\`
>
> Can each page be a pager, activate itself?
>   → root page is the pager (basically just has \`.active-page\`?)
>
> \`/dum/page.js\` w/ \`/one.js\`, \`two.js\`
>
> \`app.dum.page.one()\``);

		md(`## The three shapes, built

The note's three sketches, as three real cards. They differ in one thing only — where
the picture goes — which is most of the answer to "why does this resist me?": it is not
three components, it is one card with the picture in three places. Each links to the
built version.`);

		preview_shapes();

		md(`## What it points at

- [\`children:\`](/framework/core/Page/doc/declaring/) — the note's
  \`pg.sub("one", "two", "three")\`, shipped, spelled as one string. A parent names its
  children and they are imported when the page needs them; nothing crawls the disk.
- [previews](/framework/core/Page/doc/previews/) — the preview card, built: a page
  describes its own card, its parent renders a wall of them, and the default is a card
  you get for free.
- [core/Page — columns](/framework/core/Page/overview/columns/) — the *& Columns* half of
  the title, built as Miller columns: a page and its children as peers, side by side.
- [Columns, written down](/framework/core/Page/doc/columns/) — the width words and the
  rules behind that demo.
- [ext/demo](/framework/ext/demo/) — *variants · examples · code*, built as one shell:
  a demo shows the code that made it, from one source.
- [/imagine/sections/](/imagine/sections/) — the \`section.c(\` sketch, built as
  compositions you can read a page out of.
- [ext/markdown](/framework/ext/markdown/) — \`md({file})\`, built as \`md.file(import.meta,
  "name.md")\`, resolved against the **module** rather than the document.
- [Themes](/framework/styles/layers/theme/) — the note picks option (b), and option (b) is
  what shipped: a theme is a class, not a stylesheet swap.

The auto-render question is answered by the shape every page in this repo now has:
\`export default new Page({…})\`. Constructing a page **registers** it and renders
nothing — no wrapper needed to stop it, and no \`import.meta\` guessing to start it.`);
	}
});
