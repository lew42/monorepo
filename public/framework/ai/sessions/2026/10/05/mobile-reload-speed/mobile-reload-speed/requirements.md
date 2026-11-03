# Faster reloads on the phone: revalidate + preload

## Why (2026-10-05)
On the phone (http://10.0.0.135:3104/) every reload takes seconds. The network is fine: `/app.js` alone loads instantly on the phone, and the server answers in ~3 ms. The cost is hundreds of module files fetched one import at a time, each a Wi-Fi round trip, and nothing cached between reloads.

## Do (step 1 only; safe, no stale files)
1. **ETag / 304:** the dev server sends an `ETag` (or `Last-Modified`) on every static file with `Cache-Control: no-cache`, and answers a matching `If-None-Match` with **304** (check what Express static already does; it may only need the header policy changed).
2. **modulepreload:** the HTML shell lists the page's module graph up front (`<link rel="modulepreload">`, computed by the server from the import graph it already scans in `server.js`), so the phone fetches in parallel.
3. Measure before/after: a headless load with network throttling (e.g. 20 ms RTT) of /framework/ and /framework/ai/: time to first paint and total, request count, how many 304s on reload.
4. Server change → worktree → merge.mjs → restart the dev server (`restart_server monorepo`); commit anything merge.mjs leaves.
Not in scope: rewriting import URLs with versions (needs the owner's call: close to "no build step").

Budget: $3. Sonnet, ONE agent, short session.
