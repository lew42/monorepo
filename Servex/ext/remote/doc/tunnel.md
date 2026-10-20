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

## A stable hostname (named mode built 2026-10-20, blocked on the API token)
[TunnelNamed.mjs](../../../../Server/TunnelNamed.mjs) `setup` creates the tunnel `servex`, its ingress (`servex.lew42.com` to the gateway on fixed port 8191) and the proxied CNAME, then stores the run token at `%LOCALAPPDATA%lew42servexemote.tunnel.token`. [Tunnel.mjs](../../../../Server/Tunnel.mjs) `up` then runs `cloudflared tunnel run --token` and writes `https://servex.lew42.com/mcp/remote/<token>` to `remote.url` **only when that token file exists**; without it, it is the quick tunnel above.

**Blocked (checked 2026-10-20):** the token in `cloudflare.env` can only list. `POST /accounts/<id>/cfd_tunnel` and `GET /zones/<id>/dns_records` both return 10000 Authentication error. It needs exactly two permissions: **Account → Cloudflare Tunnel → Edit** and **Zone → DNS → Edit** (zone `lew42.com`). Then run `node Server/TunnelNamed.mjs setup`, `node Server/Tunnel.mjs down`, `node Server/Tunnel.mjs up`.

**Adding a dashboard path later:** `Tunnel.gateway()` passes only `/mcp/remote/...`; add the new path to its allow-check (behind Cloudflare Access). Cloudflare itself needs no change, since the ingress points at the gateway.
