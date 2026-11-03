## At 10:40 PM, nothing was running

Several tasks stopped mid-way. Their minions sat **queued for memory** (about 16 agents were running at once), and those queued minions and their masterminds are no longer in Servex's list. So nobody woke them, and they never landed. It's the exact failure the task loop was built to catch, and the task loop itself was one of them.

| task | spent | where it stopped | what I did |
|---|---|---|---|
| [Commit the live system code](/framework/ai2/2026/09/28/commit-the-live-system-code/) | $0 (never ran) | 326 uncommitted files, up from 219 | **restarted** (Sonnet) |
| [Shared browser launcher](/framework/ai2/2026/09/28/shared-browser-launcher-no-popups/) | $0 (never ran) | the popups fix | **restarted** (Sonnet), after the commit |
| [Figma Sept 2026 cards](/framework/ai2/2026/09/28/figma-sept-2026-each-section-as-a-card/) | **$45.70** | a review found 8 fixes; not applied | held |
| [File explorer /fs](/framework/ai2/2026/09/28/file-explorer-no-panels-full-screen-at-a/) | $15.24 | minions queued, then lost | held |
| [Task loop](/framework/ai2/2026/09/28/skills-as-a-workflow-tasks-chased-by-nod/) | $12.22 | minions queued, then lost | held |
| [Waiting on you](/framework/ai2/2026/09/28/waiting-on-you-never-buried/) | $14.17 | 2 of 3 minions queued, then lost | held |
| [Same pair on every page](/framework/ai2/2026/09/25/one-recursive-agent-system-the-same-pair/) | $29.19 | not landed | held |
| Check consensus | – | just started a worktree | held |

**Landed today:** the page drawer, collaboration rounds, fresh-eyes review, review turns, facts, the source library, the dictation playground, the content-cards audit, the page mastermind's first steps, the harness research, and AI 2 (real pages, workspace, vanishing row).

**Usage:** the week is at 34% with about 72% of it gone, so under pace.

## The system bug to fix first
- [ ] A queued minion that gets dropped must wake its mastermind, and the queue must survive a Servex restart
- [ ] At most about 8 agents at once, so nothing queues for memory
