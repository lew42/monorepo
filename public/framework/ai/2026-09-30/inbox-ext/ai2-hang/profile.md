# AI 2 hang — what the profile found, and the fix

**One sentence:** two functions redid the same work on every redraw instead of
once — `Groups.members()` (groups.js) recomputing a group's task list 6-8
times per group per screen update, and `place()`'s `wide()` (live.js) forcing
a layout re-measure on every redraw of the Live card (the page's default view).

## 1. The cause — a CPU profile of the first 20s of `/framework/ai2/`

Taken with Chrome DevTools' `Profiler.start`/`stop` (`cpuprofile.mjs`, via
`Server/browser.mjs`, `windowsHide: true`), on the worktree server. Top
functions by self time, **before the fix**:

| self time | function | file:line | why it's slow |
|---|---|---|---|
| 748.9ms | `wide` | `ai2/live.js:329` | Forces a full layout recompute (`getComputedStyle`), on every redraw of the Live card — the page's default view. Biggest cost on the page. |
| 538.0ms | (inside `members`) | `ai2/groups.js:65` | `card_words()`, sorting a card's messages — called from `members()`, recomputed far more than needed (below). |
| 413.7ms | (router) | `core/Router/Router.js:152` | Framework code, outside this fix's fence — noted only. |
| 397.4ms | (inside `at`) | `ai2/groups.js:317` | Rebuilds every card's timestamp to find a group's newest activity, from scratch each time. |
| 353.0ms | (program) | — | V8 bookkeeping (GC, compiling) — not one function to fix. |
| 134.5ms | `quiet` | `ai2/page.js:458` | Scroll-position read; cheap, not worth touching. |
| 124.9ms | (inside `items`) | `ai2/inbox.js:688` | Rail list build each paint — normal, proportional. |
| 108.8ms | `at` | `ai2/groups.js:316` | Same group-activity cause as above. |
| 95.0ms | (inside `at`) | `ai2/groups.js:319` | Same cause. |
| 89.8ms | `inbox_order` | `ai2/inbox.js:17` | Rail's sort comparator — normal, proportional. |

**The two real causes:**

1. `Groups.members(gid)` ran 6-8 times per group, every screen update: one
   `paint()` call touches, per group, `ordered()`'s sort → `at()` → `latest()`
   → `members()`, then `latest()` again, then `members()` again for a count,
   then `cost()` (which calls `members()` again), then a final `at()`. Each
   `members()` walks and sorts every task and card in that group.
2. `place()` forced a synchronous layout recalc on every Live-card redraw.
   `wide()` reads a CSS variable via `getComputedStyle()` to size a second
   column — correct to check, wrong to check on every redraw.

**After the fix**, same 20s profile:

| self time | function | file:line |
|---|---|---|
| 362.1ms | (router) | `core/Router/Router.js:152` *(unchanged, not fixed here)* |
| 348.1ms | (inside `members`) | `ai2/groups.js:333` |
| 316.2ms | (program) | — |
| 225.7ms | `quiet` | `ai2/page.js:458` |
| 112.0ms | `at` | `ai2/groups.js:332` |
| 108.2ms | (inside `items`) | `ai2/inbox.js:688` |
| 78.8ms | `inbox_order` | `ai2/inbox.js:17` |
| 70.7ms | (inside `at`) | `ai2/groups.js:335` |

`wide`/`live.js` is gone from the top 15. `groups.js`'s total self-time is
roughly half. Busy (non-idle) time over 20s: ~4.3s → ~2.6s, on this
worktree's own smaller task set (see Proof, below).

### The three 404s

The brief named three; this worktree answers more — its branch is missing
some task folders (a worktree fact, not a bug). Both kinds are handled and
don't matter:

- `/framework/ai/usage.json` — read in a `try/catch` in `live.js`; missing
  just means the usage bars show nothing.
- `/framework/ai/<date>/<task>/task.jsonl`, for a few folders —
  `read_tasks()` already expects a folder with no `task.jsonl` and drops it
  quietly.

Neither is the cause of the hang; nothing in the page throws or waits on them.

## 2. The fix

Two small, local changes, both inside `ai2/**`, neither touching `board()`'s
structure in `page.js`:

- **`ai2/groups.js`** — `Groups.members(gid)` now caches its answer per
  group, invalidated by a `_rev` counter `changed()` bumps on real data
  changes. Every caller (`latest()`, `cost()`, `at()`) gets the speedup for
  free.
- **`ai2/live.js`** — `place()` only re-measures `wide()` when the card's own
  `ResizeObserver` says it actually resized (or on the first call). An
  ordinary redraw reuses the last answer.

Neither change alters what AI 2 shows — same rows, groups, Live card, order.

**Left for later:** the Live card still rebuilds its DOM most ticks. Fixing
that touches `card_page()`'s `draw()` in `page.js` more broadly than this
fence allows — a good next step for whoever rewrites `board()`.

## 3. Proof

**Probe** (`probe.mjs` — timer-lag: how long a `setTimeout(0)` takes, i.e.
how frozen the page is), worktree server, 1920px:

