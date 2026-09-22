# report-order — the Asks tab becomes a ranked hierarchy, band order included

Load the `minion` skill first. Then this brief.

## The owner's words (2026-09-18, 13:00)

> make the report this whole visual navigation — a hierarchy of requests and
> tasks and projects and links and previews. Order it and rank it in terms of
> the quantity of work or the potential outcome; a lot of the things I've
> asked are side tangential things, footnotes further down the page.

## What exists

The Asks tab (`public/framework/ext/AITask/asks.js`, `rank.js`, `needs.js`,
`ai.css`, `doc/asks.md`, `doc/ranking.md`) groups `ask` lines by `topic` in
first-seen order and orders cards inside a band by the last `rank` line with
`list: "asks"` (the mastermind has just written one ordering all 43 asks by
outcome, band by band — read
`ai/2026-09-17/mastermind-layout-browser/task.jsonl`, read-only). A drag
writes a new rank line through `rpc:append`.

## Deliverables

1. **Band order.** A `rank` line with `list: "topics"`
   (`order: ["Layouts", "Design system", "Pages", "AI log", "Ask"]`) orders
   the bands; first-seen order remains the fallback; a drag of a band heading
   writes one, the same way cards do. Document beside the verb
   (`ext/JSONL/doc/task-jsonl.md` one clause; `doc/ranking.md` one paragraph).
   Then append that exact line to the run task's log through the seam on your
   private server (that is a write into the mastermind's file, and it is the
   ONE allowed: a `rank` line for `topics`, nothing else) — or, if the seam
   refuses, put the line in your report and the mastermind appends it.
2. **Footnotes.** The last N cards of a band, past a `fold` the rank line may
   carry (`{"rank": {"list": "asks", "order": [...], "fold": 6}}` — cards
   after the sixth fold under a "N more" line the reader opens), so tangents
   sit lower and the band stays one screen; default: no fold. Document it.
3. **Hierarchy read at a glance:** each band heading shows its counts
   (landed / building / open) and the run's `links` pills already at the top
   stay; nothing else changes. Verify headless on your private server
   (`PORT=8121 node server.js`, background, killed by its real Windows PID):
   five bands in the new order on the run task, 43 cards, the fold opening
   and closing, zero console errors at 400 / 1280 / 1920.

## Fence

`public/framework/ext/AITask/**`, `public/framework/ext/JSONL/**`, your task
dir, and that one `rank` line into
`ai/2026-09-17/mastermind-layout-browser/task.jsonl`. The owner's dev server
on port 80 is running: never touch it. Never `git stash`, never `find /`,
never drive the owner's tabs; an `rg` pattern starting with `/` returns
nothing here — drop the slash.

Final message: five plain sentences with the link and the counts.
