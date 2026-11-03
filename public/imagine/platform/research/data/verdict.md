# Data — verdict

## Recommendation (MVP)
1. **Ship (A), static + git, alone first.** All six data kinds in question 1 sort cleanly onto a backend only once a *stranger* must write — nothing in an MVP forces that yet, and it costs zero infrastructure.
2. **The day a stranger writes:** D1 for identity, likes and every derived count (computed at read time, never stored — `notes/auth` §5); one Durable Object per topic for anything that needs live ordering (chat, edits) — matches `research/cloudflare`'s verdict, not re-litigated here.
3. **Store personal/retained data as mutable rows, not an immutable event log**, until a named feature actually needs replay — see §33.

## §33 — mutable rows vs an event-sourced log for anything holding personal data (the expensive-to-reverse call)

| | |
|---|---|
| **Decision** | Retained user-generated/activity data is normal, hard-deletable rows (D1) — the house's event-sourced reflex (`stream/`'s append-only `.jsonl` + DO) is scoped to short-lived, real-time state only |
| **Problem** | `stream/`'s already-built pattern is event-sourced by default, and it is genuinely good at what it does — but GDPR erasure and an append-only log are in real tension, and crypto-shredding does not cleanly resolve it (specialists: encrypted personal data is still personal data) |
| **Options** | (a) mutable rows, hard delete — chosen for anything retained · (b) event log, tombstone-only, never truly deletes · (c) event log + crypto-shredding, partial and contested · (d) two-tier — ephemeral event log for live fan-out, compacted into mutable rows for anything kept past a short window |
| **Recommended** | (d), landing as (a) for everything retained |
| **Why** | Keeps the event log for what it already proves good at — ordering, replay, the DO's 30-day PITR, live multi-window sync — while making the thing that must actually be erasable a row a `DELETE` removes, not a log entry that can only be shredded around |
| **Advantages** | Erasure is a real `DELETE`; keeps replay/audit value for the session window nobody expects to survive; matches `stream/`'s own `compact()` (fold log, then truncate) |
| **Disadvantages** | Two storage shapes instead of one; the compaction boundary — when does "live" become "retained" — is an undecided product question; an erasure request arriving before compaction still has to reach into the live log |
| **Security** | Personal data at rest is deletable, not permanently-shredded ciphertext a determined party can still correlate against metadata |
| **Cost** | No new infrastructure — this is a policy on data already headed for the D1+DO hybrid; compaction was already a planned step (question 4) |
| **Scalability** | Unaffected — same DO-per-topic / D1 split as the base recommendation |
| **Complexity** | Real: every UGC feature now needs an explicit "when does this become retained" answer instead of a default |
| **Migration** | Reversible in the row direction (drop a table); **not** reversible once a delta has broadcast to subscribers or compacted into git — nothing here proves cache-purge-on-erasure (see the log's open question) |
| **NOT doing yet** | Crypto-shredding, a forgettable-payload side-store, any legal sign-off on a retention window |

## The three numbers
- D1 bills **scanned rows, not returned rows** — a real bill hit 127.6B row reads on a 765k-row table before indexes cut it 95% — [d1/best-practices/use-indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/), [fullstacksveltekit.com](https://fullstacksveltekit.com/blog/cloudflare-d1-bill), 2026-09-04
- GitHub's secondary rate limit for content-creating requests: **80/minute, 500/hour** — far tighter than the 5000/hour headline, and what actually rules out git as a live write path — [docs.github.com](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), 2026-09-04
- D1 database size cap: **500MB Free / 10GB Workers Paid**, per database (50,000 databases/account on Paid) — [d1/platform/limits](https://developers.cloudflare.com/d1/platform/limits/), 2026-09-04

## Cut first if the MVP must shrink
1. Skip user-generated content/live editing entirely — ship (A) alone, defer D1 and the DO until identity is actually needed.
2. Skip the dynamic half of the Omnibox index — static deploy-time JSON only (question 6), defer D1 FTS5.
3. Skip event-log compaction into git or R2 entirely — keep activity in plain D1 rows until a named feature needs audit or replay.

Full evidence: [`log.jsonl`](./log.jsonl), 50 entries.
