# ext/remote — the tunnel MCP the Claude voice app talks to

`RemoteMCP.js` serves `POST /mcp/remote` (reached through `Server/Tunnel.mjs`, bearer token). Tools: `ask_mastermind` (ask the voice mastermind, wait up to a minute) and `live_post` (one card on `/live/` through the `page_add` writer). The voice-agent directives live only in `RemoteMCP.INSTRUCTIONS`. Test: `node Servex/ext/remote/RemoteMCP.test.mjs`.

- Proposal, not built: one tool registry marked `local`/`remote` instead of two tool sets: [doc/mcp-unify.md](doc/mcp-unify.md)
- The voice path end to end: [voice-bridge.md](../../../public/framework/ux/Dictate/doc/voice-bridge.md)
