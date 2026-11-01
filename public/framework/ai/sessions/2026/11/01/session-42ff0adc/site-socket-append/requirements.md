# site-socket-append

Asked by the front tab (2026-11-01): the dev server logged many `socket: REFUSED append from LAN peer 10.0.0.135` (this PC's own address, which is where Server/SiteGateway.mjs dials the dev server). So page edits and dictation appends from https://monorepo.lew42.com were refused. Also the owner saw "server restarting" flash through the tunnel while Servex had not restarted.

1. The internet (through the gateway, with the key cookie) may `append` a JSONL line, and nothing more: never write, rm, move, cmd, ask, /mcp.
2. A phone on the Wi-Fi forging the `x-lew42-remote` header gains nothing.
3. The WebSocket and the SSE streams survive Cloudflare's ~100 s idle cut (pings / keep-alive comments).
4. The "server restarting" strip shows only after the socket has been down 5 s.

Proof: `Server/plugins/SocketServer/Socket.test.mjs`, and an append through a gateway to a worktree dev server answered "append successful" while cmd and write were refused.
