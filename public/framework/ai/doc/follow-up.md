# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-31 05:02 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**1 landed with unmerged commits · 0 merged but never landed · 191 quiet over 2 h · 0 landed with no outcome · 475 open tasks untouched over 7 days · 0 open asks with no live owner · 647 healthy of 839.**

## unmerged: 1

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 8 d ago, step 11/7, agent dormant

## quiet: 191

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [session-e00f55c9](/framework/ai/sessions/2026/10/20/session-e00f55c9/): prompt-t, last log 5 h ago, step 0/0, agent unknown
- [cloud-voice-app-20261027](/framework/ai/sessions/2026/10/27/cloud-voice-app-20261027/): no agent, last log 24 h ago, step 0/0, agent unknown
- [session-174601a8](/framework/ai/sessions/2026/10/26/session-174601a8/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-dcd4f3bc](/framework/ai/sessions/2026/10/26/session-dcd4f3bc/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-871f4dac](/framework/ai/sessions/2026/10/26/session-871f4dac/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-ce27d409](/framework/ai/sessions/2026/10/26/session-ce27d409/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-fc587220](/framework/ai/sessions/2026/10/26/session-fc587220/): no agent, last log 2 d ago, step 0/0, agent unknown
- [cloud-voice-app-20261026](/framework/ai/sessions/2026/10/26/cloud-voice-app-20261026/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-01aeab84](/framework/ai/sessions/2026/10/26/session-01aeab84/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-027fedf4](/framework/ai/sessions/2026/10/26/session-027fedf4/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-758d164f](/framework/ai/sessions/2026/10/26/session-758d164f/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-a9c2f2db](/framework/ai/sessions/2026/10/26/session-a9c2f2db/): no agent, last log 2 d ago, step 0/0, agent unknown
- …179 more in [follow-up-full.md](follow-up-full.md)

## unworked: 475

Open tasks (idle, queued or waiting, none on the owner) whose last log line is over 7 days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.

- [the-review-page-should-be-an-existing-pa](/framework/ai/sessions/tasks/the-review-page-should-be-an-existing-pa/): idle, last log 7 d ago
- [make-miller-column-list-items-more-compa](/framework/core/Page/tasks/make-miller-column-list-items-more-compa/): waiting, last log 7 d ago
- [try-resizing-the-columns-slightly-so-the](/framework/core/Page/tasks/try-resizing-the-columns-slightly-so-the/): waiting, last log 7 d ago
- [check-whether-css-properties-can-be-trac](/framework/ext/tasks/check-whether-css-properties-can-be-trac/): waiting, last log 7 d ago
- [run-the-core-merge-sweep-one-sonnet-mini](/framework/core/tasks/run-the-core-merge-sweep-one-sonnet-mini/): waiting, last log 7 d ago
- [take-screenshots-of-the-sidebar-variants](/framework/ext/Shots/tasks/take-screenshots-of-the-sidebar-variants/): waiting, last log 7 d ago
- [build-an-automated-system-that-takes-scr](/framework/ext/Shots/tasks/build-an-automated-system-that-takes-scr/): waiting, last log 7 d ago
- [consider-a-diff-tool-that-compares-two-s](/framework/ext/Shots/tasks/consider-a-diff-tool-that-compares-two-s/): waiting, last log 7 d ago
- [investigate-how-to-organise-rounds-of-sc](/framework/ext/Shots/tasks/investigate-how-to-organise-rounds-of-sc/): waiting, last log 7 d ago
- [track-what-works-and-what-doesn-t-in-scr](/framework/ext/Shots/tasks/track-what-works-and-what-doesn-t-in-scr/): waiting, last log 7 d ago
- …465 more in [follow-up-full.md](follow-up-full.md)

## Check

647 healthy + 192 flagged = 839; the state lists 839 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 412 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **unworked**: the state's bucket is `idle`, `queued` or `waiting` (not on the owner) and the last log line is over 7 days old. Counted over the whole state, not only the window, because a task nobody touches drops out of the window. The 133 stale queue tasks of 2026-10-24 (nothing picks tasks from the queue by itself) are what this exists to catch early; it also counts idle and waiting tasks outside the queue, so its number is larger.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
