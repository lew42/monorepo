## paint.js

One panel's own DOM, never the tree. `workspace.js` owns the recursive `view()`
and the structural redraw; everything here rewrites what is already on screen —
which is the whole reason it can run inside a live event handler.

## `paint(item, $body)` — whose content wins

```js paint.js
const draw = item.data.template ? template.draw : item.draw ?? template.draw;
```

`panel(fn)`'s own content holds the body until somebody picks from `T` — an
explicit choice in `data` wins over the instance's `draw`, permanently.

⚠ **`text_commit($body)` runs FIRST.** A template redraw destroys everything the
user typed into this body, and a run still being typed into has not been written
down yet — `text.js` saves on blur.

⚠ **A name no vocabulary has draws nothing, and says so.** The fallback stays
`{ draw(){} }`, so a document naming one dead template still renders every other
panel in it, but a *chosen* name that misses gets one `console.warn` carrying it.
It is `item.data.template`, not `get("template")`, that is tested: a fresh pane in
`ext/editor` wears `Panel.defaults`' `"blank"`, which that workspace's regions
rightly do not have, and a default is not a typo.

⚠ **`text_apply` and `repeat_apply` are synchronous, right after the draw** — so a
template that draws synchronously never flashes without the user's own edits or a
repeat run's saved clones. A lazy template lands a tick later, and each module's
own observer replays onto that.

## `views` and `repaint(item)` — the DOM of a panel you are not inside

```js paint.js
export const views = new WeakMap();      // `view()` is its only writer
```

`view()` records `{ $panel, $body, $items }` per item as it builds, so a control
living in *another* panel — the `properties` inspector, which holds no part of its
target — can redraw the one it is editing. Weak, so a closed panel's entry goes
with the panel.

⚠ It exists because `change` must **not** redraw the tree: rebuilding the
workspace from inside a chip's own handler would replace the element that handler
is holding. Rebuilding one *other* panel has none of that problem.

## `repaint_mirrors(root)` — live duplicates

```js paint.js
root.walk(panel => panel.data.mirror && masters.add(panel.data.mirror));
root.walk(panel => (panel.data.mirror || masters.has(panel.id)) && repaint(panel));
```

Wired to the root's `change` in `mount()`. ⚠ `change` carries key/value/old and
**not** the item that raised it, so there is nothing here to match a master
against — and with tens of panels, repainting every *linked* panel on any change
is far cheaper than growing an event signature four other listeners already read.

⚠ **Masters are linked too.** A shared key is written to the master, so a
duplicate edited on the copy would leave the original showing the old value —
invisible while `tone` was the loudest shared key, obvious the moment `text`
joined it. No echo is possible: `repaint()` redraws DOM and never calls `set()`.

## `show(item, $body)` — the single writer of the display class

One class, swapped; `display.css` says what each one means, so nothing here
decides a layout. `display.js` reads `item.get("display")` rather than the class
precisely because this is its only writer.
