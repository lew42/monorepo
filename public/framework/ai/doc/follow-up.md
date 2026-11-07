# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-11-07 06:01 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 103 quiet over 2 h · 0 landed with no outcome · 503 open tasks untouched over 7 days · 0 open asks with no live owner · 839 healthy of 942.**

## quiet: 103

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [live-r11](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/live-r11/): no agent, last log 4 h ago, step 0/0, agent unknown
- [live-r10](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/live-r10/): no agent, last log 5 h ago, step 0/0, agent unknown
- [live-r9](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/live-r9/): no agent, last log 5 h ago, step 0/0, agent unknown
- [cloud-voice-app-20261103](/framework/ai/sessions/2026/11/03/cloud-voice-app-20261103/): no agent, last log 25 h ago, step 0/0, agent unknown
- [session-e9c8d0d3](/framework/ai/sessions/2026/11/03/session-e9c8d0d3/): no agent, last log 25 h ago, step 0/0, agent unknown
- [v-lzxm297](/framework/ai/sessions/2026/11/02/v-lzxm297/): voice-as, last log 2 d ago, step 0/0, agent unknown
- [v-j32xjjb](/framework/ai/sessions/2026/11/02/v-j32xjjb/): voice-as, last log 2 d ago, step 0/0, agent unknown
- [v-urmyr2k](/framework/ai/sessions/2026/11/02/v-urmyr2k/): voice-as, last log 2 d ago, step 0/0, agent unknown
- [session-12602be0](/framework/ai/sessions/2026/11/02/session-12602be0/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-16ac44ef](/framework/ai/sessions/2026/11/02/session-16ac44ef/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-50484875](/framework/ai/sessions/2026/11/02/session-50484875/): no agent, last log 2 d ago, step 0/0, agent unknown
- [session-d280a118](/framework/ai/sessions/2026/11/02/session-d280a118/): no agent, last log 2 d ago, step 0/0, agent unknown
- …91 more in [follow-up-full.md](follow-up-full.md)

## unworked: 503

Open tasks (idle, queued or waiting, none on the owner) whose last log line is over 7 days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.

- [v-9dvbbrn](/framework/ai/sessions/2026/10/25/v-9dvbbrn/): idle, last log 11 d ago
- [module-folder-tasks-are-not-found-unless](/framework/ai/sessions/2026/10/25/v-9dvbbrn/module-folder-tasks-are-not-found-unless/): idle, last log 11 d ago
- [mobile-sheet-page-cannot-scroll-to-the-b](/framework/ai/sessions/2026/10/25/v-9dvbbrn/mobile-sheet-page-cannot-scroll-to-the-b/): idle, last log 11 d ago
- [chat-tab-on-every-session-page-talk-to-a](/framework/ai/sessions/2026/10/25/v-9dvbbrn/chat-tab-on-every-session-page-talk-to-a/): idle, last log 11 d ago
- [session-page-overview-clear-the-leftover](/framework/ai/sessions/2026/10/25/v-9dvbbrn/session-page-overview-clear-the-leftover/): idle, last log 11 d ago
- [core-page-the-page-s-cards-are-misaligne](/framework/core/Page/tasks/core-page-the-page-s-cards-are-misaligne/): idle, last log 12 d ago
- [mention-voice-session-ids-become-icon-li](/framework/ext/Mention/tasks/mention-voice-session-ids-become-icon-li/): idle, last log 12 d ago
- [v-sq8y7db](/framework/ai/sessions/2026/10/25/v-sq8y7db/): idle, last log 12 d ago
- [v-hzpy68f](/framework/ai/sessions/2026/10/25/v-hzpy68f/): idle, last log 12 d ago
- [tasks](/framework/ai/sessions/tasks/): idle, last log 13 d ago
- …493 more in [follow-up-full.md](follow-up-full.md)

## Check

839 healthy + 103 flagged = 942; the state lists 942 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 400 local branches are not merged into `compliance/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `compliance/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `compliance/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **unworked**: the state's bucket is `idle`, `queued` or `waiting` (not on the owner) and the last log line is over 7 days old. Counted over the whole state, not only the window, because a task nobody touches drops out of the window. The 133 stale queue tasks of 2026-10-24 (nothing picks tasks from the queue by itself) are what this exists to catch early; it also counts idle and waiting tasks outside the queue, so its number is larger.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
