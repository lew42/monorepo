import Item from "/framework/core/Item/Item.js";

/* Every item carries box-level keys (`bg`, `gap`, `padding`, `width`/`height`) — held on the
 * ITEM, not on `FLEX`/`GRID`, because the owner's ask keeps them outside flex/grid
 * (pg-sidebar brief §1): a plain Box can pre-set a gap that survives `convert()` into a Flex,
 * same as `Panel.shared` carries a look across a structural change. `Flex`/`Grid` each add
 * their own container keys; every item also carries CHILD keys ("how it sits in its parent",
 * read only when the parent is that kind — properties.js gates it, not this file: `grow`
 * under a non-flex parent is a harmless no-op, same as before). Every value is the CSS value
 * verbatim; "" or absent means "don't write the declaration" — except `colSpan`/`rowSpan`
 * (a bare number, `span` added on the way to CSS), `width`/`height` (`size_decls`) and
 * `padding`/`gap` (`pad_decl`/`gap_decl`), which are their own small translators.
 *
 * ⚠ `gap` is NOT in `BOX` (pg-model): block layout draws no gap, so a plain Box writes no
 * gap declaration at all. Only where it lives — the data — decides what survives a
 * `convert()`, and the data is untouched. */
const BOX   = [["bg", "background-color"]];
const CHILD = [["grow", "flex-grow"], ["shrink", "flex-shrink"], ["basis", "flex-basis"], ["self", "align-self"], ["order", "order"]];
const GRID_CHILD = [
	["colSpan", null, v => `grid-column: span ${v}`],
	["rowSpan", null, v => `grid-row: span ${v}`],
	["area", "grid-area"],
];
const FLEX  = [["direction", "flex-direction"], ["wrap", "flex-wrap"], ["justify", "justify-content"], ["align", "align-items"]];
const GRID  = [["columns", "grid-template-columns"], ["rows", "grid-template-rows"], ["areas", "grid-template-areas"], ["flow", "grid-auto-flow"]];

const decls = (data, ...maps) => maps.flat().filter(([key]) => data[key])
	.map(([key, prop, fmt]) => fmt ? fmt(data[key]) : `${prop}: ${data[key]}`);

/* Calibration, not data (pg-sidebar brief §4): `data.padding`/`data.gap` stay whatever the
 * field holds ("" / "0" / a length) — `styles()` alone renders a FLOOR under each, so
 * parent-child separation and the shape of a flex row never vanish at 0, and the one-click
 * "1em" button (properties.js) writes a real value the same as typing one would.
 *
 * pg-model: the floor is no longer a constant in this file but a custom property the canvas
 * sets — `.pg-pad-floor` / `.pg-gap-floor` on `.pg-canvas-body` (playground.css), flipped by
 * toolbar.js's two toggles. `max()` is what makes that a floor and not an override, and
 * putting the whole thing INSIDE the inline style is what makes a toggle free: one class on
 * one stable node restyles every box at once, no repaint, no data touched, and off is a real
 * 0 for the first time.
 *
 * ⚠ `max()` takes lengths: a bare `0` is a <number> and would invalidate the whole
 * declaration, so it is normalised to `0px`. A SHORTHAND ("1em 2em") cannot go inside one at
 * all — it is written verbatim instead, and needs no floor: it is already non-zero. */
const floored = (value, name) => {
	const v = (value ?? "").trim();
	if (/\s/.test(v)) return v;                                            // a shorthand — the author's own words
	return `max(${v && v !== "0" ? v : "0px"}, var(--pg-${name}-floor, 0px))`;
};
const pad_decl = data => `padding: ${floored(data.padding, "pad")}`;
const gap_decl = data => `gap: ${floored(data.gap, "gap")}`;

/* hug | fill | a length, per axis, read against the PARENT's own context — `ext/Panel`'s
 * size.css is the prior art (read-only): MAIN axis carries the flex shorthand, CROSS axis
 * `align-self`, and grid its two `*-self`s since it has no shorthand to lean on.
 *
 * pg-model AUDITED every cell of that against what the CSS ALREADY does (the truth table is
 * in doc/decisions.md, each row measured) and deleted the declarations that only restated a
 * default — the owner's own ask: "generally revert back to default; if we start adding
 * non-defaults, we might get into a strange state". SIX of the eighteen cells now write
 * nothing at all (a seventh when the container's own `align` already said so), and the three
 * that used to write two declarations write one:
 *   - flex MAIN hug — `flex: 0 1 auto`, the default, already measures the content;
 *   - flex CROSS fill — a flex item already stretches, unless its container said otherwise;
 *   - grid fill, either axis — a grid item already stretches its cell;
 *   - block width fill — `width: auto` IS the full line (border-box, no margins);
 *   - block height hug — `height: auto` IS the content;
 *   - a length on any CROSS axis — `align-self` was redundant beside it, because `stretch`
 *     only ever applies to an AUTO cross size.
 *
 * ⚠ Which is why "write nothing" is argued per case and not assumed: the flex CROSS default
 * is the CONTAINER's `align-items`, so `stretches` below reads it back — with `align: center`
 * a hug needs no word (already content-sized) and a fill needs one.
 *
 * Two limits are CSS, not bugs, and both stay (proven again in doc/decisions.md): a `fill`
 * with no free space to grow into renders unchanged, and `height: 100%` against a parent of
 * indeterminate height computes to `auto` — it fills when there is a height to fill, hugs
 * when there is not, which is the honest answer rather than the no-op this cell used to be. */
