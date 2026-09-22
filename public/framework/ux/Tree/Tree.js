import View, { ul, span, icon, is } from "../../core/View/View.js";
import Sortable from "../../ext/Draggable/Sortable.js";

/* The `.ui-tree-*` stylesheet is the TEMPLATE's and stays in `ui/` — splitting is the
 * usual answer, not moving (ux/doc/system.md). This import is for that stylesheet: the
 * class wears ui/tree's classes, so the two tiers cannot drift apart. A ux imports a ui
 * template; ui NEVER imports a ux. */
import "../../ui/tree/tree.js";

View.stylesheet(import.meta, "Tree.css");

/**
 * class Tree extends View — ONE tree, and everything a tree does is in it.
 *
 *   const t = new Tree({ nodes, selected_change(node){ … } });        a tree
 *   new Tree({ nodes, drag: true, onMove({ node, into, index }){ … } });   + drag
 *   new Tree({ nodes, adapt: true });                                 + drill-down
 *   Tree.from(page);                                                  a page's links
 *
 * `nodes: [{ icon?, text, href?, open?, default?, children? }]`. A row with `href` is
 * an `<a>`; anything else is a `<div>`. `children` is an array, or a FUNCTION that
 * answers one (a promise counts) — then the branch loads the first time you open it.
 *
 * **The keyboard is always on** — ↑ ↓ move, → ← open/shut and step, Enter selects,
 * Home/End jump — through a roving tabindex, so the whole tree is ONE tab stop rather
 * than thirty. It used to be a sibling subclass of the drag one, which meant no tree
 * could have both; that is the merge (doc/decisions.md, 2026-09-17).
 *
 * **The tree never writes.** A drop reports `move({ node, into, index })` and a row
 * button reports `act(name, node)`; what either MEANS is the consumer's — Make moves a
 * page, a nav rail re-orders links. Parts hang off the constructor (`Tree.Item`,
 * `Tree.Row`, `Tree.Drag`) and are reached through the LIVE class, so a subclass swaps
 * one piece and inherits the rest of the machine.
 */
export default class Tree extends View {

	render(){
		this.style("--ui-tree-indent", this.indent);
		if (this.drag) this.ac("ux-tree-drag");

		this.draw();

		// ONE listener, on the root: key events bubble up from whichever row has focus.
		this.on("keydown", e => this.key(e));
	}

	/* Throw the DOM away and rebuild — open rows and the selection reset to what the
	 * new data says. Diffing to preserve them is real complexity for "the caller owns
	 * the data": ui/tree/doc/decisions.md, kept. */
	draw(nodes){
		this.nodes = nodes ?? this.nodes;
		this.rows = new Map();
		this.by_el = new Map();
		this.selected = null;

		this.empty(() => this.list(this.nodes));

		// ⚠ `false` — a rebuild runs inside the constructor the first time, before the
		// element is in the document, and focusing a detached node silently does nothing.
		this.focus_row(this.moves()[0], false);
		return this;
	}

	list(nodes){ nodes.forEach(node => this.item(node)); }

	/* `up` is the Item this one hangs under — undefined at the root. Set here rather
	 * than walked out of the DOM, so "go to my parent" is one property, which is what
	 * `adapt_to()` and ← both walk. */
	item(node, up){ return new this.constructor.Item({ tree: this, node, up }); }

	/* Has it anything to show when you open it? A FUNCTION is a data source, so it is a
	 * branch before a single child has loaded — the same shape `core/Page` took for
	 * `children:` (core/Page/doc/data-children.md). */
	branch(node){ return is.fn(node.children) || node.children?.length > 0; }

	/* Can a drop land INSIDE it? An empty folder is still a folder; a leaf that has
	 * never been able to hold anything is not. Override for a tree where everything
	 * holds everything — a page tree, where any page can hold pages. */
	holds(node){ return node.children !== undefined; }

	// ════ SELECTION ═══════════════════════════════════════════════════════════
	/* Selection lives on the TREE, not on a row: only one row is selected at a time,
	 * and that is a fact about the tree. */
	select(node, fire){
		this.rows.get(this.selected)?.rc("ui-tree-selected");
		this.selected = this.rows.has(node) ? node : null;
		this.rows.get(this.selected)?.ac("ui-tree-selected");

		this.adapt_to(this.selected);
		if (fire) this.selected_change(node);
		return this;
	}

