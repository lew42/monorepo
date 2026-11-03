import View, { div, span, button, icon } from "/framework/core/View/View.js";
import { PLACE } from "./glyphs.js";

/* The bar that floats over a panel — and since 2026-08-19, ONLY what a hand does: split it,
   open its words, close it. Every WORD (template, tone, display, align, size, the flex and
   grid words, pad, gap, mode, group) lives in the rail, `properties.js`, which `tune` opens.
   The bar carried fifteen icons and a popover behind most of them; nobody could remember
   them and half of them were clipped. doc/decisions.md.

   Imports flow one way — `workspace.js` and `paint.js` read this file (the bar, and
   `place()`), and this file reads `glyphs.js`, which reads View and nothing else. Neither
   reads ANYTHING of ext/Panel back, so no two of them circle.
   css: .panel-bar, .panel-btn, .panel-handle, .panel-gap — plus `--panel-bar-h`, the bar's
   published height. `.panel-pop` and `.panel-swatch` are still here for `seam.js` and the
   rail. Record: readme.md. */
View.stylesheet(import.meta, "toolbar.css");

/* One row that never wraps and never opens anything. `T` is the panel's own vocabulary,
   prepared by the call site — only `T.tool` is read now (the magnifier, which draws ON the
   body rather than in this row); `T.names`, `T.entries`, `T.roll`, `T.sow` and `T.copy` are
   the rail's and the drag's. ⚠ `$panel` and `$body` are still taken because `workspace.js`
   passes them; nothing here needs them since the size triggers left. */
export function toolbar(item, $panel, $body, T){
	btn(() => { icon("vertical_split"); }, () => item.divide("row")).attr("title", "Split into columns");
	btn(() => { icon("horizontal_split"); }, () => item.divide("col")).attr("title", "Split into rows");

	words(item);

	// Whatever the call site wants ON the bar that this file must not import — the
	// magnifier, today. It positions itself on the body; its slot here costs nothing.
	T.tool?.();

	div.c("panel-gap");
	if (item.parent?.items.length > 1) btn(() => { icon("close"); }, () => item.close()).attr("title", "Close");
}

/* The one control on the bar that is not a gesture: "put this panel's words in the rail".
   It exists because the rail is not open on every page — `dock()` runs on the module page
   and the playground, and a panel in `ext/editor` or a one-off `panel()` would otherwise
   have no door to its own vocabulary at all now the bar carries none.

   ⚠ `tools.js` arrives LAZILY: it reads this file (`place`), and a static import here
   would close the ring. ⚠ Nothing is built after the `await` — `dock()` and the event both
   draw inside `empty()` callbacks of their own.
   ⚠ It announces whatever is FOCUSED, not `item`: the same click already reached
   `focus()` (workspace.js), and with groups on that may be an ancestor. Reading
   `root.focus` back is how the ring and the rail cannot disagree — doc/focus.md. */
const words = item => btn(() => { icon("tune"); }, async () => {
	const { dock } = await import("./tools.js");
	await dock();

	const root = item.root();
	document.dispatchEvent(new CustomEvent("panel-focus", { detail: (root.focus && root.find(root.focus)) || item }));
}).attr("title", "Words — this panel's controls, in the rail");

const btn = (label, fn) => button.c("panel-btn", label).click(fn);

export const place = ($body, code = "cc") =>
	$body.style({ "--panel-y": PLACE[code[0]] ?? "center", "--panel-x": PLACE[code[1]] ?? "center" });

// The drag handle is the grip, never the bar — a bar-wide handle eats every click.
export const handle = () => span.c("panel-btn panel-handle", () => { icon("drag_indicator"); })
	.attr("title", "Drag this panel");
