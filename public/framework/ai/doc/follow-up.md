# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-23 05:00 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**1 landed with unmerged commits · 0 merged but never landed · 118 quiet over 2 h · 0 landed with no outcome · 0 open asks with no live owner · 1081 healthy of 1200.** (Servex was down: agent states unknown.)

## unmerged: 1

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 3 h ago, step 11/7, agent ?

## quiet: 118

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [minion-held-2](/framework/ai/sessions/2026/10/22/spawned/minion-held-2/): minion-held, last log 2 h ago, step 0/0, agent ?
- [minion-held-3](/framework/ai/sessions/2026/10/22/spawned/minion-held-3/): minion-held, last log 2 h ago, step 0/0, agent ?
- [minion-held-4](/framework/ai/sessions/2026/10/22/spawned/minion-held-4/): minion-held, last log 2 h ago, step 0/0, agent ?
- [minion-dead-4](/framework/ai/sessions/2026/10/22/spawned/minion-dead-4/): minion-dead, last log 2 h ago, step 0/0, agent ?
- [minion-dead-3](/framework/ai/sessions/2026/10/22/spawned/minion-dead-3/): minion-dead, last log 2 h ago, step 0/0, agent ?
- [minion-dead-2](/framework/ai/sessions/2026/10/22/spawned/minion-dead-2/): minion-dead, last log 2 h ago, step 0/0, agent ?
- [readmes-page](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/run-1/readmes-page/): mastermi, last log 3 h ago, step 0/0, agent ?
- [voice-20261016](/framework/ai/sessions/2026/10/16/voice-20261016/): helper-whisper-log, last log 3 h ago, step 1/0, agent ?
- [session-fb77ab71](/framework/ai/sessions/2026/10/12/session-fb77ab71/): no agent, last log 3 h ago, step 0/0, agent ?
- [session-f90a4e29](/framework/ai/sessions/2026/10/12/session-f90a4e29/): no agent, last log 3 h ago, step 0/0, agent ?
- [session-fb723164](/framework/ai/sessions/2026/10/12/session-fb723164/): no agent, last log 3 h ago, step 0/0, agent ?
- [session-f73e4a4a](/framework/ai/sessions/2026/10/12/session-f73e4a4a/): no agent, last log 3 h ago, step 0/0, agent ?
- …106 more in [follow-up-full.md](follow-up-full.md)

## Check

1081 healthy + 119 flagged = 1200; the state lists 1200 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 294 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
