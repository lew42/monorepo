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

## A stable hostname (investigated 2026-10-20, not built)
Read-only check with the API token in `cloudflare.env`:
- **A zone exists:** `lew42.com` (active). A named tunnel can hang off e.g. `servex.lew42.com`.
- The token **can** list tunnels (`GET /accounts/<id>/cfd_tunnel` works), so `cloudflared` tunnels can be created through the API.
- The token **cannot** read or edit DNS (`GET /zones/<id>/dns_records` returns 10000 Authentication error), so the hostname's CNAME cannot be made by code.

**The one owner step (2026-10-20, owner asked for a permanent hostname):** the API token has Tunnel access but **no DNS permission**, so the build stopped here. Add **Zone → DNS → Edit** (zone `lew42.com`) to the token in `cloudflare.env` (or do option 2). Then an agent builds the rest: `servex.lew42.com`, token stored beside `remote.token`, quick tunnel kept as the fallback.

What only the owner can do (either one):
1. Edit the API token in the Cloudflare dashboard and add **Zone: DNS: Edit** for `lew42.com`; or
2. Add the CNAME by hand once, after step 2 below: `servex` → `<tunnel-id>.cfargotunnel.com`, proxied.

Then the steps (agent work): create a named tunnel through the API (`POST /accounts/<id>/cfd_tunnel`, `config_src: "cloudflare"`), set its ingress to `http://127.0.0.1:<gateway port>` with `PUT .../configurations`, run `cloudflared tunnel run --token <tunnel token>` instead of `--url`, and write `https://servex.lew42.com/mcp/remote/<token>` to `remote.url`. The connector URL never changes after that, and the Note card never fires.
