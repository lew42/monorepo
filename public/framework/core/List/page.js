import { Page, md, h2, code, div, span, button } from "/app.js";
import Item from "../Item/Item.js";

const build = () => Item.hydrate({
	type: "Item", id: "root", data: {},
	items: ["Alpha", "Beta", "Gamma"].map(label => ({ type: "Item", id: label, data: { label } })),
});

function outline(item, depth = 0){
	div.c("flex gap v-center", () => span(item.get("label")))
		.style("padding-inline-start", depth * 1.4 + "em");
	item.items.each(kid => outline(kid, depth + 1));
}

export default new Page({
	meta: import.meta,
	title: "List",
	description: "The ordered collection behind `item.items` — and why userland never touches it.",
	icon: "reorder",

	content(){

		code.js(`list.children  list.length  [Symbol.iterator]
list.append(child)  list.insert_before(child, ref = null)  list.remove(child)
list.each(fn)  list.find(fn)  list.index_of(child)
list.adopt(child)   //  child.parent = owner ?? this
list.toJSON()       //  a bare array`);

		md("That is the whole class — about fifty lines, zero imports. Every [Item](/framework/core/Item/) owns one as `item.items`, with itself as the `owner`.");

		h2("Userland mutates through Item verbs");

		code.js(`item.add(kid)               // ✓
item.move(parent, before)   // ✓
item.items.append(kid)      // ✗ — works, and skips nothing, but says the wrong thing`);

		md("**`List` is an implementation detail of `Item`, not a second API.** The rule is not a guard — `append()` adopts and notifies correctly either way — it is about there being *one* place a document changes. Reach past the Item and every future reader has two vocabularies to learn and two places to search.");

		md("`owner` is what makes that safe: `adopt()` sets `child.parent = this.owner ?? this`, so a child's parent is the **Item**, never the list. The backref stays one hop, and walking up for a saver or a root never has to step over a collection. It also deletes a whole class of subclass — the version of this that set `parent` to the list needed a no-op override on every list to undo it.");

		h2("A position, never an index");

		code.js(`list.insert_before(child, ref)   // ref null, or not in this list, appends`);

		md("`insert_before` takes the **node** to sit before, so `item.move()` above it is node-relative and index arithmetic off-by-ones cannot exist. `remove()` takes out the first occurrence only: duplicates in one list are normal, and each is its own node.");

		md("Mutating notifies the owner — `owner?.emit(\"add\" | \"remove\", child)` — and [Item's](/framework/core/Item/) `emit` bubbles to the root. So a document autosaves, or a canvas redraws, from **one listener at the top**. There is no `views[]` registry, no `changed()`, and no render scheduler.");

		h2("One listener, every change");

		const root = build();
		const $tree = div.c("flex v pad surface").style({ "--pad": "1em" });
		const draw = () => $tree.empty(() => { root.items.each(kid => outline(kid)); });

		root.on("add", draw).on("remove", draw).on("change", draw);
		draw();

		div.c("flex gap wrap", () => {
			button("Gamma to front").click(() => root.find("Gamma").move(root, root.find("Alpha")));
			button("Nest Gamma under Alpha").click(() => root.find("Gamma").move(root.find("Alpha")));
			button("Rename Beta").click(() => root.find("Beta").set("label", "Beta " + root.items.length));
			button("Reset").click(() => { root.items.children.slice().forEach(kid => root.remove(kid)); build().items.children.slice().forEach(kid => root.add(kid)); });
		}).style("--gap", "0.5em");

		md("Reorder and reparent are the **same call**. Nothing above subscribes to a list, or to a node — `draw` is bound once, to the root, and hears everything under it.");

		md("⚠ **No derived or reactive lists.** `filter_reactive`, `sort_reactive`, `group_by_reactive` were executed and cut: each subscribes to every item it sees and has no disposal path, so a long-lived document leaks a listener per row per view. Derive with `[...list].filter(…)` at the call site and redraw from the root event.");

		md("Back to [Item](/framework/core/Item/) — the node that owns one of these.");
	}
});
