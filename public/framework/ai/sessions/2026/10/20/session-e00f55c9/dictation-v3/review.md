verdict: fix
1. [fix] The heal never fires for a phone that already has the page cached: `stale_cache()` only acts on a 200 (Server/SiteGateway.mjs:68), but the site answers a repeat page load with a 304, because express.static and compress.js both send an ETag and `no-cache` (Server/Server.js:43, Server/compress.js:92). The phone revalidates the HTML, gets a 304, and keeps its stale `Sheet.js`. The simplest fix: for a document request from a browser that hasn't been cleared yet, drop `If-None-Match` and `If-Modified-Since` in `headers()` (Server/SiteGateway.mjs:103) so the site sends a 200.
2. [fix] The test can't catch finding 1: its fake site never sends an ETag and always answers 200 (Server/SiteGateway.cache.test.mjs:15). Step 3 needs a site that answers a matching `If-None-Match` with a 304, the way the real site does.
3. [fix] The task folder doesn't record this work: findings.md doesn't mention the gateway cache fix, there is no sub-task folder or session.jsonl line for it, and the commit sits only on `worktree/gateway-cache` (b2d5ab853). A fresh agent reading dictation-v3/ alone wouldn't know it exists or that it serves priority 1 (read-aloud over monorepo.lew42.com, the phone's old `Sheet.js`). Add a line to findings.md §3 under "On a worktree".
4. [note] `h["cache-control"] ??= "no-cache"` (Server/SiteGateway.mjs:136) mostly does nothing for static files, because Server.js has sent `no-cache` since 2026-10-05. It still covers the fallback routes, so it is harmless. The doc line in tunnel.md:44 could say that the old replies predate that change.
5. [note] Chrome is known to stall the page load for a moment while it handles `Clear-Site-Data: "cache"`. It happens once per browser per `CACHE_V`, so it is acceptable, but the doc should say so, so a slow first load on the phone isn't mistaken for a new bug.

The diff changes no page (Server/ and a doc only), so this review answers Requirements and Words only, and I was given no shots for it. Both tests pass in the worktree: `node Server/SiteGateway.cache.test.mjs` (ALL PASS, 5 of 5) and `node Server/SiteGateway.test.mjs` (ok).

## Requirements
- Priority 1 "Kokoro read-aloud working end to end … over monorepo.lew42.com", the stale-file part — no — the cause is right (a heuristic-cached `Sheet.js`), but the clear depends on a 200 the real site doesn't send on a repeat load (finding 1)
- Priority 1, "find out why first" — yes — the SiteGateway.mjs:24 header comment and tunnel.md:44 name the cause
- "Document as you build" — yes — tunnel.md:44 gives the cause, the mechanism, how to bump `CACHE_V` and the proof command, in the same commit
- V3 asks 1–3, V1 streaming, replies, fast seat, the read-aloud bullets, the echo guard, voice quality, Chatterbox, Servex supervision — n/a
- A class that adds state the owner would watch — n/a (two static fields and one method on SiteGateway, no live instances)
- Can a fresh agent continue from the task folder alone? — no — finding 3

## Words
- content: plain sentences, the takeaway first — yes — tunnel.md:44 opens with what happened (a phone kept an old `Sheet.js`), then the fix
- content: no undefined jargon — yes — "heuristic cache" is explained where it is used
- content: the comments match the code — yes — SiteGateway.mjs:24-27 matches what `stale_cache()` and the response hook do
