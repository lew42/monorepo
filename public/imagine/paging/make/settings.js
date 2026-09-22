import { div, p, span, input, textarea, select, option, icon } from "/app.js";
import { press } from "../paging.js";
import { PagingToolbar } from "../toolbar.js";
import { PIECES, ICONS, new_block, blocks_of } from "../build/words.js";
import { RUN_WORDS, run_word } from "./select.js";

/* ── THE RIGHT PANE: THE SELECTED THING, AND NOTHING ELSE ──────────────────────

   One rule, and every line below is it: **a control that is not about the thing you have
   selected is not on screen.** Click a page and you get the page's rows; click one block
   inside it and the page's rows go away and the block's four arrive; click a run of text
   inside that block and you get the run's three. Select nothing and the pane says so.

   ⚠ IT USED TO SHOW EVERYTHING AT ONCE. Title, description, icon, the seven words, AND
     every block the page had, each with its own four controls — 15 controls on a page with
     no content and 27 on a page with three blocks, every one of them on screen while you
     were changing one word. Measured before this pass, 2026-09-18. The blocks are the
     middle's job now: you click the one you mean.

   ⚠ EVERY CONTROL STILL WRITES THROUGH `Make.apply()`, the one write seam, and every one
     of them moves the middle on the same frame.

   ⚠ A TEXT FIELD IS NEVER REBUILT UNDER THE CURSOR. Everything that types passes
     `{ centre: false, settings: false }`, so a keystroke writes the file and redraws the
     tree and nothing else — the box you are typing in stays exactly where it is.        */

export function settings_pane(page, node, path, stage){
	const sel = page.sel;

	if (!sel) return nothing();

	head(sel);

	if (sel.kind === "page") return page_rows(page, node, path, stage);
	if (sel.kind === "block") return block_rows(page, node, path, stage, sel);

	return element_rows(page, node, path, sel);
}

/* ⚠ ONE SENTENCE, AND IT NAMES THE THREE THINGS YOU CAN CLICK. "Nothing selected" is not
     an instruction; a newcomer looking at an empty pane has to be told where to click and
     what they will get. */
const nothing = () => p.c("muted paging-make-empty", () =>
	span("Select something in the middle — the page, one of its blocks, or a run of text inside a block. Its own controls appear here."));

/* THE SAME WORDS THE BADGE IN THE MIDDLE SAYS, so the thing you clicked and the pane that
   is about it cannot be read as two different things. */
const head = sel => div.c("paging-make-sel-head", () => {
	span.c("paging-make-sel-kind", sel.kind);
	span.c("paging-make-sel-what", sel.what ?? "");
});


// ════ A PAGE ═════════════════════════════════════════════════════════════════
/* Six rows: what it is called (three of them), the realm's seven words as the one bar
   every stage in this realm wears, one way to add content, and the one way to unmake it. */
function page_rows(page, node, path, stage){
	field("Title", node.title, value => {
		page.set_at(path, { title: value }, { centre: false, settings: false });
		page.rehead();
	});

	field("Description", node.description ?? "", value =>
		page.set_at(path, { description: value }, { centre: false, settings: false }));

	/* ⚠ A DROPDOWN, BECAUSE IT IS A LIST OF TEN, and its values say what the PICTURE is
	     rather than what the font calls it — the raw ligature names read as a broken copy
	     of the Description field above (self-evident-critique-2, finding 6). */
	div.c("paging-make-line", () => {
		span.c("muted paging-make-label", "icon");

		const $glyph = icon(node.icon ?? "description");

		choose("icon", ICONS.map(id => ({ id, title: GLYPHS[id] ?? id })), node.icon ?? ICONS[0], id => {
			/* ⚠ NEITHER PANE IS REBUILT. A `<select>` fires `change` while it still has
			     focus, so emptying this pane from inside the handler would delete the
			     control the reader is standing on. The glyph is written in place instead. */
			page.set_at(path, { icon: id }, { centre: false, settings: false });
			$glyph.text(id);
			page.rehead();
		});
	});

	/* THE REALM'S OWN BAR, in a column instead of a row. `size-small` is the framework's
	   size knob: every control inside it is 0.75x, which is what keeps seven labelled
	   dropdowns inside a 26rem pane. */
	div.c("paging-toolbar-slot size-small", () => { new MakeToolbar({ stage, page }); });

	add_row(page, path, node);
	history_row(page, path);
	delete_row(page, path, node);

	return null;
}

