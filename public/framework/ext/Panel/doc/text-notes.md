# text.js notes

## Architecture

Text inside a panel body is made selectable, stylable and editable directly on the element. The `text_layers` function marks what's pointable with one delegated listener on the body itself — a panel body can hold hundreds of text nodes, and a listener per node doesn't scale. The body is never recreated on redraws, only emptied and refilled by `paint()`. `text_fields()` draws the UI controls for whichever text element is selected; something outside this file listens for the `panel-text` event and calls it (workspace.js uses this same pattern for `panel-focus`).

## Edit flow and persistence

Every edit here mutates a drawing the TEMPLATE owns. The drawing is thrown away on every tone, template, and mirror change by `paint()`. The key insight: `persist.js` underneath writes each edit as an overlay on `panel.data.text` and replays it once the redraw has landed. One-way dependency: this file calls into `persist.js`, never the reverse. CSS classes: `.panel-text-hot`, `.panel-text-on` (here), `.panel-text-box`, `.panel-text-new` (drawn by persist.js), plus `.panel-item-on` (lives in display.css, owned by that file).

## Item selection (2026-08-19)

Click delegation also carries item selection — a cell one level up from a run, on flex/grid bodies only. The shape: a click that fails the SELECTOR test is checked as a potential item (a direct child of the body). `.panel-item-on` styling lives in display.css beside the custom properties it controls (see doc/focus.md).

## Deselection trap (2026-08-19)

A run is deselected only by clicking it again. Focus changes (switching to another panel, or to nothing) clear the run's selection here, in the one place that owns it. Bound once at module scope, the same way the `t` key listener is bound. The gauge (width badge showing "body · 57ch") survives losing the panel because it's the one place that clears it on panel focus — if the gauge outlived the old panel, its `.panel-text-on` ring stayed on the old run.

## Gauge design

The measure badge is positioned `fixed` and reused. Its two facts: the element's semantic level (heading/paragraph/etc., from `level_of()`) and line length in characters. Width is measured from the canvas context (a 2D ruler), not guessed from font-size, which is wrong by a third on condensed or wide typefaces.

A measure is meaningful only when text wraps. Judged on every run, the warning fires on correct work ("SHIPPED" is 11ch and has no problem) and is learned to be ignored.

## Edit behavior

Whole-run select on edit start, so the first keystroke replaces placeholder copy. Escape ends editing; Enter is NOT swallowed — a heading may legitimately wrap, and a layout tool that eats the return key cannot write two-line content. `plaintext-only` prevents a paste from bringing its own markup in (a panel is a layout, not a document).

## Measure wrapper

The "put this in a box" move every layout tool has — wrapping a text element in a container it does not have. The wrapper takes the layer's place in the flow and adopts it, so nothing moves. Selection stays on the RUN; the box is derived from the run's record and has no address of its own for styling. Buttons wrap in one of three tags: div (a box for layout), section (semantic meaning), or figure (semantic meaning).

## T key behavior

`T` aims at what you're looking at (the focused panel or the panel under the pointer) rather than a stored selection. It must work on ANY panel, including those with no prose at all — a scene or a clock don't match SELECTOR, so T is broken if it does nothing there. The move: grow fresh content if needed (`fresh($body)`). Bound once at module scope; checks `typing()` first to prevent the startup keystroke from being caught again by the next keystroke and restarting it.

## Properties.js integration

`item_selection()` is the one door for properties.js onto the cell selection state. It's self-healing: a template redraw destroys the DOM node and the rail's hold on it, but the reference survives. Words written by `items_apply()` survive and replay by key; a stale read (the DOM node is gone) clears itself rather than showing a ghost selection on the rail.
