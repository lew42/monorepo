# Focus, and the panel that reads it

`properties` is a `T` entry like any other, and the panel that wears it inspects
whichever panel is **focused** — its template, tone, alignment and sizing, as
live controls. Two of them side by side both track the same panel, because an
inspector is a panel: layering, resizing, dragging and persistence all come from
the workspace it is already in.

The recommendation this implements, with the four candidates it was chosen over:
[sidebar strategy](/framework/ai/2026-08-15/panel-ui-overhaul/doc/sidebar-strategy.md).

## Focus is a selection, and selections do not serialize

```js workspace.js
export const focused = item => { const root = item.root(); return root.find(root.focus); };
```

`root.focus` is an **id on the root panel's instance**, exactly where
`root.templates` already rides — assigned by the view, never by `hydrate()`, and
absent from `toJSON()`, which emits `type`, `id`, `data` and `items` only. A
panels.json diff across a session of clicking confirms it: the file gains
`template`, `tone`, `align` and `mode` from the inspector's own writes and
nothing else.

An **id** rather than a node, for the reason `ext/editor` records: a structural
verb can leave a remembered object detached from the tree it came out of. Reading
through `root.find(id)` means a focused panel that has left the document simply
resolves to nothing.

## What takes focus, and what does not

A click on a panel's **own bar or body** — nothing else:

```js workspace.js
.click(e => {
    if (e.target.closest(".panel-bar, .panel-body")?.parentElement !== $panel.el) return;
    if (!inspects(item)) focus(item, $panel);
});
```

The `parentElement` test is what makes the **innermost** panel win: a click in a
nested leaf bubbles through every ancestor's handler, and only the leaf's own
body answers to it. No listener stops anybody's event, which is what keeps the
templates' own interactive content (`space`'s dice, a section band's buttons)
working.

⚠ **A grip is deliberately outside that test.** The divider between two panels
lives in `.panel-items`, and `setPointerCapture` retargets the click at the end
of a resize — so before this rule, dragging a seam focused the split that owned
it. A drag is not a selection.

**An inspector never takes focus.** `focus: true` on a `T` entry means "this
entry reads the focused panel", and `inspects()` is the one predicate over it. A
clicked inspector that focused itself would be holding controls that edit the
panel the controls are inside — one click on `template` and the surface you were
using is a clock. The consequence is that an inspector's own words are edited
from its own bar, which is where a lone panel's properties have always lived.

**Deselecting is Escape**, or anyone dispatching `panel-unfocus` on the
document — the dev rail's `page` button is the second one. A click cannot be the
toggle: the test above answers to a click anywhere in a panel's **body**, so
using what is inside a panel would be how you let go of it. Restricting the
toggle to the bar was the other candidate and is worse — the bar is a row of
buttons, and every one of them would drop the selection as a side effect.

**And the selection is announced on the document**, because an `Item` event only
reaches something holding the root, and nothing outside a workspace ever does:

```js workspace.js
const announce = item => document.dispatchEvent(new CustomEvent("panel-focus", { detail: item ?? null }));
```

`dev/DevBar/layout.js` listens and points `ext/LayoutTool` at the focused panel,
so clicking a panel measures *that panel* — 13 nodes and 129px rather than the
page's 948 and 1328 — and Escape puts the tool back on `.app`. Two event names
and the `.panel.focus` class are the whole contract; neither module imports the
other, and nothing here knows whether anybody is listening.

⚠ The listeners are bound to the **document** and unbind themselves once
`$root.el.isConnected` goes false, the same self-cancelling shape
`properties.js` uses: the root outlives every DOM it draws, so nothing else was
ever going to remove them.

**Focus clears when its panel leaves the tree**, and nothing takes its place:

```js workspace.js
root.on("remove", () => queueMicrotask(() => {
    if (!root.focus || root.find(root.focus)) return;
    delete root.focus;
    root.emit("focus", null);
}));
```

