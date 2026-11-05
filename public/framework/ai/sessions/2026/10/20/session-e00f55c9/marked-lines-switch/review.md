verdict: pass
1. [note] Neither run in `core/Test/run-all.jsonl` (21:11:57 and 21:15:33) was made with the switch off: both ended before the revert `aa4a43681` landed at 21:15:45, and neither has a `browser` block. Step 3's "full suite plus `--browser`" is still unproven for the state that merges. Off, `line-readers.test.mjs` passes (8/8 tests, re-run by this review in the worktree).
2. [note] The diff carries test-run noise from other work: 450 lines in `core/Test/results.jsonl`, the `run-all.jsonl` lines, a second `failures.jsonl` "gone" row in `core/Item/files.jsonl:57` and `core/Test/files.jsonl:48-49`, and `V1Bubbles.js` and `V1Bubbles.test.mjs` indexed in `core/Session/Chat/files.jsonl`, which this task didn't make. Harmless, but it buries the real 6-file change.
3. [note] The task hasn't landed yet: this folder's `session.jsonl` has no outcome or `complete` line. The follow-up is now filed (task `foxtdl3s`: "Update the 10 core test files … then set Store.marked_lines = true"), so a fresh agent can continue. The landing outcome should say the switch was tried (`8e7e88f98`), reverted (`aa4a43681`) and why, and that Servex and the dev server need a restart (`Servex/CloseLoop.js` changed).
4. [note] `core/Item/doc/line-format.md:5` still opens with "real properties, not pseudo properties", which a new reader can't parse. The next sentence explains it; `status.md:29` now explains it in brackets. The phrase could go.
5. [note] Step 2 asked for the failing test to be committed before the fix. For CloseLoop, the test and the fix landed together in `8d285d7b4`. The earlier 8 readers did go red first (`771c48495`, then `ee6e2bb8b`).

## Requirements
- 1 "Fix the cause, not 13 spots … one small shared helper … If core already has one, use it" — yes — it reuses the existing `core/Item/LineKey.js`. `Servex/CloseLoop.js:20` now calls `LineKey.deep`, and `Server/AIIndex.mjs:55,126` already did, which covers StaleClose.
- 2 "Test first … feeds each reader a line in both spellings" — yes, mostly — `line-readers.test.mjs:157-170` adds CloseLoop and StaleClose, and all 8 tests pass in the worktree. CloseLoop's red step was skipped (note 5).
- 3 "Switch the writers … If anything is red, leave the switch out and say why" — yes — the switch was tried in `8e7e88f98`, which turned 10 core test files red because they expect the bare spelling. It was reverted in `aa4a43681`, and the reason is in `line-format.md` "Why it is still off". ReplayCompare is 4068/4068 identical. No browser run was recorded (note 1).
- 4 "Document it: status line in core/doc/status.md and Item/doc/line-format.md" — yes — `status.md:29`, `line-format.md` (the new paragraphs, "Why it is still off", the CloseLoop row in the readers table) and `Item/readme.md:88` all say the same thing.
- Class with live instances — n/a (no class added).
- Readmes and docs current — yes — the round-1 fixes (the readers-table row, the readme line) are in `bcbc5cf44`.
- A fresh agent can continue — yes — follow-up task `foxtdl3s` names the 10 files, the run commands and `Store.js:64`.

## Words
- Plain, full sentences — yes, apart from the "pseudo properties" phrase (note 4).
- One takeaway per paragraph — yes — "Why it is still off" says what blocks the switch and the next step in one paragraph.
- No undefined jargon — mostly — "D13" is linked to its research decision at the top of `line-format.md`.
