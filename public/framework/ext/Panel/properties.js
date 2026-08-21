import { div, span, button, input } from "/app.js";
import dropdown from "/framework/ext/Dropdown/dropdown.js";
import PRESETS from "/framework/styles/layouts/space/presets.js";
import { ALIGN, DIR, SEATS, SIZES, LENGTHS, MODE, extent, glyph, live_words, live_item_words } from "./glyphs.js";
import { self_axes, grouped } from "./size.js";
import { standard } from "./vocab.js";
import { focused, repaint, vocab } from "./workspace.js";
import { view_of } from "./paint.js";
import { set_item } from "./persist.js";
import { item_selection } from "./text.js";
import { name_of, remove } from "./Workspace/documents.js";

/* The inspector: one panel showing the FOCUSED panel's words as live controls — the wide
   version of the bar, for a panel that is not the one you are pointing at. Every mutation
   is `item.set(key, value)`, the same call the bar makes, followed by `repaint()`, which
   is how a control in one panel redraws another. Look: templates.css (`.panel-props*`).
   `.panel-controls` is the one word that says "my top edge is live" — panel.css reserves
   the bar's height for it, and any other control surface says it the same way.
   Design record: doc/focus.md. */

export function properties(panel){
	const root = panel.root();
	const $props = div.c("panel-props panel-controls");

	const render = () => { $props.empty(() => { fields(focused(panel)); }); };

	/* ⚠ The listener outlives this DOM — a template switch or a structural redraw drops
	   the element and leaves the root holding a dead closure. So it checks whether it is
	   still in a workspace and unbinds itself if it is not: one round, then gone. */
	const hear = () => { $props.el.closest(".panel-workspace") ? render() : stop(); };
	const stop = () => { root.off("focus", hear); root.off("change", hear); };

	root.on("focus", hear);
	root.on("change", hear);

	render();
}

/* `document: true` is the DRAWER's call (tools.js): only the rail at the page's edge shows the
   document block — an in-workspace inspector (the `properties` template) is content, and a
   Delete button inside the document it would delete is not. */
export function fields(target, { document: doc = false } = {}){
	if (!target){
		span.c("panel-props-empty muted", "Click any panel — its words appear here.");
		return;
	}

	const entries = vocab(target);
	const split = !target.leaf();

	/* A SPLIT alone gets a head. A leaf's head was its template's picture and name — which
	   is exactly what the template dropdown right underneath says now, and the same thing
	   twice in two rows is one thing too many (2026-08-19). */
	if (split) div.c("panel-props-head", () => { span("split · " + target.get("dir")); });

	/* ⚠ `hug` on a SPLIT measures children that size themselves from it and collapses the
	   panel to 0px, with nothing left to point at. A split gets its axis; a leaf the rest. */
	if (split){
		root_words(target);
		group_words(target);
		words(target, "dir", { names: Object.keys(DIR), cols: 2, pics: DIR });
		sow_words(target);
		if (doc) document_block(target);
		return;
	}

	/* A DROPDOWN since 2026-08-19 (the owner: "the template switcher should be a dropdown …
	   with icons and a label"). A vocabulary is dozens of entries wide: as a shelf of
	   pictures it was a wall of icons you had to hover to read, and it opened past the
	   rail's own bottom edge. `ext/Dropdown` says the name beside the picture and lands in
	   the top layer, where nothing can clip it. The shelf's reflow class
	   (`.panel-props-icons`) went with it. Drawn by `words()` like everything else: a template is a
	   word whose `names` are the document's own vocabulary. doc/words.md. */
	words(target, "template", { names: Object.keys(entries), pics: entries, drop: true });

	/* Every word that is one key with a fixed list, from `glyphs.js`'s `WORDS` — the table
	   this rail is now the ONLY reader of: tone, display, then whatever that display mode
	   makes live — a `gap`, a `wrap` and a `justify` under flex, a track count and `dense`
	   under grid — then align, then position. ⚠ `position` stays last of them for the reason
	   it always was: it says what the two size rows MEAN — in flow an extent is a flex
	   basis, out of flow a declared box. A split is offered none of it, the same
	   withholding `w`/`h` already make. */
	live_words(target).forEach(([key, word]) => words(target, key, word));

	size_words(target, "w", "width");
	size_words(target, "h", "height");

	// LAST, under the two rows that gate it: pick an extent and watch this grid open or close.
	self_words(target);
	sow_words(target);

	// LAST of all — under every one of the leaf's own rows, and only while a cell is picked.
	item_words(target);
	if (doc) document_block(target);
}

