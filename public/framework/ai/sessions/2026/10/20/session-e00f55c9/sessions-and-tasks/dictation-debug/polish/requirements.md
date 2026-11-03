# Dictation Debug tab: the follow-ups from its review

Budget: $5. Sonnet, medium effort. Load the `minion` skill first. Work in a quick-fix worktree (`take_worktree`), commit each step, and run `node Server/smoke.mjs <worktree>` (no FAIL). I review and merge.

The Debug tab landed on michael/dev from [the parent task](../requirements.md); its fresh review passed with notes ([review.md](../build/review.md)); notes 1 and 5 were fixed before the merge. The owner's focus is website dictation that **always works**, so the two rows that answer "the AI never answers" must be on screen without scrolling.

## Do

1. **All five Debug rows on one phone screen** (review note 6). At 390×844 the chat above takes the top half of the full sheet, which pushes the Sent and AI rows below the fold. When Debug is the picked view, give the rows that space. Prove it with a headless shot at 390×844 showing all five rows, plus one at 1920. Start at `ux/Dictate/DictateDebug.js` and `ext/drawer/Sheet.js`.
2. **One alias for the old name** (note 2). "dictation" is mapped to "debug" in four places (`AIPage.js` VIEWS/HIDDEN and `view_of`, `Sheet.js` `pick`, `tabs.js` `open`). Apply it once, where the url is read (`AIPage.old_link()`), and remove the rest. Old `?drawer=dictation` and `/ai/dictation/` links must still open Debug.
3. **Dead code** (note 3): remove the unreachable `.catch` in `ext/Chat/Mic.js` `post_held` (the failure is already written by `ux/Dictate/chat.js` deliver).
4. **Two small words fixes** (page review notes 3 and 4, [report.md](../build/review/report.md)): the "Debug tab" row in `ux/Dictate/surfaces/page.js` still shows `drawer-dictation-1920.png` (the retired tab); point it at a fresh Debug shot. In the Debug event list, the dropped-wire line ends on a semicolon ("the live wire to Servex dropped (Servex is not answering);"); finish or trim that sentence where it is written.
5. **Two words fixes from the page review** ([review/report.md](../build/review/report.md) notes 3 and 4): the surfaces page row for the Debug tab (`ux/Dictate/surfaces/page.js`) shows `drawer-dictation-1920.png`, the retired tab; point it at a current Debug picture. In the Debug event list, "the live wire to Servex dropped (Servex is not answering);" ends on a semicolon with nothing after it: find where that line is built and finish the sentence.

## Check

Re-run `ux/Dictate/test/debug-tab.mjs`, `stall.mjs` and `deltas.mjs` against your worktree's URL (pass it as the first argument; the default is the live site). All must pass.

## Never

Never kill or restart the dev server or Servex, never drive the owner's tabs, and never `git stash`.

## Report

Write one screen in your task.jsonl outcome: what changed, the 390 shot, and the test results.
