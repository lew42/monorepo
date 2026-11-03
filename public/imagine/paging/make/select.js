import { View, span, icon } from "/app.js";

/* ⚠ PANEL'S SHEET, LOADED FROM HERE. The ring this file puts on is `.panel-ring`, and that
     rule lives in `ext/Panel/focus.css` — which nothing on this page imports, because Make
     imports no part of ext/Panel's machinery. A class whose rule is not loaded paints
     nothing and throws nothing: the outline was simply invisible and the name badge, having
     no positioned box to sit against, jumped to the top of the whole middle pane (measured
     2026-09-18, first headless run). One line, and the two editors draw one outline.
   ⚠ `View.stylesheet()` is keyed by href, so loading it here as well as in `focus.js` costs
     nothing on a page that has both. */

View.stylesheet(import.meta, "/framework/ext/Panel/focus.css");

/* ── ONE SELECTION, FOR THE WHOLE EDITOR ───────────────────────────────────────

   You click a thing in the middle pane and that thing — and only that thing — gets one
   outline and one name badge. The tree row for the page you are in lights up. The right
   pane empties and refills with the few controls that thing can take, and nothing else.

   There are exactly three things you can select:

       page       the page in the middle, as a whole
       block      one of the blocks it is made of - a paragraph, a card wall, a template
       element    one run inside a block - a heading, a paragraph, one card

   ⚠ THE EVENT IS `ext/Panel`'s, NOT A NEW ONE. `panel-focus` is a document event carrying
     the selected thing or `null`, and it already existed: ext/Panel announces its panel
     selection on it and its right rail listens. One contract, two editors, and neither
     imports the other — `ext/Panel/doc/focus.md` is the record. The RING is Panel's too:
     `.panel-ring` in `ext/Panel/focus.css` is the one declaration that draws a selection
     outline on this site, and this file only puts the class on.

   ⚠ WHY A CLASS AND NOT A PLAIN OBJECT. `is_same()` below is asked on every click, and a
     `kind`/`path`/`at`/`run` comparison written at each call site is four chances to get
     it wrong. One method, one answer.                                                  */

export class Pick {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/* THE NAME ON THE BADGE, and the same words the right pane puts at its top — so the
	   thing you clicked and the thing the pane is about say the same name in two places.
	   `what` is the kind's own word (a block says "Prose", an element says "heading"). */
	label(){ return this.kind + " · " + (this.what ?? ""); }

	is_same(other){
		return !!other
			&& other.kind === this.kind
			&& other.at === this.at
			&& other.run === this.run
			&& same_path(other.path, this.path);
	}
}

export const same_path = (a, b) => (a ?? []).length === (b ?? []).length && (a ?? []).every((n, i) => b[i] === n);


/* ── WHAT A CLICK IN THE MIDDLE SELECTS ────────────────────────────────────────

   Four answers, in this order, and the order is the whole rule:

     1  a control            nothing. A link, a button, a tab inside the drawn page keeps
                             working; clicking it is using the page, not editing it.
     2  a run inside the
        block already picked the run — the SECOND click inside one block goes one level in
     3  a block              the block
     4  anything else in
        the middle           the page

   ⚠ TWO CLICKS TO REACH A RUN, and that is deliberate. A prose block is covered edge to
     edge by its own paragraphs, so "the innermost thing under the pointer" would mean the
     block itself could never be clicked. `ext/Panel` solved the same problem the same way
     and calls it drilling (`ext/Panel/focus.js` `drill()`): the first click opens the
     door, the next one steps through it.                                                */

const CONTROLS = "a, button, select, input, textarea, summary, [role=button], [contenteditable]";

export function pick_at(el, node, current, path){
	if (!el || el.closest(CONTROLS)) return undefined;              // ⚠ undefined = "leave it alone"

	const $block = el.closest(".build-block");
	if (!$block) return new Pick({ kind: "page", path, what: node.title });

	/* WHICH BLOCK IT IS — its position among the blocks the page drew, which is the same
	   order `mode.blocks` is in (`build/draw.js` draws them in order and nothing reorders
	   them on the way). ⚠ Asked of the BLOCKS, not of the element's siblings: `.build-blocks`
	   holds only blocks today, and a wrapper added to it later would silently shift every
	   stored index by one. */
	const at = [...$block.parentElement.querySelectorAll(":scope > .build-block")].indexOf($block);
	const block = (node.mode?.blocks ?? [])[at];
	if (!block) return new Pick({ kind: "page", path, what: node.title });

	const inside = current?.kind !== "page" && current?.at === at && same_path(current?.path, path);
	const runs = inside ? runs_of($block) : [];
	const run = runs.findIndex($run => $run === el || $run.contains(el));

	if (run >= 0) return new Pick({
		kind: "element", path, at, run,
		what: runs[run].classList.contains("md") ? "paragraph" : runs[run].tagName.toLowerCase(),
	});

	return new Pick({ kind: "block", path, at, what: block.type });
}

/* THE RUNS OF A BLOCK — the things inside it you can select ONE of. A prose block's runs
   are the paragraphs, headings and lists markdown made; a card wall's are its cards; a
   template draws somebody else's module and has no inside at all.

   ⚠ BLOCK-LEVEL CHILDREN ONLY, AND IT IS NOT FUSSINESS. `md()` UNWRAPS a lone paragraph,
     so a one-paragraph block's `.md` holds `<strong>`, bare text and `<code>` as its direct
     children — and the first headless run of this feature selected a `<strong>` and offered
     it an ALIGN row, which does nothing at all to an inline box (measured 2026-09-18). When
     there is no block-level child, the run is the `.md` itself: one paragraph, one run,
     which is what a reader means by "this paragraph".

   ⚠ `:scope >` — only the block's OWN children count. A card holds an icon, a title and a
     line of prose, and without this, clicking a card's title would select the title.

   ⚠ A RUN IS ITS POSITION IN THIS LIST, never its position in the DOM. The two differ the
     moment the `.md` fallback above is the answer, and the stored word is keyed by it. */
