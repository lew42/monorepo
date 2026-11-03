# Owner notes, 2026-10-16 night: migrating old tasks into the Task system (dictated; captured by voice-app)

## The problem

Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/tasks index). Old tasks and new tasks side by side will get confusing. A conversion is wanted, but NOT until it is tested and bulletproof: (1) lose no data, (2) preserve the truth.

## The shape

- A task that clearly belonged to a module moves to that module's tasks/<slug>/ (the new primary home).
- The session keeps a reference to the task; the task carries a back-reference to the session (sessions field already planned). Mutual references are acceptable; the essence is that the truth is preserved and both sides still find each other.
- Old session data is never deleted; migration adds, links, and records what it did.

## The process the owner wants

- A fresh Opus mastermind: first RESEARCH (a Sonnet minion reads the new system and the old data structures), then PLAN and document it, approve its own plan when it looks acceptable, then BUILD, autonomously. The owner is tired of plans that are never followed up on; the mastermind carries the task to landing and reports each phase, and voice-app tracks it on the Now card.
- Fail-safe: dry run first, counts before and after, a round-trip check, run on a copy before the real tree.
