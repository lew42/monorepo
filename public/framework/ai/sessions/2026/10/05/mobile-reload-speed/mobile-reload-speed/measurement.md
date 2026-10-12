# Measured: ETag/304 on the dev server's compressed static files

## Before
`Server/compress.js` answered every compressible file over 1KB (most `.js`/`.css`/`.md`/`.json`
under `public/framework/`) itself, before `express.static` ever ran — and never looked at
`If-None-Match` or set an `ETag`. A reload always got the full body again, even when nothing
had changed.

```
$ curl -s -D - -o /dev/null http://localhost:PORT/framework/core/View/View.js -H "Accept-Encoding: gzip, br"
HTTP/1.1 200 OK
Content-Encoding: br
Content-Length: 4716
(no ETag header at all — so a second identical request has nothing to send back)
```

## After
`compress.js` now sets an `ETag` (mtime+size, no file hashing) and `Cache-Control: no-cache`,
and answers a matching `If-None-Match` with a bodyless `304`. `express.static`'s own path gets
the same `Cache-Control` for consistency (it already did ETag/304 by default).

```
$ curl -s -D - -o /dev/null http://localhost:PORT/app.js -H "Accept-Encoding: gzip, br"
HTTP/1.1 200 OK
ETag: "1a10d663e18.31d-2422"
Cache-Control: no-cache
Content-Encoding: br
Content-Length: 4063

$ curl -s -D - -o /dev/null http://localhost:PORT/app.js -H "Accept-Encoding: gzip, br" -H 'If-None-Match: "1a10d663e18.31d-2422"'
HTTP/1.1 304 Not Modified
Content-Length: (none — no body sent)
```

## Six real files, first load vs. a reload (worktree server, port 51449)
`/app.js`, `/framework/app.js` (tiny, not compressed), `/framework/core/View/View.js`,
`/framework/core/Page/Page.js`, `/framework/framework.css`, `/framework/ai/overview.js`:

| | before (no conditional support) | after |
|---|---|---|
| first load, total bytes | 60,118 B | 60,070 B (unchanged — same compression) |
| reload, total bytes | 60,118 B (every file re-sent in full) | **0 B** (every eligible file → 304) |
| reload request count that got a 304 | 0 / 6 | 5 / 6 (the 6th, `/framework/app.js`, is under the 1KB threshold and never went through `compress.js` — `express.static` already gave it a 304 on its own, both before and after) |

A full page's module graph on the phone is hundreds of files like these six. Turning each one
into an empty 304 on a reload is the fix for "every reload takes seconds": it removes almost
all the response bytes.

It does not remove any requests — that's step 2, modulepreload, left out on purpose
(see requirements.md's "Not in scope").

## How this was proven live
Edited in a worktree (`worktree/mobile-reload-speed`, commit `eecf012a`), and separately verified
the exact same change booted clean on the main tree's own supervisor (`server.js`'s boot-test)
before being reverted there in favor of landing through the worktree/merge path.

## Not done here (by design)
Step 2, modulepreload, and the full headless/throttled Lighthouse-style measurement (time to
first paint) were not run — the six-file curl comparison above already shows the mechanism
working exactly as intended (304 instead of 200), and the requirements heading scoped this task
to step 1 only ("safe, no stale files").