	/* The seam. `onSelect` is `ui.tree()`'s spelling and still works; a subclass
	 * overrides the method instead of the whole class taking a second callback. */
	selected_change(node){ this.onSelect?.(node); }

	// ════ ADAPT — the tree shows the path you are on, and nothing else ═════════
	/* `adapt: true` and the tree folds itself around the selection: everything shuts,
	 * then the chain from the root down to the selected row re-opens — INCLUDING the
	 * selected row, so you see its ancestors, its siblings at every level, and its own
	 * children. Everything else is a shut row you can still click.
	 *
	 * That is the whole of it: a five-level tree reads as a short list at every depth
	 * instead of a wall. Off by default, because a tree the user opened by hand should
	 * stay the way they left it.
	 * ⚠ Chevrons still work while it is on — adapt re-folds on the NEXT selection, so
	 *   opening a second branch to peek at it is not taken away from you. */
	adapt_to(node){
		if (!this.adapt || !node) return this;

		this.rows.forEach($row => $row.item.close());
		for (let item = this.rows.get(node)?.item; item; item = item.up) item.open();

		return this;
	}

	// ════ THE TWO EVENTS ══════════════════════════════════════════════════════
	/* A drop landed. ONE event for all three gestures — above, inside and below all
	 * arrive as "this node now belongs to `into` at `index`", where `into` is null for
	 * the root list and `index` is counted AFTER the node is taken out of wherever it
	 * was, so the consumer's splice-out-then-splice-in never adjusts for its own shift.
	 * The tree has not touched `nodes`; it is reporting, not persisting. */
	move(where){ return this.onMove?.(where); }

	/* A row's button was pressed — `"default"`, `"add"` or `"remove"`. Same contract:
	 * the tree draws the button and says it was pressed, and the consumer decides what
	 * a star or a × means for its own data. */
	act(name, node){ return this.onAct?.(name, node); }

	/* Which buttons a row draws. `acts: "add remove"` (a string of names, the way
	 * `children:` is), or `acts: true` for all three. */
	act_list(){ return (this.acts === true ? "default add remove" : this.acts || "").trim().split(/\s+/).filter(Boolean); }

	can(name){ return this.act_list().includes(name); }

	// ════ A PAGE'S CHILDREN, AS A TREE OF LINKS ═══════════════════════════════
	/* `Tree.from(page)` — the framework's own navigation, as a tree. Returns the Tree
	 * SYNCHRONOUSLY (so it lands in whatever box is capturing right now) and fills it
	 * when the page's children resolve.
	 *
	 *     div.c("rail surface pad", () => Tree.from(this, { adapt: true }));
	 *
	 * ⚠ No DOM after the await: `draw()` goes through `empty(callback)`, and a callback
	 *   re-establishes the captor. */
	static from(page, ...args){
		const tree = new this({ nodes: [] }, ...args);
		this.nodes_of(page).then(nodes => tree.draw(nodes));
		return tree;
	}

	/* One level of `page.children`, as nodes. ⚠ Through `load_all_children()`, never by
	 * reading the Map: a page whose children live in DATA declares them in a function
	 * that core calls on the first ask, and that call is inside this one
	 * (core/Page/doc/data-children.md). Declared-but-unresolved children resolve here
	 * too — that is what the await is for. */
	static async nodes_of(page){
		await page.load_all_children(1).loading;
		return [...page.children.keys()].map(name => this.node_of(page, name));
	}

