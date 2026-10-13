# Two Figma MCP servers: when to use which (measured 2026-10-13)

| | Desktop (`figma-desktop`, `127.0.0.1:3845`) | Remote (`mcp.figma.com`, the `mcp__figma__*` tools) |
|---|---|---|
| Sees your selection | yes: `get_design_context` with no nodeId | no; it needs a node id or link |
| Writes | no (6 read tools) | yes: `use_figma`, `upload_assets`, `generate_image` |
| Speed | about 0.3 s per read (metadata, screenshot, variables) | several seconds per call |
| Needs | the desktop app open, with the server on (Ctrl+K → "Enable desktop MCP server") | nothing; works headless |

**Rule:** use the desktop server to read ("what am I looking at?", screenshots, metadata, variables) when the app is open, and the remote server for every write and whenever the app is closed. A session that started before the desktop server was added reaches it with `curl` (session handshake: `initialize`, then `notifications/initialized`, then `tools/call`); a new session gets it as normal `figma-desktop` tools. Detail and history: [use-figma.md](use-figma.md), Traps.
