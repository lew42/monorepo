# Thinking

Where the data should live, honestly weighed for **this** repo — which is a no-build static
site whose whole deploy is `git push`.

## The verdict, in three lines

1. **Keep git files as the default.** Markdown for prose, JSON for records, JSONL for logs.
   It is the only option that is offline, versioned, diffable, reviewable and zero-infrastructure
   at once — and this repo already runs on it.
2. **Add `node:sqlite` when you need a query, not a file.** It is built into the Node you already
   have (verified below), costs no dependency, and is dev-server-only — so production stays static.
3. **Reach for Cloudflare D1 only when a *visitor* must write.** That is the real line. The moment
   a browser that is not yours saves something, you need a server, and D1 behind a Worker is the
   cheapest good one. Until then it buys nothing and costs a runtime.

**No lock-in means committing to the interface, not the backend.** Section *The seam* is the
actual recommendation; everything above it is why.

## The matrix

| | offline | versioned | diffable | queries | concurrent writes | needs a server | in repo today |
|---|---|---|---|---|---|---|---|
| **Markdown files** | yes | git | **excellent** | no | no | no | yes — `Page.file()` |
| **JSON files** | yes | git | poor for prose | no | last-write-wins | to *write* | yes — `ext/Saver` |
| **JSONL** | yes | git | **excellent** | no | **append is safe** | to *write* | yes — `ext/JSONL` |
| **`node:sqlite`** | yes | no (binary) | no | **yes** | yes (WAL) | dev only | no |
| **D1** | yes, locally | no | no | **yes** | yes | **yes, a Worker** | no |
| **Durable Objects** | yes, locally | no | no | yes (SQLite DO) | **serialized** | **yes** | no |
| **KV** | yes, locally | no | no | no | no | **yes** | no |
| **R2** | yes, locally | no | n/a | no | n/a | **yes** | no |

Read the *versioned* and *diffable* columns first. They are the two things you already have and
would be giving up, and they are worth more than they look: a content bug is `git log`, a bad
edit is `git revert`, and review is a pull request. No database gives you that for free.

## Git-based JSON and JSONL — the current house pattern

**Where it is strong.** Content is a file next to the page that draws it. `git diff` is the audit
log, `git revert` is the undo, and a branch is a staging environment. It works on a plane with no
process running at all, because reading a file is just a fetch of a static asset.

**Where it strains, precisely:**

- **JSON is a bad container for prose.** `"body": "# Hi\n\nA paragraph…"` collapses a whole article
  onto one line, so a two-word fix shows up as a whole-file diff. That is why the slice here writes
  **markdown**, not JSON — one paragraph changed is one line changed.
- **Concurrent writes are last-write-wins.** Two tabs saving the same JSON file lose one of them
  silently. JSONL does not have this problem, because appending is the only operation.
- **There are no queries.** "Every post tagged *css*, newest first" means fetching all of them and
  filtering in the browser. Fine at 50 records, wrong at 5,000.
- **Size.** Every save is a new blob in git history forever. Prose is nothing; a 4 MB image saved
  ten times is 40 MB of repository you cannot get back.

**Verdict: this is the right default and should stay the default.** The strains are all real and
none of them is hit by a personal site's page content. A tags index is a build-time JSON file, not
a reason for a database.

## `node:sqlite` — the free one

**Verified on this machine, just now:**

```
node v24.15.0
exports: DatabaseSync, StatementSync, Session, constants, backup
roundtrip: [{"k":"hello","v":"world"}]
```

`require("node:sqlite")` works with **zero npm dependencies** — it ships inside Node, and on Node 24
it is stable (Node 22 emitted an `ExperimentalWarning`; this one does not). So the "no new
dependency" law is satisfied outright.

**What it is genuinely for here:** the dev server growing a real query. A full-text search over every
page. An index of links between docs. The AI task board answering "every task in the `pages` group
across six weeks" without reading 40 JSONL files. It is the *reading* layer over git files, not a
replacement for them.

**The shape that keeps it honest:** the database is a **derived artifact**, gitignored, rebuilt from
the files by a script. Files stay the source of truth; SQLite is a cache you can delete. The moment
the database holds something the files do not, you have quietly moved your content into a binary
blob that `git diff` cannot show you — which is exactly the lock-in you said you did not want.

**What it cannot do:** production is static, so a deployed page cannot query it. Dev only.

## Cloudflare D1

Serverless SQLite. The important finding is that **the local story is genuinely good**:

