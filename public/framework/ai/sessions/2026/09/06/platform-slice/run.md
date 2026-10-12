# Run the slice

**One topic world, one page inside it, one signed-in user, one like — all four running on your
own machine, in about fifteen seconds.** No Cloudflare account, no deploy, no keys, nothing to
sign up for. Everything below runs on `workerd`, the same engine Cloudflare runs, entirely
offline.

You need Node and a browser. Nothing else.

---

## 1. One command

From the repo root, in a fresh terminal:

```
npm run dev
```

That is the whole setup. It prints four lines and then sits there; leave it running.

**Already using port 80?** Most people are — the owner runs `node server.js` there all day, and
an agent is not allowed near it. Give both servers a port of your own instead:

```
PORT=8097 API_PORT=8201 npm run dev
```

The rest of this page uses `8201`. If you ran the plain `npm run dev`, use **`8787`** everywhere
you see `8201` below.

<details>
<summary>What that command actually did</summary>

`dev.mjs` starts two servers, because they do two different jobs:

| | what it is | why |
|---|---|---|
| `:8097` | `node server.js` — the existing UI dev loop | live reload while you edit |
| `:8201` | `wrangler dev` — the whole site **plus** `/api/*` | identity, rooms and likes, on one origin |

Before starting them it applies `worker/schema.sql` and `worker/seed.sql` to a local D1
database, which is a real SQLite file under `.wrangler/state/` — that is where the users and the
likes actually live. Both files are safe to re-apply, so a second `npm run dev` does not wipe
anything.

You want `:8201` for everything on this page. It serves the same static site *and* the API from
one origin, so cookies, `fetch` and the WebSocket all behave exactly as they would in
production.
</details>

---

## 2. Open the topic world — **noun 1**

<http://localhost:8201/imagine/platform/topic/>

A topic is a page that says one word, `is: "topic"`. Everything else it has — its intro, its
channels, its levels, its subtopics — is a child page.

Down the left of that column there is a **like button**. It reads `♡ 0` and it is greyed out,
and under it, *"Not signed in."* That is correct: nobody is signed in yet.

---

## 3. Sign in — **noun 3**

<http://localhost:8201/api/dev/login?as=carol&to=/imagine/platform/topic/>

That is the whole login. It sets a signed session cookie for `carol` and sends you straight back
to the topic. The line under the button now reads **"Signed in as carol (member)."**

Five people are seeded: `alice` (owner), `bob` (moderator), `carol` and `dave` (members), `eve`
(banned). Swap the handle in that url to become somebody else; `?as=none` signs out.

> **This route does not exist in production.** It lives in `worker/dev.js`, which the deployed
> entry never imports — there is nothing to disable. The real thing is GitHub OAuth, which is not
> built yet.

---

## 4. Like it — **noun 4**

**Click the button.** It goes from `♡ 0` to `♥ 1` — a filled heart, meaning *you* liked it.

Now the part that matters:

- **Reload the page.** Still `♥ 1`. Nothing in your browser remembers that; a row in the database
  does.
- **Stop the server (`Ctrl+C`) and run `npm run dev` again.** *Still* `♥ 1`.
- **Sign out** — <http://localhost:8201/api/dev/login?as=none&to=/imagine/platform/topic/> —
  and the count is still `♡ 1`, greyed out. Anyone can read it; only a signed-in user can write.

See the row itself:

```
npx wrangler d1 execute local-dev --local -c wrangler.dev.jsonc --command="SELECT * FROM likes"
```

---

## 5. Open a page inside the topic — **noun 2**

<http://localhost:8201/imagine/platform/topic/space/general/>

The topic's column stays on screen and the channel opens beside it, so you can see **both like
buttons at once**. The channel's is its own: `♡ 0`, while the topic behind it still says `♥ 1`.

Like the channel too, and only its count moves. That is the design in one gesture — a like is
keyed on the **page's url**, so there is no page table and nothing central listing what can be
liked. Two urls, two counts, one user, one signed-in session.

---

## 6. Turn the API off — the test the platform rests on

Open the **same page** on the other server, the one with no worker at all:

<http://localhost:8097/imagine/platform/topic/>

Everything renders. The topic, its columns, its text, all of it. The like button is there too and
says `♡ —` — it just tells you there is no API. Nothing throws.

That is the acceptance test behind
[step 4 of the slice](/imagine/platform/mvp/): *the static site is never allowed to need the
API.*

---

## Stop it

`Ctrl+C` in the terminal running `npm run dev` stops both servers.

---

## Prove it without clicking

Two Playwright scripts do the whole walk above and assert the DOM, rather than trusting a
screenshot. With the harness running:

```
node public/framework/ai/2026-09-06/platform-slice/slice-test.mjs      # 12 assertions, sections 2-5
node public/framework/ai/2026-09-06/platform-slice/offline-test.mjs    # 6 assertions, section 6
```

Both were green on 2026-09-06, and the timed cold run — fresh terminal to twelve green assertions
— took **14 seconds**, of which 8 were `npm run dev` reaching a live API.

---

## What is real and what is faked

| noun | real | faked |
|---|---|---|
| **the topic world** | a static page, served from `public/` — it needs no server at all | nothing |
| **a page inside it** | the same: a child page, its own url | nothing |
| **a signed-in user** | the **session** — HMAC-SHA256 over WebCrypto, an `HttpOnly` cookie, verified on every request against a real D1 row | the **identity** — five seeded rows and a dev-only `?as=` route instead of GitHub OAuth, and the role is signed into the cookie rather than derived from the database |
| **a like** | a row in D1, `PRIMARY KEY (user_id, url)`, counted with `COUNT(*)` — it survives a reload, a sign-out and a restart | nothing |

## If it does not work

- **`npm run dev` exits immediately** — read its first lines. It applies the two `.sql` files
  before anything else and stops if either fails.
- **`unknown dev user "carol"`** — the seed did not apply. Run it by hand:
  `npx wrangler d1 execute local-dev --local -c wrangler.dev.jsonc --file=./worker/seed.sql`
- **The button says `♡ —` on `:8201`** — the worker is not answering. That is the same message
  section 6 is about; check the terminal.
- **The first `npx wrangler` is slow** — it needs the network once to fill the npx cache. After
  that everything here is offline.
- **Console noise about a WebSocket** — expected, and harmless. The framework's own dev socket
  looks for `node server.js`, which is not what is listening on `:8201`; it retries and gives up.
