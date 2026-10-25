# Dictation: two tests fail on michael/dev

Budget: $4. Load the `minion` skill first. The owner's ask is in `../requirements.md` (dictation that never fails); these tests are its proof, so a red one hides a real break.

## The bug
- `ux/Dictate/test/stall.mjs`: its "late" scenario prints 2 FAIL on current `michael/dev`.
- `ux/Dictate/test/anchor.mjs`: prints 1 FAIL.
- Both passed when they landed (see `../session.jsonl` line 47). Since then the order fix (`said_at`, `clock.offset` in `ext/Session/Session.js`, `ext/Chat/Mic.js` `ComposerMic.stamp()`, `ext/Chat/Chat.js` `put_line`) and the repeat fix (`ux/Dictate/repeat.js`) have merged. One of those may have broken them, or the tests may assert something that is no longer true.

## Do
1. Worktree: `node Server/worktree-up.mjs dictation-tests`, then work only there. Its server port is in the main repo's `.worktrees.json`.
2. **Find the cause first.** Run both tests against your worktree server and copy the FAIL lines. For each one: is the code wrong (a real break the owner would see), or is the test's expectation stale? Use `git log --oneline -15 -- <file>` on the files the test exercises to find the commit that changed it. Write the cause as one `log` line in this folder's `session.jsonl`, with the FAIL text and the commit.
3. **Fix at the cause.** A real break gets a code fix. A stale expectation gets the test updated, with a one-line comment saying what is true now. Never weaken a check just to make it pass.
4. **Prove:** stall.mjs, anchor.mjs, order.mjs, flicker.mjs and repeat.mjs all print no FAIL against your worktree server. Paste the summary lines into the log.
5. Docs: if behaviour changed, fix the sentence that describes it (`grep -rn` the test name in `ux/Dictate/doc` and `ux/Dictate/readme.md`).
6. Commit by path in the worktree. Then message the parent (`mastermind-dictation-2`) two sentences and stop. If you cannot reach it, the log line is enough. Don't merge.

Fence: `ux/Dictate/**`, `ext/Chat/Mic.js`, `ext/Chat/Chat.js`, `ext/Session/Session.js` (only if the cause is there), this folder.

Never: kill or restart the dev server or Servex, stash, push, drive the owner's tabs, or `git add -A` (files.jsonl rows are auto-written noise: add by path).
