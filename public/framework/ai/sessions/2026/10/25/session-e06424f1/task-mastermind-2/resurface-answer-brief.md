# Brief: a Question card resurfaces when its answer lands (V1 and V2)

Load the `minion` skill first. Budget: $3. Make your own worktree (`node Server/worktree-up.mjs resurface`) AFTER `worktree/chat-split` is merged to `michael/dev` (check `git log michael/dev..worktree/chat-split` is empty). Commit by exact path. Never stash, never restart the dev server, never drive the owner's tabs.

## What the owner asked (2026-10-25)

When the smart seat answers a Question (`answer: {text, by, at}`), the Question card moves to the NEWEST end of the thread (below newer cards), even if it is on screen, so a slow answer is never buried above. "Try it and see": simple, easy to change (one flag or one method to switch off).

1. **Move on answer.** V1 (`ux/Dictate/Widget.js` `show_task`, ~L454) and V2 (`ext/Chat/v2/ChatV2.js` Question row, ~L258-285) both: when a Question gains its answer, remove its row from where it is and append it at the end of the thread. The data keeps the true order: `created_at` stays, the answer carries `at`; do not rewrite either. If a model `ChatV2Model` fold decides order, keep ONE rule shared by V1 and V2 (law 6), not two.
2. **No transition, no animation** (the owner, 2026-10-25, "transitions are tricky, I don't want to start on them"): a plain move, nothing else. Never move text he is reading mid-sentence: only whole cards move, and only on the answer event.
3. **Log view**: say in `ext/Chat/readme.md` where the true timeline lives (created_at / answer.at); do not build a log view now.
4. **Test first**: a small node test (beside `ChatV2.test.mjs`) that a Question with an answer sorts after a newer Prompt/Task row, and an unanswered one does not move.

## Done means
Test passes; existing Chat/V2/V1 tests still pass; screenshots at 400 and 1200 px you read yourself; readme lines true; committed; one-screen report with the test numbers.
