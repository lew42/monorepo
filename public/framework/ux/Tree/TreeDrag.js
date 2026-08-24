import Tree from "./Tree.js";
import Sortable from "../../ext/Draggable/Sortable.js";
import { span } from "../../core/View/View.js";

/**
 * class TreeDrag extends Tree — drag-reorder. The design parked in doc/decisions.md,
 * built 2026-08-21.
 *
 *   const t = new TreeDrag({ nodes, onMoved(node, into, at){ … } });
 *
 * Grab a row's grip, drop it onto a branch to append inside, or between two rows to
 * reorder. Escape (or releasing off the tree) cancels and commits nothing. `moved()`
 * is the one wire — TreeDrag never touches `nodes` itself, because the caller owns
 * the data (`Tree.draw()`'s doc/decisions.md, kept): it only reports where a row
 * landed.
 *
 * **Reuse call, with evidence (doc/decisions.md).** Extends `ext/Draggable`'s
 * `Sortable`, not hand-rolled: pointer capture, the ghost, the placeholder, Escape
 * and `.drag-source`'s inline-display fix are the previously-debugged half, kept
 * whole. What's overridden: `Sortable.release()` commits `item.move()` against a
 * `core/Item` tree TreeDrag doesn't have (nodes are plain, parent-less data), and
 * `before()`/`row()` assume a container's DIRECT children ARE the registered
 * draggables — true for `ext/Panel` and `ext/editor`, false here (a row sits inside
 * an `<li>` beside its own children `<ul>`, one layer removed). `locate()` is
 * hand-rolled from the target row's own geometry instead of an `$items` container:
 * the middle band of a branch row is "into", the rest is "before/after" that row.
 */
export default class TreeDrag extends Tree {

	moved(node, into, at){ this.onMoved?.(node, into, at); }
}

TreeDrag.prototype.classes = "ui-tree ux-tree-drag";

/* The one part replaced, same shape as TreeKeys: pointer handling hangs off the row,
 * everything else — Tree.Item, selection, draw() — inherited untouched. */
TreeDrag.Row = class TreeDragRow extends Tree.Row {

	render(){
		super.render();
		this.grip();
		this.drag = new (this.tree.constructor.Drag)({ view: this, handle: this.$grip, tree: this.tree, node: this.node });
	}

	/* ⚠ A dedicated grip, not the whole row: `Draggable.grab()` calls `start()` on
	 * EVERY pointerdown with no movement threshold, so a whole-row handle hides and
	 * ghosts the row on a plain click-to-select. `ext/Panel`'s own handle is "the grip
	 * alone, never the bar" for the same reason — reused, not re-discovered. */
	grip(){ return this.$grip = span.c("ux-tree-drag-grip", "⠿").attr("aria-label", "drag to reorder"); }
};

/* The Sortable subclass — a static, reached through `this.tree.constructor.Drag`, so
 * a further subclass can replace the drop logic the way Tree.Row/Tree.Item do. */
TreeDrag.Drag = class TreeDragMove extends Sortable {

	/* Never a folder into its own descendant. `Item.contains()` doesn't exist here —
	 * nodes are plain data with no parent pointer — so this walks DOWN from the
	 * dragged node instead of up from the target. */
	drop_check(target){
		return target !== this && !contains(this.node, target.node);
	}

	start(){
		super.start();
		this.placeholder.style.height = "";           // a LINE, not a row-height spacer
		this.placeholder.classList.add("ux-tree-drag-line");
	}

	move(dx, dy, e){
		this.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
		this.show(this.locate(e));
	}

	/* `under()` still does the hit-test plus the self/descendant filter; what changes
	 * is what a hit MEANS. Reading the target row's own rect instead of an `$items`
	 * container is the file's whole reuse-vs-roll call — the class doc comment has
	 * why `before()`/`row()` don't fit this shape. */
	locate(e){
		const target = this.under(e, box => this.drop_check(box));
		if (!target) return null;

		const box = target.view.el.getBoundingClientRect();
		const frac = (e.clientY - box.top) / box.height;
		const branch = target.node.children !== undefined;   // an empty folder is still a folder

		if (branch && frac > 0.25 && frac < 0.75) return { kind: "into", target };
		return { kind: "between", target, low: frac < 0.5 };
	}

	/* The insertion cue. "into" highlights the target row; "between" moves the
	 * placeholder LINE to whichever side of it the cursor is on — DOM position only,
	 * never touches `nodes`. */
	show(where){
		if (this.highlighted){ this.highlighted.rc("ux-tree-drag-target"); this.highlighted = null; }

		if (!where) return this.placeholder.remove();

		if (where.kind === "into"){
			this.placeholder.remove();
			this.highlighted = where.target.view.ac("ux-tree-drag-target");
			return;
		}

		const li = where.target.view.el.closest("li");
		where.low ? li.before(this.placeholder) : li.after(this.placeholder);
	}

	// Sortable commits through `item.move()`; TreeDrag has no Item, so this replaces
	// the whole method rather than overriding a piece of it.
	release(e){
		const where = this.locate(e);
		this.end();
		if (where) this.commit(where);
	}

	/* The writer seam's other half: turn a resolved drop into `moved(node, into, at)`.
	 * `at` is the index the node lands at AFTER removal from wherever it was, so the
	 * caller's splice-out-then-splice-in never has to adjust for its own shift. */
	commit(where){
		if (where.kind === "into"){
			const into = where.target.node;
			const at = (into.children ?? []).filter(n => n !== this.node).length;
			return this.tree.moved(this.node, into, at);
		}

		const { array, parent } = locate_parent(this.tree.nodes, where.target.node);

		let i = array.indexOf(where.target.node) + (where.low ? 0 : 1);
		while (array[i] === this.node) i++;      // the dragged node's own old slot doesn't count
		const before = array[i] ?? null;

		const filtered = array.filter(n => n !== this.node);
		this.tree.moved(this.node, parent, before ? filtered.indexOf(before) : filtered.length);
	}

	end(){
		if (this.highlighted){ this.highlighted.rc("ux-tree-drag-target"); this.highlighted = null; }
		super.end();
	}
};

/* Strict-descendant test, node-data version of `Item.contains()`. */
const contains = (ancestor, node) => ancestor.children?.some(c => c === node || contains(c, node)) ?? false;

/* The array holding `node` — the root list, or some ancestor's `children` — and that
 * ancestor (null at the root). Nodes carry no parent pointer, so this is the walk
 * that finds one; read at commit time, never stored, because `draw()` can throw the
 * whole shape away and rebuild it. */
const locate_parent = (nodes, node, parent = null) => {
	if (nodes.includes(node)) return { array: nodes, parent };

	for (const n of nodes){
		const found = n.children && locate_parent(n.children, node, n);
		if (found) return found;
	}
	return null;
};

export { TreeDrag };
