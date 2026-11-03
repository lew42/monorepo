# AI index: rename "state" to "index", by script, every reader updated

Budget: $8. Sonnet, medium effort. Parent: mastermind-system-architect, who tails your `session.jsonl`: log an overview line there as you go, not chat. Decision `d-what-are-the-computed-task`, option A, in [the parent's log](../session.jsonl).

## The owner's ask (2026-10-20, 16:15)

> "Use the word index if that's what it is. Please fix that."

`ai/state.json` and `ai/tasks/state.jsonl` are a computed index of tasks (plus agents, cards, asks), written by `Server/State.mjs` (run as `Server/TaskState.mjs --watch` by `Servex/TaskLoop.js`). Doc: `Server/doc/state.md`.

## The names (decided)

| Old | New |
|---|---|
| `public/framework/ai/state.json` | `public/framework/ai/index.json` |
| `public/framework/ai/tasks/state.jsonl` | `public/framework/ai/index.jsonl` (the change feed the browser tails) |
| `Server/State.mjs`, `class State` | `Server/AIIndex.mjs`, `class AIIndex` |
| `Server/TaskState.mjs` | `Server/AIIndex.mjs --watch` (TaskState.mjs stays as a 3-line alias that runs it, because the running Servex spawns it by name until its next restart) |
| `Server/doc/state.md` | `Server/doc/ai-index.md` |

Check first that `public/framework/ai/index.json` and `index.jsonl` don't already exist (if one does, stop and log it).

## Do

1. In a worktree. A node script `rename.mjs` in this folder: `git mv` each pair, write `manifest.jsonl` (`{from, to}`), dry run by default, `--apply`, `--undo`.
2. Update every reader and writer. Start from `git grep -l -e "state\.json" -e "state\.jsonl" -e "State\.mjs" -e "TaskState" -- "*.js" "*.mjs" ":!public/framework/ai/sessions" ":!public/framework/ai/2026" ":!.claude/worktrees"`. Known: `ai/AIDashboard/SessionStore.js`, `ai/rail/DashRow.js`, `ai/rail/DashState.js`, `ai/rail/rail.js`, `ai/tasks/TaskLanes.js`, `ai/tasks/TaskStateLog.js`, `Server/FollowUp.mjs`, `Server/SessionIndex.mjs`, `Server/StaleClose.mjs`, `Server/TaskHomes.mjs`, `Servex/TaskLoop.js` (its `watch_state()` spawns the watcher), hooks under `.claude/hooks/`. Imports of `State` become `AIIndex`; keep `State` as a re-export for one week so nothing in flight breaks. Do not touch `Server/SessionRecord.mjs`, `Server/TaskDirs.mjs` or `core/Task/` (other tasks own them).
3. `Server/doc/ai-index.md` opens with ONE plain paragraph: what the AI index is (rows that point at every task, agent, card and ask, with their computed state; it copies no log), when it is written (on change, by the watcher Servex keeps alive), who reads it (the AI dashboard, the rail, `/framework/ai/tasks/`). Then the old doc's content. Fix the links to `state.md` and the words `state.json` in readmes and docs (`git grep -l "state\.json" -- "*.md"`, outside sessions and dated folders).
4. Proof: `node Server/AIIndex.mjs --print` passes its self-check; `node Server/AIIndex.mjs` writes `ai/index.json` and one `ai/index.jsonl` line; `node Server/merge.mjs <worktree> --dry-run` smoke-tests `/framework/ai/` and `/framework/ai/tasks/` clean. Shoot `/framework/ai/` at 1200 headless and put it in your outcome.

Do not merge: your parent reviews the diff and merges. Land with `finish-task` in your own `session.jsonl`, naming any doc you could not fix.
