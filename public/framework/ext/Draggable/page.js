import { Page, md, code, demo, div, span, icon } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import List from "/framework/core/List/List.js";
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

		$items = div.c("flex v gap pad", () => { item.items.each(kid => node(kid)); })
			.style({ "--gap": "0.4em", "--pad": "0.4em" });
	}).ac(grip ? "surface" : "wash flex-1");

	new Card({ view: $node, handle: grip && $bar, $items, item });
	return $node;
}

function board(root){
	const $board = div.c("flex gap").style("--gap", "1em");
	const draw = () => $board.empty(() => { root.items.each(column => node(column, false)); });

	// One listener, at the root: Item events bubble, so a move anywhere lands here.
	root.on("add", draw);
	root.on("remove", draw);

	draw();
	return $board;
}

const card = label => new Item({ data: { label } });

function tree(){
	const root = new Item({ data: { label: "Board" } });
	const todo = new Item({ data: { label: "Todo" } });
	const done = new Item({ data: { label: "Done" } });

	todo.add(card("Hold pointer capture"), card("Filter the dragged node"), new Item({ data: { label: "Box" } }));
	done.add(card("Restate the layer order"));
	root.add(todo, done);
	return root;
}

export default new Page({
	meta: import.meta,
	title: "Draggable",
	description: "Grab a node and drop it somewhere else — reorder, cross-list and nest on one code path.",
	icon: "drag_indicator",

	content(){

		const root = tree();

		demo(() => board(root),
			"Drag by the grip. Reorder inside a column, cross the gap, or drop into **Box** to nest. Press **Escape** mid-drag and nothing commits.");

		md(`\`root.items instanceof List\` → **${root.items instanceof List}**. The rows are real \`Item\`s, and \`Draggable\`/\`Sortable\` import neither class — the whole coupling is \`item.move(parent, before)\` plus your own \`drop_check\`.`);

		md("**One `Sortable` per node.** A node with `$items` is also a drop site; one with `handle: false` is *only* a drop site. Reorder, reparent and nest are not three features — they are one `move()` with a different `parent`.");

		code.fn(node);

		code.js(`drop_check(target){ return target !== this && !this.item.contains(target.item); }`);

		md("That guard is the whole of cycle prevention, and it is yours to write — `Sortable` routes every candidate container through `drop_check`, so one override governs both the placeholder you see and the move that commits.");

		md("**Nothing real moves during a drag.** A ghost follows the cursor and a placeholder marks the landing slot; the live node just hides. That is why `Escape` and `pointercancel` cost one method: there is nothing to put back.");

		md("**The empty `Box` has a `min-height`** from `draggable.css`. A container with no height has no surface to drop onto — the single most common *\"drag doesn't work\"* report.");

		md("Next: [Item](/framework/core/Item/) — the tree this page is dragging.");

		md.details(import.meta, "readme.md", "Design record — capture, hit-testing, and what `locate()` returns");
	}
});
