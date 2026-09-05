# Who a user is, and what they may do

**Ruling in three lines.** Identity is one `users` row and a stateless HMAC cookie — GitHub and
Google, `state` and PKCE, no vendor and no dependency, extending [`/notes/auth/`](/notes/auth/).
A ban is one KV key read on `/api/*` and an instant check inside the room's Durable Object.
Authorization is one function, `can(user, action, url)`, called by the **router** and never by a
handler — and the dev login is not *disabled* in production, it is **absent** from the bundle.
The slice that spends this: [MVP](/imagine/platform/mvp/).

## §33 — the identity, session and authorization model

| | |
|---|---|
| **Decision** | How a person proves who they are, what we store about them, and what each role may do |
| **Problem** | Auth is the first thing here that can leak data, and the audience is public, not the internal dev site [`notes/auth`](/notes/auth/) was written for — it needs a second provider, a ban that lands, and a check a public API cannot be tricked past, all while every page still renders with the API returning 500 ([§1](/notes/auth/)) |
| **Options** | **(a)** a hosted vendor (Clerk, Supabase, Auth0) owns identity, D1 mirrors profiles · **(b)** DIY on Workers: stateless HMAC cookie + one KV ban key + one `can()` · **(c)** DIY with a D1 `sessions` table read every request · **(d)** Cloudflare Access |
| **Recommended** | **(b)** — [users verdict](../research/users/verdict/) §33, upheld with the amendments below |
| **Why** | Price does not decide it at this scale (Clerk free to 50k, Supabase $25/mo to 100k), so control and static-site fit do: a vendor adds a second domain to the login flow and a webhook-sync problem to keep D1 profiles honest ([users verdict](../research/users/verdict/)). (d) gates a *known* list at ~$7 per authenticated user/month with no self-service registration ([users log](../research/users/log.jsonl)) — the opposite shape. (c) buys instant revocation with a cross-region round trip on every request (ruling 2) |
| **Advantages** | Zero dependencies — WebCrypto and D1 are in the runtime, `package.json` gains nothing ([§8](/notes/auth/)) · zero I/O to verify a session · `run_worker_first: ["/api/*"]` means a static page costs no Worker invocation at all ([users log](../research/users/log.jsonl)) |
| **Disadvantages** | A ban lands in ≤60s on the HTTP path, not instantly · a stolen cookie is valid until `token_epoch` bumps — [security](../research/security/verdict/)'s rank-1 case, and **no verdict owns output sanitisation**, so this one says it: a CSP and one escaping helper ship *with* the first user-rendered markdown, not after · one row per user means no brand identity until teams exist |
| **Security** | `state` + PKCE on both OAuth flows — the users verdict names neither ([security](../research/security/verdict/), established ×2) · `Origin`/`Sec-Fetch-Site` on every mutation, since `SameSite=Lax` still rides a cross-site GET · never `localStorage` ([§3](/notes/auth/)) · the dev login absent from the bundle (ruling 3) |
| **Cost** | **$0** at MVP. A KV read per API call is near-free; D1 is $0.001 per million rows read, 5M/day free. No seat fee, no MAU meter |
| **Scalability** | The cookie verifies with no I/O, so authenticated reads scale like the static tier. What bites first is the Durable Object's ~500–1,000 req/s per url ([data.md](./data.md)), not identity |
| **Complexity** | One table, one cookie, one KV key convention, one `can()` — smaller than a sessions table plus its indexes plus a revocation path |
| **Migration/reversibility** | Additive every way: a provider is a row (`UNIQUE (provider, provider_id)`) · a sessions table can arrive later without changing the cookie format · `profiles` can be seeded `id = users.id`, so a later split moves no rows (ruling 6). **Not reversible:** provider ids already stored, and any column that has ever held personal data |
| **NOT doing yet** | Passkeys, Apple, SMS, magic link · anonymous **writes** · multiple profiles and switching · per-device revoke, a sessions table, an audit trail · R2 avatar upload · any role scope finer than a topic's url prefix · production impersonation |

## The seven rulings

