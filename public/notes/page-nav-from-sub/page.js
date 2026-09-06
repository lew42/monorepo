import { md, div, span, select, option } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose and the two frames keep the measure — each frame is capped at 20em because it is
   demonstrating a PHONE, and a phone-width pattern shown 800px wide teaches nothing. Own
   layout: `flex gap wrap`, so the pair sits side by side from 1280 up and stacks at 400.
   Two regions (crumbs, content), no children. Preview: the photo thumb.

   The one buildable thing is the note's own either/or: tabs do not fit a phone, so either
   the row scrolls sideways or it collapses into a dropdown. Two frames, both real — the
   left one really scrolls, the right one really opens. */

const SECTIONS = ["Overview", "Install", "Pages", "Layout", "Routing", "Themes"];

// One phone-width frame with a caption under it. Both demos are the same box.
function frame(caption, build){
	return div.c("flex v gap").style({ flex: "1 1 16em", maxWidth: "20em" }).append(() => {
		div.c("surface pad flex v gap").append(() => {
			div.c("flex gap v-center").append(() => {
				span().style("fontWeight", "700").text("Page Title");
				span.c("muted").style({ marginLeft: "auto" }).text("☰");
			});
			build();
		});
		span.c("muted").style("fontSize", "0.85em").text(caption);
	});
}

function mobile_tabs(){
	return div.c("flex gap wrap", () => {

		/* Side swipe. The horizontal scroll here IS the pattern, not an accident — the
		   layout skill's rule is that a scrollbar must be a decision, and this is the
		   decision the note is weighing. */
		frame("Side swipe — every section stays visible, but only three at a time, "
			+ "and the ones off the right edge are easy to miss.", () => {
			div.c("flex gap").style({ overflowX: "auto", paddingBottom: "0.4em" })
				.append(() => SECTIONS.forEach((name, i) => {
					span.c(i === 0 ? "surface pad" : "pad").style({
						flex: "0 0 auto", fontSize: "0.85em",
						borderBottom: i === 0 ? "2px solid var(--prim)" : "2px solid transparent",
					}).text(name);
				}));
		});

		// Dropdown. A real <select>, so the whole list is one tap and nothing hides.
		frame("Dropdown — one tap shows all six, and the current section is always the "
			+ "label. Nothing is hidden off an edge.", () => {
			div.c("flex v gap").append(() => {
				span.c("muted").style("fontSize", "0.8em").text("Section Title ▾");
				select(() => { SECTIONS.forEach(name => { option(name); }); });
			});
		});
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Page nav should come from .sub",
	icon: "list",
	description: "Not the directory - and tabs on mobile.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is headed \`/web-os/\`** and draws one screen: a frame with a small rounded
card inside it, lines of text in the card. An arrow runs down from the frame to the
question it raises:

> "Internal" / Sub Nav… **Scroll Spy?**
>
> \`page.sub(…)\`?

A second, long arrow curls from the same sketch to **auto preview?**, and three numbered
steps for how a preview could be made out of the page itself rather than authored:

1. **Rerender full** (or img, p, etc)
2. \`.sel > * { display: none }\` — hide everything —
   \`.sel > :is(h2, h3, h4) { display: block }\` — *(hide non-h)*
3. \`= h1\` **Title**, \`h2\` sub, \`h2\` sub — labelled **Magic (ToC)**

Then the sentence the page is named for:

> **Page nav should come from \`.sub\`, not Directory**

and \`Scroll Spy? Sub, sub?\` under it. At the foot, unrelated: *Organize Events / Sell
Tickets — Privilege?*

**The right page is layout.** A strip of boxes across the top — a two-column frame, a wide
one, a narrow one, then a frame labelled \`col ---\`. Beside them:

> **Tabs are great, but on mobile?**
> → \`tab1 tab2 tab…\` → **side swipe**
> *or*
> **dropdown ▾**, **Section Title ▾**

A phone frame on the left shows \`PAGE TITLE ☰\` over \`Sticky Section ▾\`. Under the sketches,
two routes and their labels:

> \`/web/framework/\`?  →  "Framework"
> \`/web/os/\`?  →  "Web OS"

> These big jump/nav btns are cool, should they be a part of the left nav?

> Stick to static w/ R2 + Container?`);

		md(`## The mobile choice, both ways

The note draws the two answers and picks neither. Here they are at phone width, so the
trade-off is visible rather than described: the left frame really scrolls sideways, and the
right one really opens.`);

		mobile_tabs();

		md(`This site chose the **dropdown** for narrow screens and kept the tab row for wide
ones — the [navigation study](/imagine/paging/navigation/) is where that got measured, and
its thesis is the reason: a control that moves under your thumb between visits is worse than
one that is always in the same place.`);

		md(`## What it points at

- [ext/toc](/framework/ext/toc/) — the table of contents built from the page's own
  headings. That is step 3 of the auto-preview sketch, shipped: \`h1\` is the title, the
  \`h2\`s are the entries, and nothing is authored twice.
- [ext/tabs](/framework/ext/tabs/) — the tab row itself, and where it stops being the right
  control.
- [Paging · navigation](/imagine/paging/navigation/) — nine navigation mechanisms with the
  rule that decides between them: a stable control beats a clever one.
- [/web/](/web/) — the note's \`/web/framework/\` versus \`/web/os/\` question, resolved
  differently: [\`/framework/\`](/framework/) is the reference (what an API *is*) and
  [\`/web/\`](/web/) is the guide (one decision, shown working). "Web OS" never became a
  route; the split is reference-versus-guide instead of framework-versus-os.
- [core/Page](/framework/core/Page/) — \`page.sub(…)\` landed as \`children:\`, a list of names
  the page declares. Nav does come from the page, not the directory: **nothing crawls the
  filesystem**, and a page exists once its parent names it.`);

		md(`## What was left off

The bottom right of the spread is a shopping list — notebooks, groceries, a mic, a cable.
It is personal logistics, not design, so it is not transcribed here. The
[original](/notes/inbox/2026-09-06-057.jpg) has it, and that link only opens on a local
checkout (the inbox is not in the repo).`);
	}
});
