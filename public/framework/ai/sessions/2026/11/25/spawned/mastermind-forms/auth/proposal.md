# Proposal: per-user forms on the existing Worker (nothing built, nothing deployed)

## MVP (about 4 small steps, no new service, no new auth system)

1. **Sign-in: Continue with Google, using what exists.** The framework's `ux/Auth` sign-in block (plan: `GoogleButton.js`) posts the Google ID token to the existing `POST /api/auth/google`. The Worker verifies it ([google.js](/worker/google.js)), upserts the `users` row and sets the `s` cookie. The owner's three steps (OAuth client id, `GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`) are the only blocker; test on staging, since Google rejects `*.localhost`. Locally, the existing dev login stands in. Passkeys later, as an extra `provider` row (identity ruling 1).
2. **Session: unchanged.** The stateless HMAC cookie, `GET /api/me` says who is signed in. A form calls it first; anonymous means the form still works and keeps answers in the page only (static-site rule: auth only adds).
3. **User record: unchanged.** The D1 `users` row is the identity and the profile (ruling 6); no email column (ruling 7).
4. **Answers: one record per user per form, in the user's own `UserDO`.** That Durable Object already exists, is named `user:<id>`, is reached only after the router authenticates, and has its own SQLite. Add one table and two routes; keep `theme/compact` as they are.
   - Table: `answers(form TEXT PRIMARY KEY, json TEXT NOT NULL, updated INTEGER NOT NULL)`, added as the next step in the `STEPS` list ([dostorage.js](/worker/dostorage.js) migrates lazily).
   - Record (the spec's "Answer stored" column, keyed by question id): `{"form":"checkin-1","v":1,"submitted":null,"answers":{"q1":true,"q2":-1,"q3":["space","ai"],"q4":"calm"}}`. T18 long text stores `{"text":"…","tags":{"sentiment":-1,"themes":["audio"]}}` once the AI step exists. `submitted` is an ISO time once the user finishes.
   - Routes (rows in the `ROUTES` table, `can` action `write`, so a signed-in member only): `GET /api/answers?form=<id>` and `PUT /api/answers` `{form, answers, submitted?}`. The handler reads `user.id` from the cookie, never from the body, so one user cannot read or write another's record. Validate: form id pattern, JSON size cap (for example 32 KB), known question ids only if the form definition is supplied. `api.test.mjs` already fails if a route has no assertion.
5. **How a `Form` uses it** (names are proposals; the kit is not built):
   ```js
   const form = new Form({ id: "checkin-1", questions });
   await form.bind(user);        // user from GET /api/me; fills each Answer from GET /api/answers
   form.on("change", () => form.answers.save());   // debounced PUT /api/answers
   await form.submit();          // answers.save({ submitted: true })
   ```
   `form.bind(null)` (anonymous) skips both calls. `Answer.value` and `Answer.shape` from the plan already define each value; `answers.save()` is one `fetch` with `credentials: "same-origin"`, the same way `public/app/app.js` calls `/api/settings`. A "custom experience" is the form definition plus this user's stored answers (for example, skip questions already answered).
6. **Cloudflare vs local.** Locally: `node dev.mjs`, or Servex serves `/api/*` through `monorepo-api` ([worker/readme.md](/worker/readme.md)) with the dev login and a local D1 and Durable Object file. Staging (`staging.lew42.com`) runs the Worker with real Google sign-in. Production cutover stays a separate owner decision.
7. **Privacy and deletion.** Answers live in the user's own object and nowhere else; no email, IP or birth date (ruling 7). Add `DELETE /api/answers?form=` and `DELETE /api/me`: delete the `users` row, `likes`, the whole `UserDO` (`ctx.storage.deleteAll()`), bump `token_epoch`. Export is `GET /api/me/export` walking the same places. Say in the form footer what is stored. Aggregates ("how others answered") are a later step: copy a de-identified value (no user id) into a `results` table in D1 at submit, so deleting a user needs no scan.

## Why this shape

It adds one table and two routes to code that already has authentication, authorization, tests and a per-user store. A second auth system, a vendor, or a `Server/plugins/Auth.js` extension would all be a second system.

## Alternatives

| Option | Why not first |
|---|---|
| Answers as rows in D1 `answers(user_id, form, qid, value)` | Better for cross-user analytics, worse for "this user's whole record" and deletion; do it as the later `results` copy |
| Store in `settings` | Whitelist is `theme`/`compact`; widening it mixes preferences with answers |
| Item/`Item.Store` over a Room per user | Live sync across devices for free, but every form edit becomes a doc history; use if two-device editing matters |
| Hosted auth (Clerk, Supabase) | Rejected in [identity.md](/public/imagine/platform/decisions/identity.md) |
| Cloudflare Access | Gates the whole site, no self-registration |
| Passkeys now | 25-39% first-try enrolment on Windows; additive later |
| GitHub sign-in | Rulings name it, audience for forms is not developers; Google first as the brief says |

## Later: a live connection per user (not built)

**What exists:** the Worker already runs live WebSockets through the `Room` Durable Object ([worker/room.js](/worker/room.js)). There is one Room per page chat (`GET /api/room?url=`) and one per document (`GET /api/doc/<id>/ws`). Each document has a single-editor lock, its own JSONL history and an R2 snapshot. So the pattern is one Durable Object per shared thing, with one socket for each open thing.

**How a user's own connection would attach:** through a route `GET /api/me/ws`, guarded `read` like `/api/me`. The cookie's user id picks that user's `UserDO` ([worker/settings.js](/worker/settings.js)), which accepts the socket with hibernation. That object pushes what belongs to the user and not to a document: settings changes, a new sign-in on another device, a sign-out (the sessions row ended), an invite to a document. Documents stay in their Rooms, so a tab holds one user socket plus one socket per open document. Merging both onto one socket is the alternative; it wins only if a phone ends up holding many documents open at once. Delete account already wipes `UserDO`, so it would close the socket too.

## Open (decided here, revisable)

Single record per form per user (no history); overwrite on resubmit; 32 KB cap; `v` field versions the shape. The owner's Google console steps are the one thing agents cannot do.
