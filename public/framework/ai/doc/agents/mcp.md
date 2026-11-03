# Model Context Protocol (MCP) in Lew42

How tools from the dev server and Servex are served to AI sessions, and where configurations live.

## Three doors

| Door | Class (file) | URL | Auth | Registry |
|---|---|---|---|---|
| `site` | `class MCP` ([Server/plugins/MCP.js](/Server/plugins/MCP.js)) | `/mcp` on the dev server | loopback only | browser tools: `pages`, `eval`, `shot`, `claim`, `release`, `research_*` |
| `servex` | `class MCP extends Events` ([Servex/MCP.js](/Servex/MCP.js)) | `http://127.0.0.1:8090/mcp` | loopback only (`loopback()`; refuses other callers) | every tool from `Servex/agents/tools.js` (live count: JSON-RPC `tools/list`; it was 90 on 2026-10-19) |
| remote | `class RemoteMCP` ([Servex/ext/remote/RemoteMCP.js](/Servex/ext/remote/RemoteMCP.js)) | `POST /mcp/remote` (through `Server/Tunnel.mjs`) | bearer token: header `Authorization: Bearer …` or in the path `/mcp/remote/<token>` (the Claude app's dialog has no header field); the token is generated into `%LOCALAPPDATA%/lew42/servex/remote.token` | the same registry as `servex`, plus `ask_mastermind`, `call`, `cloud_voice_log`; caller `voice-app` |

A Servex-spawned agent reaches `servex` through `Agents.door()` (`Servex/agents/Agents.js`), which builds the loopback `/mcp?as=<agent id>` URL; `?as=` is how a tool knows which agent called. Configuration is `.mcp.json` (below).

The `servex` tools cover agent lifecycle (`spawn_agent`, `fork_self`, `wait_for_agent`), the quick-fix worktree pool, module bundles (`load_module`, `readme_modules`), pages (`create_page`, `page_call`), cards and dev-server lifecycle. All doors answer JSON-RPC 2.0 over HTTP POST. A cloud voice agent is one kind of remote caller: [Servex/ext/remote/doc/cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md).

---

## In-process vs network tools (2026-10-08)

Each Servex tool in [`Servex/agents/tools.js`](/Servex/agents/tools.js) is one plain definition (`name, description, inputSchema, handler`) served two ways:

- **HTTP (the live path for every Servex agent):** `Agents.js door()` points each agent at Servex's own loopback `/mcp` URL with `?as=<agent id>`, built by `Servex/MCP.js`. The same URL serves outside sessions (VS Code tabs, the CLI). Checked 2026-10-09 against `Servex/doc/sdk.md` step 3.
- **In-process, for six page tools:** `door()` also gives each agent an SDK server named `local` (`item`, `page_set`, `page_add`, `page_log`, `page_read`, `page_call`: same functions, no network; the `mcp__servex__` twins are disallowed so each shows once; `SERVEX_LOCAL_TOOLS=0` turns it off; [Servex/doc/sdk.md](/Servex/doc/sdk.md)). Beyond that, `server()` in `tools.js` wraps the same tool list with the SDK's `tool()` and `createSdkMcpServer()`; used by tests such as `Servex/agents/fork-proof.mjs`, not by a live agent. The tools: agents (`spawn_agent`, `send_to_agent`, ...), tasks, sessions, jobs, experts, pages.
- **Network by nature:** the `site` server (`eval`, `shot`, `claim`), because it talks to a browser.

Rule: write handlers as plain functions, and never make an agent call its own host over HTTP. The planned task tools (`task_create`, `task_plan`, `task_set`, `task_move`, `task_link`, `task_read`, `task_list`) follow it: see [../tasks/tasks.md](../tasks/tasks.md).

---

## Configuration Files and Multi-Harness Locations

Different AI harnesses look for MCP servers in different files. When adding or updating an MCP server in this repo, be aware of the following targets:

| Harness | Configuration File | Notes |
| :--- | :--- | :--- |
| **Claude Code / Zed / Cursor** | [`.mcp.json`](/.mcp.json) *(repo root)* | Checked into Git. Primary source of truth for the repository. |
| **Google Antigravity / Gemini** | `~/.gemini/config/mcp_config.json` | Global machine config used by Antigravity desktop & CLI. |

### Current Policy

- [`.mcp.json`](/.mcp.json) at the repo root is the canonical project declaration.
- Antigravity requires a duplicate copy at `~/.gemini/config/mcp_config.json`.
- When updating or adding an MCP tool door, verify both targets so that sessions in either harness have identical toolsets.
