# Accounting: answers to the owner's questions, 2026-10-16

Each answer is checked against the real files: node scripts read the logs, the registry and git. The questions are in [requirements.md](requirements.md); the evidence is logged in [task.jsonl](task.jsonl).

## Q1. The agent logs: `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`

- **When `turn_cost` started:** commit `049fcea4d`, 2026-10-13 19:40 ("agent cost accumulates across turns ... per-turn turn_cost record"). The first `turn_cost` line was written at 19:55 the same evening.
- **The 275 is not a sample. It is every agent since then.** 278 logs carry a `turn_cost` line. Of the 3,019 agent logs (158 MB), 287 were written to after the switch; the other 9 never finished a turn.
- **It is a separate event log, not a copy of the transcript.** Servex writes one line per event: streamed text pieces (`delta`), tool calls, results (with cost and turns), sleep and wake, and compaction. Tool inputs are cut short (10,816 of 19,202), and tool results and token counts are not kept. The raw `~/.claude` transcript stays the full record.
- **❌ Not indexed in `public/framework/ai/readme.md`.** It is described two levels down, in `doc/design/systems-overview.md:144` and `sessions/doc/cost/spend-tree.md:13`, and no doc mentions `turn_cost`. That is a fail under the owner's rule. Fixed in this commit: the readme's Accounting line now links the agent logs.

## Q2. The three counters

| Counter | Reads | Writes |
|---|---|---|
| **Registry `cost`** | the SDK's `total_cost_usd` on each result, added up turn by turn (`Agent` in `Servex/agents/Agents.js`) | `registry.json` row `cost`, plus `turn_cost` in the agent log |
| **AISession snapshot** | the live transcript tail, remembering only the last 40 message ids (`RING = 40`, `ai/AISession/AISession.js:63`) | the browser's live session index |
| **Digest and Audit** | the whole raw transcript, each message counted once (`ai/AISession/AISessionDigest.mjs`, `AISessionAudit.mjs`) | `digest.json` in the session folder |

- **Keep Digest and Audit.** They are the exact counter, and they agree with each other (559 of 559).
- **Delete the AISession snapshot's own cost tally.** It double-counts any message replayed beyond its 40-id memory, up to 2x. The page should show the session's running total instead (R10).
- **Delete the registry `cost` as it is computed today.** It sums a figure that is already cumulative, so it inflates with every turn: 2.85x at 2–3 turns, and 16x at 21 turns or more. Its replacement is R10's running total, written per turn with the Digest's own counting rule.
- **Also stale:** `Server/spend-tree.mjs` output (not refreshed since Oct 4) is a fourth copy. It should become the tree walk in [shape.md](shape.md), not a second store.

## R10. One running total per session

Servex appends one line per turn to the session's `usage.jsonl` (tokens, and either `claude_usd` or `openrouter_usd`). It keeps the running sum in the session's index row, so a grid of 100 sessions reads 100 numbers. The detail page re-runs `AISessionDigest` over the raw transcript and flags any mismatch. This is the same design as [shape.md](shape.md), section 2.

## R11. Renaming a session folder's `task.jsonl` to `session.jsonl` {#r11}

- **Files:** the repo tracks 1,638 files named `task.jsonl`. Of them, 757 sit directly in a day folder: those are session logs and would be renamed. The other 876 are tasks inside a session and keep the name.
- **No collisions:** 588 day folders already have a `session.jsonl` (tag lines written by the digest pipeline), but no folder has both files. Those tag lines would share the one session log.
- **Code:** 157 code files mention the name (503 times), with 200 docs and 16 skills. The ones that matter:
  - `Server/TaskDirs.mjs` and `Server/SessionIndex.mjs`
  - `Servex/TaskLoop.js`
  - the hooks `append`, `ledger`, `jsonl-schema`, `prompt-relay`, `reply-relay` and `step-prompt`
  - `ai/AISession/` (`AISessionIndex`, `StoreFolder`, `Detail` and `Trace`) and `ai/AITask/` (12 files)
- **Not one commit:** it takes three steps.
  1. Add one resolver (`TaskDirs.log(dir)`) that returns `session.jsonl` and falls back to `task.jsonl`, and switch the readers to it, a few commits at a time.
  2. Make the writers create `session.jsonl` in new session folders.
  3. Run one scripted, reversible `git mv` pass over the 757 files, with a dry run and a manifest.

  Old paths keep resolving through the fallback.

## R12. Folder slug and agent id {#r12}

- **Confirmed: they rarely match.** Servex mints an id as `role-name` (`Agents.name()`, `Servex/agents/Agents.js:387`), but the folder takes the slug alone. Of the 580 registry rows that have a folder:
  - 26 match exactly.
  - 425 are `role-` plus the folder name (for example, `mastermind-voice-20261016` and `voice-20261016`).
  - 129 differ in some other way (`minion-structure` and `b-structure`).
- **Proposed rule:** the folder name IS the agent id, as minted by `Agents.name()` (including any `-2`). The full SDK session id goes on line 1 of `session.jsonl`, and an index row maps each id to its folder. Old folders keep their names and stay reachable through `task-moves.jsonl`.

## R13. Is there one Session class, like Page? {#r13}

- **Not yet.** `core/Session/Session.js` (`class Session`), with `AISession extends Session`, only finds folders (`scan`, `locate`, `dir_url`). It has no `read`, `set` or `log`, and it is not a `Page` or an `Item`.
- **Proposal (revised 2026-10-16 with mastermind-page, following the owner):** `Session extends Item`, and a session HAS a page. The reason: `Page.class.js` imports `View` and cannot load in node, but Servex writes usage in node, and `Item` already runs there (`core/Item/Item.test.mjs` passes).
- **Two files per session folder:**
  - `session.jsonl` (`static file` on `Session`) holds the data: id, parent, model, turns, and `usage` lines. Only code writes it.
  - `page.jsonl` holds what agents draw.
- **Children are Lists:** `subsessions/` and `tasks/` become Lists named `sessions` and `tasks` on the Item.
- **One tool:** `item({path, method, target, args})`, with the `page_*` tools kept as aliases. This replaces the earlier `Session extends Page` idea.
