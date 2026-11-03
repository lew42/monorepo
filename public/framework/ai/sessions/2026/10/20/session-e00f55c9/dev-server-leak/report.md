# dev-server-leak: landed

- **Idle stop.** Worktree dev servers (not `qf-N` pool slots) stop themselves after 30 min with no HTTP request (`IDLE_EXIT_MIN`, set by `worktree-up.mjs` / `worktree-restart.mjs`; `WORKTREE_IDLE_MIN` changes it). Alternative: count open sockets too, so a page left open keeps it alive; not done, since a left-open page is the usual leak.
- **Sweep can't wedge.** The process scan has a 30 s timeout; a sweep running over 3 min is cleared and a late finish no longer clears a newer one.
- **Tool.** `node Server/worktree-servers.mjs` lists (dry); `--stop-stale` stops servers whose worktree is gone, merged, task-landed or a returned pool slot. `--older-than <h>` adds old open ones. Doc: `Server/doc/worktree-servers.md`.
- **Monitor.** `low_ram_gb` default 1.5 (asked by vscode-mastermind, the owner: "Servex does not need 3 gigabytes").
- Not run by me: `--stop-stale`. **Owner command:** `node Server/worktree-servers.mjs --stop-stale` (preview with `--dry`). First list: 69 servers, 4.8 GB, 61 stale.
- Servex needs `node Servex/sustain.mjs --restart` to load the watchdog and Monitor default.
