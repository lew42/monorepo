# Mobile Access, LAN IP, and WebSocket Behavior

How opening the dev site from a phone on local Wi-Fi or LAN behaves, and why socket errors appear.

## The Network Split

When opening the site from a phone (`http://192.168.x.x` or through Tailscale):

1. **HTTP Routes (`lan()` guard):**
   - Routes like `/whisper/*` (audio dictation) and `/ask/turn` allow connections from RFC 1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) as defined in [`Server/plugins/MCP.js`](/Server/plugins/MCP.js).
   - Audio dictation sends plain HTTP POST requests to `/whisper/inference` and works reliably from mobile devices.

2. **Dev WebSocket (`loopback()` guard):**
   - The dev server WebSocket (`SocketServer.js`) strictly verifies client origins and IP addresses using `loopback()` (`127.0.0.1` only).
   - **Why:** The DevSocket carries dangerous debugging RPCs (`rpc:cmd` for shell execution, `rpc:write`). Permitting non-loopback connections would allow any device or guest on the LAN to execute commands on the host machine.
   - **Result on Phone:** The browser console on mobile shows `socket: REFUSED an upgrade` or `socket retrying`. This is normal and intentional security behavior.

## Common Symptoms & What They Mean

- **"Socket retrying" / "mic refused":** The WebSocket live-reload connection fails on mobile because it is blocked off-host. Whisper itself still works via HTTP.
- **3–5 second white screen on refresh:**
  - `Directory.js` serves a large ~3.3MB directory index that can slow initial mobile hydration.
  - Opening with `?sheet=ai` triggers immediate loading of the AI Dictate drawer and its prompt logs before the base page layout completes rendering.
