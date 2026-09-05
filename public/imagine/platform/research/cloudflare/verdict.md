# Cloudflare stack — verdict

## Recommendation (MVP)
1. One assets+Worker project (`run_worker_first: ["/api/*"]`), no `main` today — add one Worker file only when the first API route is needed. Static stays free forever.
2. **One Durable Object per topic**, SQLite-backed, hibernating WebSockets — the shape `durable-objects.md` already designed. D1 holds content only where a *visitor* writes; everything else stays git files (`cms/thinking.md`).
3. R2 for media + JSONL archives (event notifications → Queues for compaction). KV only for published snapshots/config, never per-visitor writes.

## §33 — one DO per topic (the expensive-to-reverse call)

| | |
|---|---|
| **Decision** | Shard state per topic as one Durable Object — not per-channel, not a global object, not D1-only |
| **Problem** | A topic needs one order for its live edits/chat; something must own that order at the edge |
| **Options** | (a) one DO per topic — chosen · (b) one DO per channel (finer, more objects, same pattern) · (c) D1-only, poll for updates · (d) sharded DOs (`topic:N`) from day one |
| **Recommended** | (a) now, with (d) designed as the escape hatch for a hot topic, not built |
| **Why** | Cloudflare best-practices names polling fine for hourly content, wrong for live edit/chat; a global object is the documented anti-pattern; per-topic is the natural coordination boundary |
| **Advantages** | Free/cheap to 10k users; total order with no lock; hibernation ≈ free while idle; 30-day PITR free |
| **Disadvantages** | Object never moves after creation (geography locked in); no cross-topic query; a viral topic hits the 500–1,000 req/s soft ceiling per object |
| **Security** | No visitor ever holds a D1/DO-scoped token — every write goes through the Worker |
| **Cost** | Cents at 100 users, tens of dollars at 10k, low hundreds at 1M — dominated by DO duration + R2 ops, not DO requests (table below) |
| **Scalability** | Horizontal by topic count (unlimited objects); vertical (one hot topic) is unsolved — no documented runtime re-shard |
| **Complexity** | One class, hibernation API, an alarm for compaction — the append-log-plus-snapshot shape has no blessed Cloudflare pattern, it is ours to keep simple |
| **Migration** | DO storage type is immutable once created (must pick SQLite day one); reversible only by writing a new object and moving traffic to it |
| **NOT doing yet** | Sharding within a topic, DO-per-channel, any cross-topic aggregate query |

## The three numbers
- DO requests **0.15 dollars/M**, duration **12.50 dollars/M GB-s** — [durable-objects/platform/pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- Per-object soft ceiling **500–1,000 req/s** — [rules-of-durable-objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
- D1 database cap **10GB per database (Paid), not raisable** — [d1/platform/limits](https://developers.cloudflare.com/d1/platform/limits/)

## Cost table — 100 / 10k / 1M users
Assumptions: 10 / 500 / 20,000 topics; chat+writes scale with users; hibernation keeps idle objects near-zero.

| | 100 users | 10k users | 1M users |
|---|---|---|---|
| Workers Paid base | $0 (Free) | $5 | $5 |
| Durable Objects | $0 | ~$10 | ~$60–100 |
| D1 | $0 | ~$1 | ~$10 |
| R2 | $0 | ~$2 | ~$50–60 |
| KV / Queues / Workflows | $0 | ~$1 | ~$5 |
| **Total / month** | **$0** | **~$20** | **~$150–200** |

## Challenged
- *"Static is always cheaper"* — true and beside the point: the moment a visitor writes, or two tabs must sync live, no host does that for free.
- *"D1 needed before a write"* — confirmed; restates `cms/thinking.md`, nothing found overturns it.
- The one alternative that could beat Cloudflare: a single long-lived VM (Fly.io/VPS) with a real WebSocket server + SQLite. Wins only on mental-model simplicity — matches this repo's own dev server. Loses on global latency, owning uptime, and reintroduces the always-on server CLAUDE.md avoids for the static half.

## Cut first if the MVP must shrink
1. R2 event notifications → Queues — poll/compact on a cron instead.
2. D1 Sessions API / read replication — single-region D1 is fine under 10k users.
3. KV entirely — serve config/snapshots as static files until publish-latency matters.

Full evidence: [`log.jsonl`](./log.jsonl), 43 entries.
