Budget: $15

# Sign-in demo: ad funnel stats

Load the `minion` skill first. The ask comes from the cloud voice chat (voice-app). The owner wants to spend a few hundred dollars on ads that point at `/join/`, then count the sign-ups. So every step of `/join/` gets counted, and an admin page shows the counts.

Read first: [public/join/readme.md](/join/readme.md) (the page and its states), [worker/readme.md](/worker/readme.md) ("Sign-in, sessions and push", deploy), `worker/index.js` (the `ROUTES` table and `route()`), and `worker/migrations/0002_sessions_push.sql`. The previous phase's record: [../signin-demo/requirements.md](../signin-demo/requirements.md).

## Deliverables (each one is checked)

1. **`POST /api/join/event`** (action `public`). Body `{v, e, inapp, os, src, camp, content}`. It inserts one row in a new D1 table through migration `worker/migrations/0003_join_events.sql`, one row per event: `join_events(at INTEGER, visitor TEXT, event TEXT, inapp TEXT, os TEXT, utm_source TEXT, utm_campaign TEXT, utm_content TEXT)`, with an index on `(event, at)`.
   - `v` is a random visitor id the page keeps in `localStorage` (16 hex characters; the server checks the pattern).
   - `e` must be one of: view, video_unmuted, tap_google, signed_in, tap_allow, ios_sheet_shown, subscribed, test_push, inapp_card_shown, copy_link, share, not_working, signed_out, deleted. Anything else gets a 400.
   - `os` is ios, android or desktop. `inapp` is the in-app browser's name from `ux/Auth/InAppBrowser`, or empty.
   - Each utm value is cut to 64 characters, and so is `inapp`.
   - **No personal data:** no user id, IP, user agent or email is stored. Deleting an account therefore needs no change to this table.
   - **Rate limit:** add a Workers Rate Limiting binding `JOIN_RL` in `worker/wrangler.jsonc` (staging and local), keyed by `cf-connecting-ip`, about 60 a minute. The IP is used for the check and never stored. If the binding is absent, skip the check. As a second cap, which needs no binding, a visitor id that already has 300 rows in the last 24 hours gets a 429.
   - The answer is `204` with no body.
2. **The page sends the events.** Make a small class `public/join/Funnel.js`, plus its test `Funnel.test.mjs`. On the first load it reads `utm_source`, `utm_campaign` and `utm_content` from the URL and keeps them in `sessionStorage` for the visit, so a reload or a step after Google still carries them. It keeps the visitor id in `localStorage` and sends each event with `navigator.sendBeacon` (falling back to `fetch` with `keepalive`).
   - Call it at each moment in `Join.js`. `view` is sent once per page load.
   - In mock mode (`Backend.detect()`) it logs to the console and sends nothing.
   - `?debug=1`'s Reset everything also clears the visitor id.
   - The page must never wait on an event or break because of one.
3. **`GET /api/join/stats`** (action `admin`, so an admin or the owner; `ADMIN_EMAIL` makes the owner's first Google sign-in an admin). It answers JSON:
   - for each event, the number of **distinct visitors** for today (UTC), the last 7 days and all time;
   - the same split by `utm_source` (an empty value reads `(none)`) and by in-app versus not;
   - `signed_up_users` (rows in `users` whose provider is `google`, and the same number including `test`) and `active_push_subs` (rows in `push_subs`).
4. **`/join/stats/`** is a standalone page like `/join/`: `public/join/stats/index.html` plus `Stats.js`, reusing `join.css` or a few lines of its own. It shows plain tables with no charts:
   - first, the funnel in step order, with today, 7 days and all time;
   - then one table per split;
   - then the two totals.
   - A visitor who is not an admin sees one line, "Admins only. Sign in at /join/ with the admin account.", with a link. A failed call shows the real error.
   - It must read well at 390 and at 1920 wide.
5. **Tests.** `worker/api.test.mjs` fails when a route has no assertion, so add assertions for both routes: a bad event gets 400, a good one 204, and stats answers 401 when signed out and 403 for a member. Also add the `Funnel.test.mjs` from item 2.
6. **Deploy to staging and prove it** with `node worker/scripts/deploy.mjs staging`, which applies migration 0003.
   - Then run a headless walk at 390x844 against `https://staging.lew42.com/join/?utm_source=test&utm_campaign=funnel1&test=<key>`. The key is `STAGING_TEST_LOGIN_KEY` in `worker/.dev.vars`; read it into a variable and **never write it to a tracked file or a message**. Walk: view → Test sign-in → Allow → test push. Reuse `$TEMP/forms/walk-persistent.mjs` if it is still there; Chromium needs a persistent context to subscribe.
   - Then prove the rows exist with `npx wrangler d1 execute monorepo-staging --remote --env staging -c worker/wrangler.jsonc --command "SELECT event, utm_source, count(*) FROM join_events GROUP BY 1,2"`. Save the output in this task folder as `staging-rows.txt`.
   - To shoot the stats page, make the test user an admin on **staging only** (`UPDATE users SET role='admin' WHERE handle LIKE 'test-%'`). Shoot `/join/stats/` at 390 and 1920 into `shots/` (gitignored), then put the role back to `member` and say so in the log.
   - The two numbers that must agree: the `tap_allow` count on the stats page equals the `tap_allow` count from the SQL query for `utm_source=test`.
7. **Docs, in the same commit:** add the two routes and the table to `worker/readme.md`, and `Funnel.js` plus the stats page to `public/join/readme.md`. The checklist line (the ad link format) is already written in `../signin-demo/checklist.md`.

## Where it lives (decided)

`worker/index.js` gets the two `ROUTES` rows, with the handlers in a new `worker/join.js` the same way `push.js` and `likes.js` work. On the client: `public/join/Funnel.js` and `public/join/stats/`.

## Rules

- Work in the worktree you were given and commit by exact path after each working step. Do not merge; the mastermind reviews and merges.
- Staging only. Production `lew42.com` is untouched (never `deploy.mjs production`). No secret goes into any file git tracks.
- Never kill or restart the dev server or Servex, never drive the owner's browser tabs, and never `git stash`.
- Findings go in this folder's `task.jsonl` as log lines, through `node .claude/hooks/append.mjs <target> <lines.json>`, each line shaped `{"log":{"at","msg"}}`.
- Done means: every check above has its proof in the log. The last line says the commit hash and the stats URL.
