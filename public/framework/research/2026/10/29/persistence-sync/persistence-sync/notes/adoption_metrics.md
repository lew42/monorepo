# Adoption and Health Metrics: JS/Node Data, Sync, Reactivity, Realtime and Backend Tools (snapshot 2026-10-29)

Companion data file: `adoption_metrics.csv` (same folder). It has 135 tool rows and these columns: category, tool, repo, stars, forks, open_issues_incl_prs, last_push, repo_created, archived, license, stars_per_year, primary_package, latest_version, latest_release_date, weekly_downloads, downloads_source, npm_dependents, flags, notes.

**How the data was collected, and its limits.** In this session `gh api` was restricted to attached repos and returned 403 for all others. GraphQL and api.npmjs.org were also blocked from the shell. GitHub numbers came instead from the public GitHub REST search API (`/search/repositories?q=repo:A+repo:B+repo:C+repo:D`, at most 4 repos per query), fetched 2026-10-29 between 22:30 and 23:10 UTC. An example is [GitHub search API batch](https://api.github.com/search/repositories?q=repo:yjs/yjs+repo:yjs/y-websocket+repo:ueberdosis/hocuspocus+repo:loro-dev/loro). Weekly npm downloads for 2026-10-22..2026-10-28 came from the [npm downloads API](https://api.npmjs.org/downloads/point/last-week/drizzle-orm,prisma,kysely,typeorm,sequelize,objection,mobx,zustand,jotai,valtio,immer,react,vue,svelte,next,solid-js,lit) for about 115 packages. Latest version, release date and npm "dependents" came from the [npm registry search API](https://registry.npmjs.org/-/v1/search?text=yjs&size=20) queried from the shell; its weekly counts are used only where the downloads API was not queried, and they can lag by about a week (yjs showed 12.5M in the index vs 15.2M from the API). Python, Elixir and PHP tools use [pypistats](https://pypistats.org/api/packages/faster-whisper/recent), [PyPI JSON](https://pypi.org/pypi/faster-whisper/json), [Hex.pm](https://hex.pm/api/packages/phoenix_live_view) and [Packagist](https://packagist.org/packages/livewire/livewire/stats). Contributor counts and star-history time series were **not** collected because the endpoints were unavailable. "Open issues" from GitHub's repo object **includes open PRs**.

## Q1. Master table and per-category leaders, momentum, and stale/abandoned flags

### Takeaway
Two layers have converged. Collaborative documents run on **Yjs**: 15.2M downloads/week, about 170x Automerge and 85x Loro, with a deep ecosystem of editor bindings. Relational/server persistence runs on **Postgres via Drizzle or Prisma**: Drizzle has overtaken Prisma in weekly downloads, 42.1M vs 25.8M. The "sync engine" layer between them is still fragmented and small. Outside Convex (2.4M/wk) and Electric's client (2.1M/wk, partly transitive), every local-first or sync engine is under 400k downloads/week. Several are being consolidated: Triplit's founder joined Supabase, Replicache was archived in favor of Zero, and Turso is being acquired by Supabase.

### Cited Findings

**Master table.** Stars, forks and push dates are from the [GitHub search API](https://api.github.com/search/repositories?q=repo:yjs/yjs+repo:yjs/y-websocket+repo:ueberdosis/hocuspocus+repo:loro-dev/loro). Downloads are from the [npm downloads API](https://api.npmjs.org/downloads/point/last-week/drizzle-orm,prisma,kysely,typeorm,sequelize,objection,mobx,zustand,jotai,valtio,immer,react,vue,svelte,next,solid-js,lit) unless the CSV `downloads_source` column says otherwise. Versions and dates are from the [npm registry](https://registry.npmjs.org/-/v1/search?text=yjs&size=20). "Stars/yr" is lifetime stars divided by repo age, which is a crude momentum proxy. Flags: ARCHIVED; NO_PUSH_12MO; PUSH_6-12MO; NO_RELEASE_12MO (the npm latest dist-tag is more than 12 months old).


**CRDT/sync**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Yjs | yjs/yjs | 23.0k | 819 | 156 | 2026-10-23 | 2014 | 13.6.33 (2026-09-23) | NOASSERTION | 15.2M (yjs) | 1.9k |  |
| y-websocket | yjs/y-websocket | 715 | 314 | 38 | 2026-10-28 | 2019 | 3.1.0 (2026-08-06) | MIT | 1.5M (y-websocket) | 93 |  |
| Hocuspocus (Yjs server) | ueberdosis/hocuspocus | 2.6k | 223 | 32 | 2026-10-28 | 2020 | 4.8.0 (2026-10-28) | MIT | 2.0M (@hocuspocus/server) | 443 |  |
| Y-Sweet (Yjs server) | jamsocket/y-sweet | 1.0k | 87 | 29 | 2025-12-04 | 2023 | - | NOASSERTION | - (-) | 311 | PUSH_6-12MO |
| Automerge | automerge/automerge | 6.7k | 278 | 140 | 2026-10-26 | 2019 | 3.5.0 (2026-09-16) | MIT | 88.1k (@automerge/automerge) | 979 |  |
| automerge-repo | automerge/automerge-repo | 716 | 105 | 105 | 2026-10-28 | 2022 | 2.6.0-alpha.3 (2026-08-07) | MIT | 47.0k (@automerge/automerge-repo) | 159 |  |
| Loro | loro-dev/loro | 6.3k | 195 | 83 | 2026-10-23 | 2022 | 1.17.1 (2026-10-22) | MIT | 177.2k (loro-crdt) | 1.5k |  |
| Replicache | rocicorp/replicache | 1.2k | 37 | 33 | 2022-05-07 | 2020 | 15.3.0 (2025-07-02) | null | 14.9k (replicache) | 182 | ARCHIVED NO_PUSH_12MO NO_RELEASE_12MO |
| Zero (rocicorp/mono) | rocicorp/mono | 3.4k | 169 | 166 | 2026-10-29 | 2023 | 1.11.3 (2026-10-23) | Apache-2.0 | 264.9k (@rocicorp/zero) | 922 |  |
| ElectricSQL | electric-sql/electric | 10.4k | 400 | 290 | 2026-10-06 | 2022 | 1.5.28 (2026-09-09) | Apache-2.0 | 2.1M (@electric-sql/client) | 2.4k |  |
| PGlite (Electric) | electric-sql/pglite | 16.2k | 467 | 163 | 2026-10-29 | 2024 | 0.5.13 (2026-10-28) | Apache-2.0 | 36.0M (@electric-sql/pglite) | 6.0k |  |
| PowerSync JS | powersync-ja/powersync-js | 736 | 100 | 59 | 2026-10-29 | 2023 | 2.5.0 (2026-10-19) | Apache-2.0 | 157.1k (@powersync/web) | 240 |  |
| LiveStore | livestorejs/livestore | 3.7k | 149 | 356 | 2026-10-27 | 2023 | 0.5.0 (2026-10-15) | Apache-2.0 | 11.1k (@livestore/livestore) | 1.2k |  |
| TinyBase | tinyplex/tinybase | 5.2k | 137 | 13 | 2026-10-22 | 2021 | 10.0.1 (2026-09-24) | MIT | 20.0k (tinybase) | 1.1k |  |
| Jazz (new relational, 2026 repo) | garden-co/jazz | 220 | 25 | 378 | 2026-10-29 | 2026 | - | MIT | - (-) | 270 |  |
| Jazz classic | garden-co/classic-jazz | 2.5k | 111 | 245 | 2026-10-26 | 2023 | 0.20.19 (2026-07-03) | MIT | 2.2k (jazz-tools) | 791 |  |
| Triplit | aspen-cloud/triplit | 3.1k | 104 | 41 | 2026-01-19 | 2023 | 1.0.50 (2025-07-31) | AGPL-3.0 | 284.5k (@triplit/client) | 952 | PUSH_6-12MO NO_RELEASE_12MO |
| InstantDB | instantdb/instant | 10.6k | 421 | 44 | 2026-10-19 | 2024 | 1.0.67 (2026-08-31) | Apache-2.0 | 368.7k (@instantdb/core) | 4.8k |  |
| RxDB | pubkey/rxdb | 23.4k | 1.2k | 16 | 2026-10-29 | 2016 | 17.6.0 (2026-10-05) | Apache-2.0 | 143.5k (rxdb) | 2.4k |  |
| Convex | convex/convex-backend | 12.8k | 842 | 259 | 2026-10-29 | 2024 | 1.48.0 (2026-10-22) | NOASSERTION | 2.4M (convex) | 4.8k |  |
| PartyKit (original) | partykit/partykit | 5.7k | 205 | 92 | 2026-10-09 | 2022 | 0.0.115 (2025-05-21) | MIT | 37.9k (partykit) | 1.5k | NO_RELEASE_12MO |
| PartyServer / partysocket | cloudflare/partykit | 1.3k | 84 | 44 | 2026-08-03 | 2024 | 0.5.10 (2026-08-03) | ISC | 2.4M (partyserver) | 538 |  |
| Liveblocks | liveblocks/liveblocks | 4.8k | 449 | 98 | 2026-10-29 | 2021 | 3.24.5 (2026-10-23) | NOASSERTION | 782.5k (@liveblocks/client) | 877 |  |
| GUN | amark/gun | 19.2k | 1.2k | 317 | 2026-10-15 | 2014 | 0.2020.1241 (2025-07-01) | NOASSERTION | 45.4k (gun) | 1.6k | NO_RELEASE_12MO |
| OrbitDB | orbitdb/orbitdb | 8.8k | 593 | 28 | 2026-05-14 | 2015 | 4.0.0 (2026-05-14) | MIT | 3.5k (@orbitdb/core) | 814 |  |
| PouchDB | apache/pouchdb | 17.6k | 1.5k | 196 | 2026-10-21 | 2010 | 9.0.0 (2024-06-21) | Apache-2.0 | 92.4k (pouchdb) | 1.1k | NO_RELEASE_12MO |
| Dexie.js | dexie/Dexie.js | 14.7k | 724 | 585 | 2026-10-27 | 2014 | 4.4.7 (2026-10-19) | Apache-2.0 | 3.4M (dexie) | 1.2k |  |

**ORM/storage**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Drizzle ORM | drizzle-team/drizzle-orm | 36.2k | 1.8k | 2059 | 2026-10-29 | 2021 | 0.45.4 (2026-10-08) | Apache-2.0 | 42.1M (drizzle-orm) | 6.8k |  |
| Prisma | prisma/orm | 47.7k | 2.6k | 2812 | 2026-10-29 | 2019 | 8.0.0-rc.28 (2026-10-27) | Apache-2.0 | 25.8M (prisma) | 6.5k |  |
| Kysely | kysely-org/kysely | 14.3k | 453 | 215 | 2026-10-29 | 2021 | 0.29.7 (2026-10-17) | MIT | 27.3M (kysely) | 2.5k |  |
| MikroORM | mikro-orm/mikro-orm | 9.3k | 697 | 56 | 2026-10-29 | 2018 | 7.2.5 (2026-10-09) | MIT | 1.4M (@mikro-orm/core) | 1.1k |  |
| TypeORM | typeorm/typeorm | 36.7k | 6.7k | 722 | 2026-10-29 | 2016 | 1.1.2 (2026-10-08) | MIT | 7.3M (typeorm) | 3.4k |  |
| Sequelize | sequelize/sequelize | 30.3k | 4.4k | 1104 | 2026-10-28 | 2010 | 6.37.8 (2026-03-07) | MIT | 4.1M (sequelize) | 1.9k |  |
| Objection.js | Vincit/objection.js | 7.3k | 636 | 133 | 2026-06-23 | 2015 | 4.4.1 (2026-10-26) | MIT | 356.1k (objection) | 636 |  |
| unstorage | unjs/unstorage | 2.7k | 206 | 136 | 2026-10-29 | 2021 | 2.0.0-beta.0 (2026-10-20) | MIT | 25.7M (unstorage) | 471 |  |
| Keyv | jaredwray/keyv | 3.2k | 202 | 1 | 2026-10-29 | 2017 | 6.1.0 (2026-10-06) | NOASSERTION | 217.6M (keyv) | 344 |  |
| lowdb | typicode/lowdb | 22.6k | 963 | 17 | 2026-03-27 | 2014 | 7.0.1 (2023-12-26) | MIT | 2.2M (lowdb) | 1.8k | PUSH_6-12MO NO_RELEASE_12MO |
| LokiJS | techfort/LokiJS | 6.8k | 476 | 35 | 2023-06-22 | 2013 | 1.5.12 (2021-04-20) | MIT | 748.4k (lokijs) | 514 | NO_PUSH_12MO NO_RELEASE_12MO |
| NeDB (@seald-io fork) | seald/nedb | 427 | 34 | 14 | 2026-08-18 | 2021 | 4.1.2 (2025-07-07) | MIT | 152.0k (@seald-io/nedb) | 78 | NO_RELEASE_12MO |
| better-sqlite3 | WiseLibs/better-sqlite3 | 7.5k | 485 | 76 | 2026-08-10 | 2016 | 13.0.3 (2026-08-05) | MIT | 15.3M (better-sqlite3) | 743 |  |
| libSQL | tursodatabase/libsql | 17.3k | 553 | 476 | 2026-10-17 | 2022 | 0.18.0 (2026-09-02) | MIT | 5.4M (@libsql/client) | 4.2k |  |
| Turso (Rust SQLite rewrite) | tursodatabase/turso | 25.1k | 1.5k | 1566 | 2026-10-29 | 2023 | v0.8.3 (2026-10-12) | MIT | - (-) | 7.9k |  |
| lmdb-js | kriszyp/lmdb-js | 684 | 55 | 90 | 2026-10-23 | 2019 | 3.5.9 (2026-10-23) | NOASSERTION | 8.8M (lmdb) | 91 |  |
| classic-level | Level/classic-level | 102 | 12 | 26 | 2026-04-01 | 2022 | 3.0.0 (2025-04-20) | MIT | 367.6k (classic-level) | 22 | PUSH_6-12MO NO_RELEASE_12MO |
| DuckDB Node Neo | duckdb/duckdb-node-neo | 199 | 51 | 34 | 2026-10-21 | 2024 | 2.0.0-r.1 (2026-10-21) | MIT | 3.2M (@duckdb/node-api) | 84 |  |
| DuckDB Node (legacy) | duckdb/duckdb-node | 91 | 37 | 58 | 2026-01-30 | 2023 | 1.4.4 (2026-01-30) | MIT | 303.9k (duckdb) | 29 | PUSH_6-12MO |
| fast-json-patch | Starcounter-Jack/JSON-Patch | 2.0k | 221 | 85 | 2026-10-28 | 2013 | 3.1.1 (2022-03-24) | MIT | 11.9M (fast-json-patch) | 146 | NO_RELEASE_12MO |
| Immer | immerjs/immer | 29.0k | 904 | 43 | 2026-10-22 | 2017 | 11.2.9 (2026-10-22) | MIT | 89.6M (immer) | 3.3k |  |
| superjson | ravionhq/superjson | 5.3k | 134 | 53 | 2026-06-18 | 2014 | 2.2.6 (2025-11-27) | MIT | 18.1M (superjson) | 447 |  |
| devalue | sveltejs/devalue | 2.8k | 103 | 21 | 2026-10-27 | 2018 | 6.0.3 (2026-10-13) | MIT | 24.4M (devalue) | 325 |  |
| seroval | lxsmnsyc/seroval | 735 | 18 | 12 | 2026-10-29 | 2023 | 1.7.5 (2026-10-29) | MIT | 33.1M (seroval) | 197 |  |
| fractional-indexing | rocicorp/fractional-indexing | 591 | 36 | 1 | 2026-08-26 | 2020 | 4.0.0 (2026-06-25) | CC0-1.0 | 4.7M (fractional-indexing) | 99 |  |

**Event sourcing**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Emmett | event-driven-io/emmett | 557 | 54 | 28 | 2026-10-26 | 2023 | 0.42.4 (2026-08-12) | null | 31.1k (@event-driven-io/emmett) | 154 |  |
| KurrentDB (EventStoreDB) server | kurrent-io/KurrentDB | 5.9k | 678 | 146 | 2026-10-27 | 2012 | - | NOASSERTION | - (-) | 416 |  |
| KurrentDB Node client | kurrent-io/KurrentDB-Client-NodeJS | 177 | 25 | 20 | 2026-08-24 | 2019 | 1.3.1 (2026-06-29) | Apache-2.0 | 28.8k (@kurrent/kurrentdb-client) | 26 |  |
| Castore | castore-dev/castore | 275 | 28 | 24 | 2025-10-12 | 2022 | 2.4.2 (2025-04-18) | MIT | 7.2k (@castore/core) | 65 | NO_PUSH_12MO NO_RELEASE_12MO |
| @nestjs/cqrs | nestjs/cqrs | 945 | 156 | 8 | 2026-10-29 | 2017 | 12.1.2 (2026-10-27) | MIT | 657.0k (@nestjs/cqrs) | 100 |  |

**Reactivity**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Preact Signals | preactjs/signals | 4.5k | 131 | 48 | 2026-10-27 | 2022 | 1.14.5 (2026-10-27) | MIT | 13.9M (@preact/signals-core) | 1.1k |  |
| alien-signals | stackblitz/alien-signals | 3.3k | 126 | 7 | 2026-10-29 | 2023 | 3.2.1 (2026-05-14) | MIT | 13.8M (alien-signals) | 1.1k |  |
| signal-polyfill (TC39) | proposal-signals/signal-polyfill | 393 | 32 | 31 | 2025-02-13 | 2024 | 0.2.2 (2025-01-17) | Apache-2.0 | 686.8k (signal-polyfill) | 157 | NO_PUSH_12MO NO_RELEASE_12MO |
| MobX | mobxjs/mobx | 28.2k | 1.8k | 18 | 2026-10-28 | 2015 | 7.1.3 (2026-10-27) | MIT | 4.7M (mobx) | 2.4k |  |
| mobx-state-tree | mobxjs/mobx-state-tree | 7.1k | 636 | 98 | 2026-10-23 | 2016 | 9.0.0 (2026-10-23) | MIT | 273.6k (mobx-state-tree) | 695 |  |
| mobx-keystone | xaviergonz/mobx-keystone | 629 | 28 | 16 | 2026-10-25 | 2019 | 2.4.1 (2026-10-11) | MIT | 62.6k (mobx-keystone) | 84 |  |
| Valtio | pmndrs/valtio | 10.2k | 295 | 6 | 2026-10-28 | 2020 | 2.3.2 (2026-05-01) | MIT | 3.2M (valtio) | 1.7k |  |
| Zustand | pmndrs/zustand | 58.9k | 2.2k | 4 | 2026-10-22 | 2019 | 5.0.16 (2026-10-22) | MIT | 85.9M (zustand) | 7.8k |  |
| Jotai | pmndrs/jotai | 21.3k | 730 | 2 | 2026-10-23 | 2020 | 3.0.1 (2026-09-29) | MIT | 9.1M (jotai) | 3.4k |  |
| Solid | solidjs/solid | 36.2k | 1.1k | 33 | 2026-10-29 | 2018 | 1.9.17 (2026-10-07) | MIT | 10.8M (solid-js) | 4.3k |  |
| @vue/reactivity | vuejs/core | 54.8k | 9.3k | 946 | 2026-10-29 | 2018 | 3.5.44 (2026-10-13) | MIT | 23.7M (@vue/reactivity) | 6.5k |  |
| Backbone | jashkenas/backbone | 28.1k | 5.3k | 65 | 2026-10-13 | 2010 | 1.6.1 (2025-04-01) | MIT | 1.5M (backbone) | 1.7k | NO_RELEASE_12MO |
| Knockout | knockout/knockout | 10.6k | 1.5k | 352 | 2026-03-25 | 2010 | 3.5.3 (2026-03-25) | NOASSERTION | 200.9k (knockout) | 647 | PUSH_6-12MO |
| Lit | lit/lit | 21.9k | 1.1k | 741 | 2026-10-22 | 2017 | 3.3.3 (2026-05-14) | BSD-3-Clause | 9.7M (lit) | 2.3k |  |
| morphdom | patrick-steele-idem/morphdom | 3.6k | 148 | 67 | 2026-01-24 | 2015 | 2.7.8 (2026-01-14) | MIT | 1.3M (morphdom) | 315 | PUSH_6-12MO |
| idiomorph | bigskysoftware/idiomorph | 1.2k | 57 | 15 | 2026-09-20 | 2022 | 0.8.0 (2026-09-05) | NOASSERTION | 112.5k (idiomorph) | 278 |  |
| udomdiff | WebReflection/udomdiff | 162 | 10 | 5 | 2026-07-15 | 2020 | 1.1.2 (2024-11-27) | ISC | 43.6k (udomdiff) | 24 | NO_RELEASE_12MO |
| ArrowJS | standardagents/arrow-js | 3.8k | 93 | 9 | 2026-07-01 | 2022 | 1.0.6 (2026-04-01) | MIT | 6.4k (@arrow-js/core) | 951 |  |
| uhtml | WebReflection/uhtml | 1.1k | 53 | 14 | 2026-06-09 | 2020 | 5.0.9 (2025-08-06) | MIT | 30.2k (uhtml) | 171 | NO_RELEASE_12MO |

**Framework/BaaS**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| React | react/react | 251.7k | 51.6k | 1528 | 2026-10-29 | 2013 | 19.3.1 (2026-10-14) | MIT | 246.5M (react) | 18.7k |  |
| Vue | vuejs/core | 54.8k | 9.3k | 946 | 2026-10-29 | 2018 | 3.5.44 (2026-10-13) | MIT | 24.1M (vue) | 6.5k |  |
| Svelte | sveltejs/svelte | 88.5k | 7.4k | 1231 | 2026-10-29 | 2016 | 5.57.3 (2026-10-26) | MIT | 9.0M (svelte) | 8.9k |  |
| Angular | angular/angular | 101.1k | 29.6k | 1110 | 2026-10-29 | 2014 | 22.2.4 (2026-10-29) | MIT | 8.2M (@angular/core) | 8.3k |  |
| Next.js | vercel/next.js | 143.2k | 34.2k | 3767 | 2026-10-29 | 2016 | 16.4.3 (2026-10-23) | MIT | 91.5M (next) | 14.2k |  |
| React Router (absorbed Remix 2) | remix-run/react-router | 56.6k | 11.0k | 224 | 2026-10-29 | 2014 | 8.5.1 (2026-10-27) | MIT | 74.4M (react-router) | 4.5k |  |
| Remix | remix-run/remix | 33.4k | 2.8k | 65 | 2026-10-29 | 2020 | 2.17.5 (2026-06-01) | MIT | 857.0k (@remix-run/node) | 5.6k |  |
| SvelteKit | sveltejs/kit | 20.9k | 2.4k | 923 | 2026-10-29 | 2020 | 3.1.0 (2026-10-14) | MIT | 4.5M (@sveltejs/kit) | 3.5k |  |
| Nuxt | nuxt/nuxt | 61.0k | 5.8k | 473 | 2026-10-29 | 2016 | 4.6.3 (2026-10-27) | MIT | 3.3M (nuxt) | 6.1k |  |
| Astro | withastro/astro | 63.6k | 3.9k | 118 | 2026-10-29 | 2021 | 7.4.4 (2026-10-28) | NOASSERTION | 10.7M (astro) | 11.3k |  |
| SolidStart | solidjs/solid-start | 5.9k | 424 | 6 | 2026-10-24 | 2021 | 2.1.0 (2026-10-22) | MIT | 135.4k (@solidjs/start) | 1.1k |  |
| Qwik | QwikDev/qwik | 22.1k | 1.4k | 123 | 2026-10-29 | 2021 | 1.20.3 (2026-10-25) | MIT | 63.1k (@builder.io/qwik) | 4.1k |  |
| Meteor | meteor/meteor | 44.8k | 5.3k | 357 | 2026-10-29 | 2012 | - | NOASSERTION | 71.8k (meteor-node-stubs) | 3.0k |  |
| WarpDrive / ember-data | warp-drive-data/warp-drive | 3.2k | 1.3k | 126 | 2026-10-29 | 2011 | 5.9.1 (2026-09-05) | MIT | 146.6k (ember-data) | 213 |  |
| TanStack Query | TanStack/query | 50.5k | 4.2k | 167 | 2026-10-29 | 2019 | 5.105.0 (2026-10-26) | MIT | 67.7M (@tanstack/react-query) | 7.1k |  |
| TanStack DB | TanStack/db | 4.0k | 277 | 136 | 2026-10-29 | 2025 | 1.0.0-rc.1 (2026-10-29) | MIT | 1.4M (@tanstack/db) | 2.4k |  |
| Supabase | supabase/supabase | 114.3k | 16.3k | 1179 | 2026-10-29 | 2019 | 2.118.0 (2026-10-15) | Apache-2.0 | 51.4M (@supabase/supabase-js) | 16.2k |  |
| PocketBase | pocketbase/pocketbase | 61.6k | 3.7k | 1 | 2026-10-26 | 2022 | 0.28.1 (2026-09-05) | MIT | 269.7k (pocketbase) | 14.3k | ARCHIVED |
| Appwrite | appwrite/appwrite | 57.8k | 5.8k | 738 | 2026-10-29 | 2019 | 29.2.0 (2026-10-28) | BSD-3-Clause | 59.0k (appwrite) | 7.6k |  |
| Firebase JS SDK | firebase/firebase-js-sdk | 5.2k | 1.0k | 760 | 2026-10-29 | 2017 | 13.1.0 (2026-10-21) | NOASSERTION | 14.0M (firebase) | 542 |  |
| Parse Server | parse-community/parse-server | 21.4k | 4.8k | 589 | 2026-10-29 | 2016 | 9.10.7 (2026-10-24) | Apache-2.0 | 81.8k (parse-server) | 2.0k |  |
| htmx | bigskysoftware/htmx | 49.6k | 1.8k | 304 | 2026-10-29 | 2020 | 2.0.11 (2026-09-22) | NOASSERTION | 366.7k (htmx.org) | 7.6k |  |
| Phoenix LiveView | phoenixframework/phoenix_live_view | 6.8k | 1.1k | 30 | 2026-10-29 | 2018 | 1.2.13 (2026-10-20) | MIT | 531.6k (Hex.pm) | 841 |  |
| Hotwire Turbo | hotwired/turbo | 7.4k | 502 | 371 | 2026-09-29 | 2020 | 8.0.23 (2026-01-29) | MIT | 1.3M (@hotwired/turbo) | 1.3k |  |
| Livewire | livewire/livewire | 23.6k | 1.8k | 79 | 2026-10-29 | 2019 | - | MIT | 10132137 per 30 days (Packagist) | 3.1k |  |

**Realtime/media**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Socket.IO | socketio/socket.io | 63.2k | 10.2k | 188 | 2026-09-29 | 2010 | 4.8.4 (2026-09-25) | MIT | 25.6M (socket.io) | 3.8k |  |
| ws | websockets/ws | 22.8k | 2.7k | 8 | 2026-10-23 | 2011 | 8.22.0 (2026-09-26) | MIT | 382.1M (ws) | 1.5k |  |
| uWebSockets.js | uNetworking/uWebSockets.js | 9.2k | 626 | 22 | 2026-10-16 | 2018 | - | Apache-2.0 | - (-) | 1.1k |  |
| Colyseus | colyseus/colyseus | 7.5k | 681 | 16 | 2026-10-26 | 2015 | 0.18.10 (2026-10-22) | MIT | 63.9k (colyseus) | 685 |  |
| geckos.io | geckosio/geckos.io | 1.5k | 90 | 5 | 2026-03-27 | 2019 | 3.1.0 (2026-03-27) | BSD-3-Clause | 1.6k (@geckos.io/server) | 198 | PUSH_6-12MO |
| Nakama | heroiclabs/nakama | 13.6k | 1.5k | 129 | 2026-10-29 | 2017 | v3.41.0 (2026-09-18) | Apache-2.0 | - (-) | 1.4k |  |
| LiveKit server | livekit/livekit | 21.9k | 2.5k | 201 | 2026-10-29 | 2020 | 2.19.2 (2026-10-22) | Apache-2.0 | 3.9M (livekit-server-sdk) | 3.6k |  |
| LiveKit client-sdk-js | livekit/client-sdk-js | 665 | 316 | 78 | 2026-10-29 | 2020 | 2.23.0 (2026-10-16) | Apache-2.0 | 6.9M (livekit-client) | 111 |  |
| LiveKit Agents (Python) | livekit/agents | 15.0k | 4.0k | 871 | 2026-10-29 | 2023 | 1.8.10 (2026-10-28) | Apache-2.0 | 991.0k (PyPI) | 5.0k |  |
| LiveKit Agents JS | livekit/agents-js | 953 | 418 | 520 | 2026-10-29 | 2024 | 1.9.5 (2026-10-28) | Apache-2.0 | 1.2M (@livekit/agents) | 370 |  |
| mediasoup | versatica/mediasoup | 7.4k | 1.3k | 33 | 2026-10-29 | 2014 | 3.32.0 (2026-10-26) | ISC | 52.1k (mediasoup) | 624 |  |
| Janus Gateway | meetecho/janus-gateway | 9.2k | 2.6k | 30 | 2026-10-29 | 2014 | 1.4.3 (2026-10-12) | GPL-3.0 | 8.6k (janus-gateway) | 723 |  |
| Pion WebRTC | pion/webrtc | 16.9k | 1.9k | 108 | 2026-10-29 | 2018 | v4.2.26 (2026-10-28) | MIT | - (-) | 2.0k |  |
| Pipecat | pipecat-ai/pipecat | 16.9k | 3.0k | 480 | 2026-10-29 | 2023 | 1.15.0 (2026-10-29) | BSD-2-Clause | 374.7k (PyPI) | 6.0k |  |
| Whisper (OpenAI) | openai/whisper | 111.5k | 13.5k | 180 | 2026-08-31 | 2022 | 20250625 (2025-06-26) | MIT | 1.6M (PyPI) | 27.1k | NO_RELEASE_12MO |
| faster-whisper | SYSTRAN/faster-whisper | 26.3k | 2.2k | 19 | 2026-10-25 | 2023 | 1.2.1 (2025-10-31) | MIT | 4.1M (PyPI) | 7.1k |  |
| whisper.cpp | ggml-org/whisper.cpp | 54.8k | 6.3k | 360 | 2026-10-29 | 2022 | b4938 (as reported by releases/latest) (2026-08-20) | MIT | - (-) | 13.4k |  |
| Kokoro TTS | hexgrad/kokoro | 9.8k | 1.1k | 218 | 2025-08-06 | 2025 | 0.9.4 (2025-04-05) | Apache-2.0 | 93.1k (PyPI) | 5.4k | NO_PUSH_12MO NO_RELEASE_12MO |
| Piper (original) | rhasspy/piper | 11.3k | 1.1k | 418 | 2025-08-26 | 2023 | - | MIT | - (-) | 3.0k | ARCHIVED NO_PUSH_12MO |
| Piper1 (GPL) | OHF-Voice/piper1-gpl | 6.1k | 597 | 156 | 2026-10-25 | 2025 | 1.8.0 (2026-09-04) | GPL-3.0 | 576.1k (PyPI) | 3.8k |  |

**Cloudflare**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| workers-sdk (wrangler) | cloudflare/workers-sdk | 4.7k | 1.6k | 594 | 2026-10-29 | 2021 | 4.156.0 (2026-10-29) | Apache-2.0 | 37.8M (wrangler) | 943 |  |
| workerd | cloudflare/workerd | 9.1k | 810 | 822 | 2026-10-29 | 2022 | 1.20261029.1 (2026-10-29) | Apache-2.0 | 42.0M (workerd) | 2.2k |  |
| Agents SDK | cloudflare/agents | 5.9k | 814 | 202 | 2026-10-29 | 2025 | 0.32.0 (2026-10-29) | MIT | 3.4M (agents) | 3.4k |  |
| Miniflare | cloudflare/miniflare | 3.9k | 209 | 1 | 2025-03-13 | 2021 | 4.20260730.0 (2026-07-30) | MIT | 41.1M (miniflare) | 721 | ARCHIVED NO_PUSH_12MO |

**Editors**

| Tool | Repo | Stars | Forks | Open iss+PR | Last push | Created | Latest release | License | Weekly DL (pkg) | Stars/yr | Flags |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tldraw | tldraw/tldraw | 51.1k | 3.6k | 594 | 2026-10-29 | 2021 | 5.6.0 (2026-10-28) | NOASSERTION | 665.4k (tldraw) | 9.3k |  |
| Excalidraw | excalidraw/excalidraw | 134.8k | 15.9k | 3437 | 2026-10-29 | 2020 | 0.18.1 (2026-04-20) | MIT | 1.2M (@excalidraw/excalidraw) | 19.8k |  |
| GrapesJS | GrapesJS/grapesjs | 26.4k | 4.6k | 37 | 2026-10-21 | 2016 | 0.23.8 (2026-10-15) | NOASSERTION | 544.5k (grapesjs) | 2.4k |  |
| Craft.js | prevwong/craft.js | 8.8k | 838 | 227 | 2025-02-14 | 2019 | 0.2.12 (2025-02-14) | MIT | 91.6k (@craftjs/core) | 1.2k | NO_PUSH_12MO NO_RELEASE_12MO |
| Puck | puckeditor/puck | 13.5k | 1.0k | 199 | 2026-10-29 | 2023 | 0.24.0 (2026-10-29) | MIT | 457.2k (@puckeditor/core) | 4.0k |  |
| Plasmic | plasmicapp/plasmic | 7.1k | 739 | 45 | 2026-10-29 | 2021 | 2.0.25 (2026-10-26) | MIT | 11.2k (@plasmicapp/loader-react) | 1.2k |  |
| BlockSuite | toeverything/blocksuite | 6.1k | 565 | 196 | 2026-10-22 | 2022 | 0.22.4 (2025-07-01) | MPL-2.0 | 10.0k (@blocksuite/store) | 1.5k | NO_RELEASE_12MO |
| Lexical | meta/lexical | 24.0k | 2.3k | 394 | 2026-10-29 | 2020 | 0.53.0 (2026-10-28) | MIT | 8.4M (lexical) | 4.1k |  |
| ProseMirror | ProseMirror/prosemirror | 8.7k | 369 | 111 | 2026-04-01 | 2015 | 1.42.8 (2026-10-24) | MIT | 36.3M (prosemirror-view) | 774 | ARCHIVED PUSH_6-12MO |
| Tiptap | ueberdosis/tiptap | 38.9k | 3.2k | 927 | 2026-10-29 | 2018 | 3.32.1 (2026-10-28) | MIT | 32.7M (@tiptap/core) | 4.7k |  |

**Repo-identity corrections found while verifying.** All are from npm metadata at [registry.npmjs.org](https://registry.npmjs.org/-/v1/search?text=yjs&size=20) and the [GitHub search API](https://api.github.com/search/repositories?q=repo:react/react+repo:sveltejs/kit+repo:nuxt/nuxt+repo:withastro/astro).
- React now lives at `react/react` (was facebook/react), Lexical at `meta/lexical` (was facebook/lexical), Prisma ORM at `prisma/orm` (was prisma/prisma), Convex at `convex/convex-backend` (was get-convex), PouchDB at `apache/pouchdb`, superjson search result at `ravionhq/superjson` (npm still says blitz-js/superjson; the 2014 created_at looks inconsistent, so treat this identity as uncertain), Objection's npm metadata points to `ditojs/objection`, Puck's package renamed `@measured/puck` -> `@puckeditor/core`, ArrowJS repo `standardagents/arrow-js`, Piper continued at `OHF-Voice/piper1-gpl` (license MIT -> GPL-3.0).
- Jazz has two repos. `garden-co/jazz` was created 2026-01-04 (220 stars, described as "A local-first relational database for the browser, React Native and your backend"). The older CoValues-based product is now `garden-co/classic-jazz` (2,537 stars) — [GitHub search](https://api.github.com/search/repositories?q=jazz+user:garden-co&sort=stars). Jazz's April 17, 2026 blog brands it "The local-first relational database that syncs across your frontend, backend and cloud" and links "Classic Jazz" separately — [jazz.tools blog](https://jazz.tools/blog/four-fresh-ideas-behind-jazz).

**Archived repos: archived does not always mean dead.**
- **ProseMirror**: the GitHub repo is archived, but npm metadata now points to `code.haverbeke.berlin/prosemirror/...`. prosemirror-view 1.42.8 shipped 2026-10-24 at 36.3M downloads/week, so development moved hosts and continues — [npm registry](https://registry.npmjs.org/-/v1/search?text=prosemirror-view&size=20).
- **PocketBase**: the GitHub search API reports `pocketbase/pocketbase` (61.6k stars) and `pocketbase/js-sdk` as archived, both last pushed 2026-10-26 — [GitHub search](https://api.github.com/search/repositories?q=repo:pocketbase/pocketbase+repo:pocketbase/js-sdk+repo:ProseMirror/prosemirror+archived:true). pocketbase.io's "Git Repository" link now points to `ganigeorgiev.com/pocketbase/pocketbase` and the header shows v0.41.1 — [pocketbase.io](https://pocketbase.io/). A cached GitHub page fetch showed no archive banner, and the README text said the author might "move the project somewhere else" — [GitHub page](https://github.com/pocketbase/pocketbase). This looks like a move off GitHub very recently (around 2026-10-26), not abandonment. The npm SDK's latest is 0.28.1 (2026-09-05).
- **Miniflare**: the standalone repo is archived (last push 2025-03-13), but it is developed inside `cloudflare/workers-sdk` and is still a dependency of wrangler, at 41.1M/week — [npm registry wrangler deps](https://registry.npmjs.org/wrangler/latest).
- **Replicache**: repo archived (last push 2022-05-07), npm last release 15.3.0 on 2025-07-02, 14.9k/week. Rocicorp's active product is Zero (`rocicorp/mono`, 3.4k stars, 264.9k/week, release 1.11.3 on 2026-10-23) — [GitHub search](https://api.github.com/search/repositories?q=repo:rocicorp/replicache).
- **rhasspy/piper**: archived; it continues as OHF-Voice/piper1-gpl (6.1k stars, PyPI piper-tts 576k/week) — [pypistats](https://pypistats.org/api/packages/piper-tts/recent).

**Stale or slowing (no release in 12+ months, or no push in 12+ months).**
- LokiJS: last push 2023-06-22, last release 2021-04-20, yet still 748k/week, probably transitive.
- lowdb: last release 2023-12-26 (2.2M/week).
- fast-json-patch: last release 2022-03-24 (11.9M/week).
- PouchDB: last release 9.0.0 on 2024-06-21; repo still pushed 2026-10-21.
- GUN: npm 0.2020.1241 dated 2025-07-01.
- Original PartyKit: npm 0.0.115 on 2025-05-21; activity moved to cloudflare/partykit (partyserver 2.4M/week, partysocket 5.0M/week).
- Triplit: last release 2025-07-31, last push 2026-01-19.
- Craft.js: last push and release 2025-02-14.
- signal-polyfill: last push 2025-02-13. tc39/proposal-signals was last pushed 2026-01-25.
- Castore: last push 2025-10-12.
- Kokoro: last push 2025-08-06.
- Others flagged in the table: classic-level, udomdiff, uhtml, BlockSuite npm, OpenAI whisper (PyPI 20250625).
- Sources: [npm registry](https://registry.npmjs.org/-/v1/search?text=lokijs&size=20); [GitHub search](https://api.github.com/search/repositories?q=repo:typicode/lowdb+repo:techfort/LokiJS+repo:seald/nedb+repo:WiseLibs/better-sqlite3).

**Corporate and consolidation events relevant to the sync layer.**
- Triplit co-founder Matt Linkous joined Supabase (8 Oct 2025), which called it an acquisition. Supabase said "Our focus isn't to directly integrate Triplit into our platform" and that the hire is "not about immediately using Triplit to solve offline needs" — [Supabase blog](https://supabase.com/blog/triplit-joins-supabase).
- Supabase raised $150M led by GIC and is acquiring Turso. This came four months after a $500M Series F at a $10.5bn valuation. "The Turso platform will continue to operate and its codebase will remain open source" (published 5 Oct 2026) — [Verdict](https://www.verdict.co.uk/supabase-150m-funding-turso-acquisition/).
- PartyKit's live packages (`partyserver`, `partysocket`) point to `cloudflare/partykit`, and Cloudflare's `agents` package depends on `partysocket` — [npm registry](https://registry.npmjs.org/agents/latest).

**Category leaders and momentum.** All figures are from the table above.
- **CRDT/sync**:
  - By downloads: Yjs 15.2M, Dexie 3.4M, Convex 2.4M, partyserver 2.4M, Electric client 2.1M, Hocuspocus 2.0M, y-websocket 1.5M, Liveblocks 782k, InstantDB 369k, Triplit 285k (anomalous), Zero 265k, Loro 177k, PowerSync 157k, RxDB 143k, PouchDB 92k, Automerge 88k, GUN 45k, TinyBase 20k, Replicache 15k, LiveStore 11k, OrbitDB 3.5k, jazz-tools 2.2k.
  - By stars: RxDB 23.4k, Yjs 23.0k, GUN 19.2k, PouchDB 17.6k, PGlite 16.2k, Dexie 14.7k, Convex 12.8k, InstantDB 10.6k, Electric 10.4k.
  - Fastest star accrual for young repos: PGlite about 6.0k/yr (created 2024-02), InstantDB 4.8k/yr (2024-08), Convex 4.8k/yr (2024-03).
- **ORMs**:
  - By downloads: drizzle-orm 42.1M, kysely 27.3M, prisma CLI 25.8M (+ @prisma/client 24.4M), typeorm 7.3M, sequelize 4.1M, MikroORM 1.4M, objection 356k.
  - By stars: Prisma 47.7k, TypeORM 36.7k, Drizzle 36.2k, Sequelize 30.3k, Kysely 14.3k.
  - Drizzle accrues about 6.8k stars/yr and Prisma about 6.5k/yr.
- **Reactivity/state**:
  - By downloads: zustand 85.9M, @vue/reactivity 23.7M, @preact/signals-core 13.9M, alien-signals 13.8M, solid-js 10.8M, lit 9.7M, jotai 9.1M, mobx 4.7M, valtio 3.2M.
  - Zustand has 58.9k stars and only 4 open issues/PRs.
  - Comparators from the [npm registry](https://registry.npmjs.org/-/v1/search?text=redux&size=20): redux 62.9M/week and @reduxjs/toolkit 46.0M/week (index figures).
- **Frameworks**:
  - By downloads: react 246.5M, next 91.5M, react-router 74.4M, vue 24.1M, astro 10.7M, svelte 9.0M, @angular/core 8.2M, @sveltejs/kit 4.5M, nuxt 3.3M.
  - By stars: React 251.7k, Next.js 143.2k, Angular 101.1k, Svelte 88.5k.
  - Astro accrues about 11.3k stars/yr.
- **BaaS**:
  - Supabase: 114.3k stars, supabase-js 51.4M/week.
  - Firebase: 14.0M/week.
  - PocketBase: 61.6k stars but only 270k/week for the JS SDK.
  - Appwrite: 57.8k stars but 59k/week for the web SDK.
  - Parse Server: 21.4k stars.
  - Stars far exceed SDK downloads for the self-hosted BaaS options.
- **Realtime/media**:
  - Node downloads: ws 382M (transitive), socket.io 25.6M, livekit-client 6.9M, livekit-server-sdk 3.9M, @livekit/agents (JS) 1.2M.
  - PyPI weekly: livekit-agents 991k, pipecat-ai 375k, faster-whisper 4.1M, openai-whisper 1.6M — [pypistats](https://pypistats.org/api/packages/livekit-agents/recent).
  - Game netcode is small: Colyseus 64k/week (+ @colyseus/core 186k); geckos.io 1.6k (search index).
- **Editors**:
  - prosemirror-view 36.3M, @tiptap/core 32.7M, lexical 8.4M, @excalidraw/excalidraw 1.2M, tldraw 665k, grapesjs 544k, @puckeditor/core 457k.
  - Excalidraw has 134.8k stars, the second most-starred repo in this list after React.

### Inferences
- For someone building their own vanilla-JS persistence/sync layer, the data says the **document-CRDT problem is effectively solved and standardized** (Yjs plus bindings and servers). The **app-state sync-engine problem is not**. No sync engine has majority adoption, and the leaders differ in model: Postgres-replication (Electric, Zero, PowerSync), hosted reactive DB (Convex, InstantDB), and event-sourced SQLite (LiveStore). Several of them are under 300k/week, and two were consolidated in the past 13 months.
- GitHub stars systematically overstate usage for self-hosted backends and P2P databases. GUN has 19.2k stars and 45k downloads/week; PocketBase 61.6k stars and 270k/week; Appwrite 57.8k and 59k/week; OrbitDB 8.8k and 3.5k/week. They understate usage for "plumbing" libraries such as ws, keyv, seroval, lmdb and devalue, which have under 25k stars and over 8M downloads/week.
- The framework-agnostic, vanilla-JS-usable options with real adoption are Yjs, Dexie, Automerge/Loro, TinyBase, RxDB, the signals cores (@preact/signals-core, alien-signals), Immer, fast-json-patch and fractional-indexing. Most sync engines (Zero, InstantDB, Convex, LiveStore, TanStack DB) lead with React bindings.
- License is a decision factor GitHub can't summarize. Several key repos report `NOASSERTION`: Yjs, Convex backend, Liveblocks, tldraw, Astro, htmx, GrapesJS, idiomorph and KurrentDB. Their LICENSE files need manual review, especially tldraw, Convex and Liveblocks, where commercial terms may apply. That is an inference to verify, not a finding. Triplit is AGPL-3.0, Janus GPL-3.0, and Piper1 GPL-3.0.

### Gaps
- Contributor counts, star-history curves (stars gained in the last 12 months) and release cadence were not collected, because the GitHub repos, contributors and stargazers endpoints were unavailable. Lifetime stars/year is a weak substitute.
- No GitHub data for `adrai/node-eventstore`, and the uWebSockets.js release date wasn't retrieved. The LiveKit server release shown is the Node server SDK's npm version, not the Go server's tag. The Meteor and Livewire latest releases were not retrieved.
- Download counts are missing for Pion (Go), whisper.cpp, Turso core, Nakama server, uWebSockets.js (distributed from GitHub) and Y-Sweet.
- Why `@triplit/client` shows 284.5k downloads/week despite no release since 2025-07-31 is unexplained. It may be a transitive dependency of something; not verified.
- The whisper.cpp "latest release" tag (b4938, 2026-08-20) came from the releases/latest endpoint and may not be the newest build tag.

## Q2. Caveats: what these metrics mean, plus sampled issue close rates

### Takeaway
Raw downloads are dominated by transitive dependencies, and in several cases the dependency chain is directly visible. Stars measure awareness and marketing reach. Issue close ratios vary much less than open-issue counts and are more informative: Kysely closes about 88% of issues, Electric 84%, Prisma 80%, Yjs and Automerge 77%, GUN 67%, Drizzle 65% and Dexie 64%.

### Cited Findings
**Transitive inflation verified from npm dependency metadata** ([npm registry](https://registry.npmjs.org/@lexical/react/latest)):
- `@lexical/react` hard-depends on `@lexical/yjs`, so @lexical/yjs's 7.7M/week counts every Lexical React user, collaborative or not. `yjs` itself is only an *optional* peer of @lexical/react — [npm registry](https://registry.npmjs.org/@lexical/react/latest).
- `@prisma/dev` depends on `@electric-sql/pglite`, so much of PGlite's 36.0M/week is Prisma's local-dev database, not Electric sync usage — [npm registry](https://registry.npmjs.org/@prisma/dev/latest).
- `better-auth` (16.9M/week) depends on `kysely`, which explains a large share of Kysely's 27.3M — [npm registry](https://registry.npmjs.org/better-auth/latest).
- `@vue/language-core` (Vue's TypeScript tooling) depends on `alien-signals`, so alien-signals' 13.8M is mostly Vue tooling — [npm registry](https://registry.npmjs.org/@vue/language-core/latest).
- `solid-js` and `@tanstack/router-core` depend on `seroval` (33.1M). `@sveltejs/kit`, `nuxt` and `astro` depend on `devalue` (24.4M). `nitropack` and `astro` depend on `unstorage` (25.7M) — [npm registry](https://registry.npmjs.org/astro/latest).
- `got`, `cacheable-request` and `cacheable` depend on `keyv` (217.6M) — [npm registry](https://registry.npmjs.org/got/latest).
- `wrangler` depends on `miniflare` and `workerd`, so those roughly 41-42M/week figures shadow wrangler's 37.8M — [npm registry](https://registry.npmjs.org/wrangler/latest).
- `webpack-dev-server`, `puppeteer-core` and `convex` depend on `ws` (382M) — [npm registry](https://registry.npmjs.org/convex/latest).
- `@reduxjs/toolkit` depends on `immer`. `@excalidraw/excalidraw` depends on `fractional-indexing`. `@tiptap/pm` depends on `prosemirror-model`, so ProseMirror's 36M includes all Tiptap users. `@hocuspocus/server`, `@blocknote/core`, `y-prosemirror` and `@tiptap/extension-collaboration` have `yjs` as a peer dependency — [npm registry](https://registry.npmjs.org/@tiptap/pm/latest).
- `agents` (Cloudflare) depends on `partysocket` — [npm registry](https://registry.npmjs.org/agents/latest).

**Download-count reliability.**
- The npm registry search index lagged the downloads API for some packages, e.g. ws 316M vs 382M and socket.io 21.0M vs 25.6M; the CSV labels which source each row uses — [npm search](https://registry.npmjs.org/-/v1/search?text=ws&size=20) vs [downloads API](https://api.npmjs.org/downloads/point/last-week/socket.io,ws,convex,partysocket,firebase,astro,nuxt,react-router,lexical,tldraw,wrangler,superjson,devalue,seroval,lowdb,keyv,unstorage).
- Non-npm distribution is not counted. That includes htmx and Turbo via CDN/importmap, uWebSockets.js from GitHub, and Meteor via its own installer.
- Phoenix LiveView shows 531.6k/week on Hex vs 35.3k on npm — [Hex.pm](https://hex.pm/api/packages/phoenix_live_view).
- Livewire shows 10.1M installs per 30 days on Packagist (118.3M total) — [Packagist](https://packagist.org/packages/livewire/livewire/stats).

**Open issues measure popularity and triage policy more than quality.**
- Zustand (58.9k stars) has 4 open issues+PRs and Jotai 2, while Next.js has 3,767 and Excalidraw 3,437 — [GitHub search](https://api.github.com/search/repositories?q=repo:pmndrs/valtio+repo:pmndrs/zustand+repo:pmndrs/jotai+repo:solidjs/solid). This reflects a policy of converting issues to Discussions, not necessarily fewer bugs. That is an inference consistent with the near-zero counts.
- `rocicorp/mono` shows 166 open items, but an issue search returned **0 open issues** — [GitHub issue search](https://api.github.com/search/issues?q=repo:rocicorp/mono+is:issue+is:open&per_page=1). So all 166 are PRs, and Zero's bug tracking happens elsewhere (likely Discord or another tracker, which is an inference).
- PocketBase shows 1 open issue because the repo is archived or locked.

**Sampled issue close ratios** (closed / (open + closed), from GitHub issue search counts, 2026-10-29):

| Repo | Open issues | Closed issues | Closed share |
|---|---|---|---|
| kysely-org/kysely | 140 | 997 | 87.7% |
| electric-sql/electric | 181 | 955 | 84.1% |
| prisma/orm | 2,443 | 9,596 | 79.7% |
| yjs/yjs | 122 | 408 | 77.0% |
| automerge/automerge | 76 | 255 | 77.0% |
| amark/gun | 273 | 542 | 66.5% |
| drizzle-team/drizzle-orm | 1,362 | 2,511 | 64.8% |
| dexie/Dexie.js | 569 | 991 | 63.5% |

Sources: [drizzle open](https://api.github.com/search/issues?q=repo:drizzle-team/drizzle-orm+is:issue+is:open&per_page=1), [drizzle closed](https://api.github.com/search/issues?q=repo:drizzle-team/drizzle-orm+is:issue+is:closed&per_page=1), [prisma open](https://api.github.com/search/issues?q=repo:prisma/prisma+is:issue+is:open&per_page=1), [prisma closed](https://api.github.com/search/issues?q=repo:prisma/orm+is:issue+is:closed&per_page=1), [kysely open](https://api.github.com/search/issues?q=repo:kysely-org/kysely+is:issue+is:open&per_page=1), [kysely closed](https://api.github.com/search/issues?q=repo:kysely-org/kysely+is:issue+is:closed&per_page=1), [yjs open](https://api.github.com/search/issues?q=repo:yjs/yjs+is:issue+is:open&per_page=1), [yjs closed](https://api.github.com/search/issues?q=repo:yjs/yjs+is:issue+is:closed&per_page=1), [electric open](https://api.github.com/search/issues?q=repo:electric-sql/electric+is:issue+is:open&per_page=1), [electric closed](https://api.github.com/search/issues?q=repo:electric-sql/electric+is:issue+is:closed&per_page=1), [automerge open](https://api.github.com/search/issues?q=repo:automerge/automerge+is:issue+is:open&per_page=1), [automerge closed](https://api.github.com/search/issues?q=repo:automerge/automerge+is:issue+is:closed&per_page=1), [gun open](https://api.github.com/search/issues?q=repo:amark/gun+is:issue+is:open&per_page=1), [gun closed](https://api.github.com/search/issues?q=repo:amark/gun+is:issue+is:closed&per_page=1), [dexie open](https://api.github.com/search/issues?q=repo:dexie/Dexie.js+is:issue+is:open&per_page=1), [dexie closed](https://api.github.com/search/issues?q=repo:dexie/Dexie.js+is:issue+is:closed&per_page=1).

**Cross-endpoint inconsistency.** GitHub's `/repos/yjs/yjs` object (fetched via a cached web fetch) reported 22,813 stars and pushed 2026-09-07. The search API minutes later reported 22,997 stars and pushed 2026-10-23 — [repos endpoint](https://api.github.com/repos/yjs/yjs) vs [search](https://api.github.com/search/repositories?q=repo:yjs/yjs+repo:yjs/y-websocket+repo:ueberdosis/hocuspocus+repo:loro-dev/loro). The same happened for PocketBase (60,935 / not archived vs 61,627 / archived). Search-API values are used throughout as the fresher source.

### Inferences
- The **ratio of downloads to stars** separates libraries pulled in as dependencies (ws, keyv, seroval, lmdb, fast-json-patch: very high ratio) from tools people star but rarely install (GUN, Appwrite, PocketBase, OrbitDB, Jazz: very low ratio).
- For choosing a sync or CRDT dependency, the best health signals in this dataset combine three things: (a) a release within the last 1-2 months, (b) a closed-issue share above 75%, and (c) downloads from *direct* integrations such as editor bindings or auth adapters rather than transitive ones. Yjs, Electric, Automerge, Loro, Zero, Convex, Liveblocks, Dexie and RxDB all have npm releases within about 2 months. GUN, PouchDB, Triplit, Replicache and LokiJS fail (a).
- Drizzle's lower close ratio (65%) alongside its download lead fits a project growing faster than its triage capacity. The ratio alone doesn't establish that.

### Gaps
- Median time-to-first-response and time-to-close were not measured; that needs per-issue timeline data the session couldn't access.
- The LiveStore closed-issue query returned the same number as its open query (296), which is likely a cached or duplicate result, so it was discarded.
- "Dependents" counts from the npm search index (in the CSV) count only packages that declare the dependency. GitHub "Used by" pages are blocked by robots.txt.

## Q3. Convergence: which combinations show up in surveys and StackShare-style data

### Takeaway
The surveys converge on Node + React (+ Next.js) + PostgreSQL, hosted on AWS, Vercel or Cloudflare. In the TypeScript ORM layer, Drizzle now leads npm downloads, while Prisma leads auth-adapter installs and older StackShare listings. For real-time collaborative editing, the visible stack is Yjs + ProseMirror/Tiptap or Lexical + Hocuspocus, Liveblocks or y-websocket. The surveys barely cover sync engines or data layers, so evidence there comes from npm co-installation rather than surveys.

### Cited Findings
**Stack Overflow Developer Survey 2025** (databases n=26,083; web frameworks n=23,678; cloud n=24,473) — [SO 2025 Technology](https://survey.stackoverflow.co/2025/technology):
- Databases (all respondents): PostgreSQL 55.6%, MySQL 40.5%, SQLite 37.5%, SQL Server 30.1%, Redis 28%, MongoDB 24%, Supabase 6%, Cloud Firestore 5.7%, Firebase Realtime DB 5%, DuckDB 3.3%.
- Database admired / desired: PostgreSQL 65.5% / 46.5%, SQLite 59% / 28.3%, DuckDB 58.8% / 5.7%, Redis 54.9% / 23.5%, Supabase 47.2% / 6.4%, Firestore 40.1% / 4%, Firebase RTDB 35.9% / 4.2%.
- Web frameworks: Node.js 48.7%, React 44.7%, jQuery 23.4%, Next.js 20.8%, Express 19.9%, ASP.NET Core 19.7%, Angular 18.2%, Vue 17.6%, Svelte 7.2%, NestJS 6.7%, Astro 4.5%, Nuxt 4%. htmx, Solid, Remix and Qwik were not in the usage list.
- Framework admired: Express 62.4%, Astro 62.2%, ASP.NET Core 61.3%, Svelte 53.7%, Node 52.2%, React 52.1%, Vue 50.9%, Next.js 45.5%.
- Cloud: AWS 43.3%, Azure 26.3%, GCP 24.6%, Cloudflare 20.1%, Firebase 13.1%, DigitalOcean 10.7%, Vercel 10.6%, Netlify 5.9%, Supabase 5.4%, Heroku 5.4%.

**State of JavaScript 2025** (fielded Nov 2025, published Feb 2026; 12,985 respondents vs 14,015 in 2024 and 39,472 in 2022) — [i-programmer](https://www.i-programmer.info/news/167-javascript/18655-state-of-javascript-2025.html); [InfoQ](https://www.infoq.com/news/2026/03/state-of-js-survey-2025):
- React usage 83.6%. Solid has had the highest satisfaction for the 5th year. Next.js usage is 59%, with 21% positive vs 17% negative sentiment and the most comments of any project.
- Runtimes: Node.js 90%, Bun 21%, Deno 11%. TypeScript-only usage is 40%.
- Meta-frameworks: Next.js keeps gaining usage while satisfaction falls, with "a 39% gap with leader Astro." Astro has top satisfaction. TanStack Start led write-ins with 235 mentions — [SoJS 2025 meta-frameworks](https://2025.stateofjs.com/en-US/libraries/meta-frameworks/).
- Back-end: Express leads usage. Hono, Nitro and ElysiaJS top satisfaction. Write-ins: oRPC 34, h3 24, Payload 20, Meteor 17. "Databases & ORMs" was a pain point for 40 respondents — [SoJS 2025 back-end](https://2025.stateofjs.com/en-US/libraries/back-end-frameworks/).
- Hosting (count of 10,704): AWS 5,099; Vercel 4,703; GitHub Pages 4,541; Netlify 3,180; Cloudflare 3,041; Firebase 2,228; Azure 2,198; Heroku 2,049.
- Edge/serverless (of 9,593): none 4,292; AWS Lambda 2,532; Cloudflare Workers 1,702; Vercel Functions 1,608; Supabase Edge Functions 37.
- Runtimes count: Cloudflare Workers 1,294 of 11,141 — [SoJS 2025 other tools](https://2025.stateofjs.com/en-US/other-tools/).
- The 2025 survey had **no data-layer, ORM or state-management category** in the pages retrieved. The earlier categories found were front-end, meta-frameworks, back-end and other tools — [SoJS 2025 front-end](https://2025.stateofjs.com/en-US/libraries/front-end-frameworks/).

**State of JavaScript 2024** — [SoJS 2024 libraries](https://2024.stateofjs.com/en-US/libraries/):
- React 81.1% used / 75% retention; Vue 50.9% / 87%; Angular 50.1% / 54%; Svelte 88% retention; Preact 80%.
- Next.js 54% used / 68% retention; Astro 94% retention; SvelteKit 90%; Nuxt 81%; Remix 80%.

**State of React 2025, state management:**
- Around 3,760 respondents, of whom about 34% use no state-management library. The average is 1.7 libraries.
- Zustand is "most popular in terms of user satisfaction."
- Write-ins: TanStack Query 42, useContext 14, Valtio 12.
- Source: [State of React 2025](https://2025.stateofreact.com/en-US/libraries/state-management/).

**StackShare.** Self-reported and skewed toward older stacks; many pages show no counts.
- PostgreSQL: 6,772 companies, 88,913 developers — [StackShare PostgreSQL](https://stackshare.io/postgresql).
- MongoDB: 4,849 companies, 85,891 developers — [StackShare MongoDB](https://stackshare.io/mongodb).
- Socket.IO: 1,502 companies, 11,175 developers — [StackShare Socket.IO](https://stackshare.io/socket-io).
- Prisma: 196 companies, 796 developers — [StackShare Prisma](https://stackshare.io/prisma).
- Supabase: 71 companies, 353 developers — [StackShare Supabase](https://stackshare.io/supabase).
- Zustand: 39 companies, 167 developers — [StackShare Zustand](https://stackshare.io/zustand).
- PouchDB: 17 companies, 113 developers — [StackShare PouchDB](https://stackshare.io/pouchdb).
- Pages for React, Next.js, Firebase, TypeORM, Sequelize, SQLite and Vercel showed no counts in the fetched text. Pages for Drizzle, Yjs and Redux failed to load.

**AI-agent stack selection as a new convergence force.** Amplifying's analysis of Claude Code's ORM recommendations (83 responses across Sonnet 4.5, Opus 4.5 and Opus 4.6) found Drizzle the primary pick in 32.5% (27/83) vs Prisma 20.5% (17/83), with Kysely only as an alternate. This measures recommendations, not usage — [amplifying.ai ORM](https://amplifying.ai/tech/category/orm).

**npm co-installation signals for "which pairings people actually wire up"** (npm search index, about one week lag) — [npm registry search](https://registry.npmjs.org/-/v1/search?text=%40auth%2Fprisma-adapter&size=20):
- **Auth to ORM pairings**: @auth/prisma-adapter 993k/week, @auth/drizzle-adapter 505k, @auth/supabase-adapter 20k, @auth/kysely-adapter 17k, @auth/typeorm-adapter 6.5k, @auth/mikro-orm-adapter 60. better-auth reaches 16.9M/week and depends on Kysely internally.
- **Postgres drivers**: pg 74.9M, postgres (porsager) 33.6M, @neondatabase/serverless 6.8M. drizzle-kit is at 35.3M. Comparison drivers: mysql2 23.1M, mongodb 21.3M, mongoose 7.3M, ioredis 42.0M, redis 20.7M.
- **Collaborative editing (Yjs ecosystem)**: @tiptap/extension-collaboration 3.34M, y-prosemirror 3.30M, @hocuspocus/provider 2.66M, @hocuspocus/server 1.96M (API), y-websocket 1.52M (API), y-indexeddb 1.38M (last release 2023-11-02), @blocknote/core 986k, @liveblocks/yjs 457k, y-webrtc 335k, y-codemirror.next 319k, y-monaco 77k, y-partykit 43k. The only Automerge editor binding, @automerge/prosemirror, has 7.8k.
- **Yjs "who is using" list** (self-reported, from the README) includes AFFiNE, Evernote, GitBook, JupyterLab, AWS SageMaker, Linear, Nextcloud, Proton Docs, AppFlowy, Huly, Typst, Eclipse Theia, Synthesia, ToolJet and Keystatic — [Yjs README](https://raw.githubusercontent.com/yjs/yjs/main/README.md).
- **TanStack DB collections**: @tanstack/query-db-collection 1.16M, @tanstack/electric-db-collection 322k, @powersync/tanstack-react-query 8k. @tanstack/db 1.0.0-rc.1 shipped 2026-10-29.
- **Client data fetching and state**: @tanstack/react-query 67.7M (API), swr 26.2M, @apollo/client 8.6M, xstate 7.2M, @trpc/server 8.0M.

### Inferences
- **Most common mainstream web stack in this data**: React + Next.js (or React Router / Vite) + PostgreSQL via Drizzle or Prisma (with pg/postgres.js or Neon drivers) + TanStack Query and/or Zustand for client state, hosted on AWS, Vercel or Cloudflare, with Supabase the leading Postgres BaaS. SO (PostgreSQL 55.6%, React 44.7%, Next.js 20.8%) and SoJS (React 83.6%, Next.js 59%, Vercel 4,703 of 10,704 hosting answers) agree on each component. No survey measures the full combination directly, so this is a co-occurrence inference, not a measured stack frequency.
- **Collaborative-editor stack**: Yjs + (Tiptap or ProseMirror | Lexical | BlockNote | CodeMirror) + (Hocuspocus | Liveblocks | y-websocket | Y-Sweet | PartyKit), with y-indexeddb for offline. Downloads put the Yjs ecosystem about 2 orders of magnitude ahead of Automerge and Loro bindings.
- **Local-first/sync engines** show no convergence yet. The closest thing to a convergence point is TanStack DB's collection adapters: Query 1.16M, Electric 322k, PowerSync 8k. Postgres also keeps showing up as the source of truth (Electric, Zero, PowerSync, Supabase), which suggests the field is converging on "Postgres server + client-side reactive store" rather than on any one engine.
- Survey and StackShare data are thin for this layer. A build-vs-adopt decision for a custom persistence/sync layer should rely on the npm co-installation and release-health signals above, not on survey rankings.
- The Cloudflare pieces show steady use: Workers at 1,702 serverless answers vs AWS Lambda 2,532, and wrangler at 37.8M/week. Durable Objects/PartyKit-style backends (partyserver 2.4M, agents 3.4M/week) are a real, growing alternative to Postgres-centric sync for realtime rooms.

### Gaps
- No StackShare data was retrievable for Drizzle, Yjs, Redux, Next.js, React, Vercel, SQLite or Firebase, so StackShare-based stack co-occurrence could not be computed.
- State of JS 2025 per-library usage percentages for Vue, Angular, Svelte, Astro, SvelteKit and Nuxt were not present in the page text (charts only), and no data-layer/ORM category was found for 2025. JetBrains' and other surveys were not checked.
- No direct survey measures pairings such as "Next.js + Prisma" or "React + Yjs." All combination claims above are inferred from separate marginal shares plus npm adapter and binding downloads.
