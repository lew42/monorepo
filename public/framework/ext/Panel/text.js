import View, { div, span, button } from "/framework/core/View/View.js";
import { glyph } from "./glyphs.js";
import { level_of, FIELDS, tracked, record, box, fresh, text_observe } from "./persist.js";

// History, architecture, edit flow, and CSS: doc/text-notes.md
View.stylesheet(import.meta, "text.css");

export const TEXT = { on: true };

const SELECTOR = "p, h1, h2, h3, h4, h5, h6, li, blockquote, span.h1, span.h2, span.h3, span.h4";

const viewed = el => el && new View({ el, capture: false });

let hot, selected;

const mark = el => { hot?.rc("panel-text-hot"); hot = viewed(el); hot?.ac("panel-text-hot"); };
const announce = $el => document.dispatchEvent(new CustomEvent("panel-text", { detail: $el ?? null }));
const select = el => { selected?.rc("panel-text-on"); selected = viewed(el); selected?.ac("panel-text-on"); gauge(el); announce(selected); };

// ⚠ Run deselected only by clicking it again; clearing on panel focus happens here (doc/text-notes.md)
document.addEventListener("panel-focus", () => {
	if (selected && !selected.el.closest(".panel")?.matches(".focus")) select(null);
	if (item_selected && !item_selected.el.closest(".panel")?.matches(".focus")) select_item(null, item_selected.panel);
});
document.addEventListener("panel-unfocus", () => {
	if (selected) select(null);
	if (item_selected) select_item(null, item_selected.panel);
});

// Item selection (cell, one level up) alongside run selection; see doc/text-notes.md
let item_selected;

const select_item = (el, panel, key) => {
	item_selected?.el.classList.remove("panel-item-on");
	item_selected = el ? { el, panel, key } : null;
	el?.classList.add("panel-item-on");
	document.dispatchEvent(new CustomEvent("panel-item", { detail: panel }));
};

// properties.js integration (self-healing reference); see doc/text-notes.md
export const item_selection = () => {
	if (item_selected && !item_selected.el.isConnected) item_selected = null;
	return item_selected;
};

// ⚠ Escape steps back one level (item→leaf) before focus.js's Escape; order matters (module scope)
document.addEventListener("keydown", e => {
	if (e.key !== "Escape" || !item_selected) return;
	e.stopImmediatePropagation();
	select_item(null, item_selected.panel);
});

// Measure badge: semantic level + line length. See doc/text-notes.md for gauge design
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

// Bounds closest() to the body (doc/text-notes.md)
const inside = (root, el) => el && root.contains(el) ? el : null;

export function text_layers($body, item){
	const root = $body.el;
	const dispose = text_observe($body, item);

	root.addEventListener("mouseover", e => mark(inside(root, e.target.closest(SELECTOR))));
	root.addEventListener("mouseleave", () => mark(null));

	// Panel focus flow: clicks ignored until panel focused, then run selected (doc/text-notes.md)
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

		// Item click handling (flex/grid only); see doc/text-notes.md
		if (!panel_focus || !["flex", "grid"].includes(item.get("display"))) return;
		const cell = [...root.children].find(c => c === e.target || c.contains(e.target));
		if (!cell) return;

		e.stopPropagation();
		const key = cell.dataset.cell ?? String([...root.children].indexOf(cell));
		if (cell === item_selected?.el) select_item(null, item);
		else select_item(cell, item, key);
	});

	// ⚠ Return dispose from text_observe; persist.js owns cleanup
	return dispose;
}

// Edit on the element itself. ⚠ plaintext-only prevents paste markup; write is one-way OUT
export function edit(el){
	if (!el) return null;

	el.setAttribute("contenteditable", "plaintext-only");
	el.classList.add("panel-text-edit");
	el.focus();

	// Whole-run select (so first keystroke replaces placeholder)
	const range = document.createRange();
	range.selectNodeContents(el);
	getSelection().removeAllRanges();
	getSelection().addRange(range);

	// ⚠ Remove class BEFORE record() to avoid being redrawn by the paint it triggers
	const done = () => {
		el.removeAttribute("contenteditable");
		el.classList.remove("panel-text-edit");
		el.removeEventListener("blur", done);
		el.removeEventListener("keydown", key);
		record(el, { text: el.textContent });
	};

	// ⚠ Escape ends edit; Enter allowed (headings may wrap)
	const key = e => { if (e.key === "Escape"){ e.stopPropagation(); el.blur(); } };

	el.addEventListener("blur", done);
	el.addEventListener("keydown", key);
	return el;
}

// Wrap text in a new container (layout operation); see doc/text-notes.md
export function wrap(el, tag = "div"){
	if (!el?.parentElement) return null;

	const made = box(el, tag);
	record(el, { box: tag });
	select(el);
	return made;
}

// T shortcut: edit text in hovered panel; see doc/text-notes.md
export const typing = () => !!document.querySelector(".panel-text-edit");

export function type_here(){
	if (typing()) return null;

	if (selected?.el?.isConnected) return start(selected.el);

	const $body = document.querySelector(".panel:hover:not(:has(.panel:hover)) .panel-body");
	// ⚠ tracked() only works for bodies bound by text_observe
	if (!$body || !tracked($body)) return null;

	// ⚠ T must work on ANY panel, even those with no prose initially
	return start($body.querySelector(SELECTOR) ?? fresh($body));
}

const start = el => { select(el); return edit(el); };

// ⚠ Module scope listener; checks typing() first to prevent re-triggering on next keystroke
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

// Wrap tags: div (layout), section/figure (semantic meaning)
const WRAPS = ["div", "section", "figure"];
