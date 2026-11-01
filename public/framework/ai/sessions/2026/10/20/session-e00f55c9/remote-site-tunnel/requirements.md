# The monorepo site from anywhere: monorepo.lew42.com → this PC (you are a mastermind)

**The owner (2026-11-01, before a walk):** "basically a tunnel so that things that we're making on the PC, where we have file writes and Claude Code and all this stuff, work remotely… go to, for example, monorepo.lew42.com and have that traffic properly routed to the monorepo. And the dev server socket should work. The Servex… there's posts going to Servex… any voice agent stuff, any WebSocket stuff… Map the whole networking… servers, Servexes, IP addresses, any kind of need for forwarding… There is a reverse proxy for Servex. Maybe you could tap into that… hopefully quickly. And if you need something from me to get Cloudflare working, you got to tell me quickly."

The owner said "monorepo.lu42.com"; the zone is `lew42.com`.

## First, within 10 minutes: what does the owner need to do?

The owner is about to leave.
- **What exists:** read `Servex/ext/remote/doc/tunnel.md`, `Server/Tunnel.mjs` and `Server/TunnelNamed.mjs`. A quick tunnel already serves `/mcp/remote/<token>`.
- **Known blocker (10-20):** a named tunnel plus DNS needs the API token in `cloudflare.env` to have **Account → Cloudflare Tunnel → Edit** and **Zone → DNS → Edit**. Cloudflare Access would also need **Access: Apps and Policies → Edit**.
- **Check whether it's still blocked:** call the list endpoints, and never print the token.
- **If it is,** report at once, in one plain line, the exact clicks for the owner.
- **Meanwhile,** get a working version up without the owner: a quick tunnel to the site behind the same token gate. Report its URL to the mastermind tab, in your final report and in a log line, never in a public file. When the token is fixed, a fixed hostname replaces it.

## The goal

On the phone, off Wi-Fi, open one URL, and the site works as it does on the PC:
- pages, live updates (the dev server's WebSocket);
- page edits (`POST /api/item` to Servex, `RecordWriter.js`);
- dictation (Whisper over the socket);
- the voice agent and chat.

## Security (a hard fence)

The dev server can write files and runs agent tools: see the memory note "Dev server RCE, closed", `Server/plugins/MCP.js` and `DevSource.js` (the LAN guard).
- **Nothing reaches it from the internet without the owner's login:** Cloudflare Access (the owner's email) once the token allows it; until then a long secret token in the URL or a cookie, checked by a gateway like `Tunnel.gateway()`.
- **Never open `/mcp` or exec routes to the internet.**
- **Never print a token or secret.**

## Do

1. **Map it:** write `network-map.md` here. List each process, port and host (`*.localhost` via Servex's proxy on port 80, the dev server ports, Servex on 8090, whisper-server, the HTTPS LAN twin at port + 10000, the tunnel gateway on 8191), and which page calls which origin (`dev/servex_url.js`, `Socket`, `Dictate`, `RecordWriter`). Mark what breaks when the page is on a public host.
2. **Pick the shape:** one public host whose gateway routes paths to the dev server, WebSocket included, and Servex's `/api/*`, so the browser sees ONE origin. Make the page's Servex URL relative where it isn't already.
3. **Build it in a worktree,** test it from outside the LAN (a headless browser through the public URL), and run `node Server/review.mjs`. Never restart Servex while a voice call is running.
4. **Hand-off:** give the merge command and the restart steps. The owner merges.

## Fences

- **Worktree for code;** never merge.
- **You may spawn** Sonnet or Haiku helpers for searches. No `python` anywhere.
- **Budget:** about $30.
- Report to the mastermind tab: the owner step first, then the URL, then what works.
