# Dictation Debug tab: the follow-ups from its review

Budget: $5. Sonnet, medium effort. Load the `minion` skill first. Work in a quick-fix worktree (`take_worktree`), commit each step, and run `node Server/smoke.mjs <worktree>` (no FAIL). I review and merge.

The Debug tab landed on michael/dev from [the parent task](../requirements.md); its fresh review passed with notes ([review.md](../build/review.md)); notes 1 and 5 were fixed before the merge. The owner's focus is website dictation that **always works**, so the two rows that answer "the AI never answers" must be on screen without scrolling.

## Do

1. **All five Debug rows on one phone screen** (review note 6). At 390×844 the chat above takes the top half of the full sheet, which pushes the Sent and AI rows below the fold. When Debug is the picked view, give the rows that space. Prove it with a headless shot at 390×844 showing all five rows, plus one at 1920. Start at `ux/Dictate/DictateDebug.js` and `ext/drawer/Sheet.js`.
2. **One alias for the old name** (note 2). "dictation" is mapped to "debug" in four places (`AIPage.js` VIEWS/HIDDEN and `view_of`, `Sheet.js` `pick`, `tabs.js` `open`). Apply it once, where the url is read (`AIPage.old_link()`), and remove the rest. Old `?drawer=dictation` and `/ai/dictation/` links must still open Debug.
3. **Dead code** (note 3): remove the unreachable `.catch` in `ext/Chat/Mic.js` `post_held` (the failure is already written by `ux/Dictate/chat.js` deliver).
4. **Group by page too** (note 4): `ext/ErrorLog/doc/page-watcher.md` is a proposal; add one line that its board groups failures by `page` as well as by module, because `ErrorLog.module_of` blames the first `/framework/` file in the stack (a shared helper such as `core/View` gets the blame).

## Check

Re-run `ux/Dictate/test/debug-tab.mjs`, `stall.mjs` and `deltas.mjs` against your worktree's URL (pass it as the first argument; the default is the live site). All must pass.

## Never

Never kill or restart the dev server or Servex, never drive the owner's tabs, and never `git stash`.

## Report

Write one screen in your task.jsonl outcome: what changed, the 390 shot, and the test results.
