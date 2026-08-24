import Tree from "./Tree.js";

/**
 * class TreeKeys extends Tree — the readme's first named ask, shipped as a NAMED
 * subclass rather than an option. `new TreeKeys({ nodes })` is a Tree you can drive
 * from the keyboard; everything else about it is inherited, untouched.
 *
 *   ↑ ↓        move one visible row
 *   → ←        open a branch, then step into it · shut it, then step out to the parent
 *   Enter ␣    select the focused row (Enter on a link row stays the browser's)
 *   Home End   first / last visible row
 *
 * **Roving tabindex:** one row carries `tabindex="0"` and every other `-1`, so Tab
 * reaches the tree once and the arrows do the rest — never thirty tab stops.
 */
export default class TreeKeys extends Tree {

	render(){
		super.render();

		// ONE listener, on the root: key events bubble up from whichever row has focus.
		this.on("keydown", e => this.key(e));
	}

	draw(nodes){
		super.draw(nodes);

		// A rebuild throws every row away, so the roving one has to be re-elected.
		// ⚠ `false` — this runs inside the constructor, before the element is in the
		// document, and focusing a detached node silently does nothing.
		this.focus_row(this.moves()[0], false);
		return this;
	}

	/* A key is one line in a map, so a subclass adds a gesture without touching this. */
	key(e){
		const method = this.keys[e.key];
		if (!method || !this.focused) return;

		if (this[method]() !== false) e.preventDefault();
	}

	/* The rows the arrows can reach: everything not sitting inside a shut branch.
	 * ⚠ Asked of the DOM, never of layout — `offsetParent` reads null for a whole page
	 * in a hidden tab, and this has to be right there too. */
	moves(){
		const shut = new Set(this.el.querySelectorAll(".ui-tree-item:not(.ui-tree-open) > .ui-tree-children .ui-tree-row"));

		return [...this.rows.values()].filter($row => !shut.has($row.el));
	}

	/* The roving tabindex itself: the tabbable row and the focused row are one row. */
	focus_row($row, focus = true){
		if (!$row) return;

		this.focused?.attr("tabindex", "-1");
		this.focused = $row.attr("tabindex", "0");
		if (focus) $row.el.focus();

		return $row;
	}

	step(by){
		const rows = this.moves();
		const at = rows.indexOf(this.focused);

		this.focus_row(rows[Math.max(0, Math.min(rows.length - 1, at + by))]);
	}

	next(){ this.step(1); }
	prev(){ this.step(-1); }
	first(){ this.focus_row(this.moves()[0]); }
	last(){ this.focus_row(this.moves().at(-1)); }

	/* → opens a shut branch, and a second press steps INTO it — two presses, two
	 * different moves, which is the gesture every tree has. */
	expand(){
		const item = this.focused.item;
		if (!item.kids) return;

		item.opened() ? this.next() : item.open();
	}

	/* ← is the mirror: shut an open branch, otherwise step OUT to the parent row. */
	collapse(){
		const item = this.focused.item;
		if (item.kids && item.opened()) return item.close();

		this.focus_row(item.up?.$row);
	}

	/* ⚠ Returning false leaves the event alone. Enter on a link row is the browser's
	 * job, and preventing it would break every `href` in the tree. */
	choose(){
		if (this.focused.tag === "a") return false;

		this.select(this.focused.node, true);
	}
}

TreeKeys.prototype.classes = "ui-tree ux-tree-keys";

TreeKeys.prototype.keys = {
	ArrowDown: "next",  ArrowUp: "prev",
	ArrowRight: "expand", ArrowLeft: "collapse",
	Enter: "choose", " ": "choose",
	Home: "first", End: "last",
};

/* The ONE part that changes. `Tree.Item` is inherited untouched: `extends` copies the
 * static side, so TreeKeys got the whole machine and replaced a single branch of it —
 * and `Tree.Row` itself is unaffected, so a plain Tree still has no tab stops. */
TreeKeys.Row = class TreeKeysRow extends Tree.Row {

	render(){
		super.render();
		this.attr("tabindex", "-1");

		// Clicking a row makes it the roving one too, so the arrows carry on from
		// wherever the pointer left off. ⚠ `focus` does not bubble — this is bound on
		// the row itself, which is the only reason that is fine.
		this.on("focus", () => this.tree.focus_row(this, false));
	}
};

export { TreeKeys };
