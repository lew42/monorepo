import { div, p, span, icon } from "/app.js";
import { press } from "../paging.js";
import Tree from "/framework/ux/Tree/Tree.js";
import { at, clone } from "./made.js";
import { real_group } from "./real.js";
import { is_default, mode_of } from "../build/words.js";

/* ── THE LEFT PANE ─────────────────────────────────────────────────────────────

   Two lists, and both of them are `ux/Tree`:

       Pages       every page you have made. Click a row and the middle and the right
                   change to it. Drag a row to move it. Fold a row to hide its children.
       Documents   the panel layouts saved in the Panel playground, as links out to it.

   ⚠ THIS USED TO BE 343 LINES OF ITS OWN TREE. Rows, the drag, the three-target drop, the
     descendant guard, the indent — all of it lived here, and `ux/Tree` was then built FROM
     it (`ux/Tree/doc/decisions.md`, 2026-09-17: "Make's model, lifted here so there is one
     of it"). Handing it back is the whole of this file's change, and the tree gained
     folding and a keyboard on the way in. What Make still owns is the only thing that was
     ever Make's: what a move, a star, a `+` and a `×` MEAN to the pages on disk.

   ⚠ NOTHING IN HERE WRITES. Every act below builds a NEW TREE and hands it to
     `Make.apply()`, the one write seam, which redraws the screen and works out the
     smallest set of files that gets there.                                            */

/* ⚠ EVERY PAGE CAN HOLD PAGES, so every row is a drop target — which is already true of
     `Tree.holds()` as long as a node carries a `children` array, and `nodes_for()` below
     always gives one. The subclass exists for the two things a page tree says that a
     generic tree cannot: a row is never a link (clicking it selects the page in the middle
     rather than navigating away from the editor), and the star means "opens first". */
class MakeTree extends Tree {

	// The path of the row that is currently being edited, so a redraw comes back selected.
	render(){
		super.render();
		this.show_picked();
	}

	show_picked(){
		const found = [...this.rows.keys()].find(node => same(node.path, this.picked));
		if (found) this.select(found, false);
		return this;
	}
}

const same = (a, b) => a?.length === b?.length && (a ?? []).every((name, i) => b[i] === name);


/* ── ONE JSON NODE, AS A TREE NODE ─────────────────────────────────────────────
   `ux/Tree` reads five things off a node — `text`, `icon`, `default`, `children`, `href` —
   and carries everything else through untouched. So the PATH rides along on the node, and
   every act below reads it back rather than walking the tree to find out where a row was.
   ⚠ `icon` is a FUNCTION. A bare `icon("star")` at the call site appends itself to whatever
     box is capturing at that moment, which is this array, not the row. */
const nodes_for = (nodes, path = []) => (nodes ?? []).map(node => {
	const here = [...path, node.name];

	return {
		text: node.title,
		icon: () => icon(node.icon ?? "description"),
		default: is_default(node),
		children: nodes_for(node.children, here),
		path: here,
		open: true,
	};
});


/* ── THE PANE ──────────────────────────────────────────────────────────────────
   One heading and one obvious control above each list. The owner, 2026-09-13: *"every
   button, every item, every part - perfectly clear what goes where, what does what, what
   clicks do"*. */
export function tree_pane(page){
	head("Pages", "make a new page at the top level", () => page.add_under([], "New page"));

	const nodes = nodes_for(page.tree ?? []);

	if (!nodes.length) p.c("muted", "No pages yet. Press “New page” and it appears here.");
	else pages_tree(page, nodes);

	/* The one line this pane gets, and it is the one thing the PICTURE cannot say: a grip
	   is a gesture, and a gesture has no visible state to read. */
	p.c("muted paging-make-line-note", "Drag a row by its grip: onto the edge of another to sit beside it, onto the middle to go inside it.");

	/* ⚠ A THIRD GROUP, AND ONLY WHEN ASKED FOR. `?real=<url>` puts a REAL subtree — plain
	     directories with `page.js` files, the shape every page on this site has — beside
	     the pages Make owns, and a drag there moves the directory on disk. Without the
	     query this draws nothing and the pane is exactly what it was. `real.js`. */
	real_group(page);

	documents(page);

	return null;
}

