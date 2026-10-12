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

## Source options `shape` and `arrange`, and what still differs in the Sessions remote mode

`shape(item)` is the join: it runs on every item and every pushed change (the sessions source adds `source`, `claude_usd`, `closed`, `role`, `attention`; class `AISessionSource`). `arrange(hit, spec)` runs after filter and sort, before the page slice, and returns the list to page over (buckets and parent nesting via `AISessionBuckets.arrange`). `total` is the arranged list length (for paging); `matched` is every match.

Remote mode is now the default; `?source=files` forces the files path. The counts agree: 6,363 sessions and $5,028.69 in node against 6,365 and $5,030.41 in files (two live sessions moved between the two loads). The first gap (6,458 / $5,189.57) was the date window: the files path reads the From and To dates as local midnight, node was reading them as UTC, which pulled in about a day's extra edge of sessions; the page now sends local midnight as an ISO time. The default sort puts in-flight rows first in both.

Still different: the routine buckets are classified from each session's `folder`, which node knows for every snapshot but the files path knows for only some (in the proof run 1,258 of 7,720 loaded sessions had no `folder`, so they were never bucketed there); node shows 4,229 prompt-cleaning and 770 short headless against 2,087 and 3,092 in files, with about the same routine total (5,920 against 5,899). Node is the more complete answer. Also: the attention count covers the current matches; `session-flags.json` is loaded when it exists (it did not in the proof tree, so stalled, bloat and hour-cost did not fire in either mode); no role chips row or cache breakdown; the Servex `role` is approximate and live agent state is not joined. Cost of the join: a query over 8,753 sessions through `shape` and `arrange` has a median of 8.8 ms (it was 1.4 ms on raw snapshots).

## Cost: node against the files view (2026-10-12)

On the main site the Claude cost looked $157 apart (node $4,880.74, files $5,037.91). Compared row by row at one moment (same window, 10-01 to 10-12, both views loaded within a minute): the same 6,366 sessions, and exactly one differing cost. The files path had no snapshot for the running mastermind session `87bec773` and fell back to an older figure ($23.81); node had its live snapshot ($53.29). The three sessions only the files path lists are date-path folders with no cost ($0). So node is the right side: the files path only sees the day files and the deltas it received since loading, and a busy session's cost moves between loads. A gap like that is always sessions running right now, and it closes on the next reload. Script: the page's `filter_rows()` against a query with every bucket open (both dumped from a headless page, nothing written).

**Cold start.** The first query waits for the index to load; the client used to give up after 5 s and the page fell back to files. `QueryClient.ask` now takes a `timeout` and the page's first ask waits up to 60 s.
