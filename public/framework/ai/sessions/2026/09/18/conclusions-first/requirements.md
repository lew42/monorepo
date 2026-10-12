# Conclusions first — the brief, verbatim

**The owner's words (2026-09-18, 15:20):** "the easy, clear, matter-of-fact
statements — this is this or this is not this — conclusions that summarize
what I've been asking are the best things to put at the top of any report.
For each topic, lead with the conclusion as the title; if I'm curious I drill
down and see what I asked, the conclusion, the thought process, the
references. Sort by easy and important — how useful, how complex, how much
time. Most items should read in under a minute; if something takes more than
three to five minutes, put a time estimate. Structure it so it's all on
demand."

## What exists

The Asks tab (`public/framework/ext/AITask/asks.js`, `rank.js`, `needs.js`,
`ai.css`, `doc/asks.md`; the `ask` verb in `ext/JSONL/doc/task-jsonl.md`,
merged by id). The mastermind has just stamped a `conclusion` string on 34
landed asks in `ai/2026-09-17/mastermind-layout-browser/task.jsonl`
(read it, read-only). Two minions landed there in the last hour (report-order:
topic bands, folds, counts; reply-in-place: reply/mic buttons and a dictate
box) — read their landings in `ai/2026-09-18/report-order/task.jsonl` and
`ai/2026-09-18/reply-in-place/task.jsonl` and keep all of it working.

## Deliverables

1. When an ask carries `conclusion`, the card's TITLE is the conclusion
   (plain sentence, no bold, no trailing period games) and the ask's
   `summary` (what was asked) moves to the first line of level 2, under a
   small "you asked" label; the card's picture, status, pills and reply
   controls stay. An ask without a conclusion keeps its summary as the
   title, unchanged.
2. `minutes` on an ask — an optional number the mastermind sets when
   digging in takes more than three minutes — shows as a small "~N min"
   beside the status; absent otherwise (most items say nothing). Document
   both beside the verb.
3. The band head's line reads "conclusions first" in no more than one short
   label if you add anything at all; nothing else on level 1 changes.
4. Verify headless on your private server (`PORT=8135 node server.js`,
   background, killed by its real Windows PID): the run task's Asks tab at
   400 / 1280 / 1920 — 34 cards titled by conclusion, the rest by summary
   (two numbers that must agree with the log), level 2 opens with "you
   asked", zero console errors; one shot at 1280.

## Fence

`public/framework/ext/AITask/**`, `public/framework/ext/JSONL/doc/task-jsonl.md`,
this task dir. Nothing else — never write into the run task's `task.jsonl`.
The owner's dev server on port 80 is running: never touch it. Never
`git stash`, never `find /`, never drive the owner's tabs; an `rg` pattern
starting with `/` returns nothing here — drop the slash. Creating this task
dir full-reloads open tabs once — that is expected; do it first. Final
message: five lines — the two counts, the shot path, the link, what was left.
