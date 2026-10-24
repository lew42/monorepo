# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-24 05:04 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**2 landed with unmerged commits · 0 merged but never landed · 24 quiet over 2 h · 0 landed with no outcome · 0 open asks with no live owner · 1302 healthy of 1328.**

## unmerged: 2

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [figma-phase2](/framework/ai/sessions/2026/10/12/session-cd792e48/figma-phase2/) (`worktree/qf-4`, 1 ahead): mastermind-figma-phase2, last log 27 h ago, step 1/0, agent dormant
- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 27 h ago, step 11/7, agent dormant

## quiet: 24

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [session-data](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/session-data/): no agent, last log 3 h ago, step 0/0, agent unknown
- [smoke-adopt](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/smoke-adopt/): no agent, last log 3 h ago, step 0/0, agent unknown
- [task-queue-plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/task-queue-plan/): no agent, last log 3 h ago, step 0/0, agent unknown
- [review-heartbeat-fixes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/review-heartbeat-fixes/): no agent, last log 3 h ago, step 0/0, agent unknown
- [session-snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/session-snapshot/): no agent, last log 3 h ago, step 0/0, agent unknown
- [ai-system-mastermind](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/ai-system-mastermind/): no agent, last log 4 h ago, step 0/0, agent unknown
- [compact-before-sleep](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/compact-before-sleep/): no agent, last log 4 h ago, step 0/0, agent unknown
- [proposals](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/): minion-proposals, last log 4 h ago, step 0/0, agent dormant
- [process-names](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/process-names/): minion-process-names, last log 4 h ago, step 0/0, agent stopped
- [voice-20261016](/framework/ai/sessions/2026/10/16/voice-20261016/): helper-whisper-log, last log 5 h ago, step 1/0, agent dormant
- [merge-approvals](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/merge-approvals/): minion-merge-approvals, last log 5 h ago, step 0/0, agent stopped
- [tasks-list](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/tasks-list/): minion-tasks-list, last log 5 h ago, step 0/0, agent stopped
- …12 more in [follow-up-full.md](follow-up-full.md)

## Check

1302 healthy + 26 flagged = 1328; the state lists 1328 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 315 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
