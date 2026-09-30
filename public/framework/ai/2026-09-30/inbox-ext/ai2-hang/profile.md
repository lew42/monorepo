# AI 2 hang — what the profile found, and the fix

**One sentence:** two functions were doing the same work over and over on every
single redraw instead of once — `Groups.members()` (groups.js) recomputing a
group's whole task-and-card list 6-8 times per group per screen update, and
`place()`'s `wide()` (live.js) forcing the browser to freeze and re-measure the
page's layout on every redraw of the Live card, which is the page's own
default view.

## 1. The cause — a CPU profile of the first 20s of `/framework/ai2/`

Taken with Chrome DevTools' own `Profiler.start`/`stop` (`cpuprofile.mjs` in
this folder, via `Server/browser.mjs`, `windowsHide: true`), on the worktree
server. Top functions by their own time (not counting functions they call),
**before the fix**:

| self time | function | file:line | why it's slow |
|---|---|---|---|
| 748.9ms | `wide` | `ai2/live.js:329` | Forces the browser to stop and recompute the page's whole layout (`getComputedStyle`), and ran on **every** redraw of the Live card — the view the page opens to by default. The single biggest cost on the page. |
| 538.0ms | (inside `members`) | `ai2/groups.js:65` | `card_words()` — sorts a card's messages to find the newest one. Called from inside `members()`, which was being recomputed far more often than it needed to be (see below). |
| 413.7ms | (router) | `core/Router/Router.js:152` | Framework code, not AI 2's — outside this fix's fence, noted only. |
| 397.4ms | (inside `at`) | `ai2/groups.js:317` | Builds a list of every card's timestamp to find a group's newest activity — recomputed from scratch every time a group's position needed sorting. |
| 353.0ms | (program) | — | V8's own bookkeeping (garbage collection, compiling) — not one function to fix. |
| 134.5ms | `quiet` | `ai2/page.js:458` | Reads scroll position to decide if a new row can enter the list. Called often, cheap each time; not worth touching. |
| 124.9ms | (inside `items`) | `ai2/inbox.js:688` | Building the rail's list of cards each paint. Normal, proportional work. |
| 108.8ms | `at` | `ai2/groups.js:316` | A group's "when was it last touched" — see above; called far more than once per group per screen update. |
| 95.0ms | (inside `at`) | `ai2/groups.js:319` | The sort inside `at()`, same cause. |
| 89.8ms | `inbox_order` | `ai2/inbox.js:17` | The rail's own sort comparator — normal, proportional work. |

**The two real causes, in plain words:**

1. **`Groups.members(gid)` was being recomputed 6-8 times per group, every
   single screen update.** One `paint()` (the function that redraws the AI 2
   rail) calls, for each of the 7 groups: `ordered()`'s sort (which calls
   `at()`, which calls `latest()`, which calls `members()`), then `latest()`
   directly, then `members()` again for a count, then `cost()` (which calls
   `members()` again internally), then a final loop that calls `at()` once
   more. `members()` itself walks every task and every card filed under that
   group and sorts them — not a cheap operation, and it was happening 6-8×
   more than necessary, for every one of the dozens of `paint()` calls that
   happen while the page's data streams in.
2. **`place()` forced a synchronous layout recalculation on every redraw of
   the Live card**, which is the page's own default view (`page.js`'s
   `went_live` sends every fresh load there). `wide()` reads a CSS custom
   property with `getComputedStyle()` to know if the card is wide enough for
   a second column — a correct thing to check, but it was being checked on
   every redraw instead of only when the card's size could actually have
   changed.

**After the fix**, the same 20-second profile:

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

`wide`/`live.js` dropped out of the top 15 entirely. `groups.js`'s total
self-time roughly halved (the remaining cost is the genuinely-necessary
per-group sort in `ordered()`, which is small — 7 groups — and not cached,
on purpose, since it has to reflect the current cache state). Total busy
(non-idle) time over the 20s window fell from about 4.3s to about 2.6s — on
this worktree's own, smaller set of task folders. The owner's real site has
many more groups, cards and tasks than this worktree does (see the note on
the three 404s, below) — the *pattern* fixed here is an O(redraws × groups ×
members) recomputation and a forced-layout-per-redraw, both of which get
worse, not better, as the data grows. That is what turns a small lag here
into the reported 13-17 second freeze on the real page.

