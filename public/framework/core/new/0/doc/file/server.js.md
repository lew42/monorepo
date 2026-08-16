# `server.js`

Dev-only. `node server.js` serves `site/` as the web root with a fallback to
the repo's `public/` (so the sketch can still `import` the real
`framework/core/View/View.js`), then falls back further to `site/index.html`
for any extensionless path — the SPA fallback that makes `/docs/intro/` a real
url with nothing but a `page.js` behind it. Port 8200.

## `process.chdir(root)`

`LiveReload` does `chokidar.watch("public")`, a path relative to the process's
working directory. Run this file from anywhere but the repo root and it
watches nothing, silently — this line is the fix, and it's the reason each
tier's server does it.

## Plugin registration is per-subclass

`ZeroServer.use(DevSocket)` is called on `ZeroServer`, not `Server` — `Events`
gives every subclass its own static `_events` list, so this doesn't touch the
main dev server's plugins.

## Improvements

1. **None ranked.** 53 lines, one job, not touched since it was written. Not
   worth re-reading unless the live `Server`/`DevSocket` classes it subclasses
   change shape.
