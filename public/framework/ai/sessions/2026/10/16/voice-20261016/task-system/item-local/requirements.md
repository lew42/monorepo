# Item tool in-process: step 12 of the task system plan

Budget: $3

Step 5 landed: the `item` tool (`item({path, delta})`) and the page tools live in `Servex/agents/page_tools.js` and are registered on Servex's HTTP MCP (`Global.js` `tools()`, around line 514). Agents that Servex spawns reach them over HTTP: `Agents.js` `door()`, around line 1060, gives each one `mcpServers.servex = {type: "http", …}`.

This step gives those local SDK agents the same tools **in-process**: the same functions, the same tool names, and no network. That is "one toolset, two pathways" from `Servex/doc/owner-2026-10-16-tools.md`, and the plan's step 12 ([plan](../plan.md), at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`). **Build only step 12.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/item-local`, on branch `worktree/item-local`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges it.
- **Your files:** `Servex/agents/Agents.js` (only `door()` and a small helper), `Servex/agents/tools.js` (only if `server()` needs a small change), a new test `Servex/agents/item-local.test.mjs`, and a few lines in `Servex/doc/sdk.md` and `Servex/doc/item-tool.md`.

## What to build

1. **An in-process SDK MCP server for the page tools.**
   - In `door()`, beside the HTTP `servex` entry, add an in-process server built with `server()` from `tools.js`, which already wraps `createSdkMcpServer`. Its list is `page_tools()` (`item`, `page_set`, `page_add`, `page_log`, `page_read`, `page_call`), and its `ctx` is `{caller: this.id}`.
   - **Decided:** name it `local`. The agent then sees `mcp__local__item`; the tool name `item` is the same, and only the server prefix differs.
   - To avoid each tool appearing twice, add the six HTTP twins (`mcp__servex__item`, `mcp__servex__page_set` and the others) to this agent's `disallowedTools`. Check how `Agents.js` already builds the SDK `options` (grep `disallowedTools` and `allowedTools`), and merge with what is there. Never replace it.
   - Only do this when the agent runs in Servex's own process, which is the normal case (`door()` with a `url`). The no-URL branch stays as it is.
2. **A switch to turn it off:** an env var `SERVEX_LOCAL_TOOLS=0`, read once, keeps today's HTTP-only behaviour. This is in case it misbehaves after the owner's next restart.
3. **Docs:** two or three lines in `Servex/doc/sdk.md` (the in-process route is now live for the page tools, under the name `local`), and one line in `Servex/doc/item-tool.md`.

## Check before the commit

- **The node test:** build an `Agent` (or call `door()` on a stub with `id`, `host.mcp_url` and `mcp_servers`), then assert the following.
  - `mcpServers.local` exists and lists `item`.
  - The HTTP `servex` entry is still there.
  - The six HTTP twins are in `disallowedTools`.
  - With `SERVEX_LOCAL_TOOLS=0` there is no `local` entry.
- **Same function:** in the test, call the `local` server's `item` handler on a fixture `task.jsonl` in a temp dir under `public/` (copy the setup from `Servex/agents/item_tool.test.mjs`). Check that the delta `{"start": {}}` gives `state: "running"`. If the SDK server object doesn't expose its handlers easily, call the handler through `page_tools()`, and say so in your report.
- Also run `node Servex/agents/item_tool.test.mjs` (13/13) and `node public/framework/core/Task/Task.test.mjs` (42/42).
- **Don't start a real agent, and don't restart Servex.** Never call `restart_servex`. The owner restarts Servex, and the change takes effect then.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`, where the lines file is a JSON array.
- **When the commit passes, send one message to `mastermind-task-system`:** the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl` and stop.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
