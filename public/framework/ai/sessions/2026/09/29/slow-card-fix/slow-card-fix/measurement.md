# Before / after — the measurement

Method: headless Playwright (CDP `Network.emulateNetworkConditions`), same
live server (`localhost:8137`, real data), same URL
(`/framework/ai2/2026/09/29/experiment-3-models-read-the-dictate-spa/`).

"Before" and "after" are the same server and the same code — the only thing
that changes is the `Accept-Encoding` request header: `identity` simulates
the original uncompressed responses, and the normal browser default gets
gzip, what `Server/compress.js` now answers with.

"Time" is how long until the page's placed markdown (`.page-log-md`, the
thing that was arriving late) is in the DOM. Script: kept in the session
scratchpad, not the repo — the numbers here are the record.

| Network | Before (uncompressed) | After (gzip) | Change |
|---|---|---|---|
| Fast 3G | 23.8s, 3.46MB | 16.7s, 1.60MB | ~30% faster, 54% fewer bytes |
| Wi-Fi-like | 3.1s, 4.25MB | 2.5s, 2.01MB | ~20% faster, 53% fewer bytes |

(An earlier attempt compared the live server against a throwaway worktree
server instead — invalid, because that worktree has no `cards.jsonl`/socket
data of its own and 404s on this route. This table replaces it.)

## What this does and doesn't fix

Compression is real and lands: every response is about half the bytes. It
does **not** make the table appear instantly on a slow connection.

Fast 3G is genuinely slow (1.6 Mbps), and this page also loads about 550
small module files (see the CPU incident below), on top of the compressed
`directory.json`. Shrinking one file can't undo hundreds of requests.

The `priority: "low"` hint on the `directory.json` fetch should help on a
real phone, where the browser picks what to fetch first among real
concurrent requests. It isn't isolated separately in the table above —
that needs two different code versions running side by side, and the only
way tried (a second server) hit the same worktree-data problem noted above.

Reading the actual draw path (`core/Page/Log.js` `draw_placed()` /
`draw_md()`) shows nothing there directly `await`s `directory.json` — the
delay is the browser's connection pool being contended, not a code block.
See `task.jsonl` for that reading, logged as it happened.

## The CPU incident, same day

The first version of `Server/compress.js` called `zlib.createBrotliCompress()`
at brotli's **default quality — 11, the maximum** — fresh on every single
request, never cached. servex-mastermind-opus caught the dev server on
`:3104` at 350–590% CPU with the owner's fans spinning and named the fix.

Measured directly: compressing `directory.json` (3.3MB) at quality 11 costs
**4464ms of CPU**; quality 4 costs **11ms** — about 400x less.

The rewritten `compress.js` also caches the compressed bytes per file (path
+ mtime + encoding), so that cost is paid once per file, ever, not once per
request. 20 repeat fetches of the cached file cost 0.22s CPU total
afterward. Full account in `task.jsonl`.

