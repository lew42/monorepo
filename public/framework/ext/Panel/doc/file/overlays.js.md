## overlays.js

The live chrome over one leaf's **body**, and the registry that releases it. Four
surfaces, each one line, each gated by `vocab.js`'s `tools(item)` at this single
call site:

```js overlays.js
if (t.align)   align_grid(item, $body);                        // the 3×3
if (t.text)    register(item, text_layers($body, item));       // hover/edit a run of copy
if (t.display) register(item, display_overlay(item, $body));   // what the flex/grid class is doing
if (t.repeat)  register(item, repeat_layers($body, item));     // the `+` at the end of a run
```

The two surfaces that are **not** on a body stay in `view()` beside the elements
they attach to: `split.js`'s edge strips (on the panel) and `insert.js`'s `+` (on
a split's `.panel-items`). The z-index budget all six share, and the two
different "innermost wins" idioms: [The five things drawn on a panel's
body](/framework/ext/Panel/doc/overlays/).

## ⚠ Called where the body is created, never from `paint()`

Everything above binds to `$body` **itself** — an element `paint()` empties but
does not replace. Called from there, every repaint would stack another set of
listeners and observers on the same node.

⚠ It also runs under the **panel's** captor, not the body's: `align_grid` and
`display_overlay` append a *sibling* of the body, so the body's own scrolling and
containment are untouched by the thing drawn over it. Anything here that returned
a promise would land in whatever the captor had since become.

## The disposer contract

```js overlays.js
const disposers = new WeakMap();                 // keyed by the workspace ROOT
export const drain = root => disposers.get(root)?.splice(0).forEach(dispose => dispose());
```

Every surface hands back a dispose function; `workspace.js`'s `draw()` drains the
**previous** generation before `$root.empty()` throws its DOM away. Keyed by the
root because that is the one object still in hand on the next redraw.

⚠ **Teardown is never left to the observer itself.** A surface that waits to
notice its own target is gone never fires for a body that was 0×0 or torn down
before its first layout — the measurement that settled it: one surface added
without a disposer leaked **+953 MutationObservers over 20 redraws**. With the
registry, 20 structural redraws of `/full/` hold flat at 96 MutationObservers and
59 ResizeObservers. A fifth body surface must return a disposer, or it is a leak.
