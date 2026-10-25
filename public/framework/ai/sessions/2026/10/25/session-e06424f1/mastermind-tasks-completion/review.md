verdict: fix
1. [fix] The diff does not belong to this task. `review/diff.patch` is commit f0de5d906 on `worktree/prompt-record` (the shared sentence splitter, refined `text` kept on replay, `doc/prompt-record.md`). This folder's `requirements.md` asks for the drawer's Tasks tab on `worktree/qf-4` (8c0c8736a), so none of its four deliverables can be checked against this diff. Re-run the review with the qf-4 diff, and file the prompt-record work under its own task folder.
2. [fix] Nothing indexes the prompt-record work (law 10). There is no task folder, requirements.md or task.jsonl for it, and the only mention outside the worktree is this diff.patch. A fresh agent cannot pick it up from here: it would not know the branch is unmerged, or who owns defects 1, 2, 6 and 7 in `doc/prompt-record.md`.
3. [fix] `doc/prompt-record.md` defects 3 and 5 say the fix belongs to `mastermind-dictation-2`, but no message to that agent exists (no hit in `Servex/agents/inbox.jsonl` or `ai/asks.jsonl`). Send the ask: `ChatV2Model.sentences` (`ext/Chat/v2/ChatV2Model.js:84-90`) should import `core/Task/sentences.js`, and the fold should honour `paragraphs.replace`.
4. [note] `core/Task/sentences.js:1` says Prompt and `ChatV2Model.js` "both number a paragraph's sentences with it". Today only core does: the chat still uses its own regex at `ChatV2Model.js:87`. Until fix 3 lands, the comment should say "will".
5. [note] `Prompt.text` now returns the smart seat's refined text, and the paragraph join has moved to `cleaned` (`Prompt.js:97-100`). The Server scripts that read `.text` (`PromptRecords.mjs:81,134`) use plain objects, not Prompt, so they are not affected. All tests pass in the worktree: Prompt 15/15, Question 6/6, Task 66/66, PromptsToSession 11/11.
6. [note] Defect 7 ("a Prompt that needs no task never completes") affects this task's own count of "Done 7 of 39": every bare prompt is counted as open. Link it from the Tasks-tab readme bullet once both land.

## Requirements
- 1 "A Tasks row in AIPage.VIEWS" — n/a: the diff touches only core/Task (finding 1)
- 2 "Done X of Y strip, open tasks by priority, done folded, fair stops leave the count" — n/a: not in this diff
- 3 "Streams from session.jsonl via TaskTally on ChatV2Model.fold" — n/a: not in this diff
- 4 "TaskTally.test.mjs passes; readme bullet" — n/a: not in this diff; the diff's own tests pass (finding 5)
- class page with live instances — n/a: no class added (sentences.js is a function)

## Words
- content: plain sentences, the reader knows what is said — yes — doc/prompt-record.md opens by saying what it covers, and the example lines carry comments
- content: index updated — yes — core/Task/readme.md "More" and doc/prompt.md both link prompt-record.md
- content: no stale claims — no — sentences.js:1 (finding 4)
