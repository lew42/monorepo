# research-cloudflare — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/cloudflare/`. Task dir: this one.

**The question (your log's seed line):** Is one Durable Object per topic the right shape, and what does the whole Cloudflare stack cost at 100 / 10k / 1M users?

## Start from (already dug, cited; verify, don't redo)

- `public/imagine/stream/doc/durable-objects.md` — DO WebSockets + hibernation, one-DO-per-page-url, prices as of 2026-08-30.
- `public/imagine/cms/services/page.js` — free tiers of D1 / DO / KV / R2 as of 2026-08-30, and where local state lives.
- `public/imagine/cms/thinking.md` — the data matrix and "D1 only when a visitor must write".
- `wrangler.jsonc` (repo root) — today's deploy is an assets-only Worker with SPA fallback; no `main`.
- `public/framework/ai/2026-08-30/cloudflare-mcp/requirements.md` and that task's landing line — what the Cloudflare MCP can and cannot do.

## Questions — a closed list

1. **Static assets + Worker in one project.** How a Worker runs only for non-asset routes (`run_worker_first`, the `ASSETS` binding, `not_found_handling`), and whether it can combine a static page with dynamic JSON at the edge (HTMLRewriter, Cache API, stale-while-revalidate). Worker limits: CPU ms per request, subrequests, request body size by plan.
2. **Durable Objects.** SQLite-backed storage limits (per object; per row/key), requests per second per object, WebSocket connections per object, hibernation, alarms, pricing (requests, duration GB-s, rows read/written, storage), point-in-time recovery, jurisdictions. Then the hypothesis: **one DO per topic** at 1 / 100 / 10k topics and 100 / 10k / 1M users — cost, and the hot-object risk (a viral topic is one single-threaded object). Alternatives: DO per channel, DO per topic + D1 for content, sharded DOs.
3. **D1.** Database size cap, rows read/written pricing, query limits, read replication (Sessions API), Time Travel, import/export, FTS5, multi-database patterns (a database per topic?).
4. **KV.** The write cap and eventual consistency — what it is for here (config, published snapshots) and what it must never hold.
5. **R2.** Pricing (storage, class A/B), presigned browser uploads, egress, event notifications → Queues, lifecycle rules; R2 as the home for JSONL event logs and media.
6. **Queues, Workflows, cron triggers** — for compaction and snapshot publishing; limits and prices.
7. **Local development.** `wrangler dev` (workerd; D1/DO/KV/R2 state in `.wrangler/state`), `--remote`, `@cloudflare/vitest-pool-workers`, seeding fake users, DO WebSockets locally, multi-tab multi-user simulation. Can `node server.js` (port 80, the site) and `wrangler dev` (8787, the API) coexist with `/api/*` proxied? Say exactly how.
8. **The cost table.** Per product, at 100 / 10k / 1M monthly users, with your activity assumptions stated (page views, writes, chat messages, media). Free tier vs the Workers Paid base.
9. **One line each:** Workers AI, Realtime, Stream, Images, Turnstile, Access, Email Workers — relevant to this platform or not.
10. **Dependencies.** A Worker is bundled by wrangler. Does CLAUDE.md's "no new npm dependency" bind the Worker? `/notes/auth/` held to zero (WebCrypto + the D1 binding). Recommend a stance.

## Challenge

One DO per topic. "Static is always cheaper." That D1 is needed before a visitor writes anything. That Cloudflare is the right host at all — name the one alternative that would beat it and why it does not.

## Numbers to bring back (each with url + date)

DO price per million requests and per million GB-s; DO WebSocket cap per object; D1 database size cap and rows-read price; R2 storage and class A/B prices; Workers Paid base price and CPU limit; Worker request body limit by plan.
