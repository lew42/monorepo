import View, { div, span, button, icon } from "/framework/core/View/View.js";
import { ALIGN, COMPASS, DISPLAY, MODE, PLACE, SWATCHES, TONES, glyph } from "./glyphs.js";

/* The bar that floats over a panel. Imports flow one way — workspace.js reads this
   file, and this file reads only `glyphs.js` (which reads View and nothing else), so
   no two of them circle.
   css: .panel-bar, .panel-btn, .panel-handle, .panel-gap, .panel-pop, .panel-fold,
   .panel-browse, .panel-more — plus `--panel-bar-h`, the bar's published height.
   Record: readme.md. */
View.stylesheet(import.meta, "toolbar.css");

/* One row that never wraps: every control is an icon, any set bigger than a handful
   opens a popover, and the whole run of verbs folds into one when the panel is too
   narrow for the row. `T` is the panel's own vocabulary, prepared by the call site —
   `{ names, entries, roll, repaint, sow }`. */
export function toolbar(item, $panel, $body, T){
	const pops = [];

	/* Absolutely positioned, so its slot in the bar costs nothing and DOM order is free.
	   ⚠ The trigger is handed back on the pop: a trigger that SHOWS the current value
	   goes stale the moment the pop writes a new one, and nothing else redraws a bar —
	   `change` deliberately never rebuilds the workspace. `$pop.says(label)` is how the
	   two that show a value (template, size) restate themselves. */
	const pop = (label, title, cols, fill) => {
		const $pop = div.c("panel-pop").style("--panel-cols", cols);
		pops.push($pop);

		const $trigger = btn(label, () => {
			pops.forEach($other => $other !== $pop && $other.rc("on"));
			// ⚠ Filled on the way OPEN, never once: every `on` in it reads the panel's
			// data, and the inspector writes that data from a panel this bar cannot see.
			if (!$pop.hc("on")) $pop.empty(fill);
			$pop.tc("on");
		}).attr("title", title);

		return $pop.assign({ says: said => $trigger.empty(said) });
	};

	const verbs = () => {
		btn(() => { icon("vertical_split"); }, () => item.divide("row")).attr("title", "Split into columns");
		btn(() => { icon("horizontal_split"); }, () => item.divide("col")).attr("title", "Split into rows");

		// The third structure verb, beside the other two — and the only one a split gets.
		if (T.sow) btn(() => { icon("space_dashboard"); }, T.sow).attr("title", "Roll a layout as panels");

		if (!$body) return;

		const template = item.get("template");

		/* A vocabulary of pictures browses six wide; one of names — ext/editor's — two.
		   `panel-browse` says the columns are a SHELF and may reflow when six no longer
		   fit; the alignment grid below carries no such mark, because its columns are a
		   picture of where things go. */
		const pics = pictorial(T);
		const $template = pop(glyph(T.entries[template], template), "Template", pics ? 6 : 2, () =>
			pick(T.names, name => {
				T.roll(name);
				// ⚠ `random` is a verb, not a template — it rolls a whole arrangement, and
				// what the panel ends up holding is not the name that was clicked.
				$template.says(glyph(T.entries[item.get("template")], item.get("template")));
			}, item.get("template"), T.entries));

		$template.ac(pics && "panel-browse");

		pop(() => { icon("palette"); }, "Tone", 2, () =>
			pick(TONES, tone => { item.set("tone", tone); T.repaint(); }, item.get("tone"), SWATCHES));

		pop(() => { icon("grid_view"); }, "Alignment", 3, () =>
			pick(ALIGN, code => { item.set("align", code); place($body, code); }, item.get("align"), COMPASS));

		/* The trigger IS the mode, like template and size — and the pick calls back out, so
		   what a mode DRAWS over the body stays the call site's business and this file keeps
		   importing nothing of ext/Panel but its vocabulary. */
		const $display = pop(() => { icon(DISPLAY[item.get("display")]); }, "Display", 3, () =>
			pick(Object.keys(DISPLAY), name => {
				item.set("display", name);
				T.display?.(name);
				$display.says(() => { icon(DISPLAY[name]); });
			}, item.get("display"), DISPLAY));

		/* The trigger IS the mode the panel wears — arrows inward for hug, outward for fill —
		   so a bar says how its panel sizes without a label, exactly as the template trigger
		   says what it holds. */
		const $size = pop(() => { icon(MODE[item.get("mode")]); }, "Fill or hug", 2, () =>
			pick(Object.keys(MODE), mode => {
				$panel[mode === "hug" ? "ac" : "rc"]("hug");
				item.set("mode", mode);
				$size.says(() => { icon(MODE[mode]); });
			}, item.get("mode"), MODE));

		// A live duplicate beside me — the same gesture alt-dropping makes, for a panel you
		// would rather not drag.
		if (T.copy) btn(() => { icon("content_copy"); }, T.copy).attr("title", "Live duplicate");

		// Whatever the call site wants ON the bar that this file must not import.
		T.tool?.();
	};

	/* One contiguous run, so a panel too narrow for the row folds the WHOLE run behind
	   `more_horiz` rather than clipping its tail — `display: contents` until the container
	   query says otherwise, so a wide bar is the row it always was, to the pixel. A split's
	   three buttons fit at any width worth pointing at, so only a leaf builds one. */
	if (!$body) verbs();
	else {
		const $fold = div.c("panel-pop panel-fold", verbs).style("--panel-cols", 4);
		btn(() => { icon("more_horiz"); }, () => { pops.forEach($pop => $pop.rc("on")); $fold.tc("on"); })
			.ac("panel-more").attr("title", "More controls");

		/* ⚠ The fold is a popover only while the container query says so. Widen past 19em
		   and it becomes `display: contents` while `more_horiz` — the one control that
		   closes it — becomes `display: none`, so a stale `on` reopens it on the way back
		   with nobody having clicked. The chrome closes with the pointer, as a grip's
		   menu does, and the bar it lives on is hover-revealed anyway. */
		$panel.on("pointerleave", () => { $fold.rc("on"); pops.forEach($pop => $pop.rc("on")); });
	}

	/* The one structure verb promoted out of the fold: an even column, at the top centre of
	   the panel rather than buried in a run that collapses behind `more_horiz` on any
	   narrow panel. Absolutely centred, because two flex spacers centre it between the
	   left run and `close` — which is not the middle of anything. */
	btn(() => { icon("splitscreen"); }, () => item.divide("row"))
		.ac("panel-quick").attr("title", "Split into an even column");

	div.c("panel-gap");
	if (item.parent?.items.length > 1) btn(() => { icon("close"); }, () => item.close()).attr("title", "Close");
}

/* One of a set. `on` is the one the panel already wears. A vocabulary that ships
   icons is browsed by picture — ext/editor's regions ship none, so those read as names. */
function pick(names, take, on, entries){
	const $btns = names.map(name => btn(glyph(entries?.[name], name), function(){
		$btns.forEach($btn => $btn.rc("on"));
		this.ac("on");
		take(name);
	}).attr("title", name));

	$btns[names.indexOf(on)]?.ac("on");
	return $btns;
}

const pictorial = T => T.names.some(name => T.entries[name]?.icon);

const btn = (label, fn) => button.c("panel-btn", label).click(fn);

export const place = ($body, code = "cc") =>
	$body.style({ "--panel-y": PLACE[code[0]] ?? "center", "--panel-x": PLACE[code[1]] ?? "center" });

// The drag handle is the grip, never the bar — a bar-wide handle eats every click.
export const handle = () => span.c("panel-btn panel-handle", () => { icon("drag_indicator"); })
	.attr("title", "Drag this panel");
