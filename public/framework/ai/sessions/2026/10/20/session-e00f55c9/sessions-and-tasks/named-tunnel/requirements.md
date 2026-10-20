# A permanent hostname for the Servex MCP: servex.lew42.com through a named Cloudflare tunnel

Budget: $12. Sonnet. Owner, 2026-10-20 17:00: "try the token, I think it should have DNS … servex.lew42.com … then it's servex.lew42.com/mcp". Facts and steps are in [Servex/ext/remote/doc/tunnel.md](/Servex/ext/remote/doc/tunnel.md) (written by the earlier tunnel-keeper task); read it, `Server/Tunnel.mjs`, `Server/Tunnel.test.mjs` and `Servex/ext/remote/readme.md` first. Never print the API token, the bearer token or the tunnel token.

## What is true

- The MCP endpoint is one fixed URL: `https://<host>/mcp/remote/<bearer token>`; the bearer token is `%LOCALAPPDATA%\lew42\servex\remote.token`, unchanged since 10-14. Today `<host>` is a quick tunnel that changes on every start; Servex keeps it alive (`Tunnel` keeper in Servex, 2026-10-20).
- `cloudflare.env` beside it holds `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`; the owner has just added DNS permissions to that token. The zone `lew42.com` is active in the account; no named tunnel exists yet.
- The hostname is **`servex.lew42.com`**. The MCP keeps its path on it; the owner may later route the Servex dashboard on the same hostname behind Cloudflare Access, so the ingress stays pointed at the loopback gateway that today passes only `/mcp/remote/…` and 404s the rest. Say in tunnel.md how a second path would be added.

## Build

1. Named tunnel `servex` through the API (`POST /accounts/<id>/cfd_tunnel`, a random `tunnel_secret`, `config_src: "cloudflare"`). If it already exists from a partial earlier run, reuse it.
2. Ingress (`PUT /accounts/<id>/cfd_tunnel/<tunnel id>/configurations`): `servex.lew42.com` → `http://127.0.0.1:<gateway port>`, then `http_status:404`. The gateway gets a FIXED port in named mode (choose one, record it in `remote.tunnel.json`).
3. DNS: CNAME `servex` → `<tunnel id>.cfargotunnel.com`, proxied (`POST /zones/<zone id>/dns_records`). If the token still lacks a permission, write exactly which one in tunnel.md and stop.
4. The tunnel's run token (`GET …/cfd_tunnel/<id>/token`) is stored at `%LOCALAPPDATA%\lew42\servex\remote.tunnel.token`. Never in the repo.
5. `Server/Tunnel.mjs`: when that file exists, `up` runs `cloudflared tunnel run --token <token>` with the fixed-port gateway and writes `remote.url` as `https://servex.lew42.com/mcp/remote/<bearer token>`; the quick tunnel stays the fallback when the file is missing. `status`/`down` work for both. The keeper in Servex adopts it as before. Tests: `node Server/Tunnel.test.mjs` extended for named mode.
6. Swap: `node Server/Tunnel.mjs down` then `up` by hand. Do NOT `restart_servex` while another agent is working (`list_agents`); the keeper adopts the running tunnel on the next restart anyway.

## Proof and landing

- `curl -s -o /dev/null -w "%{http_code}" https://servex.lew42.com/mcp/remote/<bearer token>` is 405 or 200 (not 000/404/502/530), run twice a minute apart.
- `remote.url` holds the fixed URL; `node Server/HandoverNow.mjs` shows the new host.
- The Note card `2026/10/20/note-the-servex-connector-in-the-claude` gets one `part-card` through `page_set`: "Permanent URL: paste https://servex.lew42.com/mcp/remote/<token> (token in remote.url) into the connector once; it never changes again."
- tunnel.md updated (named mode, fallback, how to add a dashboard path later). Merge with `node Server/merge.mjs`, land with `finish-task`.
