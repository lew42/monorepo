# Dictation: demo pages write fake runs into the real Whisper log

Budget: $3. Load the `minion` skill first. The owner's ask is in `../requirements.md` (dictation that never fails); the Whisper log is how a failed dictation is debugged, so fake runs in it mislead whoever reads it.

## The bug
- Seen: `public/framework/ai/whisper/bucket.jsonl` gets runs written while `Server/smoke.mjs` (run by every merge) loads the Dictate demo pages under `public/framework/ux/Dictate/` (found again on 2026-10-25).
- The reader is `audio/Whisper/WhisperLog.js`. Find the writer: `grep -rn "bucket" public/framework/audio/Whisper public/framework/ux/Dictate Server/*.mjs`.

## Do
1. Worktree: `node Server/worktree-up.mjs dictation-bucket`, then work only there.
2. **Find the cause first:** which demo page and which call write the run, and why a fake or demo mic reaches the real log. Write it as one `log` line in this folder's `task.jsonl` (`node .claude/hooks/append.mjs <file> <json file>`, shape `{"log":{"at":"NOW","msg":"…"}}`), with the file:line.
3. **Fix at the cause.** Prefer this: a demo or fake mic never writes the real log, and a real mic on any page still does. Don't touch smoke.mjs to hide it.
4. **Prove:** load the demo page headless against your worktree server (port in the main repo's `.worktrees.json`). Count the lines in the worktree's `bucket.jsonl` before and after: they must be equal. Then show a real write still lands (an existing test or a direct call). Put both numbers in the log.
5. Docs: one sentence where the Whisper log is described (`grep -rn "bucket.jsonl" public/framework/audio/Whisper/*.md public/framework/audio/Whisper/doc`).
6. Commit by path in the worktree. Don't merge. Your log line is the report.

Fence: `public/framework/audio/Whisper/**`, `public/framework/ux/Dictate/**`, `public/framework/ext/Chat/Mic.js`, this folder.

Never: kill or restart the dev server or Servex, stash, push, drive the owner's tabs, or `git add -A` (files.jsonl rows are auto-written noise: add by path).
