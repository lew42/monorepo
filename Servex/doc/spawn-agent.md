# spawn_agent: every argument, in full

The tool's own description is kept short, because every listed tool's schema rides in every caller's context ([Servex/Listed.js](../Listed.js), [tool-collapse.md](../../public/framework/ai/doc/tool-collapse.md)). This page holds the long form. Code: `tool("spawn_agent", ...)` in [agents/tools.js](../agents/tools.js).

`spawn_agent` starts a new Claude session inside Servex and gives it a job. It stays alive and steerable after it answers: talk to it again with `send_to_agent`. It returns the agent's card, with the id you address it by and the session uuid a terminal can `claude --resume`.

**How you hear when it ends.** A Servex SDK agent (the local `/mcp` door) is woken by one message when the child ends its turn, stops or errors, so keep working or end your turn. A cloud caller (claude.ai voice or text, `/mcp/remote`) is never pushed anything: tell the owner it is running, keep talking, and call `updates` at the start of every turn; the child's final message arrives there. Never block on it (`wait_for_agent`) for more than a few seconds.

| Argument | What it does |
|---|---|
| `role` | What it is: `minion`, `mastermind`, `assistant`. Half of its id. Loads that role's readme. |
| `name` | What it is working on, in a word or two. The other half of its id. |
| `prompt` | The job, as you would type it to a person. Its first turn. |
| `model` | Model id. Default `claude-sonnet-5-5`; cheap scans `claude-haiku-5-5`. An OpenRouter slug (anything with a `/`, e.g. `deepseek/deepseek-v4.1-flash`) runs through OpenRouter automatically. |
| `provider` | `anthropic` (default) or `openrouter`. Usually left out: a `model` with a `/` already implies `openrouter`. Needs a key at `%LOCALAPPDATA%\lew42\servex\openrouter.key` ([ext/openrouter](../ext/openrouter/readme.md)); a missing key fails the spawn with one clear line. |
| `effort` | `low` `medium` `high` `xhigh` `max`. Default `high`. |
| `path` | A repo or site path (`public/framework/ai/` or `/framework/ai/`). Loads that folder's readme chain, plus its `mastermind.md` (or `ai/mastermind.md`), into the agent's SYSTEM prompt, so it survives compaction. Meant for the `mastermind` role. The log line says which files were loaded. |
| `cwd` | Directory it works in. Default: the Servex process's own. |
| `visibility` | `team` (default), `owner`, `private`. A dashboard label; nothing enforces it yet. |
| `permission_mode` | `acceptEdits` (default) edits files; `bypassPermissions` does anything, commands included; `plan` does nothing. |
| `allowed_tools` | Whitelist, e.g. `["Bash","Read","Write","Edit"]`. Omit for the CLI's default set. |
| `parent` | Your own agent id, if you are the spawner. When the child ends its turn, stops or errors, it wakes you with one message. Defaults to the caller. |
| `session_id` | From a VS Code tab (any session Servex did not spawn): your own Claude session uuid (`$CLAUDE_CODE_SESSION_ID`). Servex records your tab as the parent (registering it as `vscode-<first 8 hex>`), so the child's work rolls up under you and its news reaches your inbox. Leave out when `parent` is given or you are a Servex agent. |
| `resume` | A session uuid to continue instead of starting blank; the agent opens with that whole conversation. No skill-load preamble; with no `prompt` it waits idle for a message. ⚠ Give the `cwd` the session ran in: sessions are stored per project directory. |
| `fork` | With `resume`: continue as a NEW session (a copy), leaving the original usable. Reuses the original's prompt cache when model, tools and settings match. |
| `task` | See below. |
| `budget_usd` | Dollar ceiling for the results-gated spend guard (`Agents.js` `spend_gate`); overrides the brief's `Budget: $N` line and the $20 default. The agent starts with $2 and unlocks $3 per result up to the ceiling. |
| `dormant_after` | Seconds idle before it sleeps to free RAM (it resumes in place on the next message), or `"session"` to never auto-sleep while it is a live session. Omit for the role's default (`Global.js` `default_after`). |

## `task`

Every spawn has a task dir. Leave `task` out and Servex opens one anyway (`ai/sessions/<today>/<your session folder, else spawned>/<agent id>/`, line 1 with the session id, agent id, model and the first line of `prompt` as its title, then `past-work.md`), and tells the agent where its log is. Pass `task: false` only for a throwaway probe that must leave no task dir.

Or open the task yourself, before its first turn: `{dir, card, brief, home}`.

- `home` (optional): the module the work belongs to, as a site path like `/framework/core/Page/`, written into line 1 so the task and its session are tagged by module from the start.
- `dir`: the task's directory (repo-relative or absolute; created if new). Line 1 (or the next line, if the dir already has a log) is written there with the session id, agent id, card, brief and model, so the agent never runs `new-task` itself.
- `brief`: path of a requirements.md (or give `title`). Servex writes `past-work.md` beside it and tells the agent to read it first.
- Nested tasks: `parent_task` (the parent's task dir; defaults to the caller's own) and `after` (an array of sibling task DIRS this one waits for: full dirs like `dir`, never bare slugs; stored repo-relative and matched exactly).
- Handoff by task: add `from` (the url of the record holding the subtask, e.g. your session page) and `id` (the subtask's id), and that subtask MOVES into this agent's folder with its id and history (`page_tools.js` `move_item`); `dir` may then be left out.
