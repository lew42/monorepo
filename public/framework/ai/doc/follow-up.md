# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/State.mjs`): every task below is a row of `ai/state.json`. Computed 2026-10-18 14:12 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 65 quiet over 2 h · 46 landed with no outcome · 0 open asks with no live owner · 909 healthy of 1020.**

## quiet: 65

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [task-system](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/): mastermind-task-system, last log 10 h ago, step 1/0, agent dormant
- [01-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/01-work/): minion-unclear-01-work, last log 20 h ago, step 0/0, agent stopped
- [02-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/02-work/): minion-unclear-02-work, last log 20 h ago, step 0/0, agent stopped
- [03-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/03-work/): minion-unclear-03-work, last log 20 h ago, step 0/0, agent stopped
- [04-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/04-work/): minion-unclear-04-work, last log 20 h ago, step 0/0, agent stopped
- [05-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/05-work/): minion-unclear-05-work, last log 20 h ago, step 0/0, agent stopped
- [06-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/06-work/): minion-unclear-06-work, last log 20 h ago, step 0/0, agent stopped
- [08-concrete](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/08-concrete/): minion-unclear-08-concrete, last log 20 h ago, step 0/0, agent stopped
- [09-look](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/09-look/): minion-unclear-09-look, last log 20 h ago, step 0/0, agent stopped
- [07-path](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/07-path/): minion-unclear-07-path, last log 20 h ago, step 0/0, agent stopped
- [01-look](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2b/01-look/): minion-unclear-2b-look, last log 20 h ago, step 0/0, agent stopped
- [refine-audit](/framework/ai/sessions/2026/10/15/voice-20261015/refine-audit/): helper-refine-audit, last log 22 h ago, step 1/0, agent stopped
- …53 more in [follow-up-full.md](follow-up-full.md)

## no-outcome: 46

landed with no outcome text: add one line saying what shipped.

- [property-of-merge](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/property-of-merge/): helper-property-of-merge, last log 1 h ago, step 0/0, agent stopped
- [session-day](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-day/): helper-session-day, last log 1 h ago, step 0/0, agent stopped
- [dictate-wide](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-wide/): helper-dictate-wide, last log 10 h ago, step 0/0, agent stopped
- [sheet-handoff-proof](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-handoff-proof/): helper-sheet-handoff-proof, last log 11 h ago, step 0/0, agent stopped
- [templates-live-proof](/framework/core/Task/tasks/templates-live-proof/): helper, last log 22 h ago, step 0/0, agent dormant
- [tasks-wide](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-wide/): helper-tasks-wide, last log 22 h ago, step 0/0, agent stopped
- [swallow](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/swallow/): helper-voice-swallow, last log 24 h ago, step 0/0, agent stopped
- [overview-of-this-dictation-and-all-asks](/framework/ai/tasks/overview-of-this-dictation-and-all-asks/): helper-a, last log 33 h ago, step 0/0, agent unknown
- …38 more in [follow-up-full.md](follow-up-full.md)

## Check

909 healthy + 111 flagged = 1020; the state lists 1020 tasks in the same 10 days: agree. The state's own self-check is ok. Source: a fresh State snapshot. 200 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
