# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/State.mjs`): every task below is a row of `ai/state.json`. Computed 2026-10-19 05:04 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 26 quiet over 2 h · 0 landed with no outcome · 0 open asks with no live owner · 1001 healthy of 1027.**

## quiet: 26

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [compact-nudge](/framework/ai/sessions/2026/10/16/voice-20261016/compact-nudge/): helper-compact-nudge, last log 6 h ago, step 1/0, agent dormant
- [task-system](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/): mastermind-task-system, last log 25 h ago, step 1/0, agent dormant
- [refine-audit](/framework/ai/sessions/2026/10/15/voice-20261015/refine-audit/): helper-refine-audit, last log 37 h ago, step 1/0, agent stopped
- [refine-explain](/framework/ai/sessions/2026/10/15/voice-20261015/refine-explain/): helper-refine-explain, last log 37 h ago, step 1/0, agent stopped
- [remote-full-registry](/framework/ai/sessions/2026/10/15/voice-20261015/remote-full-registry/): helper-remote-registry, last log 37 h ago, step 1/0, agent stopped
- [sessions-data](/framework/ai/sessions/2026/10/15/voice-20261015/sessions-data/): helper-sessions-data, last log 37 h ago, step 1/0, agent stopped
- [spawn-policy](/framework/ai/sessions/2026/10/15/voice-20261015/spawn-policy/): helper-spawn-policy, last log 37 h ago, step 1/0, agent stopped
- [live-post](/framework/ai/sessions/2026/10/15/voice-20261015/live-post/): helper-live-post, last log 37 h ago, step 1/0, agent stopped
- [loose-ends](/framework/ai/sessions/2026/10/15/voice-20261015/loose-ends/): helper-loose-ends, last log 37 h ago, step 1/0, agent stopped
- [page-system](/framework/ai/sessions/2026/10/15/voice-20261015/page-system/): helper-page-system, last log 37 h ago, step 1/0, agent stopped
- [past-work-log](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-log/): helper-past-work-log, last log 37 h ago, step 1/0, agent stopped
- [past-work-map](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-map/): helper-past-work-map, last log 37 h ago, step 1/0, agent stopped
- …14 more in [follow-up-full.md](follow-up-full.md)

## Check

1001 healthy + 26 flagged = 1027; the state lists 1027 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/state.json (under a minute old). 207 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
