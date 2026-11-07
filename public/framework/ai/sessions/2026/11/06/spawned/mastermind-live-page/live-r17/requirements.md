# Session page: its tasks appear, start and close live

Relayed by @voice-app, 2026-11-06: task `session-live-view` in [voice-app's session](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/). Branch: `worktree/live-r17`.

## What the page showed

[The session page](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/) already draws the tasks: In flight, Waiting on you and Next at the top (`InFlightView`), the Tasks tab (`SessionTasks`), both fed by a live tail of `session.jsonl`. Shot: [shots/sess-before.png](shots/sess-before.png). **But nothing moved without a reload:** a task started or closed while the page was open stayed as it was for 25 s.

## Why

The new line did reach the page over the socket ([shots/frames.mjs](shots/frames.mjs)), but no reader took it. The page is slow to load (8–18 s), so the server's answer to each subscribe came after `JSONL.live()`'s 1.5 s wait (10 "no answer from the dev server" warnings at 2.3 s and 9.3 s: [shots/warn.mjs](shots/warn.mjs)). On that timeout `ext/JSONL/live.js` fetched the file once and **dropped the reader**, so it never streamed again. This hits any slow page that streams, not only sessions.

## Fix

- [x] **The reader stays subscribed after the fallback fetch** ([ext/JSONL/live.js](/framework/ext/JSONL/live.js), `stream()` and `fallback()`). When the late answer comes, the server's lines replace the fetched copy (reset, then one read, the same path as a rewritten file), and the reader streams from there. Clients still never compute an offset ([doc/live.md](/framework/ext/JSONL/doc/live.md), updated).
- **Proof**, with the wait forced to 1 ms so every stream takes the fallback ([shots/sessfix.mjs](shots/sessfix.mjs)): old live.js, a new running task never showed in 15 s ([shots/before.txt](shots/before.txt)); new live.js, it showed in 1 s and left In flight 1 s after it was completed ([shots/after.txt](shots/after.txt)). Nothing doubles: a normal and a forced load both read "11 of 25 done", 8 rows ([shots/dup.mjs](shots/dup.mjs)).
- **Decision:** fix the stream, not the page. The brief asked for LivePage's header, breadcrumb and gear; those are the separate `livepage-into-page` task (not started, per the brief). The live tail was the missing feature, and it now works for every page.
  - Alternative: a raised wait (say 10 s). It hides the race on today's pages but breaks again on a slower one, and a stale board for 10 s is worse.
- **Left:** the session page takes 8–18 s to load; filed as an improvement in ai/AISession.
