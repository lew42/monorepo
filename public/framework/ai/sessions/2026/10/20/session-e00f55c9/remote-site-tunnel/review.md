verdict: fix
1. [fix] Ask 4 ("give the merge command and the restart steps") is not met: no file in the task folder tells the owner or a fresh agent how to land it. owner-step.md and task.jsonl say only "Branch worktree/remote-site-tunnel awaits merge", and the live gateway is running from the worktree (task.jsonl line 1). Add a hand-off line with the merge command (`node Servex/merge.mjs` or equivalent for `worktree/remote-site-tunnel`), then `node Server/Tunnel.mjs down && up` from the main tree so the gateway stops running from the worktree, and a note not to restart during a voice call.
2. [fix] Server/Tunnel.mjs:46 (diff line 287): `await new SiteGateway().listen()` runs inside the MCP tunnel's `up`, and the SiteGateway constructor throws when `SiteGateway.target()` finds no private LAN address (SiteGateway.mjs:54, which happens when the PC is offline or between networks) or when `remote.token` cannot be read. In either case the voice agent's MCP tunnel never starts. Wrap that call in try/catch so a site-gateway failure only logs, as the comment "a busy port only logs" already promises.
3. [fix] SiteGateway.mjs:53 has a typo in the 172.x part of the private-range regex: it reads `2d`, where `2\d` was meant, and the dots are unescaped. So 172.20–29 addresses are never matched. Use `WorktreePreview.lan_ip()` (Server/WorktreePreview.mjs:28), which already does this job, instead of a second copy (law 6, one of everything).
4. [note] SiteGateway.mjs: the LAN address is read once, when the gateway starts. If DHCP gives the PC a new address, every request answers 502 "site unreachable" until `Tunnel.mjs` restarts. Re-reading the address after a connection error would fix it cheaply.
5. [note] SiteGateway.mjs:105 takes any `?key=` query parameter as the login key. A page that uses its own `key` parameter would get the Locked page instead (a wrong key answers 401). Renaming the parameter to `site_key` would avoid the clash.
6. [note] SiteGateway.mjs:39: DENY ends each route with `(\/|$)`, so a variant like `/mcp;x` passes the gateway. The dev server's own LAN guard still refuses it, because the gateway dials the LAN address. That makes this defence in depth only, but `(\/|$|[;.?])` or a plain prefix test would close it.
7. [note] Server/README.md does not mention SiteGateway.mjs (nor Tunnel.mjs). Both are indexed only from Servex/ext/remote/doc/tunnel.md. A one-line entry under Server would let a reader find the public gateway from the Server index.
8. [note] public/framework/dev/servex_url.js:12: the header comment still lists only three callers. This change adds DevBar/chat.js, ai/v/3/Prompts.js and core/Page/ai/live.js, and it adds `DEV_SITE`, which the readme does not name. Also, `DEV_SITE` begins `^(localhost|…` with no end anchor, so `localhost.anything` matches it. That is harmless (it only decides whether Servex is probed).
9. [note] chat.js no longer reads the `window.__SERVEX_URL__` override. grep finds no code that sets it, so nothing breaks.
10. [note] The links in network-map.md to `Servex/...` and `Server/...` resolve in the repo but not on the site, because only `public/` is served.

## Requirements
- 1 "tell the owner what Cloudflare needs, quickly" — yes — owner-step.md: "none, the token works", plus the optional Access steps.
- 2 "a temporary link meanwhile" — n/a — the token worked, so the permanent host went straight up (owner-step.md).
- 3 "Map it: network-map.md" — yes — network-map.md lists every process, port and origin, and marks what breaks on the public host.
- 4 "Pick the shape: one origin; Servex URL relative" — yes — SiteGateway → dev server → /servex, /whisper; Prompts.js, live.js and chat.js now use servex_url. Role.js and Dictate v1 are left, and listed in network-map.md.
- 5 "Nothing reaches it without the owner's login; never /mcp or exec; never print a secret" — yes — the key cookie (an HMAC), an Origin check, deny lists, and a LAN-tier dial; the test covers them (SiteGateway.test.mjs); the key goes only to %LOCALAPPDATA%/site.url.
- 6 "Build in a worktree, test from outside the LAN" — yes — branch worktree/remote-site-tunnel; a headless run through Cloudflare is recorded in network-map.md, "Verified from outside the LAN".
- 7 "Hand-off: merge command and restart steps" — no — see finding 1.
- 8 "Report: owner step, URL, what works" — yes — task.jsonl log line, with no key in it.
- Class with live instances — n/a — SiteGateway is a server process with no browser state.
## Words
- content: plain sentences, short — yes — tunnel.md "The site from anywhere" and network-map.md are clear and lead with a short summary.
- jargon defined — yes — "LAN tier" and "key cookie" are explained where they are first used (tunnel.md).
