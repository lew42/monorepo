import View, { div, span, button } from "/framework/core/View/View.js";
import { glyph } from "./glyphs.js";

/* Text inside a panel body, made selectable and stylable. `text_layers($body)` marks
   what's pointable with ONE delegated listener — a body can hold hundreds of text
   nodes, and a listener per one of them does not scale, and survives every redraw
   `paint()` does since `$body` itself is never recreated, only emptied.
   `text_fields($el)` draws the controls for whichever one is selected — something
   outside this file listens for `panel-text` and calls it, the shape `tools.js`
   already uses for `panel-focus`.
   css: .panel-text-hot, .panel-text-on. */
View.stylesheet(import.meta, "text.css");

export const TEXT = { on: true };

const SELECTOR = "p, h1, h2, h3, h4, h5, h6, li, blockquote, span.h1, span.h2, span.h3, span.h4";

const LEVELS = ["h1", "h2", "h3", "h4", "body"];

/* Weight and tracking write DIRECT inline styles, not custom properties: nothing else
   on the page would ever read a `--text-weight` token, so one would be plumbing with
   no second end — the same call `tools.js`'s `zoom_scrub` already made for `zoom`.
   Each "normal" is the empty string on purpose: picking it clears the override
   instead of fighting whatever the level's own weight already is. */
const WEIGHT = { normal: "", medium: "600", bold: "800" };
const TRACK  = { tight: "-0.02em", normal: "", wide: "0.08em" };
const ALIGN  = { left: "", center: "center", right: "right", justify: "justify" };
const ALIGN_ICON = {
	left: "format_align_left", center: "format_align_center",
	right: "format_align_right", justify: "format_align_justify",
};

const viewed = el => el && new View({ el, capture: false });

let hot, selected;

const mark = el => { hot?.rc("panel-text-hot"); hot = viewed(el); hot?.ac("panel-text-hot"); };
const announce = $el => document.dispatchEvent(new CustomEvent("panel-text", { detail: $el ?? null }));
const select = el => { selected?.rc("panel-text-on"); selected = viewed(el); selected?.ac("panel-text-on"); gauge(el); announce(selected); };

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
	$gauge.style.insetInlineStart = box.left + "px";
	$gauge.style.insetBlockStart = Math.max(0, box.top - 22) + "px";
}

// Bounds `closest()` to the body — unbounded, a click on the outermost text node
// would walk past it to whatever real heading wraps the panel itself.
const inside = (root, el) => el && root.contains(el) ? el : null;

export function text_layers($body){
	if (!TEXT.on) return;

	const root = $body.el;

	root.addEventListener("mouseover", e => mark(inside(root, e.target.closest(SELECTOR))));
	root.addEventListener("mouseleave", () => mark(null));

	root.addEventListener("click", e => {
		const el = inside(root, e.target.closest(SELECTOR));
		if (!el) return;

		// ⚠ Stops workspace.js's own selection click (`view()`'s `.click()`, which tests
		// `e.target.closest(".panel-bar, .panel-body")`) — without this, picking a word
		// of text also focuses the panel underneath it.
		e.stopPropagation();
		select(el === selected?.el ? null : el);
	});
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

	const done = () => {
		el.removeAttribute("contenteditable");
		el.classList.remove("panel-text-edit");
		el.removeEventListener("blur", done);
		el.removeEventListener("keydown", key);
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
   wrapper takes the layer's place in the flow and adopts it, so nothing moves. */
export function wrap(el, tag = "div"){
	if (!el?.parentElement) return null;

	const box = document.createElement(tag);
	box.className = "panel-text-box";
	el.replaceWith(box);
	box.append(el);

	select(box);
	return box;
}

/* The panel under the pointer, and the run of text in it that is selected or first. `T` is
   a shortcut, so it aims at what you are looking at rather than at a stored selection. */
export const typing = () => !!document.querySelector(".panel-text-edit");

export function type_here(){
	if (typing()) return null;

	if (selected?.el?.isConnected) return start(selected.el);

	const $body = document.querySelector(".panel:hover:not(:has(.panel:hover)) .panel-body");
	if (!$body) return null;

	/* ⚠ On ANY panel, which means a panel holding no prose at all has to grow some — a scene
	   or a clock matches nothing in `SELECTOR`, and T doing nothing there is T being broken
	   three times out of four. The new line is DOM, like every other edit here: a template
	   redraw takes it, because a panel's body belongs to its template until `data` learns to
	   carry copy. */
	return start($body.querySelector(SELECTOR) ?? fresh($body));
}

const start = el => { select(el); return edit(el); };

function fresh($body){
	const p = document.createElement("p");
	p.className = "panel-text-new";
	p.textContent = "Text";
	$body.append(p);
	return p;
}

/* ⚠ Bound once, at module scope, and it checks `typing()` first — without that the `T` that
   starts a session would be caught again by the next keystroke and restart it. Ignored while
   the focus is in a real field, or typing a `t` into the rail would jump to a panel. */
document.addEventListener("keydown", e => {
	if (!TEXT.on || e.key !== "t" || e.metaKey || e.ctrlKey || e.altKey) return;
	if (typing() || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
	if (document.activeElement?.isContentEditable) return;

	if (type_here()) e.preventDefault();
});

const level_of = $el => LEVELS.find(l => l !== "body" && $el.hc(l)) ?? "body";
const set_level = ($el, name) => LEVELS.forEach(l => l !== "body" && $el[l === name ? "ac" : "rc"](l));

const weight_of = $el => Object.keys(WEIGHT).find(k => $el.style("fontWeight") === WEIGHT[k]) ?? "normal";
const set_weight = ($el, name) => $el.style("fontWeight", WEIGHT[name]);

const track_of = $el => Object.keys(TRACK).find(k => $el.style("letterSpacing") === TRACK[k]) ?? "normal";
const set_track = ($el, name) => $el.style("letterSpacing", TRACK[name]);

const align_of = $el => Object.keys(ALIGN).find(k => $el.style("textAlign") === ALIGN[k]) ?? "left";
const set_align = ($el, name) => $el.style("textAlign", ALIGN[name]);

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

	const set = (setter, name) => { setter($el, name); announce($el); };

	div.c("flex gap v", () => {
		row(LEVELS, null, level_of($el), name => set(set_level, name));
		row(Object.keys(WEIGHT), null, weight_of($el), name => set(set_weight, name));
		row(Object.keys(TRACK), null, track_of($el), name => set(set_track, name));
		row(Object.keys(ALIGN), ALIGN_ICON, align_of($el), name => set(set_align, name));

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
