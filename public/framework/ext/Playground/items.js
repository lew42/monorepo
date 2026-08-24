import Item from "/framework/core/Item/Item.js";

/* Every item carries box-level keys (`bg`, `gap`, `padding`, `width`/`height`) — `gap`
 * and `padding` sit here rather than in `FLEX`/`GRID` because the owner's ask keeps them
 * OUTSIDE flex/grid (pg-sidebar brief §1): a plain Box can pre-set a gap that survives
 * `convert()` into a Flex, same as `Panel.shared` carries a look across a structural
 * change. `Flex`/`Grid` each add their own container keys; every item also carries CHILD
 * keys ("how it sits in its parent", read only when the parent is that kind — properties.js
 * gates it, not this file: `grow` under a non-flex parent is a harmless no-op, same as
 * before). Every value is the CSS value verbatim; "" or absent means "don't write the
 * declaration" — except `colSpan`/`rowSpan` (a bare number, `span` added on the way to CSS)
 * and `width`/`height` (see `size_decls`) and `padding` (see `pad_decl`), which are their
 * own small translators, not a straight `decls()` entry. */
const BOX   = [["bg", "background-color"], ["gap", "gap"]];
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

// Calibration, not data (pg-sidebar brief §4): `data.padding` stays whatever the field
// holds ("" / "0" / a length) — `styles()` alone renders a 0.25em floor so parent-child
// separation never disappears, and the one-click "1em" button (properties.js) writes a
// real value the same as typing one would.
const PAD_MIN = "0.25em";
const pad_decl = data => `padding: ${data.padding && data.padding !== "0" ? data.padding : PAD_MIN}`;

/* hug | fill | a length, per axis, read against the PARENT's own context — `ext/Panel`'s
 * size.css is the prior art (read-only): MAIN axis carries the flex shorthand (grow/shrink
 * on `fill`, a fixed basis otherwise), CROSS axis carries `align-self`. Outside flex/grid,
 * width can fill (`width: 100%`) or hug (`fit-content`); height-fill has no definite parent
 * height to resolve against, so it degrades to hug — logged here, not fought (Panel hit the
 * same wall, size.css's own opening comment). Grid gets the same three states via
 * `justify-self`/`align-self` since it has no flex shorthand to lean on. */
function size_decls(data, parent){
	const inFlex = parent instanceof Flex;
	const inGrid = parent instanceof Grid;
	const row = !inFlex || (parent.get("direction") || "row") === "row";
	const out = [];

	["width", "height"].forEach(axis => {
		const v = data[axis];
		if (!v) return;
		const len = v !== "hug" && v !== "fill" ? v : null;

		if (inFlex && (axis === "width") === row){          // MAIN axis
			out.push(v === "fill" ? "flex: 1 1 0" : len ? `flex: 0 0 ${len}` : "flex: 0 0 auto");
		} else if (inFlex){                                    // CROSS axis
			out.push(v === "fill" ? "align-self: stretch" : len ? `${axis}: ${len}; align-self: flex-start` : "align-self: flex-start");
		} else if (inGrid){
			const self = axis === "width" ? "justify-self" : "align-self";
			out.push(v === "fill" ? `${self}: stretch` : len ? `${axis}: ${len}; ${self}: start` : `${self}: start`);
		} else if (axis === "width"){
			out.push(v === "fill" ? "width: 100%" : len ? `width: ${len}` : "width: fit-content");
		} else if (len){
			out.push(`height: ${len}`);
		}                                                       // else: fill-height outside flex/grid — hug wins, nothing to write
	});

	return out;
}

// What every item wears, whichever subclass — pad first (always present), then bg/gap,
// then the two size axes read against `this.parent` (never `this` — a node never sizes
// itself, its slot does). Composed the same way for `Box`/`Flex`/`Grid` alike, same as
// `BOX` was already shared into every `styles()` before this task.
const common = item => [pad_decl(item.data), ...decls(item.data, BOX, CHILD, GRID_CHILD), ...size_decls(item.data, item.parent)];

const CHILD_FLEX_FIELDS = [
	["grow", "num"], ["shrink", "num"], ["basis", "text"],
	["self", "seg", ["", "flex-start", "center", "flex-end", "stretch"]], ["order", "num"],
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
	styles(){ return ["display: flex", ...decls(this.data, FLEX), ...common(this)].join("; "); }
}
Flex.fields = FLEX_FIELDS;             // the flex section — properties.js shows it only for a Flex
Flex.childFields = CHILD_FLEX_FIELDS;  // "in parent" — shown only when THIS is the parent
Item.register(Flex);

export class Grid extends Item {
	styles(){ return ["display: grid", ...decls(this.data, GRID), ...common(this)].join("; "); }
}
Grid.fields = GRID_FIELDS;
Grid.childFields = CHILD_GRID_FIELDS;
Item.register(Grid);

export default { Box, Flex, Grid };