**1 · Providers: GitHub + Google, both with `state` and PKCE. Magic link, Apple, passkeys and SMS
deferred.** GitHub is the audience and the existing design ([`notes/auth` §2](/notes/auth/));
Google is the same code flow with no new machinery, and it answers that record's own honest cost —
GitHub-only *"would not be [fine] for a public product."* I drop magic link from the
[users verdict](../research/users/verdict/)'s *Providers* line: it alone adds an email vendor, an
email column, and a failure that verdict never mentions — corporate scanners pre-click and burn
single-use links ([security](../research/security/verdict/), established) — and its stated driver
was Apple 4.8, which binds App Store submissions, and there is no app. Passkeys stay deferred on
the verdict's own number: 25–39% first-try enrollment on Windows.

**2 · Session: the stateless cookie stays; a ban is one KV `banned:<user_id>` read per `/api/*`
call — and the room bans itself instantly.** [Users §33](../research/users/verdict/) (c), upheld.
**The deciding number is latency, not cost:** a sessions read is $0.001 per million rows with
5M/day free, so cost was never the trade-off — but D1 is single-region until read replication,
which [data.md](./data.md) explicitly defers, and unreplicated cross-region reads measured 1,800ms
cumulative against 78ms replicated ([users log](../research/users/log.jsonl)). A sessions table
buys ≤60s of ban latency by putting that round trip in front of every authenticated request, on a
platform that already deferred the fix for it. **And the raid case is not on this path:**
[security](../research/security/verdict/) is right that the KV ban and the per-colo rate limiter
fail together under a coordinated raid — but a raid happens in a live room, and a room is one
Durable Object keyed by url ([data.md](./data.md)): a single strongly-consistent writer holding its
own ban list, refusing the next message with **no propagation window at all**.

**3 · The dev login is absent from the deployed bundle. The var and the hostname are not the
fence.** [Security §33](../research/security/verdict/) is **upheld against**
[local-dev.md](./local-dev.md)'s "var + hostname, both" — with one amendment: I take security's
option **(c)**, not its recommended (d), because (d)'s `loopback()` half cannot be built. Its own
*Disadvantages* row says so — the edge has no local peer address — and a check that *looks* like
`loopback()` without being one is worse than none, because it stops the next reader asking. On
Workers the hostname is `new URL(request.url).hostname`, read from the `Host` header: a value the
caller writes, the same class of thing as the `Origin` header that left `rpc:cmd` LAN-exploitable
until 2026-08-16. The guard that held there was the peer address, *"the one field a caller cannot
choose"* (`Server/readme.md`), and the edge has no equivalent. So:

- `/api/dev/*` lives in `worker/dev.js`, imported only by the `main` of `wrangler.dev.jsonc`.
  `worker/index.js` — the production `main` — never imports it. There is nothing to disable.
- Keep `DEV_LOGIN` **and** the hostname check inside `dev.js` anyway: two lines, and they are what
  stops a `cloudflared` tunnel or `wrangler dev --remote` from publishing the dev bundle. Belt, not
  fence — and wrangler once shipped a version that ignored `--ip localhost` and bound the wildcard
  anyway ([security log](../research/security/log.jsonl)), so the belt earns its keep.
- **Prove it:** `npx wrangler deploy --dry-run --outdir=.build`, then grep the bundle for
  `/api/dev/` — one line in CI, the testable property [`notes/auth` §1](/notes/auth/) already asks
  for ("that is not a slogan… it should have a test").
- Today a fourth guard is the strongest of all: production has no Worker.

