## What this file is

The entry point and the only file most callers ever import. It owns three
things: `layout(fn)` (a box, pre-wired with its own bar), `layout.bar(target,
list)` (the bar alone, over anything), and what counts as a **selectable
region** — `region()` and `pointed()`. Everything else in the module (`panel.js`,
`body.js`, `words.js`, `controls.js`) exists to serve what this file exposes.

## `layout(fn)` vs `layout.bar(target)`

`layout(fn)` is sugar: it builds the box (`flex gap auto`, tokens set) *and* the
bar in one call, for the common case of "I don't have a box yet." `layout.bar()`
is the general form — bring your own `View`, `Element`, or `Page` — and
`layout(fn)` is implemented as a two-line wrapper around it. There is exactly one
way the bar gets built; `layout()` just also builds what it points at.

## `view_of()` is the whole target-type dispatch

Three duck-typed branches — `target.el` (already a View), `target.nodeType`
(a bare DOM element, wrapped in a throwaway `capture: false` View), or neither
(assumed to be a `Page`, read through its `.view`). This one function is what let
`layout.page()` (a second, near-duplicate function) be deleted — see
[The control vocabulary](/framework/ext/layout/doc/vocabulary/#one-toolbar-for-three-targets).

## `pointed()` and `mark()`

`pointed(root, el)` is the selection-depth rule: walk up from the real event
target until the parent lays its children out, and stop — see
[Selection](/framework/ext/layout/doc/selection/). `mark()` is the separate,
much simpler hover highlight (`.layout-hot`), reset on every `mouseover` via a
single module-level `hot` variable — deliberately not per-region state, since
only one element can be hovered at a time on a page.

## Improvements

1. **`view_of()`'s three branches have no fallback for "none of the above."**
   A target that is neither a View, a DOM node, nor a Page-shaped object (say, a
   plain object with no `.view`) resolves to `undefined` and `layout.bar()`
   returns silently with an empty strip — the same failure mode as a typo'd word
   in `layout.words`. One dev-mode `console.warn` when `view_of()` returns nothing
   would turn a silent no-op into a fixable mistake. *(simple, useful)*
2. **`region()` and `layout.bar()` both read `target`/`$el` after the same
   microtask, independently.** They already run inside the same callback, so this
   is not a bug, but the two side effects (marking the element a region, and
   drawing the bar) are one paragraph apart with no name tying them together.
   A short comment or a one-line helper (`activate($el)`) would make the pairing
   obvious to the next reader without changing behaviour. *(simple, speculative)*
3. **`layout.bar` is a static hung off the `layout` function, not a named
   export.** Both work today (`import layout from "..."` then `layout.bar(...)`,
   or a named `import { layout } from "..."`), but the module also does
   `export { layout }` at the bottom purely so the named form exists — worth
   confirming that second export still has a caller before the next pass; if not,
   it is a half-line of unused surface. *(simple, speculative)*
