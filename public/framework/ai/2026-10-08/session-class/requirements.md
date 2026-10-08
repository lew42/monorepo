# The Session class — bulletproof per-session accounting, server + client, cached

Owner (2026-10-08, dictated). Build on `public/framework/ai/2026-10-07/token-accounting/` (`findings.md`, `plan.md` items 4–7 and 13, `sessions/doc/realtime-plan.md`) — do not redo its investigation. Budget **$6**, Sonnet 5.5, medium effort. Batch reads; scripts read raw data; chat = one sentence.

## What the owner wants
1. **Account for every message and every tool call** that accrues token cost, in every session (Claude and OpenRouter, **kept separate** — different data, accounting and rendering; Claude = "Claude $total", OpenRouter = "$total"). First check whether the **Claude Agent SDK already does its own real-time accounting** (result messages, per-message usage events); if it does, lean on it, otherwise our own script.
2. **A `Session` class**, usable on the **server AND the client** (one class, native ESM, no build). Instantiate it with a session id/file and it loads the whole raw session file **in code, never into an LLM**, computes costs, and a breakdown (tools used, time running, cache read/write, per-model) — plus subagent rollups into the parent.
3. It renders: a **preview row** for the data grid and a **detailed view** (click-through) on the AI Sessions page (`public/framework/ai/sessions/`), as the two display modes of the same class.
4. **Don't reprocess a huge raw file on every load.** Process once, cache the result (a per-session `session.jsonl` summary + incremental tail: process new lines only, idempotent by message id). The page loads the small cached/streamed data, not the raw file. The site is already slow on mobile (waterfall loads of dozens-hundreds of files); this must not add to it — measure and report the bytes/requests the Sessions page loads before and after.
5. **Per-session folder** `public/framework/ai/sessions/<slug>/` holding `session.jsonl` (session-specific: usage, costs) beside `page.jsonl` (page-level data). Agents never hand-write JSONL: lines are written by a Servex tool/skill that stamps time and author. Streaming transport (the JSONL `live()` tail, not polling) is owned by task `2026-10-08/live-not-polling` — consume its stream, don't build another; coordinate by reading its `findings.md`.

## Deliverables (numbered)
1. `findings.md`: does the SDK account in real time (evidence), and which source is the truth per provider.
2. `Session.js` (class file named and capitalised to match, per CLAUDE.md traps) in the right module folder per the readme chain; server + client use, with a node test that loads a real session file and checks its total against `Server/session-cost.mjs` / the reconcile result (gap reported, target 0).
3. The Sessions page's preview row + detail view backed by it; check at the four widths; through the merge gate.
4. A node script `Server/session-summary.mjs <session-id|file>` printing the same summary (so agents ask a script, not read a file).
5. Docs: `sessions/doc/` note (shape of `session.jsonl`, loading, saving, timing), linked from the readme.

## Rules
Worktree + merge gate for site files; commit with attribution; no loose files; land with `finish-task`. Anything needing the owner → `Note:` card on the AI board plus one line in findings.md.
