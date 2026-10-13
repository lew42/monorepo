Renders a task's `shots[]` (`ext/JSONL`'s `shot` verb) as a wall of lazy-loaded
thumbnails, clickable to full size. The one file in the module that has to
think about a route that might not exist — `/screenshot`
(`Server/plugins/Screenshots.js`) only answers on the dev server.

## `LOCAL` decides whether an `<img>` is ever created, not just whether it's shown

Off `localhost`, `thumb()` never creates an `<img src>` at all — only the
`.ai-shot-fallback` swatch. Hiding a broken image with CSS still means the
browser attempted the request; not creating the element means it never does.
On `localhost`, both elements are created (the fallback stays behind
`display: none` via `.missing`), because a route that exists on `:80` might
not exist yet on a throwaway instance that hasn't restarted — the `error`
event on the `<img>` is the only signal for that case, and it needs a
fallback element already in the DOM to reveal.

## Full size is a plain anchor, not a lightbox

`<a href target=_blank>` around the frame, only when `LOCAL` — clicking opens
`/screenshot?path=…` directly, which the browser renders as the image at its
real resolution. No JS lightbox, no second component: the browser already
knows how to show one image full-size.

## Improvements

1. **Thumbnails are the full-resolution PNG, sized down by CSS
   (`object-fit: cover` in a fixed-aspect frame) — not a server-generated
   thumbnail.** `loading="lazy"` keeps 100 logged shots from costing 100
   requests up front, but a shot that does scroll into view still downloads
   at full size. A real thumbnail would need an image-processing dependency
   (`sharp` or a canvas-based resize written to a second file), which is
   more machinery than this task's plumbing scope and LAW#4 (no new
   dependency without asking) covers. *(medium, deferred — matches the
   brief's own scoping: plumbing now, scoring/thumbnailing later.)*
