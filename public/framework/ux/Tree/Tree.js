import View, { ul, span } from "../../core/View/View.js";

/* The `.ui-tree-*` stylesheet is the TEMPLATE's and stays in `ui/` — splitting is the
 * usual answer, not moving (ux/doc/system.md). This import is for that stylesheet: the
 * class wears ui/tree's classes, so the two tiers cannot drift apart. A ux imports a ui
 * template; ui NEVER imports a ux. */
import "../../ui/tree/tree.js";

View.stylesheet(import.meta, "Tree.css");

/**
 * class Tree extends View — `ui.tree()`'s closure, opened up.
 *
 *   const t = new Tree({ nodes, indent: "1.25em", onSelect(node){ … } });
 *   t.draw(nodes)          re-render from fresh data (was `t.update()`)
 *   t.select(node)         mark a row selected · `t.select(node, true)` also fires
 *
 * `nodes: [{ icon?, text, href?, open?, children? }]` — the same shape `ui.tree()`
 * takes. A leaf with `href` is a link; anything else is a selectable row. A branch
 * gets a `▸` and is selectable too.
 *
 * Parts hang off the constructor (`Tree.Item`, `Tree.Row`) and are reached through the
 * LIVE class, so a subclass swaps one piece and inherits the rest of the machine —
 * `TreeKeys.js` is the worked example.
 */
export default class Tree extends View {

	render(){
		this.style("--ui-tree-indent", this.indent);
		this.draw();
	}

	/* Throw the DOM away and rebuild — open rows and the selection reset to what the
	 * new data says. Diffing to preserve them is real complexity for "the caller owns
	 * the data": ui/tree/doc/decisions.md, kept.
	 * ⚠ `rows` is a Map in insertion order, and items are built depth-first, so
	 * `[...rows.values()]` is the rows in DOM order — TreeKeys walks it. */
	draw(nodes){
		this.nodes = nodes ?? this.nodes;
		this.rows = new Map();
		this.selected = null;
		return this.empty(() => this.list(this.nodes));
	}

	list(nodes){ nodes.forEach(node => this.item(node)); }

	/* `up` is the Item this one hangs under — undefined at the root. Set here rather
	 * than walked out of the DOM, so "go to my parent" is one property. */
	item(node, up){ return new this.constructor.Item({ tree: this, node, up }); }

	/* Selection lives on the TREE, not on a row: only one row is selected at a time,
	 * and that is a fact about the tree. */
	select(node, fire){
		this.rows.get(this.selected)?.rc("ui-tree-selected");
		this.selected = this.rows.has(node) ? node : null;
		this.rows.get(this.selected)?.ac("ui-tree-selected");
		if (fire) this.selected_change(node);
		return this;
	}

	/* The seam. `onSelect` is `ui.tree()`'s spelling and still works; a subclass
	 * overrides the method instead of the whole class taking a second callback. */
	selected_change(node){ this.onSelect?.(node); }
}

/* ⚠ Prototype, not class fields — View renders inside its constructor, and a class
 * field on a subclass initializes AFTER that, so `render()` would never see it. */
Tree.prototype.tag = "ul";
Tree.prototype.classes = "ui-tree";
Tree.prototype.indent = "1.25em";
Tree.prototype.nodes = [];

/* One `<li>` per node: the open state, the row, and the nested list. Indent is real
 * nesting — every `.ui-tree-children` adds one `--ui-tree-indent`, so no row stores a
 * depth and a collapse hides its whole subtree for free. */
Tree.Item = class TreeItem extends View {

	render(){
		this.kids = this.node.children?.length > 0;
		if (this.kids && this.node.open) this.open();

		this.row();

		if (this.kids)
			ul.c("ui-tree-children", () => this.node.children.forEach(n => this.tree.item(n, this)));
	}

	/* Through the live class, so a `TreeKeys` builds `TreeKeys.Row`. */
	row(){ return this.$row = new this.tree.constructor.Row({ tree: this.tree, item: this, node: this.node }); }

	/* ⚠ Not `toggle()` / `show()` / `hide()` — those are View's, and shadowing them
	 * here would break every generic caller. `flip` is the free word. */
	open(){ return this.ac("ui-tree-open"); }
	close(){ return this.rc("ui-tree-open"); }
	flip(){ return this.tc("ui-tree-open"); }
	opened(){ return this.hc("ui-tree-open"); }
};

Tree.Item.prototype.tag = "li";
Tree.Item.prototype.classes = "ui-tree-item";

/* The clickable line. A leaf with `href` is an `<a>`; everything else is a `<div>`.
 * Both slots are always drawn, so a mix of branches, icon'd and icon-less leaves keeps
 * one text column. */
Tree.Row = class TreeRow extends View {

	/* ⚠ The tag has to be decided BEFORE View creates the element, and `assign()` has
	 * already run by the time this is called — so `this.node` is readable here. */
	prerender(){
		this.tag = !this.item.kids && this.node.href ? "a" : "div";
		super.prerender();
	}

	render(){
		this.tree.rows.set(this.node, this);
		if (this.node.href && this.tag === "a") this.href(this.node.href);

		this.caret();
		this.icon();
		this.label();

		this.click(() => this.tree.select(this.node, true));
	}

	/* ⚠ `stopPropagation`, or expanding also selects — ui/tree/doc/decisions.md. */
	caret(){
		const $caret = span.c("ui-tree-toggle", this.item.kids ? "▸" : "");

		if (this.item.kids)
			$caret.attr("aria-label", "toggle").click(e => { e.stopPropagation(); this.item.flip(); });

		return $caret;
	}

	/* A string, a View or an element — whatever the node carries. ⚠ Pass a FUNCTION
	 * (`icon: () => icon("folder")`) for anything that builds a View: a bare View built
	 * at the call site appends itself to whatever box is capturing at that moment. */
	icon(){ return span.c("ui-tree-icon", $icon => { if (this.node.icon != null) $icon.append(this.node.icon); }); }

	/* ⚠ Not `text()` — that is View's getter/setter, and shadowing it breaks `.text()`
	 * on every row. */
	label(){ return span.c("ui-tree-text", this.node.text); }
};

Tree.Row.prototype.classes = "ui-tree-row";

export { Tree };
