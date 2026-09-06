import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose and the demo keep the measure — the demo IS a column row, and a column row shown
   at 52em reads the same as one shown at 100em, so `wide` would only make it emptier.
   Own layout: one bounded 5em-tall row of two panes. Two regions, no children.
   Preview: the photo thumb.

   Built: the note's own gestures — right click toggles hug/fill, left drag sets a manual
   width and snaps back to a word at either end. The words are the REAL ones core uses for
   a column, not invented ones, which is the whole point of building it here. */

const MEANING = {
	hug:  "hug — as wide as its own content, floored at 6em and capped at 24em. The cap is "
		+ "not a compromise: a hug column with a paragraph in it would measure the paragraph.",
	fill: "fill — everything left over, floored at 16em. For the one page in the row that "
		+ "has something to spend the room on.",
};

function width_words(){
	return div.c("surface pad flex v gap", () => {
		let $row, $left, $read, mode = "hug";

		const apply = () => {
			$left.style("flex", mode === "hug" ? "0 0 auto"
				: mode === "fill" ? "1 1 0" : `0 0 ${mode}px`);
			$read.text(MEANING[mode] ?? `${mode}px — a hand-set width. It has stopped being `
				+ `a word, so nothing can re-decide it when the row changes size.`);
		};

		// The drag: measure what `hug` would be right now, then snap to a word at either end.
		function start(e){
			e.preventDefault();
			const row = $row.el.getBoundingClientRect();

			$left.style("flex", "0 0 auto");
			const hug = $left.el.offsetWidth;
			apply();

			const move = ev => {
				const px = Math.round(ev.clientX - row.left);
				mode = px <= hug + 14 ? "hug"
					: px >= row.width - 48 ? "fill"
					: Math.max(48, px);
				apply();
			};
			const up = () => {
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
		}

		$row = div.c("flex").style({ minHeight: "5em", alignItems: "stretch", gap: "0.3em",
			border: "1px dashed var(--line)", borderRadius: "var(--radius)", padding: "0.3em" });

		$row.append(() => {
			$left = div.c("surface pad").style({ position: "relative", minWidth: "0",
				overflow: "hidden" });

			$left.append(() => {
				span().text("this column");
				div().style({ position: "absolute", insetBlock: "0", right: "0", width: "8px",
					cursor: "col-resize", background: "var(--prim)", opacity: "0.4" })
					.on("pointerdown", start);
			});

			div.c("muted pad").style({ flex: "1 1 0", minWidth: "0" })
				.text("the rest of the row");
		});

		// The note's own gesture: right click toggles the two words.
		$left.on("contextmenu", e => {
			e.preventDefault();
			mode = mode === "fill" ? "hug" : "fill";
			apply();
		});

		$read = span.c("muted").text(MEANING.hug);
		apply();
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Right click toggles hug and fill",
	icon: "compare_arrows",
	description: "Left+drag is manual, with smart snap.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page starts somewhere else entirely** — a building system, written down before
it got away:

> **Supportive Concrete Molding System:**
> ☑ Allows you to pour **N floors at once**
> ☑ Modular molds
> ☑ Aerocrete?

Then back to software, with a file and a hierarchy:

> \`PrimaryTopics.jsonl\` — **PRIMARY → SECONDARY → TOPIC?**

and the database constraint that shapes everything after it:

> Can't easily use many SQLite DBs?… can't easily **cross-join**
> ↳ **sharding = inevitable?**
>
> ① small? user db
> ✱ a big per-user db? ← Can't query across many dbs w/ iterating…

Beside them, **Layout Library…** drawn as a row of icons — an open spread, a phone frame, a
two-pane box labelled **Layout**, a grid — and three more frames at the foot: two panes,
three panes, and a box with a picture in it.

**The right page is the framework, judged.**

> **FRAMEWORK** ☑ **Make it simpler?**
>
> It's really about that **string → file → class** templating…

> Can you do git-type things w/ json?
> → branching w/o complete dups?
>   → plucking one deep property? via **changeset**?

> Compare repos… \`old.lew42.com\` ← just put all the old material here…
> ☑ live ☑ local ☑ multiple sub-sub-domains?

Then the tool this note is named for:

> **UI / Layout Engine**
> ☐ **Library** (browse) ☐ **Drag & Drop** ☐ **Click → Change** *(Color, Bg, Styles)*

drawn as a set of width gestures — a box with an arrow across it marked \`500px\`, a card
marked \`↦ fill\`, a bar with up and down arrows labelled **handle**, and a dropdown reading
\`376 px ▾\`. Beside them:

> **LogUI?** Just a div?
>
> \`<layouts>\` — ⚠ **Child > Parent** — [dismiss]

and, underlined at the bottom of the page, the two gestures:

> **Right click: toggle hug/fill**
> **Left + drag: manual w/ smart snap to obj, hug, fill**`);

		md(`## The gestures, with the real words

Both work on the column below. **Right-click it** and it flips between \`hug\` and \`fill\`.
**Drag its right edge** and it takes a pixel width — until you get near either end, where it
snaps back to a word.`);

		width_words();

		md(`The snap is the interesting half. A pixel number is a fact about *today's* screen: it
cannot re-decide itself when the row gets wider or a neighbour opens. A word can. That is why
this site sizes a column with one of **six words** — \`small\`, \`hug\`, the default, \`large\`,
\`fill\`, \`full\` — and why the note's \`376 px ▾\` dropdown is, in the end, a menu of words with
one escape hatch at the bottom rather than a number field.`);

		md(`## What it points at

- [\`doc/columns.md\`](/framework/core/Page/doc/columns/) — \`hug\` and \`fill\` are real,
  measured words there, with what each one holds at 1280 / 1920 / 3440 and the two caveats
  that bit: \`hug\` needs its ceiling, and \`fill\` yields to an open child.
- [core/Layout](/framework/core/Layout/) — the "Layout Library (browse)" the left page
  draws, shipped: thirty named arrangements you look through one column at a time, each
  proven at seven widths, rather than a folder of screenshots.
- [ext/Panel](/framework/ext/Panel/) — where hug and fill were first measured as gestures,
  including the 0px hug/fill seams.
- [The topic-model decision](/imagine/platform/decisions/topic-model/) — \`PRIMARY →
  SECONDARY → TOPIC\` answered without a registry: a topic is an ordinary page that says
  \`is: "topic"\`, and a subtopic is a page until it adds the same word.
- [The data decision](/imagine/platform/decisions/data/) — "sharding = inevitable?", ruled
  on. It is not: one place for the rows you must query across, and per-surface state keyed
  by url for everything else.`);
	}
});
