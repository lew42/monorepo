verdict: fix
1. [fix] The new file `core/Task/sentences.js` is not listed in `core/Task/readme.md` or in `doc/prompt.md`. Only prompt-record.md:39 and :47 mention it, so someone reading the readme won't learn the shared splitter exists, and the next agent to fix defect 3 won't find it either (law 10). Add it to the readme's "Prompt and Question" line (readme.md:113) and to the `sentences` row of prompt.md's field table.
2. [fix] Prompt.js:53 says the splitter is "shared with the chat's fold". That is still false, because ChatV2Model.js:87 keeps its own `match(/[^.!?]+…/)` regex. Round 1 corrected the same claim in sentences.js:1, but this second copy was missed. Reword it to "the chat's fold should use it too (prompt-record.md defect 3)".
3. [note] Round 1's fixes are in commit f2a7bf5d5. Defect 3 now says plainly that nothing has changed in behaviour yet. The sentences.js comment is corrected, prompt.md has a `title`, `text` row, and task.jsonl now records the owner, the branch and the merge status. A fresh agent can pick up from requirements.md plus task.jsonl.
4. [note] The session's `index.json` still has `children: 0` and `links.task: null`, so the session record doesn't link to the task folder. index.json looks machine-written (it carries cost and wall time), so this belongs to whatever script writes it, not to this task. The checkboxes in requirements.md's "Deliver" list are also left unticked, even though all four are done.
5. [note] There is a simpler way to write the alias: `static split = split;` would replace the wrapper method at Prompt.js:54. `set text` (Prompt.js:100) is still never called, as round 1 noted.
6. [note] I re-ran both tests in the worktree at f2a7bf5d5. `node Prompt.test.mjs` passes 15 of 15 and `node Question.test.mjs` passes 6 of 6. That meets requirements item 4.

## Requirements
- 1 "core/Task/doc/prompt-record.md: example lines, the grouping rule, what survives a replay of the log, and defects D1-D7" — yes — prompt-record.md holds all four sections, each in order.
- 2 "One shared sentence splitter, core/Task/sentences.js" — yes, but only in core so far. Prompt.js:7 imports it; the chat keeps its own regex (ChatV2Model.js:87), which defect 3 records as open and hands to mastermind-dictation-2.
- 3 "The fast assistant's cleaned-up text survives replay (Prompt.line_fields, cleaned, text)" — yes — Prompt.js:42 adds `text` to `line_fields`, Prompt.js:97-99 add the `cleaned` and `text` getters, and Prompt.test.mjs:34 checks it.
- 4 "Tests pass: node Prompt.test.mjs (15), node Question.test.mjs (6)" — yes — 15 passed and 6 passed, re-run at f2a7bf5d5.
- Class changed, live instances viewable? — n/a. Prompt gains fields but no new class. Its instances already show in the session chat.

## Words
- Plain sentences, one takeaway — yes. prompt-record.md leads with the record shape, then the rule, then the defects, and each defect names its evidence and its owner.
- Accurate — no. Prompt.js:53 makes a false sharing claim (finding 2).
- Indexed — no. sentences.js is not indexed (finding 1). prompt-record.md is linked from both readme.md:113 and prompt.md.
