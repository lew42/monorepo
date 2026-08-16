# `server.js`

Dev-only, port 8100. Subclasses the repo's real `Server` and overrides exactly
two things: `initialize_express()` (serve `site/` first, then `public/`, then
fall back to `site/index.html`) and `listen()` (default port). `DevSocket` is
registered on `StarterServer`, not `Server`, so the main dev server's plugin
list is untouched — same pattern as the other two tiers' servers.

## `process.chdir(root)`

Required because `LiveReload` watches `"public"` relative to the working
directory; running this file from elsewhere would silently watch nothing.

## Improvements

1. **None ranked.** 59 lines, mirrors the other two tiers' servers closely
   enough that a bug found in one is worth checking in all three.
