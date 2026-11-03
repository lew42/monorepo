verdict: fix
1. [fix] Servex/ext/remote/doc/tunnel.md (the "Named mode is built" paragraph) says the run token is stored at `%LOCALAPPDATA%\lew42\servexemote.tunnel.token`: the `\r` of `\remote` was swallowed as an escape, so the path is wrong. It should be `%LOCALAPPDATA%\lew42\servex\remote.tunnel.token`.
2. [fix] Servex/ext/remote/doc/tunnel.md:19 still says "A stable hostname (investigated 2026-10-20, not built)", and its bullets still say the token "can" create tunnels and only lacks DNS. Both contradict the new paragraph, which says named mode is built and the token needs Tunnel Edit as well as DNS Edit. Retitle the section and drop the old bullets plus the "one owner step / what only the owner can do" text that the new paragraph replaces.
3. [note] The block is real, and the brief allows stopping on it (step 3): the token can only list. The owner needs to add **Account → Cloudflare Tunnel → Edit** and **Zone → DNS → Edit**. Until then none of the proof items (the curl check, remote.url, HandoverNow, the Note-card part-card) can be met. A permission the owner has to add is exactly what CLAUDE.md says goes on the board as a `Note:` card, and the diff has no such card (the tunnel.md line alone will not be seen).
4. [note] tunnel.md shows as a whole-file rewrite where every unchanged line is removed and re-added. That looks like a CRLF→LF (or encoding) change, and it hides the real edit in the diff. Keep the file's original line endings.
5. [note] Server/Tunnel.mjs `up`: in named mode the gateway listens on the fixed port 8191 with no `error` handler. If that port is taken (say a stale `up` whose pid file was lost), `listen` emits an unhandled error and the process crashes. The keeper then retries every 60 s with no clear log line. A one-line `gw.on("error", …)` that prints "port 8191 busy" would make the failure readable.
6. [note] Server/Tunnel.mjs:8 (the header comment) still says "a free Cloudflare quick tunnel" only. Add one clause about named mode and point it at TunnelNamed.mjs.
7. [note] The design is simple and matches the brief. TunnelNamed.mjs is idempotent: it reuses the tunnel, re-PUTs the ingress, and updates the CNAME only when it differs. Neither file prints a secret. Named mode switches on only when the token file exists, the quick tunnel stays the fallback, `status`/`down` are shared, the port is recorded in remote.tunnel.json, and Tunnel.test.mjs covers `named_token()`. Once the permissions exist, the only other thing to verify is that the "Registered tunnel connection" line actually appears in cloudflared's stderr for the version npx fetches.

## Requirements
- 1 "Named tunnel servex through the API, reuse if it exists" — yes (code) — TunnelNamed.mjs setup GETs by name, then POSTs with config_src cloudflare; not run, because the token lacks Tunnel Edit
- 2 "Ingress to a FIXED gateway port, recorded in remote.tunnel.json" — yes — PORT 8191; Tunnel.mjs writes `port` to the state file
- 3 "DNS CNAME proxied; if a permission is missing, write exactly which one in tunnel.md and stop" — yes — both permissions are named in tunnel.md
- 4 "Run token at %LOCALAPPDATA%\lew42\servex\remote.tunnel.token, never in the repo" — yes in the code; the doc path is mangled (finding 1)
- 5 "Tunnel.mjs named mode, quick fallback, status/down both, tests extended" — yes — named_token() plus two asserts in Tunnel.test.mjs
- 6 "Swap down/up by hand" — n/a (blocked)
- Proof (curl 405/200, remote.url, HandoverNow, Note-card part-card) — no — blocked by the token; no board Note asks the owner for the permission (finding 3)
- "Say in tunnel.md how a second path would be added" — yes — last paragraph of tunnel.md
## Words
- Plain, short sentences — yes, apart from the stale section heading and the old bullets (finding 2) and the mangled path (finding 1)
