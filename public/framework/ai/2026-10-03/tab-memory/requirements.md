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

| sample | JS heap used | DOM nodes | `.page` elements |
|---|---|---|---|
| 0 min | 10 MB | 229 | 0 |
| 5 min | 33 MB | 1,791 | 5 |
| 10 min | *(see task.jsonl for the final number — soak was still running when this brief was written; the trend across 0→5min already makes the direction clear)* | | |

**DOM nodes grew ~8× in 5 minutes with zero user interaction.** That is not a leak in the
usual sense (nothing is being abandoned) — it's pages/rows that were legitimately added and
never removed. `.page` elements (whole Page instances, each a subtree) went from 0 to 5 in the
same 5 minutes: /framework/ai/live/ is a rail of live cards, each row's card expanding into a
small Page of its own as updates stream in, and nothing takes an old one back out. Scaled to 3
days of a desk left open, this is exactly the shape of bug that reaches 2.5 GB: thousands of
rows and their Page subtrees, never released, each still holding its own listeners and socket
subscriptions.

## Do, in this order

1. **Bounded memory — the real fix, not a workaround.** Every live list/tail on the site (the
   AI rail, the AI2 dashboard's news feed, `/framework/ai/live/`'s own card stream, any other
   `Item.Store`-backed tail) keeps at most **N** items in memory and in the DOM at once (N is a
   judgment call — start around 100–200 rows, tune from how the rail actually scrolls). Rows
   older than N are dropped from memory and DOM, not just hidden; scrolling back up to them
   re-reads that slice from the file (the jsonl it tails, or `page.jsonl`/`files.jsonl`) instead
   of keeping it all resident. This is the one change that actually caps the 2.5 GB case — (2)
   and (3) below reduce HOW OFTEN it's needed, they don't replace it.
   - Read `core/Item/Store.js` and `core/List/List.js` first: `Store` already tails a `.jsonl`
     file and replays it into a `List`; the natural seam is wherever `List` appends a new
     member (`add()`), capping length there and letting a scroll-driven re-fetch pull an older
     slice back in on demand, the same way infinite-scroll already works elsewhere on the site
     (check `ext/files` and `core/Page/Markdown.js`'s own "first paint, then the rest" pattern
     for prior art — reuse, don't invent a second pagination mechanism, CLAUDE.md law 6).
   - A page that is not a tail (a normal static page) is not this task's problem — only
     anything that KEEPS GROWING while a tab sits open.

2. **A hidden tab pauses its tails.** On `document.visibilitychange` going to `"hidden"`, every
   open socket subscription / tail this page owns closes (not just stops rendering — actually
   unsubscribes, so the server stops pushing and the growth in (1) stops accumulating even
   before the cap is hit). On `"visible"` again, catch up from the last line it had (not a full
   reload) — `Item.Store` already knows its own last-read position; reuse that, don't track a
   second "last seen" number.

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
