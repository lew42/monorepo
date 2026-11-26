verdict: fix
1. [fix] At 390 the stats page scrolls sideways: shots/stats-390.png is 462 px wide, and the in-app table runs to x≈462 (the funnel table already ends at ≈395, past the 374 px content box). The cause is `public/join/stats/stats.css:416`, where `table.wrap { display: table; }` cancels the `display: block; overflow-x: auto` on line 415, so no table can scroll inside itself. Requirement 4 says "must read well at 390".
2. [fix] The per-visitor 300-rows cap at `worker/join.js:508` filters `WHERE visitor = ? AND at > ?`, but the only index is `(event, at)` (`worker/migrations/0003_join_events.sql:13`). So every beacon scans the whole table, and rows read grow with the square of ad traffic. Add `CREATE INDEX … ON join_events(visitor, at)` in a new `0004` migration (0003 has shipped to staging, so don't edit it).
3. [fix] The new index files are left uncommitted in worktree/qf-2: `public/join/stats/files.jsonl` is untracked and `public/join/files.jsonl` is modified. Law 10 says the new folder must be indexed in its parent, in the commit.
4. [note] The funnel table starts with an empty column: `Stats.js:338-340` passes `this.head("")` and adds an empty `td` to every row. In shots/stats-390.png that blank column takes about 30 px of a narrow screen. Drop the column from the funnel table.
5. [note] Counts are left-aligned in the funnel and split tables but right-aligned in Totals (`stats.css:418` vs `:421`). At 1920 (shots/stats-1920.png) each table stretches to 1100 px, so a number sits ≈400 px from its step name, and the three tables' columns don't line up. Right-align the counts with `td.num`, and cap the table width (or use `width: auto`).
6. [note] The worker readme row (`worker/readme.md`, the `POST /api/join/event` row) says `e` must be "one of Funnel.js's own list". The list actually lives in `worker/join.js` `EVENTS`, and Funnel.js has no list. The same row's link label `public/join/stats/` points at `../public/join/readme.md`.
7. [note] `Funnel.reset()` (`public/join/Funnel.js:60`) is never called. `Join.reset()` (`Join.js:309`) already clears every `join-` key from both stores, but the Funnel.js docblock (line 15) says Reset everything calls `Funnel.reset()`. Either call it there or delete it, and fix the comment.
8. [note] No shot shows the non-admin state ("Admins only. Sign in at /join/ …"), and the closing log line says "denied-state … shot". Only the two admin shots exist, so that line of requirement 4 is unproven, though `Stats.js:314-317` reads right.
9. [note] If `navigator.sendBeacon` throws (older Chromium refuses a Blob whose type isn't CORS-safelisted, such as `application/json`), the `catch {}` at `Funnel.js:57` swallows the error and the `fetch` fallback never runs. Sending `text/plain`, or calling `fetch` inside the catch, makes the fallback real. The staging walk shows the beacon works in current Chromium.

## Requirements
- 1 "POST /api/join/event … one row per event … 400 / 204 … rate limit … no personal data" — yes — `worker/join.js`, migration 0003, `JOIN_RL` in local + staging (`wrangler.jsonc`), 300/24h cap; staging-rows.txt shows the rows. The cap lacks an index (finding 2)
- 2 "The page sends the events" (Funnel.js + test, utm in sessionStorage, visitor id in localStorage, beacon/keepalive, mock logs, reset clears id, never waits) — yes — `Funnel.js`, `Funnel.test.mjs`, all 14 events wired in `Join.js`; the reset works through the `join-` sweep (finding 7)
- 3 "GET /api/join/stats" (distinct visitors today/7d/all, split by utm_source with `(none)` and in-app, signed_up_users, active_push_subs) — yes — `join.js:518-559`; shots/stats-1920.png shows every part
- 4 "/join/stats/ … plain tables … read well at 390 and 1920; non-admin line; real error" — partly — the tables and their order are right, but 390 overflows (finding 1) and the denied state isn't shot (finding 8)
- 5 "Tests: api.test.mjs assertions for both routes; Funnel.test.mjs" — yes — `api.test.mjs:435-443` (400 ×2, 204, 401, 403, 200 + content); the log reports 22/22 routes
- 6 "Deploy to staging and prove it … tap_allow on stats equals SQL for utm_source=test" — yes — staging-rows.txt `tap_allow test 2`; shots/stats-1920.png "By ad: test / tap_allow 2"; the log says the role was reverted to member
- 7 "Docs, in the same commit" — yes, in a separate docs commit (5d8a16aaa1). Fine for review, but one row is wrong (finding 6)
- Class with live instances page — n/a — Funnel and Stats hold no state worth watching beyond what /join/stats/ shows
## Page structure
- page 1 (title says what it is) — yes — shots/stats-1920.png: "Funnel: /join/"
- page 2 (most important first) — yes — the funnel, then the splits, then the totals, as asked
## Navigation
- page 13 — none (a single standalone page, one link back to /join/ in the denied state)
## Layout
- one column, content-width cap — yes — `.stats { max-width: 1100px }`, shots/stats-1920.png centred
- columns line up across tables — no — shots/stats-1920.png: Step and count columns sit at different x in each table (finding 5)
## Sizing
- fits the viewport at 390 — no — shots/stats-390.png is 462 px wide (finding 1)
- at 1920, size suits the content — no — the tables stretch to 1100 px for 5 short columns (finding 5)
## Wrapping
- unwanted wraps — no wraps; `white-space: nowrap` forces overflow instead (finding 1)
## Spacing and padding
- band rhythm — yes — not measured (no layout.json); shots show an even 20 px gap before each h2
- wasted space — no — the empty first column of the funnel table (finding 4)
## Colour and contrast
- text contrast — yes — white on #0b0b0d; headers at 0.7 opacity are still readable in both shots
## Flow
- reading order matches importance — yes — funnel → by ad → in-app → totals
## Words
- plain, owner's words — yes — "By ad (utm_source)", "In-app browser vs not", "Signed-up users (Google + test)"; the denied line matches the brief verbatim
- event names shown raw (`tap_google`, `inapp_card_shown`) — acceptable for an admin page; a note at most
