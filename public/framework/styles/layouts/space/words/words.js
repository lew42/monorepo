/**
 * Every word the spec format accepts, and what each one looks like. The picture is
 * itself a spec, so this list is written in the language it documents — `spec()`
 * below is the whole of the translation.
 *
 * A word is `{ word, note }` plus one of three pictures: `classes` + `kids` (a box
 * with washed regions in it, the same picture `preview.js`'s `shape()` draws), a
 * literal `spec`, or nothing at all — the three that only exist as declarations get
 * a table instead, because a word that fails SILENTLY has nothing to show.
 *
 * ⚠ Long on purpose, and the one file here that earns its length: it is a
 *   vocabulary, and a vocabulary with an entry missing is worse than no list.
 */

/* `tone`, not `wash`: the same translucent ground the generator paints with, so a word's
   picture and a rolled layout read as one vocabulary — and the two nested examples stack
   instead of merging into one flat block. No `--tone`, so they take the word's own
   default hue and the wall stays a schematic rather than a rainbow. */
const KID = "tone pad --pad:1.4em";

/* classes + kids → spec text. `kids` is one class string per box ("" for a plain
   one), so the picture is built out of the same words you would type. */
export const spec = ({ classes, kids = [], spec: literal }) => literal
	?? ["full pad " + classes, ...kids.map(kid => "  " + KID + (kid && " " + kid))].join("\n");

const n = (count, kid = "") => Array(count).fill(kid);

export const FAMILIES = [{
	title: "The page",
	note: "How the page holds the layout. The first word of nearly every spec, and the one place a height comes from. Long form: [Fit](/framework/styles/layouts/fit/).",
	words: [
		{ word: "full", note: "The thing IS the page — the reading measure and the inset both go.",
			spec: "full\n  > sections 2" },
		{ word: "standard", note: "The default sheet: a centred reading column with breakout tracks either side.",
			spec: "standard\n  > sections 2" },
		{ word: "fill", note: "Reach the BOTTOM of the region. What a footer sits on, and what a `scroll` needs to have anything to divide.",
			spec: "full fill flex v\n  > topbar\n  flex-1 " + KID + "\n  > footer" },
		// one kid, not three: with no gap between them three washed boxes merge into one
		// grey blob and the inset — which is the whole word — stops being visible
		{ word: "pad", note: "An inset on the box, from `--pad`. A utility, so it goes on any box, not just the page.",
			classes: "", kids: n(1) },
	],
}, {
	title: "Flex — the container",
	note: "A row, and the eight one-word steps away from it. Each of these goes on the BOX; the two below go on its children. Long form: [Flex](/framework/styles/layouts/flex/).",
	words: [
		{ word: "flex", note: "A row. No gap, so the boxes touch — and they squeeze rather than wrap, at any width.", classes: "flex", kids: n(3) },
		{ word: "gap", note: "Air between them, from `--gap`. Two words, no stylesheet, and the start of every layout on this site.", classes: "flex gap", kids: n(3) },
		{ word: "v", note: "A column. Same gap, other axis.", classes: "flex v gap", kids: n(3) },
		// the kids need a real basis or they never wrap: empty boxes are two ems wide and
		// six of them fit any card, so the picture would show the word not happening
		{ word: "wrap", note: "Boxes drop to a second line instead of squeezing. Add it to anything that could ever be narrow.", classes: "flex gap wrap", kids: n(6, "basis --basis:10em") },
		{ word: "auto", note: "Every child asks for `--column` and takes an equal share — peers that stack themselves, with no breakpoint.", classes: "flex gap auto --column:6em", kids: n(3) },
		{ word: "three", note: "Three columns, then straight to one. Two columns is the width nobody designed for.", classes: "flex gap three --column:6em", kids: n(3) },
		{ word: "split", note: "`space-between`. A title left, a control right: this is every toolbar.", classes: "flex gap split", kids: n(2) },
		{ word: "v-center", note: "Unequal heights line up on their middles.", classes: "flex gap v-center", kids: ["--pad:3em_1.4em", "", ""] },
		{ word: "h-center", note: "The line itself is centred in the box.", classes: "flex gap h-center", kids: n(2) },
		{ word: "reverse", note: "Last child first. The order is a look, not a meaning — the DOM stays as written.", classes: "flex gap reverse", kids: ["--pad:1.4em_3em", "", ""] },
		{ word: "all-1", note: "Every child takes an equal share of the line, whatever it holds.", classes: "flex gap all-1", kids: n(3) },
	],
}, {
	title: "Flex — the child",
	note: "The asymmetric case: one track fixed, the rest fluid. This pair is the whole of Sidebar, and with a second `basis` it is App shell.",
	words: [
		{ word: "basis", note: "The FIXED track — `--basis`, falling back to `--column`. A rail is fixed because it is a rail.", classes: "flex gap", kids: ["basis --basis:6em", "flex-1"] },
		{ word: "flex-1", note: "The FLUID track: takes what is left. ⚠ `flex: 1 1 0%`, so in a wrapping row it shrinks to nothing rather than pushing a neighbour to the next line — that is what `fluid` is for.", classes: "flex gap", kids: ["basis --basis:5em", "flex-1", "flex-1"] },
	],
}, {
	title: "Grid",
	note: "When the tracks matter more than the order. One token, `--column`, and the count is a consequence. Long form: [Grid](/framework/styles/layouts/grid/).",
	words: [
		{ word: "grid", note: "One column with even spacing — the cheapest stack there is.", classes: "grid gap", kids: n(3) },
		{ word: "auto", note: "A wall that counts its own columns: you name a comfortable `--column`, the browser picks the number.", classes: "grid gap auto --column:5em", kids: n(8) },
		{ word: "three", note: "Exactly three columns, then straight to one. `clamp()` doing a breakpoint's job.", classes: "grid gap three --column:5em", kids: n(3) },
		{ word: "masonry", note: "CSS columns — a ragged wall, zero JS. ⚠ It flows TOP-TO-BOTTOM within each column, so nothing ranked or alphabetical belongs in one.", spec: "full pad masonry --column:9em\n  > notes 10" },
	],
}, {
	title: "Prose",
	note: "Two words about reading. Both go on a box inside the layout, never on the page — the page already chose its measure above.",
	words: [
		{ word: "flow", note: "Stacked prose: spacing belongs to the flow rather than to the things in it, and a heading's gap scales with the heading.",
			spec: "full pad flow\n  > sections 2" },
		{ word: "measure", note: "A centred reading column — `--measure`, defaulting to 34em. It CENTRES; `measure start` keeps the left edge.",
			spec: "full pad flow measure --measure:20em\n  > sections 2" },
	],
}];

