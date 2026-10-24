# Session data, complete: why it was missing, and what item() answers now

Task `session-data-complete-cost-duration-chil` on process-system. The owner had asked for a session's cost, duration and child sessions many times.

## Why it wasn't there: built, but not wired

- **The cost existed.** `AISession` reads each Claude transcript incrementally and keeps a summary (`usd`, `active_ms`, the read cursor) in the session folder's `cache.jsonl`, and `AISessionIndex` keeps it current. Only the sessions page (`AISessionDetail`) read it; the item tool, which is what agents use, never did.
- **The child agents existed** in the Servex registry, with their costs in their own logs. Nothing joined them to the session that spawned them.
- **A tab's record replayed as a plain Task.** `class_of` in `page_tools.js` called any `session.jsonl` that is a folder's own log a Task, so the Session code (progress, span) never ran for a VS Code tab.
- **The ask was never one requirement.** It came up in pieces (cost, then duration, then children), and each time a piece landed somewhere else: the sessions page, the registry, a probe.

## What item() answers now (session-e00f55c9, 2026-10-23)

| Field | Value |
|---|---|
| `cost.total` | $882.55 = own $234.19 + 59 child sessions $648.36 |
| `cost.own.active_ms` | 8.2 h of work within a 73 h span |
| `cost.own.read_to` | 36,284,946 bytes (the whole transcript at 01:28Z) |
| `children` | a tree: e.g. mastermind-deputy $16.70, $118.03 with its minions |
| `counts.all` | 158 created, 69 started, 30 complete, 73 stopped (stopped before they ran: not started) |
| `biggest` | process-system $289.42, figma cards $89.88, prompts $34.51 |

Field-by-field sources: [core/Session/readme.md](/framework/core/Session/readme.md), "What item() answers for a session". Test: `node Servex/agents/session-state.test.mjs` (13 checks), ~250 ms on this session.