function size_decls(data, parent){
	const inFlex = parent instanceof Flex;
	const inGrid = parent instanceof Grid;
	const row = !inFlex || (parent.get("direction") || "row") === "row";
	const stretches = (parent?.get("align") || "stretch") === "stretch";   // the CROSS-axis default, the container's call
	const out = [];

	["width", "height"].forEach(axis => {
		const v = data[axis];
		if (!v) return;
		const len = v !== "hug" && v !== "fill" ? v : null;
		const main = inFlex && (axis === "width") === row;

		// A length is just the size property — everywhere except the flex MAIN axis, where
		// the shorthand is what "fixed" means and what the drag handles commit (canvas.js).
		if (len) out.push(main ? `flex: 0 0 ${len}` : `${axis}: ${len}`);
		else if (main){ if (v === "fill") out.push("flex: 1 1 0"); }
		// CROSS: the default IS the container's `align-items` — say a word only when it disagrees.
		else if (inFlex && v === "fill"){ if (!stretches) out.push("align-self: stretch"); }
		else if (inFlex){ if (stretches) out.push("align-self: flex-start"); }
		else if (inGrid){ if (v === "hug") out.push(`${axis === "width" ? "justify-self" : "align-self"}: start`); }
		else if (axis === "width"){ if (v === "hug") out.push("width: fit-content"); }
		else if (v === "fill") out.push("height: 100%");
	});

	return out;
}

// What every item wears, whichever subclass — pad first (always present, it carries the
// floor), then bg, then the two size axes read against `this.parent` (never `this` — a node
// never sizes itself, its slot does). Composed the same way for `Box`/`Flex`/`Grid` alike.
const common = item => [pad_decl(item.data), ...decls(item.data, BOX, CHILD, GRID_CHILD), ...size_decls(item.data, item.parent)];

/* pg-edges item 3 — `order`, `shrink` and `basis` lost their FIELDS, not their keys. `grow`
 * plus the width word covers every layout in the ux proposal's own click table, and the
 * sidebar was measuring taller than a 900px window with `align`'s buttons off the bottom.
 * The three keys stay in `CHILD` above and are still rendered, so a document that already
 * holds one still draws exactly as it did — and the Flex resize commit still writes
 * `basis: 0` (canvas.js) with nothing to change. */
const CHILD_FLEX_FIELDS = [
	["grow", "num"],
	["self", "seg", ["", "flex-start", "center", "flex-end", "stretch"]],
];
const CHILD_GRID_FIELDS = [["colSpan", "num"], ["rowSpan", "num"], ["area", "text"]];

const FLEX_FIELDS = [
	["direction", "seg", ["row", "column"]], ["wrap", "seg", ["nowrap", "wrap"]],
	["justify", "seg", ["flex-start", "center", "space-between", "space-around"]],
	["align", "seg", ["stretch", "flex-start", "center", "flex-end"]],
];
const GRID_FIELDS = [
	["columns", "text"], ["rows", "text"], ["areas", "text"],
	["flow", "seg", ["row", "column", "row dense", "column dense"]],
];

export class Box extends Item {
	// The one thing every canvas node reads — inline, never a framework class (design §4).
	styles(){ return common(this).join("; "); }
}
Box.fields = [];        // no container config — a Box has no direction/columns of its own
Item.register(Box);

export class Flex extends Item {
	styles(){ return ["display: flex", gap_decl(this.data), ...decls(this.data, FLEX), ...common(this)].join("; "); }
}
Flex.fields = FLEX_FIELDS;             // the flex section — properties.js shows it only for a Flex
Flex.childFields = CHILD_FLEX_FIELDS;  // "in parent" — shown only when THIS is the parent
Item.register(Flex);

export class Grid extends Item {
	styles(){ return ["display: grid", gap_decl(this.data), ...decls(this.data, GRID), ...common(this)].join("; "); }
}
Grid.fields = GRID_FIELDS;
Grid.childFields = CHILD_GRID_FIELDS;
Item.register(Grid);

export default { Box, Flex, Grid };
