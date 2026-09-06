# The first vertical slice

**Ruling in three lines.** The smallest end-to-end slice is a **like** — one D1 row, written by a
signed-in user, keyed on a page's url — because it is the only thing small enough to prove the
whole path and still be a real write. It lives in the platform program
([`/imagine/platform/like.js`](/imagine/platform/like.js)), not in the framework, until a second
program wants it. The room proved the Durable Object write path on 2026-09-04; this proves the
**D1** one, which is a different store with different rules. Run it:
[the recipe](/framework/ai/2026-09-06/platform-slice/run/); see it: [MVP](/imagine/platform/mvp/).

---

## §33 — the first vertical slice

| | |
|---|---|
| **Decision** | Which single feature is built first to prove identity → API → database → screen, and where its code lives |
| **Problem** | [`data.md`](./data/) phase 2 says "a Worker + D1 the day a stranger must write (identity, likes)" and stops there. [MVP](/imagine/platform/mvp/) lists ten steps and **never mentions a like at all** — its first write (step 5) is a room, which was built on 2026-09-04 against a Durable Object's own SQLite, not D1. So the D1 write path — the one every later feature (reputation, membership, moderation) actually sits on — had never been run |
| **Options** | **(a)** the room, again, but persisting to D1 · **(b)** a like: one row, one primary key, one count · **(c)** a comment: a row plus authorship, escaping and moderation · **(d)** nothing new — declare the room sufficient |
| **Recommended** | **(b)**, a like |
| **Why** | It is the smallest write that is still a *real* write, and [`/notes/auth/`](/notes/auth/) §4 already specifies the table down to its primary key, so the slice argues about nothing. (c) drags in output sanitisation, which [identity.md](./identity/) says ships *with* the first user-rendered markdown — a whole second decision. (d) is false comfort: a DO's SQLite is a single-writer store inside one object, and D1 is a shared database with foreign keys and a different failure surface — the difference bit within an hour (ruling 3) |
| **Advantages** | Zero new tables beyond §4's own · zero new npm dependencies · the count is `COUNT(*)`, so there is no cache to invalidate and nothing that can disagree with the rows · one like per user per page is a **database constraint**, not an `if` |
| **Disadvantages** | It proves the write path, not the *read-at-scale* path — a page with a thousand likes still runs the same two queries. And it earns nobody anything: [`/notes/auth/`](/notes/auth/) §5 refuses to award points for likes until page authorship is modelled, and that stands |
| **Security** | The one mutation is refused for anonymous callers by the router's `can()`, and refused again when a browser says the request came from somewhere else (ruling 2). No new secret exists — the harness's session secret is a named non-secret in `worker/session.js` and never leaves local config |
| **Cost** | **$0.** Two indexed queries per view, one write per click. D1 bills **scanned** rows, and `likes_url` plus the primary key mean neither query ever scans the table ([data](../research/data/verdict/)'s 127.6B-row warning is exactly this failure) |
| **Scalability** | The count query is `COUNT(*)` over one index. When a page's count is hot enough to matter the answer is a cached column rebuilt from `likes` — [`/notes/auth/`](/notes/auth/) §5's own words, "a cache that can be rebuilt, never the source" — and nothing here has to change for that to be added |
| **Complexity** | Two functions (`worker/likes.js`), one route, one button. No state, no re-render, no framework |
| **Migration/reversibility** | Every way additive. The table is §4's verbatim, so a real deploy applies the same file. The button is one import; deleting it deletes the feature. **Not reversible:** a page rename orphans its likes — §4 accepts this openly, and a `redirects` table is not worth building until a rename actually happens |
| **NOT doing yet** | Points, badges or any number derived from likes (§5) · likes on anything that is not a page · undo history · a "who liked this" list, which is personal data and a whole privacy question · anonymous likes, which [identity.md](./identity/) ruling 5 already excluded |

## The five rulings

**1 · The like button lives in the program, not the framework.**
[`/notes/auth/`](/notes/auth/) §7 sketches it at `framework/ext/auth/like.js`. It is at
[`/imagine/platform/like.js`](/imagine/platform/like.js) instead. `/imagine/` is where this
platform is being *designed*, and a framework `ext/` is a promise to everyone who imports it —
this button has exactly one caller and its API is still moving. It becomes `ext/auth/` the day a
second program wants it, which is a file move and one import path, not a rewrite.

⚠ **§7's own sketch has a bug, and it is the framework's most common one.** It reads
`const $n = span.c("like-count", count)` on the line *after* an `await` — and the capturing
context is restored at the first `await`, so that span lands somewhere else and nothing throws
(CLAUDE.md's first trap). `like.js` builds nothing after an await: it places the button
synchronously and fills it from a callback. **The sketch in `/notes/auth/` should be corrected**
— it is prior art people will copy.

**2 · A mutation is refused when a browser says it came from somewhere else — and allowed when
nothing says anything.** [identity.md](./identity/)'s Security row asks for
`Origin`/`Sec-Fetch-Site` on every mutation, because `SameSite=Lax` still rides a cross-site GET.
It does not say what to do when neither header is present, and that case is most of the traffic
that is not a browser: `curl`, the recipe, a test script. **`Sec-Fetch-Site` present and not
`same-origin` → 403; absent → allowed.** The threat is a browser being steered by somebody
else's page, and a browser always sends the header. A caller that sends nothing is not that
caller, and refusing it would only mean the recipe could not be tested from a terminal. A real
deploy adds the `Origin` check beside this one — belt and braces, and free.

**3 · `worker/seed.sql` is an upsert, and likes survive a restart.**
[local-dev.md](./local-dev/) specified "`DROP TABLE` first, then five fake users". That became
impossible the moment `likes` existed: **D1 enforces foreign keys**, so `DELETE FROM users` fails
with `SQLITE_CONSTRAINT_FOREIGNKEY` as soon as one like references a user — and `dev.mjs` re-runs
the seed on every start, so *the second `npm run dev` after anybody liked anything would have
died before the harness came up.* Verified, then fixed: the seed is now
`INSERT … ON CONFLICT (id) DO UPDATE`, idempotent with likes present.

The fix buys the better behaviour anyway, so it is a decision and not just a repair: **a like
outlives a restart.** That is the whole felt difference between a D1 row and a browser's
`store()`, and the harness is not worth much if it forgets everything each morning.
`token_epoch` and `created_at` are deliberately excluded from the update — bumping `token_epoch`
is how [`/notes/auth/`](/notes/auth/) §3 revokes every session, and a plain restart must never do
that.

**4 · `can(user, action)` keeps two arguments.** [identity.md](./identity/) ruling 4 specifies
`can(user, action, url)`, and the url is available at the call site. It is still not passed,
because **no role's answer depends on it yet**: rows 3 and 4 (topic founder, moderator) are the
path-scoped ones, and this harness has no topic ownership to scope against, which `worker/can.js`
already says in its own comment. A third argument that nothing reads is a signature that lies to
the next reader. Adding a parameter breaks no caller, so the day founder scoping is real, ruling
4 lands then — in the same commit as the thing that needs it.

**5 · The like proves the write path; it does not make the site need a server.** The button
renders, and the page renders, with no Worker anywhere — verified against plain `node server.js`,
six assertions, zero page errors. It shows a dash and disables itself. That is
[MVP](/imagine/platform/mvp/) step 4's acceptance test — *"turn the Worker off, browse the site,
and every page still renders"* — held to for the first feature that could have broken it, which
is the only time such a rule is ever actually tested.

## What this record does not answer

- **Where the like button belongs on a page.** It is in the topic's rail and in each channel
  today because that is where the four nouns meet. A house-wide convention (every page? only
  pages that opt in?) is a design question nobody has asked yet.
- **What a like is *for*.** [`/notes/auth/`](/notes/auth/) §5 is firm that it awards nothing
  until page authorship exists, and [community](../research/community/verdict/)'s reputation runs
  off an action log, not off likes. So today it is a count, honestly, and the two records above
  are the reason.
- **Real sign-in.** GitHub OAuth, `state` and PKCE, [identity.md](./identity/) ruling 1 — none of
  it is built. Everything above sits on five seeded rows and a dev-only url.

Written 2026-09-06 ([the run](/framework/ai/2026-09-06/platform-slice/)).
