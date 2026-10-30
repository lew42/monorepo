# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-30 05:02 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**1 landed with unmerged commits · 0 merged but never landed · 190 quiet over 2 h · 0 landed with no outcome · 266 open tasks untouched over 7 days · 0 open asks with no live owner · 680 healthy of 871.**

## unmerged: 1

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 7 d ago, step 11/7, agent dormant

## quiet: 190

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [session-e00f55c9](/framework/ai/sessions/2026/10/20/session-e00f55c9/): prompt-t, last log 5 h ago, step 0/0, agent unknown
- [session-174601a8](/framework/ai/sessions/2026/10/26/session-174601a8/): no agent, last log 24 h ago, step 0/0, agent unknown
- [session-dcd4f3bc](/framework/ai/sessions/2026/10/26/session-dcd4f3bc/): no agent, last log 24 h ago, step 0/0, agent unknown
- [session-871f4dac](/framework/ai/sessions/2026/10/26/session-871f4dac/): no agent, last log 24 h ago, step 0/0, agent unknown
- [session-ce27d409](/framework/ai/sessions/2026/10/26/session-ce27d409/): no agent, last log 24 h ago, step 0/0, agent unknown
- [session-fc587220](/framework/ai/sessions/2026/10/26/session-fc587220/): no agent, last log 24 h ago, step 0/0, agent unknown
- [cloud-voice-app-20261026](/framework/ai/sessions/2026/10/26/cloud-voice-app-20261026/): no agent, last log 25 h ago, step 0/0, agent unknown
- [session-01aeab84](/framework/ai/sessions/2026/10/26/session-01aeab84/): no agent, last log 25 h ago, step 0/0, agent unknown
- [session-027fedf4](/framework/ai/sessions/2026/10/26/session-027fedf4/): no agent, last log 25 h ago, step 0/0, agent unknown
- [session-758d164f](/framework/ai/sessions/2026/10/26/session-758d164f/): no agent, last log 25 h ago, step 0/0, agent unknown
- [session-a9c2f2db](/framework/ai/sessions/2026/10/26/session-a9c2f2db/): no agent, last log 25 h ago, step 0/0, agent unknown
- [session-02ff098e](/framework/ai/sessions/2026/10/25/session-02ff098e/): no agent, last log 2 d ago, step 0/0, agent unknown
- …178 more in [follow-up-full.md](follow-up-full.md)

## unworked: 266

Open tasks (idle, queued or waiting, none on the owner) whose last log line is over 7 days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.

- [item-move](/framework/core/Item/tasks/item-move/): idle, last log 7 d ago
- [amber-badge-when-readme-is-stale](/framework/ext/drawer/tasks/amber-badge-when-readme-is-stale/): idle, last log 9 d ago
- [v-4lwslx3](/framework/ai/sessions/2026/10/20/v-4lwslx3/): idle, last log 9 d ago
- [v-g6wux1j](/framework/ai/sessions/2026/10/19/v-g6wux1j/): idle, last log 10 d ago
- [v-timqv56](/framework/ai/sessions/2026/10/19/v-timqv56/): idle, last log 10 d ago
- [now-card-topics-as-nested-sub-cards-from](/framework/ai/tasks/now-card-topics-as-nested-sub-cards-from/): idle, last log 12 d ago
- [ai-2-finish-the-retirement-now-nav-entry](/framework/ai/tasks/ai-2-finish-the-retirement-now-nav-entry/): idle, last log 12 d ago
- [dictation-one-configurable-widget-everyw](/framework/ux/Dictate/tasks/dictation-one-configurable-widget-everyw/): idle, last log 12 d ago
- [shell-header-sidebars-footer-the-dark-de](/framework/dev/tasks/shell-header-sidebars-footer-the-dark-de/): idle, last log 12 d ago
- [worktrees-remove-merged-ones-servex-drop](/framework/servex/tasks/worktrees-remove-merged-ones-servex-drop/): idle, last log 12 d ago
- …256 more in [follow-up-full.md](follow-up-full.md)

## Check

680 healthy + 191 flagged = 871; the state lists 871 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 411 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

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
