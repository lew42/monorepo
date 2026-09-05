# Where state lives

**Ruling in three lines.** Architecture **(E), phased** — git files for curated content, D1 for
identity and indexes, one Durable Object for each live surface, R2 for media and compacted
history ([data verdict](../research/data/verdict/)). The Durable Object is keyed **by the url of
the surface being ordered**, which is per-*channel* where channels exist and per-*topic* where
they do not — this settles the conflict between the [cloudflare](../research/cloudflare/verdict/)
and [realtime](../research/realtime/verdict/) verdicts. **Nothing is built until a stranger
writes**; until that day the answer is static files and the bill is zero.

---

## §33 — where state lives

| | |
|---|---|
| **Decision** | Which backend owns each kind of state, and in what order they arrive |
| **Problem** | The site is static and deploys by `git push`. A platform needs writes by people who cannot push. Picking one storage model for all of it is wrong in both directions — a users table does not want an event log, and a chat room does not want a git commit |
| **Options** | **(A)** git files + static only · **(B)** D1-centric CRUD · **(C)** DO-per-surface event log + snapshot · **(D)** R2 JSONL logs + compaction Worker + static snapshots · **(E)** hybrid: D1 identity/index, DOs for live rooms, R2 for logs/media, git for curated content ([data log](../research/data/log.jsonl) 29, 2, 30, 3, 31) |
| **Recommended** | **(E), in three phases.** Phase 1: (A) alone — no Worker, no account, no bill. Phase 2: a Worker + D1 the day a stranger must write (identity, likes). Phase 3: one DO for the first feature that needs a single writer (a live room). R2 only when media or compaction is real |
| **Why** | Each of (A)–(D) forces one model onto data shaped differently: (A) cannot take a live write at all, (B) has no serialization — two Workers can race a read-modify-write on one row ([data log](../research/data/log.jsonl) 46), (C) and (D) are needless machinery for a users table. Phasing matters as much as the shape: it is [`cms/thinking.md`](/imagine/cms/thinking/)'s already-argued sequence, and it means the expensive parts are never paid for before they are earned |
| **Advantages** | Zero infrastructure until identity exists · each kind sits on the backend that already matches it · git keeps `git log` as the audit trail and `git revert` as the undo for everything curated, which no database gives back · the DO's output gate makes a delta durable *before* the broadcast leaves ([durable-objects.md](/imagine/stream/doc/durable-objects.md)) |
| **Disadvantages** | Four backends means four local-dev stories and four things that can be down ([data log](../research/data/log.jsonl) 31) — [local-dev.md](./local-dev.md) is the answer to the first half and does not fully answer the second · no cross-topic or cross-channel query exists at any grain; every aggregate is application code over N objects ([data log](../research/data/log.jsonl) 15) · the append-log-plus-snapshot shape has **no blessed Cloudflare pattern** — the compaction alarm is ours to keep simple and ours to get wrong |
| **Security** | No visitor ever holds a D1, DO or R2 token — Cloudflare's own D1 REST token is account-scoped and "best suited for administrative use", so every write goes through the Worker ([`cms/thinking.md`](/imagine/cms/thinking/)). The Worker stays narrow: it terminates `/api/*` and nothing else, so a bug in a dynamic feature cannot become a static-page outage ([data log](../research/data/log.jsonl) 37). And **auth may only ever add to a page** — every page renders with the API returning 500 ([`notes/auth` §1](/notes/auth/)) |
| **Cost** | **$0 / ~$20 / ~$150–200 per month** at 100 / 10k / 1M users, dominated by DO duration and R2 operations, not requests ([cloudflare verdict](../research/cloudflare/verdict/) cost table). Phase 1 is $0 at any traffic. Phase 2 crosses the Workers Paid **$5/mo** floor. The number that actually bites is D1 billing **scanned** rows, not returned ones — one real bill hit 127.6B row reads on a 765k-row table until indexes cut it 95% ([use-indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/), [fullstacksveltekit.com](https://fullstacksveltekit.com/blog/cloudflare-d1-bill)) |
| **Scalability** | Horizontal by topic and by channel — objects are unlimited. The ceilings are per-object (**~500–1,000 req/s**, [rules-of-durable-objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/); **32,768** sockets, [api/state](https://developers.cloudflare.com/durable-objects/api/state/)) and per-database (**10 GB** on Paid, not raisable, [d1/limits](https://developers.cloudflare.com/d1/platform/limits/)). Both are far away and both are per-shard, so the fix is always another shard |
| **Complexity** | Phase 1 adds nothing. Phase 2 adds one Worker file, one D1 binding, one schema. Phase 3 adds one DO class plus hibernation and an idempotent alarm — alarms retry up to 6 times, at-least-once ([alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)) |
| **Migration/reversibility** | The seam is [`page.store()`](/framework/core/Page/doc/method/store/) over a `Store` interface, with the three tests [`cms/thinking.md`](/imagine/cms/thinking/) already set: the key is a **path**, every backend must be able to dump itself back to files, and the page never names its backend. Two verbs are missing and are the real unblocking step — **`list(prefix)` and `append(key, line)`** on `ext/Saver` ([data log](../research/data/log.jsonl) 40). Not reversible: a DO's storage type once a namespace exists (pick SQLite day one) and its geography once created |
| **Deliberately NOT doing yet** | KV as a store (only the one ban key, below) · R2 event notifications → Queues; compact on a cron instead · compacting anything user-written into git (see the UGC row) · a cross-topic aggregate query layer · sharding within one channel · a money ledger of any kind · crypto-shredding · D1 read replication / Sessions API — single-region is fine under 10k users ([cloudflare verdict](../research/cloudflare/verdict/)) |

---

## The tie-break: one Durable Object per **url**

[cloudflare](../research/cloudflare/verdict/) picked one DO per **topic**;
[realtime](../research/realtime/verdict/) picked one per **channel** and flagged the conflict as
unresolved. Ruling: **neither name is the key — the url is.**

**The key.** `env.ROOMS.getByName(url)`, where `url` is the pathname of the page whose order is
being kept. This is not a new idea; it is the shape the house already wrote down on 2026-08-30:
*"One DO per page url — `env.PAGES.getByName(pathname)`"*
([durable-objects.md](/imagine/stream/doc/durable-objects.md)), and it satisfies the seam's first
lock-in test — the key is a path, not a database id ([`cms/thinking.md`](/imagine/cms/thinking/)).

**What a channel is when a topic has one.** A channel is a *page with a live surface*. A topic
whose only live surface is its own page is keyed at the topic url (`/js`); the day it grows a
second room, that room is a new page at a new url (`/js/help`) and gets a new object. **The
first object never moves and nothing migrates** — which is exactly what per-topic-as-a-fixed-key
could not promise.

**Why the finer key wins.** Fan-*in* is a code change: to show "everything happening in this
topic" you query N objects, the same application-code answer D1 already forces for any
cross-database aggregate ([data log](../research/data/log.jsonl) 15). Fan-*out* is a data
migration: splitting a topic object into per-channel objects after messages exist means moving
rows and rewriting cursors. Choose the key you can cheaply aggregate, not the one you would have
to cheaply split. Secondary: a deploy drops every socket on an object ([durable-objects.md](/imagine/stream/doc/durable-objects.md)
gotcha 1), so a coarse key makes every deploy a topic-wide disconnect instead of a room-wide one.

**Where I overrule each verdict, in a line each.**
- *cloudflare* — overruled on per-topic: it treats a topic as mostly one channel, which brief §18
  explicitly denies, and per-topic is the one grain that can neither aggregate up nor split down cheaply.
- *realtime* — right answer, wrong reason: Cloudflare's *"never route all traffic through one
  Durable Object instance"* rule names a **global singleton**, and a per-topic object is already
  sharded by topic, so the anti-pattern does not apply. The load-bearing arguments are the
  migration asymmetry above, the per-object caps, and blast radius.

**The hot-object failure, and the mitigation.** One url exceeding **~500–1,000 req/s** returns
`overloaded` — the room stops accepting messages while everything else keeps working. Sockets cap
at **32,768** per object, and CPU may bite first ([api/state](https://developers.cloudflare.com/durable-objects/api/state/)).
Worse, nobody has published whether per-message cost scales with recipient count: Cloudflare's own
pricing example fixes the room at 100 sockets and never varies it, so a very large very chatty
room may be O(N²) work ([realtime log](../research/realtime/log.jsonl) 5–6). Mitigate in this
order: **(1)** batch deltas into one inbound message — WebSocket messages bill 20:1 inbound, so
this is already the cheap path and `Stream.push()` already writes a batch per edit; **(2)** cap
room size in the product — a room past ~1,000 live participants is a broadcast, not a
conversation, and should become a read-only relay; **(3)** only then shard one url across
`#chat/0…N` behind a relay object — **designed, not built**, and cheaper at this grain than it
would be per-topic. Measure before (3): cold-start latency for a woken object at thousands of
topics is unmeasured by Cloudflare and by this research ([data log](../research/data/log.jsonl) 20).

---

## The data classes

The [data verdict](../research/data/verdict/)'s table, corrected in four rows (marked ⚑).

| class | home | write path | delete path |
|---|---|---|---|
| **Curated content** — topic prose, `page.js`, docs | **git files** beside the page, read by a plain static fetch | a human, or the CMS edit page over the loopback dev socket; publish is `git push` | `git rm` + a deploy. History keeps the blob, and that is fine — it was never personal data |
| **UGC** — posts, wiki edits, subtopic proposals | **D1 rows** while live; **R2** for any compacted archive ⚑ | Worker `/api/*`, authenticated. Never git: GitHub's secondary limit is **80 content-creating requests/minute, 500/hour** ([docs.github.com](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)) and a stranger cannot push anyway | `DELETE` the row; purge the R2 object. ⚑ **Do not compact UGC into git at all** — a revert does not erase history, and whether purging a cached CDN copy satisfies erasure is an open question nobody answered ([data log](../research/data/log.jsonl) 19). Git is for content someone reviewed, not for a user's words |
| **Events** — chat, presence, live edits, progress ticks | **one DO SQLite table per url** ⚑ (was "per topic") — the [`/imagine/stream/`](/imagine/stream/) shape already working | one WebSocket message in, made durable by the output gate before the broadcast leaves | an appended tombstone or a `storage.sql` delete, bounded by the free 30-day PITR window. **Scope the log to the live window**: anything retained past compaction becomes a mutable row, per the data verdict's §33 |
| **Derived** — levels, reputation, counts, search index | **nowhere** ⚑ — it is a query, not a row. Materialise a cache only when a measurement demands it, rebuildable, never the source ([`notes/auth` §5](/notes/auth/)) | n/a — it is computed at read time | n/a, and that is the point: deleting the underlying rows deletes the derived value for free |
| **Identity** — users, sessions, bans | **D1** `users` keyed `(provider, provider_id)`; the session is a stateless HMAC cookie, not a row; **plus one KV key `banned:<user_id>`** ⚑ read per request ([users verdict §33](../research/users/verdict/)) | Worker OAuth callback writes the row and sets the cookie; a ban writes the KV key | `DELETE` the user row and bump `token_epoch`. A ban lands within ~60s (KV's worst-case propagation), not instantly — that is the accepted cost |
| **Money** | **Stripe** ⚑ — we hold none of it. The platform stores a `stripe_customer_id` and a mirrored subscription status, which is a rebuildable cache of Stripe's webhooks | Stripe Billing (Payment Element + Customer Portal); no stored value, no user-to-user balance ([payments verdict](../research/payments/verdict/)) | delete the mirror row. Stripe retains its own records for tax and legal reasons, and that is a documented exemption, not a bug — **never** an event log: a ledger needs one row per balance a query can trust today, not a replay ([data log](../research/data/log.jsonl) 34) |

**The one rule under all six rows:** an event log is for ordering and replay in a short live
window; anything *retained* that describes a person is a mutable row a `DELETE` removes
([data verdict §33](../research/data/verdict/)).

---

Next: [local-dev.md](./local-dev.md) — how any of this gets developed and tested locally.
