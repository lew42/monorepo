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

## 9. What a day-index line holds: state, not events (owner decision, 2026-10-08; refines section 8: the lines are state summaries, not deltas of events)

**Decided.** The index holds **state**: each day-index line is the latest summary of one session (id, name, parent, model and effort, provider, state, started and updated, cost parts, tokens, tags, alert count). Last write wins per id, so a client reduces the lines by id into the current state without reading a transcript. Detail (every message, every tool call) stays in the transcript and cache and loads only on drill-down.

**Rejected: an event-sourced index** (one line per transcript event, with the client replaying history to learn the state). It would make every query a replay, and the file would grow with activity instead of with sessions. Also rejected for now: a database. A gitignored local SQLite mirror, built by Servex purely as a query accelerator (derived, rebuildable), is the optional later alternative. Not built.

**Bloat control.** A day index is append-only while the day is live. When the day closes (no live sessions), a script writes a **compacted** day index: one line per session, as a new file. The old file is kept; nothing is deleted. A closed day is then immutable, so it can be cached forever.

**Roll-ups.** The month index is per-day totals plus one compact summary row per session (a few hundred sessions a day times 30 is about 1 to 2 MB). The year index is per-month totals. A month's cost comes from roll-ups only, never by loading sessions.

**Query rule.** Filter by date range first, then load only those day indexes, in parallel. A range over about 7 days shows roll-ups first and loads day lists on demand. The default view is today or the last day, with that day's total cost. State, model, tag, role and cost filters run client-side over the loaded summary rows.

**Built versus planned** (the first tailer, now replaced; see [realtime.md](realtime.md)):
- (Replaced by the per-session snapshot and day composite in the second section 9 below; built as `ai/AISession/AISessionIndex.mjs`, see [realtime.md](realtime.md).) Was built: append-only day index, keyframe line per session per day, month and year roll-ups of count, cost and flagged (not yet a summary row per session), client reduce by id, audit.
- Not yet: the line carries cost, state and timing but not name, parent, tokens, tags or alert count; the day-close compaction script; summary rows in the month index; roll-ups-first for ranges over 7 days.

**Counting.** The unit is the Claude session id. [patterns.md](patterns.md) holds the script-computed overlap table (distinct ids and, per storage pattern, how many it covers and how many are also elsewhere). The card and task folders are views onto the same ids, which is why 7,751 / 4,072 / 1,064 / 7,793 do not add up.

## 9. Per-session snapshot + a server-held composite (owner, 2026-10-08; decision, supersedes the day-index JSONL of section 8 where they differ)
- **Each session folder holds `index.json`: a minimal SNAPSHOT of its current state** (name, parent, model+effort, provider, state, started/updated, cost, tokens, tags, alert count), **rewritten atomically** (temp file + rename), never a history. The history is the session's own log/transcript, the source of truth.
- **The server keeps all current snapshots in memory** (a `AISessionIndex` class in Servex/dev server) and is the single writer: it updates a snapshot when a session's data changes, **throttled** (at most about once a second per session) so a busy session does not rewrite constantly. No appended index file, so nothing to bloat and **no compaction race**.
- **Composite on demand:** any path level (a day, a month) is served as ONE bundled response built from memory, plus a **socket subscription** that pushes only the changed snapshot when one changes (a delta from memory, not a file tail). The grid asks for the days its filter needs. Old days are not subscribed to (they rarely change; a revived session notifies whoever is subscribed to its day).
- **Frozen bundles:** when a day closes, the server writes an immutable `day.json` bundle (and month/year roll-ups of totals). Production is static, so the static site reads those frozen bundles; live subscription is a dev/Servex feature.
- **Detail view = source of truth:** opening a session loads and tails its own log, recomputes from it (the `Session` class applies lines), and if it finds the snapshot stale, the grid row is corrected. The grid may be a little stale; the open session never is.
- **Open question:** a queryable field set kept small enough to filter thousands of rows (state, model, provider, tags, cost, date) without loading any session log.
