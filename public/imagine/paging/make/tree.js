import { div, p, span, icon } from "/app.js";
import { press } from "../paging.js";
import Sortable from "/framework/ext/Draggable/Sortable.js";
import { at, clone } from "./made.js";
import { is_default, mode_of } from "../build/words.js";

/* ── THE PAGE TREE ─────────────────────────────────────────────────────────────

   The left pane: every page you have made, nested the way the files are. One row is
   one page. Click it and the other two panes follow. Drag it and it moves.

   ⚠ THERE ARE NO UP AND DOWN BUTTONS. There were, and they were the owner's own
     complaint on 2026-09-13: *"i shouldn't need UP and DOWN buttons if drag and drop
     sorting works"*. Dragging says three things one press at a time could not — put
     this page third, put it inside that one, take it back out to the top level — and
     it is ONE call either way (`Make.move_to()`), so the buttons were two controls
     for a worse version of what the grip already does.

   ⚠ AND IT DOES NOT RENAME IN PLACE EITHER. The row used to turn into a text field.
     The title field in the RIGHT pane renames the page you have selected, which is
     the same act in the place every other thing about that page is said — and this
     realm's own rule is one name, one control. What is left on a row is the three
     things that are about the row rather than about the page: which one opens first,
     add a page under this one, and delete it.                                     */

/* ── WHAT A DRAGGED ROW IS ─────────────────────────────────────────────────────
   `Sortable` asks an item for exactly one thing — `move(parent, before)` — and that
   is the entire coupling between the drag machinery and this tree; `ext/Draggable`
   imports no tree class at all. A PATH is the address of a node in memory AND the
   directory it lives in (`made.js`), so it is all an item has to carry. */
class TreeItem {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// The one call, at the moment a drop commits. `before` null means "last".
	move(parent, before){ return this.page.move_to(this.path, parent.path, before?.path ?? null); }

	// Am I an ancestor of that one? The descendant guard below reads this.
	contains(other){
		return !!other?.path
			&& other.path.length > this.path.length
			&& this.path.every((name, i) => other.path[i] === name);
	}
}

/* ONE ROW, WHICH IS ALSO ONE BOX ROWS LAND IN — the same instance. That is what
   makes reorder, reparent and nest one gesture instead of three: they are all
   `item.move()` with a different parent.

   ⚠ THE DESCENDANT GUARD IS MINE TO WRITE. `Draggable.under()` already skips every
     element inside the row being dragged, so with a mouse you cannot reach your own
     children — but the rule this tree actually has is "a page can never be put
     inside itself", and `drop_check` is where `Sortable` asks for it. One override
     governs both the placeholder you see and the move that commits. */
class TreeSort extends Sortable {

	drop_check(target){ return target !== this && !this.item.contains(target.item); }

	/* ── A ROW IS TWO TARGETS, AND WHICH ONE YOU GET IS WHERE ON IT YOU LET GO ──

	       its top edge       land ABOVE it, as its sibling
	       its middle         land INSIDE it, as its last child
	       its bottom edge    land BELOW it, as its sibling
	       its indented slot  land inside it — the same as its middle

	   ⚠ WITHOUT THIS, REORDERING IS A 4-PIXEL TARGET. `Sortable.locate()` takes the
	     innermost registered container under the cursor, and every row here IS one (a
	     page can hold pages) — so anywhere on a row means "inside it", and the only
	     place left to say "before it" is the gap BETWEEN two rows, which is 0.25em.
	     Reordering, the thing this replaced the up and down buttons with, would have
	     been unusable. Measured while writing it: the gap is 4px at 1280.

	   The edge band is 10px, or a third of the row when the row is shorter than 30 —
	   so the middle is always the biggest of the three and nesting stays the easy one
	   to hit. */
	locate(e){
		const box = this.under(e, found => found.$items && this.drop_check(found, e));
		if (!box) return null;

		// The tree itself has no row — it is only ever a reorder of the top level.
		const rect = box.$row?.el?.getBoundingClientRect();
		if (!rect) return { list: box, before: box.before(e, this) };

		const edge = Math.min(10, rect.height / 3);
		const above = e.clientY < rect.top + edge;
		const below = e.clientY >= rect.bottom - edge && e.clientY < rect.bottom;

		// Inside it: the middle of the row, or its indented children's box below it.
		if (!above && !below) return { list: box, before: null };

		/* Beside it — which means its PARENT is the list, and the parent may refuse
		   the drop (it cannot, in this tree, but `drop_check` is the one filter and
		   asking it twice costs nothing). Nothing to be a sibling of at the top of the
		   tree means the row keeps the drop. */
		const parent = box.up();
		if (!parent || !this.drop_check(parent, e)) return { list: box, before: null };

		return { list: parent, before: above ? box.item : this.after(box) };
	}

