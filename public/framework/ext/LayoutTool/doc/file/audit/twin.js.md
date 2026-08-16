Before and after, side by side: the same url loaded into two iframes, the
right one carrying the proposed fixes as an injected `<style>`. Same-origin, so
the sheet goes straight into the frame's `head` — nothing is written to disk
just to see the difference.

## The frame renders at full size and is scaled down, not resized

`width: ${width}px` plus `transform: scale(...)` — a `width: 100%` iframe
would just be a *narrower viewport*, a different layout entirely, not a
smaller picture of the one being reported. `fit()` reads the pane's actual
`clientWidth` and computes the scale live.

## Fit is recalculated on every resize, not once on load

Taken once, the two panes could read their widths at different moments (the
grid settles asynchronously) and render at different scales — the one thing a
before/after comparison must never do. A `ResizeObserver` per pane keeps both
locked to the same formula continuously instead.

## Accepting writes to a queue, and the write is a full overwrite

`accept()` fetches the existing `accepted.css`, appends one entry, and
`Socket.singleton().async_rpc("write", ...)`s the whole file back — read-then-
write, not append, so two audits accepted in the same second would race. The
file itself is never loaded by anything; it's a patch for a human to read,
apply, and delete.

## Improvements

1. **The read-then-write race in `accept()` is named in the file's own
   comment but not guarded against** — acceptable today (one person, one
   browser, one click at a time) but worth a note in the readme's Open
   section rather than only a code comment, since it's a correctness gap a
   second contributor could hit without reading this specific file first.
   *(simple, useful.)*
2. **`proposals()` silently drops fixes past the fifth** (`.slice(0, 5)`) with
   no indication in the UI that more existed. A page with more than five
   distinct fix selectors would show an incomplete "whole of the difference"
   and nothing says so. *(simple, useful.)*
