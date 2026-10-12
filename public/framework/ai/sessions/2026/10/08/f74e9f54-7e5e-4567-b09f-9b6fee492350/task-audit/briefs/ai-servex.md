# Brief: close the open ai-servex loose ends

One mastermind owns this whole cluster (34 open rows, 3 marked now). Work the `now` rows first, smallest step each, commit after each, and log to your card. Rows marked "likely done" only need a quick look. Source: [work-items.md](../work-items.md); how the rows were checked: [verified.md](../verified.md). Never delete; add and link.

| Row | Task | Status | Smallest next step |
|---|---|---|---|
| 14 | Servex: free the RAM held by idle dev servers, now | now, checked: partial | Run node public/framework/ai/sessions/2026/10/02/node-reap/node-reap.mjs as a dry run, then with --apply, and append the before/after figures from result.json to this ta |
| 100 | local-ctx-fix | now, checked: partial | Wire deepseek/deepseek-v4.1-flash as the fallback ahead of Sonnet in Echo's refine, then run one long prompt through it and log the proof. |
| 215 | auditor-deepseek | now, checked: done | Write the landed_at line in auditor-deepseek/task.jsonl, since the five audits already sit in consensus.json and the pilot merged at 769b74d5f. |
| 13 | Merge: a landing is committed, or it doesn't say landed | later | Make merge.mjs commit a three-way landing before it says landed; queued, untouched. |
| 16 | Servex: find the slowest common path and make it faster | later | Run the perf audit on three paths, then fix the slowest; queued, untouched. |
| 17 | Servex: the phone site (port 8137) is always up, started by Servex | later | Build the always-up phone site on port 8137; check the LAN route first. |
| 18 | Servex: free the stuck pool slots, and stop them sticking | later | Free stuck pool slots with a dry-run list on the card, then stop them sticking. |
| 19 | Servex: worktree servers survive a restart, so 4 finished landings can | later | Make worktree servers survive a restart so the four landings can merge. |
| 22 | Servex: Known issues, one live list | later | Build one live Known-issues list with a +1 action; queued, untouched. |
| 26 | backend | later | Build the asks ledger's Servex side; nothing begun. |
| 32 | fixes | later | Revive the stopped minion and answer the fresh review findings. |
| 33 | tooling | later | Revive the stopped minion: review.mjs uses the review skill; question list page. |
| 37 | Servex docs: the agent system as flowcharts | later | Write the Servex agent system as flowcharts; routed, nothing built. |
| 57 | fix | later | Answer the fresh-eyes review findings; no commits, requirements only. |
| 58 | fix2 | later | Answer the second review's findings; no commits, scoping only. |
| 59 | check-consensus | later | Write the consensus-check step; no start date or log exists. |
| 65 | Servex: spend goes where results are, and you can see who spawned whom | later | Spawn the spend-shape task in main; queued, not landed. |
| 67 | Review: an empty diff is refused, never passed unreviewed | later | Spawn the review empty-diff refusal minion; queued, not started. |
| 69 | Servex: a restart keeps working agents, and a mastermind stays wakeabl | later | Spawn the restart-keeps-agents task after worktree servers land. |
| 70 | Servex: the main checkout never leaves michael/dev | later | Spawn the main-branch guard minion; queued, nothing run. |
| 80 | Cards: Approve/Unclear, module cards, categories | later | Spawn card-pipeline-2 after card-pipeline is merged. |
| 83 | Logs: every line stamped by a tool | later | Spawn the stamped-logs minion after card-pipeline-2 lands. |
| 120 | Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents) | later | Free worktree pool slots qf-6 and qf-9 held by finished agents; no card. |
| 128 | Servex mastermind, Oct 2 evening: the mastermind role could not call i | later | Commit the uncommitted .mjs tools after review, then merge the Servex mastermind branch. |
| 142 | context-card-type | later | Needs a real design decision on the context card type, then build it. |
| 181 | Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) | later | Let the process-monitor owner task finish; then merge. |
| 184 | Worktrees: remove merged ones; Servex drops their subdomains | later | Let the dormant-idle owner task finish worktree cleanup; then merge. |
| 192 | servex-mastermind | later | Let the Servex diagnosis finish its checkpoints; then merge. |
| 193 | recursive-pairs | later | Relaunch the waiting minions so the recursive-pairs work resumes. |
| 198 | none-ai2-dashboard | later | Let the ai2-dashboard mastermind report; then merge the requirements. |
| 202 | 2026/09/28/skills-as-a-workflow-tasks-chased-by-nod | later | Let the three task-loop minions finish the landing check. |
| 203 | task-placement | later | Dispatch the queued task-placement work; the proposal is accepted. |
| 204 | tooling-gaps | later | Build the done-event and merge smoke test, or split them into two tasks. |
| 205 | 2026/09/28/waiting-on-you-never-buried | later | Finish the memory-gate queue and the test asks, then land. |
