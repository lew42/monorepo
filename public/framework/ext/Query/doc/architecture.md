# Query: architecture and decisions (2026-10-12)

Plan: [server-query plan](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/plan.md). The ask: node holds the data, the browser receives only the rows it shows.

| Class | Job |
|---|---|
| `Query` | one query as JSON; `run(items)` filters, sorts, slices and adds up |
| `QueryServer` | registry of sources + the socket plugin (`rpc:query`) |
| `QueryServer.Source` | one named source: `load` on the first query, `unload` after `unload_after` idle |
| `QueryClient` | `ask(spec)` over the dev socket; hears `query_row` and `query_stale` |

## Decisions

1. **Data, not code.** The socket already carries `rpc:cmd`; sending a function to eval would widen it. A declarative query is loggable. Ops: `eq in gte lte contains`; `contains` is a case-insensitive substring over `field` or `fields: [...]`. Sort puts nulls last either way.
2. **Load and unload belong to the source.** The sessions source loads by waiting for the index's `ready`, and its data stays (the tailer needs it), so its `unload` is a no-op. A source over a `page.jsonl` would replay it on `load` and drop it on `unload`: [core/Page/doc/server.md](/framework/core/Page/doc/server.md).
3. **Live updates are scoped.** Each socket remembers its last query and the ids it showed. A shown id changing pushes `query_row(qid, row)`; a new match pushes `query_stale(qid)`, at most once a second, and the client asks again.
4. **Stale answers.** A query keeps its `qid` for "next page" and "refresh"; a new filter or sort gets a new one. The Sessions page queues a new filter behind a page still in flight.

## Known gaps in the Sessions remote mode (why it is opt-in, `?source=node`)

Flat rows only: no buckets, no nesting under a parent, no role chips, no "show closed"; `needs attention` counts the flag count only (not session-record alerts). Source shows "VS Code" for every row (the snapshot has no source tag; the files path takes it from `sessions.json` and Servex's agent list). The cost total is every provider; the files path shows Claude only. Closing these means running `AISessionBuckets` and the nesting in node as a step after `Query.run`.