/**
 * The four words that are not classes. They expand in `spec.js` rather than in
 * `framework.css`. The first three fail SILENTLY — which is why they get a table of
 * declarations rather than a picture. Promoting any of them is a proposal.
 */
export const SILENT = [
	["scroll", "min-height: 0; overflow-y: auto",
		"Belongs to the **row**, not to a panel inside it. A wrapping flex line is sized by its content, so a scroller one level too deep never engages and a `fill` page clips with no way down."],
	["stick", "position: sticky; top: 0; align-self: flex-start",
		"A **stretched** rail has nothing to stick to, and `align-items: stretch` is the flex default — so the `align-self` is not decoration, it is the whole of it."],
	["fluid", "flex: 1 1 24em; min-width: 0",
		"`flex-1` in a *wrapping* row shrinks to nothing instead of pushing its neighbours onto the next line — measured at 390, where the article rendered one letter wide. Every hand-written layout in this rail writes this by hand."],
	["tone", "background: oklch(0.72 0.15 var(--tone, 250) / 0.12)",
		"The one that is **visible**, and translucent on purpose: two boxes deep composites darker than one, so a random nesting can be read at a glance. It cannot be `wash` — this theme's ladder is opaque by decision, and ten nested levels of it look like one. `--tone` is a hue and it **inherits**, so a section declares one and its whole subtree deepens that colour instead of turning into a rainbow."],
];

/** A token holding a `:` is a declaration, not a class. `_` reads as a space. */
export const DECLARATIONS = [
	["--basis:15em", "the width of a `basis` track — this rail's rails run 11–18em"],
	["--column:9em", "the track a `grid auto` or `flex auto` wall asks for"],
	["--gap:0.5em", "the air `gap` puts between children"],
	["--pad:2em_1em", "the inset `pad` puts inside a box — `_` reads as a space"],
	["--measure:52em", "the reading column `measure` caps at"],
	["align-content:start", "any CSS property at all: a token with a `:` is set with `.style()`, verbatim"],
];

/** The parts — one fictional site's content, the same object every layout here draws. */
export const PARTS = [
	["topbar", "brand, nav, one primary button"],
	["toolbar", "five icon buttons and a label"],
	["brand", "the mark and the name, on their own"],
	["hero", "eyebrow, headline, blurb, two buttons"],
	["menu", "a nav rail — eight rows, first one lit"],
	["toc", "an on-this-page list, first entry lit"],
	["sections", "heading + paragraph, `count` of them"],
	["cards", "a `grid auto` wall of stat cards"],
	["rows", "a list: avatar, title, one muted line"],
	["tiles", "a `grid auto` wall of bare shapes"],
	["notes", "the one RAGGED part — what `masonry` is for"],
	["footer", "brand and three columns of links"],
];
