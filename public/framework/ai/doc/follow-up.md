# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-28 05:04 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**1 landed with unmerged commits · 0 merged but never landed · 124 quiet over 2 h · 0 landed with no outcome · 265 open tasks untouched over 7 days · 0 open asks with no live owner · 838 healthy of 963.**

## unmerged: 1

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 5 d ago, step 11/7, agent dormant

## quiet: 124

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [session-601987fc](/framework/ai/sessions/2026/10/25/session-601987fc/): no agent, last log 29 h ago, step 0/0, agent unknown
- [session-687ef127](/framework/ai/sessions/2026/10/25/session-687ef127/): no agent, last log 31 h ago, step 0/0, agent unknown
- [session-68885880](/framework/ai/sessions/2026/10/25/session-68885880/): no agent, last log 31 h ago, step 0/0, agent unknown
- [session-616982b9](/framework/ai/sessions/2026/10/25/session-616982b9/): no agent, last log 32 h ago, step 0/0, agent unknown
- [session-63d743e2](/framework/ai/sessions/2026/10/25/session-63d743e2/): no agent, last log 32 h ago, step 0/0, agent unknown
- [session-65e2f51e](/framework/ai/sessions/2026/10/25/session-65e2f51e/): no agent, last log 32 h ago, step 0/0, agent unknown
- [session-dba24f39](/framework/ai/sessions/2026/10/25/session-dba24f39/): no agent, last log 32 h ago, step 0/0, agent unknown
- [session-69174fe9](/framework/ai/sessions/2026/10/25/session-69174fe9/): no agent, last log 35 h ago, step 0/0, agent unknown
- [session-70f4fedc](/framework/ai/sessions/2026/10/25/session-70f4fedc/): prompt-t, last log 35 h ago, step 0/0, agent unknown
- [session-72335e35](/framework/ai/sessions/2026/10/25/session-72335e35/): no agent, last log 35 h ago, step 0/0, agent unknown
- [session-727b7022](/framework/ai/sessions/2026/10/25/session-727b7022/): no agent, last log 35 h ago, step 0/0, agent unknown
- [session-72e64235](/framework/ai/sessions/2026/10/25/session-72e64235/): no agent, last log 35 h ago, step 0/0, agent unknown
- …112 more in [follow-up-full.md](follow-up-full.md)

## unworked: 265

Open tasks (idle, queued or waiting, none on the owner) whose last log line is over 7 days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.

- [amber-badge-when-readme-is-stale](/framework/ext/drawer/tasks/amber-badge-when-readme-is-stale/): idle, last log 7 d ago
- [v-4lwslx3](/framework/ai/sessions/2026/10/20/v-4lwslx3/): idle, last log 7 d ago
- [v-g6wux1j](/framework/ai/sessions/2026/10/19/v-g6wux1j/): idle, last log 8 d ago
- [v-timqv56](/framework/ai/sessions/2026/10/19/v-timqv56/): idle, last log 8 d ago
- [now-card-topics-as-nested-sub-cards-from](/framework/ai/tasks/now-card-topics-as-nested-sub-cards-from/): idle, last log 10 d ago
- [ai-2-finish-the-retirement-now-nav-entry](/framework/ai/tasks/ai-2-finish-the-retirement-now-nav-entry/): idle, last log 10 d ago
- [dictation-one-configurable-widget-everyw](/framework/ux/Dictate/tasks/dictation-one-configurable-widget-everyw/): idle, last log 10 d ago
- [shell-header-sidebars-footer-the-dark-de](/framework/dev/tasks/shell-header-sidebars-footer-the-dark-de/): idle, last log 10 d ago
- [worktrees-remove-merged-ones-servex-drop](/framework/servex/tasks/worktrees-remove-merged-ones-servex-drop/): idle, last log 10 d ago
- [logs-unknown-verbs-on-ai-2-the-validator](/framework/ext/JSONL/tasks/logs-unknown-verbs-on-ai-2-the-validator/): idle, last log 10 d ago
- …255 more in [follow-up-full.md](follow-up-full.md)

## Check

838 healthy + 125 flagged = 963; the state lists 963 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 399 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

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
