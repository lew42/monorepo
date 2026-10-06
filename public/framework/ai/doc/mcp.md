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

Both endpoints answer standard JSON-RPC 2.0 over HTTP POST on loopback (`127.0.0.1`). LAN or external requests are strictly refused.

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
