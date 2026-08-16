The pre-`task.jsonl` fallback: fetches `session.json` beside the page (or at
`this.src`, for a dynamically-routed task — see [`src`](/framework/ext/AITask/api/src/)).

⚠ **The SPA fallback answers a miss with `index.html`, HTTP 200.** A bare
`res.ok` check would treat a missing file as a hit and try to parse the
fallback document as JSON. The content-type check
(`!headers.get("content-type")?.includes("html")`) is the only way to tell a
real miss from the SPA's catch-all — the same guard `dashboard.js`, `feed.js`
and `replay.js` each carry independently for their own fetches.

Every legacy task without a `task.jsonl` pays one console 404 for this probe
— `AITask.session()` calls it blind, unlike `dashboard.js`, which checks the
directory listing first and only fetches the file that's actually there.
