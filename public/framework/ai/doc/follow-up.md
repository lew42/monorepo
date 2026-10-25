# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-10-25 05:03 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**2 landed with unmerged commits · 0 merged but never landed · 29 quiet over 2 h · 0 landed with no outcome · 239 open tasks untouched over 7 days · 0 open asks with no live owner · 1340 healthy of 1371.**

## unmerged: 2

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [figma-phase2](/framework/ai/sessions/2026/10/12/session-cd792e48/figma-phase2/) (`worktree/qf-4`, 1 ahead): mastermind-figma-phase2, last log 2 d ago, step 1/0, agent dormant
- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 2 d ago, step 11/7, agent dormant

## quiet: 29

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [test-basics](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/test-basics/): task-mastermind-test-basics, last log 2 h ago, step 0/0, agent stopped
- [smoke-links](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/fast-write/smoke-links/): minion-task-smoke-links, last log 2 h ago, step 0/0, agent dormant
- [session-feed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-feed/): minion-session-feed, last log 2 h ago, step 0/0, agent stopped
- [sidebar-pins](/framework/core/Page/tasks/page-mastermind/sidebar-pins/): no agent, last log 4 h ago, step 0/0, agent unknown
- [batch2](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/queue-top/batch2/): no agent, last log 15 h ago, step 0/0, agent unknown
- [process-system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/): mastermind-system-architect-3, last log 24 h ago, step 0/0, agent stopped
- [nav-links](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/nav-links/): minion-nav-links, last log 24 h ago, step 0/0, agent stopped
- [merge-latest](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/merge-latest/): minion-merge-latest, last log 24 h ago, step 0/0, agent stopped
- [sessions-shots](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-shots/): task-mastermind-sessions-shots, last log 25 h ago, step 0/0, agent dormant
- [session-data](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/session-data/): no agent, last log 27 h ago, step 0/0, agent unknown
- [smoke-adopt](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/smoke-adopt/): no agent, last log 27 h ago, step 0/0, agent unknown
- [task-queue-plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/task-queue-plan/): no agent, last log 27 h ago, step 0/0, agent unknown
- …17 more in [follow-up-full.md](follow-up-full.md)

## unworked: 239

Open tasks (idle, queued or waiting, none on the owner) whose last log line is over 7 days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.

- [coral-badge-when-readme-is-staying](/framework/ext/drawer/tasks/coral-badge-when-readme-is-staying/): idle, last log 7 d ago
- [readme-links-the-architecture-doc](/framework/ext/drawer/tasks/readme-links-the-architecture-doc/): idle, last log 7 d ago
- [decide-later-how-to-prioritise-data-bind](/framework/core/Item/tasks/decide-later-how-to-prioritise-data-bind/): idle, last log 7 d ago
- [build-a-tree-ui-with-icons-from-the-goog](/framework/ext/Refine/tasks/build-a-tree-ui-with-icons-from-the-goog/): idle, last log 7 d ago
- [use-a-single-consistent-preview-scale-or](/framework/ext/Refine/tasks/use-a-single-consistent-preview-scale-or/): idle, last log 7 d ago
- [solve-the-page-boundary-problem-through](/framework/core/Page/tasks/solve-the-page-boundary-problem-through/): idle, last log 7 d ago
- [make-page-data-structure-the-go-to-wrapp](/framework/core/Page/tasks/make-page-data-structure-the-go-to-wrapp/): idle, last log 7 d ago
- [investigate-whether-updates-can-be-buffe](/framework/ai/tasks/investigate-whether-updates-can-be-buffe/): idle, last log 7 d ago
- [look-through-other-pages-such-as-page-se](/framework/ext/Figma/tasks/look-through-other-pages-such-as-page-se/): idle, last log 7 d ago
- [if-on-pace-when-finished-sync-the-figma](/framework/ext/Figma/tasks/if-on-pace-when-finished-sync-the-figma/): idle, last log 7 d ago
- …229 more in [follow-up-full.md](follow-up-full.md)

## Check

1340 healthy + 31 flagged = 1371; the state lists 1371 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 350 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

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
