# Build brief: per-session turns, and the session identity check

Budget: $8. Model: Sonnet. Load the `minion` skill first, then the `code` skill.

The parent task (owner's words, findings): `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/` (requirements.md, session.jsonl). Work ONLY in the worktree `C:\Code\lew42\worktrees\session-identity` (branch `worktree/session-identity`, site http://session-identity.localhost/). Commit after each step. Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`. Log progress as `log` lines in the parent task's `session.jsonl` (main tree path above) with `node .claude/hooks/append.mjs <file> <lines.json>` (a JSON array of `{"log":{"at":"NOW","msg":"…"}}`).

## Why

One Servex agent id runs as several Claude sessions over time: `ai-system-mastermind` has had 12 (11 `renew` events in `%LOCALAPPDATA%/lew42/servex/logs/agent-ai-system-mastermind.jsonl`; renewal is `Agent.renew()`, `Servex/agents/Agents.js` ~1553). `Agents.session_turns(sid)` (Agents.js ~764) returns EVERY turn in the agent id's log, so a session's per-task split (`Task.attribute`, `public/framework/core/Task/Task.js` ~241, called from `Servex/agents/page_tools.js` ~754) counts its predecessors' turns as its own "untracked" spend. A session's turns must be its own only.

## Step 1: tag each turn with its session (Servex)

1. `Servex/agents/turn-costs.js` `turn_costs(text)`: each returned turn also gets `session` (a uuid or null): the session in force when that line was written. Track it while walking the lines, from, in priority:
   - the line's own `session_id` field (new, step 1.3);
   - a `{"type":"renew","session":…}` line (a fresh session from then on);
   - a host `agent_msg` whose `text` contains `/framework/ai/sessions/<uuid>/` (the whoami line of a fresh spawn: `Agents.whoami`);
   - a `{"type":"transcript","meta":true,"text":"session <uuid> · …"}` line (`Agent.began`, when a resumed process learns its id).
   The line filter at the top of the loop must let those lines through (cheap `includes` checks first; the file is often 10 MB+). Keep the existing cost logic byte-identical: prove it by running `turn_costs` on 3 real agent logs before and after and diffing `cost` per turn (must be equal).
2. `Agents.log_cost(id)`: carry `session: t.session ?? null` into each mapped turn. `Agents.session_turns(sid)`: keep only turns whose `session === sid`; a turn with `session === null` counts only when the agent's log has no session marker at all AND the row's `session_id === sid` (an old single-session log).
3. `Agent.result` (where the `turn_cost` / `sdk_total` line is emitted, Agents.js ~2181): add `session_id: this.session_id ?? null` to that line, so new logs are exact.
4. Test: `Servex/agents/turn-costs.test.mjs` (new; plain `node:assert`, prints `N passing` like `Server/stale-close.test.mjs`): a synthetic log with a whoami line, two turns, a `renew`, two turns, a resumed process with a `transcript` session line, one turn, and one line carrying `session_id` → each turn's `session` is right, costs unchanged; `session_turns`-style filtering returns only one session's turns. Run it and `node Servex/agents/session-state.test.mjs` (must still pass).
5. `node --check` every file you touched. Commit: `Servex: a session's turns are its own (turn_costs tags each turn with its session; result lines carry session_id)`.

Servex loads this only after a restart. Do NOT restart it; say so in your log.

## Step 2: the identity check (`Server/SessionIdentity.mjs`, class `SessionIdentity`)

Name and home are fixed: `Server/SessionIdentity.mjs`, `class SessionIdentity`, CLI `node Server/SessionIdentity.mjs <session id> [--print]`. Read-only on every record. It answers, for one session id, as one JSON object:

- `transcripts`: every file under `~/.claude/projects/*/` named `<id>.jsonl` (and `<id>/subagents/*.jsonl`): path, bytes, lines, `own_lines` (top-level `sessionId === id`), `foreign_ids` (other top-level `sessionId` values with counts; expected empty), `duplicate_uuids` (lines whose `uuid` repeats: the extension re-appends history; harmless because cost dedupes by message id), `compactions` (count of `system/compact_boundary`), `ids_after_compaction` (the set of top-level ids after the first boundary: must be just `[id]`).
- `folders`: every dated folder in `public/framework/ai/sessions/YYYY/MM/DD/` for the id (`session-<first 8>` or the full uuid): a list; `split: true` when more than one (session-e00f55c9 has 10/20 and 10/24).
- `cost`: `cache_usd` (newest `{"summary"}` in the folder's `cache.jsonl`), `recount_usd` (an independent recount: `cost_of_session` from `public/framework/ai/AISession/AISessionAudit.mjs`, read its export first), `agree` (within 0.5%). `shared_messages`: assistant `message.id`s that also appear in ANY other transcript in the same projects dir modified since this session's first line (a resumed or forked copy would double-count); count and the other file names. Expected 0.
- `chain` (Servex agents only): the registry row(s) (`%LOCALAPPDATA%/lew42/servex/registry.json`) whose `session_id` is the id, then from that agent's log every session it has run as (the same markers as step 1, import `turn_costs` from `Servex/agents/turn-costs.js`): `[{session, from, to, turns, turn_usd, transcript_usd}]`. `turn_usd` (from the agent log) and `transcript_usd` (that session's cache) are two numbers that should be close; show both.
- `children`: registry rows with `parent_session === id`: id, task_dir, `linked` (the parent's record, or a record above the child's folder, has a `{"task":"<child folder url>"}` line, or the child folder sits inside the session folder). `unlinked` count.
- `ok`: true when foreign_ids is empty, ids_after_compaction is `[id]`, cost agrees, shared_messages is 0 and unlinked is 0. `problems`: a list of plain sentences, one per failure.

Run it on `e00f55c9-bad4-4ee2-899e-d629ea1eede6` (a VS Code tab, 59 MB: it must finish in under 60 s; stream the file line by line with `readline`, never `readFileSync` on it) and on `7c6c8d93-e066-4ee5-b4b1-35480048f0a0` (ai-system-mastermind, renewed from `2da03974-…`). Save both outputs as `identity-e00f55c9.json` and `identity-7c6c8d93.json` in the parent task folder (main tree path above; these are records, commit them in the main tree is NOT yours: write them into the worktree's copy of that folder so they merge with the branch).

Test: `Server/SessionIdentity.test.mjs` on a temp projects dir and a temp sessions root (constructor options `{projects, sessions, registry, logs}` so a test never touches the real ones): a clean session passes; a transcript with a foreign top-level id, a shared message id with another file, and a second dated folder each produce exactly one problem.

## Step 3: numbers on the tracking page

`Server/TrackingCheck.mjs` writes `public/framework/ai/tracking/report.json`, drawn by `public/framework/ai/tracking/TrackingView.js` (read `public/framework/ai/tracking/readme.md` first). Add a fourth check, `identity`: run `SessionIdentity` for the sessions TrackingCheck already lists in its window, but only the 10 most recent plus any given by `--id`, and put a compact row per session in `report.json` (`id, ok, problems.length, cache_usd, recount_usd, shared_messages, folders, unlinked`). In `TrackingView.js` add one section in the same style as the existing three: a heading "Session identity", one line saying what it checks, then a row per session (✅ or the first problem). Update the tracking readme's list of checks by one line. Shoot the page at 400 and 1200 with `node Server/shots.mjs` or the `ui-test` skill (look at how the existing tracking shots were made) into the parent task folder `shots/`.

## Done

Three commits on `worktree/session-identity`. Reply in one screen: the two runs' `ok`/`problems`, the cost pair for each, the before/after turn-cost diff result, test counts, and anything you could not do. Never mark the parent task complete; I land it.
