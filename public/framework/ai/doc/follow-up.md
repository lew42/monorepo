# Follow-up: what fell through the cracks

Computed 2026-10-13 21:33 UTC by `node Server/FollowUp.mjs --write` from every task folder of the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**4 landed with unmerged commits · 0 merged but never landed · 19 quiet over 2 h · 0 landed with no outcome · 0 open asks with no live owner · 171 healthy of 194.**

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

## unmerged: 4

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [part-link](/framework/ai/sessions/2026/10/12/session-78a7b293/part-link/) (`worktree/part-link-run`, 1 ahead): mastermind-part-link, last log 27 h ago, step 1/0, agent gone
- [sessions-grid](/framework/ai/sessions/2026/10/12/session-eecd88fa/sessions-grid/) (`worktree/qf-3`, 3 ahead): mastermind-sessions-grid, last log 26 h ago, step 1/0, agent dormant
- [dictate-without-claude](/framework/ai/sessions/2026/10/04/dictate-without-claude/dictate-without-claude/) (`worktree/dictate-without-claude`, 1 ahead): task-mastermind-dictate-without-claude, last log 9 d ago, step 1/0, agent dormant
- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 10 d ago, step 11/7, agent dormant

## quiet: 19

no log for over 2 h and no live agent: resume it or close it.

- [page-templates-binding-merge](/framework/ai/sessions/2026/10/12/session-21449a90/page-templates-binding-merge/): minion-binding-merge, last log 23 h ago, step 1/0, agent stopped
- [feedback-council](/framework/ai/2026-10-12/feedback-council/): task-mas, last log 23 h ago, step 0/0, agent unknown
- [prompt-audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/): minion-prompt-audit, last log 5 d ago, step 1/0, agent dormant
- [dictate-live-state](/framework/ai/sessions/2026/10/05/dictate-live-state/dictate-live-state/): task-mastermind-dictate-live-state, last log 8 d ago, step 1/0, agent stopped
- [dictate-one-engine](/framework/ai/sessions/2026/10/05/dictate-one-engine/dictate-one-engine/): task-mastermind-dictate-one-engine, last log 8 d ago, step 1/0, agent stopped
- [openrouter-agent-trial](/framework/ai/sessions/2026/10/05/openrouter-agent-trial/openrouter-agent-trial/): task-mastermind-openrouter-agent-trial, last log 7 d ago, step 1/0, agent stopped
- [message-cost](/framework/ai/sessions/2026/10/04/message-cost/message-cost/): task-mastermind-message-cost, last log 9 d ago, step 1/0, agent dormant
- [web-benchmarks](/framework/ai/sessions/2026/10/04/web-benchmarks/web-benchmarks/): task-mastermind-web-benchmarks, last log 9 d ago, step 1/0, agent dormant
- [framework-home-grids](/framework/ai/sessions/2026/10/03/framework-home-grids/framework-home-grids/): task-mastermind-framework-home-grids, last log 9 d ago, step 1/0, agent stopped
- [merge-commits](/framework/ai/sessions/2026/10/03/merge-commits/): no agent, last log 10 d ago, step 0/0, agent unknown
- [node-reap-run](/framework/ai/sessions/2026/10/03/node-reap-run/): no agent, last log 11 d ago, step 0/0, agent unknown
- [openrouter-reads-cache](/framework/ai/sessions/2026/10/03/openrouter-reads-cache/): no agent, last log 10 d ago, step 0/0, agent unknown
- …7 more in [follow-up-full.md](follow-up-full.md)

## Check

Tasks counted 194, `TaskDirs --list 10` 194: agree. 140 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).
