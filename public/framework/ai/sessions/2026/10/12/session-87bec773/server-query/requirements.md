# Server-side query: node holds the data in memory, the client asks over the socket (mastermind brief)

**Owner (2026-10-12, dictated):** pages like Sessions are sluggish because the browser loads everything, processes it, subscribes to thousands of things and renders. That has to run smoothly on a phone too. Idea:
- load reasonable data sets (a few MB) into **node's memory**;
- add a **query API over the socket server**, even a plain loop running a function over the items;
- the client receives only what it shows.

This is dev-side (the AI sessions), not production: the file system stays the robust, simple data store.

## Design questions (decide, record the alternative)
1. **Server-side Page instances:** the same Page class loads in the client and in node. The client must **not** auto-load everything. On a query, the server triggers a **full load** (all items instantiated), runs the query, and unloads after an idle timeout.
2. **Full-load safety:** fine for pages under about 1,000 items. Sessions (5,000–8,000+ files) could bog down the dev server, so make it async and chunked, or use the [session buckets](../perf-system/requirements.md) index instead. Measure the load time and memory.
3. **Is node faster than the browser?** Measure the same query both ways, but the main win is client load: transfer, memory, subscriptions, render. Measure the Sessions page client cost before and after.
4. **Live updates:** the server pushes only changes to the rows a client is showing (stream, CLAUDE.md), not 5,000 subscriptions.

## Done when (tick each with proof)
- [ ] Past work (`past-work` skill): earlier "instantiate pages server side" talk, the socket server, `page_read` (it computes page state in node already?), `Page.Reader`, the session buckets, `server-perf`.
- [ ] `plan.md` and an architecture section in **the Page docs**: where Page is instantiated server-side, when it fully loads, and when it unloads. Document it in the Page class's own docs.
- [ ] Smallest slice: a socket `query` for Sessions (filter, sort, page of N, totals), the grid asking for it, the browser holding only the visible rows. Before and after: transfer KB, JS heap, long tasks, time to first row, on desktop and 400 px mobile.
- [ ] Add it to `code/performance/` docs.
- [ ] Coordinate with @mastermind-data-grid (the grid's data source) and @mastermind-perf-system.
- [ ] Smoke clean; a Servex or dev-server restart proven on a private port; commit each step; merge.

Opus 5.5 for design, Sonnet to build; keep your context under 100k. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
