# Follow-up: what fell through the cracks

Computed 2026-10-14 05:01 UTC by `node Server/FollowUp.mjs --write` from every task folder of the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**1 landed with unmerged commits · 0 merged but never landed · 19 quiet over 2 h · 2 landed with no outcome · 17 open asks with no live owner · 124 healthy of 146.**

## ⚠️ The owner decides: `michael/property-of`

Its commits are code and not on `michael/dev`; this task does not merge it.
```
public/framework/ai/AISession/AISessionDetail.js   |  22 +++++++++++--
 .../10/12/session-87bec773/property-of/STATE.md    |   3 ++
 .../property-of/proof/pof-after.png                | Bin 0 -> 119092 bytes
 .../property-of/proof/pof-before.png               | Bin 0 -> 108449 bytes
 public/framework/core/Page/doc/binding.md          |   6 ++--
 public/framework/core/Property/Property.js         |  35 +++++++++++++++++++++
 public/framework/core/Property/Property.test.mjs   |  31 ++++++++++++++++++
 public/framework/core/Property/readme.md           |   2 ++
 8 files changed, 93 insertions(+), 6 deletions(-)
```

## unmerged: 1

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [dictate-without-claude](/framework/ai/sessions/2026/10/04/dictate-without-claude/dictate-without-claude/) (`worktree/dictate-without-claude`, 1 ahead): task-mastermind-dictate-without-claude, last log 9 d ago, step 1/0, agent dormant

## quiet: 19

no log for over 2 h and no live agent: resume it or close it.

- [feedback-council-2](/framework/ai/sessions/2026/10/12/feedback-council-2/): task-mas, last log 31 h ago, step 0/0, agent unknown
- [figma-claude-designs](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/): no agent, last log 5 h ago, step 0/0, agent unknown
- [feedback-council](/framework/ai/sessions/2026/10/09/feedback-council/): task-mas, last log 4 d ago, step 0/0, agent unknown
- [notifications-lab](/framework/ai/sessions/2026/10/09/notifications-lab/notifications-lab/): mastermind-notifications-lab, last log 5 d ago, step 1/0, agent dormant
- [worktree-pool-ready](/framework/ai/sessions/2026/10/09/session-b431af83/worktree-pool-ready/): task-mastermind-worktree-pool-ready, last log 4 d ago, step 1/0, agent dormant
- [ai-system-docs](/framework/ai/sessions/2026/10/08/ai-system-docs-fa3e829d/ai-system-docs/): mastermind-ai-system-docs, last log 47 h ago, step 1/0, agent gone
- [feedback-council](/framework/ai/sessions/2026/10/08/feedback-council/): task-mas, last log 5 d ago, step 0/0, agent unknown
- [live-not-polling](/framework/ai/sessions/2026/10/08/live-not-polling/live-not-polling/): minion-live-not-polling, last log 5 d ago, step 1/0, agent dormant
- [prompt-audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/): minion-prompt-audit, last log 5 d ago, step 1/0, agent dormant
- [feedback-council](/framework/ai/sessions/2026/10/07/feedback-council/): task-mas, last log 6 d ago, step 0/0, agent unknown
- [feedback-council](/framework/ai/sessions/2026/10/06/feedback-council/): task-mas, last log 8 d ago, step 0/0, agent unknown
- [dictate-live-state](/framework/ai/sessions/2026/10/05/dictate-live-state/dictate-live-state/): task-mastermind-dictate-live-state, last log 8 d ago, step 1/0, agent stopped
- …7 more in [follow-up-full.md](follow-up-full.md)

## no-outcome: 2

landed with no outcome text: add one line saying what shipped.

- [session-detail-live](/framework/ai/sessions/2026/10/09/session-ca11999b/session-detail-live/): minion-session-detail-live, last log 3 d ago, step 1/0, agent dormant
- [checker-1](/framework/ai/sessions/2026/10/07/feedback-council/checker-1/): minion-checker-1, last log 5 d ago, step 1/0, agent stopped

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

Tasks counted 146, `TaskDirs --list 10` 146: agree. 171 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## Old branches: 1 landed, 26 superseded, 17 set aside, nothing lost (2026-10-14)

- 141 branches have a file absent or different on `michael/dev`; 97 carry records only (logs, `files.jsonl`, pictures) and need nothing.
- Landed: `worktree/orphans` as `1d2ebd6d4` (`Server/OrphanCheck.mjs`, a merge warning for pages their parent does not name, opt-in `children: "... auto"`).
- Superseded: every other branch with code, because dev edited the same files since; `ui-system-land*` carry `core/System`, which dev replaced with `core/Shell`.
- Set aside, not deleted: `worktree/check-consensus` (check/consensus tools), `worktree/fix-label` (broken eval fixtures), `audio/chat-revision-pairs-wip`, probe and scratch branches.
- The table: [review.md](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/branch-audit-merge/review.md). No branch was deleted or rewritten.
