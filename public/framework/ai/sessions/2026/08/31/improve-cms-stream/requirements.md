# improve-cms-stream — the ask, verbatim

> TASK — improve the CMS + streaming labs: look, brainstorm, build. LOOK first:
> `/imagine/cms/` (thinking/edit/services/json — page.json pages, json+jsonl philosophy:
> jsonl is append-only, the snapshot is json) and `/imagine/stream/` (streaming pages;
> LiveReload/Tail/ext-JSONL, 5ms median). KNOWN FACTS: `Server/plugins/SocketServer/Append.js`
> is written AND wired in server.js (`DevSocket.Socket.use(Append)`) but :80 predates it — a
> PRIVATE server instance WILL load it, so the delta round-trip is provable headlessly even
> though the owner hasn't restarted :80. KNOWN BUG to fix: /imagine/cms/ prose still names a
> deleted `store.js` — correct the prose to what exists now (core's `page.store()`).
>
> BRAINSTORM 8-12 ranked improvements as log lines, then BUILD the top 2-3 S/M. Candidates to
> weigh: **prove the full delta loop live** on the private port (edit page → append
> `{"at","op","path","value"}` to a page.jsonl via Append.js RPC → Tail streams it → the page
> updates without reload; screenshot before/after + measure the latency), a **compaction demo**
> (N deltas + snapshot → one button folds deltas into page.json and truncates — show counts
> before/after; keep it a demo on the json page, never a background process), **page.store()
> wiring** in the edit lab (drafts survive reload), or your own better idea from the look. Data
> and controls, never a new page per state.
>
> FENCE — `public/imagine/cms/**`, `public/imagine/stream/**`, plus ONE guard fix in
> `public/framework/ext/Saver/Saver.js`: its `typeof localStorage` guard fails when localStorage
> THROWS on access (private mode) — wrap the access in try/catch so DevBar restore() stops
> rejecting; smallest possible diff, prove with a probe that fakes a throwing localStorage.
> Server/ files: READ-ONLY (owner restart rule).
>
> VERIFY: every built feature headless-proven on 8098 (paste the measured latency and the
> before/after counts), zero console errors on all cms+stream pages, 400/1920/3440 on changed
> pages, tear the server down. Keepers + `links`.

## Fence note

The `typeof localStorage` guard is in `ext/Saver/LocalStorageSaver.js:5`, not `Saver.js` —
same module, same one-line fix. That file is the one edited.

## Rules held

- Never touch the :80 dev server. A private `PORT=8098 node server.js` is started and torn down.
- `Server/` is read-only.
- Demo data files under `public/imagine/*/data/` are backed up before the probes and restored after.
