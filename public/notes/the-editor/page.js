import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. The photo and the wireframe take
   `wide`; prose keeps the measure. Two regions, no children.

   The right page draws an editor: a left sidebar of layers/pages, a stage in the middle,
   and controls that take the stage fullscreen or shrink it to an emulator. That is the
   one interface on the spread, so it is drawn — as a wireframe, at the note's own
   proportions, with the sidebar and the viewport both live. */

const LAYERS = ["Page", "· Header", "· Main", "· · Section", "· Footer"];
const VIEWPORTS = [
	{ name: "phone", w: "20%" },
	{ name: "tablet", w: "48%" },
	{ name: "desktop", w: "100%" },
];

function editor_wireframe(){
	let layer = "· Main", viewport = "desktop", full = false;
	let $box;

	const draw = () => $box.empty(() => {
		div.c("flex gap wrap v-center", () => {
			VIEWPORTS.forEach(v => span.c("surface pad")
				.style({ cursor: "pointer", fontSize: "0.8em",
					outline: viewport === v.name ? "2px solid var(--prim)" : "none" })
				.text(v.name)
				.on("click", () => { viewport = v.name; draw(); }));

			span.c("surface pad").style({ cursor: "pointer", fontSize: "0.8em" })
				.text(full ? "exit fullscreen" : "go fullscreen")
				.on("click", () => { full = !full; draw(); });
		});

		div.c("flex gap").style({ alignItems: "stretch", minHeight: "12em" }).append(() => {
			// The left sidebar IS the layers panel and the pages panel — the note's own
			// sentence. It is hidden by fullscreen, which is what fullscreen means here.
			if (!full) div.c("surface pad flex v gap").style({ flex: "0 0 9em" }).append(() => {
				span.c("muted").style("fontSize", "0.8em").text("layers / pages");
				LAYERS.forEach(name => span.c("surface pad")
					.style({ cursor: "pointer", fontSize: "0.8em",
						outline: layer === name ? "2px solid var(--prim)" : "none" })
					.text(name)
					.on("click", () => { layer = name; draw(); }));
			});

			// The stage. The viewport control narrows the page inside it — the note's
			// "viewport ⇒ emulator(s)".
			div.c("surface pad flex h-center").style({ flex: "1 1 0" }).append(() => {
				div.c("surface pad flex v gap")
					.style({ width: VIEWPORTS.find(v => v.name === viewport).w })
					.append(() => {
						span().style("fontWeight", "700").text(layer.replace(/^[·\s]+/, ""));
						div().style({ height: "2em", background: "var(--line)",
							borderRadius: "var(--radius)" });
						div().style({ height: "2em", background: "var(--line)",
							borderRadius: "var(--radius)" });
					});
			});
		});

		span.c("muted").style("fontSize", "0.85em").text(full
			? `Fullscreen: the sidebar is gone and the stage is the whole box — "viewport & full-full".`
			: `Editing ${layer.replace(/^[·\s]+/, "")} at ${viewport} width. The sidebar is the layers panel and the pages panel at once.`);
	});

	$box = div.c("surface pad flex v gap wide");
	draw();
	return $box;
}

export default new NotesNote({
	meta: import.meta,
	title: "The editor",
	icon: "edit_square",
	description: "A left sidebar of layers, a stage, and a viewport that becomes an emulator.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page works out how a demo shows two things at once.**

> **FILL?** — ① Auto Height + Scroll = just works. ⚠ But, if you stack \`[render]\`
> \`[code]\`, & they're both tall, you can't see them both at the same time.
>
> ② Split screen — required for mobile?

Then demos:

> **Demos** — responsive · mobile device: \`demo.mobile()\`? — scrollable · interactive ·
> for viewport — *gutter for scrolling past on mobile?*
>
> ⚠ rather than that, why not just have **full-screen mobile demos w/ their own
> instructions, nav, next, done, etc.**

with a row of sketches under it: a page with a phone beside it, then four frames of
previews, some crossed out.

**The right page is the editor.** Across the top, a page with blocks becomes a page
with a code panel — \`{ javascript() }\` — and beside it:

> **Full Grid of Previews?** — \`SECTIONS\` over two stacked frames, and a column reading
> **ELEMENTS · UI · LAYOUTS · PAGES · SITES/APPS**
>
> ⚠ Pages can be d&d via layers panel?

> **EDITOR**
> Left sidebar becomes layers/pages.
> Pages can have sub pages.
> Pages can have sidebars/footnotes/unpublished pages.
> Pages can have any layout (& size?)
>
> Any el, ui, layout, section, page could be loaded into the editor, which can:
> ☐ go fullscreen (viewport & full-full)
> ☐ customize workspace, <u>viewport</u> ⇒ emulator(s), code, files, zoom, layout, etc…?

and two questions to finish:

> The editor represents a page? · Is the code even important, if we're going toward json?`);

		md(`## What it points at

- [ext/demo](/framework/ext/demo/) — the left page's exact problem, solved: the demo shell
  puts the render and its code in one frame with the viewport under your control, so the
  two never fight for the same fold.
- [Build](/imagine/paging/build/) — the page builder: controls, stage and the file being
  written, side by side. The wireframe below is its shape at note size.
- [Make](/imagine/paging/make/) — "is the code even important, if we're going toward
  json?" answered by building it: a page edited in the browser and written back as data.
- [core/Layout](/framework/core/Layout/) — "pages can have any layout (& size?)": layouts
  are a tree a page picks from, which is what a layers panel would be listing.
- [/imagine/paging/library/](/imagine/paging/library/) — "Full Grid of Previews", built as
  a wall you open one item from.`);

		md(`## The editor, as a wireframe

The note's own three parts. The **left sidebar** is the layers panel and the pages panel
at the same time — click a layer and the stage says so. The **viewport** buttons shrink
the page inside the stage, which is the note's "viewport ⇒ emulator(s)". **Fullscreen**
takes the sidebar away and gives the stage the whole box.`);

		editor_wireframe();

		md(`This is a wireframe, not the editor: nothing here saves, and a refresh puts it
back. The real one — with files, code and a stage you can actually type into — is
[Build](/imagine/paging/build/).`);
	}
});
