# Sign-in demo, part 1: the Worker API, web push and the staging deploy

Budget: $14. Load the `minion` skill first. You work alone; spawn no one.

Card: /framework/ai/2026/11/25/sign-in-demo-video-landing-google-weekly/

## Read first

- **The ask:** [../brief.md](../brief.md) (decisions 1, 2, 3, 6 and 8 are yours).
- **The plan:** [../plan.md](../plan.md). Its API contract table is the deliverable, and the other builder codes the `/join/` page against it.
- **The Worker:** `worker/readme.md` in full, then `worker/index.js`, `session.js`, `google.js`, `can.js` and `migrations/0001_init.sql`.

## Where

- **The worktree:** `C:/Code/lew42/worktrees/qf-1` (branch `worktree/qf-1`). Work and commit only there, by exact path, after each working step.
- **Your fence:** `worker/**` and this folder.
- **The other builder** edits `public/join/**` and `public/framework/ux/Auth/**` in the same worktree. Don't touch those.

## Do

1. **The client id.** Set `GOOGLE_CLIENT_ID` to `722949407087-g0kagkteln7gifhndpifetv5j2prn5a9.apps.googleusercontent.com` for the local and staging stages in `worker/wrangler.jsonc`. Leave production empty.
2. **Migration `0002`:**
   - `sessions` (id, user_id, created_at, ended_at, user_agent);
   - `push_subs` (endpoint PRIMARY KEY, user_id, p256dh, auth, created_at), with an index on user_id.
   - The cookie carries the session id. A session whose row is ended or missing reads as signed out.
   - Keep the cookies that already exist working, or make them fail cleanly to "signed out".
3. **Routes**, exactly as in the plan's table, through `ROUTES` and `can.js`:
   - `POST /api/auth/logout` (reuse one if it exists);
   - `DELETE /api/me`: it wipes the D1 user, sessions, push_subs and the UserDO's storage (`deleteAll`), and clears the cookie;
   - `GET /api/push/key`, or `vapid_public` in `/api/config`;
   - `POST /api/push/subscribe` and `DELETE /api/push/subscribe`;
   - `POST /api/push/test`;
   - `/api/me` gains `push` and `session_id`.
4. **`worker/push.js`:** Web Push with Web Crypto only, no npm package.
   - The VAPID JWT is ES256, `aud` is the endpoint's origin and `sub` is `https://staging.lew42.com`.
   - The payload is encrypted with RFC 8291 aes128gcm; send TTL and `Urgency: normal`.
   - A 404 or 410 from the push service deletes that subscription.
   - Add `push.test.mjs`: generate a subscriber key pair in node, encrypt, decrypt it back with the RFC 8291 steps, and assert the text matches. Keep it under 1 s.
5. **`worker/scripts/vapid.mjs`:** it makes a P-256 key pair once.
   - Store it with `wrangler secret put` for staging (`VAPID_PRIVATE_JWK`, `VAPID_PUBLIC`), or through `deploy.mjs --secret`.
   - Also write it to `worker/.dev.vars`, which is gitignored; check that it is.
   - Never put a key in a tracked file.
6. **The cron:** `triggers.crons ["0 16 * * 1"]` on staging, and a `scheduled()` handler.
   - It sends `{title: "lew42", body: PUSH_WEEKLY_TEXT, url: PUSH_WEEKLY_URL}` to every row of push_subs.
   - Defaults: "New this week: watch part 2" and `/join/`.
   - Log one line with the sent, failed and removed counts.
7. **Tests:** the existing worker tests still pass (`node --test worker/*.test.mjs`, or however the readme runs them). Add a lean test for the new routes where the existing tests show how.
8. **Deploy staging** from the worktree: `node worker/scripts/deploy.mjs staging`, which applies the migrations and sets the secrets.
   - Check `https://staging.lew42.com/api/config`: it has the client id and vapid_public.
   - Check that `/api/me` answers.
   - Check `POST /api/push/test` with a cookie minted the way `worker/scripts/latency.mjs` mints one, for a fake user with a real subscription if you can make one. If you can't, the encryption round-trip test is the proof; say so.
   - Deploy again when the join builder's page is ready, if mastermind-forms asks.
9. **Docs:** `worker/readme.md` gets the new routes, tables, secrets, cron and the client id. Move "Real Google sign-in has never run" to the true state.

## Done when

- [ ] The commits are on `worktree/qf-1` and staging answers the new routes.
- [ ] Each step's result is a `log` line in this folder's task log.
- [ ] You send mastermind-forms 5 lines: what is live, the test results, and what is unproven (real delivery to a phone).

## Never

- Touch production, create Cloudflare or Google accounts, or commit a secret.
- Kill or restart the dev server or Servex, or drive the owner's browser tabs.
- Use git's stash, or push.
