# The owner's phone is running stale code again: clear the browser's cache on every deploy (you are a mastermind, on Sonnet)

**Evidence (2026-11-02, 19:05Z, the owner's phone, UA `Android 10; K`, run `mvzmprf1ts6`):** the page check shows `Recite.js` with `bytes 0`, body 22,657 (the current file is 39,694), and `Sheet.js` body 33,987 (current: 34,130). Both are pure cache hits, never revalidated. So the thinking cue (in the new `Recite.js`) never runs on the phone. The owner (13:10): "I thought I asked for a little thinking sound… I thought I already asked for that last night."

**What exists:** `Server/SiteGateway.mjs` sends `Clear-Site-Data: "cache"` on a page load from a browser whose `lew42_cache_v` cookie isn't `CACHE_V` (a hand-bumped `"1"`). The phone was cleared once at `"1"`, so it never clears again. All JS is sent with `no-cache`, yet the phone still serves old copies without asking. A likely cause is Android Chrome restoring a discarded tab in cache-preferring mode.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Make `CACHE_V` the deploy version automatically:** the served checkout's `git rev-parse --short HEAD`, refreshed at most every 30 s, never per request. Every merge then clears each browser's HTTP cache once, on its next page load. Cookies, the site key and storage stay. Keep the manual override.
2. **A self-heal for pages loaded from cache:** the gateway injects a tiny inline script into HTML responses. It fetches `/__version` with `cache: "no-store"`. If the version differs from the one the page was served with, it:
   - re-fetches the page's own module URLs (`performance.getEntriesByType("resource")`, same origin, `.js`/`.css`) with `cache: "reload"`, which replaces the stale HTTP cache entries;
   - then reloads once (guarded by `sessionStorage`, so it never loops).

   Keep it small, and log one `src: "recite"`-style trace line (`"stale code healed"`, with the old and new versions) to the Whisper log, so the phone's own log proves it.
3. **Test headless:** seed a stale cached `Recite.js` (an old body cached under `max-age`), load the page, and show that the next load runs the current file. Cover both the cookie path and the self-heal path. Never hit the live Servex (the TestRunner fence).
4. **Document it** in `Servex/ext/remote/doc/tunnel.md` (the cache section). localhost stays untouched.

**Fences:** commit by path; no `python -`. Restart the gateway only if no voice call is live. **Budget:** about $8. Report to vscode-mastermind in 3 lines.

## Change of plan (2026-11-02 13:25, from vscode-mastermind)
Items 1 and 2 above (git-version `CACHE_V`, self-heal script and its "stale code healed" log line) were replaced by: **A** the gateway sends `Cache-Control: no-store` for HTML, JS, CSS and JSON and bumps `CACHE_V` to `"2"` once so `Clear-Site-Data` wipes what is stuck; measure a cold `/framework/` load at 360x740 through the tunnel and put the numbers in `tunnel.md`. **B** (a separate merge, only if A's load is slow, over about 2 s, or the waterfall is big): an import map to versioned `immutable` URLs. Items 3 and 4 stay. The built-and-dropped design is commit `70770dd3f` on `worktree/cache-version`. The two follow-ups are tasks on this session's `session.jsonl`.