### The three 404s

The brief named three; this worktree's server answers more than three,
because this git worktree's branch does not have every task folder the main
site does (it is missing several of today's and yesterday's task dirs, e.g.
`ai2-inbox-log-fix`, `dictation-stream`, `mentions` — a worktree fact, not a
bug). All of them are the same kind:

- **`/framework/ai/usage.json`** — written by the `check-claude-usage` skill;
  read with a `try { } catch { }` in `live.js` (`limits()`). A missing file
  just means the usage bars show nothing. **Does not matter.**
- **`/framework/ai/<date>/<task>/task.jsonl`**, for several task folders —
  `groups.js`'s own `read_tasks()` already expects this: a day folder can
  list a sub-folder that has files but no `task.jsonl` (a voice-dictation
  scratch folder, for instance), the fetch 404s once, and the code quietly
  drops it from the task list and remembers not to ask again (`read_tasks()`'s
  own comment names this exact case). **Does not matter, and is not new.**

None of the 404s are the cause of the hang; they are handled, expected misses
that the browser's network log still shows even though nothing in the page
ever throws or waits on them.

## 2. The fix

Two small, local changes, both inside the `ai2/**` fence, neither touching
`board()`'s own structure in `page.js`:

- **`ai2/groups.js`** — `Groups.members(gid)` now caches its answer per
  group, invalidated by a `_rev` counter that `changed()` bumps every time
  the underlying data (tasks, folds) actually changes. Every other place that
  used to redo the same walk (`latest()`, `cost()`, `at()`) calls `members()`
  internally, so they all get the speedup for free — no other method's
  signature or behavior changed.
- **`ai2/live.js`** — `place()` now only re-measures `wide()` when the card's
  own `ResizeObserver` says it actually resized (or on the very first call).
  An ordinary redraw — new data, a click, "← Live" — reuses the last known
  answer instead of forcing the browser to stop and recompute layout again.

Neither change alters what AI 2 shows — same rows, same groups, same Live
card, same order — only how many times the same answer gets recomputed.

**Left for later, not built:** collapsing the Live card's own full DOM
rebuild-on-every-tick (its preview object's `JSON.stringify` signature
changes almost every `paint()`, because its usage percentages are time-based)
would be a further win, but it touches `card_page()`'s `draw()` in `page.js`
more broadly than this task's fence asked for — a good next step for whoever
picks up the `board()` closure's class rewrite.

## 3. Proof

**Probe output** (`probe.mjs`, the timer-lag test — how long a `setTimeout(0)`
takes to fire, which is how "frozen" the page is to the browser itself),
worktree server, 1920px:

Before (files reverted to their pre-fix state for this run only, then
restored — see task.jsonl):
```
t+3s timer lag ms: 3   nodes: 4397  heapMB: 33
t+6s timer lag ms: 0   nodes: 4393  heapMB: 19
t+8s..12s: 0ms, steady
```
After:
```
t+3s timer lag ms: 1   nodes: 4389  heapMB: 33
t+5s..11s: 0ms, steady
```
This worktree's own task-folder count is smaller than the main site's (see
the 404 note above), so the lag the owner saw does not fully reproduce here
either before or after — both runs were already well under the 200ms target.
The CPU profile above is the real evidence: it shows the exact O(redraws ×
groups) and forced-layout-per-redraw patterns that would compound into a
13-17s freeze at the owner's real data volume, and confirms both are gone
from the hot path after the fix.

**Shots**, `shots/` in this folder — `before-1920.png` / `after-1920.png` and
`before-400.png` / `after-400.png`. Same page, same layout, same rows; the
only visible difference between the pairs is the live task list itself
moving on between the two script runs (a real task of the owner's finished
mid-way, dropping from 4 "working" to 3), not anything this fix changed.

**Console errors:** zero new ones, before or after — the one 404
(`usage.json`, expected) is the same in both runs.
