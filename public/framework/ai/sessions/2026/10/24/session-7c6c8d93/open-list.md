# ai-system-mastermind: open list (refreshed 2026-10-25)

Done and merged: process-page, tracking-perf, agent-base (items 1-5, 8), item 14 (idle agents hold no process; `list_agents` shows `mb`, committed, active after the next Servex restart; wind-down rule in `roles/mastermind.md`).

Queued at the spawn gate (working 8/8), each a minion with a brief in this session folder:
1. `minion-mastermind-path` (agent-base items 11+13, $15): one `mastermind` role plus a `path`; retire the singleton and renew code. On report: full `node Server/review.mjs <taskdir> <worktree>`, answer findings, `Server/merge.mjs`, `node Servex/sustain.mjs --restart`, then tell vscode-mastermind what changed in roles.js and the singleton code.
2. `minion-context-alerts` (item 12, $8): 50% and 75% context lines in the child's log that the parent follows. Edits Agents.js in other regions than 1; merge 1 first, rebase 2.
3. `minion-prompt-grouping` (prompt-breakdown 10-12, $10): one parent outcome task per prompt, asks as subtasks, attach to an existing open task; baseline 341 prompt root tasks from 87 prompts on e00f55c9; principles doc `core/Session/doc/prompt-breakdown.md`.

Follow-ups: compaction note in `ai/doc/compaction.md` once `mastermind-session-identity` reports; 3440 headless look at `/framework/core/Task/process/`; module-icon lookup subtask; resolve ~195 open parts; recompute PromptRecordsCompare costs from tokens; move WorktreeWatch direct send and `ai/errors/` onto `follow`; read unread `module_inbox` lines for module `ai`; item 28 (logs group under the open task) documented, not built; close the `agent-base` and `process-page` worktrees after their waiting window.
