# A Page on the server (2026-10-12)

Today a Page lives in the browser: it reads its files and draws. The Sessions page showed the cost: it loaded every day file and index into the browser to show 50 rows. The fix keeps the data in node and sends only the rows shown ([ext/Query](/framework/ext/Query/)).

- **Where it is instantiated:** in the dev server, as a `QueryServer` source (`QueryServer.source("sessions", ...)` in `ai/AISession/AISessionTailer.mjs`). The browser Page stays; its data half is in node.
- **When it fully loads:** on the first `query` for it (`source.load()`), once.
- **When it unloads:** after `unload_after` (default 5 minutes) with no query and nobody watching, `source.unload()` drops it. Sessions has nothing to drop: the session index already holds every snapshot for the tailer, so a second copy is never made.
- **First source:** Sessions. 8,729 snapshots; one query is a median of 1.4 ms ([numbers](/framework/code/performance/doc/server-query.md)).
- **Next:** a source whose `load` replays a `page.jsonl` (the `page_read` path in `Servex/agents/page_tools.js`) and whose `unload` drops the state, so any live page can be queried the same way. Not built.
- **Off the dev server** (production, static): no node, so the page reads its files as before.

Design: [ext/Query/doc/architecture.md](/framework/ext/Query/doc/architecture.md).
