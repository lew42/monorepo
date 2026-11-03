# Mobile Access, LAN IP, and WebSocket Behavior

How opening the dev site from a phone on local Wi-Fi or LAN behaves, and why socket errors appear.

## The Network Split

When opening the site from a phone (`http://192.168.x.x` or through Tailscale):

1. **HTTP Routes (`lan()` guard):**
   - Routes like `/whisper/*` (audio dictation) and `/ask/turn` allow connections from RFC 1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) as defined in [`Server/plugins/MCP.js`](/Server/plugins/MCP.js).
   - Audio dictation sends plain HTTP POST requests to `/whisper/inference` and works reliably from mobile devices.
   - Read-aloud (`audio/Recite`) uses `/recite/*` (`Server/plugins/Recite.js`) with the same guard: `GET /recite/health`, `GET /recite/voices`, `POST /recite/speak`.

2. **Dev WebSocket (`local_only` gate in `SocketServer.js`, on both the http and the https listener):**
   - Loopback keeps every command; a private-LAN peer (a phone) may connect but the server answers only `hello`, `subscribe`, `unsubscribe` and a read-only `query` of the `sessions` and `tasks` sources (the list is `LAN_OK`/`LAN_QUERY` in `Server/plugins/SocketServer/Socket.js`) and refuses the rest (`rpc:cmd` shell execution, `rpc:write` ...); anything else is refused at the upgrade.
   - The client tries every host and the server decides ([doc](/framework/dev/Socket/doc/lan.md)), so the phone gets reload and JSONL tails over `ws` or, on the https address, `wss`.

## Common Symptoms & What They Mean

- **"Socket not connected":** the server refused the upgrade (a tunnel or forged origin) or is down; the client retries quietly. On the LAN it connects. Whisper uses plain HTTP either way.
- **3–5 second white screen on refresh:**
  - `Directory.js` serves a large ~3.3MB directory index that can slow initial mobile hydration.
  - Opening with `?sheet=ai` triggers immediate loading of the AI Dictate drawer and its prompt logs before the base page layout completes rendering.
