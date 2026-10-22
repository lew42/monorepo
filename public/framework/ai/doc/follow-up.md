# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-22 05:02 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 1 quiet over 2 h · 0 landed with no outcome · 0 open asks with no live owner · 1075 healthy of 1076.**

## quiet: 1

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [v-lhvz99u](/framework/ai/sessions/2026/10/20/v-lhvz99u/): no agent, last log 26 h ago, step 0/0, agent unknown

## Check

1075 healthy + 1 flagged = 1076; the state lists 1076 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 262 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
