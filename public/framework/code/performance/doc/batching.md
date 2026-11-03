# Batching DOM updates: measured (2026-10-12)

**The finding: the browser already paints once per frame, so batching does not mean "avoid repaints". The only slow way is reading layout between writes.**

1,000 rows × 5 cells, three writes per cell (an evented property fires more than once), headless Chromium, median of 5, time until the frame painted. Rerun: `node public/framework/code/performance/bench/bench.mjs` (counts come from a Chrome trace; the live page is [bench/](/framework/code/performance/bench/)).

| Strategy | painted ms | layouts | style recalcs |
|---|---|---|---|
| Loop with a layout read after every write | **6813** | 15001 | 15000 |
| Plain sync loop, writes only | 80 | 2 | 1 |
| display:none, update, show | 71 | 2 | 1 |
| Detach grid, update, re-attach | 72 | 2 | 1 |
| Clone swapped in as placeholder, update original, swap back (owner's idea) | 77 | 2 | 1 |
| Rebuild rows in a DocumentFragment | 90 | 2 | 1 |
| Queue, dedupe by cell, one `requestAnimationFrame` flush | **55** | 2 | 1 |

## What it means
- **Never read layout (`offsetHeight`, `getBoundingClientRect`, `scrollTop`) inside a write loop.** That one habit is 100× slower. Do all reads first, then all writes.
- **Clone-swap, detach, hide and fragment buy nothing** over a plain loop: the plain loop already lays out once. Clone-swap even costs two extra clones. Not recommended.
- **Coalescing wins by a little, and by a lot when a property fires repeatedly**: `Batch` (`code/performance/Batch.js`) keeps the last write per key, so 3 writes per cell cost 1. That is the helper to use for evented properties and live streams.
- Rows off screen are the bigger lever: windowing (`ext/DataGrid`) draws 20 rows, not 1,000.

## The helper
```js
import Batch from "/framework/code/performance/Batch.js";
Batch.set(cell, () => cell.textContent = value);   // same cell again before the frame: the earlier write is dropped
```
