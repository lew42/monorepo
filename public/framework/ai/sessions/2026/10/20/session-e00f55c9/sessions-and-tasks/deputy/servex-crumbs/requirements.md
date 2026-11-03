# Servex: name the call that blocks the event loop for 75 s

**What is wrong:** Servex writes a heartbeat line to `crumbs.log` every 5 s (`Servex/Crumbs.js`). On 2026-10-24 it stopped for 72–88 s, six times in 20 minutes (03:08:59, 03:16:35, 03:22:18, 03:24:36, 03:26:51, 03:30:11 UTC).

**What that cost:** during each gap every route and every agent tool call waits. The session page's cost tile took 74 s to fill, and `/api/processes` sat unanswered for 60 s.

**What is known:**
- The session summary that the cost tile asks for (`POST /api/item {summary:{}}`) answers in 0.06–0.2 s from curl, and in 3.5 s cold in a separate process.
- One curl call took 73 s, but only because it landed inside a gap.
- Nothing logged so far names what holds the loop: `crumbs.log` records child-process calls and watchers, not requests or item calls.

**The change:** breadcrumbs only, no behaviour change.
- An HTTP request that is not a GET drops `req>` as it starts, and any request slower than 1 s drops `req<` with its time.
- Each item call drops `item>` (path, delta keys, caller) as it starts, and `item<` with its time if it took over 1 s. Agents call the item tool in-process, never through a route.
- Crumbs now puts itself on `globalThis.__crumbs`, so callers need no import. Importing it installs the hooks, which tests must not do.

**Done when:** after a Servex restart, the next heartbeat gap is preceded by a `req>` or `item>` line naming the call, or by neither, which rules both out.