**4 · Authorization: `can(user, action, url)`, called by the router.** The third argument is the
**url**, not a topic — overruling the users verdict's `can(user, action, topic)`, because
[data.md](./data.md) has since made the url the key of every live surface, and it is the string
`likes.url` already stores ([`notes/auth` §4](/notes/auth/): *"there is no page table and there
should not be one"*). That also closes the High-severity break
[security](../research/security/verdict/) opened against the cloudflare verdict: the DO-sharding
conflict was unresolved when that pass ran, and is now decided.

| # | who | may |
|---|---|---|
| 1 | **owner** (platform) | everything — every override logged exactly like a mod action ([community](../research/community/verdict/)) |
| 2 | **admin** | every moderation action on any url; not billing, not granting roles |
| 3 | **topic founder** | every moderation action on urls under their topic's path; a removal is a *hide*, never a hard delete (ruling 7) |
| 4 | **moderator** | the founder's actions minus appointing moderators and topic settings, same path scope |
| 5 | **member** | create anywhere they can read; edit and delete only rows whose `author_id` is theirs |
| 6 | **anonymous** (`user === null`) | read; write nothing (ruling 5) |

The **router** calls `can()`, not the handler: every `/api/*` route declares its action and is
refused before dispatch, so there is **no call site to forget** — BOLA's usual failure is one
unchecked route, not a flawed function ([security](../research/security/verdict/), OWASP), and the
test that proves it walks every route and asserts an anonymous caller gets 403. **The reputation
hook** is one map, action → minimum level, consulted inside `can()`; at launch it holds exactly one
entry, `topic.suggest` ([community](../research/community/verdict/)). Level is derived live from
the action log, never stored ([`notes/auth` §5](/notes/auth/)) — and it raises the price of abuse,
it does not prevent it: a Sybil account costs about a Turnstile solve, ~$3/1,000 at 88–91%.

**5 · Anonymous: reads in, writes out.** Anonymous reading is already load-bearing and free — every
page renders with no cookie and the API at 500, and it is the sixth row of the
[local-dev](./local-dev.md) harness. Anonymous **writing** leaves the MVP, against the users
verdict's cut order which protects it to last: it lands the weakest primitive on day one, because
Cloudflare's own rate limiter says key on a user id and warns against IP — and an anonymous id is
neither ([security](../research/security/verdict/)). What is decided now so it stays additive:
**every UGC row carries `author_id → users.id` from the first write**, so an anonymous participant
later gets a real row minted at first write and upgrading is one `UPDATE`, not a re-key of every
table ([users log](../research/users/log.jsonl)). When it ships, the UI says *session-scoped
privacy* in those words, and a level shows as a band, never a precise number or timestamp beside
it — level × topic × timing re-identifies in a small topic, and the mainstream answer is to
coarsen, not remove.

**6 · No `profile_id`. One `users` row is the identity and the profile.** Overrules the users
verdict's *"split profile_id from user_id in schema now"* — its own cut list ranks that split third
to cut, and a table with exactly one row per user is the second source of truth
[`notes/auth` §4](/notes/auth/) already refused when it rejected a `pages` table. The retrofit it
fears is cheap *here* precisely because nothing is built: create `profiles` seeded `id = users.id`
and no row moves. The real multi-profile shape, when a creator needs it, is many people acting as
one identity — Google's Brand Account ([users log](../research/users/log.jsonl)) — which is the
`teams`/`team_members` pair [§6](/notes/auth/) already sketched and deferred with a reason. Public
versus private is two serializers, not a field flag that can be forgotten.

**7 · The users table is [`notes/auth` §4](/notes/auth/) unchanged, and it holds no email.**
`id, provider, provider_id, handle, avatar_url, token_epoch, created_at` — the provider hands back
the handle and avatar for free. **Never:** a password, a phone, a birthdate (asking one opens a
COPPA branch the moment an answer comes back under 13 — [users log](../research/users/log.jsonl)),
an IP joined to the profile, or an email — the one place email is genuinely needed is a billing
receipt, and Stripe holds that; we store `stripe_customer_id` and nothing else ([data.md](./data.md)).
**Deletion** is one `DELETE` per table keyed on `user_id`, a `token_epoch` bump, and a CDN purge
**in the same handler**, because nothing purges an edge automatically when a row disappears
([security](../research/security/verdict/)) — and **the reputation/action log is one of those
tables**, which closes the seam security found open between [data §33](./data.md) and
[community §33](../research/community/verdict/). **Export** is the same walk, read-only. A
moderator's removal is a *hide* (`removed_at`, `removed_by`); only erasure is a `DELETE` — which
gives a vindictive founder's mass-delete a per-topic undo without touching the erasure rule, where
D1 Time Travel could only restore the whole database or nothing.

## Left open — the owner's calls, not more research

- **Is ≤60s acceptable for an HTTP-path ban?** The users verdict left it a `question` and no source
  settles it. Falsifiable by a simulated-raid load test before launch, not by more reading.
- **A CSP and an escaping helper** for user-rendered markdown — security's rank-1 case, owned by no
  verdict. It belongs to whoever ships the first user-written content.
- **Apple 4.8** closes only with a real App Review submission, and only if an iOS app is ever built.
