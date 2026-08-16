The module's center: `class AITask extends Page`, one task's detail page and
the template every task's own `page.js` extends. Reads the manifest
(`task.jsonl` first, `session.json` second), renders it through named
parts, and stitches in the chat panel and the transcript viewer.

## The page follows the log

`session()` opens the manifest with `ext/JSONL`'s `live()`, so on the dev server
a running task's own page redraws as its log grows. Only the `.ai-live` box —
`checklist`, `unparsed`, `extra`, `figures` — is redrawn, by
[`refresh()`](/framework/ext/AITask/api/refresh/); the chat panel and the feed
hold state that a redraw would wipe, which is the whole reason the box exists.

## Why this file, and not a bigger one

Everything it needs — the checklist bar, the transcript, the pace meters —
lives in a sibling file and is imported, not reimplemented. `AITask.js`
itself is pure orchestration: fetch, then call the six parts in order. That
split is why it stays under 150 lines despite being the busiest file in the
module.

## The two guards that repeat

`legacy()` and `requirements()` both check
`!headers.get("content-type")?.includes("html")` before trusting a fetch's
`res.ok` — the SPA fallback answers a 404 with `index.html` at HTTP 200, so
`res.ok` alone would parse a webpage as JSON. `dashboard.js`, `feed.js` and
`replay.js` each carry an independent copy of the same guard; see
[Improvements](#improvements).

## `base()` is the one seam that makes dynamic routing work

A task with no `page.js` is rendered by a router-synthesized `AITask`
instance whose `import.meta` points nowhere real. `base()` prefers `this.src`
over `this.meta.url` for exactly that case — see
[`src`](/framework/ext/AITask/api/src/).

## Improvements

1. **Hoist the content-type-sniffing fetch guard into one helper.** `legacy()`
   here, plus `dashboard.js`'s `json()`, `feed.js`'s `load()` and
   `replay.js`'s `load()` all inline the identical
   `!res?.ok || headers.get("content-type")?.includes("html")` check. Four
   independent copies of one trap. *(simple, important)*
2. **`session()` probes `task.jsonl` blind.** On the dev server that is a socket
   subscribe answered with an empty batch; the legacy branch now calls
   `unsubscribe()`, so a `session.json` task no longer leaves a dead subscription
   standing. What remains: on static hosting every legacy task still pays a
   console 404 here, where `dashboard.js` avoids it by checking the directory
   listing first. *(simple, useful)*
3. **`report()`'s shape is convention, not enforcement.** Nothing
   stops a task's `page.js` from overriding `report()` itself and silently
   diverging from the documented order — the doc comment says not to, and
   that's the entire mechanism. A speculative alternative: a `parts()` method
   returning an ordered array `report()` iterates, so a task could insert a
   part rather than only replace one — genuinely more flexible, and also more
   machinery than this module has needed once yet. *(medium, speculative)*