	/* THE CONTAINER THIS ROW IS IN, found by walking the DOM up to the next
	   registered box. ⚠ Not a field wired at construction: a row is built BEFORE the
	   box it lives in is registered (a container needs its `$items` to exist first),
	   so there is nothing to hand down at the time. The registry already knows. */
	up(){
		let el = this.view.el.parentElement;

		while (el){
			const found = this.constructor.registry.get(el);
			if (found?.$items) return found;
			el = el.parentElement;
		}

		return null;
	}

	// The next row after that one, skipping the placeholder and the hidden source.
	after(box){
		let el = box.view.el.nextElementSibling;

		while (el && (el === this.placeholder || el === this.view.el || !this.constructor.registry.get(el)))
			el = el.nextElementSibling;

		return el ? (this.constructor.registry.get(el)?.item ?? null) : null;
	}
}


/* ── THE PANE ──────────────────────────────────────────────────────────────────
   One obvious control at the top, and the tree under it. */
export function tree_pane(page){
	/* ⚠ THE PANE SAYS WHAT IT IS. The owner, 2026-09-13: *"every button, every item,
	     every part - perfectly clear what goes where, what does what, what clicks do"*.
	     A heading and one control beside it is the whole of what this pane needs to
	     introduce itself. */
	div.c("paging-make-pane-head", () => {
		span.c("paging-make-group-title", "Pages");

		/* ⚠ AN ACT, NOT A VALUE. This wore `.paging-chip.on` — pixel-identical to the
		     chips in the right pane where the orange fill means "this is the value in
		     force", so one look meant three things on one screen (self-evident-critique,
		     defect 8). `.paging-act` is the realm's own shape for a verb. */
		press(span.c("paging-act").attr("title", "make a new page at the top level")
			.append(() => { icon("add"); span("New page"); }),
			() => page.add_under([], "New page"));
	});

	let $items;

	const $tree = div.c("paging-make-tree", () => {
		$items = div.c("paging-make-roots", () => {
			(page.tree ?? []).forEach(node => node_row(page, node, [node.name]));
		});

		if (!(page.tree ?? []).length) p.c("muted", "No pages yet.");
	});

	/* THE TREE ITSELF IS A DROP SITE — `handle: false`, so there is nothing to pick it
	   up by. Dropping a row onto the whitespace here takes it back out to the top
	   level, which is the only way back out of a nesting. */
	new TreeSort({ view: $tree, handle: false, $items, item: new TreeItem({ page, path: [] }) });

	/* The one line this pane gets, and it is the one thing the PICTURE cannot say: a
	   grip is a gesture, and a gesture has no visible state to read. "Click a row to
	   edit it" went with the rest of the prose — the picked row draws its own border,
	   so the screen already says it (self-evident-critique-2, finding 5). */
	p.c("muted paging-make-line-note", "Drag a row by its grip: onto the edge of another to sit beside it, onto the middle to go inside it.");

	return $tree;
}

