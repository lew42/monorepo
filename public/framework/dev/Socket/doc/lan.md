# The LAN rule: a phone gets push traffic, never commands

The dev socket carries `rpc:cmd` (runs a shell command) and file writes, so it must never be open to the network. A phone on the home Wi-Fi still needs reload and live updates, so the server splits the two:

- **Loopback** (this machine) keeps everything.
- **A private LAN address** (`10.*`, `192.168.*`, `172.16`–`172.31`) may connect, but `Server/plugins/SocketServer/Socket.js` only lets it send `hello`, `subscribe` and `unsubscribe`. Every other message (`cmd`, `write`, `append`, `ask`, `rm`, `move`, `query`…) is refused, logged as `socket: REFUSED …`, and answered with a `refused` reply so a waiting `send()` does not hang.
- **Anything else** (a public address, a forged origin) is refused at the upgrade, as before.

**The rule (2026-10-17): the client tries everywhere; the server decides.** `Socket.js` connects on every host (`wss:` on https) and has no allow-list. A peer the server refuses (a static host, a tunnel, a forged origin) backs off to a minute, says so once on the console, stays quiet, and gives up after about five minutes; `send()` and `request()` return at once where there is no socket, so nothing parks. Reload, CSS swaps and JSONL tails go server to client, so the phone gets them without a poll. Widening what a LAN peer may *send* is a security change: add only read-only, push-style methods.

**https too.** A phone needs https for the mic, so the dev server also attaches the socket to its https listener (`Server/plugins/HttpsLan.js` emits `https`, `SocketServer.attach()` adds a second `WebSocketServer` behind the same `local_only` gate). Before that, `wss://<lan-ip>:<port+10000>` got a plain 200 and never connected. Proof, 2026-10-17, headless over `https://10.0.0.135:<port+10000>`: connected on `wss`, `cmd` answered `refused`, a JSONL tail arrived in 9 ms, the `/live/now/` view redrew 1.3 s after a session folder's `cache.jsonl` grew; a forged `https://evil.example` origin got 401.
