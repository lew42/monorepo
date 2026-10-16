# The LAN rule: a phone gets push traffic, never commands

The dev socket carries `rpc:cmd` (runs a shell command) and file writes, so it must never be open to the network. A phone on the home Wi-Fi still needs reload and live updates, so the server splits the two:

- **Loopback** (this machine) keeps everything.
- **A private LAN address** (`10.*`, `192.168.*`, `172.16`–`172.31`) may connect, but `Server/plugins/SocketServer/Socket.js` only lets it send `hello`, `subscribe` and `unsubscribe`. Every other message (`cmd`, `write`, `append`, `ask`, `rm`, `move`, `query`…) is refused, logged as `socket: REFUSED …`, and answered with a `refused` reply so a waiting `send()` does not hang.
- **Anything else** (a public address, a forged origin) is refused at the upgrade, as before.

The client (`Socket.js`) connects on localhost and on private LAN hosts only; a real static host (Cloudflare) stays disabled and logs nothing. Reload, CSS swaps and JSONL tails (page deltas) go server to client, so the phone gets them all without the poll. Widening the allow-list is a security change: add only read-only, push-style methods.
