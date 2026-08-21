import View, { div, span, button } from "/framework/core/View/View.js";
import { glyph } from "./glyphs.js";
import { level_of, FIELDS, tracked, record, box, fresh, text_observe } from "./persist.js";

/* Text inside a panel body, made selectable, stylable and typed on directly. `text_layers`
   marks what's pointable with ONE delegated listener — a body can hold hundreds of text
   nodes, and a listener per one of them does not scale, and survives every redraw
   `paint()` does since `$body` itself is never recreated, only emptied.
   `text_fields($el)` draws the controls for whichever one is selected — something
   outside this file listens for `panel-text` and calls it, the shape `tools.js`
   already uses for `panel-focus`.

   Every edit here mutates a drawing the TEMPLATE owns, and `paint()` throws that drawing
   away on every tone, template and mirror change — `persist.js` underneath is what writes
   each edit down as an overlay on `panel.data.text` and replays it once the redraw has
   landed. One direction only: this file calls into `persist.js`, never the reverse.
   css: .panel-text-hot, .panel-text-on — plus `.panel-text-box`/`.panel-text-new`, drawn by
   persist.js and styled here.

   The SAME click delegation also carries item selection (2026-08-19) — a cell one level up
   from a run, on a flex/grid body only; `.panel-item-on` lives in display.css beside the
   custom properties it rings, not here, since it is that file's word. doc/focus.md. */
View.stylesheet(import.meta, "text.css");

export const TEXT = { on: true };

const SELECTOR = "p, h1, h2, h3, h4, h5, h6, li, blockquote, span.h1, span.h2, span.h3, span.h4";

const viewed = el => el && new View({ el, capture: false });

let hot, selected;

const mark = el => { hot?.rc("panel-text-hot"); hot = viewed(el); hot?.ac("panel-text-hot"); };
const announce = $el => document.dispatchEvent(new CustomEvent("panel-text", { detail: $el ?? null }));
const select = el => { selected?.rc("panel-text-on"); selected = viewed(el); selected?.ac("panel-text-on"); gauge(el); announce(selected); };

/* ⚠ A run is deselected by clicking it again — and by nothing else, which is why the
   "body · 57ch" gauge outlived its panel (the owner, 2026-08-19): focus a DIFFERENT panel
   and the rail moved on while the chip and the `.panel-text-on` ring stayed on the old
   run. The selection moving anywhere this run is not — another panel, or to nothing —
   clears it here, the one place that owns it. Bound once, at module scope, like the
   `t` key below; `panel-focus` carries the item, and the run knows its panel by DOM. */
document.addEventListener("panel-focus", () => {
	if (selected && !selected.el.closest(".panel")?.matches(".focus")) select(null);
	if (item_selected && !item_selected.el.closest(".panel")?.matches(".focus")) select_item(null, item_selected.panel);
});
document.addEventListener("panel-unfocus", () => {
	if (selected) select(null);
	if (item_selected) select_item(null, item_selected.panel);
});

/* A cell inside a flex/grid body's item selection — a run's shape one level up (a DIRECT
   CHILD of the body, never a subtree), riding beside `selected` rather than replacing it:
   the two can never both be showing, since a click that reaches a cell has already failed
   `SELECTOR` and cannot be a run. `panel` is the LEAF, kept on the record because the module
   scope here has no closure over it the way `panel-focus`'s clearer needs one.
   ⚠ `panel-item` — the redraw signal `tools.js` mirrors `panel-text` with — carries the
   PANEL, not the cell: the rail already knows which cell from `item_selection()` below. */
let item_selected;

const select_item = (el, panel, key) => {
	item_selected?.el.classList.remove("panel-item-on");
	item_selected = el ? { el, panel, key } : null;
	el?.classList.add("panel-item-on");
	document.dispatchEvent(new CustomEvent("panel-item", { detail: panel }));
};

/* `properties.js`'s one door onto this state. Self-healing: a template redraw (a `paint()`
   any OTHER word triggers) destroys the cell but not this reference — the words it wrote
   survive (`items_apply` replays them by key), only the DOM node and the rail's hold on it
   do not, so a stale read clears itself rather than the rail showing a ghost selection. */
export const item_selection = () => {
	if (item_selected && !item_selected.el.isConnected) item_selected = null;
	return item_selected;
};

/* Escape steps the selection back ONE level — an item to its leaf — before it ever reaches
   focus.js's own Escape, which steps the LEAF out and knows nothing about a cell. Safe only
   because this listener is bound at MODULE load, and focus.js's is bound per `mount()`,
   always later: registration order is delivery order for two listeners on one element. */
document.addEventListener("keydown", e => {
	if (e.key !== "Escape" || !item_selected) return;
	e.stopImmediatePropagation();
	select_item(null, item_selected.panel);
});