/* ── THE PAGE'S OWN HISTORY ────────────────────────────────────────────────────
   A page you made keeps two files beside each other: `page.json` is the page as it is
   NOW, and `page.jsonl` is every edit that got it there, one line each. Pressing Check
   replays the log from nothing and says whether it lands back on the snapshot — the one
   thing the pair exists for, run in front of you rather than described.

   ⚠ A PRESS, NOT AN AUTOMATIC READ, and the reason is a console full of 404s. Asking for
     a file is the only way to know whether it is there, and a page that has no history
     yet answers 404 — which ran on EVERY selection, so simply opening Make put a red line
     in the console for every page you clicked. Checked once, the answer is cached in the
     store, and so is a log this session has written: both are shown with no press at all.

   ⚠ NO DOM AFTER THE AWAIT. The row and the sentence in it are built while this
     function's captor is still open; the answer arrives later and only ever writes TEXT
     into a box that already exists. This framework's oldest trap. */
function history_row(page, path){
	return div.c("paging-make-line", () => {
		span.c("muted paging-make-label", "history");

		const $say = span.c("muted", "page.jsonl beside the file: one line per edit, append only.");

		// Already read or written this session — the answer costs nothing, so it is just shown.
		if (page.made.logs?.has(path.join("/"))) return void verdict(page, path, $say);

		press(span.c("paging-act").attr("title", "replay the log and compare it with page.json")
			.append(() => { icon("history"); span("Check it"); }),
			() => verdict(page, path, $say));
	});
}

// Replay the log, compare, say the answer in one sentence. Three answers, all true.
function verdict(page, path, $say){
	$say.text("reading the log…");

	Promise.resolve(page.made.validate?.(path)).then(answer => {
		if (!answer) return $say.text("This store keeps no history — your edits are in this browser.");
		if (!answer.history) return $say.text("No history yet. Your next edit starts one, in page.jsonl beside the file.");

		const edits = answer.lines + " edit" + (answer.lines === 1 ? "" : "s") + " logged";

		$say.text(answer.matches
			? edits + " — replaying them lands exactly on page.json."
			: edits + " — replaying them does NOT land on page.json. The log and the snapshot disagree.");
	}).catch(() => $say.text("The log could not be read."));
}

/* ⚠ THE BAR'S "CODE" BUTTON IS DROPPED, AND ONLY THAT. It opens a drawer showing the
     `page.js` this page would be — and the "More" button beside it opens the SAME drawer,
     with the code in it, plus the configuration and the link. Two doors to one room, on a
     26rem rail, is one door too many (this realm's own rule: one name, one control). Every
     other method of `PagingToolbar` is untouched, which is the point of a subclass. */
class MakeToolbar extends PagingToolbar {
	code(){ return null; }
}

/* ONE BUTTON, NOT THREE. Adding content used to offer Prose, Card wall and Template side by
   side in the page's own pane — three controls for a choice you can make afterwards, on a
   pane that is supposed to be about the page. So this adds a paragraph (the one nearly
   every page starts with) and SELECTS it; the block's own first row is the three kinds, so
   switching it to a card wall is one more click, in the place the block is. */
const add_row = (page, path, node) => div.c("paging-make-line", () => {
	span.c("muted paging-make-label", "content");

	press(span.c("paging-act").attr("title", "add a block of content to this page")
		.append(() => { icon("add"); span("Add a block"); }),
		() => {
			const blocks = [...blocks_of(node), new_block("prose")];
			page.select_block(path, blocks.length - 1, blocks);
		});
});

/* DELETE ASKS FIRST, IN PLACE, AND IT SAYS WHAT IT IS ABOUT TO TAKE — the page by name,
   and the number of pages under it. One press used to remove a page and its directory with
   nothing said. The `×` on a tree row opens this same question rather than carrying a
   second one of its own (`tree.js`). */
function delete_row(page, path, node){
	if (!page.asking) return div.c("paging-make-line", () => {
		span.c("muted paging-make-label", "delete");

		press(span.c("paging-act paging-act-warn").attr("title", "delete " + node.title)
			.append(() => { icon("delete"); span("Delete this page"); }),
			() => { page.asking = true; page.redraw({ tree: false, centre: false }); });
	});

	return div.c("paging-make-ask", () => {
		p.c("paging-make-ask-title", "Delete " + node.title + kids_line(node) + "?");

		press(span.c("paging-act paging-act-warn").append(() => { icon("delete_forever"); span("Delete it"); }),
			() => { page.asking = false; page.remove_at(path); });

		press(span.c("paging-act").append(() => span("Cancel")),
			() => { page.asking = false; page.redraw({ tree: false, centre: false }); });
	});
}