/* ONE ROW AND ITS CHILDREN. The row is what you grab and what you click; the box
   under it is where this page's own children are drawn AND where a dragged row lands
   to become one of them.

   ⚠ THE CALLBACKS END IN A STATEMENT. A captured callback's RETURN VALUE is appended
     too, so `() => $row = div.c(…)` would append the row twice and the second append
     would MOVE it to the end. Braces and a semicolon are the whole of the fix. */
function node_row(page, node, path){
	const on = same(page.picked, path);

	let $row, $items, $grip;

	const $node = div.c("paging-make-node", () => {
		/* ⚠ `$r`, THE CALLBACK'S OWN ARGUMENT — not the `$row` on the line above it.
		     `.append(fn)` calls `fn.call(view, view)` SYNCHRONOUSLY, inside the very
		     expression whose result is being assigned to `$row`, so `$row` is still
		     undefined while this callback runs. Delete's two-press question turns the
		     row into itself, so it needs the row: reading the outer name gave
		     `Cannot read properties of undefined (reading 'empty')` on the first click
		     of a × and nothing else — the button simply did nothing (measured
		     2026-09-13). The view is handed to you; take it. */
		$row = div.c("paging-make-row").ac(on && "paging-make-row-on").append($r => {
			$grip = span.c("paging-make-grip").attr("title", "drag to reorder, or onto another page to put it inside")
				.append(() => { icon("drag_indicator"); });

			press(span.c("paging-make-pick").attr("title", "edit " + node.title + " — the middle and the right change to it")
				.attr("aria-pressed", String(on))
				.append(() => {
					icon(node.icon ?? "description");
					span.c("paging-make-title", node.title);
				}), () => page.pick(path));

			acts(page, node, path, $r);
		});

		/* ── AND THE STARRED ROW SAYS WHY, IN WORDS ───────────────────────────
		   A filled star is a mark, not a sentence: pressing it changed nothing else on
		   the screen, so nobody could say what it had done (self-evident-critique,
		   defect 5).

		   ⚠ UNDER THE ROW, NOT INSIDE IT. Inside, it needs `flex-wrap` on the row — and
		     a wrapping row wraps BEFORE it shrinks, so the star, + and × dropped to a
		     second line on every row whose title was longer than its indent allowed
		     (measured at 1280, three rows deep). The node is already a flex column. */
		if (is_default(node)) span.c("paging-make-first", () => {
			icon("star");
			span("opens first");
		});

		$items = div.c("paging-make-kids", () => {
			(node.children ?? []).forEach(kid => node_row(page, kid, [...path, kid.name]));
		});
	});

	new TreeSort({ view: $node, handle: $grip, $items, $row, item: new TreeItem({ page, path }) });

	return $node;
}

const same = (a, b) => a?.length === b.length && b.every((name, i) => a[i] === name);

/* THE THREE ACTS ON A ROW. Every one of them builds a NEW TREE and hands it to
   `Make.apply()`, which works out the files. Nothing here writes. */
function acts(page, node, path, $row){
	return div.c("paging-make-acts", () => {
		/* THE STAR — "open when you arrive", among THIS row's own siblings. The one
		   act that is about a page's position rather than a page, which is why it is
		   here and not in the settings pane. */
		/* ⚠ IT TOGGLES. A filled star could not be pressed off — a mis-click was
		     permanent, and the second press measurably did nothing at all
		     (self-evident-critique, defect 5). The same button, both ways, and the
		     tooltip says which way this press goes. */
		const first = is_default(node);

		act(first ? "star" : "star_outline",
			first ? node.title + " opens first — press to stop that"
				: "open " + node.title + " first when its parent opens",
			() => default_at(page, path, !first), first && "on");

		act("add", "add a page under " + node.title, () => page.add_under(path, "New page"));

		act("close", "delete " + node.title, () => ask(page, node, path, $row), "paging-make-del");
	});
}

