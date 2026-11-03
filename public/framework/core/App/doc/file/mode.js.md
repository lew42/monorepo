Light / dark / auto as one button, plus the no-button variant. Four functions, two
exported, no class — theme-agnostic behaviour that lives beside `App` rather than
under a theme, because any theme shipping both modes wants it. Full record:
`../mode.md`.

## The `queueMicrotask` is not decoration

`mode(app)` can run *inside* `div.c("app", …)`'s own capture callback, before
`app.$app` is assigned. Applying synchronously would be a silent no-op — a stored
mode simply forgotten on reload. This is the one line in the file that is not
self-evident from reading it.

## `mode.apply` is not sugar for `mode()`

One renders a button and applies; the other only applies. A route with no sidebar
needs the second without the first — `app.js` calls it directly in `render()`.

## Improvements

1. **The second `try/catch` around `localStorage.setItem` swallows a write failure
   with no warning** — a private-mode Safari reader's choice is silently not
   saved, and nothing tells them. A `console.warn` in the `catch` would cost one
   line and remove the only unrecorded silent failure in this file. *(simple,
   useful.)*
2. **`current` is per-button state.** Two `mode()` buttons on one page would each
   track their own idea of the cycle, agreeing only because both write the same
   `localStorage` key. No page currently renders two, so this is speculative.
   *(simple, speculative.)*
