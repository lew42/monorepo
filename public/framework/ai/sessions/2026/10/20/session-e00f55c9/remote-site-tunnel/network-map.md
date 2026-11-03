# Network map: every process, port and origin (2026-11-01)

**The short version:** the phone opens `https://monorepo.lew42.com`. Cloudflare carries it down the named tunnel to a small gateway on this PC, which checks the key cookie and passes the request to the dev server. Everything the page needs (pages, the live socket, Whisper, Servex) rides that one address. How it is guarded: [tunnel.md, "The site from anywhere"](../../../../../../../../../Servex/ext/remote/doc/tunnel.md).

## The path of one request from the phone

```
phone ──https──▶ Cloudflare (monorepo.lew42.com)
        ──named tunnel "servex" (cloudflared, started by node Server/Tunnel.mjs up)──▶
   SiteGateway  127.0.0.1:8192     key cookie, Origin check, route lists
        ──http, from the LAN address──▶
   dev server   10.0.0.135:3104    the site; /servex/* → Servex, /whisper/* → whisper-server
        ├─▶ Servex        127.0.0.1:8090   /api/item, sessions, voice, refine…
        └─▶ whisper-server 127.0.0.1:8178  speech to text
```

## Processes and ports on this PC

| Process | Listens on | Reached as | Notes |
|---|---|---|---|
| Servex gate + reverse proxy | 127.0.0.1:80 (gate), 127.0.0.1:8079 (proxy) | `monorepo.localhost`, `servex.localhost`, `<project>.localhost` | Loopback only. Starts a stopped project on first request. `Servex/ReverseProxy.js` |
| Servex dashboard and API | 127.0.0.1:8090 | `servex.localhost`, `http://127.0.0.1:8090` | Loopback only. `/mcp` here is the full tool registry. |
| monorepo dev server | 0.0.0.0:3104 | `monorepo.localhost` (via :80), `http://10.0.0.135:3104` (LAN) | Port pinned in `%LOCALAPPDATA%\lew42\servex\ports.json`. |
| HTTPS LAN twin | 0.0.0.0:13104 (port + 10000) | `https://10.0.0.135:13104` | Self-signed; for the mic on a LAN phone. `Server/plugins/HttpsLan.js` |
| whisper-server | 127.0.0.1:8178 | `/whisper/*` on the dev server | Supervised by Servex. |
| MCP tunnel gateway | 127.0.0.1:8191 | `https://servex.lew42.com/mcp/remote/<token>` | Only `/mcp/remote/<token>`. `Tunnel.gateway()` |
| Site gateway | 127.0.0.1:8192 | `https://monorepo.lew42.com` | `Server/SiteGateway.mjs`; started by `Tunnel.mjs up` in named mode. |
| cloudflared | outbound only | the named tunnel `servex` | Ingress lives in Cloudflare: `TunnelNamed.HOSTS`. |

## Which page calls which origin

| Feature | Browser code | Calls | On monorepo.lew42.com |
|---|---|---|---|
| Live reload, tails, queries | `dev/Socket/Socket.js` | `wss://<same host>/` | Works. LAN tier: push and read-only queries; `rpc:cmd`/`rpc:write` refused. |
| Page edits | `core/Item/RecordWriter.js` via `servex_url` | `POST /servex/api/item` | Works. |
| Dictation | `ux/Dictate/Dictate.js` `default_whisper_url()`, `Connection.js` | `/whisper/inference`, `/servex/api/whisper(/stream)` | Works (https gives the mic a secure context). |
| Voice agent, chat | `ext/Session/Session.js`, `ext/Refine/*`, `ext/Chat/Mic.js` | `/servex/api/session/*`, `/servex/api/voice*`, `/servex/api/refine*` | Works. |
| AI drawer | `ext/drawer/tabs/ai.js` | `/servex/api/page-ai`, `/servex/api/agents` | Works. |
| Inbox rail, live board | `core/Page/ext/Inbox/servex.js`, `ai/v/3/Prompts.js`, `core/Page/ai/live.js` | `/servex/api/stream`, `/servex/log/prompts` | Fixed in this task (used to skip Servex or call `127.0.0.1:8090`). |
| DevBar chat | `dev/DevBar/chat.js` | `/servex/api/page-agents`, `/servex/api/page-session/*` | Fixed in this task (used `http://<host>:8090`). |
| Ask (a Claude turn) | `ext/Ask/Ask.js` | `POST /ask/turn` | **Refused on purpose** (spawns a Claude turn with tools). |
| Task logs, screenshots, dev source | `ai/AITask/*`, `servex/fs/page.js` | `/ai-logs/*`, `/screenshot`, `/devsource.json` | **Refused on purpose** (loopback-only). |

## Still pointing at 127.0.0.1 (not on the phone's path)

- `core/Role/Role.js` `agents()` defaults to `http://127.0.0.1:8090`; it is shared with Servex (node), so it cannot import `servex_url`. Its fallback `/api/agents` fails too. Used by doc pages only.
- `ux/Dictate/variants/v1/Dictate.js` (the old v1 variant) and `ai/SystemClasses.js` (`http://localhost/api/agents`).
- Any Servex route not on the gateway's lists (`SiteGateway.SERVEX`, `SERVEX_GET`) answers 403 from the phone. Add a route there when a page starts calling it.

## Verified from outside the LAN (2026-11-01)

A headless Chromium went through the public URL (Cloudflare and back, not the LAN): `/framework/` rendered (200), the socket connected over `wss://` and received live pushes, `rpc:cmd` was refused, `/servex/api/agents`, `/servex/api/sessions`, `/servex/api/whisper` and `/whisper/` answered, `POST /servex/api/item` reached Servex (400 for an empty body), and `/mcp`, `/devsource.json` and `/servex/api/projects` were refused (403). Without the cookie every path is 401.
