# AI architecture: the decisions, and where they came from

`/framework/ai/` is where the agents' work is recorded and shown. Servex (the process that runs the agents) is documented in [Servex/doc/architecture.md](/framework/servex/doc/architecture.md); this page covers the data and the page.

## Decisions

- **Files are the memory.** Every task is a folder `ai/<date>/<slug>/` with a `task.jsonl` log; chat is not kept. The committed repo is the source of truth (CLAUDE.md law 5).
- **Append, never rewrite.** Data is JSONL, one line per event, written through one writer, so nothing is lost and git is the undo. See [system/data](/framework/ai/system/data/).
- **The System tab shows classes.** `/framework/ai/system/` is a wall of class cards (Servex's classes, with their core API) and the live agents, from `system-classes.js`. The words version of the same system sits one click down under "Concepts" (`concepts.js`).
- **A readme is a module's memory.** It stays under about 100 lines and points into `doc/`; this file holds the decisions.
- **Audits go to cheap models; record-keeping is code** (CLAUDE.md law 7).

## Related

[handover.md](../handover.md) · [todo.md](../todo.md) · [design/systems-overview.md](design/systems-overview.md) · [Servex architecture](/framework/servex/doc/architecture.md) · [session classes](/framework/ai/sessions/) (owned by minion-session-class)
