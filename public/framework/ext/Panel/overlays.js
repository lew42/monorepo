import { align_grid } from "./tools.js";
import { text_layers } from "./text.js";
import { display_overlay } from "./display.js";
import { repeat_layers } from "./repeat.js";
import { tools } from "./vocab.js";

/* The live chrome over one leaf's BODY, and the registry that releases it. The two surfaces
   that do not live on a body — `split.js`'s edge strips (on the panel) and `insert.js`'s `+`
   (on a split's items) — are gated beside their own call sites in `view()`. The z-index
   budget all six share, and the two hover idioms: doc/overlays.md.

   ⚠ Called where the body element is CREATED, never from `paint()`. Everything below binds
   to `$body` itself, which `paint()` empties but does not replace — called from there, every
   repaint would stack another set.
   ⚠ Synchronous, and the captor is the PANEL's: `align_grid` and `display_overlay` append a
   sibling of the body, not a child, so the body's own scrolling and containment are left
   alone. Anything here that returned a promise would land in whatever the captor became. */
export function overlays(item, $body){
	const t = tools(item);

	// Over the body and under the bar — nine arrows at the nine places a panel aligns to.
	if (t.align) align_grid(item, $body);

	// The item rides along, so an edit can find its way back to the data.
	if (t.text) register(item, text_layers($body, item));

	// What the display class is DOING — the flex axis and each child's grow, or the grid's
	// real track widths. The class itself is `paint.js`'s `show()`.
	if (t.display) register(item, display_overlay(item, $body));

	// A `+` at the end of any repeating run the template drew — a grid of cards, a list of
	// rows. In normal flow, so it costs the overlay budget nothing.
	if (t.repeat) register(item, repeat_layers($body, item));
}

/* ⚠ THE contract: everything above hands back a disposer, and this is what holds it — keyed
   by the workspace root, which is what `draw()` still has on the next redraw. Drained there,
   never by an observer noticing its own target is gone: that signal never arrives for a body
   torn down before its first layout. A surface added without a disposer leaked +953
   MutationObservers over twenty redraws. Record: doc/decisions.md. */
const disposers = new WeakMap();

function register(item, dispose){
	const root = item.root();
	if (!disposers.has(root)) disposers.set(root, []);
	disposers.get(root).push(dispose);
}

export const drain = root => disposers.get(root)?.splice(0).forEach(dispose => dispose());
