import { div, span, button, icon } from "/app.js";
import PRESETS from "/framework/styles/layouts/space/presets.js";
import { ALIGN, DIR, SEATS, SIZES, LENGTHS, MODE, extent, glyph, live_words } from "./glyphs.js";
import { self_axes } from "./size.js";
import { standard } from "./vocab.js";
import { focused, repaint, vocab } from "./workspace.js";

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

export function fields(target){
	if (!target){
		span.c("panel-props-empty muted", "Click any panel — its words appear here.");
		return;
	}

	const entries = vocab(target);
	const split = !target.leaf();
	const entry = split ? null : entries[target.get("template")];

	div.c("panel-props-head", () => {
		if (entry?.icon) icon(entry.icon);
		span(split ? "split · " + target.get("dir") : target.get("template"));
	});

	/* Exactly the words the bar offers, and for the same reason it offers them: ⚠ `hug` on
	   a SPLIT measures children that size themselves from it and collapses the panel to
	   0px, with nothing left to point at. A split gets its axis; a leaf gets the rest. */
	if (split){
		root_words(target);
		words(target, "dir", Object.keys(DIR), 2, DIR);
		sow_words(target);
		return;
	}

	/* ⚠ `shelf` is the LAST argument for a reason: only the template set may reflow. The
	   align 3×3 is a picture of nine placements and stops being one the moment its columns
	   auto-fill — the same reading `toolbar.js` makes with `panel-browse`. */
	words(target, "template", Object.keys(entries), 6, entries, true);

	/* Every other word that is one key with a fixed list, from the ONE table the bar reads
	   too (`glyphs.js`'s `WORDS`): tone, display, then whatever that display mode makes
	   live — a `gap`, a `wrap` and a `justify` under flex, a track count and `dense` under
	   grid — then align, then position. The order is the table's, so the two hosts cannot
	   drift. ⚠ `position` stays the last of them for the reason it always was: it says what
	   the two size rows MEAN — in flow an extent is a flex basis, out of flow a declared
	   box. A split is offered none of it, the same withholding `w`/`h` already make. */
	live_words(target).forEach(([key, word]) => words(target, key, word.names, word.cols, word.pics));

	size_words(target, "w", "width");
	size_words(target, "h", "height");

	// LAST, under the two rows that gate it: pick an extent and watch this grid open or close.
	self_words(target);
	sow_words(target);
}

/* The root's own words on a SPLIT — the one thing a split's rail carries beyond its axis,
   and the reason the WORDS table alone could not express `root`: a document root IS a split
   the moment it holds two sections, and this branch draws none of `live_words()`. It hands
   root words back on the root alone, so nothing here has to test for it. */
const root_words = target => live_words(target).filter(([, word]) => word.root)
	.forEach(([key, word]) => words(target, key, word.names, word.cols, word.pics));

/* Nine starting arrangements, and the dice. `styles/layouts/space/presets.js` holds the
   specs; `structure()` turns spec TEXT into panels exactly as it turns a seed into them,
   and `sow()` is the verb that replaces this panel with the result — so a preset is a
   starting point you then split, resize and retint like anything else.
   ⚠ Only the site's own vocabulary: a workspace holding regions rather than content
   (ext/editor) has nowhere for a landing page to go, the same test `random` makes.
   ⚠ The BAR's dice cannot offer these — its `sow` hook is built in `workspace.js` and
   takes no argument. One line there forwards a name: doc/decisions.md. */
const sow_words = target => standard(target) && div.c("panel-props-row", () => {
	span.c("panel-props-tag", "sow");

	div.c("panel-props-set").append(() => ["dice", ...Object.keys(PRESETS)].forEach(name =>
		button.c("panel-btn", glyph(name === "dice" ? "casino" : undefined, name))
			.attr("title", name === "dice" ? "Roll a layout" : name)
			// ⚠ A dynamic import, so the layout space stays off every page that only wanted
			// a panel — and `repaint` runs in `then`, never after a bare await.
			.click(() => import("./generate.js")
				.then(m => repaint(m.sow(target, name === "dice" ? undefined : name))))
	)).style("--panel-cols", 5);
});

/* One word of a set. `set()` raises `change`, which is what re-renders every inspector
   on the page — including this one, so nothing after it may touch these buttons. */
const words = (target, key, names, cols, entries, shelf) => div.c("panel-props-row", () => {
	span.c("panel-props-tag", key);

	div.c("panel-props-set").ac(shelf && "panel-props-icons").append(() => names.forEach(name => {
		button.c("panel-btn", glyph(entries?.[name], name))
			.ac(target.get(key) === name && "on")
			.attr("title", name)
			.click(() => { target.set(key, name); repaint(target); });
	})).style("--panel-cols", cols);
});

/* Width and height: the same row `words()` draws, but a fixed extent writes TWO keys, so
   it earns its own two lines rather than a flag on `words()` for one caller. */
const size_words = (target, axis, tag) => div.c("panel-props-row panel-axis-" + axis, () => {
	span.c("panel-props-tag", tag);

	div.c("panel-props-set").append(() => SIZES.forEach(name => {
		button.c("panel-btn", glyph(MODE[name], name))
			.ac(extent(target, axis) === name && "on")
			.attr("title", name)
			.click(() => {
				const fixed = LENGTHS.includes(name);
				target.set(axis, fixed ? "fixed" : name);
				if (fixed) target.set(axis + "_at", name);
				repaint(target);
			});
	})).style("--panel-cols", 3);
});

/* The OTHER 3×3: `align` moves a leaf's content inside its body, `self` moves the panel
   inside the slot its split hands it — so its picture is a frame with the panel in it, not
   the align row's arrows again. Its columns and rows go live independently, and a button is
   clickable only where BOTH hold: this panel does not FILL that axis, and the slot's display
   mode lets a child place itself on it at all (`self_axes()`). Shown, never hidden — the
   grid narrows to the strip of placements that are real, a dead button greys and says why
   on hover, and the line underneath says it with no hover at all. Record: doc/file/size.js.md. */
const self_words = target => div.c("panel-props-row", () => {
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
			repaint(target);
		});
	}));

	if (because) span.c("muted", because);
});

export default properties;
