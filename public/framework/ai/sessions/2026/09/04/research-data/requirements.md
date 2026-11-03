# research-data — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/data/`. Task dir: this one.

**The question (your log's seed line):** Where does each kind of data live so the site stays static and the platform stays cheap?

## Start from (read before searching)

- `public/imagine/cms/thinking.md` — the storage matrix, the verdict, and "the seam" (commit to the interface, not the backend).
- `public/imagine/stream/doc/durable-objects.md` — the dev server's `page.json` snapshot + `page.jsonl` deltas + Tail model mapped onto a DO.
- The house data philosophy already in code: `public/framework/ext/JSONL/readme.md`, `public/framework/ext/Saver/readme.md`, `public/imagine/cms/readme.md` + `doc/`, `public/imagine/stream/readme.md` + `doc/`; `grep -rn "declare" public/framework/core/Page/Page.class.js` for the page.json seam; `public/blog/posts.js` + `meta.mjs` for static publishing of structured content.
- `public/notes/auth/readme.md` §4 — urls as keys, no `pages` table, points derived never stored.
- `c:/Code/frozen-helix/persistence.md`, `persistence2.md`, `persistence-review.md` — the predecessor's Saver/strategy design (FileSaver → D1Saver → DOSaver). Read, quote the lesson, never copy code.

## Questions — a closed list

1. **Classify the platform's data** — curated topic content · user-generated content (posts, wiki edits, subtopics) · activity/events (chat, likes, progress) · derived state (levels, reputation, counts, search index) · identity (users, sessions) · money (the ledger). For each: source of truth, write path, read path, cache, how it is published, how it is deleted.
2. **Five architectures on the brief's criteria** (security, authn, authz, privacy, publishing, persistence, real-time, storage/bandwidth/database cost, scalability, reliability, complexity, local dev, backup/recovery, migration, integrity), as one table: (A) git files + static only · (B) D1-centric CRUD · (C) DO-per-topic event log + snapshot · (D) R2 JSONL event logs + compaction Worker + published static snapshots · (E) hybrid — D1 for identity and index, DOs for live rooms, R2 for logs and media, git for curated content. Then the verdict.
3. **Event sourcing, honestly.** What it buys (audit, replay, the live tail the house already has), what it costs (projections, schema evolution, GDPR erasure against append-only — crypto-shredding, tombstones, rewrite-on-compaction), and where NOT to use it.
4. **"Publish activity into static history."** A cron or Queue consumer compacts day logs into static JSON on R2 served through the Worker; or commits into git (Workers Builds, GitHub API). Is committing user content into the code repo ever right? Argue it.
5. **Where static and dynamic merge.** In the Worker (assets binding + JSON + edge cache) or in the client (the static page renders, then fetches `/api/...` — `/notes/auth/`'s "auth may only ever add to a page"). Recommend the layer, with the failure mode of each.
6. **The Omnibox index.** A static JSON index built at deploy (topics, pages) plus a dynamic one (D1 FTS5 or a DO) for user content; size and cost at 10k topics and 1M posts.
7. **Backups, recovery, migration.** D1 Time Travel, R2 versioning, DO PITR, export paths; moving from (C) to (E) later — what is the seam in code (a Store interface with file / D1 / DO backends, the frozen-helix idea)?
8. **Local dev parity.** `.wrangler/state` vs the dev server's page.json/page.jsonl + Tail. durable-objects.md claims the SAME client protocol (`ext/JSONL` subscribe-with-offset) fits both — verify against `public/framework/dev/Socket/Socket.js` and say what would actually change.
9. **Integrity.** Single writer per topic, idempotency keys, ordering, the DO as sequencer; what a D1-only design loses.

## Challenge

Filesystem-first. JSONL everywhere. One snapshot per page. That user content belongs in git at all.

## Numbers to bring back (url + date)

Bytes per chat message / per event with a stated envelope; storage cost per 1M events on DO SQLite vs R2 vs D1; D1 rows read per page view for a topic page with 20 posts; R2 class B ops per page view if snapshots live there; D1 database size cap.
