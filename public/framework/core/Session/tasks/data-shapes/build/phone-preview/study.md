# Study: a worktree's dev server on the owner's phone

**Short answer:** the phone already opens the *main* site over the home Wi-Fi. A worktree's server is blocked by one deliberate setting, and Servex deletes the worktree at landing, before you can look.

**Recommended:** bind a waiting worktree's server to the LAN and keep it alive until its branch merges (steps at the bottom). Nothing was edited for this study; no secrets were read.

## 1. How the phone reaches the site today

```
phone ──home Wi-Fi──▶ http://<PC LAN IP>:<port>/        main site: works
phone ──home Wi-Fi──▶ http://<worktree>.localhost       blocked: only this PC resolves .localhost
phone ──internet────▶ Cloudflare tunnel                 passes only /mcp/remote/<token>
```

- **Main site:** Servex starts it with `HOST=0.0.0.0` (`Servex/Servex.js:428-433`). Phone steps: `public/framework/dev/mobile/mobile.md:14-21`.
- **Worktree servers:** the same line gives them `HOST=127.0.0.1`, loopback only (`Servex.js:430,433`).
- **On a LAN phone** the socket allows only `hello/subscribe/unsubscribe/query`, never `cmd` or `write` (`public/framework/dev/Socket/doc/lan.md:6`). Reload and live tails work.
- **Tunnel:** built for the Claude app connector, so its gateway 404s everything but `/mcp/remote/<token>` (`Server/Tunnel.mjs:24-28`). The permanent name waits on a Cloudflare token permission (`Servex/ext/remote/doc/tunnel.md:19-22`).

## 2. Options

| Option | Effort | Safety | Verdict |
|---|---|---|---|
| **A. LAN address** `http://<LAN IP>:<worktree port>/` (`HOST=0.0.0.0`) | Small: one env choice at `Servex.js:433` plus a link | Same exposure as the main site; socket stays push-only. Worktree code is unreviewed. Home Wi-Fi only | **Recommended** |
| **B. Subdomain per worktree on the tunnel** | Large: wildcard DNS, the blocked token, a host-aware gateway | Worst: unreviewed code on the public internet | Later, off-Wi-Fi only |
| **C. Path prefix on the tunnel** | Medium: widen `Tunnel.mjs:28` | Same as B | No |
| **D. `?tree=` on the main server** | Medium: new `Server/` plugin | Safest (static files only), but previews less: no worktree `Server/` or `page.jsonl` writes | Fallback if A is too open |

## 3. Why the worktree is gone before you look

Three rules act at landing; none knows you still have to look:

- **At landing:** `Server/on-landing.mjs:123-159` stops the server and runs `Server/Worktrees.mjs --apply --archive --now` (`:156`). The folder is removed, the branch kept.
- **Every 10 minutes:** `Servex/Worktrees.js` `judge()` calls a landed task with a stopped agent finished, even if unmerged (`:103-112`), then removes the folder (`:295`).
- **Idle servers:** `stop_idle()` stops the server once the task lands (`:145-154`). The proxy restarts it on a `.localhost` request, but a phone on the direct LAN port hits a dead port.

`Server/worktree-sweep.mjs:12-18` is safer: it requires the branch to be merged. Landing ignores that.

## 4. Steps (option A + keep-alive)

- [ ] **Hold until merge.** In `judge()` (`:103-105`) and `Worktrees.mjs:72-74`, treat "landed, not merged" as open; drop `--archive --now` at `on-landing.mjs:156` for unmerged branches. Keep the 48 h backstop.
- [ ] **Exempt from `stop_idle`** while open and unmerged (`:145-154`).
- [ ] **Bind to the LAN while waiting.** At `Servex.js:433`, `HOST=0.0.0.0` when the task carries `{"assign":{"preview":true}}`.
- [ ] **Show the link** on the ready-to-merge card next to Merge: `http://<PC LAN IP>:<port>/`, the IP computed by a node script.
- [ ] **Test in a worktree first:** phone-sized headless load, a socket `cmd` answers `refused` (`lan.md:9`), the folder survives landing until `merge.mjs` runs.
- [ ] **Not covered:** the phone off the home Wi-Fi (needs the named tunnel plus Cloudflare Access before option B).

**Side finding:** `on-landing.mjs:155` tests `/^qf-d+$/`, missing a backslash, so its pool-slot guard never fires. `Worktrees.mjs` has its own check, so it is harmless.
