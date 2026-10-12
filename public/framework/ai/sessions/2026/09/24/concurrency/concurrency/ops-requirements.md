# Ops brief — restart_servex, pause/resume dispatch, names align

Load the `minion` skill first. Read `requirements.md` beside this file, then `public/framework/ai/2026-09-24/loose-ends/report.md` (briefs 4 and 5 under "Bigger work"), then `Servex/agents/readme.md`, `Servex/agents/roles.js`, `Servex/sustain.mjs` (read only), and the `dispatch.off` lines in `Servex/agents/Dispatcher.js` and `Assistant.js` (read only).

**Work ONLY in the worktree `C:/Code/lew42/worktrees/concurrency`** (branch `worktree/concurrency`). A sibling minion, `minion-concurrency-build`, is editing `Agents.js`, `tools.js`, `registry.js` and `MCP.js` there right now, so do not touch those four files. Commit only your own files: `git add <your files>`, never `git add -A`.

**Fence (write):** a new `Servex/agents/ops.js`, `Servex/agents/roles.js`, a new doc `Servex/agents/doc/names.md`. Never touch Dispatcher.js, Assistant.js, sustain.mjs, Servex.js or Process.js.

## Deliverables

1. **`ops.js` exports `ops_tools(host)`**, the same shape as `tools(host)` in tools.js, holding three tools:
   - `restart_servex`: runs `node Servex/sustain.mjs --restart` (never `--force`) as a DETACHED child with its output going to a log file, because the restart kills this very process. The tool returns at once with that log's path. It keeps sustain's own guards, so if sustain refuses, the refusal is in the log. Its description must say plainly that this restarts every agent, the caller included.
   - `pause_dispatch` and `resume_dispatch`: these create and remove `%LOCALAPPDATA%/lew42/servex/dispatch.off`, which is the same switch Dispatcher.js and Assistant.js already read, so neither file changes. Each tool returns the new state. Both must be idempotent.
   The mastermind wires these three tools in with one line in tools.js after the sibling finishes, so do not do that yourself. Test the handlers by importing `ops.js` from a scratch script, and run `restart_servex` with a dry-run flag only. NEVER actually restart Servex.
2. **Names align.** `roles.js` becomes the ONE table where each row gives: role, the skill it loads, its id prefix, and its model, effort and permission mode. The owner's rule is "skill name = role = agent id". Where one doesn't match today (e.g. role `task-mastermind` loads the skill `sub-mastermind`), do NOT rename skill directories: that is a dozen callers, and a rename needs the owner. Instead, add an `alias` so both words are accepted as a role, and list every mismatch in `doc/names.md`, one line each, with the rename it would take. Keep `defaults()` and `opening()` compatible, because Agents.js calls them.
3. Commit your files in the worktree. Reply with each tool's one-line description, the mismatch list, and your dry-run output.
