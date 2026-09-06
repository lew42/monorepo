import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: the app's main region under /notes/, plain page grid. The photo and the strip
   take `wide`; prose keeps the measure. Two regions (crumbs, content), no children.

   The right-hand page ends with five tiny framed sketches numbered #1, #2, #3 — a
   ranked list of layouts to build. That is the one buildable thing here, so it is
   built: the strip, at the sizes the note draws, with the note's own captions. */

// The note's list, in its order. `#3` is drawn but never named — that is on the page.
const SHAPES = [
	{ n: "#1", cols: 1, caption: "1-column (a row? a section?) — fill width, auto height (hug)" },
	{ n: "#2", cols: 2, caption: "2-col" },
	{ n: "#3", cols: 3, caption: "drawn, never named" },
];

function layout_strip(){
	return div.c("surface pad flex v gap wide", () => {
		div.c("flex gap wrap", () => SHAPES.forEach(shape => {
			// ⚠ `style(obj)` takes ONE argument — a callback beside it is dropped and the
			// box renders empty. Children go through `.append()`.
			div.c("flex v gap").style({ flex: "1 1 12em", minWidth: "10em" }).append(() => {
				span().style("fontWeight", "700").text(shape.n);

				// The frame: fill width, auto height, one to three columns inside.
				div.c("surface pad").style({
					display: "grid",
					gridTemplateColumns: `repeat(${shape.cols}, 1fr)`,
					gap: "0.5em",
				}).append(() => {
					for (let i = 0; i < shape.cols; i++)
						div().style({ height: "3.5em", background: "var(--line)",
							borderRadius: "var(--radius)" });
				});

				span.c("muted").style("fontSize", "0.85em").text(shape.caption);
			});
		}));
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "AI research, and a list of UI/UX",
	icon: "science",
	description: "Generative search, annotated markdown, and the first two layouts to build.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is headed \`AI Research\`,** and works through how an AI keeps what it
learns.

1. **Generative Search** — Prompt → Initial Search → <u>Research</u>
2. **Archiving?** — Source → Critique · Cite · Confidence · Create → Claims, Facts,
   Eternal? → <u>ASK</u> → Identify, Investigate

Then the file format that would hold it:

> **Annotate md?** — Add notes, refs, anything · **Immutable** = add line-specific
> metadata/content
>
> \`md.jsonl\`, append-only?
>
> \`mdjj\` — md, json, jsonl → No, separate — better read/write efficiency for AI, i/o tokens

and the problem that follows from it:

> For "live" / parallel work, re-read \`mdjj\` fresh? ⚠ **Massive Context Bloat**… ⇒ Tail it?

The page closes with \`log.jsonl\` and \`ai → mcp\` branching to \`cli\` and \`fs\`.

**The right page is the product list.** \`ui/ux\` → Company, Person/Profile, Place,
Time(line), Socials, etc — *things*, \`ui + ux + OOP\`. Then two rules:

> Use existing ui, where possible. **Suggest new ui, always?** ↳ triage: collect lots of
> suggestions, evaluate the cost vs benefit.

> \`ux/Suggest\` a Suggestion — AI powered data/idea structure ui/ux.

And under a big **LIST UI/UX** heading: *AI Screenshotting*, then
\`ui/ux/css/layout… ⇒ ux?\` — *layout: best responsive css* — and the numbered strip of
frames the demo below rebuilds.`);

		md(`## What it points at

- [ext/Research](/framework/ext/Research/) — the append-only research log this page is
  sketching: entries carry a source, a claim and a credence, and scouts, a skeptic and a
  verdict run in rounds over them. It is \`.jsonl\`, exactly as the note lands on.
- [ext/JSONL](/framework/ext/JSONL/) — the append-only line format itself, and the tail
  the note asks for: a page reads new lines over a socket instead of reloading.
- [Vision browse](/framework/ext/DesignTool/vision/) — "AI Screenshotting", built: a
  runner shoots a page and a model reads the shot back. It costs about \$0.07 a shot and
  it is a pointer, not a fixer — that is the measured result.
- [core/Layout](/framework/core/Layout/) — the layout tree the numbered strip is a list
  of, and where "fill width, auto height" is a real word rather than a sketch.
- [/framework/ai/](/framework/ai/) — \`log.jsonl\` and \`ai → mcp\`, shipped: one dashboard
  per working day, fed by append-only task logs, with the CLI and the filesystem as its
  two writers.`);

		md(`## The list, at the sizes it draws

The note ranks the layouts to build and draws the first two. Both are here at the
proportions on the page: one column that fills the width and hugs its content, then two
columns. \`#3\` is numbered on the page and left empty — the third frame shows what the
pencil drew, not a decision.`);

		layout_strip();

		md(`The \`mdjj\` format on the left page is a **decision**, not an interface, and the
site already made it: append-only \`.jsonl\`, separate from the markdown. So nothing is
built for the left page.`);
	}
});
