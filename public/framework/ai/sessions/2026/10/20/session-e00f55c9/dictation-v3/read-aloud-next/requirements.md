# Read-aloud: resume after barge-in, karaoke follow with phrase streaming, tap to pause

Budget: $15. Load the `minion` skill first, then `code` and `ui`. You own this one task end to end. The owner's words: [../recite-voice/requirements.md](../recite-voice/requirements.md), last section ("The owner's feedback once read-aloud was heard", 2026-11-01 20:34). Read-aloud now works on the owner's phone (Android Chrome, https://monorepo.lew42.com).

**Code you start from** (read the readmes first: `public/framework/audio/Recite/readme.md`, `doc/`):
- `audio/Recite/Recite.js`: state `idle | loading | playing | paused | heard` ("heard" = paused by barge-in). Around line 183 it pauses when the owner's line arrives.
- `audio/Recite/BargeIn.js`: barge-in follows the Dictate mic's level.
- `audio/Recite/ReciteBar.js`: the one-line control on the bar.
- `audio/Recite/ReciteHighlight.js`: the karaoke playhead.
- `ext/drawer/Sheet.js`, `read_aloud()`: which session's replies are read. Bump `READ_ALOUD_V` on every change there.

## Build, in this order: one worktree, one commit per piece, one merge per piece

Make the worktree with `node Server/worktree-up.mjs read-aloud-next`.

1. **(a) Resume after barge-in.** Today the interrupt works but reading never comes back.
   - Once the owner goes quiet (no mic speech for about 1.5 s, and no new line), resume where it stopped: the sentence that was cut, from its start.
   - If the owner's line was a new question (it ends in "?" or a reply to it is coming), drop the old reply and read the new one when it arrives.
   - Add a resume control on the bar (ReciteBar) while the state is `heard` or `paused`.
2. **(c) Karaoke follow + phrase-level streaming.** They share the word timing.
   - **Start sooner:** begin speaking after the first phrase (a comma or clause, or about 3 words) of a streaming reply, not the whole sentence. Keep the queue in order, so nothing is spoken twice or skipped.
   - **Follow the voice:** while reading, keep the line being read visible in the chat. If the sheet is not fully open, scroll its content so the line moves down with the voice, and highlight the words or phrase being spoken.
   - **Hand back the scroll:** if the owner scrolls by hand, stop following until the next reply.
3. **(b) Tap the text being read** to pause it; tap again to resume.

## Prove it (each piece, before its merge)

- Extend `audio/Recite/Recite.test.mjs` for the state logic (resume, question drops the old reply, phrase splits, no double or skipped phrase).
- Take headless shots at 400x860 (phone) and 1200, of the sheet half open while a long reply is read, showing the highlight and the scroll position moving. Put them in `shots/` here and read them yourself. Recite has a demo page at `/framework/audio/Recite/`.
- Review: `node Server/review.mjs <this dir> <worktree path>`. Answer every finding as a `{"review":{"answer":{"n","reply"}}}` line in this dir's `task.jsonl` (`node .claude/hooks/append.mjs`).
- Then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree path> --review-dir <this dir>`. `node Server/smoke.mjs` must show no FAIL.
- Docs current in the same commit: `audio/Recite/readme.md` and `doc/`.

**Report** after each merge, to `mastermind-dictation-v3`, in 3 lines: what changed, the proof, what is next.

**Never:** restart or kill any server or Servex, start or stop recite-server, run `python`, drive the owner's tabs, `git stash`, or `git add` the generated `files.jsonl` (commit by exact path). Log progress in this dir's `task.jsonl`. Resolve, don't park: decide, and write the alternative beside it.
