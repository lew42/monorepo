# Study: a worktree's dev server on the owner's phone

**Short answer:** the phone can already open the *main* site over the home Wi-Fi. A worktree's server is blocked from the phone by two deliberate settings, and the worktree is deleted at landing, before the owner can look. Recommended: bind a waiting worktree's server to the LAN and keep it alive until its branch merges (steps at the bottom). Nothing was edited for this study; no secrets were read or printed.

## 1. How the phone reaches the site today

- **Main site, over the home Wi-Fi (works):** Servex starts the `monorepo` project with `HOST=0.0.0.0`, so the phone opens `http://<PC LAN IP>:<port>/` (`Servex/Servex.js:428-433`; the owner approved it 2026-10-04). Steps for the phone: `public/framework/dev/mobile/mobile.md:14-21`. The dev server's own default bind is `0.0.0.0` too (`Server/Server.js:80`).
- **Worktree servers (blocked):** the same line gives every non-`monorepo` project `HOST=127.0.0.1` (`Servex/Servex.js:433`), "worktree servers stay loopback" (`:430`). The proxy that serves `<name>.localhost` listens on `127.0.0.1` only (`Servex/Servex.js:87`, `mobile.md:40-43`), and only this PC resolves `.localhost`. So `<worktree>.localhost` can never work on a phone.
- **What a LAN phone may do once connected:** the dev socket lets a private-LAN peer send only `hello/subscribe/unsubscribe/query` (`LAN_OK`), never `cmd` or `write` (`public/framework/dev/Socket/doc/lan.md:6`). Reload and live tails reach the phone.
- **Off the home Wi-Fi (the tunnel):** a Cloudflare tunnel exists (`Server/Tunnel.mjs`, kept up by `Servex/ext/remote/TunnelKeeper.js`). Its gateway passes **only** `/mcp/remote/<token>` and 404s everything else (`Server/Tunnel.mjs:24-28`), because it was built for the Claude app connector. The quick tunnel's host changes on every restart (`Servex/ext/remote/doc/tunnel.md:6-7`); the permanent name `servex.lew42.com` is built but blocked on a Cloudflare API-token permission (`tunnel.md:19-22`). The secrets live in `%LOCALAPPDATA%\lew42\servex\` (`tunnel.md:4`); I did not open them.

## 2. Options for `<worktree>` on the phone

| Option | Effort | Safety | Verdict |
|---|---|---|---|
| **A. LAN address** (`http://<LAN IP>:<worktree port>/`): start the worktree server with `HOST=0.0.0.0` instead of `127.0.0.1` | Small: one env choice at `Servex.js:433` plus a link | Same exposure the main site already accepts; socket stays push-only (`lan.md:6`). Worktree code is unreviewed and its own `Server/` copy runs, so its loopback guards are only as good as that branch. Home Wi-Fi only | **Recommended** |
| **B. Subdomain per worktree on the tunnel** (`<name>.servex.lew42.com`) | Large: wildcard DNS, the blocked API token (`tunnel.md:22`), a gateway that proxies by host | Worst: unreviewed code on the public internet; needs Cloudflare Access first | Later, only for off-Wi-Fi use |
| **C. Path prefix on the tunnel** | Medium: widen the gateway allow-check (`Tunnel.mjs:28`; `tunnel.md:24` says to put it behind Access) | Same public exposure as B | No |
| **D. `?tree=` choice on the main server** (serve the main site's files from a worktree's `public/` per cookie) | Medium: new `Server/` plugin; absolute `/framework/...` imports need the cookie, not the URL | Safest (static files only, no worktree server code runs), but the worktree's `Server/` changes and `page.jsonl` writes are not exercised, so it previews less | Good fallback if A is judged too open |

## 3. Why the worktree folder is gone before the owner looks

Three Servex rules act at landing, none of which knows the owner still has to look:

- **At landing:** `Server/on-landing.mjs:123-159` stops the server (`worktree-down`, `:128`) and runs `Server/Worktrees.mjs --apply --archive --now --path <worktree>` (`:156`). `--now` sets `quiet_hours` to 0 (`Server/Worktrees.mjs:170`), and `--archive` turns "KEEP: uncommitted or unmerged" into ARCHIVE (`:72-74`): leftovers are committed to the branch, the folder is removed, the branch is kept, and unmerged commits become a line in `ready-to-merge.jsonl`. That is the `worktree-close` line in `../backbone/session.jsonl` (line 46; that one failed with "Directory not empty", so the folder survived).
- **Every 10 minutes:** `Servex/Worktrees.js` `judge()` calls a worktree "finished" when its task landed and its agent stopped (`:103`, `:112`), even with unmerged commits (`:105`): leftovers are committed and the folder is removed (`remove()`, `:295`). A worktree quiet for 48 hours is treated the same (`:104`).
- **Idle servers:** `stop_idle()` stops a worktree's dev server as soon as its task is landed or paused, or git was quiet 2 hours (`Servex/Worktrees.js:145-154`). The proxy restarts it on the next `.localhost` request (`Servex.js:451-458`), but a phone using the direct LAN port would just hit a dead port.
- `Server/worktree-sweep.mjs:12-18` (`can_stop`) is safer: it requires the branch to be merged. The landing hook ignores that for the folder removal.

## 4. Recommendation and steps (option A + keep-alive)

1. **Hold a landed worktree until its branch merges.** In `Worktrees.js` `judge()` (`:103-105`) and the `--archive` path (`Worktrees.mjs:72-74`), treat "landed but branch not merged into `michael/dev`" as `open`, not closing; drop `--archive --now` from `on-landing.mjs:156` for an unmerged branch. Keep the 48 h rule as a backstop. Close after the merge, as today (`judge()` `:109`).
2. **Exempt it from `stop_idle`** while it is open and unmerged (`:145-154`), so the LAN port stays up.
3. **Bind it to the LAN while it waits.** At `Servex.js:433`, `HOST=0.0.0.0` for a worktree whose task has landed and awaits review (a flag on its task, e.g. `{"assign":{"preview":true}}`); loopback otherwise. Restart its server once at landing.
4. **Show the link where the owner looks:** on the task's ready-to-merge card, `http://<PC LAN IP>:<port>/` (port from `Servex/Ports`, `Servex.js:401`) next to the Merge button. The LAN IP is computed by a node script, not written by an agent.
5. **Test in a worktree first** (a private Servex on another port): phone-sized headless load of `http://<LAN IP>:<worktree port>/`, a `cmd` over the socket answers `refused` (the `lan.md:9` proof recipe), and the folder survives a landing until `merge.mjs` runs.
6. **Not covered:** the phone away from the home Wi-Fi. That needs the named tunnel (the API-token permission, `tunnel.md:22`) plus Cloudflare Access before option B.

**Side finding:** `on-landing.mjs:155` tests `/^qf-d+$/` (a missing backslash: it matches `qf-ddd`, not `qf-12`), so the pool-slot guard there never fires; `Worktrees.mjs` has its own pool check, so it has been harmless.
