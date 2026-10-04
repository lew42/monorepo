import { Doc, md, code, demo, div, span, icon } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import List from "/framework/core/List/List.js";
import Draggable from "./Draggable.js";
import Sortable from "./Sortable.js";

/* ⚠ The descendant guard. Without it, dropping a container into its own child
   makes a cycle, and the first ten minutes of nesting will find it. */
class Card extends Sortable {
	drop_check(target){ return target !== this && !this.item.contains(target.item); }
}

// A bar you grab, and the box this node's own items land in. `grip: false` makes a
// column: registered as a drop site, with nothing to pick it up by.
function node(item, grip = true){
	let $bar, $items;

	const $node = div.c("flex v", () => {
		$bar = div.c("flex v-center gap pad", () => {
			icon("drag_indicator");
			span(item.get("label"));
		}).style("--pad", "0.3em 0.5em");

		$items = div.c("flex v gap pad", () => { item.items.forEach(kid => node(kid)); })
			.style({ "--gap": "0.4em", "--pad": "0.4em" });
	}).ac(grip ? "surface" : "wash flex-1");

	new Card({ view: $node, handle: grip && $bar, $items, item });
	return $node;
}

function board(root){
	const $board = div.c("flex gap").style("--gap", "1em");
	const draw = () => $board.empty(() => { root.items.forEach(column => node(column, false)); });

	// One listener, at the root: Item events bubble, so a move anywhere lands here.
	// `move`/`order` are new names (core/List/List.js) — a drag used to show up
	// as a `remove` plus an `add`; now it is its own single event, so it is listed here too.
	["add", "remove", "move", "order"].forEach(event => root.on(event, draw));

	draw();
	return $board;
}

// Item itself holds no children (core/Item/readme.md) — a node in this demo gives
// ITSELF an `items` list, same as Panel and the editor's blocks do.
function node_item(data){
	const it = new Item({ data });
	it.items = new List({ owner: it, name: "items" });
	return it;
}

const card = label => node_item({ label });

function tree(){
	const root = node_item({ label: "Board" });
	const todo = node_item({ label: "Todo" });
	const done = node_item({ label: "Done" });

	[card("Hold pointer capture"), card("Filter the dragged node"), node_item({ label: "Box" })]
		.forEach(kid => todo.items.add(kid));
	done.items.add(card("Restate the layer order"));
	[todo, done].forEach(kid => root.items.add(kid));

	return root;
}

// The four stubs Draggable leaves blank (start/move/drop/restore), filled in for a
// single drop target — no ghost, no placeholder, no list. What Sortable automates
// for a whole collection, done here by hand for one chip and one bin.
function bare(){
	let $chip, $bin, drops = 0;

	class Chip extends Draggable {
		move(dx, dy){ this.view.style("transform", `translate(${dx}px, ${dy}px)`); }
		drop(){ $bin.text(`Dropped ${++drops}x`); this.restore(); }
		restore(){ this.view.style("transform", ""); }
	}

	const $wrap = div.c("flex gap pad v-center", () => {
		$chip = div.c("surface pad").text("Drag me").style("cursor", "grab");
		$bin  = div.c("wash pad flex-1 flex h-center v-center").text("Bin").style("min-height", "4em");
	}).style("--gap", "1em");

	new Draggable({ view: $bin, handle: false });
	new Chip({ view: $chip });

	return $wrap;
}

export default new Doc({
	meta: import.meta,
	title: "Draggable",
	description: "Grab a node and drop it somewhere else — reorder, cross-list and nest on one code path.",
	icon: "drag_indicator",

	subject: Draggable,
	properties: "view handle dragging registry",
	methods: "assign initialize grab drag release cancel end under drop_check start move drop restore destroy",
	notes: "sortable verdicts decisions",
	files: "Draggable.js Sortable.js draggable.css page.js",

	overview: [{ title: "Draggable alone", icon: "pan_tool", content(){

		demo(bare, "No `Sortable`, no ghost, no placeholder — just the four stubs `Draggable` leaves blank, filled in by hand. Drag the chip onto the bin; let go anywhere else and it springs back.");

		md("The main card is what filling in those same four stubs looks like for a whole *list* — `Sortable`. This one is the base class on its own, nothing borrowed from the subclass.");

	} }],

	content(){

		const root = tree();

		demo(() => board(root),
			"Drag by the grip. Reorder inside a column, cross the gap, or drop into **Box** to nest. Press **Escape** mid-drag and nothing commits.");

		md(`\`root.items instanceof List\` → **${root.items instanceof List}**. The rows are real \`Item\`s, and \`Draggable\`/\`Sortable\` import neither class — the whole coupling is a drop target's \`list.move(kid, {before, from})\` (its own \`items\`, [core/List/List.js](/framework/core/List/)) plus your own \`drop_check\`.`);

		md("**One `Sortable` per node.** A node with `$items` is also a drop site; one with `handle: false` is *only* a drop site. Reorder, reparent and nest are not three features — they are one list `move()` with a different target list.");

		code.fn(node);

		code.js(`drop_check(target){ return target !== this && !this.item.contains(target.item); }`);

		md("That guard is the whole of cycle prevention, and it is yours to write — `Sortable` routes every candidate container through `drop_check`, so one override governs both the placeholder you see and the move that commits.");

		md("**Nothing real moves during a drag.** A ghost follows the cursor and a placeholder marks the landing slot; the live node just hides. That is why `Escape` and `pointercancel` cost one method: there is nothing to put back.");

		md("**The empty `Box` has a `min-height`** from `draggable.css`. A container with no height has no surface to drop onto — the single most common *\"drag doesn't work\"* report.");

		md("Next: [Item](/framework/core/Item/) — the tree this page is dragging.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
