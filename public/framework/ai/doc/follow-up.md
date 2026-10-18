# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/State.mjs`): every task below is a row of `ai/state.json`. Computed 2026-10-18 12:55 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 192 quiet over 2 h · 46 landed with no outcome · 17 open asks with no live owner · 743 healthy of 981.**

## quiet: 192

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [task-system](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/): mastermind-task-system, last log 8 h ago, step 1/0, agent dormant
- [01-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/01-work/): minion-unclear-01-work, last log 19 h ago, step 0/0, agent stopped
- [02-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/02-work/): minion-unclear-02-work, last log 19 h ago, step 0/0, agent stopped
- [03-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/03-work/): minion-unclear-03-work, last log 19 h ago, step 0/0, agent stopped
- [04-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/04-work/): minion-unclear-04-work, last log 19 h ago, step 0/0, agent stopped
- [05-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/05-work/): minion-unclear-05-work, last log 19 h ago, step 0/0, agent stopped
- [06-work](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/06-work/): minion-unclear-06-work, last log 19 h ago, step 0/0, agent stopped
- [08-concrete](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/08-concrete/): minion-unclear-08-concrete, last log 19 h ago, step 0/0, agent stopped
- [09-look](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/09-look/): minion-unclear-09-look, last log 19 h ago, step 0/0, agent stopped
- [07-path](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/07-path/): minion-unclear-07-path, last log 19 h ago, step 0/0, agent stopped
- [01-look](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2b/01-look/): minion-unclear-2b-look, last log 19 h ago, step 0/0, agent stopped
- [refine-audit](/framework/ai/sessions/2026/10/15/voice-20261015/refine-audit/): helper-refine-audit, last log 21 h ago, step 1/0, agent stopped
- …180 more in [follow-up-full.md](follow-up-full.md)

## no-outcome: 46

landed with no outcome text: add one line saying what shipped.

- [property-of-merge](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/property-of-merge/): helper-property-of-merge, last log 0 h ago, step 0/0, agent stopped
- [session-day](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-day/): helper-session-day, last log 0 h ago, step 0/0, agent stopped
- [dictate-wide](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-wide/): helper-dictate-wide, last log 9 h ago, step 0/0, agent stopped
- [sheet-handoff-proof](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-handoff-proof/): helper-sheet-handoff-proof, last log 10 h ago, step 0/0, agent stopped
- [templates-live-proof](/framework/core/Task/tasks/templates-live-proof/): helper, last log 21 h ago, step 0/0, agent dormant
- [tasks-wide](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-wide/): helper-tasks-wide, last log 21 h ago, step 0/0, agent stopped
- [swallow](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/swallow/): helper-voice-swallow, last log 23 h ago, step 0/0, agent stopped
- [overview-of-this-dictation-and-all-asks](/framework/ai/tasks/overview-of-this-dictation-and-all-asks/): helper-a, last log 32 h ago, step 0/0, agent unknown
- …38 more in [follow-up-full.md](follow-up-full.md)

## open asks with no live owner: 17

An ask in `asks.jsonl` still building, routed, queued or stalled whose owner agent is stopped or gone: re-route it or mark it dropped.

- Merges: approval for foundational merges, reversible from the card (queued, owner `mastermind-servex (proposal-flow, 10 PM)` no such agent)
- Templates: weight per use, use-template skill/tool, one library (queued, owner `mastermind-servex (proposal-flow, 10 PM)` no such agent)
- Logs: page.jsonl curated vs log.jsonl everything (recommendation) (queued, owner `mastermind-servex (proposal-flow, 10 PM)` no such agent)
- UI: System class; /framework/ui/ library of approved blocks; class pills; masonry; sibling/child rails (queued, owner `servex-mastermind-opus (spawn after the 10 PM weekly reset)` no such agent)
- Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (building, owner `task-mastermind-dormant-idle` gone)
- Selection: tap to select and drill down on mobile; the AI knows the element (queued, owner `servex-mastermind-opus (spawn after the 4:50 PM reset)` no such agent)
- Task pages: grey checkboxes, full-width bars, reports as free content (queued, owner `ui-system brief (after the System class)` no such agent)
- Padding: percentage padding, a wrapper per grid item, the rule in the layout system (queued, owner `servex-mastermind-opus (spawn at the 10 PM reset)` no such agent)
- Monitor: a Playwright agent on main; template changes get console + screenshot + stall checks (queued, owner `mastermind-servex (10 PM, first in the task)` no such agent)
- Logs: validated writes only; shell appends to .jsonl blocked (queued, owner `mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard` no such agent)
- …7 more in [follow-up-full.md](follow-up-full.md)

## Check

743 healthy + 238 flagged = 981; the state lists 981 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/state.json (under a minute old). 198 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
