# Cloud voice agent — 2026-10-19 — live page sessions, voice logging

A **cloud voice agent** session: the owner dictating in the Claude app, the agent (`voice-app`) working through the Servex MCP. No local Claude Code session file exists for it, so this folder is its record. Hand-written by voice-app this once; `task-mastermind-voice-logging` is building the code that writes `session.jsonl` here from now on.

Log level — asks in order, decisions, agents spawned (by path), anecdotes. May be purged. The persistent record is in module docs, linked below.

## Asks, in order

1. Make `public/live/` a session-based idea feed; past sessions findable. Changes land live (no worktree).
2. Research before building: JSONL `live()` tail, `Page extends Item` persistence, Inbox fit. Don't rewrite what works.
3. Context cards (asked before): nested dynamic cards on screen while dictating — the prompt refinement system. Noted, not built.
4. `item` tool design: live server-side instance + `set(path, value)` deltas (owner leans this way) vs raw append-only JSONL tool. Undecided. Detail: [doc/owner-evolving-compaction.md](doc/owner-evolving-compaction.md).
5. Evolving compaction, not whole-card rewrites (last round lost content).
6. Phase two: card buttons that write to disk via the dev socket.
7. `public/live/` new files gitignored for now (toggleable line). Done, committed `ed89b264e`.
8. `/live/sessions/` showed only Oct 15 → mastermind made it read 14 days of `index.json`. Unverified in a browser.
9. **Voice sessions are not logged** (asked before). Top priority. Finding: `session_summary` refuses because Servex mints no session for a cloud client on connect. Detail: [doc/owner-sessions.md](doc/owner-sessions.md).
10. Cloud-vs-local fork belongs at the top of the Servex MCP server instructions; CLAUDE.md gets one line pointing there.
11. Naming: these are **cloud voice agent** sessions, one folder per day here. Separation rule: session = log level, may be purged; module `doc/` = persistent decisions + link to the session. Rule written: `/framework/ai/doc/sessions-vs-docs.md`.
12. A "session" is one cloud voice agent conversation, not "cards between two clears" (the mastermind's page-centric definition in `public/live/doc/sessions.md` — to be corrected).

## Agents spawned

- `mastermind-live-page` — Sonnet, acceptEdits (mistake: could not spawn, commit or load a page; resume did not apply bypassPermissions). Task dir: `spawned/mastermind-live-page/`. Wrote the three docs and the sessions view; voice-app did its commit.
- `minion-voice-logging` — Haiku by default, stopped at 0 turns (CLAUDE.md: Sonnet for OO code).
- `task-mastermind-voice-logging` — Sonnet, bypassPermissions, worktree. Task dir: `spawned/mastermind-live-page/voice-logging/`. Brief: `Servex/ext/remote/doc/voice-logging.md`.

## Problems seen

- The MCP does not inject CLAUDE.md; voice-app had to fetch it.
- voice-app relayed through chat for ten prompts before writing a file, and never put a card on `/live/` though `public/live/readme.md` says that is the rule.
- `wait_for_agent` blocks; in voice mode the owner's next utterance interrupts it, so follow-ups silently never happen. Text mode is better.
- Servex `shell` returns `timed_out` on git commands that do complete (slow repo, ~60s+).
- Minion role cannot take a worktree when the pool is empty; spawn a task-mastermind.
- `/live/` index: Tasks card redirects to `/framework/ai/`; Now card click does nothing.
