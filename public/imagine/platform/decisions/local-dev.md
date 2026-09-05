# The local multi-user harness

Brief §10 asks for a local system that is *genuinely playable*: fake users, role switching,
the anonymous state, and two people in one room. This is the buildable proposal. **Nothing
here is built** — and nothing here changes the live deploy.

## The shape: one origin, in dev too

`wrangler dev` already knows how to serve this repo — `wrangler.jsonc` points `assets` at
`./public` today. Add `main` and `run_worker_first: ["/api/*"]` and **one process serves the
whole site and the API on one origin**, so cookies, `fetch` and the WebSocket all behave
exactly as they will in production, with no proxy and no CORS
([static-assets/binding](https://developers.cloudflare.com/workers/static-assets/binding/)).
That is the harness.

`node server.js` stays exactly as it is, on its own port, for the thing wrangler cannot do:
live reload, `rpc:write`, the AI log tail. **Two servers, two ports, two jobs** — you build
the UI at `:80` and you test identity and rooms at `:8787`.

- **Do not add `main` to `wrangler.jsonc`.** That file deploys on every push and has never
  carried a Worker ([prior scout](../prior/)). The dev config is a **separate file**,
  `wrangler.dev.jsonc`, passed with `-c` — so the production deploy is unchanged until
  someone deliberately changes it.
- The dev-only `/api/*` proxy in `Server/`: **optional, HTTP only.** It buys one thing —
  live reload *and* the API in the same tab. It cannot carry the WebSocket: `Server/plugins/SocketServer/SocketServer.js`
  attaches `ws` with `{ server }`, and `ws` aborts every upgrade it does not handle with a
  400 (`node_modules/ws/lib/websocket-server.js`, `shouldHandle`) — so a second upgrade
  listener never gets the socket. Proxying WS needs `noServer: true` and an upgrade router,
  which is surgery on the file that carries the loopback gate. Not worth it: test rooms at `:8787`.

## Files it would create

| file | what it is |
|---|---|
| `wrangler.dev.jsonc` | dev-only config: `main`, `run_worker_first: ["/api/*"]`, the D1 and DO bindings, `vars: { DEV_LOGIN: "1" }`. Never deployed |
| `worker/index.js` | `/api/*` router; everything else falls through to `env.ASSETS.fetch(request)` |
| `worker/session.js` | HMAC sign/verify over WebCrypto ([`notes/auth` §3](/notes/auth/)) — plus the `?as=` branch below |
| `worker/Room.js` | the Durable Object: hibernating WebSockets, one SQLite table, keyed by url ([data.md](./data.md)) |
| `worker/schema.sql` | `users`, `likes` — [`notes/auth` §4](/notes/auth/)'s schema, unchanged |
| `worker/seed.dev.sql` | `DROP TABLE` first, then five fake users. Local D1 **persists across restarts by default** since Wrangler v3, so a reseed that assumes a clean start is wrong ([users log](../research/users/log.jsonl)) |
| `dev.mjs` | the one command — spawns both servers, prefixes their output, kills both on Ctrl+C |
| `test/multiuser.mjs` | Playwright: two contexts, two identities, one room |
| `Server/plugins/Api.js` | *optional* — dev-only HTTP proxy `/api/*` → `127.0.0.1:8787`, loopback-guarded |

`worker/` is **not** under `public/` — `public/` is the deploy artifact and a static host
serves by path, so a secret-handling file there would be readable ([`notes/auth` §7](/notes/auth/)).
Add `.wrangler/` to `.gitignore`: local D1/DO/KV/R2 state lives in `.wrangler/state`
([local-data](https://developers.cloudflare.com/workers/development-testing/local-data/)).

## The one command

```
npm run dev          # = node dev.mjs
```

`dev.mjs` is ~40 lines of `child_process.spawn`:

1. `node server.js` on `process.env.PORT ?? 80` — **skipped if that port is already listening**,
   because the owner usually starts it themselves.
2. `npx --yes wrangler dev -c wrangler.dev.jsonc --port 8787`.
3. Prints both urls and what each is for; `SIGINT` kills both children.

Then, in another terminal: `node test/multiuser.mjs`.

**Dependencies: none new.** `wrangler` runs through `npx`, Playwright is already installed
globally (`playwright@1.62.1`), and `child_process` is built in — all three are what CLAUDE.md
already permits ("`npx` and global tools are fine"). The first `npx wrangler` needs the network
once to populate the npx cache; after that `wrangler dev` runs fully local on `workerd`, with
**no Cloudflare account** ([local-development](https://developers.cloudflare.com/workers/local-development/)).

## Fake users, roles, and the anonymous path

Seed one user per role, and make switching a url:

```
GET /api/dev/as/<handle>   →  sets the session cookie for that user, 302 back
GET /api/dev/as/none       →  clears it — this is the anonymous path
```

| handle | role | proves |
|---|---|---|
| `ada` | platform admin | the override authority the [community verdict](../research/community/verdict/) gives the owner |
| `bob` | topic owner (founder) | founder-owns-topic |
| `cleo` | moderator | mute/ban inside the room's own message handler ([realtime verdict](../research/realtime/verdict/)) |
| `dev` | member | the ordinary case |
| `eve` | banned member | the KV `banned:<user_id>` check ([users verdict §33](../research/users/verdict/)) |
| — | anonymous | **every page still renders** with no cookie and with the API returning 500 ([`notes/auth` §1](/notes/auth/)) |

**Two independent guards on the dev branch, not one.** It runs only when `env.DEV_LOGIN === "1"`
— a var that exists only in `wrangler.dev.jsonc` — **and** the request hostname is
`localhost`/`127.0.0.1`. Both, because either alone is one config mistake away from a
production impersonation endpoint. Today there is a third: production has no Worker at all.
Real GitHub OAuth against a `localhost` callback still works beside it for the end-to-end check.

## The room test

Two `browser.newContext()` calls are two cookie jars, so they are two people in one browser
([realtime log](../research/realtime/log.jsonl) 33). `test/multiuser.mjs`:

1. context A → `/api/dev/as/ada`, then the topic's chat page; context B → `/api/dev/as/bob`, same page.
2. A posts. **Assert B's DOM shows it** — a screenshot alone is not a pass.
3. B reloads: replay-from-cursor rebuilds the same transcript (the DO's own resume path).
4. `cleo` mutes `bob`; `bob`'s next post is refused. `eve` is refused at connect.
5. Anonymous context: the page renders, the composer is absent, nothing throws.

Durable Objects **always run locally** in `wrangler dev` and cannot be pointed at the cloud, so
this whole test is offline ([local-development](https://developers.cloudflare.com/workers/local-development/)).
⚠ That stops being true for voice: Cloudflare Realtime's SFU/TURN has **no local emulator** and
always reaches the real edge ([realtime log](../research/realtime/log.jsonl) 32). Voice is not in
the MVP; when it arrives, this harness does not cover it.

## What the next minion tests first

Three things this design assumes and nobody has verified:

1. **`wrangler dev` serving `public/` as assets while `node server.js` runs on another port** —
   no Cloudflare doc covers coexistence at all ([cloudflare log](../research/cloudflare/log.jsonl) 27).
   Two ports should just work; prove it before building on it.
2. **The dev socket in a `:8787` tab.** `Socket.js` connects to `window.location.host` on any
   `localhost` hostname, so a page served by wrangler will try to open a WebSocket the Worker does
   not answer, and reconnect with backoff. Expect console noise; confirm it is only noise.
3. **Whether the session cookie reaches a cross-port WebSocket**, if the room is ever addressed at
   `:8787` from a `:80` tab. Cookies are not isolated by port (RFC 6265 §8.5), so it should — but
   `SameSite=Lax` over a `ws://` handshake is exactly the kind of thing browsers changed recently.
   The one-origin harness above sidesteps it entirely, which is why it is the recommendation.

Built 2026-09-04 ([`/imagine/platform/local/`](../local/)): all three assumptions verified in a
real browser, plus one correction — wrangler 4.129 silently ignores `run_worker_first` at the
config's top level; it must nest under `assets`.
