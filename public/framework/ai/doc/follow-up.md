# Follow-up: what fell through the cracks

Computed 2026-10-13 20:59 UTC by `node Server/FollowUp.mjs --write` from every task folder of the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**2 landed with unmerged commits · 0 merged but never landed · 36 quiet over 2 h · 3 landed with no outcome · 9 open asks with no live owner · 153 healthy of 194.**

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

## unmerged: 2

landed, but commits are not on michael/dev: review the diff, then `merge.mjs`.

- [dictate-without-claude](/framework/ai/sessions/2026/10/04/dictate-without-claude/dictate-without-claude/) (`worktree/dictate-without-claude`, 1 ahead): task-mastermind-dictate-without-claude, last log 9 d ago, step 1/0, agent dormant
- [sessions-tab-polish](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/) (`worktree/sessions-tab-polish`, 12 ahead): task-mastermind-sessions-tab-polish, last log 10 d ago, step 11/7, agent dormant

## quiet: 36

no log for over 2 h and no live agent: resume it or close it.

- [page-templates-binding-merge](/framework/ai/sessions/2026/10/12/session-21449a90/page-templates-binding-merge/): minion-binding-merge, last log 22 h ago, step 1/0, agent stopped
- [feedback-council](/framework/ai/2026-10-12/feedback-council/): task-mas, last log 23 h ago, step 0/0, agent unknown
- [page-templates-merge](/framework/ai/2026-10-12/page-templates-merge/): minion-templates-merge, last log 22 h ago, step 1/0, agent stopped
- [feedback-council](/framework/ai/sessions/2026/10/09/feedback-council/): task-mas, last log 4 d ago, step 0/0, agent unknown
- [notifications-lab](/framework/ai/sessions/2026/10/09/notifications-lab/notifications-lab/): mastermind-notifications-lab, last log 5 d ago, step 1/0, agent dormant
- [worktree-pool-ready](/framework/ai/sessions/2026/10/09/session-b431af83/worktree-pool-ready/): task-mastermind-worktree-pool-ready, last log 4 d ago, step 1/0, agent dormant
- [ai-system-docs](/framework/ai/sessions/2026/10/08/ai-system-docs-fa3e829d/ai-system-docs/): mastermind-ai-system-docs, last log 39 h ago, step 1/0, agent gone
- [feedback-council](/framework/ai/sessions/2026/10/08/feedback-council/): task-mas, last log 5 d ago, step 0/0, agent unknown
- [live-not-polling](/framework/ai/sessions/2026/10/08/live-not-polling/live-not-polling/): minion-live-not-polling, last log 5 d ago, step 1/0, agent dormant
- [prompt-audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/): minion-prompt-audit, last log 5 d ago, step 1/0, agent dormant
- [feedback-council](/framework/ai/sessions/2026/10/07/feedback-council/): task-mas, last log 6 d ago, step 0/0, agent unknown
- [feedback-council](/framework/ai/sessions/2026/10/06/feedback-council/): task-mas, last log 8 d ago, step 0/0, agent unknown
- …24 more in [follow-up-full.md](follow-up-full.md)

## no-outcome: 3

landed with no outcome text: add one line saying what shipped.

- [session-detail-live](/framework/ai/sessions/2026/10/09/session-ca11999b/session-detail-live/): minion-session-detail-live, last log 2 d ago, step 1/0, agent dormant
- [checker-1](/framework/ai/sessions/2026/10/07/feedback-council/checker-1/): minion-checker-1, last log 5 d ago, step 1/0, agent stopped
- [session-trace](/framework/ai/sessions/2026/10/03/session-trace/): no agent, last log 11 d ago, step page.js: fetch trace.json, cumulative chart, tool table, waste flags (held)/3, agent unknown

## open asks with no live owner: 9

An ask in `asks.jsonl` still building, routed, queued or stalled whose owner agent is stopped or gone: re-route it or mark it dropped.

- Memory: dormant idle agents, working cap, auto-compaction (building, owner `task-mastermind-dormant-idle` gone)
- AI 2: importance score 1–100 on Needs you, ranked (routed, owner `mastermind-servex-9` stopped)
- Icons: frames, buttons, rails, icon items aligned (building, owner `task-mastermind-icon-system` gone)
- Dictation: sheet shows the chat and mic; release the mic when hidden (building, owner `minion-sheet-regression` stopped)
- Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (routed, owner `task-mastermind-dev-shell` stopped)
- Prompts: each owner prompt becomes a refined Inbox card (building, owner `servex-mastermind-opus (by hand until built)` no such agent)
- Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weighted decisions; build the architect proposal (queued, owner `mastermind-servex (next instance; spawn at the 10 PM reset)` no such agent)
- Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (building, owner `task-mastermind-playwright-reap` gone)
- Framework home: grids without voids, explicit layout classes, layout labels, DevTools inline-style source (building, owner `task-mastermind-framework-home-grids` stopped)

## Check

Tasks counted 194, `TaskDirs --list 10` 194: agree. 117 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).
