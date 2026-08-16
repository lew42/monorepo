Cancels any gesture in progress, then removes the bound listeners
`initialize()` attached, drops the `Escape` handler, and deletes the
`Draggable.registry` entry.

⚠ **Not called automatically.** The registry is a `WeakMap`, so a re-render that
drops the old element without calling this leaks nothing — the entry collects
with the element. Call `destroy()` only when you keep the element and want the
drag off it. See [`registry`](../../api/registry/).