- `wrangler dev` runs local by default, on Miniflare driving the same `workerd` runtime as
  production. Cloudflare's docs say local development "does not require a Cloudflare account or
  network connection".
  ([workers/development-testing](https://developers.cloudflare.com/workers/development-testing/))
- Local state persists in **`.wrangler/state/v3/`** in the project dir, D1 under `d1/`.
  ([local-data](https://developers.cloudflare.com/workers/development-testing/local-data/))
  *Partly verified:* that the leaf file is a plain `.sqlite` any tool can open is true in practice
  and repeated in Cloudflare's own corpus, but I could not find it on a rendered docs page.
- `npx wrangler d1 execute DB --local --file=./seed.sql` seeds it. There is **no** `d1 import`.
  ([import-export](https://developers.cloudflare.com/d1/best-practices/import-export-data/))
- Free tier: 500 MB per database, 10 databases, 5M rows read and 100k written per day. GA, not beta.
  ([limits](https://developers.cloudflare.com/d1/platform/limits/))

**So the plane is not the objection.** You can develop against D1 offline, and the local database is
a file you can back up into git as a `.sql` dump.

**The real objection is one line in the docs:** a browser cannot safely talk to D1. The REST API
authenticates with an **account-scoped** token, and Cloudflare says it "is best suited for
administrative use" — their own tutorial puts a proxy Worker in front of it.
([build-an-api-to-access-d1](https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/))
Ship that token to the page and every visitor can drop every database on your account.

**Therefore D1 implies a Worker, and a Worker is a server.** That is the thing to be clear-eyed
about: "production is static" is a constraint you would be trading away, not one D1 preserves.
The trade is worth it for exactly one class of feature — **writes by someone who is not you**:
comments, form submissions, a contact form, a shared draft. Not for your own page content.

**Cost of the Worker itself is low.** `npx wrangler` needs nothing in `package.json`, a Worker can
be a single plain ES module deployed with `--no-bundle`, and Workers Builds runs `wrangler deploy`
from a git push with the build command left empty — so the no-build law survives, and the deploy
stays git-only. One push ships the static files *and* the Worker together.
([static-assets](https://developers.cloudflare.com/workers/static-assets/),
[builds/configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/))
Start new projects on **Workers**, not Pages — Cloudflare's own banner says so.

## Durable Objects — the honest answer is *not yet*

A Durable Object is one globally-named, single-threaded actor with storage attached. It is
coordination, not content. On the free plan only the SQLite-backed kind exists, and it is
**always local in dev** — it cannot be pointed at the cloud.
([pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/),
[development-testing](https://developers.cloudflare.com/workers/development-testing/))

**For a single-author CMS a DO buys nothing over D1.** You would hand-roll schema, migrations and
query tooling to obtain a serialization guarantee that a single writer never needs. It earns its
place in exactly three cases, none of which is on the table today:

- **Live collaborative editing** — one DO per document holding the WebSocket fan-out and edit
  order. D1 cannot do this at all.
- **A per-document lock**, when two people can save the same page and you want the second save
  rejected rather than silently merged.
- **Rate limiting** the admin route, since a DO is a natural counter.

Note the middle one, because it is the version of this you might actually reach: the day a second
person edits, "last write wins on a file" stops being acceptable.

## KV and R2, one line each

- **KV** — read-heavy edge key/value, eventually consistent for up to ~60s. The free tier allows
  100,000 reads but only **1,000 writes per day**, which rules it out as a CMS store and makes it
  what it is good at: a cache. ([limits](https://developers.cloudflare.com/kv/platform/limits/))
- **R2** — S3-compatible object storage, 10 GB free, **egress free**. This is the one Cloudflare
  service with an obvious job here the moment you have images: a media library, so that binaries
  stop being committed into git forever. ([pricing](https://developers.cloudflare.com/r2/pricing/))

## The seam — this is the recommendation

Do not pick a backend. Commit to one small interface, put git files behind it, and leave room for
the others. **This repo has already built two thirds of it and has not noticed.**

`ext/Saver` is the interface: `load()` · `save(item)` · `write(item)` · `delete()`, with three
backends already shipped — `FileSaver` (a real file, over the dev socket), `LocalStorageSaver`,
`MemorySaver`. `/imagine/store.js` is the *other* half: the call site, `store(page)`, keyed on
`page.url`. Neither knows about the other. Joining them is the whole design:

```
page.store()                                — the call site: the page's own url IS the key
   └── Store         get · set · list · append · delete
         ├── FileStore    git files under public/       ← the default. rpc:write in dev,
         │                                                 read-only when statically hosted
         ├── LocalStore   localStorage                  ← what /imagine/store.js does today
         ├── SqliteStore  node:sqlite on the dev server ← for `list` with a query in it
         └── D1Store      fetch("/api/store/…") → Worker ← only when a visitor must write
```

Two verbs are missing from `Saver` today and both are load-bearing:

- **`list(prefix)`** — the one thing a CMS needs that a per-page saver cannot express. "Every page
  under `/blog/`" is how an index gets built.
- **`append(key, line)`** — because JSONL is the only git format that survives concurrent writers,
  and `ext/JSONL` already reads that shape live over the socket.

Three properties make this actually free of lock-in, and they are worth stating as tests:

1. **The key is a path**, not a database id. `/imagine/cms/welcome` means the same thing to a file,
   a SQLite row and a D1 row. An auto-increment id would already be lock-in.
2. **Every backend must be exportable to the default.** `SqliteStore` and `D1Store` must be able to
   dump themselves back to files (`wrangler d1 export`, or a `SELECT` loop). If a backend cannot
   become a directory of files, do not add it.
3. **The page never names its backend.** One line, in one place, picks it — the idiom `ext/editor`,
   `ext/Panel` and `dev/DevBar` already each repeat:
   `const store = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key });`

## What I would do, in order

1. **Land `page.store()`** over the existing `Saver` backends, plus `list()` and `append()`. ~40
   lines, no dependency, no service. Everything below waits on this and nothing else does.
2. **One trap first:** `public/data/` is in `.gitignore`, so today's savers write to a directory
   git will never see. CMS *content* must be written beside the page it belongs to; `public/data/`
   is for user state. The slice here writes `public/imagine/cms/welcome.md` for that reason.
3. **`SqliteStore` on the dev server**, as a derived index over the files, when a real query is
   wanted. Gitignored, rebuildable, deletable.
4. **R2 when images arrive** — before they land in git history, not after.
5. **D1 + a Worker only when someone who is not you writes.** Comments, a contact form, a shared
   draft. That is the day production stops being static, and it should be a day you choose.
6. **Durable Objects when a second person edits the same page.** Not before.

## What is not verified

- The exact D1 local leaf path (`…/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite`) and that it
  opens in `sqlite3` — true in practice, not on a rendered docs page.
- Cloudflare Access free-seat counts. The widely-quoted "50 users" is third-party only; the docs
  page lists no cap. Check the dashboard before relying on it.
- Everything about live accounts, tokens and billing. Nothing here made a cloud call, by design.