const act = (glyph, title, run, extra) =>
	press(span.c("paging-make-act").ac(extra).attr("title", title).append(() => { icon(glyph); }), run);

/* DELETE ASKS FIRST, in place, and it says WHAT IT IS ABOUT TO TAKE. One press used
   to remove the page and its directory with nothing said. The question names the page
   and counts the pages under it, so nobody loses a tree by a mis-click.
   ⚠ AND IT DELETES THE FILE. `remove_at()` → `apply()` → `made.save(next, was)`, which
     `rm`s the directory and rewrites the parent's file without the name — both halves
     in one write, so nothing is left naming a page that is not there. */
/* ⚠ AND THE QUESTION IS READ IN FULL, AT EVERY WIDTH. It wore `.paging-make-title`
     — the row title's class, which is `nowrap` + ellipsis so a long page name never
     pushes the three acts off the row — and inside a 210px tree pane at 1280 the one
     control whose whole job is to say what it is about to destroy rendered as "D…"
     (self-evident-critique, defect 3). Its own class, its own full-width line inside
     the row, wrapping to as many lines as the name needs. */
function ask(page, node, path, $row){
	return $row.ac("paging-make-row-ask").empty(() => {
		span.c("paging-make-ask-title", () => {
			icon("delete");
			span("Delete " + node.title + kids_line(node) + "?");
		});

		press(span.c("paging-act paging-act-warn").append(() => { icon("delete_forever"); span("Delete it"); }),
			() => page.remove_at(path));

		// The same pair the drawer's own delete box uses — one shape for every
		// destroyer on this screen, and a Cancel that is obviously a button.
		press(span.c("paging-act").append(() => span("Cancel")), () => page.redraw());
	});
}

const kids_line = node => {
	const kids = node.children?.length ?? 0;
	return kids ? " and the " + kids + " page" + (kids === 1 ? "" : "s") + " under it" : "";
};

/* ── WHICH CHILD OPENS FIRST ───────────────────────────────────────────────────
   One flag, `mode.default`, on at most one of a row's siblings. `on` says which way
   this press goes: true makes this the one, false clears it and leaves the parent
   opening on its own content.

   ⚠ A TOP-LEVEL ROW'S "PARENT" IS THE TREE ITSELF, which is an array and not a node
     with a `.children` — the same stand-in `remove_at()` needs, and the same care:
     the new array is handed straight to `apply()` rather than written onto a wrapper
     nothing reads back.

   ⚠ ONLY THE SIBLINGS WHOSE ANSWER CHANGES ARE REWRITTEN, and that is what `marked()`
     below is for: a sibling already answering the way this press wants is handed back
     UNTOUCHED — the same object, so `made.js`, which skips a file whose content has
     not changed, writes nothing for it. One press, one file.

     The writer this replaced did the opposite: it lived in `build/words.js` and stamped
     the flag onto EVERY sibling, so one star press added `"default": false` to the file
     of every page that had never had the key and dirtied `made/archive/page.json`,
     which nobody had touched (self-evident-critique, defect 5). It is deleted; this is
     the only writer of `mode.default` on the site. */
export function default_at(page, path, on = true){
	const tree = clone(page.tree);
	const parent = path.length === 1 ? null : at(tree, path.slice(0, -1));
	const list = parent ? parent.children : tree;

	const i = (list ?? []).findIndex(kid => kid.name === path.at(-1));
	if (i < 0) return page;

	const next = marked(list, i, on);
	if (!parent) return page.apply(next);

	parent.children = next;
	return page.apply(tree);
}

// The same list with at most one flag set — and every sibling whose answer is
// already right handed back UNTOUCHED, so its file is not rewritten.
function marked(list, i, on){
	return list.map((kid, n) => {
		const want = on && n === i;
		if (is_default(kid) === want) return kid;

		const mode = { ...mode_of(kid) };
		if (want) mode.default = true; else delete mode.default;

		return { ...kid, mode };
	});
}

export default tree_pane;
