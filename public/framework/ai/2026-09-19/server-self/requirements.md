# server-self — the watcher ignores reads; the dev server restarts itself

Load the `minion` skill first. Then this brief. Model: Sonnet.

**Three laws.** Less is more (two small changes, no new dependency). Clear beats brief by far. Prioritize (the reload fix first; the self-restart second; the doc last).

## The owner's words (2026-09-19)

> I'm getting a lot of reloads when I load a page. On a good number of pages, I'll load it up and it immediately refreshes. […] one of the needs-you items is restarting the dev server. I think you need to figure out a way to run and manage the server by yourself. […] look into whether Chokidar can allow multiple watchers at once. If it's easy to just spin up a second dev server on a different port, do that.

## 1. The reload — the cause is already found; build the fix and prove it

`Server/watch.js` is one raw recursive `fs.watch` on `public/`. libuv asks Windows for LAST_ACCESS notifications, and this machine has last-access updates ON (`fsutil behavior query disablelastaccess` → 2). So **reading** a file whose access time is over an hour stale fires `change`. Serving a page reads its files → change events for exactly the files that page just loaded → `LiveReload` sends `changed` → the tab reloads. The second load is quiet because the access time is now fresh. Measured on the mastermind's server (port 8123): a `grep` over `core/` produced one 471-path "Changed" batch; nothing had been written. chokidar used to filter this (it compared mtime); the move to raw `fs.watch` (`Server/doc/spin.md`) dropped the filter.

**Fix, in `Server/watch.js`, for every listener at once:** a `change` event passes only when the file's modified time moved. Suggested shape (yours to improve): a `Map` of file → last `mtimeMs`; on `change`, `stat`; unknown file → pass only if `mtimeMs` is recent (say within 10 s of now); known file → pass only if `mtimeMs` differs; a failed `stat` (deleted) passes; `rename` events always pass and refresh the map. Keep it cheap — one `stat` per event, no readdir. Say in the file's comment what the trap is and how it was measured.

**Prove, on a private server (`PORT=8131 node server.js`, background; kill it by its real Windows PID at landing):**

- pick 20 files under `public/` whose LastAccessTime is over an hour old (PowerShell `Get-Item`), read them (`cat`), and show the server logged **zero** "Changed" lines for them; prove "before" by quoting the mastermind's measurement above, or by running the old watcher in a ten-line scratch script (git stash is forbidden);
- write a file → one "Changed" line with that path; create and delete a file → it passes; an editor-style atomic save (write `x.tmp`, rename over `x`) → passes;
- a headless page load of `/framework/core/Page/` with a real socket, files stale → the page does **not** reload (count `load` events: exactly one).

## 2. The server restarts itself when its own code changes

Today a change under `Server/` needs the owner to restart `node server.js` by hand; it has been a "needs you" item three times. Build the smallest supervisor:

- `node server.js` stays the command. When not already the child, it becomes a supervisor: forks the real server as a child (stdio inherited, so the owner's terminal log is unchanged), watches `server.js` and `Server/**` with the **same mtime-checked filter** (reads must not restart it — `node --watch` was rejected for exactly that reason: it restarts on access events), and on a real change: debounce ~500 ms, run `node --check` on the changed file, and only if it passes kill the child and fork a new one. A child that dies on boot is logged in one plain line and the supervisor waits for the next change. Ctrl+C stops both. `PORT` and every other env var pass through. An opt-out env var (`NO_SUPERVISE=1`) runs the server bare, as today.
- The browser side: find what the client does when its socket drops and comes back (`public/framework/ext/` — the DevSocket / LiveReload client). It should reconnect quietly; say what it does today, and fix it only if a restart would strand or reload every tab.
- Write the decision as a `decision` line with the alternatives: `node --watch` (rejected, above); a second always-on server the mastermind owns on another port (exists already — the mastermind runs `PORT=8123 node server.js`; several servers coexist because each opens its own watch handle and the watcher ignores `.json` writes; it is a different origin, so localStorage differs — that stays available, it just does not remove the owner's restart).
- Prove on port 8131: edit a comment in a `Server/` file → the child restarts once, the port answers again within a few seconds, a connected headless tab reconnects; a syntax error (in a temp file the supervisor watches, or a scratch copy of the flow) → no restart, one plain log line; `cat` every file under `Server/` → no restart.

⚠ The owner's own server (port 80) is running the old code and picks all of this up at their next restart — the last one they should ever need. **Never kill or restart it, never drive the owner's tabs.**

## 3. Doc

`Server/doc/` — one short page (`watch.md`, or extend `spin.md`): the read-fires-change trap with the measurement, and the supervisor in five sentences; link it from `Server/README.md` in one line.

## Rules

- `new-task` before the first edit (your dir exists: `ai/2026-09-19/server-self/`); `code`, `documentation`; `finish-task` at the end; `skill-improvement` if a skill misled you.
- **Fence:** `Server/**`, `server.js`, the client socket file only if §2 proves it must change, your task dir. Nothing else. Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing in this shell — drop the slash. A bash heredoc containing an apostrophe fails in this harness — write files with the Write tool.
- Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`. Scratch scripts go in the session scratchpad, not the repo.
- Landing `outcome`: one screen — the headline, the proofs as numbers, the decision, what was left and why.
