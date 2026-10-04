# Draggable — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Two classes. `Draggable` is grab-and-move: pointer capture, hit-testing, a
`drop_check` on the dragging instance, and a `cancel()` that commits nothing.
`Sortable extends Draggable` is reorder-a-collection: a ghost, a placeholder, and
`locate(e)` → a **position** rather than a target, so reorder, cross-list and nest
are one code path ending in `item.move(parent, before)`. What each adds on top of
the other: [`sortable.md`](./sortable.md).

Neither file imports `Item` or `List`. The whole coupling is `item.move()` and
whatever `drop_check` you write. `page.js` imports both, because a demo needs
something real to drag.

```js
new Sortable({ view: $node, handle: $bar, $items, item });   // a row, and a box rows land in
new Sortable({ view: $node, handle: false, $items, item });  // drop site only — nothing to grab
```

## Traps

- **`handle: false`, not `handle: null`.** `??=` fills in `null` and `undefined`
  alike, so `null` silently becomes `this.view` and your column grows a grip.
- **A container's `$items` must be inside its `view.el`.** Hit-testing walks the
  chain `elementsFromPoint` returns; a rows-box parked outside the registered
  element is never found and the container is undroppable.
- **The descendant guard is yours to write.** `Draggable.drop_check` defaults to
  `target !== this` and stops there. `Item.contains()` is *strict* — `contains(this)`
  is false — so the working guard is both halves:
  `target !== this && !this.item.contains(target.item)`. Without it, dropping a
  container into its own child makes a cycle inside ten minutes.
- **One `Draggable.registry` for the whole document.** A page with more than one
  `Sortable` tree needs a *third* clause — `target.item?.root() === this.item.root()`
  — or a drag can cross from one tree into the other. Both real callers
  (`ext/Panel`, `ext/editor`) add it; this module's own demo doesn't need to,
  because it only ever shows one tree. Copy the three-part version, not the demo's.
- **Nothing real moves during a drag.** The ghost and the placeholder move; the
  live node just wears `.drag-source`. That is why `cancel()` is four lines.
- **A re-render leaves orphaned instances.** Rebuilding the view drops the old
  elements, and the registry is a `WeakMap`, so they collect. Call `destroy()`
  only when you keep the element and want the drag off it.

## Decisions

Pointer capture over document listeners, `elementsFromPoint` over `e.target`,
the filter living on the dragging instance rather than the target, `pointercancel`
as an abort not a drop, two classes rather than one, and what `locate()` returns
and why — each one weighed, with the alternative and its cost:
[`verdicts.md`](./verdicts.md).

## Deferred

**Edge bands.** `locate()` picks a container, then a slot by child midpoints. Near
the top or bottom edge of a nested container the intended target is often the
*parent*, and midpoints alone cannot say so. The refinement — a few pixels of
outer band that resolve to the parent — is deliberately not here: `locate()` is a
single overridable method precisely so it can arrive as one replacement rather
than as flags on this one.

Also deferred: horizontal lists (the midpoint test is `clientY` only),
multi-select, and auto-scroll when the cursor nears the edge of a scrolling box.

## Who uses this

- **[`ext/Panel`](/framework/ext/Panel/)** — `PanelDrag.js` extends `Sortable`
  outright and reads `Draggable.registry` directly to find the panel on either
  side of a drop, for the drag-to-repane gesture.
- **[`ext/editor`](/framework/ext/editor/)** — `page.js`'s `Node` extends
  `Sortable` to reorder and reparent the demo tree the editor shell shows.

Both are real subclasses, not callers of a public function — `Sortable` is meant
to be extended, not configured, and these are the only two places that do.

## 2026-08-19 — `.drag-source` needed an inline write, not just a class

Layer order is `base theme site util`; `draggable.css`'s `.drag-source { display: none }`
sits in `@layer theme`, so any dragged row that also carries a util display class
(`.flex`, `@layer util`) kept rendering — `getComputedStyle(source).display` read `flex`
mid-drag, and the container grew by the ghost's height the instant `pointerdown` fired
(found by `ui-test-skill` run 2; measured **71px** on this page's Todo column). Util
always wins over theme regardless of specificity, so no class-level rule could ever be
the fix.

**Fix:** `Sortable.start()` now also writes the source's **inline** `style.display = "none"`
(via `View.style()`), and `end()` restores whatever inline value was there before —
inline beats every layer, cascade or not. Four lines, `Sortable.js` only;
`Draggable.js` and `draggable.css` are untouched.

**The CSS rule stays**, deliberately not commented out or deleted: it is no longer the
thing that decides the source's visibility (the inline write always wins now), but it is
harmless — CSS can't override an inline value — and it remains the correct default for
any future caller that adds `.drag-source` without going through `Sortable`'s own
`start()`/`end()`. Killing it would save nothing and risk a silent regression if that
assumption ever stops holding.

## 2026-10-03 — the ghost lost its font and colour mid-drag

`Sortable.start()` built the ghost with `document.body.append(this.ghost)`. `position:
fixed` needs no particular parent to measure from the viewport, so that always looked
safe — but `document.body` sits OUTSIDE every themed/scoped ancestor (a dark island, a
card's own font), and a cloned node reads its *inherited* properties (font-family, color,
any custom property set by an ancestor selector) from wherever it actually lives in the
DOM, not from where it was copied. A row dragged out of a themed section rendered its
ghost in the page's own default font and colour instead of the row's (found live,
2026-10-03, the owner).

**Fix:** `start()` now does `this.view.el.after(this.ghost)` — the ghost becomes a
sibling of the row it was cloned from, staying inside every ancestor the row was inside.
`position: fixed` still measures from the viewport wherever a fixed element sits in the
DOM, *unless* some ancestor between it and `<html>` sets `transform`, `filter` or
`contain` (none of this framework's row containers do — if one ever does, its fixed
descendants already behave differently, not just the ghost). Verified with a two-font
probe page (Georgia/blue inside a themed wrapper vs. Courier/red on body): the ghost now
reads `Georgia, serif` / `rgb(0, 0, 255)`, matching its row, not the body default.

**Alternative considered:** snapshot the row's computed font/colour onto the ghost's
inline style and keep appending to `body`. Rejected — it only patches the properties
named in advance (font, color), while staying in the DOM inherits *everything* the row
inherited, including a future ancestor rule nobody thought to snapshot. One mechanism,
not a growing list of copied properties.

## 2026-10-03 — default sortable stays opt-in for every page/card type

Asked to "decide which card types are sortable by default: rankings the owner can
override." Decision: **no type gets an automatic default** — `{"sortable": true}` on a
page's own data (`core/Page/Page.class.js`, commit `9f6bf7ec`, the same day) stays the
only way a content-list drags, for every type alike.

**Why:** a ranking and a plain read list look identical in the data model — `Page` has
no `role`/`kind`/`type` field today that reliably marks "this list is order-sensitive."
Guessing from the page's title or path would be the kind of silent magic Law 6 warns
against (one flag, one meaning, not an inferred one), and a wrong guess is asymmetric:
a read-only canonical list that starts grabbing by accident reorders real data, while a
ranking that stays one click short of sortable just needs the flag added. The owner's
own "the owner can override" already names the real mechanism — this flag, set per page
— so there is nothing left to build; this entry exists so the next agent doesn't
reopen the question and build a parallel "smart default" system (Law 6).
