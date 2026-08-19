import View, { div, span, button, icon } from "/framework/core/View/View.js";
import { MODE, PLACE, SIZES, LENGTHS, extent, glyph, live_words } from "./glyphs.js";
import { sizing } from "./size.js";

/* The bar that floats over a panel. Imports flow one way — `workspace.js` and `paint.js`
   read this file (the bar, and `place()`),
   and this file reads `glyphs.js` (which reads View and nothing else) plus `size.js`'s
   `sizing()`, the one writer of `$panel`'s own size classes — neither reads ANYTHING of
   ext/Panel back, so no two of them circle.
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
	let $fold;

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

	/* Every word that is one key with a fixed list of choices, from the ONE table the
	   properties rail reads too (`glyphs.js`'s `WORDS`) — so `gap`, `wrap` or a track
	   count is an entry there and never an edit here. `bar: true` means the trigger IS
	   the value, the way template and size already read; a word with no `bar` is
	   rail-only. Only the words the display mode makes LIVE are built.
	   ⚠ Built at draw time, like every other trigger on this bar: picking `grid` does
	   not grow the row until the next draw, which is the same staleness `$pop.says()`
	   exists to patch — `change` deliberately never rebuilds a bar.
	   `keep` splits the run in two: the root's own words go on ABOVE the early return
	   below, because a split's bar reaches nothing after it. */
	const word_pops = keep => live_words(item).filter(([, word]) => word.bar && keep(word)).forEach(([key, word]) => {
		const said = () => word.bar === true
			? glyph(word.pics?.[item.get(key)], item.get(key))
			: () => { icon(word.bar); };

		const $word = pop(said(), key[0].toUpperCase() + key.slice(1), word.cols, () =>
			pick(word.names, name => {
				item.set(key, name);

				/* What a word MEANS on the body, in one place: `show()` for the ones
				   that are pure CSS (handed in as `T.display`), a redraw for `tone`
				   because a template reads it while drawing, and `place()` for `align`,
				   whose writer is this file's own export. A ROOT word lands on neither —
				   it reshapes the workspace, and `Panel.set()` redraws for it. */
				if (word.root) return;
				if (key === "tone") T.repaint();
				else if (key === "align") place($body, name);
				else T.display?.(name);

				if (word.bar === true) $word.says(said());

				/* ⚠ `display` is the ONE word that changes which OTHER words exist, so it
				   is the one that cannot wait for the next structural redraw: picking
				   `grid` has to put a track count on this bar while the pointer is still
				   here. Refilling the fold is the whole rebuild — `pops` is emptied
				   because every popover it held left with the DOM. */
				if (key === "display" && $fold){ pops.length = 0; $fold.empty(verbs); }
			}, item.get(key), word.pics));
	});

	const verbs = () => {
		btn(() => { icon("vertical_split"); }, () => item.divide("row")).attr("title", "Split into columns");
		btn(() => { icon("horizontal_split"); }, () => item.divide("col")).attr("title", "Split into rows");

		// The third structure verb, beside the other two — and the only one a split gets.
		if (T.sow) btn(() => { icon("space_dashboard"); }, T.sow).attr("title", "Roll a layout as panels");

		/* The root's word about the whole workspace, BEFORE the leaf-only run below: a
		   document root is a split the moment it holds two sections, and a split's bar
		   would otherwise carry nothing but its three verbs — no way back to `fill`.
		   `live_words()` already hides these on every panel that has a parent. */
		word_pops(word => word.root);

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

		// Everything the root did not already take, above.
		word_pops(word => !word.root);

		/* Width and height, as two triggers rather than one: `size.js` reads them per axis,
		   so one popover could no longer say both at once. Each trigger IS the extent that
		   axis wears — arrows for fill/hug, the length itself when fixed (`glyph()`'s own
		   text fallback) — exactly as the old single `mode` trigger did.
		   ⚠ `sizing()` is called BY HAND after every pick: it is the one writer of `$panel`'s
		   own classes, and nothing redraws it on a plain `change` the way a mirror gets
		   `repaint()`'d — the old mode toggle reached into `$panel` for the same reason. */
		const size_pop = (axis, title) => {
			const label = () => glyph(MODE[extent(item, axis)], extent(item, axis));
			const $size = pop(label(), title, 3, () =>
				pick(SIZES, name => {
					const fixed = LENGTHS.includes(name);
					item.set(axis, fixed ? "fixed" : name);
					if (fixed) item.set(axis + "_at", name);
					sizing(item, $panel);
					T.repaint();
					$size.says(label());
				}, extent(item, axis), MODE));
			return $size.ac("panel-axis-" + axis);
		};

		size_pop("w", "Width");
		size_pop("h", "Height");

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
		$fold = div.c("panel-pop panel-fold", verbs).style("--panel-cols", 4);
		btn(() => { icon("more_horiz"); }, () => { pops.forEach($pop => $pop.rc("on")); $fold.tc("on"); })
			.ac("panel-more").attr("title", "More controls");

		/* ⚠ The fold is a popover only while the container query says so. Widen past 26em
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
