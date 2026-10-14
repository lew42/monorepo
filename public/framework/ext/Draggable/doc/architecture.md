# Draggable architecture — grab a View, hit-test the registry, commit through the dragger

Draggable is grab-and-move for any View; Sortable reorders a collection, across lists and into nested containers, on the same code path. Entry points: [`Draggable.js`](../Draggable.js) (grab, hit-test, cancel) and [`Sortable.js`](../Sortable.js) (ghost, placeholder, `locate`). Styles: [`draggable.css`](../draggable.css).

## Two classes, not one

**Decided:** `Draggable` does grab-and-move; `Sortable extends Draggable` reorders a collection. Sortable overrides `release()` outright.
**Why:** reordering commits a position, grab-and-move commits a target. Forcing both through one `drop()` made each harder to read.
**Instead:** one class with flags. Cost: every flag is a branch in the gesture path.
**Detail:** [verdicts.md](./verdicts.md#one-class-or-two)

## Neither class imports Item or List

**Decided:** the only coupling is `item.move()` (Sortable's commit) and whatever `drop_check` the caller writes.
**Why:** the caller owns the data model; the drag code stays the same for a Panel, an editor or a demo.
**Instead:** importing `Item` for `contains()` and `List` for `move()` inside the class. Cost: the drag code is tied to one tree model.
**Detail:** [decisions.md](./decisions.md#traps)

## Pointer capture for the whole gesture

**Decided:** `grab()` calls `setPointerCapture`, and every later move and up event lands back on the handle until release.
**Why:** there is no document listener to leak and no teardown to get wrong.
**Instead:** `document` listeners. Cost: a teardown path per listener, and an easy leak.
**Detail:** [verdicts.md](./verdicts.md#pointer-capture-or-document-listeners)

## Hit-test with elementsFromPoint, not e.target

**Decided:** `under()` walks `document.elementsFromPoint` and skips the dragged view by hand.
**Why:** under capture `e.target` is the handle. Making the live node `pointer-events: none` would change the thing being dragged.
**Instead:** `e.target`, or `pointer-events: none` on the source. Cost: a lie to anything else reading the DOM.
**Detail:** [verdicts.md](./verdicts.md#hit-testing-etarget-or-elementsfrompoint)

## The drop_check lives on the dragging instance

**Decided:** `drop_check(target)` is overridden on the dragger and stops cycles, types and capacity in one place.
**Why:** a target-side filter would make every container know every payload. Sortable also routes its preview through this check, so the placeholder and the commit always agree.
**Instead:** a target-side `accepts`. Cost: each container must know each payload.
**Detail:** [verdicts.md](./verdicts.md#where-does-the-filter-live)

## Nothing real moves mid-drag

**Decided:** a ghost follows the cursor and a placeholder marks the slot; the live node is hidden with inline `display: none`.
**Why:** a util class such as `.flex` outranks the theme rule in `draggable.css`, so only an inline write hides the source reliably. The same design makes cancel cost one method.
**Instead:** moving the live node. Cost: cancel must then put it back, and a stray frame shows it in the wrong place.
**Detail:** [decisions.md](./decisions.md#2026-08-19-drag-source-needed-an-inline-write-not-just-a-class)

## The ghost stays inside its parent

**Decided:** `start()` inserts the ghost as a sibling of the row (`view.el.after`), not on `document.body`.
**Why:** a clone inherits its font and colour from where it sits in the DOM. On body it lost the row's themed styles.
**Instead:** copying the computed font and colour onto the ghost. Cost: every inherited property must be listed in advance.
**Detail:** [decisions.md](./decisions.md#2026-10-03-the-ghost-lost-its-font-and-colour-mid-drag)

## pointercancel and Escape are an abort

**Decided:** both call `cancel()`, which ends the gesture and restores the DOM. Nothing commits.
**Why:** a cancelled gesture means the user did not mean the drop.
**Instead:** treating cancel as a drop. Cost: an accidental move on every stray touch.
**Detail:** [verdicts.md](./verdicts.md#does-pointercancel-commit)

## locate() returns a position, never an index

**Decided:** `locate(e)` returns `{ list, before }`, where `list` is the destination Sortable and `before` is an Item or `null` (append).
**Why:** an index invites off-by-one errors; an Item cannot be wrong.
**Instead:** an index, or an Item-to-element map nothing else needs. Cost: mixed types in one pair.
**Detail:** [verdicts.md](./verdicts.md#what-does-locate-return)

## A handle of `false` means a drop site only

**Decided:** `handle: false` makes an instance a drop target with nothing to grab. Only `null` and `undefined` fall back to the view.
**Why:** `this.handle ??= this.view` would quietly turn `null` into a grip.
**Instead:** `handle: null`, which `??=` turns into the whole view and so a grip appears on the column. Cost: a silent, visible bug.
**Detail:** [decisions.md](./decisions.md#traps)

⚠ Sortable's commit hardcodes `where.list.item.items.move(...)`. A row's Item must therefore hold an `items` List, and a Page is not one. The workaround is recorded in [the census note](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/page-on-item).

## Deferred, not built

Edge bands (a few pixels of outer margin that resolve to the parent), horizontal lists, multi-select and auto-scroll are deliberately absent. `locate()` is the one overridable seam where an edge band would arrive. See [decisions.md](./decisions.md#deferred).
