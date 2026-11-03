One `WeakMap<Element, Draggable>` for the **whole document** — every instance,
grip or drop-only, adds itself in `initialize()` and removes itself in
`destroy()`. `under()` walks `document.elementsFromPoint` and looks each element
up here; that is also how "the innermost registered container" is found, since
the browser's own hit-test order does the sorting for free.

**Usage** — a static, not per-instance, because one drag needs to find instances
belonging to *other* nodes, and a document only has one DOM to search.

A `WeakMap`, so a re-render that drops the old element without calling
`destroy()` leaks nothing — the entry collects with the element. Call
`destroy()` only when you keep the element and want the drag off it.
