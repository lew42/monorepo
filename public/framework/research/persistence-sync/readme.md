# Persistence & sync research (2026-10-29 → 30)

Should Lew42 keep building its own persistence / sync / streaming layer (Item, List, Page, JSONL deltas), or adopt existing tools? This folder is a snapshot of that research, done by a cloud Claude session coordinating many agents.

**Answer so far: keep the Item / List / Page core; fix it, don't replace it.** Figma, Linear and tldraw run the same design (one ordered log per document, last-writer-wins per property, ids not indexes). Borrow their protocols; adopt libraries only at the edges (Yjs for shared rich text, SQLite FTS5 / MiniSearch for search, Cloudflare Realtime SFU for voice).

## Where things are

- **Browse it:** the research app (phone-friendly) is hosted at https://claude.ai/artifact/JwAL71fvKRDUTHYyz1LJLx. Locally, open `persistence-sync/app/index.html`.
- `STATUS.md`: current state and next steps. `OWNER.md`: decisions waiting on the owner.
- `design/`: Phase 1 class design (pseudocode), decisions (D1–D18), clear-win fixes, takeaways, and `replay-lab.html`, a demo of saving changes vs method calls (hosted: https://claude.ai/artifact/1Tj59c1Bz6Y8iq89CiDCT5).
- `persistence-sync/report.md`: the full build-vs-buy report and fix plan (M1–M6).
- `persistence-sync/lew42/`: how the current code works (`overview.md`) and whether `integration/data-shapes-2` is an upgrade (`branch-assessment.md`).
- `persistence-sync/lessons/`: code lessons from proven libraries, each with failing-test specs.
  - `storage-compaction.md` (F1–F10), `object-model.md` (T1–T6), `sync-protocol.md` (R1–R9).
- `persistence-sync/notes/`: 15 research notes on the landscape, plus `adoption_metrics.csv`.
- `persistence-sync/taxonomy.md`, `data/`, `tools/`: the tool dataset (12 categories, 46 subcategories, ~147 tools) and per-tool profiles.
- `agent-ops/`: proposal for portable agent instructions (`AGENTS.md`) and a multi-agent git strategy, with drafts.
- `ideas/`: parked ideas (test-first rule, hosting from anywhere, back burner).
- `COORDINATION.md`: the rules the research agents followed (file ownership, append-only ops, test-first).

## Source of truth

The working copy lives in GitHub `mikelew42/research` while the research session is running. This folder is a snapshot copied onto branch `research/persistence-sync`; re-copy it when the research changes. Uppercase `README.md` was dropped here to avoid a case clash with `readme.md` on Windows.