const kids_line = node => {
	const kids = node.children?.length ?? 0;
	return kids ? " and the " + kids + " page" + (kids === 1 ? "" : "s") + " under it" : "";
};


// ════ A BLOCK ════════════════════════════════════════════════════════════════
/* Three rows and never more: what kind of block it is, the one or two things that kind of
   block can say, and where it sits among the others. Nothing about the page it is in — the
   page is one click away, in the middle. */
function block_rows(page, node, path, stage, sel){
	const blocks = blocks_of(node);
	const block = blocks[sel.at];
	if (!block) return null;

	kind_row(page, path, blocks, sel.at, block);
	own_words(page, path, stage, blocks, sel.at, block);
	place_row(page, path, blocks, sel.at);

	return null;
}

/* WHAT KIND OF BLOCK THIS IS — the three `PIECES`, as three buttons with the one in force
   lit. It is where the page's three "add" buttons went: a block you have already made can
   become any of the three, so offering the choice HERE says the same thing in one place
   instead of two. ⚠ The other keys ride through: switch a prose block to a card wall and
   back and your paragraph is still in it. */
const kind_row = (page, path, blocks, at, block) => div.c("paging-make-line", () => {
	span.c("muted paging-make-label", "kind");

	div.c("paging-make-set", () => PIECES.forEach(piece => press(
		span.c("paging-chip").ac(block.type === piece.id && "on").attr("title", piece.means)
			.append(() => { icon(piece.icon); span(piece.title); }),
		() => write(page, path, edited(blocks, at, { ...new_block(piece.id), ...block, type: piece.id })))));
});

// The one or two things THIS kind of block can say, and nothing a different kind can.
function own_words(page, path, stage, blocks, at, block){
	if (block.type === "prose") return div.c("paging-make-line paging-make-line-tall", () => {
		span.c("muted paging-make-label", "text");

		const $text = textarea.c("paging-make-text").attr("rows", "5").attr("spellcheck", "false");
		$text.el.value = block.text ?? "";

		/* ⚠ TYPING REDRAWS THE STAGE, NOT THE SCREEN. The middle has to move as you type
		     and this textarea has the cursor in it, so nothing is rebuilt at all: the file
		     is written, and the stage redraws itself in place — which works because its
		     `draw` seam reads the node fresh out of the tree (`page.js`, `centre()`). */
		$text.on("input", () => {
			write(page, path, edited(blocks, at, { text: $text.el.value }), { tree: false, centre: false, settings: false });
			stage.redraw();
			page.repaint();
		});
	});

	if (block.type === "cards") return div.c("paging-make-line", () => {
		span.c("muted paging-make-label", "cards of");

		div.c("paging-make-set", () => ["children", "templates"].forEach(from => press(
			span.c("paging-chip").ac((block.from ?? "children") === from && "on").append(() => span(from)),
			() => write(page, path, edited(blocks, at, { from })))));
	});

	return div.c("paging-make-line", () => {
		span.c("muted paging-make-label", "family");

		/* ⚠ THE FAMILY LIST IS THE TEMPLATES REALM'S, fetched when it is first needed —
		     `families.js` imports the magazine, the blog manifest, the shells and two ux
		     modules, so a screen that never opens a template block never pays for them.
		   ⚠ SO THE DROPDOWN IS BORN HOLDING ONE OPTION and grows the other ten when the
		     list lands. Nothing is built after an `await`: `$list.empty(cb)` re-establishes
		     the captor, which is the blessed form (`code` §1). */
		const family = block.family ?? "magazine";

		const $list = choose("family", [{ id: family, title: family }], family,
			id => write(page, path, edited(blocks, at, { family: id })));

		import("../templates/families.js").then(({ FAMILIES }) => {
			$list.empty(() => FAMILIES.forEach(it => option(it.title).attr("value", it.name)));
			$list.el.value = family;
		});
	});
}

/* WHERE IT SITS — up, down, and out of the page altogether. ⚠ The arrows stay buttons: a
   block list is two or three items, where a grip and a drop target would be more machinery
   than the thing it moves (the page TREE is the other story, and it is dragged). */