/* The DOCUMENT, when the selection is a ROOT that documents.js opened (the owner,
   2026-08-19: "a right drawer selection for the document itself … a red delete button at the
   bottom of the drawer, with an 'ok' accept prompt"). Its name, and the one irreversible
   verb — Delete, red, pushed to the rail's foot, behind the browser's own `confirm`.
   `default` is `/data/panels.json`, the owner's own file: never offered. A MemorySaver root
   (a demo) has no name and gets no block. The removal is announced on the document so the
   playground can leave the page it is standing on — `properties.js` knows no router. */
const document_block = root => {
	const name = !root.parent && name_of(root.saver);
	if (!name) return;

	div.c("panel-props-row panel-props-doc", () => {
		span.c("panel-props-tag", "document · " + name);
		if (name === "default") return;

		button.c("panel-btn panel-props-delete", "Delete document")
			.attr("type", "button")
			.click(async () => {
				if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
				await remove(name);
				document.dispatchEvent(new CustomEvent("panel-unfocus"));
				document.dispatchEvent(new CustomEvent("document-removed", { detail: name }));
			});
	});
};

/* What every control here does after it writes: repaint the PANEL, then restate the RAIL.

   ⚠ The rail does not redraw itself. `properties()` above (the in-workspace inspector)
   listens for `change`; `fields()` drawn into `ext/drawer` by `tools.js` has no listener at
   all, so every control rendered its lit state ONCE — pick `cells` and the trigger still
   said `toc`, pick `grid` and the grid rows never appeared, because `live_words()` had
   already been read. The owner read that, correctly, as "the dropdown doesn't do anything"
   (2026-08-19). Re-announcing the SELECTION is the redraw: `tools.js` fills the rail from
   `panel-focus` and nothing else has to know this happened.
   ⚠ The scroll position is the rail's, not the fill's — an `empty()` throws it away, and a
   long rail jumping to the top on every click is its own bug. Restored a frame later,
   because `tools.js` fills after a dynamic import. */
const apply = target => {
	repaint(target);

	// `repaint()` paints EVERY live rendering since 2026-08-19 (paint.js `views_of`) — the
	// box under the pointer included; it used to hold one, and painted a hidden twin.

	const scroller = document.querySelector(".drawer-body");
	const top = scroller?.scrollTop ?? 0;

	document.dispatchEvent(new CustomEvent("panel-focus", { detail: target }));
	if (top) requestAnimationFrame(() => { if (scroller) scroller.scrollTop = top; });

	return target;
};

/* ONE row of the rail — and the one place a click on this rail is claimed as this rail's.

   ⚠ THE RAIL IS SHARED, and it had an owner already. `ext/drawer` is one rail per document;
   `ext/layout/panel.js` wires `$rail.on("click", …)` ONCE and never unwires it, and its
   `page.js` loads with the nav on every page under /framework/. So the FIRST click on any
   control here — measured 2026-08-19: a plain `tone` button as surely as a dropdown — bubbled
   to that listener, which found no layout selection and redrew the rail as ext/layout's
   "nothing selected". The panel's words vanished and re-selecting the panel did not bring
   them back. That is one of the smells the owner named.

   ⚠ On the ROW, bubbling — not a capture guard on the drawer, which would eat the button's
   own handler before it ran. The real fix is an ownership test in `ext/layout` (that module
   is not this task's to edit): proposal in `ai/2026-08-19/panel-bar-sweep/`. doc/focus.md. */
const row = fn => div.c("panel-props-row", fn).on("click", e => e.stopPropagation());

/* The root's own words on a SPLIT — the one thing a split's rail carries beyond its axis,
   and the reason the WORDS table alone could not express `root`: a document root IS a split
   the moment it holds two sections, and this branch draws none of `live_words()`. It hands
   root words back on the root alone, so nothing here has to test for it. */
