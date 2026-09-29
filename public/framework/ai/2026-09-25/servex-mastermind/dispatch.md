# Ready to dispatch (from the owner's tab; mastermind-servex-2 is refused by policy)

| # | spawn_agent | brief | card |
|---|---|---|---|
| 1 | role `task-mastermind`, name `quickfix-worktrees`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-25/quickfix-worktrees/requirements.md | 2026/09/25/quick-fix-worktrees-smoke-test-then-merg |
| 2 | the same, name `recursive-pairs`, after #1 lands (it needs `take_worktree()`) | ai/2026-09-25/recursive-pairs/requirements.md (8 deliverables: pairs, one skill, hearing, parent↔child and the mastermind-servex-N policy fix, quick edits, fresh recycling, Opus root assistant, VS Code inbox) | 2026/09/25/one-recursive-agent-system-the-same-pair |

The prompt for each: "You own one task. Your brief is <brief>, and your task log is task.jsonl beside it. Work in one worktree of your own. Prove every Servex change on a private Servex first, and restart the live one once at the end."

And: "Land with a checklist of the owner's asks, each with its proof. Post progress on card <card>, two sentences at a time."

Context recycling is deliverable 6 of #2 (thresholds on card fresh-sessions-instead-of-context-drift). The 15-minute usage refresh is **already built**: Servex/Usage.js, wired into Servex.js. Its first run is due about 17:47; check that usage.json's time moves past 17:32.

## 2026-09-28

| # | spawn_agent | brief | card |
|---|---|---|---|
| 3 | role `task-mastermind`, name `fresh-eyes-review`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/fresh-eyes-review/requirements.md | 2026/09/28/fresh-eyes-review-built-into-every-task |
| 4 | role `task-mastermind`, name `waiting-on-you`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/waiting-on-you/requirements.md | 2026/09/28/waiting-on-you-never-buried |

**Queued Servex restart** (mastermind-servex-3, 2026-09-28): the reaper stops every finished short-lived agent, whatever its role (only assistant, manager, master-assistant, mastermind, task-mastermind and dispatcher are long-lived; task masterminds stop after 15 idle min); Global.js boots and wakes the newest `mastermind-servex-N` (the holder), never the retired session; policy.js treats `mastermind-servex-N` as the Servex mastermind; Agents.holder() routes messages for "mastermind-servex" to the newest live holder. Proved on a private boot; restart when no agent is working.
| 5 | role `task-mastermind`, name `shared-browser`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/shared-browser/requirements.md | 2026/09/28/shared-browser-launcher-no-popups |
| 6 | role `task-mastermind`, name `commit-live-system`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions`; main tree, no worktree | ai/2026-09-28/commit-live-system/requirements.md | 2026/09/28/commit-the-live-system-code |
| 7 | role `task-mastermind`, name `page-drawer`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/page-drawer/requirements.md (step A) | 2026/09/28/agent-work-on-every-page-sanity-checks-c |
| 8 | row #2 recursive-pairs, now with the lifecycle and any-page additions (step B) | ai/2026-09-25/recursive-pairs/requirements.md | 2026/09/28/agent-work-on-every-page-sanity-checks-c |
| 9 | role `task-mastermind`, name `check-consensus`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions`; AFTER fresh-eyes-review lands | ai/2026-09-28/check-consensus/requirements.md (step C) | 2026/09/28/agent-work-on-every-page-sanity-checks-c |
| 10 | role `task-mastermind`, name `collab-rounds`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/collab-rounds/requirements.md | 2026/09/28/agent-work-on-every-page-sanity-checks-c |
| 11 | role `task-mastermind`, name `source-library`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/source-library/requirements.md | 2026/09/28/agent-work-on-every-page-sanity-checks-c |
| 12 | role `task-mastermind`, name `task-loop`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/task-loop/requirements.md | 2026/09/28/skills-as-a-workflow-tasks-chased-by-nod |
| 13 | role `task-mastermind`, name `review-turns`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions`; after collab-rounds lands (reuses its Phase + scoreboard) | ai/2026-09-28/review-turns/requirements.md | 2026/09/28/fresh-eyes-review-built-into-every-task |
| 14 | role `task-mastermind`, name `collab-facts`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions`; after review-turns lands | ai/2026-09-28/collab-facts/requirements.md | 2026/09/28/agent-work-on-every-page-sanity-checks-c |
| 15 | role `task-mastermind`, name `tooling-gaps`, model `claude-opus-5-5`, effort `medium`, `bypassPermissions` | ai/2026-09-28/tooling-gaps/requirements.md | live |
| 16 | role `task-mastermind`, name `task-placement`, model `claude-sonnet-5`, effort `medium`, `bypassPermissions`; after task-loop lands | ai/2026-09-28/task-placement/requirements.md | 2026/09/28/inbox-rows-are-the-real-pages-page-class |
