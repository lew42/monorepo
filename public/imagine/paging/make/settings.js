import { div, p, span, input, textarea, select, option, icon } from "/app.js";
import { press } from "../paging.js";
import { Toolbar } from "../toolbar.js";
import { PIECES, ICONS, new_block, blocks_of } from "../build/words.js";

/* ── THE SETTINGS PANE ─────────────────────────────────────────────────────────

   The right pane: everything the selected page says about itself, in three groups.

       Page     its title, its description and its icon — what it is CALLED
       Words    the realm's seven words, as the same labelled bar every other stage
                in this realm wears
       Blocks   its content, as data

   Every control here writes through `Make.apply()`, the one write seam, and every
   one of them moves the middle on the same frame.

   ⚠ THE SEVEN WORDS ARE THE BAR'S, AND ONLY THE BAR'S. The builder used to keep its
     own Navigation, Content colour and Arrangement controls BESIDE the realm's
     seven-word bar — two controls for one word, on one screen, in the realm whose
     whole rule is one name, one control (paging-audit-6b). What is left here is the
     things only this pane can say.

   ⚠ THE BAR HOLDS THE STAGE. `Toolbar` keeps a reference to the `Stage` it is over,
     so this pane must be rebuilt whenever the middle is — `Make.redraw()` is where
     that is enforced, in one `||`.                                                */

export function settings_pane(page, node, path, stage){

	group("Page", () => {
		field("Title", node.title, value => {
			page.set_at(path, { title: value }, { centre: false, settings: false });
			page.rehead();
		});

		field("Description", node.description ?? "", value =>
			page.set_at(path, { description: value }, { centre: false, settings: false }));

		/* ⚠ A DROPDOWN, BECAUSE IT IS A LIST OF TEN. This was a chip that CYCLED — and
		     an orange chip on this screen already meant "this is the value in force" in
		     one place and "press me to add a block" in another, so one look meant three
		     different things and nobody discovered the other nine icons
		     (self-evident-critique, defect 8). Every closed list of values on this
		     screen is a labelled dropdown now, the shape the seven words already use. */
		/* ⚠ AND ITS VALUES SAY WHAT THE PICTURE IS, not what the font calls it. The
		     list was the raw material-icon names, so the first one read `description`
		     — one line under the field labelled DESCRIPTION, which reads as a broken
		     copy of the field above it, and nobody discovered the other nine
		     (self-evident-critique-2, finding 6). The glyph beside the dropdown is the
		     real answer; these are its name in English. */
		div.c("paging-make-line", () => {
			span.c("muted paging-make-label", "icon");

			const $glyph = icon(node.icon ?? "description");

			choose("icon", ICONS.map(id => ({ id, title: GLYPHS[id] ?? id })), node.icon ?? ICONS[0], id => {
				/* ⚠ NEITHER PANE IS REBUILT. A `<select>` fires `change` while it still
				     has focus, so emptying this pane from inside the handler would delete
				     the control the reader is standing on (`toolbar.js` `sync()` keeps the
				     same rule). The glyph beside it is written in place instead. */
				page.set_at(path, { icon: id }, { centre: false, settings: false });
				$glyph.text(id);
				page.rehead();
			});
		});
	});

	/* THE REALM'S OWN BAR, in a column instead of a row. `size-small` is the
	   framework's size knob: every control inside it is 0.75x, which is what keeps
	   seven labelled dropdowns inside a 26rem pane. */
	group("Words", () => {
		div.c("paging-toolbar-slot size-small", () => { new Toolbar({ stage, page }); });
	});

	/* ⚠ NOTHING IS EXPLAINED HERE ANY MORE. Two sentences said where a block is drawn
	     and that a page with none is still a real page — and the middle already shows
	     both: your blocks, then an eyebrow reading "sample text — the content word
	     (Article) draws this under your blocks" (self-evident-critique-2, finding 5).
	     An empty list says it is empty; the three buttons say what to do about it. */
	group("Blocks", () => {
		const blocks = blocks_of(node);

		blocks.forEach((block, i) => block_row(page, node, path, stage, block, i, blocks));

		if (!blocks.length) p.c("muted paging-make-line-note", "None yet.");

		/* ⚠ ACTS, NOT VALUES. These wore `.paging-chip.on`, the same orange fill the
		     CARDS OF chips use for "this is the value in force" — so the three buttons
		     that ADD something looked like three settings that were already chosen
		     (self-evident-critique, defect 8). */
		div.c("paging-make-adds", () => PIECES.forEach(kind => press(
			span.c("paging-act").attr("title", kind.means).append(() => { icon("add"); span(kind.title); }),
			() => write(page, path, [...blocks, new_block(kind.id)]))));
	});

	return null;
}

// ── the three shapes this pane is made of ────────────────────────────────────

function group(title, build){
	return div.c("paging-make-group", () => {
		span.c("paging-make-group-title", title);
		build();
	});
}

/* ⚠ A TEXT FIELD IS NEVER REBUILT UNDER THE CURSOR. Every `run` below passes
     `{ centre: false, settings: false }`, so typing writes the file and redraws the
     tree and nothing else — the box you are typing in stays exactly where it is. */
function field(label, value, run){
	return div.c("paging-make-field", () => {
		span.c("muted paging-make-label", label);

		const $input = input().attr("type", "text").ac("paging-make-input");
		$input.el.value = value;
		$input.on("input", () => run($input.el.value));
	});
}

