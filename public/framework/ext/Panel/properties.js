import { div, span, button, icon } from "/app.js";
import { ALIGN, COMPASS, DIR, DISPLAY, MODE, SWATCHES, TONES, glyph } from "./glyphs.js";
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
		words(target, "dir", Object.keys(DIR), 2, DIR);
		return;
	}

	/* ⚠ `shelf` is the LAST argument for a reason: only the template set may reflow. The
	   align 3×3 is a picture of nine placements and stops being one the moment its columns
	   auto-fill — the same reading `toolbar.js` makes with `panel-browse`. */
	words(target, "template", Object.keys(entries), 6, entries, true);
	words(target, "tone", TONES, 2, SWATCHES);
	words(target, "display", Object.keys(DISPLAY), 3, DISPLAY);
	words(target, "align", ALIGN, 3, COMPASS);
	words(target, "mode", Object.keys(MODE), 2, MODE);
}

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

export default properties;
