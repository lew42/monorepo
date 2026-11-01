# Full-stack framework data paths (UI binding → client state → transport/real-time → server → persistence), as of late October 2026

Research date: 2026-10-29. Scope: how mainstream frameworks and backend platforms move data end to end, what each pairs with for persistence and real-time, which pieces are swappable, and which pieces could be lifted out and used from vanilla ES modules by someone building his own OO framework (`Item` get/set + change events, `List extends Item`, `Page extends Item`, append-only JSONL delta logs, websocket streaming).

Method note: Version numbers, publish dates, dependency lists and `module`/`unpkg` build fields in these notes come from the public npm registry. They are used only to confirm release state, packaging and staleness, not popularity. Partway through, the shared web-search budget for this turn ran out. Later findings came only from fetching URLs already found, so some gaps below exist for that reason.

---

## 1. Historical full-stack reactive stacks (Meteor, Backbone, Ember Data/WarpDrive, Firebase, Parse): model, UI propagation, real-time, persistence, standalone use, OO-ness

### Takeaway
Meteor is still alive at 3.5.x, still MongoDB-centric, and its UI default is now React. Blaze is community-maintained. Its DDP wire protocol (`added`/`changed`/`removed` with `fields`/`cleared`) maps almost one to one onto a JSONL delta log. Backbone is in quiet maintenance (1.6.1, April 2025), but `Backbone.sync` remains the cleanest "swap the persistence strategy" seam. Ember Data has become WarpDrive, a signals-based, schema-driven, framework-agnostic store. It replaced Model classes and Adapters/Serializers with Schemas and request Handlers, so it moved *away* from OO model classes. Parse is the most "Backbone-like" live system still maintained. It has ES6 subclassable `Parse.Object` with get/set/save and LiveQuery events, and loads from a CDN. Firebase gives latency-compensated listeners and official CDN ES modules.

### Cited Findings

