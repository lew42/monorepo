verdict: pass
1. [note] A GET is never marked as it starts (Servex/Servex.js:1582), so if a blocking call is a GET, the gap is not preceded by a `req>` line. It is only named afterwards, by `req<`. The brief's "neither rules both out" is therefore true only for POSTs and item calls. Read the `req<` line after a gap as well as the lines before it, or drop `req>` for every method except static files.
2. [note] `res.on("finish")` (Servex/Servex.js:1584) does not fire when the client gives up first. A poll like `/api/processes` that hangs for 60 s and is then abandoned leaves no `req<` line. Listening on `"close"` covers both cases.
3. [note] `item>` names the start of a call, not the moment it blocks (Servex/agents/page_tools.js:924). An item call that awaits and then blocks in a later synchronous step shows its `item>` line well before the gap, with other lines in between. The `item<` time after the gap still names it.
4. [note] If `delta` is a string, `Object.keys` lists every character index (page_tools.js:923), which writes one very long crumb. The call is refused a line later anyway. Capping the key list (for example `.slice(0, 8)`) keeps the line short.

## Requirements
- 1 "An HTTP request that is not a GET drops `req>` as it starts, and any request slower than 1 s drops `req<` with its time": yes. The middleware at Servex/Servex.js:1579–1585 is registered first on the new app, before the static handlers and the router, so it sees every route.
- 2 "Each item call drops `item>` (path, delta keys, caller) as it starts, and `item<` with its time if it took over 1 s": yes. Servex/agents/page_tools.js:921–927 sits on `run_item`, which every agent tool path and `POST /api/item` (Servex.js:683) go through. The crumb is written before the first await, and `finally` covers both throws and refusals.
- 3 "Crumbs now puts itself on `globalThis.__crumbs`, so callers need no import": yes. Crumbs.js:35 sets the class. The only other reader is the guard on the same line, which still works because the class is truthy. No caller imports Crumbs.js, so tests stay clean.
- 4 "Breadcrumbs only, no behaviour change": yes. Both hooks are no-ops when Crumbs is not installed (`crumbs?.drop`). `drop` swallows its own errors, and `next()` and the return value are untouched.
- 5 Done when "the next heartbeat gap is preceded by a `req>` or `item>` line": this cannot be checked from the diff because it needs a Servex restart and a real gap. The instrumentation can name the call, with the GET caveat in finding 1.
- Class page: n/a. No class is added or changed in shape.

## Words
- The comments are plain, say why, and give the date of the gaps: yes.
- The crumb tags `req>`/`req<` and `item>`/`item<` match the brief's names: yes.

Simpler way: none worth taking. Two small hooks at the two choke points (the express app and `run_item`) are already the minimum.
