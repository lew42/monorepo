# Servex SDK: how an agent is started and kept alive

Servex starts each agent as a Claude Code session through the Claude Agent SDK, and holds it open. This page explains the parts a new coder needs, in the order they happen.

## 1. Starting an agent with query()

An agent is one `Agent` object in `Servex/agents/Agents.js`. Its `start()` method calls the SDK's `query()` with a prompt that never ends, so the session stays open between turns.

- `start()` calls `query({ prompt: this.queue.stream(), options: this.options() })`.
- The prompt is a queue. A new message is pushed into it as a turn, so the session waits for the next one instead of closing.
- `options()` builds the SDK options: model, effort, working folder, permission mode, and the tool "door" described below.

## 2. How the claude process is launched

Servex starts the `claude` process itself, so it knows the process ID.

- `options()` passes `spawnClaudeCodeProcess`, which points at `spawn_claude()`.
- `spawn_claude()` calls Node's `spawn` with `windowsHide: true`, so no window pops up on the owner's desktop.
- It stores the process ID as `claude_pid`, and records a `process` line when the process starts and when it exits.

## 3. How tools reach the agent

The tools are the Servex verbs such as `spawn_agent` and `list_agents`. There are two routes, and the choice depends on whether the host has an HTTP door.

- **The normal route (HTTP).** `door()` in `Servex/agents/Agents.js` adds an `mcpServers` entry of type `http`, pointing at Servex's own `/mcp` URL with `?as=<agent id>` added. The `/mcp` endpoint is built in `Servex/MCP.js`, class `MCP`. It listens on loopback only.
- **The in-process route.** `server()` in `Servex/agents/tools.js` wraps the same tool list with `createSdkMcpServer` and `sdk_tool`. Its own comment says it is for a host with no HTTP door, such as the tests in `Servex/agents/fork-proof.mjs`. Each handler runs inside the Servex process.

⚠ The two routes share the same tool definitions, so one tool list serves both. The live path described in step 3 is HTTP, not in-process.

## 4. Where session files live and how Servex resumes them

The SDK writes each session as a `.jsonl` file under the Claude config folder.

- `session_facts()` in `Servex/agents/Agents.js` looks in `CLAUDE_CONFIG_DIR`, or `~/.claude` if that is not set, under `projects/<folder>/<session id>.jsonl`.
- It reads the first 64 KB for the working folder (`cwd`), and the last 256 KB for the last model used.
- To resume an agent, `Agents.js` reopens it with `resume: <session id>` and the same working folder. A resume must run in the original folder, or the session cannot find its files.

## 5. Other model providers reuse the same loop

OpenRouter and local models do not have their own loop. They only change the address and the key that the SDK uses.

- `env_for("openrouter")` in `Servex/ext/openrouter/provider.js` sets `ANTHROPIC_BASE_URL` to OpenRouter and blanks the Anthropic key, so the same `query()` loop talks to OpenRouter.
- `env_for("local")` in `Servex/ext/local/provider.js` does the same, pointing at Servex's local proxy on loopback.
- `door()` merges these variables into the process environment. `provider_for()` chooses OpenRouter when the model name contains a `/`.

## Entrypoints: which session is which

Every line in a session file carries an `entrypoint`. `sdk-ts` means the session was started through the Agent SDK, so Servex started it (every agent above). `claude-vscode` means a person started it from the VS Code sidebar. Counted over the 40 newest session files for this repo on 2026-10-08: 38 `sdk-ts`, 2 `claude-vscode`.

## Resuming a session (verified 2026-10-19)

- `Agents.wake(id)` (Agents.js) turns a registered agent back into a live one: it refuses a fork, and an agent with no `session_id`, then calls `reopen(row)`. `revive()` calls `reopen` for every row on boot.
- `reopen(row)` takes the row's recorded `spec` (or its own fields), fills a missing `cwd` and `model` from `session_facts(row.session_id)`, and calls `spawn()` with `resume: row.session_id` and the same `id`, so the SDK `query()` continues the same Claude session.
- `session_facts(sid)` (exported from Agents.js) is the one place Servex reads Claude's own transcript: it finds the session's transcript under `~/.claude/projects/` (or `$CLAUDE_CONFIG_DIR`), reads its first 64 KB and last 256 KB, and returns `cwd`, `model` and `file`. `Sessions.js` imports it and does not read `~/.claude` otherwise.

## In-process page tools (step 12)

`Agents.js` `door()` also gives each agent an in-process SDK server named `local` (`mcp__local__item`, `page_set`, `page_add`, `page_log`, `page_read`, `page_call`: same functions as the HTTP ones, no network, `ctx.caller` = the agent id). The six `mcp__servex__` twins go into `disallowedTools` so each tool shows once. `SERVEX_LOCAL_TOOLS=0` turns it off. Test: `node Servex/agents/item-local.test.mjs`.
