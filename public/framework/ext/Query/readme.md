# Query — ask node for just the rows a page shows

A query is plain JSON (`where`, `sort`, `offset`, `limit`, `sum`); node runs it over items it already holds in memory and sends back one page. Dev server only: a static host has no node, so a page falls back to reading files. Why and how: [doc/architecture.md](doc/architecture.md). Live demo: [the Query page](/framework/ext/Query/).

- `Query.js` (node and browser) — `new Query(spec).run(items)` gives `{ rows, total, totals, offset }`. Ops: `eq in gte lte contains`.
- `QueryServer.mjs` (node) — `QueryServer.source(name, { load, items, on, unload_after })`, and the socket plugin that answers `rpc:query` and pushes `query_row` / `query_stale`.
- `QueryClient.js` (browser) — `new QueryClient("sessions", { row, stale }).ask(spec)`.
- `check.mjs` — `node check.mjs`: the assertions.

First user: the [Sessions page](/framework/ai/sessions/) (remote mode is opt-in at [`?source=node`](/framework/ai/sessions/?source=node) until it matches the files view: buckets, nesting, provider; gaps in doc/architecture.md). A node-side Page: [core/Page/doc/server.md](/framework/core/Page/doc/server.md). Numbers: [code/performance/doc/server-query.md](/framework/code/performance/doc/server-query.md).

## Watch out

- A query is data, never code: no function is ever sent to node.
- `totals` cover ALL matches, not just the page.
- A server with no source answers `{ error: "no source" }` (a worktree dev server has no session index): the caller must fall back.
