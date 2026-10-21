# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-21 05:02 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 11 quiet over 2 h · 0 landed with no outcome · 0 open asks with no live owner · 1064 healthy of 1075.**

## quiet: 11

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [v-lhvz99u](/framework/ai/sessions/2026/10/20/v-lhvz99u/): no agent, last log 2 h ago, step 0/0, agent unknown
- [v-7bnqmeh](/framework/ai/sessions/2026/10/20/v-7bnqmeh/): no agent, last log 4 h ago, step 0/0, agent unknown
- [well-asks](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/well-asks/): minion-well-asks, last log 4 h ago, step 0/0, agent dormant
- [session-e00f55c9](/framework/ai/sessions/2026/10/20/session-e00f55c9/): no agent, last log 6 h ago, step 0/0, agent unknown
- [cloud-voice-task-system-and-voice-agent-exploration](/framework/ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/): no agent, last log 6 h ago, step 0/0, agent unknown
- [log-tool](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/log-tool/): minion-log-tool, last log 7 h ago, step 0/0, agent stopped
- [probe](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/probe/): assistant-probe-session-rule, last log 9 h ago, step 0/0, agent stopped
- [mastermind-repo-slim](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/): helper-one-dashboard-filters, last log 9 h ago, step 28/11, agent stopped
- [mastermind-live-page](/framework/ai/sessions/2026/10/19/spawned/mastermind-live-page/): mastermind-live-page, last log 16 h ago, step 0/0, agent dormant
- [task-mastermind-session-detail-page](/framework/ai/sessions/2026/10/19/spawned/task-mastermind-session-detail-page/): task-mastermind-session-detail-page, last log 23 h ago, step 0/0, agent dormant
- [task-mastermind-voice-opus](/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/): task-mastermind-voice-opus, last log 23 h ago, step 0/0, agent dormant

## Check

1064 healthy + 11 flagged = 1075; the state lists 1075 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 261 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
