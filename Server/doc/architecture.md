# Server architecture — prove a change boots before it swaps

The Server is the dev server: a plain Node process that serves `public/` on your machine, never in production. Its entry is [`server.js`](../../server.js), a small supervisor that forks the real server, [`Server/run.js`](../run.js), as a child. Plugins are `Server.use(...)` modules in [`Server/plugins/`](../plugins/). No build step.

## The supervisor restarts the child only on a real change

**Decided:** `server.js` restarts its child only when a file under `Server/` or `server.js` really changes, never on a plain read.
**Why:** Windows reports a file read as a change, so a restart on every event would bounce the server while a page loads it.
**Instead:** `node --watch` (restarts on any event, reads included).
**Detail:** [`MtimeFilter.js`](../MtimeFilter.js), [watch doc](./watch.md)

## A changed file boots a candidate before the live child is touched

**Decided:** a change first boots a CANDIDATE child on a spare port with `BOOT_TEST=1`; the live child is killed only after the candidate returns HTTP 200 within 8 seconds.
**Why:** on 2026-09-19 a `Server/` file parsed but threw at boot and took the site down for four minutes. `node --check` proves a file parses, not that it boots.
**Instead:** `node --check` alone (the outage above).
A candidate must not write shared state, so plugins check `BOOT_TEST` and return early (`Directory.js`, `LiveReload.js`). Every kill is bounded: `kill_and_wait` gives up after a deadline and runs `taskkill /T /F`.
**Detail:** [watch doc](./watch.md), [`server.js`](../../server.js)

## One recursive watch handle on public/

**Decided:** one `fs.watch(public/, { recursive: true })` in [`watch.js`](../watch.js) feeds `LiveReload` and `Directory`.
**Why:** one handle per directory (chokidar opened 8,532) spun forever when a watched folder was deleted, pinning a core.
**Instead:** chokidar (the spin above).
**Detail:** [spin doc](./spin.md), [watch doc](./watch.md)

## A file read is not a change

**Decided:** `MtimeFilter` lets a change through only when the file's `mtimeMs` moved.
**Why:** Windows last-access tracking fires a change on every read, so a page load would reload every open tab.
**Instead:** trust the raw event (the reload storm above).
**Detail:** [`MtimeFilter.js`](../MtimeFilter.js)

## Appends stream, everything else reloads once

**Decided:** `.jsonl` appends go out as lines (the `Tail` plugin) and never reload; other paths go out as one debounced `changed([paths])` broadcast.
**Why:** a live log that reloads the page on each line is unusable.
**Instead:** reload on every write.
**Detail:** [`LiveReload.js`](../plugins/SocketServer/LiveReload.js), [`Tail.js`](../plugins/SocketServer/Tail.js)

## The reload hold is fenced to the paths its holder names

**Decided:** `node Server/hold.mjs on <who> --paths <glob>` queues reloads for those paths only until `off`; a hold expires by itself after 5 minutes.
**Why:** a global hold stopped the owner's own saves reloading their own tab, with no sign of why.
**Instead:** a global hold (the 2026-09-22 bug).
**Detail:** [`hold.mjs`](../hold.mjs), [reload-rethink](/framework/ai/sessions/2026/09/22/f875ec48-d91a-4890-b15f-db197b55aa13/reload-rethink/)

## The hold lock lives at the repo root, polled every 500 ms

**Decided:** the lock is `.reload-hold.json` at the repo root, polled every 500 ms by `LiveReload`.
**Why:** a lock inside `public/` would look like a change and reload the site; a poll also expires holds with no file write.
**Instead:** a watch on the lock file (no timer, so no expiry).
**Detail:** [`hold.mjs`](../hold.mjs) header

## The socket and /mcp are loopback-only

**Decided:** the WebSocket upgrade and `/mcp` accept only loopback peers; the socket also refuses a non-local `Origin` when one is sent.
**Why:** `rpc:cmd` runs `child_process.exec` with no allowlist, so a LAN client could run commands as the owner. A local tab can also open `ws://localhost`, so the Origin check is needed too.
**Instead:** an Origin-only check (it let any LAN client through with no header).
**Detail:** [`MCP.js`](../plugins/MCP.js) (`loopback`), [`SocketServer.js`](../plugins/SocketServer/SocketServer.js)

## Merges take one lock, and a stale lock expires

**Decided:** `Server/merge.mjs` holds `.merge.lock` at the main repo root; a lock older than 5 minutes, or with a dead PID, is removed.
**Why:** two agents merging at once corrupted the main tree, and a crashed merge must not block the next one.
**Instead:** no lock (races), or a lock with no expiry (wedges after a crash).
**Detail:** [`merge.mjs`](../merge.mjs), [review doc](./review.md)

## Children inherit a hidden console from the root

**Decided:** the supervisor's `fork` has no `windowsHide`; the root runs hidden and children inherit it.
**Why:** a child with no console makes each process it starts pop a visible window (2026-09-22).
**Instead:** `windowsHide: true` on every spawn, the house rule. ⚠ This one `fork` in `server.js` does not set it; the reason is in the code beside it.
**Detail:** [`server.js`](../../server.js) line 163