Falling back to the parent was the alternative and reads worse: closing a panel
would silently point every inspector at a split nobody selected. The empty state
says what to do instead. ⚠ The microtask is load-bearing — `Item.move()` is a
`remove` followed by an `insert`, so a synchronous check would unfocus a panel
in the middle of being dragged.

## The affordance appears only where something reads it

```css panel.css
.panel-workspace:has(.panel-props) .panel.focus::after { … inset 0 0 0 2px var(--prim) … }
```

The class is always written; the ring is drawn only in a workspace that actually
contains an inspector. A demo that is one `panel("clock")` gains no new
decoration, `ext/editor`'s five regions are untouched, and the moment the last
inspector is switched away the mark goes with it. A pseudo-element, so it costs
the panel no border box and nothing reflows; `z-index: 2`, under the bar's 3.

## How the inspector re-renders — and unbinds

Two listeners on the root, because `Item` events bubble up to it: `focus` (the
selection moved) and `change` (any panel's data changed — `Item.emit` does not
say which, and re-reading the focused panel is cheaper than caring).

```js properties.js
const hear = () => { $props.el.closest(".panel-workspace") ? render() : stop(); };
const stop = () => { root.off("focus", hear); root.off("change", hear); };
```

The root outlives every panel drawn from it, so a listener bound to it survives
the DOM it was drawing — a template switch, a structural redraw, a close. Rather
than a teardown hook the module does not have, each listener asks whether it is
still in a workspace and **unbinds itself** if it is not: one wasted round, then
gone. (`clock`'s self-cancelling timer is the same shape.) `emit()` iterates a
copy of its listener list, so unbinding during a dispatch is safe.

⚠ **Every refill is inside `$el.empty(fn)`** — `render()` never builds a factory
after an `await`, and the entry itself is the lazy-import-resolving-to-a-function
shape the rest of `templates.js` uses.

## Writing back: `set()`, then `repaint()`

Every chip is `target.set(key, value)` — the same call the bar makes, so the
root's own listener saves and no second write path exists. What the inspector
does *not* have is the target's DOM, which the bar gets for free from
`view()`. Hence one exported function:

```js workspace.js
export function repaint(item){
    const seen = views.get(item);
    if (!seen) return item;

    seen.$panel[item.get("mode") === "hug" ? "ac" : "rc"]("hug");
    seen.$items?.[item.get("dir") === "col" ? "ac" : "rc"]("v");
    if (seen.$body) paint(item, seen.$body);
    return item;
}
```

`views` is a `WeakMap` rewritten on every draw. The alternative was making
`change` redraw the whole tree, which is precisely the thing `mount()` refuses to
do — a control whose own event destroys the element holding it. Redrawing *one
other panel* has no such problem.

## What the inspector offers is what the bar offers

A leaf gets `template`, `tone`, `align`, `mode`; a split gets `dir`. ⚠ `hug` on a
split collapses it to 0px — measured: a hugged split's children size themselves
from a parent that is sizing itself from them, and the result is a panel with no
box left to point at. The bar withholds the button for the same reason (it sits
inside `if ($body)`), and the grip's hug/fill menu — the last door that could
still reach a split — now filters it too (`mode !== "hug" || item.leaf()`),
offering `fill` on both sides and leaving hug's grid cell blank beside a split.

The template picker is the bar's popover with room: icons, `auto-fill`ed to
whatever width the region has, so a 28-entry vocabulary is four rows in a rail
and two in a wide one. Word sets keep their declared column count, because
`align` is a 3×3 or it is not a picture of the nine placements.

## Still open

- **The workspace's own words are not here.** `grow` is the grip's, and a
  panel's size is still edited by dragging a seam. Whether the inspector should
  grow a number field for it is unanswered.
- **`ext/editor` has not adopted it.** Its `properties` region is still
  hand-rolled from `ext/layout`'s word registry, inspecting the selected
  *block*, which is a different subject to a panel. Nothing about this change
  touches it: the editor's five regions carry no `focus: true`, so no panel in
  it takes focus and no ring is drawn.
- **A second inspector is a second full re-render on every change.** Fine at two;
  the listener count is one pair per inspector per draw, pruned lazily.