function pages_tree(page, nodes){
	return new MakeTree({
		nodes,
		picked: page.picked,
		drag: true,
		acts: "default add remove",
		classes: "ui-tree paging-make-tree",

		// Clicking a row IS selecting the page — the middle draws it and the right pane
		// fills with its rows. One gesture, three panes, and they cannot disagree.
		onSelect: node => page.pick(node.path),

		/* A DROP. `ux/Tree` reports where the row landed — inside `into`, at `index`
		   counted WITHOUT the dragged row — and `Make.move_to()` wants the path it should
		   land before. One line converts between them, and it is the same edge model Make
		   had before: this is where it came from. */
		onMove: ({ node, into, index }) => {
			const kids = (into ? into.children : nodes).filter(kid => kid !== node);
			const before = kids[index] ?? null;

			return page.move_to(node.path, into?.path ?? [], before?.path ?? null);
		},

		onAct: (name, node) => {
			if (name === "default") return default_at(page, node.path, !node.default);
			if (name === "add") return page.add_under(node.path, "New page");

			/* ⚠ × ASKS, AND IT ASKS IN THE ONE PLACE THAT ASKS. One press used to remove
			     the page and its directory with nothing said; the question then lived in
			     the row itself, which is not a shape `ux/Tree` has. So × SELECTS the page
			     and turns the right pane's Delete row into its question, naming the page
			     and counting the pages under it. One destroyer, one place, two doors to
			     it — and the row you pressed is the page the question is about. */
			return page.ask_delete(node.path);
		},
	});
}

/* ── THE PANEL DOCUMENTS ───────────────────────────────────────────────────────
   The Panel playground used to keep its own rail of saved documents beside its workspace
   — a second list of things-you-made, in a second place, with its own `+`. It is this
   group now, and the playground is the editor those rows open (`../../../framework/ext/
   Panel/playground/`). doc/decisions.md.

   ⚠ A LAZY IMPORT, and not caution: `documents.js` imports `Panel.js`, which is the whole
     panel machine — a screen that never looks at a layout should not pay for it. Nothing
     is built after the await; `$box.empty(cb)` re-establishes the captor. */
function documents(page){
	head("Documents", "make a new panel layout", () => make_document(page));

	return div.c("paging-make-docs", $box => {
		$box.append(() => { p.c("muted", "Looking for the layouts…"); });

		import("/framework/ext/Panel/Workspace/documents.js")
			.then(({ list }) => list())
			.then(names => $box.empty(() => new Tree({
				nodes: names.map(name => ({
					text: name,
					icon: () => icon("dashboard"),
					href: "/framework/ext/Panel/playground/" + name + "/",
				})),
			})))
			.catch(() => $box.empty(() => { p.c("muted", "The panel layouts did not load. They live in the playground."); }));
	});
}

const make_document = async page => {
	const { create } = await import("/framework/ext/Panel/Workspace/documents.js");
	page.app?.router?.go("/framework/ext/Panel/playground/" + await create() + "/");
};

/* ⚠ AN ACT, NOT A VALUE. This wore `.paging-chip.on` — pixel-identical to the chips in the
     right pane where the orange fill means "this is the value in force", so one look meant
     three things on one screen (self-evident-critique, defect 8). */
const head = (title, said, run) => div.c("paging-make-pane-head", () => {
	span.c("paging-make-group-title", title);

	press(span.c("paging-act").attr("title", said).append(() => { icon("add"); span("New"); }), run);
});


/* ── WHICH CHILD OPENS FIRST ───────────────────────────────────────────────────
   One flag, `mode.default`, on at most one of a row's siblings. `on` says which way this
   press goes: true makes this the one, false clears it and leaves the parent opening on
   its own content.

   ⚠ A TOP-LEVEL ROW'S "PARENT" IS THE TREE ITSELF, which is an array and not a node with
     a `.children` — the same stand-in `remove_at()` needs, and the same care: the new
     array is handed straight to `apply()` rather than written onto a wrapper nothing
     reads back.

   ⚠ ONLY THE SIBLINGS WHOSE ANSWER CHANGES ARE REWRITTEN, and that is what `marked()`
     below is for: a sibling already answering the way this press wants is handed back
     UNTOUCHED — the same object, so `made.js`, which skips a file whose content has not
     changed, writes nothing for it. One press, one file. The writer this replaced stamped
     the flag onto EVERY sibling and dirtied pages nobody had touched
     (self-evident-critique, defect 5). This is the only writer of `mode.default`. */
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

// The same list with at most one flag set — and every sibling whose answer is already
// right handed back UNTOUCHED, so its file is not rewritten.
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