	/* One child, as a node. Deeper levels are a FUNCTION, so the tree fetches a branch
	 * the first time you open it and a 50-module subtree costs one level on arrival.
	 * ⚠ `leaf: true` (core/Page/readme.md) means "I present myself, not my children" —
	 * a leaf page can still HAVE children in its Map, but a `root:` tree must draw it as
	 * a flat link, the same way `sections()`-built `pages:` data already did (they never
	 * showed this gap: every POJO caller had already flattened a leaf section before
	 * `tree_nodes()` saw it). `count` rides along too — the real number of children a
	 * live Page already knows about, synchronously, even before this branch is ever
	 * opened; `Tree.Drag.commit()` reads it so a drop into a closed branch still lands
	 * after all of them (ux/Tree/doc/decisions.md, 2026-09-18). */
	static node_of(page, name){
		const child = page.children.get(name);
		const nav = page.nav_for(name);
		const deeper = child && !child.leaf && (child.child_source || child.children?.size);

		return {
			text: nav.label,
			href: nav.url,
			icon: nav.icon && (() => icon(nav.icon)),
			page: child,
			count: child?.children.size,
			children: deeper ? () => this.nodes_of(child) : undefined,
		};
	}

	// ════ THE KEYBOARD ════════════════════════════════════════════════════════
	/* A key is one line in a map, so a subclass adds a gesture without touching this. */
	key(e){
		const method = this.keys[e.key];
		if (!method || !this.focused) return;

		if (this[method]() !== false) e.preventDefault();
	}

	/* The rows the arrows can reach: everything not sitting inside a shut branch, in
	 * DOM order.
	 * ⚠ Read out of the DOM, not out of `rows` — a lazily-loaded branch sets its rows
	 *   on the Map long after its neighbours, so `[...rows.values()]` stopped being DOM
	 *   order the day branches could load late. `by_el` maps back.
	 * ⚠ Asked of the DOM, never of layout — `offsetParent` reads null for a whole page
	 *   in a hidden tab, and this has to be right there too. */
	moves(){
		const shut = new Set(this.el.querySelectorAll(".ui-tree-item:not(.ui-tree-open) > .ui-tree-children .ui-tree-row"));

		return [...this.el.querySelectorAll(".ui-tree-row")]
			.filter(el => !shut.has(el))
			.map(el => this.by_el.get(el))
			.filter(Boolean);
	}

