# Readmes: the detail behind CLAUDE.md

The root [CLAUDE.md](/CLAUDE.md) keeps the rules for readmes (a short index, the iceberg, the memory). The extra detail that used to sit beside those rules lives here. Load it when you write, audit or restructure readmes.

Related: [organization.md](organization.md) · [writing.md](writing.md) · [claude-md-archive.md](claude-md-archive.md) · [Servex/doc/readme-chain.md](/Servex/doc/readme-chain.md)

## Moved from CLAUDE.md (2026-10-12)

These sentences were cut from the root `CLAUDE.md` because they belong here. The wording is the owner's, unchanged; the id is the sentence's place in `CLAUDE.md` at `87afbdd55`. The map is `public/framework/ai/2026-10-12/claude-md-consolidate/manifest.md`.

<!-- claude-md:L12 -->
**Keep working; never wait on the owner** — L12.12

Keep the `readme.md` minimal (the reader's lightweight index to avoid context bloat) and let the `doc/` file hold the detail.

<!-- claude-md:L26 -->
**Readmes are the cheap index** — L26.3, L26.5

A searching or indexing agent reads one readme and decides "relevant or not" without the rest; a builder follows the links. A session worth tracking gets a short readme of its own (an overview/inbox the Haiku auditors create or update), while the data itself moves to JSONL for the UI.

<!-- claude-md:L34 -->
**A readme is a module's memory** — L34.3

Sub-readmes load on demand.

<!-- claude-md:L38 -->
**The iceberg readme** — L38.3

So readmes are read on demand, each giving the lay of the land and the important things in a glance.
