# What being started as a CLI session was like

This task was the first minion started the way the owner wants: `claude --session-id 8b6bbbe8-3f32-4e8d-a497-9b6192b9c757 -p …`, Fable at max effort, from a scheduled launcher that fired at 18:41 after the window reset. Four findings; they decide how the start script is built.

## 1. The permission mode did not follow the project settings

`.claude/settings.json` says `defaultMode: bypassPermissions`. This session ran in a mode that refused: every Write and Edit inside the repo (the task's own `task.jsonl`, `page.js`, a data file); every Read, Grep, Glob and PowerShell outside the repo, except this session's own transcript folder and its own scratchpad; every MCP tool (`mcp__site__pages`); every shell command that is not read-only. What passed: `git status`, `git log`, `git diff`, `node --version`, `Get-Date`, `Get-ChildItem` and `Get-Item` on a literal path. What was refused by the command parser before any permission check: a `$env:` string, a bare `$VAR` expansion, a pipe into `xargs`/`sed`/`sort`, a script block, the `Env:` provider, `Select-String`, and any PowerShell command over 1015 bytes.

**Consequence.** None of the fenced deliverables could be written into the repo. All of them are complete in this session's scratchpad with a README that says how to copy them in. **For the script:** pass `--permission-mode bypassPermissions` on every start; do not rely on the settings file.

## 2. The ledger never knew this session existed

`ledger.mjs` resolves a session to a task by the FIRST `assign` line's `session_id`. This task's line 1 was written by the mastermind at 17:58 with the mastermind's own id. So: the three skill loads before the first edit (`minion`, `code`, `new-task`) were attributed to nothing — the same blind spot the mistake-audit measured for subagents (401 skill lines, zero for new-task), for a different reason; the Stop hook found no task for this id and never gated this session; the hooks blamed nobody rather than the parent. The one-field fix was attempted with the Edit tool and refused with everything else.

**For the script:** write `task.jsonl` line 1 with the minion's id BEFORE launching the process. Then every hook event resolves from the first call, and "which skills did it load" has an answer for the first time.

## 3. The brief and the skills still assumed an in-process subagent

- The fence named the PARENT's scratchpad (`…/1736b987-…/scratchpad/system-eval/`), unwritable to a session with its own id. Every CLI session gets its own: `…/Temp/claude/C--Code-lew42-monorepo/<its id>/scratchpad/`.
- "You write its `task.jsonl` launch line" assumed the file did not exist. It did, with a premature landing line and a correction.
- The minion skill's tools all assume a shell: `hold.mjs`, the `say.mjs` progress card, `node --check`, `PORT=… node server.js`. None was possible here.
- new-task reads `$env:CLAUDE_CODE_SESSION_ID`; the brief says not to trust it; neither mattered, because the id came in the brief.
- finish-task says a subagent cannot sum its own tokens. A CLI session's launch returns `total_cost_usd` and `usage` in its JSON result, so the parent has the cost for free, and the minion need not try.
- `documentation`, `new-page` and `layout` were read in full but not "loaded" through the Skill tool a second time — the brief's budget rule (never re-read a file) and the ledger's blindness made the second load pure cost.

## 4. Two masterminds, one blind to the other until it looked

A second mastermind (Opus, tab `monorepo-00`) started at 18:41 under the owner's "Sonnet for everything" instruction. It found this Fable process at 18:49 from the process list, tried to stop it, was "denied by the sandbox", and decided to let it finish. Its six Sonnet minions were started as CLI sessions with hand-typed patterned ids, and recorded as `agent` lines with `kind: cli` and a `session_id` — the registry, begun by hand. `CLAUDE_CODE_SESSION_ID` could not be read here, so the brief's question about its inherited value stands unanswered; the script makes it moot.

## What this means for the script, in one list

1. `--permission-mode bypassPermissions`, always.
2. Line 1 of `task.jsonl` first, with the minted id; then the process.
3. The fence names the minion's own scratchpad.
4. The script takes the reload hold at start and releases it at landing, and posts the start and landing cards — so a minion without a shell still has both.
5. Random v4 uuids; the meaning in the registry line.
6. stdin closed; `--output-format json`; cost and usage read from the result, not summed by the minion.
