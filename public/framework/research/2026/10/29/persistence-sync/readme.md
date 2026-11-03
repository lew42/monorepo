# Persistence & sync research (2026-10-29 → 11-01)

**Question:** should Lew42 keep building its own save, sync and streaming layer (Item, List, Page, JSONL deltas, the socket), or adopt existing tools? **Answer: keep the Item / List / Page core and fix it.** Figma, Linear and tldraw run the same design (one ordered log per document, last-writer-wins per property, ids not indexes). Borrow their protocols; adopt libraries only at the edges (Yjs for shared rich text, SQLite FTS5 / MiniSearch for search, Cloudflare Realtime SFU for voice).

The research was done in a cloud Claude session (`e3fd9043`) coordinating many agents, first in its own GitHub repo (`mikelew42/research`), copied here on 2026-11-01 so it lives with the framework. What was built from it (branch `claude/oop-streaming-research`), how to merge it, and what is left: [build.md](build.md).

## Start here

- [STATUS.md](STATUS.md): the answer and what was built from it.
- [OWNER.md](OWNER.md): the decisions that were waiting on the owner.
- **Browse it:** [the research app](persistence-sync/app/index.html) (categories, tools, design pages, decisions). Also hosted as an artifact: https://claude.ai/artifact/JwAL71fvKRDUTHYyz1LJLx

## What is in here

| Folder | What |
|---|---|
| [design/](design/) | Phase 1 class design (`phase-1.md`), decisions D1–D18 (`decisions.json`), the owner's dated words (`decisions-log.md`), clear-win fixes, takeaways, and `replay-lab.html` (the first Replay Lab mock; the real one runs on the framework's classes at [/framework/core/Item/replay/](/framework/core/Item/replay/)) |
| [persistence-sync/](persistence-sync/) | the build-vs-buy report (`report.md`), how the code worked (`lew42/`), code lessons with failing-test specs (`lessons/`), 15 research notes (`notes/`), the tool dataset (`taxonomy.md`, `data/`, `tools/`), the research app (`app/`, rebuilt by `scripts/build.mjs`) |
| [agent-ops/](agent-ops/) | a proposal for portable agent instructions (`AGENTS.md`) and a multi-agent git strategy, with drafts |
| [ideas/](ideas/) | parked ideas: test-first rule, hosting from anywhere, the back burner |
| [COORDINATION.md](COORDINATION.md) | the rules the research agents followed (file ownership, append-only ops, test-first) |

The repo's uppercase `README.md` was left out (it clashes with `readme.md` on Windows), and so were the built `app/hosted.html` and the screenshots.
