import Tree from "./Tree.js";

/**
 * class TreeDrag extends Tree — **drag is `new Tree({ drag: true })` now** (2026-09-17).
 *
 * This file is what is left of the subclass: `new TreeDrag({ nodes, onMoved })` still
 * works, and still reports `moved(node, into, at)`. **New code takes `Tree` and the one
 * event**, which carries the same three facts under names you can read at the call site:
 *
 *     new Tree({ nodes, drag: true, onMove({ node, into, index }){ … } })
 *
 * The drop model changed with the merge, and it is the visible difference: a row is
 * three targets, not two — its top edge is *above*, its middle is *inside*, its bottom
 * edge is *below*. That is Make's model (`/imagine/paging/make/`), lifted into `Tree`
 * so there is one of it. [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/).
 */
export default class TreeDrag extends Tree {

	/* The old spelling, on top of the new event. */
	move(where){
		super.move(where);
		return this.moved(where.node, where.into, where.index);
	}

	moved(node, into, at){ return this.onMoved?.(node, into, at); }
}

TreeDrag.prototype.drag = true;

export { TreeDrag };
