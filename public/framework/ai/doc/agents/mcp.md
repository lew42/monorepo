# Model Context Protocol (MCP) in Lew42

How tools from the dev server and Servex are served to AI sessions, and where configurations live.

## Two MCP Servers

1. **Dev Server MCP (`site`)**
   - **URL:** `http://monorepo.localhost/mcp` (or `http://127.0.0.1:3104/mcp`)
   - **Source:** [`Server/plugins/MCP.js`](/Server/plugins/MCP.js)
   - **Scope:** Live browser tab interaction, DOM inspection (`eval`), element and page screenshots (`shot`), and visual tab ownership rings (`claim` / `release`).

2. **Servex MCP (`servex`)**
   - **URL:** `http://servex.localhost/mcp` (or `http://127.0.0.1:8090/mcp`)
   - **Source:** [`Servex/MCP.js`](/Servex/MCP.js)
   - **Scope:** 68 system tools covering agent lifecycle (`spawn_agent`, `fork_self`, `wait_for_agent`), the quick-fix worktree pool (`take_worktree`, `return_worktree`), module documentation bundles (`load_module`, `readme_modules`), live page manipulation (`create_page`, `page_call`), cards, and dev server lifecycle.

3. **Remote MCP (`/mcp/remote`)** serves the Servex registry to the Claude app (callers such as `voice-app`; a cloud voice agent is one kind of caller, and local agents use the Servex MCP too). Guide for a cloud voice agent: [Servex/ext/remote/doc/cloud-voice-agent.md](/framework/servex/remote/doc/cloud-voice-agent.md).

Both endpoints answer standard JSON-RPC 2.0 over HTTP POST on loopback (`127.0.0.1`). LAN or external requests are strictly refused.

---

## In-process vs network tools (2026-10-08)

Each Servex tool in [`Servex/agents/tools.js`](/Servex/agents/tools.js) is one plain definition (`name, description, inputSchema, handler`) served two ways:

- **HTTP (the live path for every Servex agent):** `Agents.js door()` points each agent at Servex's own loopback `/mcp` URL with `?as=<agent id>`, built by `Servex/MCP.js`. The same URL serves outside sessions (VS Code tabs, the CLI). Checked 2026-10-09 against `Servex/doc/sdk.md` step 3.
- **In-process (no network), only where there is no HTTP door:** `server()` in `tools.js` wraps the same tool list with the SDK's `tool()` and `createSdkMcpServer()`; used by tests such as `Servex/agents/fork-proof.mjs`, not by a live agent. The tools: agents (`spawn_agent`, `send_to_agent`, ...), tasks, sessions, jobs, experts, pages.
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
