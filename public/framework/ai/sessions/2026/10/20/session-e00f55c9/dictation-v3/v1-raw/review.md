verdict: fix
1. [fix] A `place` line with `edit: "improve"` still overwrites the owner's words on screen: `ux/Dictate/Widget.js:583` (`patch_piece(hit.bubble, …, { text })`) swaps the raw text for the assistant's, and the raw words survive only in `said`, which nothing draws. The brief asked for this check ("whether a `place` line moves it… whether a `{"p-<id>": {"text": …}}` edit overwrites it"), but the cause log in `session.jsonl` covers only the Question hide. The fixture's `place` text is identical to the raw text (`raw-stays-fixture.jsonl:3`), so the test can't catch an overwrite. Either draw the raw words beside the improved ones, or record why an improved text counts as "visible", and add a fixture line whose improved text differs.
2. [fix] The second commit is missing: the brief asks for one line in `ux/Dictate/improvements.jsonl` (through the `item` tool) about the writer. The file's last line is from `mastermind-v1-order`, and the branch has only the two commits `568254a08` and `d28d84a3a`.
3. [fix] There is no `shots/` folder in this task dir. The brief asks for one headless 400x860 shot of V1 with the fixture, stored here and read by the builder. `raw-stays.mjs` can write `raw-stays-400.png`, but nothing was saved here and no reading of it is logged.
4. [fix] Nothing here shows that the tests passed. `session.jsonl` has no run result for `test/raw-stays.mjs`, `test/order.mjs`, `test/chat-sent.mjs` or the full suite, and `improvements.jsonl` already says `chat-sent.mjs` fails on michael/dev (task `tn54m85a`). The brief's "every existing case and the full suite still pass" can't be checked from this folder. Log each run's pass/fail lines.
5. [fix] A stale pointer: the new comment at `ux/Dictate/Widget.js:485` and the one in `test/chat-sent.mjs` (around line 105) cite `ux/Dictate/tasks/v1-raw`, which doesn't exist. The task lives at `/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/v1-raw/`.
6. [note] The brief asked for a look at the sessions after 21:30 and the voice sessions in `index.jsonl`. The log names only `v-u48msei`, so we don't know whether other sessions show some other way sentences vanish.
7. [note] The brief said to log the cause in `task.jsonl`, but this dir has `session.jsonl` instead; the cause line is there (line with "Cause found"), which is fine for a fresh agent.
8. [note] The fix itself is as simple as it gets: one line removed (`parent.style.display = "none"`), with the Question/Task row still inserted after the bubble. The `chat-sent.mjs` check and the new `raw-stays.mjs` both assert the bubble stays visible. I found no other hide path (no CSS on `[data-under]`, no other `style.display` in the Dictate views apart from the playground).

## Requirements
- Widths: none. This diff changes no page layout and no shots were given, so only Requirements and Words are answered.
- 1 "Find the cause first… log it… with a line number from the real session" — yes, partly — `session.jsonl` "Cause found" cites `Widget.js` ~484 and `v-u48msei` lines 3, 4, 10, 12. The `place` and `text` checks are not answered (finding 1).
- 2 "fix V1's drawing so the raw text always shows" — partly — the Question hide is gone (`Widget.js:482-485`), but a `place`/improve still replaces the raw words (`Widget.js:583`).
- 3 "as a second commit, add one line to `ux/Dictate/improvements.jsonl`" — no — finding 2.
- 4 "a node test beside `test/order.mjs`… replay a fixture taken from the real session… including those that later got a Question, a Task or a `place` line" — yes — `test/raw-stays.mjs` and `raw-stays-fixture.jsonl`, four lines copied verbatim and one synthetic Task line, labelled as synthetic.
- 5 "Every existing case and the full suite still pass" — not shown — finding 4.
- 6 "one headless shot at 400x860… in `shots/` here, and read it yourself" — no — finding 3.
- 7 "Docs… adding the raw-log rule" — yes — `ux/Dictate/readme.md` has the new "V1 is the raw log" bullet, and the Proofs list names `test/raw-stays.mjs`.
- 8 Fence (no edits to `core/Session/`, `audio/Recite/`, `ext/Chat/v3/`, or session files) — yes — `git diff michael/dev...worktree/v1-raw` touches only `ux/Dictate/` (5 files).
- 9 "Merge… `git log michael/dev..worktree/v1-raw` is empty" — no, not yet — two commits are still unmerged. That is expected before review.
- 10 Class instances page — n/a
## Words
- content 1 (plain, full sentences) — yes — the readme bullet states the rule first, then the old bug, then the proof.
- content (no undefined jargon) — yes, with one small point — "fast seat" appears in the code comment without a definition, but the term is defined elsewhere in the Dictate docs.
- content (links resolve) — no — `ux/Dictate/tasks/v1-raw` in the comments is a dead pointer (finding 5).
