verdict: pass
1. [note] When several landed tasks share the same number of words, the tie goes to the most expensive one (`b.l.usd - a.l.usd`, TaskQueue.js:28). That pushes estimates up: in check-after.txt row 20, "Remove the All sessions back link" (a one-line change) is estimated at $20.76. A neutral tie-break, such as the most recent task or the original order, would not lean high.
2. [note] `TaskQueue.words` keeps every word of 4 or more letters, so filler words like "with", "that", "make", "every" and "sessions" count as shared words. Two shared words is then easy to reach, and loosely related tasks get matched (TaskQueue.js:15). A short stop-word list would make the matches tighter. This is a tuning question; the build is correct.
3. [note] The deliverable number: the top 20 had 4 distinct scores before (0.745, 0.497, 0.373, 0.248; the brief guessed 1 or 2) and 11 after (check-before.txt, check-after.txt). The ten 0.745 rows that tied at the top are now spread out.
4. [note] Ask 2 said to check that `--check` prints the landed titles. It doesn't print them. They are clearly filled in, though, because the estimates now differ between rows (check-after.txt). The smoke line from `smoke.mjs` isn't saved in the task folder, so I couldn't confirm that the page loads cleanly.

## Requirements
- 1 "TaskQueue.estimate(landed, module, title) … top 5 with at least 2 shared words … fewer than 3 → module median, all landed, fixed fallback; basis says which" — yes. TaskQueue.js:25-34; the basis names the first two matched titles.
- 2 "gather() adds title to each landed entry" — yes. Server/TaskQueue.mjs:20 reads `r.title`, which SessionIndex.mjs:53 sets.
- 3 "est_basis as the Cost cell's title tooltip, if it does not already" — yes, it already did (TaskQueueView.js:95). The rule text on the page was also updated.
- 4 "Readme: the score paragraph and the Next list" — yes, both updated in ai/queue/readme.md.
- 5 "A test: different titles get different estimates, fallback chain holds" — yes. TaskQueue.test.mjs has 4 checks; I ran it on the qf-2 worktree and got ALL PASS.
- Check it: the before and after outputs are saved; distinct scores in the top 20 went from 4 to 11.
- Class pages: n/a. The diff adds no class, only a new static method and its constants on TaskQueue.

## Words
- The readme and the page's rule text say plainly what the estimate is and what it falls back to — yes.
- The test file's header line says how to run it — yes.
