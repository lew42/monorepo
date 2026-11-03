`Page.prototype.catalog()` — patched on by `import`, the same move
[`tabs()`](/framework/ext/tabs/) makes. Call it from `initialize()`, never
`content()`:

```js
initialize(){ this.catalog(); }
```

## What it guarantees

Every existing child stays exactly what it was — same names, same order, same
`Page` instances. One entry is added, `"intro"`, built from this page's own
`title`/`label`/`icon`/`content` and inserted **first**. `content` is then
replaced with the rail-plus-region renderer, so `render()` still calls
`this.content()` the same way it always did — the method just changed what
that name points at.

## What a caller must know

**It has to run before the router walks.** A child is only linkable — and
only reachable by a deep link — if it exists before `load_all_children()`
resolves urls against it. `Page`'s constructor calls `initialize()` first and
`load_all_children()` second for exactly this reason; calling `catalog()`
from `content()` (which runs on `render()`, long after routing) would give
the intro card a url nothing points at.

**The moved `content` keeps its original `this`.** It was written as a page
method — `this.whole()`, `this.parent`, whatever it already called — and
`catalog()` doesn't rebind it, it wraps it: `() => content.call(this)`. A
`content` that captured some *other* `this` before the call (an arrow
function torn out of a different object) would keep capturing the wrong one;
nothing about `catalog()` changes that.

**Idempotence isn't guarded.** A second call rebuilds `rest` from the
already-catalog'd children (`"intro"` included) and re-wraps the already-
wrapped `content`, which is now the renderer itself. Nothing on this site
calls it twice, so the failure mode is theoretical — see the file doc for the
one-line guard that would close it.

**A rail of one hides itself**, in CSS (`catalog.css`) — a page with `intro`
and no other children still fills its region, just with no rail beside it.

## What's replaced

If [Highlight](/framework/ext/highlight/) is loaded, the source pane above
shows the live patched function — an anonymous function assigned to
`Page.prototype.catalog`, which is how this page's own banner detects and
labels the replacement (`ext/Doc/readme.md`, "A patched method shows the
patch").
