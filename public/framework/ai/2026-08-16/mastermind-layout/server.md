# Server tier — the `rpc:cmd` hazard

**Verdict: it was reachable off-host, and it is now closed.** Anything on
`192.168.1.0/24` could open the dev socket and run arbitrary shell commands as
`compliance\mike`. Not theoretical — executed, twice, from the LAN address
(`whoami` → `compliance\mike`). The scout's claim was right, including its line
numbers (`Runtime.js:62-66`); its reading of the origin check was not.

## The chain, all four links verified

1. `Server/Server.js:52` — `listen(port = process.env.PORT || 80, host = '0.0.0.0')`.
2. Windows Firewall has an **enabled inbound Allow** rule, `Node.js JavaScript
   Runtime` → `C:\program files\nodejs\node.exe`, **any port, Public profile** —
   and the active Wi-Fi is classified Public. The listener on `:80` is that exact
   binary. Nothing at the network layer was stopping the LAN.
3. The upgrade guard accepted the caller (below).
4. `Runtime.js:23` binds `rpc:cmd` → `Runtime.js:62-66` hands the argument
   straight to `child_process.exec`, no allowlist, no cwd fence, stdout returned
   over the socket.

## The gating that actually existed

`SocketServer.js` passed `verifyClient: local_only` to `ws` — a real option
(`ws@8.21`, `websocket-server.js:353`, arity-1 sync boolean, 401 on refusal), so
it did run. What it checked was **only `info.origin`**, and its first line was
`if (!origin) return true`.

Origin is a header the caller writes. Only a browser is obliged to send an honest
one; every other client omits it or forges it. So the check bought exactly one
thing — it refused a **browser** on any host, which is the drive-by CSRF case and
genuinely worth having. It bought **nothing** against a non-browser peer. Proved
against the live `:80` server before the fix:

| from | Origin | upgrade | `rpc:cmd` |
|---|---|---|---|
| `192.168.1.206` (LAN) | *absent* | accepted | ran `whoami` |
| `192.168.1.206` (LAN) | forged `http://localhost` | accepted | ran `hostname` |
| `192.168.1.206` (LAN) | `http://evil.example.com` | 401 | — |

## Sibling survey

`server.js` loads `DevSocket` (a bare subclass of `SocketServer`), so every
`Socket` plugin shares one door. The upgrade guard is that door.

| plugin | power | gated by |
|---|---|---|
| `Runtime` | **`exec` (`rpc:cmd`)**; `write`/`ls`/`rm` under `public/` via `to_relative` | upgrade guard only — was the hole |
| `Ask` | spawns `claude -p`; writes `task.jsonl` | upgrade guard; path fenced to a `public/**/ai/**` dir |
| `Start` | spawns `claude -p --permission-mode acceptEdits`; scaffolds a task dir | upgrade guard; path fenced under `public/framework/ai` |
| `Tail` | `fs.read` of a client-named path | upgrade guard; must resolve under `public/` and end `.jsonl` |
| `Tab` | `eval` in the browser | upgrade guard |
| `LiveReload` | server→client only | n/a |
| `MCP` | `eval`, `shot`, `pages` over `POST /mcp` | **`loopback(req.socket.remoteAddress)`** — the house pattern |
| `Directory` | writes the two gitignored `directory.json` | no remote input |
| `AILogs` | streams `~/.claude` transcripts over `GET /ai-logs/:id` | UUID-shaped id only — **no loopback guard** (see below) |
| `Auth`, `SSL` | not loaded by `server.js`; `Auth` also wants three uninstalled npm packages | n/a |

So before this change **one** plugin used `loopback()`: `MCP`. Every socket
plugin relied on the origin check, and `Runtime.cmd` was the one with no second
fence of its own.

## The fix

One guard, at the one door, reusing `MCP.js`'s existing `loopback()` —
`SocketServer.js` now refuses an upgrade whose peer is not loopback, *and* keeps
refusing a non-local `Origin`. Both checks stand because they stop different
attackers: the peer address is the field a caller cannot choose, and the origin
is what refuses a local browser that a malicious page drove to
`ws://localhost` (a WebSocket upgrade is not subject to the same-origin policy,
so that request *does* come from loopback).

This is `LAW#6` enforced on the server side — `dev/Socket` already refuses to
connect off-localhost — not a new policy. No bypass flag, nothing weakened.

**Verified** on a throwaway instance (`PORT=8081`; the `:80` server was left
alone):

- LAN peer, no Origin → **401**. LAN peer, forged `http://localhost` → **401**.
- Loopback + `http://evil.example.com` → **401**.
- Loopback + no Origin → accepted, `rpc:cmd` still answers (local CLI tooling).
- Loopback + `http://localhost:8081` → accepted, `rpc:ls` answers.
- A real headless tab on `http://localhost:8081/framework/`: socket connected,
  `pages` listed it, `eval` returned `"Framework | links=118"`, `shot` wrote a png.
- Live reload: re-saving a watched file delivered
  `changed(["/framework/ai/2026-08-16/mastermind-layout/server.md"])` to that tab.
  `rpc:subscribe` streamed the task log back — 153 lines, offset 96542.

**It takes effect on the next `node server.js`** — the process on `:80` is still
running the old handshake.

## Left open, deliberately

`GET /ai-logs/:id` streams a Claude Code transcript from `~/.claude/projects/…`
to anyone who can guess a UUID, with no loopback check. Unguessable in practice
and read-only, so it is not the same class of hole as `exec` — but it is the one
remaining route that answers the LAN and reads outside the repo. A one-line
`loopback()` on it is a separate, obvious call for Mike (`AILogs.js:26`).

`Runtime`'s `rpc:cmd` still has **zero callers** — `dev/Socket/Socket.js:206`
`cmd(res)` is the *response* handler, and `dev/Socket/readme.md:119` already asks
whether the method should exist at all. Deleting it would remove the capability
rather than fence it; that is a design call, not a security fix, so it stays for
Mike to settle.
