# Session data architecture — the owner's design thinking, 2026-10-08

Recorded from dictation so it survives chat. These are open design questions with the owner's leanings, not settled decisions. Owners of the answers: `2026-10-08/session-class` (files, index, routes) and `2026-10-08/task-audit` (what the audit writes).

## 1. Index files, so a list never loads whole logs
- Rendering a session in the Sessions list must **not** load its full `session.jsonl`. Idea: a small **index** per session (`index.json` or `index.jsonl`) with only what a preview needs: icon, title, path (for links), cost, runtime, state, tags, model+effort, and a tiny **inbox of top-priority items** (alerts, errors) so a dashboard shows them without loading the rest.
- The same pattern would suit **pages**: an index that previews a page without loading its whole `page.jsonl` (every change ever).
- Risk the owner named: an index is a **second source of truth**. The rule to settle: the index is **derived** (rebuildable from the logs, never edited by hand), and each append that matters also updates the index in the same write path.

## 2. Several files per session — harmony
`session.jsonl` (session facts and cost), `page.jsonl` (page-level), optionally a granular `log.jsonl`, plus the index. Open questions:
- Append real data to ONE file and a **reference** to it in the other, rather than repeating it.
- **Load hierarchy: always / sometimes / rarely.** Which file a given view loads, so nothing is silently missed because a file wasn't loaded; what is promoted into the always-loaded index (alerts, totals).
- Two logs are tricky: define when each loads.

## 3. What `session.jsonl` keeps
The **user/prompt side**: raw prompt, clean transcript, refined prompt, and the assistant's replies (so replies can be audited for suggestions never followed up). **Not** tool calls or the model's background work: those stay in the Claude SDK session file, the source of truth for them. Some duplication of prompts is accepted for now (see `ext/Refine/doc/vision-2026-10-08.md`); long-term, if raw → clean → refined is saved well, the raw may not need keeping. Who cleans transcripts (Haiku, a local model, OpenRouter) is undecided.

## 4. Routes
Tasks, questions, prompts and messages inside a session get their **own routes** (dynamic routes on the session page, not directories), so anything on the site can link straight to one prompt or one task.

## 5. What the task audit leaves behind
- A **question** card (yes/no, with proposed options) for any unclear or uncertain thing, posed in the session; Haiku auditors are expected to ask good questions. Loose ends and "needs the owner" become **alerts**.
- **Cross-links**: link a session from the module/page where it is relevant; link sessions that did similar or repeated work, so a reader knows "this was asked for again over here". **Never merge sessions yet.**
- Check whether every ask was at least **logged or referenced** (a reference to the original session and, where possible, the specific prompt), without littering the owner's prompts around the site.

## 6. Documentation map (to build)
The JSONL streaming system (sessions, logs, tasks, boards, the `live()` tail and its socket) needs one primary overview, probably under `core/Page`, linking every place it is used and documented, with a **backlink** to that overview from each of those places. Readmes stay plain text; user-facing pages carry the interactive, responsive material (possibly loading the readme into the page).

## 7. Budgeting must run on the ledger (owner, 2026-10-08; queued)
Budgets and the spend gate (`Servex/agents/Agents.js` `gate_check`, `allowance_usd`) must read spend from the programmatic per-message ledger (`session.jsonl`, computed from the raw session file's usage lines, deduped by message id), not from the SDK's end-of-turn total or the registry's `cost` (which resets on Servex restart) or the task `spend.json` (observed ~2x high). No AI judges spend. The budget NUMBER stays an estimate set by whoever spawns (default $20), but enforcement (80%/100% warnings, 2x hard stop) reads the ledger. Do this after the Session class lands and its audit shows a 0 gap.

## 8. Partitioned index: one per day, listed by month and year (owner, 2026-10-08; supersedes "start a new generation file")
A single index grows without bound (hundreds of sessions a day for months can reach gigabytes). Instead the index lives **next to the data it describes**, in the same `YYYY/MM/DD/` tree the sessions use:
- **Day index** (`.../YYYY/MM/DD/`): JSONL deltas, one line per changed session that day. Only **today's** day index is tailed live; older days are loaded once, on demand.
- **Month index** (`.../YYYY/MM/`): which days exist, with a small per-day roll-up (session count, cost, alerts), so the grid can show a month without opening every day.
- **Year index** (`.../YYYY/`): which months exist, with roll-ups.
- The grid loads only the partitions the date filter and the default recent window need. Filters over a long range read the month/year roll-ups first.
- **Housekeeping falls out of the layout:** back up, move or archive one year at a time, one month at a time; each partition is self-contained. Nothing is deleted (CLAUDE.md "Never destructive"); old partitions are moved aside.
- Indexes are derived and rebuildable from the sessions' own files; the audit checks them. This matches the existing `ai/YYYY/MM/DD/page.jsonl` directory-delta files.
