# Tab memory: bounded lists, paused-when-hidden tails, a safety-net reload

## The ask (owner's words, 2026-10-03, dictated, follow-on to the console-clean task)
> Follow-on to the soak test (owner wants long-running tabs never to reach GB size, for our
> site and any future client app). Whatever the soak finds, write the next task's brief at
> ai/2026-10-03/tab-memory/requirements.md, in this order: (1) bounded memory: every live
> list/tail keeps at most N items in memory and DOM (older ones reload from the file on
> scroll); (2) a hidden tab pauses its tails (close the socket subscription on
> visibilitychange→hidden, catch up from the last line on visible); (3) a safety net in one
> shared module: if the tab has been hidden 30+ min and its heap is over a threshold
> (performance.memory / measureUserAgentSpecificMemory where available), reload it in place.
> Routes already restore the view. Log the reload to the console as info. Don't build it now
> unless the soak's cause fix covers it; just the brief.

Context: a `/framework/ai/` tab grew to **2.5 GB** in Windows Task Manager over about 3 days,
while Chrome's own tab-hover tooltip said under 500 MB — the gap itself is a clue (it's not
just JS heap; something OS-level, likely GPU/compositor layers from an ever-growing DOM, is
also piling up).

## What the console-clean task's soak test found (read this first)
`public/framework/ai/2026-10-03/console-clean/task.jsonl` has the full log. The headless soak
(`/framework/ai/live/`, Playwright, `performance.memory` + DOM node count, sampled every 5
minutes) found **steady, unbounded growth while nothing else was happening** — no owner
interaction, just the page's own streams (sockets, tails) running:

| sample | JS heap used | JS heap reserved | DOM nodes | `.page` elements |
|---|---|---|---|---|
| 0 min | 10 MB | 19 MB | 229 | 0 |
| 5 min | 33 MB | 38 MB | 1,791 | 5 |
| 10 min | 46 MB | 135 MB | 1,857 | 5 |

- **Not a classic leak.** Nothing is abandoned — rows are legitimately added and never removed.
- **Most of the growth is an initial catch-up, not a steady climb.** DOM nodes jumped ~8× in
  the first 5 minutes (229 → 1,791: the page's own backlog loading in) then nearly flattened
  (1,791 → 1,857 in the next 5). `.page` elements (whole Page instances, each a subtree) went
  from 0 to 5 and stayed at 5. A 10-minute window is too short to show the SLOW, per-event climb
  that reaches 2.5 GB over 3 days — it mostly shows the one-time backlog fill.
- **The reserved heap (135 MB) ran well ahead of the used heap (46 MB)** by the 10-minute mark,
  despite nothing being asked to render — that gap (reserved-but-unused memory the GC hasn't
  reclaimed yet) is plausibly part of why Windows' own Task Manager number (2.5 GB) read so much
  higher than Chrome's own tab tooltip (under 500 MB): the tab's real DOM/JS footprint may still
  be modest while the OS-level process size (V8's reserved heap, GPU/compositor layers for an
  ever-growing DOM) keeps climbing and is slow to give memory back.
- **Scaled to 3 days** of continuous socket/tail events — each one a potential new row/Page that
  nothing ever removes — this initial-backlog pattern plus a slow per-event trickle is exactly
  the shape of bug that reaches 2.5 GB: thousands of rows and their Page subtrees, never
  released, each still holding its own listeners and socket subscriptions.

## Do, in this order

1. **Bounded memory — the real fix, not a workaround.**
   - **What caps.** Every live list/tail (the AI rail, the AI2 dashboard's news feed,
     `/framework/ai/live/`'s own card stream, any `Item.Store`-backed tail) keeps at most **N**
     items in memory and DOM at once — N is a judgment call, start around 100–200 rows, tune
     from how the rail actually scrolls.
   - **How old rows behave.** Dropped from memory and DOM, not just hidden; scrolling back up
     re-reads that slice from the file it tails (`page.jsonl`/`files.jsonl`) instead of keeping
     it all resident.
   - **Why this one matters most.** This is the one change that actually caps the 2.5 GB case
     — (2) and (3) below reduce HOW OFTEN it's needed, they don't replace it.
   - Read `core/Item/Store.js` and `core/List/List.js` first: `Store` already tails a `.jsonl`
     file and replays it into a `List`; the natural seam is wherever `List` appends a new
     member (`add()`), capping length there and letting a scroll-driven re-fetch pull an older
     slice back in on demand, the same way infinite-scroll already works elsewhere on the site
     (check `ext/files` and `core/Page/Markdown.js`'s own "first paint, then the rest" pattern
     for prior art — reuse, don't invent a second pagination mechanism, CLAUDE.md law 6).
   - A page that is not a tail (a normal static page) is not this task's problem — only
     anything that KEEPS GROWING while a tab sits open.

2. **A hidden tab pauses its tails.**
   - **On hidden.** `document.visibilitychange` → `"hidden"` closes every open socket
     subscription / tail this page owns — a real unsubscribe, not just stopped rendering, so
     the server stops pushing before the cap in (1) is even hit.
   - **On visible again.** Catch up from the last line it had, not a full reload — `Item.Store`
     already tracks its own last-read position; reuse it, don't add a second counter.

3. **A safety net, in one shared module** (new, or added to an existing site-wide one — check
   `core/App` and `dev/DevBar` first for where "runs once per tab, site-wide" code already
   lives, so this doesn't become a second copy of that wiring): if the tab has been hidden 30+
   minutes AND its heap is over a threshold, reload the tab in place.
   - Measure with `performance.memory.usedJSHeapSize` (Chromium; already used in the soak test
     above) and `performance.measureUserAgentSpecificMemory()` where it exists (needs
     cross-origin isolation headers — check whether the dev/prod server sets them before
     assuming this is available; fall back to `performance.memory` alone if not).
   - Pick the threshold as a judgment call (the soak test above gives a real baseline: ~33 MB
     heap after 5 minutes of light activity on one page — a threshold needs to be well above
     normal running size, not just above this one sample).
   - "Routes already restore the view" (the owner's words) — confirm this is actually true for
     `/framework/ai/live/` specifically before relying on it: does a hard reload land back on
     the exact scroll position / open card, or just the page's base url? Say which, in the
     landing report.
   - Log the reload with `console.info`, not `warn`/`error` — it's expected, working-as-
     designed behavior, not a problem (and `Server/console-allow.jsonl`/`smoke.mjs`'s noise
     budget, landed in console-clean, would otherwise start flagging it on any page that sits
     open through a smoke run).

## Read first
- `public/framework/ai/2026-10-03/console-clean/task.jsonl` — the soak test's exact numbers and method (reuse the same headless-soak script rather than re-deriving one; it's referenced there, scratchpad-only, so recreate it from the log's description if the original is gone).
- `core/Item/Store.js`, `core/List/List.js` — the tail/list machinery this task extends, not replaces.
- `core/Page/Markdown.js`'s `budget`/two-step-paint pattern, `ext/files` — existing "don't load everything at once" prior art.

## Fence
A worktree task (multi-file, a shared module — `core/Item`, `core/List`, plus whichever site
chrome module gets the safety net). Decide the worktree per the sub-mastermind skill; this
is not a one-file fix.

## Budget
Not set by the owner yet — ask on the card if the scope above (three real pieces of work,
likely 2–3 minions) doesn't fit whatever the dispatching mastermind has in mind; don't block
on an answer, start with (1) since it's the one that actually caps the growth.