```
Before: t+3s lag 3ms, nodes 4397, heap 33MB · t+6s..12s: 0ms, steady
After:  t+3s lag 1ms, nodes 4389, heap 33MB · t+5s..11s: 0ms, steady
```

This worktree has fewer task folders than the live site, so the owner's
13-17s freeze doesn't fully reproduce here — both runs were already under
the 200ms target. The profile above is the real evidence: both fixed costs
scale with redraws × groups/cards, exactly what compounds at the owner's
real data volume.

**Shots** in `shots/` — before/after at 1920 and 400. Same page, layout and
rows; the only visible difference is the live task list itself (one real
task finished between runs, 4→3 "working") — not this fix.

**Console errors:** zero new ones; the one 404 (`usage.json`, expected) is
the same in both runs.

## 4. Follow-up work, same task (followup.md, 2026-09-30)

**The × alignment fix** — `ai2.css`, `.ai2-row-head > .ai2-clear`: the same three properties
commit 9ecda14e used for the unread dot (`align-self`, `min-block-size`, `block-size`), plus a
`box-sizing`/`padding-block`/`line-height` reset the bare `<button>` also needed (the framework's
own "one box, every control" grammar gives every button a 2.4em `min-height` and its own padding,
which the dot's three properties alone didn't clear). Before/after, hovered and plain, at 1920
and 400: `shots/clear-*-1920-*.png`, `shots/clear-*-400-*.png`.

**The pinned Now card** — `ai/now/page.jsonl` (copied from the main tree), routed at
`/framework/ai2/now/` (`card_page`, the same as `live`) and `/framework/ai/now/` (a new small
`route()` case in `ai/page.js`, reading the folder directly since that page has no AI 2 "shell").
Pinned above Live in the rail (`render_pinned()`, `page.js`). Shots: `shots/now-ai-page.png`,
`shots/now-ai2-page-v2.png`.

**× actually archives** — `archive()` only re-styled the row before; `list` is rebuilt from
scratch on every real `paint()`, and the handler compared a stale object by reference, so nothing
was ever actually removed. Fixed by id, and made to survive a `paint()` landing mid-flight (see
the CORS finding, next).

**"Clear all"** — a button in the rail foot, same `archive_row()` write the × makes, batched 20
at a time so 336 open cards can't freeze the page or the write queue.

**The INBOX ZERO display rule** — `visible()` now also requires `it.score >= min` (`?min=` in the
url, default 90; Live is exempt, same as its exemption from resolution and archiving everywhere
else in this file). Search and the "archived" toggle ignore it, as asked. Shots:
`shots/inboxzero-min90.png` (7 rows) vs. `shots/inboxzero-min0.png` (everything).

### A real finding, not a bug in this code: a CORS gap blocks folder-card writes from this worktree

Proving "clear all" against real data (`test-clearall.mjs`) found that a **card shaped like
`2026/09/28/<slug>` never actually archives** in this worktree, even though the UI update is
instant and correct. The browser's own console names it exactly:

```
Access to fetch at 'http://127.0.0.1:8090/card/append?id=2026%2F09%2F28%2Flog-in-to-cloudflare'
from origin 'http://localhost:51490' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

`archive_row()` (`rules.js`) picks one of two writers by the id's shape: a plain board card (a
UUID, like the one in the very first archive proof) goes out over the **dev socket's own RPC** —
same-origin, no CORS, and it works, confirmed persisting after a real, fresh page load. A folder
card (`2026/09/28/…`) goes out as an HTTP `fetch()` straight to **Servex's own port, `8090`** —
cross-origin from this worktree's `localhost:51490` — and Servex is not answering that route with
an `Access-Control-Allow-Origin` header for this origin. This is not new: the readme's own
watch-out section already names a sibling case ("An older Servex has no card routes… its `/cards`
answer has no CORS header"). This one is narrower — the **read** route (`/card?id=`, what the
pinned Now card uses) answers fine; only the **write** route (`/card/append`) is missing the
header, and only for a worktree's own ephemeral port, which Servex's CORS list most likely never
learns about.

**What this means for the fix:** the code is correct and the UI is correct — a row leaves the
instant you press × or "clear all", and `archived_pending` (`page.js`, new) now keeps it left out
even though `list` gets rebuilt from scratch on every subsequent `paint()` (proved: before this,
a row silently reappeared seconds later, with no error, the moment any other stream's update
triggered a repaint before the write had landed — the exact case a slow write hits even when
Servex answers normally). What it can't do from inside this worktree is survive a **real, full
page reload** for a folder-shaped card specifically, because nothing this task can write makes
Servex answer with the missing header — that is a Servex CORS-allowlist fix, outside this task's
fence (`ai2/**`, `ext/drawer/**`, this folder). **Flagging this to the parent rather than
guessing at a Servex change.** A board-card (UUID) archive already proved to persist correctly
end to end; the pinned Now card's own read already proves the `8090` read path is fine from this
origin — it is specifically the write route that needs the header added for worktree origins,
likely in whatever list Servex builds its `Access-Control-Allow-Origin` response from.
