# `server.js`

Dev-only, port 8300. Identical shape to the other two tiers' servers: serves
`site/` first, falls back to the repo's `public/`, then to `site/index.html`
for any extensionless path; `process.chdir(root)` so `LiveReload`'s
`chokidar.watch("public")` resolves; `DevSocket` registered on `OneServer`
specifically, not the base `Server` class.

## Improvements

1. **None ranked.** Boilerplate shared with `0/server.js` and
   `starter/server.js` almost line for line — if one gets a real fix, check
   the other two.
