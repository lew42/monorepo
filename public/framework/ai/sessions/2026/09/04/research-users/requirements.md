# research-users — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/users/`. Task dir: this one.

**The question (your log's seed line):** What identity, session and authorization model fits a public product on Cloudflare, testable locally?

## Start from (read before searching)

- `public/notes/auth/readme.md` — the existing design record: GitHub OAuth, HMAC-signed stateless cookie with `token_epoch`, the D1 schema, "auth may only ever add to a page", `worker/` outside `public/`, zero dependencies. Its audience was an internal dev site; this brief is a public product. Challenge every verdict for the new audience and keep what survives.
- `Server/plugins/Auth.js` — what the dev server already calls "Auth". Say what it is in one entry.
- The brief §9, §10, §27, §28 (in `../mastermind-platform/requirements.md`).

## Questions — a closed list

1. **Providers for a public audience.** Google, Apple (required on iOS if any social login is offered — verify the rule), GitHub, email magic link, passkeys (WebAuthn verification on Workers without a dependency?), phone. Which set for the MVP; the verification burden of each; what each leaks about the user.
2. **Build vs buy.** DIY on Workers (OAuth code flow + WebCrypto; the auth note's zero-dependency stance) · libraries (Better Auth, Auth.js, Arctic/oslo, Lucia's successor guides) · hosted (Clerk, Auth0, Supabase Auth, Firebase Auth, WorkOS, Stytch; Cloudflare Access is a no — say why in one line). Price at 1k / 10k / 100k MAU, lock-in, what breaks the static-site rule. Recommend.
3. **Sessions.** Stateless signed cookie + epoch vs a D1 sessions table vs a DO session store: revocation latency (bans must work now), logout-everywhere, cookie flags, CSRF/Origin checks, cookie size; and whether the API shares the assets' origin (`/api/*` via `run_worker_first`) so the cookie is first-party.
4. **Authorization.** Global roles (owner, admin, staff) · topic-scoped roles (topic owner, moderator, member, guest) · capability checks. Where policy lives (a `can(user, action, topic)` in the Worker; the client only hides). Leave the hook for reputation/level gates (the community topic owns those).
5. **Anonymous participation.** Pseudonymous device-bound identity (a signed anonymous id), "Anonymous — Level 5 JavaScript": can a level + topic combination deanonymize; rate limiting (Turnstile, per-ip, per-anon-id); upgrading an anonymous identity into an account without losing progress; permanent vs session-scoped.
6. **Multiple profiles per user.** What it costs (every query keyed by profile), who needs it (a creator with a brand?), whether the MVP wants it — recommend whether `profile_id` is distinct from `user_id` from day one.
7. **Local development.** Fake users, a dev-only `?as=alice` switch or a dev identity provider under `wrangler dev`, seeded D1, multi-tab multi-user, testing the anonymous path, Playwright with several contexts. Concrete: the files and commands.
8. **Legal minimum.** GDPR/CCPA deletion and export, age (COPPA 13), data minimization — what the users table must NOT hold.
9. **Profiles and settings** — D1 rows, R2 avatars, what is public by default.

## Challenge

GitHub-only. A stateless cookie for a product that needs instant bans. Multiple profiles in the MVP. Passkeys-first as a UX bet.

## Numbers to bring back (url + date)

Clerk / Auth0 / Supabase Auth price at 10k MAU; passkey support share of browsers; cookie size limit; D1 reads per request if sessions are table-backed vs zero if signed; Apple's sign-in rule text.
