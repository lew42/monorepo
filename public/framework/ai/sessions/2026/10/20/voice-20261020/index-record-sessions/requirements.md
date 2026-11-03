Budget: $4

# AISessionIndex: index record-only sessions (cloud voice calls)

## The ask
The owner, via the cloud voice agent (2026-10-20): a cloud voice session registered with `register_session` and wrote `session_summary`, which created `public/framework/ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/` (session.jsonl, session.summary.json, a `started` line in ai/log.jsonl), yet it does not appear on the AI sessions dashboard (/framework/ai/sessions/), while spawn_agent sessions do. Indexing must be programmatic, so no agent ever has to remember it.

## Cause (verified)
The dashboard reads the day index `sessions/YYYY/MM/DD/index.json` (`snapshots[]`). `public/framework/ai/AISession/AISessionIndex.mjs` builds it only from Claude transcripts under `~/.claude/projects/c--code-lew42-*` (`project_dirs()`). A cloud voice session has no local transcript, so it never gets a snapshot. Folder + line 1 are written by `Servex/ext/remote/RemoteMCP.js` `voice_session()`.

## Build
- In AISessionIndex (the one writer of the day index), also pick up **record-only sessions**: any folder directly under a day dir that has `session.jsonl` (via `SessionRecord.file(dir)`) whose line 1 is `{session:{id,kind,...}}` and that no transcript snapshot already covers. Make a snapshot for it from the record: id, title (session.summary.json title, else a `summary` line, else the folder name), kind (`cloud-voice-agent`), first_at/last_at from the line timestamps, usd from the latest `cost` line (else null), and its folder/home so the grid row opens it. Match the shape the grid (`AISessionRows.js` / `AISessionsPage.js`) already renders; read those before writing.
- It must run on the same schedule as the existing index pass (and pick up a new folder without a restart if the existing watch can be widened cheaply; otherwise on the next roll is fine — say which).
- Do NOT have RemoteMCP write the day index (one writer).
- Update `public/framework/ai/sessions/readme.md` (the "How data gets in" table) in one line.

## Fence
Files: `public/framework/ai/AISession/AISessionIndex.mjs` (+ a small helper class file beside it if needed), `public/framework/ai/sessions/readme.md`. Work in a worktree (`take_worktree`). Do not touch Servex/.

## Prove it
Run the indexer once (node, against the real sessions dir, in the worktree) and show that `sessions/2026/10/20/index.json` gains a snapshot for `cloud-voice-task-system-and-voice-agent-exploration` without dropping any existing snapshot (count before/after). Commit in the worktree with a clear message; report the commit, the before/after counts, and whether a dev server restart is needed. Do not merge; the mastermind reviews the diff and merges.
