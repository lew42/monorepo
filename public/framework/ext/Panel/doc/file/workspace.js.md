## workspace.js

The doors and the recursive view: `panel(seed)` and `workspace(options)`, the
`view()` that walks a `Panel` tree into DOM, and `paint()` for one leaf's body.
Post-split it is the *assembly* file — the bar is `toolbar.js`, the divider is
`grip.js`, the drag is `PanelDrag.js`, the `random` verb is `random.js`, and this
is the only file that calls all four.

## Two doors, one code path

`panel(seed)` is the default export: **one** managed leaf with no saver, so
`save()` resolves `false` and nothing survives a reload — the honest shape
for a throwaway example. Its `seed` takes three things now:

```js workspace.js
const made = seed instanceof Panel ? seed
	: typeof seed === "string" ? new Panel({ data: { template: seed } })
	: new Panel({ draw: seed });
```

A `Panel` is what `structure(seed)` hands back, so `panel(structure(42))` mounts a
whole rolled arrangement through the same door as `panel("clock")` — `mount()`
never cared how many panels it was given. `workspace(options)` is the persisted
document:
`Item.open(store)` loads or seeds a whole tree, then mounts it. Both end at
the same `mount()`/`view()` pair — there is no second rendering path for the
"just one panel" case.

⚠ **A failed load must not seed.** `Item.open(store)`'s promise rejects when
`Saver.load()` fails to read (as opposed to resolving `null` for a genuinely
absent file) — `workspace()`'s `.catch()` renders an inline error and returns
without touching `root.save()`, so a read failure can never roll a fresh
layout over the real one. See [Decisions](/framework/ext/Panel/docs/decisions/).

⚠ **The catch belongs to the LOAD, and to nothing after it.** It used to sit at
the end of the chain, where it also caught seed, mount, draw, view and paint — so
a template that threw while drawing put "Couldn't load the saved layout" on the
screen and "failed to load — leaving it untouched" in the console, both accusing
a file that was perfectly fine, while the real stack was swallowed. `.catch()`
now sits on the load promise and the render runs in the `.then()` after it:

```js workspace.js
Item.open(store).catch(error => { … }).then(loaded => { if (!loaded) return; … });
```

A render throw is then an ordinary uncaught rejection — the error as itself, with
its own stack — and `if (!loaded) return` is what keeps the handled-failure path
from seeding and saving.

⚠ **`workspace()`'s box is placed *now* and filled inside `.then()`** — the
factory-after-await trap, avoided correctly: `const $root = div.c(...)` runs
synchronously before the promise, and everything the promise resolves to is
built through `mount(root, $root)`, never through a bare factory call sitting
after the `await`.

## `view()` assembles; it owns no chrome of its own

It builds `.panel`, an empty `.panel-bar`, then either a `.panel-body` (leaf) or
a `.panel-items` whose children alternate `grip()` and a recursive `view()`.
The bar is filled by one `toolbar(item, $panel, $body, T)` call with the
vocabulary `T` this file prepares, and the drag is one `new PanelDrag({ handle:
$handle ?? false, … })` — `$handle` being `toolbar.js`'s `handle()`, because a
bar-wide handle would eat every button's click.

⚠ **A block body, not an expression**: `item.items.each(…)` returns the List,
and `append_fn` appends a returned value — an expression arrow puts a bare
`[object Object]` text node in every split.

## The template vocabulary rides the root panel, never the tree

```js workspace.js
const vocab = item => item.root().templates ?? templates;
```

`root.templates = vocabulary` is an **instance property**, set once when a
workspace opens with its own `templates:` option (what `ext/editor` does) —
never serialized, and read by walking up to the root rather than being
copied onto every node. This is why an editor's five regions never leak into
another page's `T` menu. `offer(item)` is the one predicate on top of it: only a
workspace using the *global* vocabulary is offered `random`, which would
otherwise give an editor two canvases.

The same predicate gates the layout roll, one line down in the `T` this file
prepares:

```js workspace.js
sow: vocab(item) === templates && (() => import("./generate.js").then(m => m.sow(item))),
```

Lazy for the same reason `space` is: the layout space stays off every page that
only wanted a panel — `/framework/`'s homepage clock does not fetch a generator.
The mutation landing after a microtask is safe because `sow()` only **moves
items**; the DOM is rebuilt afterwards by `draw()`, inside `$root.empty(fn)`,
which is what re-establishes the captor.

## Structural redraws only

```js workspace.js
["change", "add", "remove"].forEach(event => root.on(event, () => root.save()));
["add", "remove"].forEach(event => root.on(event, draw));
```

`change` (an align/tone/mode edit) saves but never redraws the tree — only
`add`/`remove` (a divide, a close, a drag landing) does. ⚠ If `change` also
redrew, a control's own `change` handler could destroy the element whose
event is currently running — which is why `toolbar.js`'s hug/fill button writes
its classes by hand. `draw()` also guards re-entrance (`drawing`), because
`resolve()` mutates the tree and its `add`s must not re-enter.

⚠ **`drawing` lives at module scope, and one roll is one redraw.** The guard used
to sit inside `mount()`'s closure, which covered the seeding path and nothing
else — so a user's `random` roll, which adds up to twelve panels through
`scatter()`, rebuilt the entire workspace DOM once per panel and refetched every
lazy template with it. Measured on the docs page: one roll, six panels, **five**
full rebuilds. `roll()` now raises the same flag and emits the one `add` the
suppressed ones owe, and the same roll costs **one**. Module scope is safe
because nothing awaits between raising the flag and lowering it, so one
workspace's mutation window can never overlap another's.

