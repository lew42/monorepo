Budget: $3.

# Servex: the phone site (port 8137) is always up, started by Servex

**Why:** the owner, about 23:00 on 2026-10-03: "is my dev server running? I tried from my phone ... if you can run the server, do that so I don't have to stand up." The site was up on 127.0.0.1:3104 and on :80, but both answer this machine only (by design). The phone server on :8137 wasn't running, and nothing could start it:
- `server-guard.mjs` (correctly) refuses `node server.js` by hand;
- `start_server` starts only the loopback copy: `Servex/Servex.js` `runner()` (about line 373) always passes `HOST: "127.0.0.1"`.

`Servex/keep.json` already lists 8137, so the reaper leaves it alone; it just has no way to be started.

## What to build

1. **A `phone` project Servex can start.** The monorepo's own directory, pinned to port 8137, started with `HOST=0.0.0.0` (the phone reaches it at `http://10.0.0.135:8137/`). Find where Servex builds its project list and add `phone` there as a second entry for the same directory, with its own env. Keep it small: one extra field (for example `env: { HOST: "0.0.0.0" }`) that `runner()` merges over its default; no second mechanism.
2. **Started on boot**, the same way the main site is auto-started, and restarted if it dies (Servex's normal supervision). `start_server phone`, `stop_server phone` and `list_servers` all work for it.
3. **Safety (the 2026-08 lesson: `rpc:cmd` was reachable from the LAN and could run commands).** Before it goes live, list every route on the dev server that can run a command, write a file or start an agent (`rpc:cmd`, `/mcp`, `/ask/turn`, the dev socket, `/devsource.json`, recordings, screenshots, AI logs, whisper). For each, confirm from the code that it refuses a non-loopback caller, or allows only this machine's own Wi-Fi address with a matching `Host` header. Then prove it: from this machine, call each one on `http://10.0.0.135:8137/` (the LAN address, so the request isn't loopback) and check it refuses. Anything that doesn't refuse is fixed before the phone entry ships. Put the table on the card.
4. **Tests:** `phone` is in the project list with port 8137 and HOST 0.0.0.0; the default project is still 127.0.0.1; one guarded route refuses a LAN-address request.

## Land

`node --check`, the tests, commit by exact path, merge. This needs a Servex restart; restart only when `list_agents` shows nobody mid-turn (restarts still end mid-turn agents until restart-keeps-agents lands). Then open `http://10.0.0.135:8137/framework/` with a headless check (never the owner's tabs), confirm it answers 200, and post on the card: "Your phone site is up: http://10.0.0.135:8137/".

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
