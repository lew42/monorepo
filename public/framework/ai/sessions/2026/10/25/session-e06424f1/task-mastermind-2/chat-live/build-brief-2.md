# Build brief 2: finish chunk-ack (review fixes, then the handled signal and Mic.js)

Budget: $6. Load the `minion` skill first. Worktree `C:\Code\lew42\worktrees\chunk-ack` (branch `worktree/chunk-ack`, already has commits 9c570590a and 137d865b4 from a first pass), cwd there, commit after each step by exact path. Never `git stash` (a past minion lost edits to it). Context: [proposal.md](proposal.md) REVISED section, [build-brief.md](build-brief.md) (the owner's constraints), the reviewer's findings in `../review.md`. The first pass did ONLY raw-once-at-close + dropping `cues`; this brief finishes the rest. Do the steps in order and report after each in your task log.

Owner constraints still hold: no new system, no new id kind (chunk id = chat line `at`), as few `session.jsonl` lines as possible, cursors from the live signal and rebuilt on reload from existing lines.

## Step 1: fix the review findings (all five)
1. Add a short `plan.md` / note in the task folder (`public/framework/ai/sessions/2026/10/25/session-e06424f1/task-mastermind-2/chat-live/`) saying what this branch does and does not do.
2. Reuse `PromptLines.push_raw` for the close write (delete the duplicate `set_raw`) unless it cannot take an array; if it cannot, keep one function and say why.
3. `PromptLines.say.test.mjs` must run the real `Sessions.js` `assign_prompt`/`close_prompt` (import it; stub only what needs the SDK), not a copy. Add a reload==live check in `ext/Chat/v2/` style (feed the same lines live and as a reload; the rendered chat equals).
4. List `Server/lines-per-thought.mjs` in `Server/readme.md`; run it on the real session (`public/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl`) and put before/after lines and bytes per thought in the notes.
5. Fix the four stale `cues` claims (`Sessions.js:952`, `ext/Session/doc/sessions.md:124`, `ext/Chat/doc/floor.md:26`, `ux/Dictate/doc/widget-notes.md:512`). Also stop the browser sending `cues` in its POST if nothing server-side needs it (`ext/Chat/Mic.js`, `ux/Dictate/*`); grep first.
6. Raw lost on restart: accept it, but write it in the Sessions shape comment.

## Step 2: the "handled" signal for the smart seat, one folded line per turn
Today the smart cursor colours when the smart seat's `working` state clears for the Prompt. Make it exact and cheap: at the smart seat's turn end (Agents.js `result` event ~L1780 -> a small callback on the host, like `process_runner.turn_ended`), Sessions writes ONE line per smart turn, `{done:{to:"smart", re:[<chat at>,...], at, ms, ok?}}`, where `re` is the list `mark_sent` held for that turn (store it on the session record in memory). No fast `done` line: the fast seat's existing `{place}` line (it carries `re`) is its ack. The client (`ext/Chat/v2/ChatV2.js` `place_cursor`/smart cursor, `ux/Dictate/Widget.js`) turns the smart cursor on `done` for those `re`s; if no `done` exists (restart) the current behaviour is the fallback. Test the Servex part by booting a private Servex from the worktree on another port (see `Servex/readme.md`), never the live one; add an automated test.

## Step 3: Mic.js fixes (`public/framework/ext/Chat/Mic.js`)
`raw` per sentence (~L615: raw must be that sentence's raw, not the whole held run), gate `auto_check` (~L644) by send mode (no auto send when the mode is not auto), comma fast-chunking (a comma pause may send a fast chunk). Show before/after in a test or a short trace.

## Report
After each step one task-log line: what changed, tests run (ChatV2.test.mjs 53 and resurface.test.mjs 17 with argv[2] = the worktree URL from `.worktrees.json` must still pass), commit hashes, any loss to the live view. Servex restart is the owner's time: do not restart anything live. Commit trailer: `Co-Authored-By: Claude Code <noreply@anthropic.com>`. Do not merge.