## `paint()` — one panel's DOM, and the rule for whose content wins

```js workspace.js
const draw = item.data.template ? template.draw : item.draw ?? template.draw;
```

`panel(fn)`'s own content holds the body until somebody picks from `T` — an
explicit choice in `data` wins over the instance's `draw`, permanently.

⚠ **A name no vocabulary has draws nothing, and now says so.** `paint()` still
falls back to `{ draw(){} }`, but a *chosen* name that misses gets one
`console.warn` carrying the name — the failure this module is otherwise careful
to make loud. It is `item.data.template`, not `get("template")`, that is tested:
a fresh pane in `ext/editor` wears `Panel.defaults`' `"blank"`, which that
workspace's five regions rightly do not have, and a default is not a typo. Two
things write real names — the `T` menu and `generate.js`'s `PANELS` map — and
both land in `data`.

## Focus rides the root, like the vocabulary does

```js workspace.js
export const focused = item => { const root = item.root(); return root.find(root.focus); };
```

`root.focus` is an **id**, assigned on a click and never serialized — the same
instance-property trick as `root.templates`, and for the same reason: it is
state about *this session's view*, not about the document. `view()` writes the
`focus` class from it on every draw, `focus()` moves it, and one `remove`
listener clears it (in a microtask, because `move()` is a remove then an insert).
An entry declaring `focus: true` reads it and is never handed it.

Two more doors, both on the **document** rather than on the item tree, because
an `Item` event only reaches something holding the root: `announce()` dispatches
`panel-focus` so anything at all can follow the selection (the dev rail points
`ext/LayoutTool` at the focused panel), and `drop()` answers Escape *and* a
`panel-unfocus` event so anything can ask for it back. Both listeners unbind
themselves once `$root` leaves the document — the root outlives every DOM it
draws, so nothing else would. The whole model, including what the ring is
guarded by:
[Focus, and the panel that reads it](/framework/ext/Panel/docs/focus/).

## `repaint(item)` — the DOM of a panel you are not inside

```js workspace.js
const views = new WeakMap();
```

`view()` records `{ $panel, $body, $items }` per item as it builds, so a control
living in *another* panel can redraw the one it is editing — the part the bar
gets for free from its own closure. `repaint()` re-syncs `hug`, the split axis
and `paint()`, which is exactly what the bar writes by hand as it clicks. Weak,
so a closed panel's entry goes with the panel.

⚠ It exists because `change` must not redraw the tree (above). Rebuilding one
*other* panel has none of that problem — nothing in the running handler is inside
it.

⚠ **The bar's `sow` verb goes through it too.** A rolled seed that translates to a
*single leaf* moves no children, so no `add` reaches the workspace and the click
was dead — no repaint, no save (43 of 5000 seeds; 170, 248, 295, 415 are the first
four). `generate.js` now emits the `change` that saves, and the call site
repaints the panel it just changed: `.then(m => repaint(m.sow(item)))`.

## The roll lives in `random.js`; the vocabulary it draws from lives here

```js workspace.js
scatter(item, vocab(item));           // a split re-draws itself through `add`
resolve(root, vocab(root));           // the guarded pre-pass, before the DOM is touched
if (fresh) seed(root, vocab(root));   // `seed` defaults to scatter
```

`scatter()` and `resolve()` moved out (~25 lines), and they take the vocabulary as
an argument — which is the whole reason the extraction is **one-way**:
`random.js` imports nothing of this file, so the two never circle. Three call
sites hand it in, each saying whose vocabulary it means, and a caller's own
`seed` gets the same second argument (`ext/editor`'s one-parameter arrow simply
ignores it). `scatter` is re-exported from here, so the name still resolves at
its old address.

⚠ **`roll()` stayed.** It is the `T` menu's take callback, not the roll: it reads
one name, and for anything but `random` that is `set("template")` then `paint()` —
`paint()` being this file's private business. Moving it would have meant exporting
`paint` to a module with no other reason to know the DOM exists.

Picking `random` from `T` **commits** what it rolled, so a reload returns the same
arrangement rather than a new one; the full argument is in
[Decisions](/framework/ext/Panel/docs/decisions/).

## Improvements

1. **`paint()` used to fall back to `{ draw(){} }` in silence** when the saved
   `template` name was not in the vocabulary — a renamed template, or a typo in
   `generate.js`'s `PANELS` map, came back as a blank body with nothing logged.
   One `console.warn` closed it (above); the fallback itself stays, because a
   document that names one dead template should still render every other panel
   in it. *(simple, important — done)*
2. **The saver-selection line (`dev ? new FileSaver(...) : new
   LocalStorageSaver(...)`) is duplicated in `ext/editor/page.js`**, which has
   since grown a local `store(path, key)` helper this file did not. A shared
   helper in `ext/Saver`, imported by both, would keep the one place this needs
   to change in step — flagged by the 2026-08-14 review, still open.
   *(simple, important)*
3. **`scatter()` and `resolve()` were the `random` verb living beside the doors
   and the view** — the one idea here that was not assembly, and the same seam
   the toolbar/grip split followed. They are `random.js` now, with the
   vocabulary passed in so the import stays one-way. `roll()` stayed, for the
   reason above. The room the move made has since been
   refilled by focus and `repaint()`, which is the standing question in
   [Decisions](/framework/ext/Panel/docs/decisions/)' Open rather than a
   running total worth keeping here. *(medium — done)*
