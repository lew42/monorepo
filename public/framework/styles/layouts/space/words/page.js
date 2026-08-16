import { Page, div, p, code, md, h2 } from "/app.js";
import { render } from "../spec.js";
import { FAMILIES, SILENT, DECLARATIONS, PARTS, spec } from "./words.js";

/* Every word the format accepts, with its picture — and the picture is a spec, so
 * this page is written in the language it documents. No new machinery: a card is a
 * name, one `render()` of the string, and a line. */

// `space-words` and not `auto`: the track needs a ceiling, or a four-card family
// stretches across the whole wall. space.css carries the one rule and why.
const wall = fill => div.c("grid gap space-words", fill).style("--gap", "1em");

/* ⚠ `data-layout-ignore` goes on the MINIATURE, never on the wall around it. On the
 *   wall it hides the cards' real text too, and ext/LayoutTool then reads the whole
 *   wall as one 625px gap in the page's rhythm — a `high` finding, from the marker.
 *   The seed tiles on the Overview mark the wall because a tile is *only* a
 *   miniature; a card here is a name and a line as well.
 * ⚠ A height only where the spec asks for one: `fill` divides a height it is given
 *   and has nothing to show without one. Everything else is its own content tall. */
const shot = text => div.c("space-word-shot", () => div.c("zoom-50", () =>
	render(text).style(text.includes("fill") ? { height: "16em" } : {})))
	.attr("data-layout-ignore", "");

// `p`, not `span` — the prose factories are the two that read a backtick, and every
// note here names a class.
const card = (name, note, text) => div.c("space-word surface pad flex v gap", () => {
	code(name);
	shot(text);
	p.c("muted", note);
}).style({ "--gap": "0.5em", "--pad": "0.8em" }).attr("title", text);

export default new Page({
	meta: import.meta,
	title: "Words",
	description: "Every word the layout format accepts, and what each one looks like.",
	icon: "abc",

	content(){

		md("**The whole vocabulary, on one page.** A spec line is `<class tokens> > <part> [count]`, and everything below is one of those two halves: a **class** the browser already knows from `framework.css`, a **declaration** (any token holding a `:`), or a **part** of the shared `site` object. Nothing else exists.");

		md("Each picture is the spec named in its `title` — hover a card to read it. The empty washed boxes are the arrangement and nothing else, which is exactly what a layout word says. [Syntax](../docs/syntax/) is the grammar in one page; [Space](../) is where you type one.");

		FAMILIES.forEach(family => {
			h2(family.title);
			md(family.note);
			wall(() => family.words.forEach(word => card(word.word, word.note, spec(word)))).ac("bleed");
		});

		h2("Four words that are not classes");

		md("`scroll`, `stick`, `fluid` and `tone` expand in `spec.js` rather than in `framework.css` — they are this format's own vocabulary until that call is made. The first three fail **silently**, which is why they get their declarations rather than a picture: there is nothing to see, and that is the problem with them. `tone` is the opposite — it is the only one of the four whose whole job is to be seen.");

		md(table(["word", "expands to", "and the trap in it"],
			SILENT.map(([word, css, trap]) => [`\`${word}\``, `\`${css}\``, trap])));

		h2("Declarations");

		md("A token holding a `:` is a declaration rather than a class, set with `.style()` verbatim — so per-layout state stays inline exactly as the hand-written pages keep it. `_` reads as a space, which is the whole of the escaping.");

		md(table(["token", "what it sets"], DECLARATIONS.map(([token, note]) => [`\`${token}\``, note])));

		h2("The parts");

		md("The leaves. `> sections 5` calls `site.sections(5)` — one fictional site's content, the same object every layout in this rail draws, so the only thing that differs between two of these pages is where the boxes go.");

		wall(() => PARTS.forEach(([name, note]) => card("> " + name, note, "full pad\n  > " + name))).ac("bleed");

		md("Next: [Syntax](../docs/syntax/) — the grammar itself, and the four things that will bite you.");
	},
});

// One table shape, six callers on this page.
const table = (head, rows) => `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n`
	+ rows.map(row => `| ${row.join(" | ")} |`).join("\n");
