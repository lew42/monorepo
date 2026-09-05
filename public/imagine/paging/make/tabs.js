import { div, p, h3, span, a, input, icon } from "/app.js";
import { press } from "../paging.js";
import { DEFAULT, CONTENT, SURFACES, nav_of } from "../blocks.js";
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

   A `page.json` written before 2026-09-05 says `style` / `content` / `mech` / `kids`;
   one written after says the realm's seven words (`../blocks.js`). This function is
   the ONE place that knows both, and everything else in Make reads a node through it.

   ⚠ WHY IT MATTERS. Make's row chips wrote `style`/`mech`/`kids` while the drawer on
     the same page wrote the seven words — and the reader below preferred the seven,
     so clicking a chip in Make changed a key nothing on screen was reading and the
     page did not move (paging-audit-2b, Q3, "two schemas into one store"). One
     schema, and the old words migrate on the way in. */
export function config_of(node){
	const mode = node?.mode ?? {};

	// Already the new words: nothing to translate.
	if (mode.navigation) return { ...DEFAULT, ...pick(mode) };

	const navigation = mode.kids === "tabs" ? "tabs"
		: mode.kids === "rail" || mode.kids === "rail-right" ? mode.kids
		: mode.mech === "swap" ? "tabs"
		: mode.mech === "expand" ? "rail"
		: mode.mech === "takeover" ? "takeover"
		: "columns";

	return {
		...DEFAULT,
		navigation,
		content: has(CONTENT, mode.content) ? mode.content : DEFAULT.content,
		surface: has(SURFACES, mode.style) ? mode.style : DEFAULT.surface,
		background: "tint",
	};
}

// Only the seven words, so an old key riding inside `mode` never reaches the stage.
const pick = mode => Object.fromEntries(Object.keys(DEFAULT).map(key => [key, mode[key]]).filter(([, value]) => value != null));

const has = (list, id) => list.some(entry => entry.id === id);

// How this node draws its children — the one word `tabs_items()` and the "+ tab"
// button ask about. `nav_of()` is the realm's own lookup, so there is no second list.
export const kids_of = node => (nav_of(config_of(node).navigation).id === "tabs" ? "tabs" : "columns");

/* ── THE PAGE SIDE: children drawn as a tab strip ─────────────────────────────
   Replaces `Paging.items()` on a made page whose `kids` is `tabs`. The strip and
   its panel are the realm's own bounded set (`paging.css`) — one box, the selected
   tab joined to it — so the reader can point at the rectangle that is about to
   change before they click. */
export function tabs_items(page){
	const kids = [...page.children].filter(([, child]) => child);

	if (!kids.length) return p.c("muted", "This page shows its children as tabs, and it has none yet. Add one with the “+ tab” button on its row in Make.");

	// A tab that was removed must not leave the panel pointing past the end.
	page.tab_n = Math.min(page.tab_n ?? 0, kids.length - 1);

	return div.c("paging-tabs paging-make-tabs", () => {
		const $bar = div.c("paging-tab-bar");
		const $panel = div.c("paging-tab-panel");

		const show = i => {
			page.tab_n = i;
			$bar.el.querySelectorAll(".paging-tab").forEach((el, n) => el.classList.toggle("on", n === i));
			$panel.empty(() => { tab_panel(kids[i][1]); });
		};

		$bar.append(() => kids.forEach(([, child], i) =>
			press(span.c("paging-tab", child.title).ac(i === page.tab_n && "on"), () => show(i))));

		$panel.append(() => { tab_panel(kids[page.tab_n][1]); });
	});
}

// One tab's panel: the child, and the way to it as a real page.
function tab_panel(child){
	h3(child.title);
	p(child.description ?? "A page you made.");
	a.c("paging-panel-link", () => { span("open it as a column instead — this is where the url changes"); icon("chevron_right"); }).href(child.url);
}

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

		act("close", "delete " + node.title, () => page.remove_at(path), "paging-make-del");
	});
}

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

export default tabs_items;
