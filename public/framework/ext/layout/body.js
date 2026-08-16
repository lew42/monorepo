import { div, p, span, code } from "../../core/View/View.js";
import { pick, chips, btn } from "./controls.js";
import { draw, MODES, PAGE } from "./words.js";

/* What a selection reads as: its name, the line that would build it, and the groups
   of controls that apply to it. `panel.js` owns the drawer and hands this the
   selection, whatever `layout.context()` registered above it, and a redraw. */

const CHIPS = {
	flex: "v wrap auto three all-1 reverse h-center v-center split",
	grid: "auto three",
};
const ITEM = "flex-1 basis measure";

// ⚠ No ✕ here — the rail draws its own and never hands it over, so nothing this file
// does can leave the reader with no way to shut it (ext/drawer, 2026-08-16).
export function head($el){
	span.c("layout-name", $el ? name_of($el) : "nothing selected");
	$el && row(() => btn("copy", function(){ copy(this, $el); }));
}

export function body($el, extras, redraw){
	if (!$el) { nothing(); return; }

	code.c("layout-code", source($el));

	/* A `.page.standard` IS a grid, so the container section would offer to flip it to
	   flex and take the breakout template with it. A page gets page words. */
	if ($el.hc("page")) group("page", () => draw($el, PAGE));
	else container($el, redraw);

	if (laid_out($el.el.parentElement))
		group("item", () => { row(() => chips($el, ITEM)); draw($el, "basis"); });

	extras.forEach(fn => group("", () => fn($el)));
}

/* Two groups, because the chip list DEPENDS on the mode — `.flex.split` and
   `.grid.three` are not the same vocabulary — so changing it redraws the panel. */
function container($el, redraw){
	const mode = MODES.find(word => $el.hc(word));

	group("container", () => {
		row(() => pick(MODES, word => { $el.rc(MODES.join(" ")).ac(word); redraw(); }, mode));
		row(() => chips($el, (CHIPS[mode] || "") + " gap pad"));
	});

	group("tokens", () => draw($el, "gap column pad"));
}

/* The selection as the code that would build it. This widget's own `layout-*`
   classes are chrome and the Router writes its marks on every navigation — neither
   is vocabulary, and neither is anything you would type. */
const CHROME = /^(layout-|active-|in-path$)/;

export function source($el){
	const words = [...$el.el.classList].filter(word => !CHROME.test(word)).join(" ");
	return `${$el.el.tagName.toLowerCase()}${words ? `.c("${words}")` : "()"}`;
}

function copy($btn, $el){
	navigator.clipboard?.writeText(source($el));
	$btn.text("copied");
	setTimeout(() => $btn.text("copy"), 1200);
}

const nothing = () => div.c("layout-empty flex v", () => {
	p("Click a box inside any region — or the sliders chip on any toolbar — and its words, its tokens and the line that builds it land here.");
});

const group = (tag, fn) => div.c("layout-sect flex v", () => { tag && span.c("layout-tag h4", tag); fn(); });
const row = fn => div.c("layout-chips flex wrap", () => { fn(); });
const laid_out = el => !!el && (el.classList.contains("flex") || el.classList.contains("grid"));
const name_of = $el => $el.hc("page") ? "the page" : $el.el.tagName.toLowerCase();