**Meteor (status 2026, Meteor 3.x, Minimongo, DDP, Blaze)**
- Meteor 3.5.2 "shipped on 4 September 2026." Meteor 3.0 (15 July 2024) "removed the Fibers coroutine library entirely," moving to native async/await and replacing Connect with Express. 3.1 (20 Nov 2024) added Node 22, MongoDB driver v6 and Express 5. 3.3 (11 Jun 2025) replaced Babel with SWC. 3.4 (30 Jan 2026) made Rspack (with tree shaking) the default bundler for new apps — [OpenReplay: Is Meteor.js relevant in 2026](https://blog.openreplay.com/meteor-js-relevant-2026/)
- Sync calls like `findOne`/`insert` are replaced by `findOneAsync`/`insertAsync` (async methods arrived in 2.8, so migration can be incremental) — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/)
- DDP is "Meteor's WebSocket protocol," used to publish MongoDB cursors to clients. MiniMongo is "an in-memory reimplementation of the Mongo query interface" on the client, kept current by publications/subscriptions — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/)
- View layer: Meteor is view-agnostic. `meteor create` scaffolds React by default, with official skeletons for Vue, Svelte and Solid. Blaze "still works and remains community-maintained," but most docs and skeletons assume React — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/). The official guide's Blaze page now says "This content has moved to the Blaze Community Site" — [Meteor Guide: Blaze](https://guide.meteor.com/blaze)
- The data layer is "MongoDB-centric by design." Relational databases work only through standard npm drivers, "with no live queries" — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/)
- Meteor 3.5 (released June 30, 2026): "MongoDB Change Streams are now the default reactivity mechanism," replacing oplog tailing. This requires MongoDB 6+ as a replica set or sharded cluster, with fallback to oplog or polling. In the team's own benchmark, the oplog driver saturated at 1,200 virtual users and crashed (OOM), while Change Streams handled 1,680 (+40%). The runtime moved to Node.js 24 LTS. New features include DDP Session Resumption (short disconnects resume within a grace period, avoiding a full re-subscribe) and "a new pluggable DDP transport layer" that swaps SockJS for uWebSockets with a flag, plus `accounts-express` for authenticated REST endpoints — [Meteor blog: Why Meteor 3.5 is the most important release in years](https://blog.meteor.com/why-meteor-3-5-is-the-most-important-release-in-years-0e85968e54c4)
- Community: the package ecosystem, tutorials and hiring pool "never recovered from the 2016 to 2019 exodus." Atmosphere is far smaller than npm, and many packages are community forks of abandoned projects — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/)
- Ownership: "In October 2019, the Meteor.js open source framework and Galaxy Hosting Products were purchased by Tiny Capital" (renamed Meteor Software). Note that the Wikipedia infobox is stale and still lists 3.3 as latest — [Wikipedia: Meteor](https://en.wikipedia.org/wiki/Meteor_(web_framework))
- **DDP wire format** (useful as a reference protocol): `sub {id,name,params}`, `unsub`, `nosub`, `ready {subs}`. Data messages are `added {collection,id,fields}`, `changed {collection,id,fields,cleared}`, `removed {collection,id}`, plus ordered variants `addedBefore`/`movedBefore`. RPC uses `method {method,params,id,randomSeed}`, `result`, and `updated {methods}`. `changed.fields` "should be replaced with new values" and `cleared` lists fields "no longer in the document." `updated` is sent once all data messages caused by a method call have been sent, which is how the client knows its optimistic write is now reflected in server data — [DDP spec](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md)
- DDP is a "stateful websocket protocol" using "stringified EJSON over websockets." Any client can connect to a DDP service. The SockJS long-polling fallback "is not part of the official DDP standard" — [Meteor DDP README](https://github.com/meteor/meteor/blob/devel/packages/ddp/README.md)
- Standalone DDP clients are stale: `simpleddp` was last published in 2019 (2.2.4) and `meteor-sdk` in Oct 2022 (0.0.21) — [npm: simpleddp](https://registry.npmjs.org/simpleddp); [npm: meteor-sdk](https://registry.npmjs.org/meteor-sdk)

**Backbone (Model/Collection/sync)**
- `Backbone.sync(method, model, [options])` is the function Backbone calls to read or save a model or collection. `method` is "create"/"read"/"update"/"delete" (mapped to POST/GET/PUT/PATCH/DELETE). You can replace `Backbone.sync` globally to use "WebSockets, XML, or Local Storage," or put a `sync` function on an individual model/collection. `Backbone.ajax` swaps only the transport — [backbonejs.org](https://backbonejs.org/)
- The site still lists 1.6.0 as current. npm and GitHub have 1.6.1. In WordPress core's ticket the site lag was noted as a discrepancy — [WordPress Trac #63763](https://core.trac.wordpress.org/ticket/63763). 1.6.1 was published to npm 2025-04-01, with a single dependency on `underscore` and no `module` (ESM) entry — [npm: backbone](https://registry.npmjs.org/backbone)
- debugInfo "is also experimentally available in ES module format under `backbone/modules/`." The main build is a classic UMD script — [backbonejs.org](https://backbonejs.org/)

**Ember Data → WarpDrive**
- The `ember-data` package is now a legacy umbrella (bundling `@ember-data/model`, `adapter`, `serializer`). New projects should install `@warp-drive/*` directly. `@warp-drive/core` is "framework-agnostic data management," and `@warp-drive/ember` provides Ember integrations. "Schema objects" replace Model classes, and "Request builders" and "Handlers" replace Adapters and Serializers — [ember-data 5.9.1 README](https://fastly.jsdelivr.net/npm/ember-data@5.9.1/README.md)
- WarpDrive works with "any Signals compatible framework such as Ember, Svelte, Angular, Vue.js, SolidJS, Preact or Lit." Its concepts include `class AppStore extends Store`, `new RequestManager().use([Fetch])`, customizable cache via `createCache`, JSON ResourceSchemas, and immutable reactive records edited through a `Checkout` symbol (`user[Checkout]()`). "Realtime subscriptions are supported through an extensive list of operations," via a notifications service and cache patch ops such as `store.cache.patch({ op: 'add', ... })` — [WarpDrive guide](https://emberjs.github.io/data/guide)
- The component API is "a thin framework-specific binding overtop of the framework-agnostic JS API" — [WarpDrive guides](https://emberjs.github.io/data/guides)
- A React binding exists: `@warp-drive/react`, "Data bindings and utilities for React applications using WarpDrive" — [socket.dev](https://socket.dev/npm/package/@warp-drive/react). It depends on `signal-polyfill` and `@warp-drive/tc39-proposal-signals` — [npm: @warp-drive/react](https://registry.npmjs.org/@warp-drive/react)
- Releases: v5.9.1 and v5.9.0 on 2026-09-05, v5.8.2 on 2026-04-17 ("ensures support for Ember v7") — [emberjs/data releases](https://github.com/emberjs/data/releases?page=1)
- `@warp-drive/core` depends on `@embroider/macros` and `@warp-drive/build-config` and declares no `module` field — [npm: @warp-drive/core](https://registry.npmjs.org/@warp-drive/core)

**Firebase (Firestore listeners)**
- Firestore: `onSnapshot()` fires immediately with a snapshot, then on each change. "Local writes in your app will invoke snapshot listeners immediately" ("latency compensation"), and `metadata.hasPendingWrites` tells you whether a snapshot reflects unsent local changes — [Firestore: Listen to realtime updates](https://firebase.google.com/docs/firestore/query-data/listen)
- Firebase can be loaded without a bundler as ES modules from Google's CDN, e.g. `import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js'`. Google "strongly recommends" npm for most apps, and the version is hard-coded in each URL — [Firebase: alternative setup](https://firebase.google.com/docs/web/alt-setup?hl=en)

**Parse**
- Parse Server 8.0.0 (2025-03-04) moved to Express 5, raised minimums to MongoDB 6.0.19/7.0.16/8.0.4 and Postgres 15/PostGIS 3.3, and added TypeScript support — [Parse Server 8.0.0 release](https://newreleases.io/project/github/parse-community/parse-server/release/8.0.0). Releases have continued since: parse-server 9.10.7 was published 2026-10-24 — [npm: parse-server](https://registry.npmjs.org/parse-server)
- Parse JS SDK object model: `Parse.Object.extend("GameScore")`, or ES6 `class Monster extends Parse.Object` with `super('Monster')` plus `Parse.Object.registerSubclass('Monster', Monster)`. It uses `get(key)`/`set(key,value)`, `save()` sends only dirty fields, and `saveEventually()` queues writes until the network returns. LiveQuery: `query.subscribe()` returns an event emitter with `create`, `update`, `enter`, `leave` and `delete` events. Browser loading: `https://unpkg.com/parse/dist/parse.min.js`, then `Parse.initialize(...)` — [Parse JS guide](https://docs.parseplatform.org/js/guide/)

### Inferences
- DDP's `added`/`changed{fields,cleared}`/`removed` per `(collection,id)` is essentially the same shape as an append-only per-item delta log. Its `method` → `result` + `updated` handshake is a ready-made pattern for "optimistic write acknowledged once the server's deltas have been applied." That makes DDP a good protocol reference even if Meteor itself isn't adopted.
- Parse is the closest living analog to the user's `Item` (subclassable object, get/set, dirty-field save, query-scoped live events with enter/leave semantics). Its LiveQuery `enter`/`leave` semantics are something a `List` subscription would need too.
- WarpDrive's direction (immutable records, schema JSON, signals, request pipeline) is the opposite of mutable Backbone-style OO models. Of its parts, the RequestManager + Handler chain is the most portable idea (a middleware pipeline for fetch).
- Meteor's ecosystem decline is the main practical risk. The technology (DDP, Change Streams) is actively improved, but the community isn't growing.

### Gaps
- No primary source found for whether the Blaze community site has had releases in 2026. Only "community-maintained" is confirmed.
- Firebase Realtime Database (as distinct from Firestore) listener semantics and offline persistence details were not fetched. The Firestore page excerpt didn't cover `docChanges` or offline persistence.
- Did not verify whether `@warp-drive/core` runs unbundled in the browser. Its dependency on `@embroider/macros` suggests a build step is expected, but this was not tested.
- Parse's historical derivation from Backbone (an early Parse JS SDK shipped Backbone-style `Parse.Collection`/`Parse.View`) is recalled from background knowledge and was not re-verified.

---

## 2. Current meta-frameworks (Next.js, React Router v7/v8 + Remix 3, SvelteKit, Nuxt, SolidStart, Astro, Qwik): data path, real-time story, persistence pairing, swappability

### Takeaway
Every mainstream meta-framework now uses the same pattern: *server functions / loaders / actions + cache revalidation*. None ships a first-class real-time or persistence layer. The exceptions are SvelteKit's experimental `query.live` (async-generator streaming) and Remix 3, which (stable since Oct 2026) bundles its own `data-table` with Postgres/MySQL/SQLite adapters and is explicitly built from standalone packages. Persistence is BYO (typically Drizzle/Prisma + Postgres/SQLite/libSQL). Astro DB is a thin Drizzle + libSQL wrapper whose hosted service (Astro Studio) was shut down in 2025. All of these need Vite/Turbopack-style build tooling. Remix 3 is the only one emphasizing "unbundled" serving.

### Cited Findings

**Next.js**
- Next.js 16 (beta announced Oct 9, 2025): Turbopack is now the default bundler. New caching APIs: `updateTag()` is "a new Server Actions-only API that provides read-your-writes semantics," `refresh()` refreshes uncached data from a Server Action, and `revalidateTag(tag, profile)` now needs a `cacheLife` profile for stale-while-revalidate. `experimental.dynamicIO` was renamed `experimental.cacheComponents` (PPR folded in), and `middleware.ts` was renamed `proxy.ts`. The example pattern is `await db.users.update(...); updateTag(...)` inside a `'use server'` function — [Next.js 16 beta](https://nextjs.org/blog/next-16-beta)
- The Next.js 16 announcement contains no real-time/subscription feature. Real-time has to come from a third party — [Next.js 16 beta](https://nextjs.org/blog/next-16-beta)
- Current release line: next 16.4.3 (2026-10-23) — [npm: next](https://registry.npmjs.org/next)
- State of JS 2025: Next.js is still dominant in usage, but its "satisfaction ratio now has a 39% gap with leader Astro." Top meta-framework pain points by answer count were "Cognitive overload: 462," "Next.js issues: 302," "Server-client communication: 202," and "Lock-in: 107" — [State of JS 2025: meta-frameworks](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/)
- State of React 2025: Next.js is used by 80% of respondents (27% positive, 17% negative). Server components and server functions got a lukewarm reception, which the survey authors called "troubling for a set of new APIs that was supposed to pave the way towards React's next big evolution" — [The Register](https://www.theregister.com/2026/02/17/react_survey_shows_tanstack_gains/)

**React Router v7 → v8, and Remix 3**
- React Router has three additive modes. **Declarative** (`<BrowserRouter>`) has no loaders/actions. **Data** mode moves route config "outside of React rendering" and adds `loader`, `action` and `useFetcher` via `createBrowserRouter`. **Framework** mode "wraps Data Mode with a Vite plugin" (type-safe route modules, SSR/SPA/static). RSC APIs are marked "(Unstable)" — [React Router: Picking a mode](https://reactrouter.com/start/modes)
- React Router v8 (June 17, 2026): ESM-only. It requires Node 22.22+, React 19.2.7+ and Vite 7+. Middleware is now default behavior. RSC is "still in progress and unstable." React Router v6 and Remix v2 are end of life. Remix 3 is a separate "full-stack, zero-dependency JavaScript web framework" — [Remix blog: React Router v8](https://remix.run/blog/react-router-v8)
- Remix 3 beta preview (Apr 30, 2026): components come from `remix/ui`. State is held in plain variables, updates are explicit via `handle.update()`, routes are "Fetch API routes" whose "controllers return responses," forms "submit to URLs," and frames are "server-rendered UI with a `src`" that reload independently. It is "built from small, composable packages that can stand on their own" — [Remix 3 beta preview](https://remix.run/blog/remix-3-beta-preview). InfoQ describes the UI runtime as a "forked Preact" with an imperative `this.update()` model — [InfoQ](https://infoq.com/news/2026/07/remix-3-beta-preview). The Remix post itself does not mention Preact, so the sources differ in emphasis here.
- Remix 3 RC (Aug 31, 2026): a CLI database workflow (migrations, seeding, rollbacks). You can "use Zod instead of `@remix-run/data-schema`" and "pull in Drizzle instead of `@remix-run/data-table`." It adds "improved unbundled asset serving for JavaScript, CSS, images, fonts, and npm packages," and most packages "could be used independently." The full release was scheduled for Oct 2 at Remix Jam — [Remix 3 RC](https://remix.run/blog/remix-3-release-candidate)
- `remix` 3.0.0 was published 2026-10-01 and 3.1.0 on 2026-10-23. The umbrella package depends on `@remix-run/fetch-router`, `route-pattern`, `component`, `data-table` (+ `-postgres`/`-mysql`/`-sqlite`), `data-schema`, `session`, `session-storage-redis`, `auth`, `file-storage(-s3)`, `form-data-parser`, `headers`, `multiple-import-maps-polyfill`, `spa` and others — [npm: remix](https://registry.npmjs.org/remix). `react-router` 8.x itself depends on `@remix-run/route-pattern` — [npm: react-router](https://registry.npmjs.org/react-router)
- No source mentions a built-in real-time/push mechanism for Remix 3 — [InfoQ](https://infoq.com/news/2026/07/remix-3-beta-preview); [Remix 3 RC](https://remix.run/blog/remix-3-release-candidate)

**SvelteKit**
- Remote functions live in `*.remote.ts` files. They include `query` (cached by argument, `refresh()`), `query.batch` (groups calls in one macrotask, solving n+1), `query.live` (an async generator that yields values: "export const getTime = query.live(async function* () {"; during SSR `await` returns the first value; on the client the stream stays connected and exposes `connected` and `reconnect()`), `form` (works without JS), `command`, and `prerender`. Server-side `getPosts().refresh()` / `.set()` update client queries in the same response as the mutation, and `withOverride` provides optimistic updates. It requires opting into `experimental.remoteFunctions` and `compilerOptions.experimental.async` — [SvelteKit docs: remote functions](https://svelte.dev/docs/kit/remote-functions/llms.txt)
- `query.live` was labeled "experimental 2.59.0, async in 2.61.0." A community package, svelte-ws, adds WebSocket support across runtimes. Several remote-function breaking changes landed in 2.58–2.61 — [What's new in Svelte: June 2026](https://svelte.dev/blog/whats-new-in-svelte-june-2026)
- SvelteKit 3.0 was announced Oct 1, 2026 (config moves to `vite.config.ts`, `$lib` becomes `#lib`). Remote functions are "not ready yet" because they depend on experimental Async Svelte — [80aj.com (secondary, Chinese-language)](https://www.80aj.com/2026/10/02/sveltekit-3-release-ai/). npm confirms `@sveltejs/kit` 3.0.0 on 2026-10-01 and 3.1.0 on 2026-10-14, with `vite` as a peer dependency — [npm: @sveltejs/kit](https://registry.npmjs.org/@sveltejs/kit)

**Nuxt**
- Nuxt 4: `useAsyncData`/`useFetch` calls with the same key "now share their data automatically," with automatic cleanup on unmount and reactive keys that trigger refetch. Nuxt 3 maintenance runs "until the end of January 2026." Nuxt 5 will bring "Nitro v3 and h3 v2" — [Nuxt 4 announcement](https://nuxt.com/blog/v4). Current: nuxt 4.6.3 (2026-10-27) — [npm: nuxt](https://registry.npmjs.org/nuxt)

**SolidStart**
- Mutations use Solid Router's `action()`. `"use server"` server functions run only on the server. "Single-flight mutations" combine the mutation and refetch of preloaded `query()` data in one response, with revalidation streamed back — [SolidStart docs: data mutation](https://docs.solidjs.com/solid-start/building-your-application/data-mutation)
- Current: `@solidjs/start` 2.1.0 (2026-10-22, `vite` peer dependency) and `@solidjs/router` 1.0.0 (2026-07-28) — [npm: @solidjs/start](https://registry.npmjs.org/@solidjs/start); [npm: @solidjs/router](https://registry.npmjs.org/@solidjs/router)

**Astro (Astro DB / Actions)**
- Astro Studio: "Existing databases will no longer be accessible after March 1, 2025." Turso was recommended as the replacement. Since 4.15, Astro DB can connect to any libSQL database, and the team says Astro DB "isn't going anywhere," with long-term plans for MySQL/Postgres — [Astro: Goodbye Studio, Hello DB](https://astro.build/blog/goodbye-astro-studio/)
- `@astrojs/db` (0.21.3, published 2026-06-09) depends on `drizzle-orm` and `@libsql/client` — [npm: @astrojs/db](https://registry.npmjs.org/@astrojs/db)
- Astro Actions: `defineAction()` with a Zod `input` and a `handler()`, exported from `src/actions/index.ts`. They can be called from `<script>` tags via `import { actions } from 'astro:actions'` and return `{data, error}`. Form actions use `accept: 'form'`. "Actions are accessible as public endpoints based on the name of the action," so authorization is needed. No real-time is mentioned — [Astro docs: Actions](https://docs.astro.build/en/guides/actions/)
- Astro has the top satisfaction among meta-frameworks in State of JS 2025 — [State of JS 2025](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/)

**Qwik**
- Qwik 2.0 RC landed Oct 1, 2026 (`@qwik.dev/core@2.0.0-rc.0`). Packages were renamed from `@builder.io/qwik(-city)` to `@qwik.dev/core` / `@qwik.dev/router`. In v2, "each `routeLoader$` has its own JSON endpoint" and is separately cacheable. The repo is `QwikDev/qwik` (moved to the QwikDev org in 2024) — [Classmethod: Qwik 2 RC changes](https://dev.classmethod.jp/en/articles/qwik-2-rc-changes/). Latest on npm is `@qwik.dev/core` 2.0.0-rc.4 (2026-10-25). The v1 line `@builder.io/qwik` 1.20.3 still ships — [npm: @qwik.dev/core](https://registry.npmjs.org/@qwik.dev/core); [npm: @builder.io/qwik](https://registry.npmjs.org/@builder.io/qwik)

**Typical persistence pairing**
- Drizzle is the common thread. It is used inside Astro DB ([npm: @astrojs/db](https://registry.npmjs.org/@astrojs/db)), named as the drop-in for Remix 3's data-table ([Remix 3 RC](https://remix.run/blog/remix-3-release-candidate)), and integrates "cleanly" with Zero ([johnny-sh: Choosing a sync engine in 2026](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)). Its peer list spans pg, postgres, libsql, better-sqlite3, PGlite, Neon, PlanetScale, D1/Durable Objects, op-sqlite and others — [npm: drizzle-orm](https://registry.npmjs.org/drizzle-orm)
- TanStack announced a Prisma partnership (Aug 14, 2025) aimed at "helping developers get from a new app to a working Postgres database" — [TanStack blog index](https://tanstack.com/db/latest/docs/blog)

### Inferences
- Across these frameworks, the swappable layers are: the router (React Router in Data mode is usable without Framework mode, and Solid Router is separate from SolidStart), the client cache (TanStack Query/DB slot in anywhere), and the ORM (Drizzle/Prisma are framework-independent). What is *not* swappable is the build pipeline (Vite/Turbopack plugins, `'use server'` compile-time transforms, `*.remote.ts` codegen). Server functions and actions all depend on a compiler splitting client from server code.
- Remix 3's package set is the most "pull out a chunk" friendly of the meta-frameworks. `fetch-router`, `route-pattern`, `headers`, `form-data-parser`, `session`, `file-storage` and `data-table` are Fetch-API-based server packages that could back a vanilla front end. This is inferred from the package list and the "stand on their own" claim, not tested.
- SvelteKit `query.live`'s async-generator-per-query model (SSR gets the first value, the client stays subscribed) is the only meta-framework-native streaming primitive. It resembles a per-`Page` websocket subscription in the user's design.

### Gaps
- No primary source fetched for SvelteKit 3.0's official release notes (only a secondary Chinese-language blog and npm dates).
- No source found for Nuxt's real-time story (Nitro WebSockets / crossws) or for NuxtHub/db0 as the database pairing. The search budget was exhausted before these could be checked.
- Qwik's current governance (Builder.io vs. community) isn't confirmed beyond the 2024 org move.
- Remix 3 component runtime: whether it is a Preact fork (InfoQ) or new code (Remix blog wording) wasn't resolved.

---

## 3. Server-driven stacks (Phoenix LiveView + Ecto, Hotwire/Turbo Streams + Rails ActiveRecord/Action Cable, Laravel Livewire/Reverb, htmx + SSE)

### Takeaway
These keep the model on the server (Ecto, ActiveRecord, Eloquent) and push HTML or diffs over a WebSocket or SSE. The trend in 2025–2026 is toward *coarse refresh + DOM morphing* instead of fine-grained stream actions (Turbo 8 `broadcasts_refreshes`, htmx 4 built-in morph swaps, LiveView keyed change tracking), and toward fewer infrastructure pieces (Rails 8 Solid Cable removes Redis). The client JS for each is small, zero-dependency and ships as ESM. The server half, however, cannot be separated from its language and runtime.

### Cited Findings

**Phoenix LiveView + Ecto**
- LiveView 1.1 (July 30, 2025): colocated hooks (JS written inside HEEx components and "automatically extract[ed]... at compile time"), keyed comprehensions (`:key` on `:for`), change tracking in comprehensions by default, `<.portal>`, and TypeScript declarations for the JS API. Streams handle large collections "without keeping items in server memory," and changes go through `stream_insert/4` — [Phoenix blog: LiveView 1.1](https://phoenixframework.org/blog/phoenix-liveview-1-1-released)
- Phoenix provides built-in PubSub, Channels and Presence across nodes, and the home page claims "millions of WebSocket connections." Ecto has built-in Postgres, MySQL, SQLite and SQL Server support. A sample `TimelineLive` subscribes to a PubSub topic and `stream_insert`s incoming items — [phoenixframework.org](https://www.phoenixframework.org/)
- The JS clients are standalone and zero-dependency: `phoenix` 1.8.16 ships `priv/static/phoenix.mjs`, and `phoenix_live_view` 1.2.13 ships an ESM build. Supabase's `@supabase/realtime-js` depends on `@supabase/phoenix` — [npm: phoenix](https://registry.npmjs.org/phoenix); [npm: phoenix_live_view](https://registry.npmjs.org/phoenix_live_view); [npm: @supabase/realtime-js](https://registry.npmjs.org/@supabase/realtime-js)

**Hotwire / Rails**
- Hotwire was "created by the team at 37signals to power HEY" (the same makers also ship Basecamp, Fizzy and ONCE). Turbo streams partial page updates over WebSocket, and Stimulus covers the remaining JS "using a HTML-centric approach to state and wiring" — [hotwired.dev](https://hotwired.dev/)
- Turbo 8 data path: a model with `broadcasts_refreshes` "will publish when a model has been created, updated, or destroyed" over Action Cable. It does not send HTML. The view has `<%= turbo_stream_from @post %>`, and the layout has `turbo_refreshes_with method: :morph, scroll: :preserve`. On a signal, Turbo re-requests the page over HTTP and morphs the DOM diff. `belongs_to :blog, touch: true` cascades refreshes to the parent — [Fly.io: Turbo 8 in 8 minutes](https://fly.io/ruby-dispatch/turbo-8-in-8-minutes/)
- 37signals: stream actions "remain Turbo's most responsive mechanism" but "are costly," and page refreshes "should reduce the need to use those" — [37signals dev: page refreshes with morphing demo](https://dev.37signals.com/page-refreshes-with-morphing-demo/)
- Rails 8 Solid Cable: the default Action Cable adapter, storing messages in a DB table that subscribers poll. It "eliminates Redis as a dependency for real time features." `polling_interval` defaults to 0.1 s (up to ~100 ms latency). The classic fine-grained pattern is `after_create_commit -> { broadcast_append_to post }` — [Saeloun: Rails 8 Solid Cable](https://blog.saeloun.com/2026/05/26/rails-8-solid-cable-database-backed-websockets/)
- `@hotwired/turbo` 8.0.23 (2026-01-29) ships `dist/turbo.es2017-esm.js` with zero dependencies. `@rails/actioncable` 8.1.400 ships `actioncable.esm.js` — [npm: @hotwired/turbo](https://registry.npmjs.org/@hotwired/turbo); [npm: @rails/actioncable](https://registry.npmjs.org/@rails/actioncable)

**Laravel Livewire / Reverb**
- Reverb is Laravel's first-party WebSocket server ("seamless integration with Laravel's existing suite of event broadcasting tools"). It is installed via `php artisan install:broadcasting` and scales horizontally via Redis pub/sub (`REVERB_SCALING_ENABLED=true`). Production needs raised file limits and an `ext-uv` loop — [Laravel 13.x docs: Reverb](https://laravel.com/framework/docs/13.x/reverb)
- Livewire 4 was announced at Laracon US, Aug 2025 — [freek.dev](https://freek.dev/2901-livewire-4-the-future-of-php-components). It includes single-file components, an `@island` directive "for isolating reactive UI parts," and a "Blaze rendering engine" — [devbytes, Dec 7 2025](https://devbytes.co.in/news/laravel-livewire-v4-is-now-available). Laravel Daily's roundup for the week of Jan 15, 2026 is headed "Livewire 4 Official Release" — [Laravel Daily](https://laraveldaily.com/post/this-week-in-laravel-livewire-4-laravel-claude-code-filament-v4-5). The sources conflict on the release date (Dec 2025 "launched" vs Jan 2026 "official release"). It may be beta vs stable.
- The `laravel-echo` client (2.6.3, 2026-10-27) is ESM with `pusher-js`/`socket.io-client` as peer dependencies — [npm: laravel-echo](https://registry.npmjs.org/laravel-echo)

**htmx + SSE**
- htmx 4.0.0 (Aug 28, 2026): moves from `XMLHttpRequest` to `fetch()`. It adds explicit attribute inheritance (`:inherited`, called "the largest upgrade burden"), events renamed to `htmx:phase:action`, no more localStorage history cache, built-in morph swaps, and `<hx-partial>`. Streaming comes via extensions: `hx-sse` (text/event-stream), `hx-ws` and `hx-multipart`. "htmx 2 will continue to be supported indefinitely," and npm keeps 2.x as `latest` and 4.0 as `next` until early 2027 — [htmx 4.0.0 announcement](https://four.htmx.org/announcements/2026-08-28-htmx-4.0.0-is-released); [What's new in htmx 4](https://four.htmx.org/whats-new-in-htmx-4); confirmed by [npm: htmx.org](https://registry.npmjs.org/htmx.org) (latest 2.0.11, next 4.0.0)

### Inferences
- In all four, "how changes reach the UI" is either (a) server-rendered HTML fragments targeted at DOM ids (Turbo Streams, htmx OOB/partials) or (b) "something changed, re-render and morph" (Turbo 8 refresh, LiveView diffs). Morphing is the common answer to keeping client state (focus, scroll) without a client model layer.
- The client halves (phoenix.mjs, Turbo ESM, actioncable ESM, htmx) can be lifted into a vanilla app. The Phoenix Channels client in particular is a general pub/sub websocket client with join/push/receive and Presence that Supabase reuses. But they all assume a server that renders HTML or speaks that framework's channel protocol.
- None of these is object-oriented on the client. On the server, ActiveRecord and Eloquent are classic OO active-record models, while Ecto is functional (schemas + changesets).

### Gaps
- No primary source fetched on Livewire 4's Echo/Reverb listener integration (`#[On('echo:...')]`). The Reverb doc page didn't describe it.
- No measurements found comparing LiveView server memory per connection in 2026.

---

## 4. BaaS and sync engines with real-time (Supabase Realtime, PocketBase, Convex, Appwrite, Firebase, InstantDB, Triplit, plus Zero/Electric/LiveStore/Jazz)

### Takeaway
PocketBase is the closest match to the user's world: a single Go binary, SQLite, SSE realtime with per-record create/update/delete events filtered by access rules, and a zero-dependency SDK with an ES-module build. But it is pre-1.0, has one volunteer maintainer, and its GitHub repo was **archived on Oct 26, 2026** with releases moving to the author's own site (which, at the time of the release note, had "nothing there yet"). Supabase now steers people from Postgres Changes to "Broadcast from Database" (triggers → `realtime.messages` → WAL → channels) for scale. Convex, Firebase, Appwrite, Instant and Parse all load from a script tag. **InstantDB is sunsetting** (services until Aug 31, 2027; team joining OpenAI). **Triplit** was acquired by Supabase (Oct 2025) and its client hasn't been published since July 2025. Treat both as stale. Zero reached 1.0 (June 2026) and is the most-recommended "Postgres + sync" engine in practitioner write-ups.

### Cited Findings

**Supabase Realtime**
- Three features: Broadcast (low-latency client messages), Presence (synchronized online state), and Postgres Changes ("Listen to database changes in real-time") — [Supabase docs: Realtime](https://Supabase.com/docs/guides/realtime)
- Broadcast is "the recommended method for scalability and security." Postgres Changes "requires less setup, but does not scale as well as Broadcast." Broadcast requires Realtime Authorization RLS policies on private channels — [Supabase: Subscribing to database changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes.md)
- Broadcast from Database (Apr 2, 2025): a trigger calls `realtime.broadcast_changes` (or `realtime.send`) and inserts into `realtime.messages`. Realtime reads the WAL via a replication slot on that table's publication and "broadcasts that message to the target channel right away." This suits "tens of thousands of connected users at once" — [Supabase blog: Realtime Broadcast from Database](https://supabase.com/blog/realtime-broadcast-from-database.md)
- `@supabase/supabase-js` 2.118.0 ships a UMD build (`dist/umd/supabase.js`, set as the unpkg/jsdelivr entry) and an ESM `dist/index.mjs`. It is composed of `auth-js`, `storage-js`, `realtime-js`, `functions-js` and `postgrest-js`, and a 3.0 line is in `next` — [npm: @supabase/supabase-js](https://registry.npmjs.org/@supabase/supabase-js)
- Supabase acquired Triplit (announced Oct 8, 2025). It does not plan to integrate Triplit directly and instead partners with ElectricSQL, Zero and PowerSync for offline — [Supabase blog: Triplit joins Supabase](https://supabase.com/blog/triplit-joins-supabase)

**PocketBase**
- An "Open Source backend in 1 file": embedded SQLite, realtime subscriptions, auth, file storage, and an admin dashboard at `/_/`. It can run standalone (`./pocketbase serve`) or be used as a Go framework, with JS or Go extensions. "Full backward compatibility is not guaranteed before reaching v1.0.0," and it is "NOT recommended for production critical applications yet" unless you accept manual migrations — [PocketBase docs](https://pocketbase.io/docs)
- Realtime is **SSE**. `GET /api/realtime` opens a stream and immediately sends `PB_CONNECT` with a clientId. `POST /api/realtime {clientId, subscriptions[]}` replaces the active subscriptions, and authorization happens on that first POST. Topics are `COLLECTION/*` or `COLLECTION/RECORD_ID`, and the collection **ListRule** or **ViewRule** decides who receives each event. Events are create/update/delete, carrying `e.action` and `e.record`. The server disconnects after 5 minutes idle and the client auto-reconnects — [PocketBase: Realtime API](https://pocketbase.io/docs/api-realtime)
- JS SDK: UMD `pocketbase.umd.js` and ESM `pocketbase.es.mjs`. Usage is `pb.collection('x').subscribe('*', cb)`, and `pb.authStore` (LocalStorage-backed, syncs across tabs) supports custom stores via `BaseAuthStore`. CRUD methods are `getList`, `getFullList`, `getFirstListItem`, `getOne`, `create`, `update` and `delete`. The README describes no offline support or write queue — [PocketBase JS SDK README](https://unpkg.com/pocketbase@0.26.1/README.html). npm `pocketbase` is at 0.28.1 (2026-09-05) with zero dependencies — [npm: pocketbase](https://registry.npmjs.org/pocketbase)
- FAQ: scales "Only on a single server, aka. vertical," yet "can easily serve 10 000+ persistent realtime connections" on a $4 VPS (2 vCPU/4 GB). It uses embedded SQLite in WAL mode with "no plans for supporting other databases," and suggests Litestream for replication. It is a "personal open source project with intentionally limited scope," with "no paid team or company behind it," and donations are no longer accepted — [PocketBase FAQ](https://pocketbase.io/faq/)
- JSVM extension: runs on goja, an "embedded ES5 JavaScript engine" with most of ES6 but "not fully spec compliant." It is "not a Node.js or browser environment," supports CommonJS only (ESM must be bundled first), and runs each handler as "a separate 'program'" with no `setTimeout`/`setInterval` — [PocketBase: JS overview](https://pocketbase.io/docs/js-overview/). Hooks look like `OnRecordCreateRequest("posts")`, routes like `routerAdd("GET", "/hello", ...)`, and the "JS VM mirrors the Go APIs" — [PocketBase: Use as framework](https://pocketbase.io/docs/use-as-framework/)
- **Status flag:** "This repository was archived by the owner on Oct 26, 2026. It is now read-only." v0.40.6 (23 Oct) is "most likely the last release here on GitHub," and "new releases will be fetched from `https://ganigeorgiev.com` *(there is nothing there yet)*." A parallel v0.22.x line (v0.22.57) is also maintained — [PocketBase GitHub releases](https://www.github.com/pocketbase/pocketbase/releases); [v0.40.6 release](https://www.github.com/pocketbase/pocketbase/releases/tag/v0.40.6)

**Convex**
- Script-tag use: `<script src="https://unpkg.com/convex@1.3.1/dist/browser.bundle.js">` exposes a global `convex`. `client.onUpdate("messages:list", args, cb)` subscribes and `client.mutation(...)` writes. This works only against functions "deployed to an existing Convex deployment" — [Convex: script tag](https://docs.convex.dev/client/javascript/script-tag)
- `ConvexClient` opens a WebSocket on construction. `onUpdate(query,args,cb,onError?)` returns an unsubscribe, and `setAuth(fetchToken)` handles auth. "Optimistic updates for mutations are not provided for this client" (wrap `BaseConvexClient` for that) — [Convex API: ConvexClient](https://docs.convex.dev/api/classes/browser.ConvexClient)
- Convex calls itself "the open-source reactive database," self-hostable via Docker or binary, and lists SQLite and Postgres among compatible stores — [convex-backend README](https://cdn.jsdelivr.net/gh/get-convex/convex-backend@main/README.md)
- Architecture per Sacra: a document store used through TypeScript, not SQL. It "tracks every field your queries touch" for automatic live updates, and functions run in V8 isolates (queries, ACID mutations, actions, HTTP actions, crons) — [Sacra: Convex](https://sacra.com/c/convex/)

**Appwrite**
- Apr 29, 2026: Realtime "now uses a message-based protocol on a single persistent WebSocket." Subscriptions are changed by messages, not by the connection URL, which previously hit URL-length limits. Channel helpers look like `Channel.tablesdb(db).table(t).row(id)`, and server-side Realtime queries look like `Query.equal('title', ['todo'])`. A handle exposes `unsubscribe()` per listener, `update()` changes channels or queries without reconnecting, and `disconnect()` closes everything — [Appwrite blog: message-based Realtime SDK](https://appwrite.io/blog/post/announcing-message-based-realtime-sdk.md)
- The `appwrite` web SDK 29.2.0 ships an IIFE build (`dist/iife/sdk.js`) and ESM — [npm: appwrite](https://registry.npmjs.org/appwrite)

**InstantDB**
- Vanilla API: `@instantdb/core`. Setup is `init({ appId, schema })` with `i.schema({entities:{todos: i.entity({...})}})`, reads use `db.subscribeQuery({ todos: {} }, cb)`, and writes use `db.transact(db.tx.todos[id()].update({...}))` (arrays for batches) — [Instant: Vanilla JS](https://www.instantdb.com/docs/start-vanilla). The npm package has a UMD `standalone/index.umd.js` (unpkg field) — [npm: @instantdb/core](https://registry.npmjs.org/@instantdb/core)
- Architecture: data is stored as triples `[entity, attribute, value]`, and InstaQL is translated to SQL on Postgres. On the client, InstaQL compiles to Datalog in a local engine. The server tails the Postgres WAL and sends websocket invalidations. Mutations apply to the local triple store instantly, offline mode is on by default, and mutations go to a persistent outbox that flushes in order — [Instant: About](https://www.instantdb.com/about)
- **Status flag:** "Instant is sunsetting. Services will continue until August 31st, 2027." The essay is titled "The Instant team joins OpenAI" — [Instant: About](https://www.instantdb.com/about); [Instant essays](https://www.instantdb.com/essays)

**Triplit**
- Architecture: a full client-side database (browser/Node/Deno), a Node sync server over websockets, property-level conflict resolution, relational querying, and pluggable storage (SQLite, IndexedDB, LevelDB, memory, Durable Objects) — [Triplit GitHub](https://github.com/aspen-cloud/triplit)
- **Status flag:** `@triplit/client` was last published 2025-07-31 (1.0.50) under the AGPL-3.0 license — [npm: @triplit/client](https://registry.npmjs.org/@triplit/client). A practitioner calls it "community-maintained" after the team was "acqui-hired" by Supabase in "August 2025" — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026). The Supabase announcement is dated Oct 8, 2025 — [Supabase](https://supabase.com/blog/triplit-joins-supabase). The two sources disagree on the date.

**Zero, Electric, LiveStore, Jazz (adjacent sync engines)**
- Zero 1.0 (June 8, 2026), "the first stable release of its general-purpose sync engine for the web." A `zero-client` in the app pairs with `zero-cache`, which "maintains a read-only replica of a Postgres database." ZQL runs "against the local cache first" and returns results "in the next frame." SSR is still on the roadmap. Founder Aaron Boodman calls Zero "just a fancy cache" that "cannot corrupt data" — [InfoQ: Zero 1.0](https://infoq.com/news/2026/06/zero-version-1). Current: `@rocicorp/zero` 1.11.3 — [npm](https://registry.npmjs.org/@rocicorp/zero)
- Electric syncs Postgres "shapes" (filtered table views) "through standard HTTP and JSON" — [Electric blog](https://electric.ax/blog/2025/07/29/super-fast-apps-on-sync-with-tanstack-db). The `@electric-sql/client` depends on `@microsoft/fetch-event-source` — [npm](https://registry.npmjs.org/@electric-sql/client). One practitioner calls Electric "radioactive waste that should be avoided at all costs" because of long polling and DIY write endpoints. This is an opinion — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- LiveStore uses event sourcing: "Events are instantly applied to the local database via materializers" (SQLite), and queries run locally with reactive results. Guides exist for React, Expo, Node and Vue, and it is Apache-2.0 — [LiveStore README](https://cdn.jsdelivr.net/npm/@livestore/livestore@0.4.0/README.md). It is pre-1.0 (0.5.0, 2026-10-15) with Effect peer dependencies — [npm](https://registry.npmjs.org/@livestore/livestore). Limitation: "one user must correspond to one sqlite instance" — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- Jazz CoValues are CRDTs with full history. CoMap is "last-write-wins strategy per-key," alongside CoList and CoFeed (per-session append-only feeds). Schemas use `co.map({ title: z.string(), ... })`, and updates go through `person.$jazz.set("firstName", v)` — [Jazz docs: CoValues](https://jazz.tools/docs/svelte/schemas/covalues)

### Inferences
- PocketBase's realtime is *record-event* level (create/update/delete per record, filtered by rules), not *query* level. There is no client cache, query engine, optimistic layer or offline outbox. A vanilla OO layer (`Item`/`List`) on top of `pb.collection().subscribe()` would provide exactly what is missing, and the SSE topic model (`collection/*`, `collection/id`) maps onto `List`/`Item` subscriptions. Given the archive and off-GitHub move, though, vendoring or pinning the binary and SDK would be prudent.
- Jazz CoFeed's "per-session append-only feed" and LiveStore's "events → materializers → SQLite" are both structurally close to the user's append-only JSONL delta logs. LiveStore is the event-sourcing analog, and Jazz is the CRDT-object analog with a `$jazz.set` setter like `Item.set`.
- Vendor-risk pattern: in 2025–2026 three hosted data products in this space were shut down, sunset or orphaned (Astro Studio, InstantDB, Triplit). Open-source, self-hostable, single-binary options carry less of this specific risk, but PocketBase shows single-maintainer risk instead.

### Gaps
- InstantDB's post-sunset plan for the open-source code and self-hosting wasn't confirmed (the essay body wasn't retrieved).
- Convex's license terms for self-hosting weren't confirmed (the README didn't state them).
- Supabase Realtime transport and protocol details (Phoenix channels over WebSocket) are inferred from the `@supabase/phoenix` dependency, not from Supabase docs.
- Firebase Realtime Database (vs Firestore) wasn't covered separately.
- PowerSync and RxDB weren't researched beyond their existence as TanStack DB adapters.

---

## 5. Data-fetching and caching layers (TanStack Query, TanStack DB in depth, Apollo/urql/Relay normalized caches)

### Takeaway
TanStack DB reached **1.0.0-rc.1 on Oct 29, 2026** (today). It is a reactive client "database" of typed *collections*, each fed by a pluggable *sync* function (`begin`/`write`/`commit`/`markReady`) and written to through `onInsert`/`onUpdate`/`onDelete` handlers, with differential-dataflow *live queries* (joins, where, orderBy) and separate optimistic state that rolls back. It is the closest modern equivalent to Backbone.Collection + Backbone.sync. The core package (`@tanstack/db`) is officially usable "without a framework," and there are adapters for React, Preact, Solid, Svelte, Vue and Angular. Collection adapters cover TanStack Query, Electric, PowerSync, RxDB, TrailBase, Convex (new) and local storage, with SQLite persistence and offline transactions. The custom-adapter docs include a WebSocket adapter example. TanStack Query's core and Apollo Client 4's core are both framework-free.

### Cited Findings

**TanStack DB: status and packages**
- npm `@tanstack/db` latest is `1.0.0-rc.1`, published 2026-10-29. It is `type: module` with 3 dependencies (`@tanstack/db-ivm`, `@tanstack/pacer-lite`, `@standard-schema/spec`) and MIT license. Framework adapters `@tanstack/solid-db`, `svelte-db`, `vue-db`, `angular-db` and `preact-db` are all 1.0.0-rc.1 on the same date — [npm: @tanstack/db](https://registry.npmjs.org/@tanstack/db); [npm: @tanstack/preact-db](https://registry.npmjs.org/@tanstack/preact-db)
- The "TanStack DB 1.0 RC1: Going All In on Oracles" post (Oct 29, 2026) says "the API is powerful, production-ready, and stable" after eighteen months. Preact is "our sixth framework adapter," and Neon Realtime and Convex are new collection adapters. "Oracles" means testing against independent reference models. No final 1.0 date is given — [TanStack blog: DB 1.0 RC1](https://tanstack.com/blog/tanstack-db-1.0-rc1-going-all-in-on-oracles). `@tanstack/convex-db-collection` 1.0.0-rc.1 exists. A `@tanstack/neon-db-collection` package name returned 404, so the Neon adapter's package name is unverified — [npm: @tanstack/convex-db-collection](https://registry.npmjs.org/@tanstack/convex-db-collection)
- Timeline: 0.1 (Jul 30, 2025), "the Embedded Client Database for TanStack Query"; 0.5 (Nov 12, 2025), "Query-Driven Sync," where a component's query becomes the API call; 0.6 (Mar 25, 2026), persistence, offline and hierarchical data; 1.0 RC1 (Oct 29, 2026). The TanStack + Electric partnership (May 25, 2025) has Electric co-building DB — [TanStack DB blog index](https://tanstack.com/db/latest/docs/blog)
- Installation: adapters are `@tanstack/react-db`, `preact-db`, `solid-db`, `svelte-db`, `vue-db` and `angular-db`. "Install the core @tanstack/db package to use DB without a framework." Collection packages are `query-db-collection`, `electric-db-collection`, `trailbase-db-collection`, `powersync-db-collection` (with `@powersync/web` + wa-sqlite) and `rxdb-db-collection`, plus `browser-db-sqlite-persistence` (with wa-sqlite). LocalStorage, LocalOnly and IndexedDB collections are built into core — [TanStack DB: Installation](https://tanstack.com/db/latest/docs/installation)
- The TanStack "Vanilla libraries" page lists DB (still labeled "beta" there, now outdated) among vanilla-usable libraries. Query is *not* listed there — [TanStack: Vanilla libraries](https://tanstack.com/libraries/vanilla)

**TanStack DB: model**
- "TanStack DB is the reactive client store for your API." Collections are typed sets of objects filled by fetching, syncing, local storage or other live queries. Sync modes are eager (default), on-demand and progressive. Live queries run on d2ts (differential dataflow) and update incrementally, with "~0.7ms" to update one row in a sorted 100,000-item collection. Joins are supported, and each query result is itself a collection. Optimistic mutations apply immediately, then run handlers. "Optimistic state is separate from synced data and is rolled back if a handler throws." `createOptimisticAction` and `createTransaction` cover custom multi-step mutations. Standard Schema (Zod/Valibot/ArkType/Effect) handles validation — [TanStack DB: Overview](https://tanstack.com/db/latest/docs/overview)
- Live queries: `createLiveQueryCollection((q) => q.from({ user: usersCollection }).where(({user}) => eq(user.active, true)).select(...))`, read via `.toArray`, `.get(k)` and `.has(k)`. Operators include `gt`, `lt`, `inArray`, `and` and `or`. Joins must be equality joins (left by default). Results support `orderBy`, `limit` and `offset`. Options are `startSync` and `gcTime` (default 5000 ms) — [TanStack DB: Live queries](https://tanstack.com/db/latest/docs/live-queries)
- Collection API (vanilla-relevant): `subscribeChanges(callback, { includeInitialState, where })` returns a subscription. `insert(data|data[])`, `update(id, draft => {...})` and `delete(keys)` each return a `Transaction`. Also available are `toArray`, `get`, `has`, `preload()`, `stateWhenReady()`, `cleanup({dependents})`, `status` and `utils` — [TanStack DB API: CollectionImpl](https://tanstack.com/db/latest/docs/reference/classes/CollectionImpl)
- **Custom sync adapter (the Backbone.sync analog):** `sync: (params) => { const { begin, write, commit, markReady, fail } = params; ... }`, where `write({ type: 'insert'|'update'|'delete', value })` is grouped by `begin()`/`commit()` (atomic) and `getKey` is required. Handlers are either user-supplied (Pattern A) or implemented by the adapter (Pattern B). The documented WebSocket adapter connects, sends `{type:'sync'}`, loads the snapshot in one `begin/write/commit` then calls `markReady()`, applies live insert/update/delete messages as batched transactions, and in `onInsert`/`onUpdate`/`onDelete` sends mutations with an id and waits for a matching `ack` (10 s timeout). Cleanup closes the socket — [TanStack DB: Collection options creator](https://tanstack.com/db/latest/docs/guides/collection-options-creator)
- 0.6 additions: SQLite as the single persistence layer (browser via "SQLite WASM," plus Node, Electron, React Native/Expo, Tauri, Capacitor and Cloudflare Durable Objects), described as the "first *alpha* release of persistence." Also `@tanstack/offline-transactions` for durable writes, a `schemaVersion` option, "includes" (nested subqueries that project normalized collections into UI-shaped trees, with child collections by default), `createEffect` (enter/update/exit on query results), and virtual props `$synced`, `$origin`, `$key` and `$collectionId`. Indexes became opt-in — [TanStack DB 0.6](https://tanstack.com/blog/tanstack-db-0.6-app-ready-with-persistence-and-includes)
- Electric data path: Postgres → shape stream over HTTP → `electricCollectionOptions` → `useLiveQuery`. A mutation writes optimistic state, the `onUpdate` handler posts to your API (e.g. a generic `/ingest`), and the server returns the Postgres txid. `utils.awaitTxId(txid)` waits for that transaction on the replication stream, then drops the optimistic state — [Electric: Super-fast apps on sync with TanStack DB](https://electric.ax/blog/2025/07/29/super-fast-apps-on-sync-with-tanstack-db)
- Practitioner opinion: writing with Electric + TanStack DB was an "uphill battle" — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)

**TanStack Query**
- `@tanstack/query-core` exports `QueryClient`, `QueryObserver`, `QueriesObserver`, `InfiniteQueryObserver`, `MutationObserver`, `QueryCache`, `MutationCache`, `Query` and `Mutation` — [query-core type declarations](https://cdn.jsdelivr.net/npm/@tanstack/query-core/build/modern/index.d.ts). It has zero dependencies and is ESM (5.105.0, 2026-10-26) — [npm: @tanstack/query-core](https://registry.npmjs.org/@tanstack/query-core)
- `QueryClient.mount()` is "called by a framework adapter's QueryClientProvider-equivalent." `fetchQuery()` is deprecated in favor of `queryClient.query(options)`. `invalidateQueries()` marks matches stale and refetches — [TanStack Query: QueryClient](https://tanstack.com/query/latest/docs/reference/QueryClient)
- Usage: 68% of State of React 2025 respondents, 42% positive and 1% negative sentiment — [The Register](https://www.theregister.com/2026/02/17/react_survey_shows_tanstack_gains/)

**Apollo / urql / Relay**
- Apollo Client 4.0 (Sep 3, 2025): "React has never been required." In 4.0, "all top-level exported members" are free of React, and hooks moved to `@apollo/client/react`. RxJS replaces zen-observable as a peer dependency, and bundles are 20–30% smaller (local state is opt-in) — [Apollo blog: Apollo Client 4.0](https://www.apollographql.com/blog/announcement/frontend/announcing-apollo-client-4-0). Current: 4.3.5, ESM `core/index.js` — [npm: @apollo/client](https://registry.npmjs.org/@apollo/client)
- `@urql/core` 6.0.3 ships ESM `dist/urql-core.mjs` and depends on `wonka` and `@0no-co/graphql.web` — [npm: @urql/core](https://registry.npmjs.org/@urql/core). `relay-runtime` 21.0.1 depends on `fbjs`, `invariant` and `@babel/runtime`, with no `module` field — [npm: relay-runtime](https://registry.npmjs.org/relay-runtime)

### Inferences
- TanStack DB's `sync({begin, write, commit, markReady})` + `onInsert/onUpdate/onDelete` is a direct, more rigorous successor to `Backbone.sync(method, model, options)`. It adds transactional batches, a ready state, optimistic/synced separation and rollback. The documented WebSocket adapter is nearly the user's architecture: snapshot on connect, then delta messages, then ack-based writes. A JSONL delta log replayed through `write()` calls inside `begin/commit` would be a natural adapter.
- What TanStack DB does *not* give: model classes. Rows are plain objects keyed by `getKey`, and mutation goes through `collection.update(id, draft => ...)`. The user's `Item` instances would have to wrap rows (e.g., `Item` observing `subscribeChanges` filtered to its key), or TanStack DB could serve only as the indexing/live-query engine behind `List`.
- TanStack DB is TypeScript-first and ships ESM with three small dependencies (one of which, `db-ivm`, depends on `fractional-indexing`). Loading it from an ESM CDN that rewrites bare imports (esm.sh-style) or via an import map is plausible, but this was **not** tested. Apollo 4's RxJS peer and Relay's compiler-centric design make them poorer fits for a no-bundler, non-GraphQL project.
- Normalized GraphQL caches (Apollo InMemoryCache, urql graphcache, Relay store) solve "one object, many queries" by `__typename:id` normalization. That is the same problem a `Page`-nested `Item` identity map solves. Only relevant if GraphQL is in play.

### Gaps
- Not verified: actually importing `@tanstack/db` from esm.sh or jsdelivr `+esm` in a browser. CDN egress was blocked from the research sandbox (403).
- The 1.0 RC migration guide (list of breaking API changes from 0.x) wasn't fetched.
- Apollo InMemoryCache / urql graphcache / Relay normalized-cache internals weren't fetched, because the search budget was exhausted.
- The package name for the Neon Realtime collection adapter is unconfirmed.

---

## 6. Which ecosystems have a recognized "model + collection + sync adapter" pattern like Backbone.sync, and is there a modern equivalent?

### Takeaway
The explicit pattern survives in four places. **TanStack DB collections** (sync function + mutation handlers, the clearest modern equivalent, framework-agnostic, 1.0 RC as of Oct 29, 2026). **WarpDrive** (Store + RequestManager handlers + schemas; replaced Ember Data's Adapter/Serializer and Model classes). **Parse** (OO `Parse.Object` subclasses + `Parse.Query` + LiveQuery, but tied to Parse Server). **Meteor** (Mongo `Collection` on both ends + DDP as the sync protocol, tied to Meteor/Mongo). The most OO precedent with delta-log sync, Linear's in-house engine (decorated model classes + MobX observables + object pool + transaction queue + websocket delta packets + `lastSyncId`), is not a product but is well documented through reverse engineering.

### Cited Findings
- Backbone: `sync(method, model, [options])`, overridable globally or per model/collection, e.g. to use WebSockets or Local Storage — [backbonejs.org](https://backbonejs.org/)
- TanStack DB: custom collections implement `sync(params)` with `begin`/`write`/`commit`/`markReady`/`fail`, a required `getKey`, and `onInsert`/`onUpdate`/`onDelete`. A WebSocket adapter is the documented example — [TanStack DB: Collection options creator](https://tanstack.com/db/latest/docs/guides/collection-options-creator). Shipped adapters include Query, Electric, PowerSync, RxDB, TrailBase, Convex, LocalStorage, LocalOnly and IndexedDB — [TanStack DB: Installation](https://tanstack.com/db/latest/docs/installation); [TanStack DB 1.0 RC1](https://tanstack.com/blog/tanstack-db-1.0-rc1-going-all-in-on-oracles)
- WarpDrive: "Schema objects" replace Model classes, and "Request builders" and "Handlers" replace Adapters and Serializers — [ember-data README](https://fastly.jsdelivr.net/npm/ember-data@5.9.1/README.md). Store subclassing and `RequestManager().use([...handlers])` are shown in the [WarpDrive guide](https://emberjs.github.io/data/guide)
- Parse: `class X extends Parse.Object` + `registerSubclass`, `get`/`set`/`save`/`saveEventually`, and LiveQuery subscribe events — [Parse JS guide](https://docs.parseplatform.org/js/guide/)
- Meteor: Minimongo client collections kept in sync by DDP publications — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/); DDP `added/changed/removed` per collection — [DDP spec](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md)
- Linear (reverse-engineered): models are classes registered via a `ClientModel` decorator, with `Property`/`Reference` decorators (paired `assignee`/`assigneeId`) and load strategies `instant`/`lazy`/`partial`/`explicitlyRequested`/`local`. Observability uses `Object.defineProperty` getters/setters (MobX), and setters record old/new values for transaction generation. An Object Pool (`modelLookup` map on `SyncClient`) holds instances. IndexedDB holds one DB per workspace, a table per model plus `_meta` (`lastSyncId`) and `_transaction`. Bootstrap is full, partial (sync groups) or local plus deltas. Client edits update in-memory models and are packaged as transactions (queue persisted, sent as GraphQL mutations). "Client-side operations will never directly modify the tables in the local database!" Local tables change only when server-broadcast **delta packets** arrive over WebSocket, and a gap in `lastSyncId` triggers fetching the missing packets — [wzhudev: reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine). Linear confirms it has a "realtime sync engine" (talk by Tuomas Artman, June 29, 2023) — [Linear: Scaling the Linear sync engine](https://linear.app/now/scaling-the-linear-sync-engine)
- Jazz: object-like CRDT values (`co.map`, `co.list`) with setter-based mutation (`$jazz.set`) — [Jazz docs](https://jazz.tools/docs/svelte/schemas/covalues)

### Inferences
- For an OO vanilla framework with get/set + change events, the best *design* reference is Linear's engine (it is literally observable model classes + an identity map + transactions + ordered delta packets). The best *off-the-shelf component* is TanStack DB's collection + sync contract, used underneath `List` for indexing, joins and live queries. Backbone remains the simplest *mental model* to keep at the `Item.sync` seam.
- The industry moved away from mutable model classes (Ember → WarpDrive immutable records, TanStack DB plain rows, React-era immutability). The user's OO approach is now a minority design. Linear, Parse and Jazz show it still works at scale.
- The `lastSyncId` monotonic counter is a strong idea to adopt for JSONL logs: each line gets a sequence number, and reconnecting clients request "everything after N." DDP's `updated` message and Electric's `awaitTxId` are two other variants of "tell the client when its write has round-tripped."

### Gaps
- Linear's server-side store is ambiguous. The reverse-engineering write-up shows a bootstrap response `"method": "mongo"` and doesn't mention Postgres, and Linear's official post wasn't retrievable in detail.
- RxDB (which has an ORM-ish document/collection API) wasn't examined.

---

## 7. Which pieces are realistically usable from plain ESM in the browser without a bundler?

### Takeaway
Client SDKs for BaaS are the most bundler-free part of the landscape. **PocketBase** (zero-dep `pocketbase.es.mjs`), **Firebase** (official gstatic ESM URLs), **Convex** (script-tag bundle), **Supabase** (UMD), **Appwrite** (IIFE), **Instant** (UMD), **Parse** (unpkg min.js) and **Backbone** (UMD) all have documented or packaged browser builds. Server-driven client libraries are also fine: **htmx**, **Turbo** (zero-dep ESM), **phoenix.mjs**, **LiveView ESM** and **Action Cable ESM**. **TanStack Query core** (zero deps) and **TanStack DB core** (3 deps) are ESM and probably work through an ESM CDN or import map, but this is untested. **WarpDrive** and **Relay** look build-tool dependent. Every **meta-framework** requires Vite/Turbopack. Remix 3 goes furthest toward "unbundled" serving but still uses JSX/TS.

### Cited Findings
- PocketBase SDK: UMD `pocketbase.umd.js` via script tag, or `<script type="module">` importing `pocketbase.es.mjs` — [PocketBase JS SDK README](https://unpkg.com/pocketbase@0.26.1/README.html). Zero dependencies — [npm: pocketbase](https://registry.npmjs.org/pocketbase)
- Firebase: `import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'` (and `-firestore.js`, `-auth.js`) — [Firebase alt setup](https://firebase.google.com/docs/web/alt-setup?hl=en)
- Convex: `<script src="https://unpkg.com/convex@1.3.1/dist/browser.bundle.js">` with global `convex`. The backend functions still must be deployed with Convex tooling — [Convex: script tag](https://docs.convex.dev/client/javascript/script-tag)
- Supabase-js: unpkg/jsdelivr entry `dist/umd/supabase.js` — [npm: @supabase/supabase-js](https://registry.npmjs.org/@supabase/supabase-js)
- Appwrite: `dist/iife/sdk.js` — [npm: appwrite](https://registry.npmjs.org/appwrite)
- Instant: unpkg `standalone/index.umd.js` — [npm: @instantdb/core](https://registry.npmjs.org/@instantdb/core). The docs, however, show only npm + Vite setup — [Instant: Vanilla JS](https://www.instantdb.com/docs/start-vanilla)
- Parse: `https://unpkg.com/parse/dist/parse.min.js` — [Parse JS guide](https://docs.parseplatform.org/js/guide/)
- Backbone: UMD with an `underscore` dependency and no ESM main. An experimental ES module form exists only for debugInfo under `backbone/modules/` — [npm: backbone](https://registry.npmjs.org/backbone); [backbonejs.org](https://backbonejs.org/)
- htmx: unpkg/jsdelivr `dist/htmx.min.js`, zero dependencies — [npm: htmx.org](https://registry.npmjs.org/htmx.org). Turbo: `dist/turbo.es2017-esm.js`, zero dependencies — [npm: @hotwired/turbo](https://registry.npmjs.org/@hotwired/turbo). Phoenix: `priv/static/phoenix.mjs`, zero dependencies — [npm: phoenix](https://registry.npmjs.org/phoenix). LiveView: `phoenix_live_view.esm.js` — [npm: phoenix_live_view](https://registry.npmjs.org/phoenix_live_view). Action Cable: `actioncable.esm.js` — [npm: @rails/actioncable](https://registry.npmjs.org/@rails/actioncable)
- TanStack DB core is officially usable without a framework — [TanStack DB: Installation](https://tanstack.com/db/latest/docs/installation). It is `type: module` with 3 dependencies — [npm: @tanstack/db](https://registry.npmjs.org/@tanstack/db). TanStack Query core is zero-dependency ESM — [npm: @tanstack/query-core](https://registry.npmjs.org/@tanstack/query-core)
- WarpDrive core depends on `@embroider/macros` / `@warp-drive/build-config` — [npm: @warp-drive/core](https://registry.npmjs.org/@warp-drive/core). Relay runtime depends on `fbjs` and `@babel/runtime`, with no ESM field — [npm: relay-runtime](https://registry.npmjs.org/relay-runtime)
- Meta-frameworks: React Router Framework mode is "a Vite plugin" — [React Router modes](https://reactrouter.com/start/modes). SvelteKit, SolidStart and Qwik list `vite` as a peer dependency, Astro depends on `vite` — [npm: @sveltejs/kit](https://registry.npmjs.org/@sveltejs/kit); [npm: @solidjs/start](https://registry.npmjs.org/@solidjs/start); [npm: @qwik.dev/core](https://registry.npmjs.org/@qwik.dev/core); [npm: astro](https://registry.npmjs.org/astro). Next.js 16 makes Turbopack the default — [Next.js 16 beta](https://nextjs.org/blog/next-16-beta)
- Remix 3: "Improved unbundled asset serving for JavaScript, CSS, images, fonts, and npm packages" — [Remix 3 RC](https://remix.run/blog/remix-3-release-candidate). The umbrella package includes `@remix-run/multiple-import-maps-polyfill` — [npm: remix](https://registry.npmjs.org/remix)

### Inferences
- Realistic vanilla-ESM shortlist for the user: **PocketBase SDK** (as a transport/persistence backend), **phoenix.mjs** (if he ever wants a channel/presence protocol client), **htmx 4 / Turbo** (if adopting server-rendered fragments), and **@tanstack/db core** (as an in-browser collection/live-query engine behind `List`, subject to a CDN test). The Firebase, Convex and Supabase clients work unbundled, but they bind you to their hosted backends.
- Remix 3's import-map-polyfill dependency and "unbundled" serving suggest it serves ES modules via import maps at runtime, the closest of any framework to the user's no-bundler philosophy. It still expects JSX/TypeScript compiled by its runtime. This is inferred, not confirmed.

### Gaps
- None of the CDN loads were exercised in a real browser for this research. The sandbox's CDN access was blocked (403 from the proxy), so "works unbundled" for TanStack DB/Query, Instant UMD and Appwrite IIFE rests on package metadata, not tests.

---

## 8. What do people typically patch together (router + state + ORM + realtime + auth), and how many pieces is that?

### Takeaway
A typical 2026 React/Next-style app is assembled from about **5–8 separate pieces**: framework/router, client cache, ORM, database host, auth, real-time/sync service (often plus a separate presence service), and file storage. Meta-frameworks own only the first one or two, and none ships real-time. "Server-client communication" is a top-3 named pain point in State of JS 2025. The counter-trends compress this. BaaS (Supabase/PocketBase/Convex/Firebase/Appwrite) gives 1 backend + optional client cache. Batteries-included server frameworks (Rails 8 + Solid Cable, Phoenix with PubSub/Presence/Ecto, Laravel + Reverb) need 1 framework + DB. Remix 3 now bundles router, sessions, auth, data-table, file-storage and forms in one package.

### Cited Findings
- State of JS 2025 pain points: "Cognitive overload: 462," "Next.js issues: 302," "Server-client communication: 202," "Lock-in: 107." The median respondent uses 1 meta-framework (average 1.7) — [State of JS 2025](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/)
- Next.js 16 ships caching/revalidation APIs and Server Actions but no real-time or DB layer. Its example calls an external `db.users.update(...)` — [Next.js 16 beta](https://nextjs.org/blog/next-16-beta)
- Zero "just works" and integrates cleanly with Drizzle, but "real-time presence is not included, so cursor presence and chat needed separate infrastructure" — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- Productlane, after moving to Zero: "The Next.js app still serves public portal pages and some API functionality" (two app runtimes plus a managed Cloud Zero sync tier over Postgres) — [Productlane: Moving to Zero](https://feedback.clerk.com/blog/zero-migration)
- Electric + TanStack DB writes need your own write endpoint (`/ingest`) that returns txids. The read path (Electric) and write path (your API) are separate pieces — [Electric blog](https://electric.ax/blog/2025/07/29/super-fast-apps-on-sync-with-tanstack-db)
- Remix 3 bundles "request handlers, middleware, sessions, auth, forms, uploads" and "data and database management" — [InfoQ](https://infoq.com/news/2026/07/remix-3-beta-preview). Its dependency list includes `auth`, `session`, `data-table-*`, `file-storage-s3` and `fetch-router` — [npm: remix](https://registry.npmjs.org/remix)
- Rails 8 Solid Cable "eliminates Redis as a dependency for real time features" — [Saeloun](https://blog.saeloun.com/2026/05/26/rails-8-solid-cable-database-backed-websockets/)
- Phoenix bundles PubSub, Channels, Presence ("no extra dependency required") and Ecto — [phoenixframework.org](https://www.phoenixframework.org/)
- PocketBase bundles DB (SQLite), realtime, auth, file storage and an admin UI in one executable — [PocketBase docs](https://pocketbase.io/docs)
- Convex bundles DB, function runtime, scheduling and reactive queries — [Sacra](https://sacra.com/c/convex/)
- Supabase-js composes auth, storage, realtime, functions and PostgREST clients — [npm: @supabase/supabase-js](https://registry.npmjs.org/@supabase/supabase-js)

### Inferences
- Rough piece counts (my synthesis from the above, not a sourced statistic):
  - Next.js/React Router assembled stack: framework (1) + client cache such as TanStack Query/DB (2) + ORM such as Drizzle/Prisma (3) + Postgres host (4) + auth (5) + real-time/sync such as Zero, Electric or Supabase Realtime (6) + often presence/websocket service (7) + object storage (8). So **6–8 pieces**.
  - Rails 8/Phoenix/Laravel: framework incl. ORM, realtime and auth scaffolding (1) + DB (2), with Laravel adding a Reverb process (3). So **2–3 pieces**.
  - BaaS: backend (1) + optional client cache (2) + static hosting (3). So **1–3 pieces**.
  - The user's own system: Item/List/Page (client model) + websocket server + JSONL on disk. That is already a vertically integrated **1-piece** stack, equivalent in shape to PocketBase or Meteor.
- The "real-time" slot is where assembled stacks most often need an extra vendor, because meta-frameworks still treat the server as request/response (except SvelteKit's experimental `query.live`).

### Gaps
- No survey data found quantifying the average number of services per app. The counts above are inferred.
- Auth providers (Clerk, Better Auth, Auth.js) weren't researched individually. Clerk appears only as a peer dependency of Convex — [npm: convex](https://registry.npmjs.org/convex).

---

## 9. Simplifying concessions: the simple, popular setups, what you give up with each, and when you don't need more

### Takeaway
Each "simple" setup buys fewer moving parts by giving up one axis. **PocketBase** gives up horizontal scale, maintainer redundancy, a mature server-JS runtime and any client-side cache, offline support or optimistic layer. **Server-rendered + htmx/Turbo/LiveView** gives up offline use, instant optimistic UI and client-side query power, and LiveView also needs a persistent connection with per-user server state. **Firebase/Convex/Supabase/Instant** give up portability and take on vendor/business risk (Instant sunsetting, Astro Studio shut down, Triplit orphaned). **Meteor** gives up a SQL database and a large ecosystem. **Supabase Postgres Changes** gives up scale. These are acceptable when the app is single-region, small-to-mid scale (PocketBase cites 10k+ realtime connections on a $4 VPS), online-only, and has modest collaboration needs.

### Cited Findings
- **PocketBase**
  - Vertical scale only.
  - "10 000+ persistent realtime connections" on a $4 VPS.
  - SQLite only, "no plans for supporting other databases."
  - Volunteer project, "no paid team or company" — [PocketBase FAQ](https://pocketbase.io/faq/)
  - Pre-1.0, with no backward-compatibility guarantee; "NOT recommended for production critical applications yet" — [PocketBase docs](https://pocketbase.io/docs)
  - JSVM is ES5-ish goja, CJS-only, not Node — [PocketBase JS overview](https://pocketbase.io/docs/js-overview/)
  - SDK documents no offline or queued writes — [PocketBase SDK README](https://unpkg.com/pocketbase@0.26.1/README.html)
  - GitHub repo archived Oct 26, 2026, and future releases move to a personal site — [PocketBase releases](https://www.github.com/pocketbase/pocketbase/releases)
- **Server-rendered + htmx**
  - Contexte (Django) replaced a 2-year React UI with Django templates + htmx in ~2 months.
  - Codebase went from 21,500 to 7,200 LOC (Python grew from 500 to 1,200), JS dependencies from 255 to 9, and build time from 40 s to 5 s. Time-to-interactive improved 50–60%.
  - The whole team became full-stack, and the team reported "No reduction in the application's user experience."
  - Caveats: the essay is by htmx's author, the numbers are self-reported, and Contexte is a content-heavy app — [htmx essay: A real world React → htmx port](https://htmx.org/essays/a-real-world-react-to-htmx-port/)
  - htmx 4 drops the localStorage history cache and re-fetches on back navigation — [htmx 4.0.0](https://four.htmx.org/announcements/2026-08-28-htmx-4.0.0-is-released)
- **Hotwire/Rails 8**
  - Stream actions "are costly," while morph refreshes trade extra HTTP re-renders for simplicity — [37signals](https://dev.37signals.com/page-refreshes-with-morphing-demo/)
  - Solid Cable removes Redis but adds polling latency of up to ~100 ms and extra DB load — [Saeloun](https://blog.saeloun.com/2026/05/26/rails-8-solid-cable-database-backed-websockets/)
  - The `scroll: :preserve` morph can leave users mid-page on ordinary content pages — [Fly.io](https://fly.io/ruby-dispatch/turbo-8-in-8-minutes/)
- **LiveView**
  - Streams exist specifically to avoid "keeping items in server memory" for large collections, which implies per-connection server state is the default cost — [Phoenix blog](https://phoenixframework.org/blog/phoenix-liveview-1-1-released)
- **Firebase**
  - Built-in latency compensation and listeners — [Firestore docs](https://firebase.google.com/docs/firestore/query-data/listen)
  - Example of the exit cost: Mobbin "migrated 200,000 users from Firebase" to Supabase Auth — [Supabase customers](https://supabase.com/customers)
- **Supabase**
  - Postgres Changes is "a simpler method" that "does not scale as well as Broadcast." Broadcast requires triggers + RLS authorization — [Supabase docs](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes.md)
- **Convex**
  - The script-tag client works, but functions must be deployed via Convex, and the simple browser client has no optimistic updates — [Convex script tag](https://docs.convex.dev/client/javascript/script-tag); [ConvexClient API](https://docs.convex.dev/api/classes/browser.ConvexClient)
- **Hosted-product risk**
  - Instant: "Services will continue until August 31st, 2027" — [Instant](https://www.instantdb.com/about)
  - Astro Studio DBs inaccessible after March 1, 2025 — [Astro](https://astro.build/blog/goodbye-astro-studio/)
  - Triplit client unpublished since July 2025 — [npm: @triplit/client](https://registry.npmjs.org/@triplit/client)
- **Meteor**
  - Live queries are Mongo-only, and relational DBs get "no live queries" — [OpenReplay](https://blog.openreplay.com/meteor-js-relevant-2026/)
- **Full-sync "load everything" simplicity hits a ceiling**
  - Productlane's Replicache setup pulled "essentially all workspace data to the client." The first sync took "several minutes" in the worst cases, workspaces reached ">2GB and 100k rows," and mobile was near-unusable. This forced a partial-sync rewrite onto Zero — [Productlane: Moving to Zero](https://feedback.clerk.com/blog/zero-migration)
- **LiveStore**
  - Simple per-user SQLite, but "one user must correspond to one sqlite instance," which makes shared data hard — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)

### Inferences
- **When you don't need a sync engine or client DB:** single-user or small-team tools, online-only use, data per view in the thousands of rows, and tolerance for 50–200 ms round trips. Server-rendered + morph (htmx 4/Turbo 8) or PocketBase + a thin client model covers this. Linear-style engines are justified by heavy offline/instant-UI requirements and large shared object graphs.
- **When "load everything into the client" stops working:** Productlane's numbers (GB-scale workspaces, minutes-long first sync) are a concrete ceiling. The user's nested `Page` + per-page delta logs is effectively *partial sync by page*, which avoids that ceiling by design.
- **The user's own concession profile** is closest to PocketBase's: a single process, local files (JSONL vs SQLite), websocket (vs SSE) push, and vertical scaling. It shares the same strengths (one binary/process, no vendors) and the same weaknesses (no horizontal scale, single maintainer). What he gains over PocketBase is an OO client model with change events, which PocketBase leaves to the app.
- **Cheapest upgrade paths without abandoning simplicity:** (a) add monotonic sequence numbers to log lines for gap detection (as in Linear's `lastSyncId`); (b) adopt "refresh + morph" for views that don't need fine-grained deltas (as in Turbo 8); (c) if querying across items becomes painful, use TanStack DB core as an in-browser index/live-query engine behind `List`.

### Gaps
- No quantitative LiveView or Turbo per-connection cost data was found.
- No first-hand accounts were found of PocketBase in larger production deployments (the search budget was exhausted).

---

## 10. Named companies/products using each framework or platform, and how they wire the data path (extra logic around it)

### Takeaway
The best-documented wiring stories are Figma (LiveGraph: Postgres WAL → Kafka → in-memory live view trees → WebSocket JSON, with GraphQL-like views), Linear (OO model classes + MobX + IndexedDB + transaction queue + websocket delta packets), 37signals (HEY/Basecamp: Hotwire over Rails; Turbo 8 morph refreshes over Action Cable), Productlane (Replicache → Zero on Postgres + Next.js for public pages), and Contexte (React → Django + htmx). Named users were also found for Phoenix, Supabase, Instant and WordPress/Backbone. Convex, Meteor and PocketBase lack verified named customers in the sources reached.

### Cited Findings
- **Figma (custom: LiveGraph over Postgres):**
  - LiveGraph lets frontend code "request real-time data subscriptions expressed with GraphQL." It tails the Postgres replication log ("write-ahead log"), distributed via Kafka.
  - The server splits each view into a tree of join-free subqueries and keeps an in-memory "live view tree" plus an index of active subqueries per object type, then routes each change to the matching subqueries.
  - Clients get JSON over persistent WebSockets, with updates "guaranteed to be received in order and exactly once."
  - The client library is isomorphic with the server. React uses `useSubscription(View, args)`.
  - Optimistic updates are removed once the server confirms the write, and permission rules hide objects — [Figma blog: LiveGraph](https://www.figma.com/blog/livegraph-real-time-data-fetching-at-figma/)
- **Linear (custom sync engine):**
  - Decorated model classes with MobX observables, plus an object pool.
  - IndexedDB per workspace, with tables per model, `_meta.lastSyncId` and a `_transaction` outbox.
  - Writes become queued transactions sent as GraphQL mutations.
  - The server broadcasts delta packets over WebSocket to all clients, including the sender. Local tables update only from deltas — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine); [Linear](https://linear.app/now/scaling-the-linear-sync-engine)
- **37signals (Hotwire + Rails):** Hotwire was created "to power HEY," and the same makers ship Basecamp, Fizzy and ONCE — [hotwired.dev](https://hotwired.dev/). Turbo 8 morph refreshes were demoed by 37signals as reducing the need for "costly" stream actions — [37signals dev](https://dev.37signals.com/page-refreshes-with-morphing-demo/)
- **Productlane (Zero + Postgres + Next.js):**
  - Previously used Replicache (pull all workspace data).
  - Moved to Zero, which syncs only the rows needed by subscribed queries, and adopted Rocicorp's managed Cloud Zero.
  - Moved request scoring from frontend in-memory traversal into Postgres (counters + a precomputed field) because partial sync broke client-side traversal.
  - Rolled out in stages to 10%, then half, then everyone.
  - Next.js still serves public portal pages — [Productlane: Moving to Zero](https://feedback.clerk.com/blog/zero-migration)
- **nibfont (solo product, Zero + Drizzle):** chose Zero over LiveStore, Triplit and Electric, and needed separate infrastructure for cursor presence and chat — [johnny-sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **Contexte (Django + htmx):** a React SPA replaced by server templates + htmx, with metrics as listed in Q9 — [htmx essay](https://htmx.org/essays/a-real-world-react-to-htmx-port/)
- **Phoenix users:** Veeps, Bleacher Report, Inverse, Brightcove, Heroic Labs, Cargosense, Livebook, Podium and Fly.io (listed as Phoenix users, not specifically LiveView) — [phoenixframework.org](https://www.phoenixframework.org/)
- **Supabase users:** Mobbin (migrated 200,000 users from Firebase Auth), Pebblely (one million users in 7 months on Supabase Auth), Good Tape (managed Postgres + Auth), Berri AI (moved from AWS RDS to Supabase Vector), and Flick Games ("a two-person studio keeps two live games in sync on Supabase," implying Realtime) — [Supabase customers](https://supabase.com/customers). Sacra calls Supabase "the default recommendation for many AI-powered development platforms" — [Sacra](https://sacra.com/c/convex/)
- **Instant users:** HeroUI ("helps people build beautiful apps, on top of Instant") and Mirando ("transforms Latin-American Real-Estate on top of Instant"), per essay titles. Note that Instant is now sunsetting — [Instant essays](https://www.instantdb.com/essays)
- **Backbone users:** WordPress core bundles Backbone and tracks its releases (tickets updating to 1.6.0 and 1.6.1) — [WordPress Trac #63763](https://core.trac.wordpress.org/ticket/63763)
- **Supabase reuses Phoenix:** the Supabase realtime JS client depends on `@supabase/phoenix`, a Phoenix Channels client — [npm: @supabase/realtime-js](https://registry.npmjs.org/@supabase/realtime-js)
- **TanStack DB/Electric:** built by Kyle Mathews and Sam Willis (Electric) with Tanner Linsley (TanStack). Sam Willis built the d2ts differential dataflow engine — [Electric blog](https://electric.ax/blog/2025/07/29/super-fast-apps-on-sync-with-tanstack-db)

### Inferences
- The two most-cited "extra logic" patterns at scale are (1) **tail the DB's replication log and fan out deltas over WebSockets** (Figma LiveGraph, Instant's WAL tailing, Supabase Broadcast-from-DB, Meteor Change Streams, Electric shapes, Zero's zero-cache replica), and (2) **an ordered, acknowledged delta stream with a client outbox** (Linear's lastSyncId + transaction queue, Instant's persistent outbox, TanStack DB's offline-transactions, DDP's `updated`). The user's JSONL delta log + websocket already *is* pattern 1, with the file standing in for the WAL. Pattern 2 is the likely next addition.
- Companies that outgrow "one model of sync" tend to split read and write paths: reads via sync stream, writes via an API/mutation endpoint (Productlane/Zero, Electric `/ingest` + txid, Linear GraphQL mutations + delta broadcast).

### Gaps
- Convex named customers couldn't be verified: the customers page fetch failed, and Sacra names none.
- No named production users of PocketBase or Meteor were found in the sources reached. The Meteor showcase page returned no content, and the web-search budget was exhausted before further searching.
- No detail was found on how Basecamp/HEY wire Solid Cable vs Redis in production.
- Next.js and Nuxt named-company wiring stories weren't gathered beyond Productlane's Next.js use.
