import { md, div, a, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the `layout` skill's five):
   1. Container — the app's main region under /notes/, a plain page grid.
   2. Size — one reading column; the photo takes `wide`. The browser below sits IN the
      reading column on purpose: the note draws it small, and a four-tab picker that
      spans a 3440 screen would be a different thing.
   3. Own layout — `.md` prose, plus one `surface` box whose inside is `flex v gap`:
      a tab row (`flex gap wrap`) over a list.
   4. Regions — two: crumbs, then content. No children.
   5. Preview — the photo, from NotesNote.

   The note sketches an element browser with four tabs and fills two of them in. Built
   here as the real thing: every leaf is a link to the page on this site that shows that
   element for real, so the wireframe is a way IN rather than a picture of one. */

// The note's four tabs, in its order. `items` are the words the note wrote under a tab;
// where the note left a tab empty, `note` says so and the links are what the site has.
const TABS = [
	{
		key: "Elements", icon: "<>",
		note: "The note names four.",
		items: [
			{ name: "Text",  url: "/framework/styles/elements/text/",  desc: "headings, paragraphs, lists, quotes" },
			{ name: "Btn",   url: "/framework/styles/elements/forms/", desc: "buttons, and every control beside them" },
			{ name: "Img",   url: "/framework/styles/elements/media/", desc: "images, figures, video" },
			{ name: "Input", url: "/framework/styles/elements/forms/", desc: "inputs, selects, textareas" },
		],
	},
	{
		key: "Layout", icon: "▦",
		note: "The note names three.",
		items: [
			{ name: "Flex", url: "/framework/styles/layouts/flex/", desc: "the row-and-column word set" },
			{ name: "Gap",  url: "/imagine/design/spacing/",        desc: "one spacing scale, clamped" },
			{ name: "Wrap", url: "/framework/core/Layout/doc/props/", desc: "the props a layout node takes" },
		],
	},
	{
		key: "Sections", icon: "▤",
		note: "The note draws the tab and leaves it blank. The site filled it in twice.",
		items: [
			{ name: "Section styles", url: "/framework/styles/sections/", desc: "hero, features, footer, FAQ…" },
			{ name: "Sections lab",   url: "/imagine/sections/",          desc: "the same sections, composed into pages" },
		],
	},
	{
		key: "Components", icon: "◫",
		note: "Blank on the page. The site's components are the ext/ and ui/ tiers.",
		items: [
			{ name: "ext/", url: "/framework/ext/", desc: "Panel, Doc, demo, tabs, markdown, Draggable…" },
			{ name: "ui/",  url: "/framework/ui/",  desc: "the smaller pieces pages are made of" },
		],
	},
];

/* One live browser. State is the open tab; a click repaints the list. Nothing persists —
   a refresh is the first tab again (minion rules: demos do not persist). */
function element_browser(){
	return div.c("surface pad flex v gap", () => {

		// The note's own header: the site name over the framework name, then "Styles".
		div.c("flex split gap wrap v-center", () => {
			span().style("fontWeight", "700").text("LEW42 · FRAMEWORK");
			span.c("muted", "Styles");
		});

		let open = TABS[0];
		const $tabs = div.c("flex gap wrap");
		const $body = div.c("flex v gap");

		const draw = () => {
			$tabs.empty(() => TABS.forEach(tab => {
				const $b = button.c("flex gap v-center", () => {
					span.c("muted", tab.icon);
					span(tab.key);
				}).on("click", () => { open = tab; draw(); });

				/* The open tab. `aria-pressed` is the real state for a screen reader;
				   the underline is the sighted half. Both are set from the SAME
				   condition, and the rule is inline because it is runtime state — no
				   `.notes-*` class exists for it, and notes.css is not this task's to
				   edit (it is shared with the other note batches). */
				$b.attr("aria-pressed", tab === open ? "true" : "false");
				if (tab === open) $b.style({ fontWeight: "700",
					borderBottom: "2px solid var(--prim)" });
			}));

			$body.empty(() => {
				div.c("muted", open.note);
				div.c("flex v gap", () => open.items.forEach(item => {
					div(() => {
						a(item.name).href(item.url);
						span.c("muted", " — " + item.desc);
					});
				}));
			});
		};

		draw();
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "An element browser",
	icon: "widgets",
	description: "Four tabs — Elements, Layout, Sections, Components — and the squeeze that needs container queries.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is the site's first navigation list**, written straight down:

> ABOUT · FLY · FRAMEWORK · MARKETING · DESIGN · DEVELOPMENT · LAYOUT

and beside it a theme dropdown, drawn as a real select: **No theme · Framework · Lew42**.

Then a question and three problems.

> GitHub bundle for framework?
>
> **Squeeze:** ☑ add pad to squeeze (or not)
>   ☑ collapses "pad" to 0
>     ☑ can't be used vertically w/o max-height & v-centering…
>       → container queries
>
> vs **Section Padding?**
>   ☑ blows out on mega
>   ☑ could wrap the full site…
>   ☑ OK for Figma… (→ faster/easier)
>
> **iFrame Previews:** or just, "full-screen" layouts:
>   ☑ device viewport becomes a factor
>   ☑ simulate desktop @ 1920×1080 w/ scroll cutoff
>   or ☑ simulate desktop @ 1920 × Y, w/o…
>
> If each example is its own… \`sub-page.js\`, you can easily link to it?

**The right page draws the browser.** It opens with the rule that makes a layout system
a system at all:

> Any layout (row or column) could add any other layout…

— with four boxes under it: a plain box, a box holding a box, a box split into two
columns, a box with a sub-box on one side. Then:

> Base, Framework, Lew42?
>
> ☑ html ☑ images ☑ layout ☑ form?
>
> **An element browser,**

drawn as **LEW42 / FRAMEWORK >**, the word *Styles* above four tabs —
**\`<>\` Elements · Layout · Sections · Components** — with *Text · Btn · Img · Input*
under the first and *Flex · Gap · Wrap* under the second. At the foot, two page sketches:
a browser frame with a small side nav and a big play button, and a frame headed
**Page Title** with ruled lines, captioned *Section*.`);

		md(`## The element browser, built

The note's four tabs, live. Every leaf links to the page on this site that shows that
element for real — the two tabs the note left blank are filled in with what the site
actually has.`);

		element_browser();

		md(`## What it points at

- [core/Layout](/framework/core/Layout/) — "any layout could add any other layout" is the
  whole thesis of the layout tree: a node is a row or a column, and its children are
  nodes.
- [styles/elements](/framework/styles/elements/) — the *Elements* tab, built: text,
  lists, code, table, forms, media, misc, each one shown rather than described.
- [/imagine/sections/](/imagine/sections/) — the *Sections* tab, built as compositions
  you can read a page out of.
- [ext/demo](/framework/ext/demo/) — "if each example is its own sub-page.js, you can
  easily link to it" — that is what the demo shell does: every demo has its own URL, its
  code beside it, and a width you can set.
- [/imagine/design/spacing/](/imagine/design/spacing/) — the *Squeeze* vs *section
  padding* argument, settled: padding is a clamp, so it collapses at 400 and does not
  blow out on a mega screen.
- [/imagine/design/themes/](/imagine/design/themes/) — the theme dropdown the note draws,
  working. A theme is a class on the root, and switching it removes the others.

The container-query line is still true and still bites: a container query **cannot
restyle the element that declares it**, only its descendants.`);
	}
});