/* The in-place overlay: what this run IS and how long its line runs, on the thing itself.
   Those are the two facts you cannot get by looking — a heading and a bold paragraph are
   the same picture, and MEASURE is the one number typography actually has a rule about
   (roughly 45–75 characters; outside that, reading slows). Everything else a rail can say.

   ⚠ ONE element for the whole document, positioned `fixed` and reused. A badge appended
   inside a panel body would be inside the thing it measures — it would change the width it
   is reporting, and `paint()` would throw it away on the next redraw. */
let $gauge, ruler;

function gauge(el){
	$gauge ??= document.body.appendChild(Object.assign(document.createElement("div"), { className: "panel-text-gauge" }));

	if (!el) return void $gauge.classList.remove("on");

	const box = el.getBoundingClientRect();
	const css = getComputedStyle(el);

	// A `ch` is the width of "0" in the element's own font — measured, never guessed from
	// font-size, which is wrong by a third on any condensed or wide face.
	ruler ??= document.createElement("canvas").getContext("2d");
	ruler.font = `${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
	const ch = Math.round(box.width / (ruler.measureText("0").width || 1));

	/* ⚠ A measure only means something once the text WRAPS. Judged on every run, the rule
	   flags every label and heading on the page — "SHIPPED" is 11ch and there is nothing
	   wrong with it — and a warning that fires on correct work is one you learn to ignore. */
	const leading = parseFloat(css.lineHeight) || parseFloat(css.fontSize) * 1.4;
	const lines = Math.max(1, Math.round(box.height / leading));

	$gauge.textContent = `${level_of(viewed(el))} · ${ch}ch` + (lines > 1 ? ` × ${lines}` : "");
	$gauge.classList.toggle("wide", lines > 1 && ch > 75);
	$gauge.classList.toggle("narrow", lines > 1 && ch < 45);
	$gauge.classList.add("on");
	// ⚠ Clamped like the top edge below — an element near the right edge would otherwise
	// push the badge's own width straight past `innerWidth`.
	$gauge.style.insetInlineStart = Math.max(0, Math.min(box.left, innerWidth - $gauge.offsetWidth)) + "px";
	$gauge.style.insetBlockStart = Math.max(0, box.top - 22) + "px";
}

// Bounds `closest()` to the body — unbounded, a click on the outermost text node
// would walk past it to whatever real heading wraps the panel itself.
const inside = (root, el) => el && root.contains(el) ? el : null;

export function text_layers($body, item){
	const root = $body.el;
	const dispose = text_observe($body, item);

	root.addEventListener("mouseover", e => mark(inside(root, e.target.closest(SELECTOR))));
	root.addEventListener("mouseleave", () => mark(null));

	/* The panel first, its text second (2026-08-19, the owner: "sometimes, when clicking a
	   panel, it doesn't select… a second click works"). A run stole EVERY click on text —
	   most of a content panel's face — so the panel never focused and the rail showed a
	   chip instead. Now a click on text in a panel that is not yet focused is left alone:
	   it bubbles to `view()`'s own `.click()` (workspace.js), which focuses the panel (or
	   its group — focus.js's `drill()`); only inside the ALREADY focused panel does a click
	   pick the run, and that one stops here so the panel's handler is not re-run. Clicking
	   the selected run again lets it go and hands the rail back to the panel — announced
	   as `panel-focus`, which is what "the selection is the panel again" is. */
	root.addEventListener("click", e => {
		const el = inside(root, e.target.closest(SELECTOR));
		const panel_focus = root.closest(".panel")?.matches(".focus");

		if (el){
			if (!panel_focus) return;
			e.stopPropagation();
			if (el === selected?.el){
				select(null);
				document.dispatchEvent(new CustomEvent("panel-focus", { detail: item }));
			} else select(el);
			return;
		}

		/* No run under the click — an ITEM, one level up, the same drill: the panel first
		   (already true, `panel_focus`), then its item. Flex/grid only: a `block` body's
		   children are not arranged by anything a rail word could change. */
		if (!panel_focus || !["flex", "grid"].includes(item.get("display"))) return;
		const cell = [...root.children].find(c => c === e.target || c.contains(e.target));
		if (!cell) return;

		e.stopPropagation();
		const key = cell.dataset.cell ?? String([...root.children].indexOf(cell));
		if (cell === item_selected?.el) select_item(null, item);
		else select_item(cell, item, key);
	});

	// ⚠ `text_observe()`'s dispose, passed straight through — persist.js is what
	// `owners`/the `MutationObserver` belong to, so it is also what releases them.
	return dispose;
}

/* Type on the thing itself. `contenteditable` rather than an input in the rail, because a
   measure, a weight and a line length are the whole point of editing copy in a layout tool
   — text you retype somewhere else is text you cannot see break.

   ⚠ `plaintext-only`: the default lets a paste bring its own markup in, and a panel body is
   a layout you are arranging, not a document. ⚠ The write is one-way on the way OUT — View's
   own `html()` records that re-setting a `contenteditable` drops the caret, so nothing reads
   this element back into a value while it is being typed in. */
export function edit(el){
	if (!el) return null;

	el.setAttribute("contenteditable", "plaintext-only");
	el.classList.add("panel-text-edit");
	el.focus();

	// Whole-run select, so the first keystroke replaces the placeholder copy rather than
	// landing wherever the click happened to put the caret.
	const range = document.createRange();
	range.selectNodeContents(el);
	getSelection().removeAllRanges();
	getSelection().addRange(range);

	// ⚠ The class goes BEFORE the write: `record()` saves, which repaints every mirror, and
	// a body still wearing `.panel-text-edit` would be committed by the paint it just caused.
	const done = () => {
		el.removeAttribute("contenteditable");
		el.classList.remove("panel-text-edit");
		el.removeEventListener("blur", done);
		el.removeEventListener("keydown", key);
		record(el, { text: el.textContent });
	};

	// ⚠ Escape ends it; Enter does NOT — a heading may legitimately wrap, and a layout tool
	// that swallows the return key cannot write two lines of anything.
	const key = e => { if (e.key === "Escape"){ e.stopPropagation(); el.blur(); } };

	el.addEventListener("blur", done);
	el.addEventListener("keydown", key);
	return el;
}

/* Wrap a text layer in a container it does not have — the "put this in a box" move every
   layout tool has, and the one thing you cannot do by styling the element itself. The
   wrapper takes the layer's place in the flow and adopts it, so nothing moves. Selection
   stays on the RUN: the box is derived from the run's record and has no address to save
   styling of its own against. */
export function wrap(el, tag = "div"){
	if (!el?.parentElement) return null;

	const made = box(el, tag);
	record(el, { box: tag });
	select(el);
	return made;
}

/* The panel under the pointer, and the run of text in it that is selected or first. `T` is
   a shortcut, so it aims at what you are looking at rather than at a stored selection. */
export const typing = () => !!document.querySelector(".panel-text-edit");

export function type_here(){
	if (typing()) return null;

	if (selected?.el?.isConnected) return start(selected.el);

	const $body = document.querySelector(".panel:hover:not(:has(.panel:hover)) .panel-body");
	// ⚠ `tracked()` answers only for bodies `text_observe` bound — the one place a
	// workspace with `tools.text` off is invisible to T, with no per-workspace check of its own.
	if (!$body || !tracked($body)) return null;

	/* ⚠ On ANY panel, which means a panel holding no prose at all has to grow some — a scene
	   or a clock matches nothing in `SELECTOR`, and T doing nothing there is T being broken
	   three times out of four. */
	return start($body.querySelector(SELECTOR) ?? fresh($body));
}

const start = el => { select(el); return edit(el); };

/* ⚠ Bound once, at module scope, and it checks `typing()` first — without that the `T` that
   starts a session would be caught again by the next keystroke and restart it. Ignored while
   the focus is in a real field, or typing a `t` into the rail would jump to a panel. */
document.addEventListener("keydown", e => {
	if (e.key !== "t" || e.metaKey || e.ctrlKey || e.altKey) return;
	if (typing() || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
	if (document.activeElement?.isContentEditable) return;

	if (type_here()) e.preventDefault();
});

const row = (names, icons, active, pick) => div.c("flex gap wrap", () => {
	names.forEach(name => {
		button.c("panel-btn", glyph(icons?.[name], name))
			.ac(active === name && "on")
			.attr("title", name)
			.click(() => pick(name));
	});
});

export function text_fields($el){
	if (!$el){
		span.c("muted", "Click a text element to style it — or press T over any panel.");
		return;
	}

	div.c("flex gap v", () => {
		for (const name in FIELDS){
			const field = FIELDS[name];
			row(field.names, field.icons, field.of($el), pick => {
				field.set($el, pick);
				record($el.el, { [name]: pick });
				announce($el);
			});
		}

		// The two verbs that change the element rather than its look.
		div.c("flex gap wrap", () => {
			button.c("panel-btn", glyph("edit", "edit")).attr("title", "Edit the text (T)").click(() => edit($el.el));
			WRAPS.forEach(tag => button.c("panel-btn", tag).attr("title", "Wrap in a " + tag).click(() => wrap($el.el, tag)));
		});
	});
}

// What a text layer can be wrapped IN. A `div` is a box to hang layout on; the other two
// carry meaning a screen reader reads, which is why they are offered rather than assumed.
const WRAPS = ["div", "section", "figure"];
