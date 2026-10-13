# Server-side query: plan (2026-10-12)

Brief: [requirements.md](requirements.md). The owner's ask: the Sessions page loads everything into the browser; node should hold the data and the browser should receive only the rows it shows.

## What already exists (past work)

- **Node already holds every session in memory.** `AISessionIndex` (`ai/AISession/AISessionIndex.mjs`) runs inside the dev server (`AISessionTailer.mjs`, main checkout only) and keeps `snaps`, a Map of every session snapshot (about 7,800, ~500 bytes each). It is the "full load" the brief asks for, already resident.
- **The socket already does request/reply.** Client `Socket.request({method, args})` (`dev/Socket/Socket.js`) gets a promise; the server handler receives `(args, index)` on `rpc:<method>` and answers `socket.send({ response, index })` (`Server/plugins/SocketServer/Runtime.js`, `ls`).
- **The socket already streams sessions.** `AISessionSub` sends today's snapshots once, then each changed one (`session_sub`). The new query reuses its `ix.on()` listener.
- **What the browser loads today:** every day `index.json` in the date window, `session-index.json` (286 KB), `session-tree.json` (176 KB), `sessions.json` (331 KB), flags, `GET /api/agents`, and the Servex event stream; then it filters, sorts, nests and buckets in the page (`AISessionsPage.draw()`).
- **Buckets:** `AISessionBuckets` (plain data, node and browser) rolls routine sessions up into five rows ([buckets.md](/framework/ai/sessions/doc/buckets.md)). It can run on the server unchanged.
- **`page_read`** (Servex `agents/page_tools.js`) already replays a `page.jsonl` in node to compute page state: the seam for a server-side Page that is not Sessions.
- **The grid:** `ext/DataGrid` takes `rows` as an array or an async function, and `set_rows()` for a live feed.
- **server-perf (10-10)** turned the per-message socket logs off behind `SOCKET_LOG=on`; `Server/plugins/SocketServer/Socket.js` logs every message again unconditionally (a regression). Fix it in this slice: every query would otherwise print to the server log.

## The classes

| Class | Where | Job |
|---|---|---|
| `Query` | `ext/Query/Query.js` (node and browser) | One query as plain JSON: `where`, `sort`, `offset`, `limit`, `sum`. `run(items)` returns `{ rows, total, totals, offset }`. A plain loop: filter, sort, slice, add up. |
| `QueryServer` | `ext/Query/QueryServer.mjs` (node, dev server) | The registry of sources and the socket half. `QueryServer.source(name, { load, items, on, unload_after })`; answers `rpc:query`, and pushes changes to the rows each socket is showing. |
| `AISessionsPage` | existing | Asks `query` for its visible page instead of loading every file, when the dev socket is there. |

Nothing new on the static site: production keeps reading the files (no server at runtime).

## Decisions

1. **A query is data, never code.** The client sends `{ source, where: [{ field, op, value }], sort: { by, dir }, offset, limit, sum: [fields] }`; ops are `eq in gte lte contains`. *Alternative:* send a function body to eval in node. Rejected: this socket is localhost-only but already carries `rpc:cmd`; evaluating query text widens it further, and a declarative query is cacheable and loggable.
2. **Where the full load happens.** A source has an async `load()`, run on the first query.
   - The registry unloads it after `unload_after` idle (default 5 minutes).
   - Sessions' `load` is `live.index.ready`; its data stays resident because the tailer needs it anyway, so its `unload` is a no-op. A page.jsonl-backed Page would `load` by replaying its log (the `page_read` path) and `unload` by dropping it. *Alternative:* a separate session store just for queries. Rejected: two copies of the same truth (law 6).
3. **Full-load safety.** Sessions is already loaded; one query is one pass over ~7,800 objects (measure it; expected under 10 ms). A future source over about 1,000 items loads in chunks with `await` between them, so the server never blocks.
4. **Live updates are scoped.** Each socket's last answer is remembered (the query and the ids it returned). On a change: if the id is among the shown rows, push `query_row(qid, row)`; otherwise if it matches the `where`, push `query_stale(qid, total)` at most once a second, and the client re-asks for its page. No per-row subscriptions.
5. **Client stays one grid** (law 6). `AISessionsPage` gets a remote mode.
   - Grid rows come from `query` (first 50, the next page as the grid scrolls); summary totals come from `totals`.
   - Off the dev socket (production, a phone on the LAN without it) the page falls back to today's file loading. *Alternative:* a new lightweight Sessions view. Rejected: a second version of the same page.
6. **Buckets and nesting move with the query** only if they fit the slice; otherwise remote mode shows flat rows first and records the gap. Flat and fast first (law 1), then parity.

## Measure (before and after, same script)

`ai/2026-10-12/data-grid/sessions-perf/perf-sessions.mjs`, extended with transfer KB (resource timing plus WebSocket frames over CDP): transfer KB, JS heap, long tasks, time to first row, at 400 and 1920. Plus node-side: query time, and server heap before and after the index is loaded. Same query timed in the browser (`Query.run` over the loaded rows) and in node.

## Docs

- `core/Page/doc/server.md`: where a Page is instantiated server-side, when it fully loads, when it unloads; linked from the Page readme and architecture.md.
- `code/performance/doc/server-query.md`, linked from its readme.
- `ext/Query/readme.md`, `page.js`, `doc/`.
