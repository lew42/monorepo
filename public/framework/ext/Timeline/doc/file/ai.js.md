# ai.js

An adapter: turns `framework/ai/`'s logs into `Timeline` items.
`ai_timeline(page)` builds items from `/framework/directory.json`'s day
dirs, each task's `task.jsonl` (via `TaskJSONL`, dots from its `logs`/
`actions`) or legacy `session.json` (bars only, no dots), plus a `usage.json`
window band.

## It has zero callers today

Built and wired into `framework/ai/page.js`'s `previews()` on 2026-08-14
(the [`ai-page`](/framework/ai/2026-08-14/ai-page/) task), it was replaced
the same day by [`ai-dashboard`](/framework/ai/2026-08-14/ai-dashboard/)'s
step/cost card rail — Mike wanted progress-by-step over a time axis for that
page. Nothing imports `ai_timeline` or this file's default export anywhere
on the site now. The code is correct and current (it was verified working
before the revert); it simply has nowhere to run. See the readme's "Used
by".

## The memoization comment is now dead context, not a live trap

The long `⚠ Memoized ON THE PAGE` comment (`ai.js:62`–`83`) explains a real
bug the original build hit — `framework/page.js`'s `walls()` calling
`previews()` a second time, doubling the fetch and the rendered `.timeline`
root — and the `page._timeline` cache plus explicit re-append that fixed it.
That reasoning is sound and would matter again the moment this file is
rewired to any page whose ancestor also calls `previews()` on it. Until then
it documents a trap for code that isn't running.

## `stamp`, `json`, `manifest` duplicate `ext/AITask/dashboard.js`

`json()` (the SPA-fallback content-type sniff) and the `task.jsonl`-then-
`session.json` fallback in `manifest()` are near-identical to the same-named
helpers in `ext/AITask/dashboard.js` — two independent implementations of
"how to fetch a task's manifest safely," now that `dashboard.js` is the one
actually running.

## Improvements

1. **Decide whether this file should exist at all.** Either re-wire it (a
   page opts into a Timeline-shaped AI view) or delete it — a correct,
   unreachable adapter is dead weight a future reader has to read and
   discount every time they audit this module. **medium, important** — the
   call belongs to Mike, not this pass; recorded as the audit's top
   module-level finding.
2. **If kept, de-duplicate `json()`/`manifest()` against
   `ext/AITask/dashboard.js`'s copies** rather than maintaining two forks of
   the same fetch-safety logic. **simple, useful** — blocked on #1's answer.