	/* The roving tabindex itself: the tabbable row and the focused row are one row, so
	 * Tab reaches the tree once and the arrows do the rest. */
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

/* ⚠ Prototype, not class fields — View renders inside its constructor, and a class
 * field on a subclass initializes AFTER that, so `render()` would never see it. */
Tree.prototype.tag = "ul";
Tree.prototype.classes = "ui-tree";
Tree.prototype.indent = "1.25em";
Tree.prototype.nodes = [];
Tree.prototype.drag = false;
Tree.prototype.adapt = false;
Tree.prototype.acts = "";

Tree.prototype.keys = {
	ArrowDown: "next",  ArrowUp: "prev",
	ArrowRight: "expand", ArrowLeft: "collapse",
	Enter: "choose", " ": "choose",
	Home: "first", End: "last",
};


/* One `<li>` per node: the open state, the row, and the nested list. Indent is real
 * nesting — every `.ui-tree-children` adds one `--ui-tree-indent`, so no row stores a
 * depth and a collapse hides its whole subtree for free. */
Tree.Item = class TreeItem extends View {

	render(){
		this.kids = this.tree.branch(this.node);
		this.row();

		if (!this.kids) return;

		this.$kids = ul.c("ui-tree-children", () => {
			if (is.arr(this.node.children)) this.node.children.forEach(n => this.tree.item(n, this));
		});

		if (this.node.open) this.open();
	}

	/* Through the live class, so a subclass builds its own Row. */
	row(){ return this.$row = new this.tree.constructor.Row({ tree: this.tree, item: this, node: this.node }); }

	/* ⚠ Not `toggle()` / `show()` / `hide()` — those are View's, and shadowing them
	 * here would break every generic caller. `flip` is the free word. */
	open(){ this.ac("ui-tree-open"); return this.grow(); }
	close(){ return this.rc("ui-tree-open"); }
	flip(){ return this.opened() ? this.close() : this.open(); }
	opened(){ return this.hc("ui-tree-open"); }

	/* A branch whose `children` is a FUNCTION loads the first time it is opened, once,
	 * and the answer is written back onto the node so a `draw()` keeps it.
	 * ⚠ Not `load()` — `View.load(meta, url)` is View's, and shadowing it breaks every
	 *   generic caller (the same trap `flip()` and `label()` dodge).
	 * ⚠ No DOM after the await. `$kids` was captured synchronously above; `.append(cb)`
	 *   re-establishes the captor inside it. */
	grow(){
		if (this.growing || !is.fn(this.node.children)) return this;

		this.growing = Promise.resolve(this.node.children.call(this.node)).then(list => {
			this.node.children = list ?? [];
			this.$kids.append(() => this.node.children.forEach(n => this.tree.item(n, this)));
		});

		return this;
	}
};

Tree.Item.prototype.tag = "li";
Tree.Item.prototype.classes = "ui-tree-item";


/* The clickable line. A node with `href` is an `<a>`; everything else is a `<div>`.
 * Every slot is always drawn, so a mix of branches, icon'd and icon-less leaves keeps
 * one text column. */
Tree.Row = class TreeRow extends View {

	/* ⚠ The tag has to be decided BEFORE View creates the element, and `assign()` has
	 * already run by the time this is called — so `this.node` is readable here. */
	prerender(){
		this.tag = this.node.href ? "a" : "div";
		super.prerender();
	}

	render(){
		this.tree.rows.set(this.node, this);
		this.tree.by_el.set(this.el, this);
		if (this.node.href) this.href(this.node.href);

		this.grip();
		this.caret();
		this.icon();
		this.label();
		this.mark();
		this.acts();

		// The roving tabindex: every row can be focused, exactly one is tabbable.
		// ⚠ `focus` does not bubble — this is bound on the row itself, which is the
		// only reason that is fine.
		this.attr("tabindex", "-1");
		this.on("focus", () => this.tree.focus_row(this, false));

		this.click(() => this.tree.select(this.node, true));
	}

	/* ⚠ A dedicated grip, not the whole row: `Draggable.grab()` calls `start()` on
	 * EVERY pointerdown with no movement threshold, so a whole-row handle hides and
	 * ghosts the row on a plain click-to-select. `ext/Panel`'s own handle is "the grip
	 * alone, never the bar" for the same reason — reused, not re-discovered. */
	grip(){
		if (!this.tree.drag) return;

		this.$grip = span.c("ux-tree-grip", "⠿").attr("aria-label", "drag to move");
		this.dragger = new this.tree.constructor.Drag({ view: this, handle: this.$grip, tree: this.tree, node: this.node });
		return this.$grip;
	}

	/* ⚠ `stopPropagation`, or expanding also selects — ui/tree/doc/decisions.md. And now
	 * that a BRANCH row can be a real `<a>` (ux/Tree/doc/decisions.md, 2026-09-17), also
	 * `preventDefault` — the row itself is the anchor, and a click inside it navigates by
	 * the browser's own default action, which `stopPropagation` alone never stops (that
	 * only silences OTHER listeners; it says nothing about the anchor's own click). Skip
	 * it and the chevron both folds AND follows the link on the same click. */
	caret(){
		const $caret = span.c("ui-tree-toggle", this.item.kids ? "▸" : "");

		if (this.item.kids)
			$caret.attr("aria-label", "toggle").click(e => { e.preventDefault(); e.stopPropagation(); this.item.flip(); });

		return $caret;
	}

	/* A string, a View or an element — whatever the node carries. ⚠ Pass a FUNCTION
	 * (`icon: () => icon("folder")`) for anything that builds a View: a bare View built
	 * at the call site appends itself to whatever box is capturing at that moment. */
	icon(){ return span.c("ui-tree-icon", $icon => { if (this.node.icon != null) $icon.append(this.node.icon); }); }

	/* ⚠ Not `text()` — that is View's getter/setter, and shadowing it breaks `.text()`
	 * on every row. */
	label(){ return span.c("ui-tree-text", this.node.text); }

	/* THE STAR — "this is the one that opens first", among its own siblings. It is a
	 * MARK when the consumer only reads `node.default`, and the same star becomes the
	 * BUTTON when `acts` includes "default": one control, one place, both ways — a
	 * filled star you cannot press off was a measured defect in Make. */
	mark(){
		const on = !!this.node.default;
		const can = this.tree.can("default");
		if (!on && !can) return;

		const $mark = span.c("ux-tree-mark").ac(on && "ux-tree-on")
			.attr("title", on ? "opens first" : "open this one first")
			.append(() => { icon(on ? "star" : "star_outline"); });

		if (can) $mark.click(e => { e.preventDefault(); e.stopPropagation(); this.tree.act("default", this.node); });
		return $mark;
	}

	/* `+` and `×`, off unless the consumer asks. Both report and neither writes. */
	acts(){
		const names = this.tree.act_list().filter(name => name !== "default");
		if (!names.length) return;

		return span.c("ux-tree-acts", () => names.forEach(name => this.button(name)));
	}

	/* ⚠ Not `act()` — that is the TREE's event seam, and a row method of the same name
	 * reads as the same thing while being a different one. */
	button(name){
		const said = Tree.Row.buttons[name];

		return span.c("ux-tree-act").attr("title", said.title + (this.node.text ?? ""))
			.append(() => { icon(said.glyph); })
			.click(e => { e.preventDefault(); e.stopPropagation(); this.tree.act(name, this.node); });
	}
};

Tree.Row.prototype.classes = "ui-tree-row";
Tree.Row.buttons = {
	add: { glyph: "add", title: "add under " },
	remove: { glyph: "close", title: "delete " },
};


/**
 * `Tree.Drag` — one row's drag, on `ext/Draggable`'s `Sortable`.
 *
 * **Reuse call, with evidence (doc/decisions.md).** Pointer capture, the ghost, the
 * placeholder, Escape and `.drag-source`'s inline-display fix are the previously-
 * debugged half, kept whole. What is overridden is where a drop LANDS: `Sortable`
 * commits through `item.move()` against a `core/Item` tree this does not have, and its
 * `before()`/`row()` assume a container's DIRECT children ARE the registered
 * draggables — true for `ext/Panel`, false here (a row sits inside an `<li>` beside its
 * own children `<ul>`, one layer removed).
 */
Tree.Drag = class TreeMove extends Sortable {

	/* Never a branch into its own descendant. `Item.contains()` does not exist here —
	 * nodes are plain data with no parent pointer — so this walks DOWN from the dragged
	 * node instead of up from the target. */
	drop_check(target){ return target !== this && !contains(this.node, target.node); }

	start(){
		super.start();
		this.placeholder.style.height = "";           // a LINE, not a row-height spacer
		this.placeholder.classList.add("ux-tree-drag-line");

		// ⚠ The ghost HUGS. Sortable clones the row at its real width, which for a tree
		// is the whole rail — a 556px bar sliding around under the cursor, out past the
		// edge of the demo it was dragged in. A row's ghost is the row's own ink.
		this.ghost.style.width = "max-content";
	}

	move(dx, dy, e){
		this.ghost.style.transform = `translate(${dx}px, ${dy}px)`;
		this.show(this.locate(e));
	}

	/* ── A ROW IS THREE TARGETS, AND WHICH ONE YOU GET IS WHERE ON IT YOU LET GO ──
	 *
	 *     its top edge      land ABOVE it, as its sibling
	 *     its middle        land INSIDE it, as its last child
	 *     its bottom edge   land BELOW it, as its sibling
	 *
	 * Make's model (`/imagine/paging/make/tree.js`), lifted here so there is one of it.
	 * ⚠ The edge is a THIRD of the row, capped at 10px, so the middle — nesting, the
	 *   thing a tree is for — is always the biggest of the three. Make measured the
	 *   alternative: with "anywhere on a row means inside it", the only place left to
	 *   say "before it" was the 4px gap between two rows.
	 * ⚠ A node that cannot hold children (`holds()`) has no middle: the row splits in
	 *   half, above and below, so you can still reorder against a leaf. */
	locate(e){
		const target = this.under(e, box => this.drop_check(box));
		if (!target) return null;

		const box = target.view.el.getBoundingClientRect();
		const edge = Math.min(10, box.height / 3);

		if (this.tree.holds(target.node) && e.clientY > box.top + edge && e.clientY < box.bottom - edge)
			return { kind: "into", target };

		return { kind: "beside", target, above: e.clientY < box.top + box.height / 2 };
	}

	/* The insertion cue. "into" outlines the target row; "beside" moves the placeholder
	 * LINE to whichever side of it the cursor is on — DOM position only, never `nodes`.
	 * ⚠ The line for "below" is drawn after the target's whole `<li>`, which is under
	 *   its open children. That is where the row would actually land. */
	show(where){
		if (this.highlighted){ this.highlighted.rc("ux-tree-drag-target"); this.highlighted = null; }

		if (!where) return this.placeholder.remove();

		if (where.kind === "into"){
			this.placeholder.remove();
			this.highlighted = where.target.view.ac("ux-tree-drag-target");
			return;
		}

		const li = where.target.view.el.closest("li");
		where.above ? li.before(this.placeholder) : li.after(this.placeholder);
	}

	// Sortable commits through `item.move()`; a tree node has no Item, so this replaces
	// the whole method rather than overriding a piece of it.
	release(e){
		const where = this.locate(e);
		this.end();
		this.swallow_click();
		if (where) this.commit(where);
	}

	/* ⚠ A DROP IS FOLLOWED BY A CLICK. The pointer went down on the grip and up on the
	 * row, so the browser fires a real `click` on the row right after this — and a
	 * row's click means "select me" (`Tree.Row.render()`), which a consumer whose
	 * `onSelect` does something a drop should not undo (Make's confirm question) never
	 * asked for. One CAPTURING listener, on the tree's own root, ahead of the row's own
	 * bubble-phase one — `stopPropagation()` during capture keeps the event from ever
	 * reaching the row, so its click handler never runs. Removed either way on the next
	 * tick, so a drop that is NOT followed by a click (nothing to swallow) never eats a
	 * later, unrelated one. */
	swallow_click(){
		const eat = e => e.stopPropagation();
		this.tree.el.addEventListener("click", eat, { capture: true });
		setTimeout(() => this.tree.el.removeEventListener("click", eat, { capture: true }), 0);
	}

	/* Turn a resolved drop into the tree's ONE event. `index` counts the destination
	 * WITHOUT the dragged node in it, so the consumer's splice-out-then-splice-in never
	 * has to adjust for its own shift. */
	commit(where){
		if (where.kind === "into"){
			const into = where.target.node;

			/* ⚠ AN UNOPENED BRANCH'S `children` IS STILL A FUNCTION — nobody has loaded
			 * it into an array yet, so counting the array (the old code) always counted
			 * zero and a drop into a closed branch landed FIRST instead of last. A node
			 * built by `Tree.node_of()` carries the real count already (`node.count`,
			 * read off the live Page's own Map, synchronously, whether the branch has
			 * ever been opened or not) — used only when there is no loaded array to count
			 * instead, which stays the exact, self-excluding count it always was. */
			const index = is.arr(into.children)
				? into.children.filter(n => n !== this.node).length
				: (into.count ?? 0);

			return this.tree.move({ node: this.node, into, index });
		}

		const found = locate_parent(this.tree.nodes, where.target.node);
		if (!found) return;

		const { array, parent } = found;

		let i = array.indexOf(where.target.node) + (where.above ? 0 : 1);
		while (array[i] === this.node) i++;      // the dragged node's own old slot doesn't count
		const before = array[i] ?? null;

		const rest = array.filter(n => n !== this.node);
		this.tree.move({ node: this.node, into: parent, index: before ? rest.indexOf(before) : rest.length });
	}

	end(){
		if (this.highlighted){ this.highlighted.rc("ux-tree-drag-target"); this.highlighted = null; }
		super.end();
	}
};

/* Strict-descendant test, node-data version of `Item.contains()`. */
const contains = (ancestor, node) =>
	is.arr(ancestor.children) && ancestor.children.some(c => c === node || contains(c, node));

/* The array holding `node` — the root list, or some ancestor's `children` — and that
 * ancestor (null at the root). Nodes carry no parent pointer, so this is the walk that
 * finds one; read at commit time, never stored, because `draw()` can throw the whole
 * shape away and rebuild it.
 * ⚠ `is.arr`, not truthiness: an unopened lazy branch's `children` is a FUNCTION. */
const locate_parent = (nodes, node, parent = null) => {
	if (nodes.includes(node)) return { array: nodes, parent };

	for (const n of nodes){
		const found = is.arr(n.children) && locate_parent(n.children, node, n);
		if (found) return found;
	}
	return null;
};

export { Tree };