const root_words = target => live_words(target).filter(([, word]) => word.root)
	.forEach(([key, word]) => words(target, key, word));

/* Every SPLIT's own word (2026-08-19): whether it is a group — Figma-style, one outer click
   before hovering anything inside it wakes up (`grouped()`, size.js). `live_words()` cannot
   carry this: it is a LEAF-only door (`fields()` never calls it on the split branch above),
   and `group` describes a split alone, so it never earns a `WORDS` row. One line beside the
   root's own `mode` row instead — the lit button reads `grouped()`'s computed default, not a
   stored value, because an untouched section is already a group with nothing written down.
   ⚠ ONE button since the sweep, like `wrap` and `dense`: a binary word is a toggle, never a
   row of two names (the owner, 2026-08-19). It cannot use `toggle()` below, which reads a
   STORED value — `grouped()` computes this one. */
const group_words = target => row(() => {
	const on = grouped(target);
	span.c("panel-props-tag", "group");

	div.c("panel-props-set").append(() => {
		button.c("panel-btn", glyph("layers", "group"))
			.ac(on && "on")
			.attr("title", "group: " + (on ? "on" : "off"))
			.click(() => { target.set("group", on ? "off" : "on"); apply(target); });
	}).style("--panel-cols", 1);
});

/* Nine starting arrangements, and the dice. `styles/layouts/space/presets.js` holds the
   specs; `structure()` turns spec TEXT into panels exactly as it turns a seed into them,
   and `sow()` is the verb that replaces this panel with the result — so a preset is a
   starting point you then split, resize and retint like anything else.
   ⚠ Only the site's own vocabulary: a workspace holding regions rather than content
   (ext/editor) has nowhere for a landing page to go, the same test `random` makes.
   ⚠ The BAR's dice cannot offer these — its `sow` hook is built in `workspace.js` and
   takes no argument. One line there forwards a name: doc/decisions.md. */
const sow_words = target => standard(target) && row(() => {
	span.c("panel-props-tag", "sow");

	div.c("panel-props-set").append(() => ["dice", ...Object.keys(PRESETS)].forEach(name =>
		button.c("panel-btn", glyph(name === "dice" ? "casino" : undefined, name))
			.attr("title", name === "dice" ? "Roll a layout" : name)
			// ⚠ A dynamic import, so the layout space stays off every page that only wanted
			// a panel — and `repaint` runs in `then`, never after a bare await.
			.click(() => import("./generate.js")
				.then(m => apply(m.sow(target, name === "dice" ? undefined : name))))
	)).style("--panel-cols", 5);
});

/* ONE word, drawn the way its `WORDS` entry asks: a dropdown (`drop`), one lit button
   (`toggle`), or the row of pictures everything else is. `word` is the table's own entry —
   `{ names, cols, pics, toggle, pic, drop, knob }` — handed in whole rather than unpacked
   into seven positional arguments, which is what this was until the sweep.
   ⚠ `set()` raises `change`, which re-renders every inspector on the page — including this
   one — so nothing after it may touch these buttons. `knob` draws the free-value companion
   (below) as a THIRD child of the same row, so `pad`/`gap` read as one row. */
const words = (target, key, word) => row(() => {
	span.c("panel-props-tag", key);

	// ⚠ Never `return pick_one(…)`: `append_fn` appends whatever a fill function hands back.
	if (word.drop){ pick_one(target, key, word.names, word.pics); return; }
	if (word.toggle){ toggle(target, key, word); return; }

	div.c("panel-props-set").append(() => word.names.forEach(name => {
		button.c("panel-btn", glyph(word.pics?.[name], name))
			.ac(target.get(key) === name && "on")
			.attr("title", name)
			.click(() => { target.set(key, name); apply(target); });
	})).style("--panel-cols", word.cols);

	if (word.knob) knob(target, key);
});

/* A binary word is ONE button that lights, never a row of two names (the owner, 2026-08-19:
   "don't have a Wrap > Wrap/NoWrap drill down, when a single Wrap with active state would
   suffice"). `names[1]` is the ON state, by the table's own order; the tag beside it already
   says which word this is, so the button carries the word's picture and nothing else. */
