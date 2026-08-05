# Auth, accounts and teams — design record

**Nothing here is built.** This is the thinking, written down before any of it is,
so the expensive decisions get argued while they're still cheap.

Format as everywhere: **question → options → weighing → verdict.**

---

## 1. The collision, stated first

`CLAUDE.md`, core constraints, do not violate:

> **Static compatibility.** Production is pure static hosting. **Nothing may
> depend on server-side logic at runtime.**

Auth is server-side logic at runtime. There is no way to have accounts without a
server, so this constraint is about to be edited — and it is worth editing
*deliberately* rather than discovering later that it quietly stopped being true.

**Verdict: narrow the constraint rather than delete it.**

> The **site** is static. The **API** is not. Every page must render, and every
> link must work, with the API returning 500 to every request.

That is not a slogan; it is a testable property, and it should have a test. It
buys three things that matter more than they sound:

- The docs never go down because auth did.
- `node server.js` keeps working with no D1, no secrets, no wrangler login.
- A contributor can run the whole site without an account.

The rule that enforces it: **auth may only ever *add* to a page.** A like button
appears when signed in; a page that fails to fetch likes renders without them. No
`content()` anywhere awaits the API before rendering — which the framework already
makes natural, because capture is synchronous and async content appends into a
container that was placed first.

---

## 2. Identity: don't store passwords

**Options.**

| | cost |
|---|---|
| (a) email + password in D1 | password hashing, reset flow, email delivery, breach liability, verification — the largest surface here by far |
| (b) **GitHub OAuth** | one redirect, one token exchange, zero credentials stored |
| (c) Google OAuth | same shape, wrong audience |
| (d) Passkeys / WebAuthn | best security, most client code, worst fallback story |
| (e) Cloudflare Access | free and excellent — but it gates the *whole site* behind a login, which is the opposite of what a public docs site wants |

**Verdict: (b) GitHub OAuth.** The audience is literally developers whose code is
on GitHub, the repo is on GitHub, and it eliminates the entire password surface:
no hashing, no reset email, no verification, no "forgot password", no breach
exposure. It also gives an avatar and a display name for free, which the team UI
needs anyway.

The honest cost: **it excludes anyone without a GitHub account**, which is fine
for an internal dev site and would not be for a public product. If that changes,
add a second provider — the `users` table below already anticipates it with
`(provider, provider_id)` rather than a bare `github_id`.

---

## 3. Session: signed cookie, stateless first

**Options.** (a) A `sessions` table in D1, random token, lookup per request.
(b) A signed stateless cookie — HMAC-SHA256 over `user_id|expiry`, verified with
WebCrypto (present in Workers, no dependency).

**Weighing.** (a) gives instant revocation and costs a D1 read on **every**
request. (b) costs nothing to verify and cannot be revoked before expiry.

**Verdict: (b), with a short expiry and a refresh.** 30-day cookie, re-signed on
use. Revocation is the one thing it can't do, and the mitigation is a
`users.token_epoch` integer included in the signed payload — bump it and every
existing cookie for that user is invalid. One column, no per-request read, and
"log out everywhere" still works.

```
Set-Cookie: s=<base64url payload>.<hmac>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

`HttpOnly` so no script can read it, `SameSite=Lax` so a cross-site POST can't
use it. **Also check `Origin` on every mutating request** — belt and braces, and
one line.

**Never put the session in `localStorage`.** It's readable by any XSS, and this
site renders markdown from files, which is an HTML-injection surface by design.

---

## 4. Schema

Small on purpose. Every table below earns its place; nothing is speculative.

```sql
CREATE TABLE users (
    id           INTEGER PRIMARY KEY,
    provider     TEXT NOT NULL,            -- 'github' — a second provider is additive
    provider_id  TEXT NOT NULL,
    handle       TEXT NOT NULL,
    avatar_url   TEXT,
    token_epoch  INTEGER NOT NULL DEFAULT 0,   -- bump to invalidate every session
    created_at   INTEGER NOT NULL,
    UNIQUE (provider, provider_id)
);

CREATE TABLE likes (
    user_id    INTEGER NOT NULL REFERENCES users(id),
    url        TEXT    NOT NULL,           -- the page's url, the same string Page.url gives
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, url)             -- one like per user per page, enforced by the PK
);
CREATE INDEX likes_url ON likes(url);

