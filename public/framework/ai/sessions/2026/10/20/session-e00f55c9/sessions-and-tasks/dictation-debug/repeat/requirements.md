# Dictation: Whisper repeats the end of what was said

Budget: $5. Load the `minion` skill first. The owner's ask is in `../requirements.md` (dictation that never fails); this is one bug from a real session.

## The bug
Seen in `public/framework/ai/sessions/2026/10/25/v-xhx7fmx/session.jsonl` line 34:
- **What happens:** `text` is right, but `raw` repeats a tail span ("…But all right. now with a question mark. And then on a new line, it says, can you hear me? …"). Words from the middle come back after the end.
- **Why it gets through:** `ComposerMic.collapse_repeat` (`ext/Chat/Mic.js:634`) only catches a whole-text doubling (first half = second half).
- **Risk:** if the cleaner had not dropped it, the bubble would show it too.

## Do
1. Worktree: `node Server/worktree-up.mjs dictation-repeat`, then work only there (branch worktree/dictation-repeat).
2. **Find the cause first.** Where do the repeated words enter? Look at that sentence's runs in the Whisper log (`public/framework/ai/whisper/bucket.jsonl`, around 2026-10-25T05:59Z; the reader is `audio/Whisper/WhisperLog.js`) and at how Dictate stitches its windows into one text (`ux/Dictate/Dictate.js`; search for where the final text is joined from segments or windows). Write the cause in one `log` line in `session.jsonl` in this folder, with the evidence (the line numbers or run ids).
3. **Fix at the cause** if it is the stitching (an overlap appended twice). Keep a safety net in `collapse_repeat`: also drop a tail of 5 or more words that repeats a span already in the text. Never touch a real repeat the speaker said ("no, no, no" stays; fewer than 5 words is never collapsed).
4. **Prove:** a small node test `ux/Dictate/test/repeat.mjs` that feeds line 34's raw, a whole doubling, a short real repeat and a clean sentence through `collapse_repeat` (and through the stitching, if you fixed it), and prints ok/FAIL per case. Also re-run `ux/Dictate/test/order.mjs` and `flicker.mjs` against your worktree server (port in the main repo's `.worktrees.json`). Index the new test in `ux/Dictate/test/files.jsonl` (copy a row's shape) and the proof list in `ux/Dictate/readme.md`.
5. Docs: one sentence where the repeat handling is described (`grep -rn "collapse_repeat\|repeat" public/framework/ux/Dictate/doc public/framework/ext/Chat/doc`), saying what is collapsed and what is not.
6. Commit by path in the worktree. Log each finding as a `log` line (`node .claude/hooks/append.mjs <file> <json file>`). Then message the parent (`mastermind-dictation-2`) two sentences and stop. If you cannot reach it, the log line is enough. Don't merge.

Fence: `ext/Chat/Mic.js`, `ux/Dictate/Dictate.js` (the stitching only), `ux/Dictate/test/repeat.mjs`, their docs and indexes.

Never: kill or restart the dev server or Servex, stash, push, drive the owner's tabs, or `git add -A` (files.jsonl rows are auto-written noise: add by path).