const toggle = (target, key, word) => {
	const [off, on] = word.names;
	const lit = target.get(key) === on;

	div.c("panel-props-set").append(() => {
		button.c("panel-btn", glyph(word.pic, key))
			.ac(lit && "on")
			.attr("title", key + ": " + (lit ? on : off))
			.click(() => { target.set(key, lit ? off : on); apply(target); });
	}).style("--panel-cols", 1);
};

/* A word whose trigger says its NAME as well as its picture — `ext/Dropdown`, opening in
   the TOP LAYER, which is the whole reason nothing in this rail is clipped any more.
   Two callers: `template` and `display` (`drop: true`). Everything else stays a row of
   pictures — two to nine of them, positional, and faster to read than a list you must open.
   ⚠ Straight into the row, not a `.panel-props-set`: a row is a one-column grid, so the
   trigger stretches to the rail's width and a long template name ellipses instead of
   pushing the rail wide.
   ⚠ A picture is unwrapped here, not by `glyph()`: `Dropdown` draws an icon NAME or a
   drawing function, and a `T` entry is neither — it is an object carrying one. */
const pick_one = (target, key, names, pics) => dropdown({
	options: names.map(name => ({ value: name, label: name, icon: typeof pics?.[name] === "object" ? pics[name]?.icon : pics?.[name] })),
	value: target.get(key),
	title: key,
	pick: name => { target.set(key, name); apply(target); },
});

/* The free-value companion to a preset row (2026-08-19: `pad`, `gap` — `glyphs.js`'s
   `knob: true`). Copied from `ext/layout/controls.js`'s `knob()` idiom, not imported:
   `ext/Panel` depends on nothing in `ext/layout`, not even `btn()` (doc/decisions.md).
   Adapted to write through `item.set()` and `repaint()`, the module's one path onto a
   body, never an element's style by hand — a knob that wrote `$body.style()` directly
   would neither persist (`Saver`) nor survive the next `paint()`.
   ⚠ Reads the panel's own BODY, not the item, for its STARTING value: an untouched `pad`
   has no stored value but may still show a real one — inherited from a container
   `PanelDrag`'s centre-drop padded (panel.css) — and the slider has to start there or it
   lies about what the eye sees. The button row above lights the preset that matches the
   stored value and none once the knob writes something off that list. */
const knob = (target, key) => {
	const $body = view_of(target)?.$body;
	const stored = parseFloat(target.get(key));
	const cascade = $body ? parseFloat(getComputedStyle($body.el).getPropertyValue(`--panel-${key}`)) : NaN;
	const value = !isNaN(stored) ? stored : (!isNaN(cascade) ? cascade : 0);
	let $out;

	span.c("panel-knob", () => {
		/* ⚠ Inline, not a CSS rule: base gives every `input` (range included — it is not on
		   the exclusion list, framework.css) `width: 100%`, which reads as the whole rail
		   without an override. `ext/layout/controls.js` owns one (`.layout-range { width:
		   5em }`); this is that override, paid in JS rather than reopening a CSS fence for
		   one declaration two files already carry the idiom for. */
		input.c("panel-knob-range").style("width", "8em")
			.attr("type", "range").attr("min", 0).attr("max", 4).attr("step", 0.25)
			.attr("value", value)
			/* ⚠ Commit on `change`, never `input`: `set()` raises `change` on the ITEM,
			   which `properties()`'s own listener reads as "redraw the whole rail" — on
			   every tick of a drag that rebuilds THIS row, the slider mid-gesture loses
			   the pointer capture a native range input relies on. `input` only keeps the
			   number beside it honest while the thumb moves; `change` fires once, on
			   release, which is when a rebuild is safe. */
			.on("input", function(){ $out.text(this.el.value + "em"); })
			.on("change", function(){
				target.set(key, this.el.value + "em");
				apply(target);
			});

		$out = span.c("panel-knob-out", value + "em");
	});
};

/* Width and height: the same row `words()` draws, but a fixed extent writes TWO keys, so
   it earns its own two lines rather than a flag on `words()` for one caller.
   ⚠ `.panel-axis-w` / `.panel-axis-h` is not decoration: size.css rotates the fill and hug
   arrows per axis off it, so the picture points the way the axis runs. */
