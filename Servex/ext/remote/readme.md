# ext/remote — the tunnel MCP the Claude voice app talks to

`RemoteMCP.js` serves `POST /mcp/remote` (reached through `Server/Tunnel.mjs`, bearer token in the path or header). It serves the **whole Servex tool registry** (`servex.mcp`, the same tools every local session has) plus `ask_mastermind` (ask the voice mastermind, wait up to a minute). Calls run as caller `voice-app`. The voice-agent directives live only in `RemoteMCP.INSTRUCTIONS`. Test: `node Servex/ext/remote/RemoteMCP.test.mjs`.

- Why one registry, fully exposed (and the shelved `local`/`remote` split): [doc/mcp-unify.md](doc/mcp-unify.md)
- The tunnel and its keeper (Servex restarts it, shows the connector URL, the named-tunnel steps): [doc/tunnel.md](doc/tunnel.md)
- The voice path end to end: [voice-bridge.md](../../../public/framework/ux/Dictate/doc/voice-bridge.md)
- Catch-up: what changed since the voice agent's last call, piggybacked on every tool result (built: the `updates` tool): [doc/catch-up.md](doc/catch-up.md)
- **Cloud voice agent guide** (what it is, session naming, logging, tasks, caveats; the one line the server instructions point to): [doc/cloud-voice-agent.md](doc/cloud-voice-agent.md)
- Every voice prompt logged verbatim by code (built: the cloud-only `cloud_voice_log` tool, cloud `register_session`): [doc/voice-logging.md](doc/voice-logging.md)
- File and shell tools (`read_file`, `write_file`, `edit_file`, `list_dir`, `glob`, `shell`) and the generic `call` door: [doc/remote-tools.md](doc/remote-tools.md)
