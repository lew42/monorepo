# Performance — big data on a page without freezing the machine

A page should stay smooth with thousands of rows and multi-megabyte logs. The rule of thumb: **the browser only does work for what's on screen, and every page knows how long it took to load.**

## The four challenges (numbers, 2026-10-12)

- **Thousands of rows:** the Sessions page holds 7,765 sessions; drawing them all was 5,930 DOM nodes and 1.6-2.2 s to the first row ([before numbers](/framework/ai/sessions/2026/10/12/session-6d3ef407/data-grid/sessions-perf/)). Fix: window the rows, and [roll routine sessions into buckets](/framework/ai/sessions/doc/buckets.md) (7,765 rows become 1,233 + 5).
- **Evented properties:** one value fires several writes. Fix: `Batch` keeps the last write per key and flushes once per frame ([doc/batching.md](doc/batching.md)).
- **Repaints and layout:** the browser already paints once per frame; reading layout inside a write loop made 15,001 layouts, 6.8 s for 1,000 rows. Clone-swap, detach and fragment tricks measured no better than a plain loop ([benchmark](/framework/code/performance/bench/)).
- **Live streams:** append lines and tail them (`ext/JSONL`), and `Batch` the paint; never `setInterval` + `fetch`.

## Use

- **Draw only what's visible.** Past a few hundred rows, keep only the visible rows (plus a small buffer) in the DOM and swap them as you scroll ("windowing"). Paging (50 per page) is the fallback when windowing is hard; the owner prefers scrolling.
- **One variable per drag, not one style per row.** A column resize writes one CSS custom property (`--col-3: 240px`); every row reads it. Never loop over rows during a drag.
- **No work on hover.** A resize handle or hover affordance is plain CSS (`:hover`), visible at once: no JavaScript hover-intent timers.
- **Read logs in pieces.** A large `page.jsonl` or log is replayed incrementally, newest first, or snapshotted; a page never parses 25 MB before its first paint.
- **Measure, then fix.** Time a page's load (start of `instantiate()` to first paint) and log it; fix the slowest page that's opened most often first.
- **Prove a gesture with a trace.** Drag-to-resize, scroll and open/close animations get a headless CDP trace (`Server/browser.mjs`): frame times and CPU, target 60 fps.

## Watch out

- **2026-10-03, AI Sessions:** 1,876 rows rendered at once plus per-column resize handlers held one Chrome tab at 108% CPU and 1.4 GB, and the dev shell took seconds to open on that page. Being fixed by `ext/DataGrid` (windowed rows, one variable per column).
- A monitor that costs more than it saves is the bug it was meant to catch: `Servex/Monitor.js` budgets itself at under 1% of one core.

## Back burner (the owner's ideas, not built)

- **A per-page performance monitor, opt-in**, levels off / minimal / high, toggled from the dev shell: page load time first (one tiny log line per load: url, ms, rows, log bytes), then memory (`performance.memory` / `measureUserAgentSpecificMemory`, which needs cross-origin isolation) and long tasks (`PerformanceObserver('longtask')`). Minimal data, never on for visitors unless a site owner opts in.
- **Spikes as events:** a page that jumps in memory, DOM size or load time posts one line the AI can see.

## More

- [doc/batching.md](doc/batching.md) — the measured comparison and the one helper (`Batch.js`).
- [doc/server-query.md](doc/server-query.md) — the Sessions page asks node for its rows: before and after.
- [ai/sessions/doc/buckets.md](/framework/ai/sessions/doc/buckets.md) — condensing thousands of sessions.
- [/framework/servex/](/framework/servex/) — the machine-level monitor (CPU, RAM, processes) agents read through `system_health`.