const size_words = (target, axis, tag) => row(function(){
	this.ac("panel-axis-" + axis);
	span.c("panel-props-tag", tag);

	div.c("panel-props-set").append(() => SIZES.forEach(name => {
		button.c("panel-btn", glyph(MODE[name], name))
			.ac(extent(target, axis) === name && "on")
			.attr("title", name)
			.click(() => {
				const fixed = LENGTHS.includes(name);
				target.set(axis, fixed ? "fixed" : name);
				if (fixed) target.set(axis + "_at", name);
				apply(target);
			});
	// One LINE: five extents at 1.7em fit the rail, and two rows of them wasted its height.
	})).style("--panel-cols", SIZES.length);
});

/* The OTHER 3×3: `align` moves a leaf's content inside its body, `self` moves the panel
   inside the slot its split hands it — so its picture is a frame with the panel in it, not
   the align row's arrows again. Its columns and rows go live independently, and a button is
   clickable only where BOTH hold: this panel does not FILL that axis, and the slot's display
   mode lets a child place itself on it at all (`self_axes()`). Shown, never hidden — the
   grid narrows to the strip of placements that are real, a dead button greys and says why
   on hover, and the line underneath says it with no hover at all. Record: doc/file/size.js.md. */
const self_words = target => row(() => {
	const axes = self_axes(target);
	const code = target.get("self") ?? "tl";
	const because = [axes.x, axes.y].filter(axis => !axis.live).map(axis => axis.why).join(" · ");

	span.c("panel-props-tag", "self");

	const $set = div.c("panel-props-set panel-self").style("--panel-cols", 3);

	$set.append(() => ALIGN.forEach(name => {
		const dead = (!axes.x.live && name[1] !== "c") || (!axes.y.live && name[0] !== "c");

		const $btn = button.c("panel-btn", glyph(SEATS[name], name))
			/* Only the LIVE halves decide what reads `on`. The stored code keeps whatever it
			   said about an axis nobody can move, so a default `tl` in a flex row lights `tc` —
			   which is where the panel genuinely is. */
			.ac(!dead && (!axes.x.live || name[1] === code[1]) && (!axes.y.live || name[0] === code[0]) && "on")
			.attr("title", dead ? `${name} — unavailable: ${because}` : `Sit ${name}`);

		if (dead) return $btn.attr("disabled", "disabled");

		$btn.click(function(){
			$set.el.querySelectorAll(".panel-btn.on").forEach(el => el.classList.remove("on"));
			this.ac("on");
			target.set("self", name);
			apply(target);
		});
	}));

	if (because) span.c("muted", because);
});

/* The selected ITEM's own rows — `text_fields()`'s shape one level up, but inline under the
   leaf's rows rather than replacing them (the owner: "the sidebar can display flex/grid
   properties per item" — the leaf's own words stay the frame the item sits in). `text.js`
   owns the selection (`item_selection()`); this file only ever draws it and writes through
   `set_item()`.
   ⚠ No `apply()`: that calls `repaint()`, which throws the drawing away and rebuilds it —
   losing the very DOM node (`sel.el`) this is editing. The cell is already on screen, so a
   word click writes the custom property on it directly and persists through `set_item()`;
   `panel-item` (mirroring `panel-focus`) is the redraw signal that refills the rail with the
   new `on` state — the rest of the rail is untouched because nothing else changed. */
function item_words(target){
	const sel = item_selection();
	if (!sel || sel.panel !== target) return;

	const mode = target.get("display");
	if (mode !== "flex" && mode !== "grid") return;

	div.c("panel-props-head", () => { span("item · " + sel.key); });

	live_item_words(mode).forEach(([key, word]) => row(() => {
		span.c("panel-props-tag", key);
		const current = target.get("items")?.[sel.key]?.[key] ?? word.default;

		div.c("panel-props-set").append(() => word.names.forEach(name => {
			button.c("panel-btn", glyph(word.pics?.[name], name))
				.ac(current === name && "on")
				.attr("title", name)
				.click(() => {
					set_item(target, sel.key, key, name);
					sel.el.style.setProperty(word.var, word.css?.[name] ?? name);
					document.dispatchEvent(new CustomEvent("panel-item", { detail: target }));
				});
		})).style("--panel-cols", word.cols);
	}));
}

export default properties;
