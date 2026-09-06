import { div, span, input, icon } from "/app.js";
import { press } from "../paging.js";
import { config_of, nav_of } from "../blocks.js";
import { at, clone } from "./made.js";

/* ── TABS ON A PAGE YOU MADE ───────────────────────────────────────────────────
   The owner's two questions: *"what's the ux for adding tabs to a page? what's the
   ux for configuring tabs?"*

   The answer here is that **a tab is not a new kind of thing.** A tab is a CHILD
   PAGE, drawn as a tab instead of as a row you launch — so adding a tab is adding a
   child, renaming a tab is renaming that child, and reordering the tabs is
   reordering the parent's `children` list. One word on the parent decides which of
   the two presentations its children get:

     columns   a click opens the child as a column of the row, and the url changes
     tabs      a click shows the child in the panel below the strip, and it does not

   That word is `navigation`, it lives in the parent's own `page.json` beside the six
   others, and every control writes it through `Make`'s ONE write seam (`apply()` →
   `made.save()`) — this file owns no storage of its own and never touches a file.
   `../doc/persistence.md` is where the pages actually go.

   ⚠ TABS DO NOT ROUTE, and the panel says so out loud with a link to the column.
     That is the same honesty the mechanisms pages keep: `swap` (which is what a tab
     strip is) has no url, so a tab cannot be linked to or reached with the Back
     button. If a child deserves an address, present it as a column.               */

/* ── ONE SCHEMA FOR A MADE PAGE ────────────────────────────────────────────────

   `config_of()` reads a saved page's seven words, and it lives in `../blocks.js` with
   the words themselves — Make read it through a copy here, Build did not read it at
   all, and that is how the realm ended up with two editors writing two vocabularies
   into one file (paging-audit-3b). One reader, one file, re-exported here because
   this is where Make's own code reaches for it. */
export { config_of };

// How this node draws its children — the one word the "+ tab" button asks about.
// `nav_of()` is the realm's own lookup, so there is no second list.
export const kids_of = node => (nav_of(config_of(node).navigation).id === "tabs" ? "tabs" : "columns");

/* ── THE MAKE SIDE: the controls on a row ─────────────────────────────────────
   Rename · move up · move down · add (a tab, or a child page) · delete. Every one
   of them builds a NEW TREE and hands it to `Make.apply()`, which works out the
   files. Nothing here writes. */
export function row_acts(page, node, path, kids, $row){
	return div.c("paging-make-acts", () => {
		rename_act(page, node, path, $row);

		act("arrow_upward", "move " + node.title + " up", () => move_at(page, path, -1));
		act("arrow_downward", "move " + node.title + " down", () => move_at(page, path, 1));

		// THE "+ TAB" CONTROL. Same button, same call — a child under a `tabs` parent
		// IS a tab, so the LABEL is the only thing that changes, and it changes because
		// the reader is about to get a tab rather than a column.
		press(span.c("paging-chip paging-make-add").attr("title", "add a " + (kids === "tabs" ? "tab" : "child page") + " under " + node.title)
			.append(() => { icon("add"); span(kids === "tabs" ? "tab" : "page"); }),
			() => page.add_under(path, kids === "tabs" ? "New tab" : "New page"));

		delete_act(page, node, path, $row);
	});
}

/* DELETE — the row becomes the question, in place, exactly as rename does.

   ⚠ IT ASKS FIRST, and it says WHAT IT IS ABOUT TO TAKE. One press used to remove the
     page and its directory with nothing said, and the only clue that a delete existed at
     all was a bare `×` glyph among five others — a newcomer walked the whole realm and
     reported that a page you make can never be unmade (paging-audit-7). The question
     names the page and counts the pages under it, so nobody loses a tree by a mis-click.
   ⚠ AND IT DELETES THE FILE. `remove_at()` → `apply()` → `made.save(next, was)`, which
     `rm`s the directory and rewrites the parent's file without the name — both halves in
     one write, so nothing is left naming a page that is not there. */
function delete_act(page, node, path, $row){
	return act("close", "delete " + node.title, () => $row.empty(() => {
		icon("delete");
		span.c("paging-make-title", "Delete " + node.title + kids_line(node) + "?");

		// The same second press the drawer's own delete has, so one gesture is one shape.
		press(span.c("paging-act paging-act-warn").append(() => { icon("delete_forever"); span("Delete it"); }),
			() => page.remove_at(path));

		press(span.c("paging-chip", "Cancel"), () => page.redraw());
	}), "paging-make-del");
}

const kids_line = node => {
	const kids = node.children?.length ?? 0;
	return kids ? " and the " + kids + " page" + (kids === 1 ? "" : "s") + " under it" : "";
};

const act = (glyph, title, run, extra) =>
	press(span.c("paging-make-act").ac(extra).attr("title", title).append(() => icon(glyph)), run);

/* RENAME — the row becomes an input, in place. ⚠ A rename changes the TITLE and not
   the directory name: the file is `made/notes/page.json` whatever the page is
   called, so renaming never moves a file and a url a reader saved keeps working.
   That is a deliberate trade and it is written in the doc. */
function rename_act(page, node, path, $row){
	return act("edit", "rename " + node.title, () => $row.empty(() => {
		const $name = input().attr("type", "text").ac("paging-make-name");
		$name.el.value = node.title;

		const done = () => {
			const title = ($name.el.value || "").trim();
			return title && title !== node.title ? rename_at(page, path, title) : page.redraw();
		};

		$name.on("keydown", event => {
			if (event.key === "Enter"){ event.preventDefault(); done(); }
			if (event.key === "Escape") page.redraw();
		});

		press(span.c("paging-chip on").append(() => { icon("check"); span("Rename"); }), done);
		press(span.c("paging-chip", "Cancel"), () => page.redraw());

		$name.el.focus();
		$name.el.select();
	}));
}

export function rename_at(page, path, title){
	const tree = clone(page.tree);
	const node = at(tree, path);
	if (!node) return page;

	node.title = title;
	return page.apply(tree);
}

/* REORDER — one step among siblings. ⚠ `at(tree, [])` answers `{ children: tree }`,
   so the SAME two lines move a top-level page and a nested one; there is no special
   case for the root, and the array being spliced is the one `apply()` will write. */
export function move_at(page, path, delta){
	const tree = clone(page.tree);
	const list = at(tree, path.slice(0, -1))?.children;
	if (!list) return page;

	const i = list.findIndex(kid => kid.name === path.at(-1));
	const j = i + delta;
	if (i < 0 || j < 0 || j >= list.length) return page;

	list.splice(j, 0, ...list.splice(i, 1));
	return page.apply(tree);
}

export default row_acts;