const place_row = (page, path, blocks, at) => div.c("paging-make-line", () => {
	span.c("muted paging-make-label", "where it sits");

	div.c("paging-make-set", () => {
		act("arrow_upward", at > 0 ? "move this block up" : "it is already first",
			() => page.select_block(path, Math.max(0, at - 1), moved(blocks, at, -1)), at === 0);

		act("arrow_downward", at < blocks.length - 1 ? "move this block down" : "it is already last",
			() => page.select_block(path, Math.min(blocks.length - 1, at + 1), moved(blocks, at, 1)), at === blocks.length - 1);

		act("close", "take this block out of the page",
			() => { page.sel = null; write(page, path, blocks.filter((_, n) => n !== at)); }, false, "paging-make-del");
	});
});


// ════ AN ELEMENT ═════════════════════════════════════════════════════════════
/* A RUN'S OWN THREE WORDS, and nothing about the block or the page it is in. `select.js`
   holds the table (`RUN_WORDS`) and puts the classes on; this only draws the buttons.
   ⚠ They are stored on the BLOCK, keyed by the run's position — so a run keeps its words
     when you type in the paragraph beside it, and loses them if you delete the run above
     it. That is the honest cost of "the data is the markdown"; `doc/decisions.md`. */
function element_rows(page, node, path, sel){
	const blocks = blocks_of(node);
	const block = blocks[sel.at];
	if (!block) return null;

	Object.entries(RUN_WORDS).forEach(([key, names]) => div.c("paging-make-line", () => {
		span.c("muted paging-make-label", key);

		const now = run_word(block, sel.run, key);

		div.c("paging-make-set", () => Object.keys(names).forEach(name => press(
			span.c("paging-chip").ac(now === name && "on").attr("title", key + ": " + name).append(() => span(name)),
			() => {
				const runs = { ...block.runs, [sel.run]: { ...block.runs?.[sel.run], [key]: name } };
				write(page, path, edited(blocks, sel.at, { runs }), { tree: false, settings: false });
			})));
	}));

	return null;
}


// ── the shapes this pane is made of ──────────────────────────────────────────

function field(label, value, run){
	return div.c("paging-make-field", () => {
		span.c("muted paging-make-label", label);

		const $input = input().attr("type", "text").ac("paging-make-input");
		$input.el.value = value;
		$input.on("input", () => run($input.el.value));
	});
}

/* ── ONE LABELLED DROPDOWN ────────────────────────────────────────────────────
   A closed list of values, in the shape the seven words already use: a `<select>`, so
   every value is visible before you choose and the one in force is the one it shows.
   `label` is only the accessible name — the visible label is the caller's, beside it.
   ⚠ IT RETURNS THE SELECT, because two callers write back into it: the family list arrives
     from a dynamic import, and the icon glyph is redrawn in place. */
function choose(label, values, value, run){
	const $select = select(() => values.forEach(it => option(it.title).attr("value", it.id)))
		.ac("paging-make-select")
		.attr("title", label)
		.attr("aria-label", label)
		.on("change", event => run(event.target.value));

	$select.el.value = value;

	return $select;
}

const act = (glyph, title, run, dead, extra) => {
	const $act = span.c("paging-make-act").ac(extra).ac(dead && "paging-make-act-dead").attr("title", title)
		.append(() => { icon(glyph); });

	return dead ? $act : press($act, run);
};

/* THE TEN ICONS, IN ENGLISH. `ICONS` (`../build/words.js`) is the font's own list of
   ligature names and stays that — the name is what gets written to the file and handed to
   `icon()`. This is only what the dropdown SHOWS. */
const GLYPHS = {
	description: "Page", article: "Article", tab: "Tab", folder: "Folder", star: "Star",
	bolt: "Lightning", science: "Flask", palette: "Palette", map: "Map", code: "Code",
};

// ── the two list edits, each one a NEW array ─────────────────────────────────
const edited = (blocks, i, change) => blocks.map((block, n) => n === i ? { ...block, ...change } : block);

function moved(blocks, i, delta){
	const next = [...blocks];
	const j = i + delta;
	if (j < 0 || j >= next.length) return next;
	next.splice(j, 0, ...next.splice(i, 1));
	return next;
}

/* ⚠ `blocks` RIDES INSIDE `mode`. `FileStore.file()` writes exactly five top-level keys —
     title, icon, description, `mode`, children — and silently drops anything else, so a
     top-level `blocks` would be drawn on screen and lost on save. */
const write = (page, path, blocks, options) => page.edit_at(path, { blocks }, options);

export default settings_pane;