const BLOCKISH = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "PRE", "TABLE", "FIGURE", "HR", "DIV"];

export function runs_of($block){
	const $md = $block.querySelector(":scope > .md");

	if ($md){
		const kids = [...$md.children].filter(el => BLOCKISH.includes(el.tagName));
		return kids.length ? kids : [$md];
	}

	return [...$block.querySelectorAll(":scope > .build-card-item")];
}


/* ── THE OUTLINE AND THE BADGE ─────────────────────────────────────────────────
   One of each on the page, ever. `paint()` is the only writer of both, so a stale ring
   left behind by a redraw is not a state this can be in.

   ⚠ THE BADGE IS A SIBLING OF NOTHING — it goes INSIDE the outlined element, absolutely
     positioned at its top-left corner. Put outside, it would need a wrapper around every
     selectable thing in a page drawn by somebody else's renderer. */
export function paint($middle, sel){
	if (!$middle) return null;

	$middle.el.querySelectorAll(".panel-ring").forEach(el => el.classList.remove("panel-ring"));
	$middle.el.querySelectorAll(".paging-make-badge").forEach(el => el.remove());

	const el = element_for($middle, sel);
	if (!el) return null;

	el.classList.add("panel-ring");
	el.append(badge(sel).el);

	return el;
}

/* WHERE THE SELECTION IS ON SCREEN, found fresh every time. Nothing stores an element:
   the middle is thrown away and rebuilt on most edits, and a stored node would be a
   pointer into a DOM that is no longer in the document. */
export function element_for($middle, sel){
	if (!$middle || !sel) return null;

	const $live = $middle.el.querySelector(".paging-make-live") ?? $middle.el;
	if (sel.kind === "page") return $live;

	const $block = $live.querySelectorAll(".build-block")[sel.at];
	if (!$block) return null;
	if (sel.kind === "block") return $block;

	return runs_of($block)[sel.run] ?? null;
}

const badge = sel => span.c("paging-make-badge").append(() => {
	icon(GLYPH[sel.kind]);
	span(sel.label());
});

const GLYPH = { page: "description", block: "widgets", element: "text_fields" };


/* ── AN ELEMENT'S OWN THREE WORDS, PUT ON THE ELEMENT ──────────────────────────

   A run can say three things about itself and nothing else: its TONE (plain or muted),
   its SIZE (small, regular, large) and its ALIGN (left, centre, right). They are stored
   on the block that holds the run, under `runs`, keyed by the run's position:

       { "type": "prose", "text": "…", "runs": { "0": { "size": "large" } } }

   ⚠ WORDS IN, CLASSES OUT — and the class is the framework's own wherever there is one.
     `muted` is framework.css's utility; the other four are `make.css`'s, because there is
     no type-size or text-align utility on this site and inventing one is not this task's
     to do (`doc/decisions.md`).

   ⚠ IT RUNS ON BOTH DRAWINGS. The middle pane in Make and the page at its own url are
     drawn by two different calls in `page.js` — and both call this, which is why a word
     you set in the sidebar is on the real page too. A `page.json` opened by some OTHER
     reader (`?nest=`, which goes through core's `Page.from()`) does not pass through here
     and shows the run undressed; `doc/decisions.md` records that gap.                 */

export const RUN_WORDS = {
	tone:  { plain: "", muted: "muted" },
	size:  { small: "paging-make-run-sm", regular: "", large: "paging-make-run-lg" },
	align: { left: "", center: "paging-make-run-center", right: "paging-make-run-right" },
};

export const run_word = (block, run, key) =>
	block?.runs?.[run]?.[key] ?? Object.keys(RUN_WORDS[key])[key === "size" ? 1 : 0];

export function dress($box, node){
	if (!$box) return null;

	const blocks = node?.mode?.blocks ?? [];

	$box.querySelectorAll(":scope .build-block").forEach(($block, at) => {
		const runs = blocks[at]?.runs;
		if (!runs) return;

		runs_of($block).forEach(($run, i) => {
			const said = runs[i];
			if (!said) return;

			Object.entries(RUN_WORDS).forEach(([key, classes]) => {
				const name = classes[said[key]];
				if (name) $run.classList.add(name);
			});
		});
	});

	return $box;
}


/* ── THE DOCUMENT EVENT ────────────────────────────────────────────────────────
   Announced on every selection AND on every re-selection of the same thing, for the
   reason `ext/Panel/focus.js` records: a surface that redraws itself on any click needs
   the announcement to repair what it just threw away. */
export const announce = sel => document.dispatchEvent(new CustomEvent("panel-focus", { detail: sel ?? null }));

/* CLICKING OFF. Anything that is not one of the editor's own three panes means "nothing,
   please" — the same rule and the same capture phase `ext/Panel` uses, for the same
   reason: a control that redraws its own pane has detached the clicked button by the time
   a bubbling listener runs, and `closest()` on a detached node reads as a click outside. */
const OFF = ".paging-make-panes, .drawer, .dev-bar, dialog, [popover]";

export function clicking_off(run){
	const hear = e => { if (!e.target.closest?.(OFF)) run(); };
	document.addEventListener("click", hear, true);
	return () => document.removeEventListener("click", hear, true);
}

export function escaping(run){
	const hear = e => { if (e.key === "Escape") run(); };
	document.addEventListener("keydown", hear);
	return () => document.removeEventListener("keydown", hear);
}