CREATE TABLE teams (
    id         INTEGER PRIMARY KEY,
    slug       TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE team_members (
    team_id INTEGER NOT NULL REFERENCES teams(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role    TEXT NOT NULL DEFAULT 'member',   -- 'owner' | 'member'
    PRIMARY KEY (team_id, user_id)
);
```

**Note what is absent: a `points` column.** See §5.

**`likes.url` is a url, not a page id.** There is no page table and there should
not be one — pages are files, the filesystem is the registry, and a `pages` table
would be a second source of truth that drifts every time someone renames a
directory. The cost is real and accepted: **renaming a page orphans its likes.**
A `redirects` table would fix it and is not worth building until a rename happens.

---

## 5. Points are derived, never stored

**The tempting version:** `users.points INTEGER`, incremented on like.

**Why not.** It is a cache with no invalidation story. Delete a like, delete a
user, revoke a self-like, fix a bug that awarded double — every one of those needs
a compensating decrement, and the first one that's missed leaves a number nobody
can explain and nobody dares recompute.

```sql
SELECT count(*) FROM likes l
  JOIN pages_owned_by(?) ...   -- or simply: likes received on urls you authored
```

**Verdict: compute it.** At this scale the query is microseconds, and *the number
is always right by construction* — which is worth more than the query it saves.
Materialise into a `user_points` table only when a measurement says to, and then
as a **cache that can be rebuilt from `likes`**, never as the source.

**Gaming, and the two rules that matter:**

- **One like per user per page** — enforced by the primary key, not by
  application code. A constraint the database holds cannot be forgotten.
- **You cannot earn points from your own page.** This needs page authorship,
  which the site does not currently model. **Simplest honest answer: don't award
  points for likes at all at first — just show counts.** Points need an ownership
  model, ownership needs a `page_authors` mapping, and that is a real feature, not
  a column. Ship likes, watch what people do, then decide.

---

## 6. Teams — the part that is genuinely undecided

Membership mechanics, ranked by how much UI each needs:

| | flow | UI needed |
|---|---|---|
| (a) **invite link** | owner generates a url, anyone with it joins | one button, one page |
| (b) owner adds by handle | owner types a GitHub handle | a search field + autocomplete |
| (c) request → approve | user asks, owner approves | a pending queue, notifications |

**Verdict for v1: (a), and only (a).** An invite link is one signed token with an
expiry — the same HMAC helper the session already needs, so it costs no new
machinery. (b) needs user search, which needs a user directory, which is a privacy
decision nobody has made. (c) needs notifications, which is a whole subsystem.

**The UX question that actually matters is not membership, it's *what a team is
for*.** A team with no purpose is a settings page nobody visits. Before building
any of this, answer: does a team **own** pages? **share** a points total?
**appear** on a leaderboard? Each answer implies a different schema, and building
membership first means building it blind.

**Recommendation: don't build teams until that question has an answer.** The
schema above is sketched so it's ready, not because it should be next.

---

## 7. How it fits the framework

```
public/framework/ext/auth/       opt-in, like every ext. Core never imports it.
    auth.js                      session state + fetch helpers
    like.js                      the button
    page.js  readme.md           because a module isn't done without them
worker/                          the API. NOT under public/ — it is not an asset.
    index.js                     /api/* routing
    session.js                   HMAC sign/verify
    schema.sql
```

`wrangler.jsonc` gains a `main` and a D1 binding; `assets` keeps serving `public/`
exactly as now, and the Worker only ever sees what doesn't match a file.

**The `worker/` directory must not live under `public/`.** `public/` is the deploy
artifact and a static host serves by path — a secret-handling file there would be
readable. Same reasoning as `Server/`.

### The interesting bit: reactivity, without any

A like button needs a count that changes. React's answer is state plus a
re-render. This framework has neither, and does not need them:

```js
// ext/auth/like.js — the whole idea
export function like(url){
    return button.c("like", async ($btn) => {
        const { count, mine } = await auth.likes(url);   // container placed first
        const $n = span.c("like-count", count);
        $btn.tc("mine", mine).click(async function(){
            const next = await auth.toggle(url);
            $n.text(next.count);                         // hold the view, set the text
            this.tc("mine", next.mine);
        });
    });
}
```

**You hold the view and call a method on it.** No diffing, no keys, no
dependency array, no stale-closure footgun — and no re-render, so nothing else on
the page can be disturbed by a like. That is the strongest argument this feature
makes for the framework, and it is worth building partly *because* it makes it.

The one real constraint it must respect: **`$btn`'s callback is `async`, so it
appends explicitly to `$btn`** rather than relying on the ambient captor, which is
long gone by the first `await`. The container was placed synchronously; the
contents arrive later. That is the shape, and it is the same shape `md.file()` uses.

---

## 8. Cost, honestly

- **A second runtime.** Today `node server.js` is the entire dev story. Auth adds
  wrangler, a D1 binding and a secret to run the *full* site locally — so the
  degradation rule in §1 is what keeps `node server.js` useful, and it must be
  tested, not assumed.
- **The first thing in this repo that can leak data.** Everything so far is public
  by construction.
- **`package.json` gains nothing** — Workers ship WebCrypto and a D1 client. That
  should be held to: an auth library would be the fourth dependency and the first
  one that runs in production.

---

## 9. If only one thing gets built

**Sign-in, and a `handle` in the corner.** No likes, no points, no teams.

It proves the whole chain end-to-end — OAuth redirect, cookie, Worker, D1, and
the ext loading in the client — against the smallest possible surface, and it is
the part every later feature depends on. Likes are an afternoon once that works,
and points and teams should wait for §5 and §6 to have answers.
