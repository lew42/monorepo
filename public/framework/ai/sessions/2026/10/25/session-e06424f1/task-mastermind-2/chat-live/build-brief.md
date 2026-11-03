# Build brief: fewer session.jsonl lines per spoken thought, plus the placed/handled signal

Budget: $8. Load the `minion` skill first. Worktree: `C:\Code\lew42\worktrees\chunk-ack` (branch `worktree/chunk-ack`, work ONLY there, cwd there). Read first: [proposal.md](proposal.md) (the REVISED section), `Servex/agents/Sessions.js` (say ~L960-1027, mark_sent L630, write L639, voice_say / the fast seat's `{place}` handling ~L469 and ~L1418, release_thought ~L1150, feed_smart ~L274), `Servex/agents/PromptLines.js`, `Servex/agents/Agents.js` ~L1780 (the SDK `result` event), `public/framework/ext/Chat/v2/ChatV2Model.js`, `ChatV2.js`, `ux/Dictate/Widget.js`, `ux/Dictate/Mic.js` (~L615 raw, ~L644 auto_check).

## The owner's constraints (verbatim intent)
- No new system, no new id kind. The chunk id is the chat line's `at` (say() already returns it); the Prompt id is `p-<ms>`. Say in your report where a new id was unavoidable (expected: none).
- As few lines in `session.jsonl` as possible (file is 2 MB / 6,000 lines). Cursors (placed/handled) run off the LIVE signal; on reload they are rebuilt from existing lines.
- Target shape: each chunk is ONE `chat` line (the raw record). The fast seat does NOT append per chunk. When the Prompt closes (~8 s quiet) ONE line writes paragraphs/grouping/first title with the chunk `at`s it covers. When smart finishes ONE line writes title/text/tasks/questions/notes, each pointing at source chunk `at`s. The separate `done` ack is folded into those conclusive lines (no `{done}` line).
- Reuse the item tool, session.jsonl, Prompt record, `{sent}`/`{place}` lines. No new store, no polling.

## Measured baseline (real session `public/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl`, 511 thoughts, 1214 chunks)
Per thought (Prompt): ~2.4 `chat` + ~2.4 `place` + ~3.0 prompt-record lines (`p-…` keys: raw.push, paragraphs.append, tasks…) + ~0.67 `sent` + ~0.68 `quiet` + ~1.07 `tasks` = ~10.5 lines (4.4 per chunk). First write `Server/lines-per-thought.mjs <session.jsonl>` (kept in the repo, readme-listed) that prints these counts, and run it before and after (the "after" on a fresh synthetic/live dictation in the worktree's server, or by replaying the same chunks through the new write path).

## Steps
1. Investigate and write a 10-line plan into your task log: exactly which writes happen per chunk today (who writes `place`, `raw.push`, `paragraphs.append`, `quiet`, `sent`), and which can become (a) live-only (`this.push(...)` without `append`), (b) folded into one close line, (c) removed. Do the cheapest ones first; each change must keep reload == live (the rendered chat after reload equals what was drawn live — add a test in the style of `ext/Chat/v2/resurface.test.mjs`).
2. Live signal: per-chunk "placed" (fast) and "handled" (smart) are pushed on the stream (not appended) tagged with the chunk `at`; the client draws the ✓/🧠 cursors from it. On reload, cursors are rebuilt: placed from the Prompt close line's covered `at`s; handled from the smart conclusive line's source `at`s. Where a turn writes nothing at all, the Agents.js `result` hook may push a live-only fallback.
3. Mic.js: `raw` per sentence (~L615), gate `auto_check` (~L644) by send mode, comma fast-chunking.
4. The V2 live view must not lose per-sentence cleaned text appearing while the owner speaks: keep that via live push; report anything the live view does lose.
5. Tests: existing `ext/Chat/v2/ChatV2.test.mjs` (53) and `resurface.test.mjs` (17) must still pass (argv[2] = the worktree base URL from `.worktrees.json`); add tests for the new write path. Servex-side code is tested by booting a private Servex from the worktree on another port (see `Servex/readme.md`), never the live one.
6. Update readmes in the same change (`Servex/agents/readme.md` or wherever Sessions is documented, `ext/Chat/readme.md`, `ux/Dictate/readme.md`): exact on-disk line shapes after the change.

## Report (one screen, to your task `session.jsonl` finish line + final message)
Lines per thought before/after (the script's output), per-spoken-sentence before/after, what the live view loses (if anything), where a new id kind was unavoidable (if any), tests run, commits (exact paths, end with `Co-Authored-By: Claude Code <noreply@anthropic.com>`).

## Never
Kill/restart the live dev server or Servex, `git stash`, push, drive the owner's tabs, link node_modules to the main tree's, run `node server.js`. Do not merge; the mastermind reviews and merges. Servex restart is the owner's chosen time.
