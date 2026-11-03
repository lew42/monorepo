# AI index: a JSONL stream per day folder, written when a session, task or project is created or moved

In plain words: every day folder gets a small log file. Each time a session, task or project is created or changes state, code adds one line to it, so the AI board can patch one row instead of reloading the whole 2.4 MB index.

```
ai/sessions/2026/10/20/index.jsonl   one line per change that day (new)
ai/index.json                        open items only, rebuilt from the day streams (derived)
```

Budget: $10. Sonnet, medium effort. Queued by the system architect, 2026-10-20 (decision `d-where-does-the-index-stream`, option A, in [the architect's log](../system-architect/session.jsonl)). Start after [ai-index-rename](../system-architect/ai-index-rename/requirements.md) lands (it renames `state.json` to `ai/index.json` and `tasks/state.jsonl` to `ai/index.jsonl`).

## The owner's decided shape (16:30, [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md) "The decided shape")

The index is JSONL, append-only, streamed, appended by code whenever a day folder, session or project is created or moved. `ai/index.json` is at most a derived snapshot. An index points; it does not copy logs.

## Build

1. `ai/sessions/YYYY/MM/DD/index.jsonl`: one line per change of a session, task or project in that day, `{session|task|project: {id, path, title, state, at}}`, written at the moment of change by the writers that already exist (`open_task` in `Servex/agents/Agents.js`, the `log` tool's `LogLine` once it lands, `AIIndex`'s fold for state changes). Month and year rollups by code (`AISessionIndex.roll` already rolls `index.json`; fold or replace, don't add a third).
2. `ai/index.json` is rebuilt from the streams (open items only); the browser tails today's stream and patches rows instead of refetching 2.4 MB per change.
3. Reconcile with `AISessionIndex`'s per-day `index.json` and `cache.jsonl`: one indexing system in `framework/ai`, named for what it is. Write the plan's class names first (`make` skill).

Land with `finish-task`; readmes `ai/readme.md` "On disk" and `Server/doc/ai-index.md` updated.
