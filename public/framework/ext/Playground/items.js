import Item from "/framework/core/Item/Item.js";

/* Two field groups apply to every item (design.md §3): `box` — its own size — and
 * `child` — how it sits in its parent, if any (flex keys always; `colSpan`/`rowSpan`/`area`
 * only do anything under a `Grid` parent, but every item carries the fields — the parent
 * decides what reads them, same as `grow` under a non-flex parent is a harmless no-op).
 * `Flex`/`Grid` each add their own. Every value is the CSS value verbatim, as a string;
 * "" or absent means "don't write the declaration" — except `colSpan`/`rowSpan`, which are
 * a bare number ("2") and get the `span` keyword added on the way to CSS. */
const BOX   = [["width", "width"], ["height", "height"], ["padding", "padding"]];
const CHILD = [["grow", "flex-grow"], ["shrink", "flex-shrink"], ["basis", "flex-basis"], ["self", "align-self"], ["order", "order"]];
const GRID_CHILD = [
	["colSpan", null, v => `grid-column: span ${v}`],
	["rowSpan", null, v => `grid-row: span ${v}`],
	["area", "grid-area"],
];
const FLEX  = [["direction", "flex-direction"], ["wrap", "flex-wrap"], ["justify", "justify-content"], ["align", "align-items"], ["gap", "gap"]];
const GRID  = [["columns", "grid-template-columns"], ["rows", "grid-template-rows"], ["areas", "grid-template-areas"], ["flow", "grid-auto-flow"], ["gap", "gap"]];

const decls = (data, ...maps) => maps.flat().filter(([key]) => data[key])
	.map(([key, prop, fmt]) => fmt ? fmt(data[key]) : `${prop}: ${data[key]}`);

const CHILD_FIELDS = [
	["grow", "num"], ["shrink", "num"], ["basis", "text"],
	["self", "seg", ["", "flex-start", "center", "flex-end", "stretch"]], ["order", "num"],
	["colSpan", "num"], ["rowSpan", "num"], ["area", "text"],
];
const BOX_FIELDS = [["label", "text"], ["width", "text"], ["height", "text"], ["padding", "text"]];

export class Box extends Item {
	// The one thing every canvas node reads — inline, never a framework class (design §4).
	styles(){ return decls(this.data, BOX, CHILD, GRID_CHILD).join("; "); }
}
Box.fields = [...BOX_FIELDS, ...CHILD_FIELDS];
Item.register(Box);

export class Flex extends Item {
	styles(){ return ["display: flex", ...decls(this.data, FLEX, BOX, CHILD, GRID_CHILD)].join("; "); }
}
Flex.fields = [
	["label", "text"],
	["direction", "seg", ["row", "column"]], ["wrap", "seg", ["nowrap", "wrap"]],
	["justify", "seg", ["flex-start", "center", "space-between", "space-around"]],
	["align", "seg", ["stretch", "flex-start", "center", "flex-end"]],
	["gap", "text"], ...BOX_FIELDS.slice(1), ...CHILD_FIELDS,
];
Item.register(Flex);

export class Grid extends Item {
	styles(){ return ["display: grid", ...decls(this.data, GRID, BOX, CHILD, GRID_CHILD)].join("; "); }
}
Grid.fields = [
	["label", "text"],
	["columns", "text"], ["rows", "text"], ["areas", "text"],
	["flow", "seg", ["row", "column", "row dense", "column dense"]],
	["gap", "text"], ...BOX_FIELDS.slice(1), ...CHILD_FIELDS,
];
Item.register(Grid);

export default { Box, Flex, Grid };