/* ── ONE LABELLED DROPDOWN ────────────────────────────────────────────────────
   A closed list of values, in the shape the seven words above it already use: a
   `<select>`, so every value in the list is visible before you choose and the one in
   force is the one it shows. `label` is only the accessible name — the visible label
   is the caller's, beside it in the row.

   ⚠ IT RETURNS THE SELECT, because two of the callers write back into it: the family
     list arrives from a dynamic import, and the icon glyph is redrawn in place. */
function choose(label, values, value, run){
	const $select = select(() => values.forEach(it => option(it.title).attr("value", it.id)))
		.ac("paging-make-select")
		.attr("title", label)
		.attr("aria-label", label)
		.on("change", event => run(event.target.value));

	$select.el.value = value;

	return $select;
}

// ── one block ────────────────────────────────────────────────────────────────
/* ⚠ THE ARROWS STAY HERE. The page TREE lost its up and down buttons because
     dragging says more than they could; a block list is two or three items in a
     26rem column, where a grip and a drop target would be more machinery than the
     thing it moves. Blocks are not draggable yet, and that is the reason. */
function block_row(page, node, path, stage, block, i, blocks){
	const kind = PIECES.find(piece => piece.id === block.type);

	return div.c("paging-make-item", () => {
		div.c("paging-make-item-head", () => {
			icon(kind?.icon ?? "notes");
			span.c("paging-make-item-title", kind?.title ?? block.type);

			act("arrow_upward", "move this block up", () => write(page, path, moved(blocks, i, -1)));
			act("arrow_downward", "move this block down", () => write(page, path, moved(blocks, i, 1)));
			act("close", "remove this block", () => write(page, path, blocks.filter((_, n) => n !== i)), "paging-make-del");
		});

		if (block.type === "prose"){
			const $text = textarea.c("paging-make-text").attr("rows", "3").attr("spellcheck", "false");
			$text.el.value = block.text ?? "";

			/* ⚠ TYPING REDRAWS THE STAGE, NOT THE SCREEN. The middle has to move as you
			     type and this textarea has the cursor in it, so nothing is rebuilt at all:
			     the file is written, and the stage redraws itself in place — which works
			     because its `draw` seam reads the node fresh out of the tree
			     (`make/page.js`, `centre()`), rather than closing over the node this row
			     was built from. */
			$text.on("input", () => {
				write(page, path, edited(blocks, i, { text: $text.el.value }), { tree: false, centre: false, settings: false });
				stage.redraw();
			});

			return;
		}

		if (block.type === "cards"){
			div.c("paging-make-line", () => {
				span.c("muted paging-make-label", "cards of");

				["children", "templates"].forEach(from => press(
					span.c("paging-chip").ac((block.from ?? "children") === from && "on").append(() => span(from)),
					() => write(page, path, edited(blocks, i, { from }))));
			});

			return;
		}

		div.c("paging-make-line", () => {
			span.c("muted paging-make-label", "family");

			/* ⚠ THE FAMILY LIST IS THE TEMPLATES REALM'S, fetched when it is first needed
			     — `families.js` imports the magazine, the blog manifest, the shells and two
			     ux modules, so a screen that never adds a template block never pays for
			     them.
			   ⚠ SO THE DROPDOWN IS BORN HOLDING ONE OPTION — the family this block already
			     has — and grows the other ten when the list lands. Nothing is built after
			     an `await`: `$list.empty(cb)` re-establishes the captor, which is the
			     blessed form (`code` §1). It was a chip that cycled through eleven
			     families looking exactly like a chip that meant "selected"
			     (self-evident-critique, defect 8). */
			const family = block.family ?? "magazine";

			const $list = choose("family", [{ id: family, title: family }], family,
				id => write(page, path, edited(blocks, i, { family: id })));

			import("../templates/families.js").then(({ FAMILIES }) => {
				$list.empty(() => FAMILIES.forEach(it => option(it.title).attr("value", it.name)));
				$list.el.value = family;
			});
		});
	});
}

/* THE TEN ICONS, IN ENGLISH. `ICONS` (`../build/words.js`) is the font's own list of
   ligature names and stays that — the name is what gets written to the file and handed
   to `icon()`. This is only what the dropdown SHOWS. */
const GLYPHS = {
	description: "Page", article: "Article", tab: "Tab", folder: "Folder", star: "Star",
	bolt: "Lightning", science: "Flask", palette: "Palette", map: "Map", code: "Code",
};

const act = (glyph, title, run, extra) =>
	press(span.c("paging-make-act").ac(extra).attr("title", title).append(() => { icon(glyph); }), run);

// ── the three list edits, each one a NEW array ───────────────────────────────
const edited = (blocks, i, change) => blocks.map((block, n) => n === i ? { ...block, ...change } : block);

function moved(blocks, i, delta){
	const next = [...blocks];
	const j = i + delta;
	if (j < 0 || j >= next.length) return next;
	next.splice(j, 0, ...next.splice(i, 1));
	return next;
}

/* ⚠ `blocks` RIDES INSIDE `mode`. `FileStore.file()` writes exactly five top-level
     keys — title, icon, description, `mode`, children — and silently drops anything
     else, so a top-level `blocks` would be drawn on screen and lost on save. */
const write = (page, path, blocks, options) => page.edit_at(path, { blocks }, options);

export default settings_pane;
