# Users and auth: what exists (2026-11-25, read-only; every path checked in the main tree)

**Short answer:** yes, there is a user system. It is built, tested and on staging, but real Google sign-in has never run, and nothing stores form answers.

## Exists

| What | Path | State |
|---|---|---|
| One Worker serving `public/` and `/api/*`, route table, `can()` called before every handler | [worker/index.js](/worker/index.js), [worker/can.js](/worker/can.js) | local and staging run; production Worker exists, unused |
| Stateless HMAC cookie `s` (`{uid, te, exp}`, 30 days, `token_epoch` revokes all) | [worker/session.js](/worker/session.js) | live on staging |
| Google ID-token check (RS256, WebCrypto) | [worker/google.js](/worker/google.js), `POST /api/auth/google` | unit-tested; **never run with a real token**: `GOOGLE_CLIENT_ID` is empty on every stage ([worker/readme.md](/worker/readme.md), "Not built yet") |
| D1 `users` (id, provider, provider_id, handle, avatar_url, role, token_epoch, created_at, last_login), `likes`, `pages`, `docs` | [worker/migrations/0001_init.sql](/worker/migrations/0001_init.sql) | migrated on local, staging, prod |
| `UserDO`: one Durable Object per user, own SQLite, key/value settings. Only `theme` and `compact` are allowed | [worker/settings.js](/worker/settings.js), `GET/PUT /api/settings` | live on staging |
| `Room` Durable Object per document (live editing, lock, history) | [worker/room.js](/worker/room.js), [DocStore](/public/framework/core/Item/DocStore.js) | live on staging |
| Dev login (absent from the staging and production bundle) | [worker/dev.js](/worker/dev.js) | local only |
| The auth demo app (Google button, profile, admin list, docs, PWA) | [public/app/](/public/app/readme.md) | local and staging |
| Tests: google, session, can, lock (pure), `api.test.mjs` (every route), ui and live browser tests | [worker/readme.md](/worker/readme.md), "Run it locally" | pass per readme; not re-run here |
| `ux/Auth` and `MagicAuth`: login/signup/reset UI as a class | [public/framework/ux/Auth/readme.md](/public/framework/ux/Auth/readme.md) | a UI shell, calls no API |
| `Server/plugins/Auth.js`: Express session, hardcoded secret `BUNG_HOLE`, a hardcoded Google client id | [Server/plugins/Auth.js](/Server/plugins/Auth.js) | old dev-only; not deployable (called "missing" in [platform/existing](/public/imagine/platform/existing/page.js)). Do not build on it |
| `Server/SessionIdentity.mjs`, [core/Session/doc/identity.md](/public/framework/core/Session/doc/identity.md) | | AI session identity, unrelated to users |

## Decided

- [notes/auth](/public/notes/auth/readme.md): static site stays static ("auth may only add to a page"), no passwords, signed cookie, `token_epoch`, never localStorage, check `Origin`. It picked GitHub; superseded in part below. Its readme links an `identity.md` that does not exist in `public/notes/auth/`.
- [platform/decisions/identity.md](/public/imagine/platform/decisions/identity.md), seven rulings: GitHub + Google with `state` and PKCE; stateless cookie plus a KV ban key; dev login absent from the bundle; `can()` in the router; anonymous reads only; **one `users` row is identity and profile**; no email, password, phone, birthdate or IP stored, deletion is one DELETE per table keyed on `user_id` plus a `token_epoch` bump. Passkeys, Apple, magic link, SMS deferred.
- Built differs from the rulings: Google only (no GitHub); no KV ban key (a ban is a flag in the dev cookie only, per the worker readme).

## Audited

No audit named "users" or "auth" exists in [ai/audits](/public/framework/ai/audits/readme.md) (searched its `index.jsonl`). What did examine it:
- [research/users/verdict.md](/public/imagine/platform/research/users/verdict.md) and [research/security/verdict.md](/public/imagine/platform/research/security/verdict.md): vendor vs DIY (DIY won), passkey enrolment only 25-39% first try on Windows, `Origin` checks, no output sanitising owner yet.
- [platform/existing](/public/imagine/platform/existing/page.js): "Users / auth: missing", before the Worker was built.
- A planning task, `mastermind-user-auth` (2026-11-13, [session.jsonl](/framework/ai/sessions/2026/11/13/spawned/mastermind-user-auth/session.jsonl)), was stopped by the voice app and left no report.

## Missing

1. Real Google sign-in (owner steps 1-3 in the worker readme: OAuth client, `GOOGLE_CLIENT_ID`, `ADMIN_EMAIL`).
2. Any per-user data for forms: `UserDO` rejects every key but `theme` and `compact`; no answers route exists.
3. Ban on staging/production, a ban KV key, GitHub sign-in, account deletion and export routes, CSP/escaping helper.
4. `ux/Form` does not exist yet (plan: [../plan.md](/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/plan.md)); the Google button there mirrors the call and stays a mock.
5. Cloudflare production cutover (lew42.com still serves the assets-only Worker).
