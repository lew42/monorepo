# Prompt record: what one saved prompt looks like, how sentences are grouped, what is broken

**Ask (voice v-sq8y7db):** study how a Prompt is stored. The fast assistant files each sentence under a topic; every prompt is timestamped; a context card is a titled group of prompts. Give back three short things: the record shape (one example line), the grouping rule, and the defects.

**Why now:** the Tasks tab (task `mastermind-tasks-completion`, branch worktree/qf-4) is on hold until this is settled.

**Branch:** worktree/prompt-record

## Deliver

- [x] `core/Task/doc/prompt-record.md`: example lines, the grouping rule, what survives a replay of the log, and defects D1-D7.
- [x] One shared sentence splitter, `core/Task/sentences.js`.
- [x] The fast assistant's cleaned-up text survives replay (`Prompt.line_fields`, `cleaned`, `text`).
- [x] Tests pass: `node Prompt.test.mjs` (15), `node Question.test.mjs` (6).

## Not built here (handed to the owner of each)

| Defect | What | Owner |
|---|---|---|
| D1, D2 | writer that places sentences under topics | mastermind-ai |
| D3, D5 | chat splitter and `paragraphs.replace` | mastermind-dictation-2 |
| D6 | sentence anchors that survive rewrites | open |
| D7 | prompts with no task are missing from the tally | open |

Task owner: mastermind-tasks-completion.
