# The tunnel: how the Claude app reaches Servex, and who keeps it up

## What it is
`node Server/Tunnel.mjs up` starts a free Cloudflare **quick tunnel**: a public `https://<random>.trycloudflare.com` address that forwards to a tiny gateway on this machine, which passes only `/mcp/remote/<token>` to Servex ([RemoteMCP.js](../RemoteMCP.js)). State lives in `%LOCALAPPDATA%\lew42\servex\`: `remote.tunnel.json` (pids), `remote.url` (the full URL, token included), `remote.token`.

## Why it broke the connector
A quick tunnel gets a **new random hostname every time it starts**, and nothing used to restart it. When it died (2026-10-15) the connector saved in claude.ai pointed at a dead host: "couldn't start sign in".

## The keeper (built, 2026-10-20)
[TunnelKeeper.js](../TunnelKeeper.js) runs inside Servex: at boot and every 60 s it calls `Tunnel.ensure()` ([Server/Tunnel.mjs](../../../../Server/Tunnel.mjs)).
- A live pid in `remote.tunnel.json` is **adopted**, never touched (also after a Servex restart).
- Otherwise `node Server/Tunnel.mjs up` is started detached, so it outlives a Servex restart.
- Servex log events (`servex` log): `tunnel-down`, and `tunnel-up` with the host only.
- When the host differs from the last one (`remote.lasthost`), a **Note card** is created: paste the new URL into the claude.ai connector. `remote.changed` holds the time; `Server/HandoverNow.mjs` shows `Connector: <host> (changed <time>)` in handover.md's NOW block.
- `NO_TUNNEL=1` turns the keeper off. `node Server/Tunnel.mjs up|down|status` still work by hand. Test: `node Server/Tunnel.test.mjs`.

The URL still changes on every real restart of the tunnel, so the connector still needs a re-paste then. The fix is a fixed hostname:

## A stable hostname (live since 2026-10-20)
[TunnelNamed.mjs](../../../../Server/TunnelNamed.mjs) `setup` makes the tunnel `servex`, one ingress line and one proxied CNAME per entry in `TunnelNamed.HOSTS`, then stores the run token at `remote.tunnel.token` (same folder). Safe to re-run; the running cloudflared picks up a new ingress by itself, no restart. [Tunnel.mjs](../../../../Server/Tunnel.mjs) `up` runs `cloudflared tunnel run --token` when that file exists (otherwise the quick tunnel above).

| Public host | Local gateway | What passes |
|---|---|---|
| `servex.lew42.com` | `Tunnel.gateway()`, 127.0.0.1:8191 | `/mcp/remote/<token>` only |
| `monorepo.lew42.com` | [SiteGateway.mjs](../../../../Server/SiteGateway.mjs), 127.0.0.1:8192 | the site, behind the key cookie |

The API token in `cloudflare.env` can edit the tunnel and DNS (checked 2026-11-01). Cloudflare Access is **not enabled** on the account.

## The site from anywhere: monorepo.lew42.com
Open `https://monorepo.lew42.com/?site_key=<key>` once on a phone; the full link is in `site.url` next to the other state files. The gateway swaps the key for a 30-day HttpOnly cookie (an HMAC of the key, never the key) and drops it from the address. Without the cookie every path is a 401 "Locked" page.

**One origin.** The page, the live-reload WebSocket (`wss://` same host), Whisper (`/whisper/*`) and Servex (`/servex/*`, which the dev server's [ServexProxy](../../../../Server/plugins/ServexProxy.js) forwards) all ride the one host. Pages build Servex URLs with [servex_url()](../../../../public/framework/dev/servex_url.js), which is same-origin `/servex` off localhost; `DEV_SITE` there lists the hosts where Servex is asked at all.

**Why it is safe enough.** The gateway dials the dev server at this PC's **LAN address** (10.x:3104), never loopback, so the dev server treats it exactly like the owner's phone on Wi-Fi: `/mcp`, `/screenshot`, `/devsource.json`, `/ai-logs` and `/recordings` refuse it, and the socket gets push traffic only (`rpc:cmd` and `rpc:write` answer "refused"). On top, the gateway itself:
1. requires the cookie;
2. requires `Origin: https://monorepo.lew42.com` on every write and every WebSocket;
3. refuses `/mcp`, `/screenshot`, `/recordings`, `/devsource.json`, `/Servex/`, `/Server/`, `/ai-logs`, `/ask` and `/push/send` outright;
4. passes `/servex/*` only for the page routes in `SiteGateway.SERVEX` and `SERVEX_GET` (items, sessions, voice, refine, whisper, prompts, the agent list). `/servex/mcp`, merge, project start/stop and agent messages are refused.

These routes still pass on purpose, because they are the features: `/api/item` (page edits), `/api/session/*` and `/api/voice*` (chat and the voice agent, which drive agents and paid model calls), `/api/page-ai`. Whoever holds the key can use them, so the key is a password: never paste `site.url` anywhere public.

**Running it.** `node Server/Tunnel.mjs up` starts both gateways in named mode (the keeper does this). `node Server/SiteGateway.mjs` runs the site gateway alone. Test: `node Server/SiteGateway.test.mjs`.

**No stale files on a phone (2026-11-01).** A phone kept an old `Sheet.js` for days: Chrome served it from its HTTP cache without asking, because an older reply had no `Cache-Control` (a heuristic cache). The gateway now gives every reply without one `no-cache`. On a page load from a browser whose `lew42_cache_v` cookie is not `SiteGateway.CACHE_V`, it also sends `Clear-Site-Data: "cache"` and sets the cookie, so each browser is cleared once. It clears the HTTP cache only; cookies, the site key and storage stay. To clear every browser again, bump `CACHE_V`. The clear works in the tab that loads the page fresh (a new tab, or the next load). A tab already open keeps its in-memory copies for one more load. Only the gateway does this; localhost is untouched. Proof: `node Server/SiteGateway.cache.test.mjs`. It seeds a stale nested import, shows that it sticks, then shows that the next page load gets the new one.

**Later: a real login.** Once Access is enabled (Zero Trust → team name → Free plan) and the token has **Access: Apps and Policies → Edit**, put an Access application with the owner's email in front of `monorepo.lew42.com`; the key cookie can then go.

The whole network (processes, ports, which page calls which origin): [network-map.md](../../../../public/framework/ai/sessions/2026/10/20/session-e00f55c9/remote-site-tunnel/network-map.md).
