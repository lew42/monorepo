# Work items: open loose ends, clustered and owned

> **186 open loose ends fold into 22 work items.** Unowned ones come first: they need one mastermind each. Owned ones are routed to the agent already working that area, not spawned.

| # | Cluster | Owner | Rows (now) | Verified | Est. cost | Smallest next step |
|---|---|---|---|---|---|---|
| 1 | ui-ux-ext | **unowned** | 22 (7) | 7 | $2.1 | Move the Sessions tab list onto ext/DataGrid for sort and filter, then the Day log table. |
| 2 | ai-servex | **unowned** | 34 (3) | 3 | $0.9 | Run node public/framework/ai/2026-10-02/node-reap/node-reap.mjs as a dry run, then with --apply, and append th |
| 3 | page | **unowned** | 14 (3) | 9 | $0.9 | Run merge 2: move the live ai2 files to ai/cards/, update importers and catalog.json, then delete the dead fil |
| 4 | other | **unowned** | 31 (2) | 2 | $0.6 | Start card-kind merge 4 under public/framework/ai/2026-09-24/card-consolidation/merges-requirements.md, beginn |
| 5 | transcription-refinement | @mastermind-refine-demo | 28 (7) | 14 | $2.1 | Build a card component for request/task/question/suggestion items in ext/Refine that reads the refined prompt' |
| 6 | ai-servex | @minion-session-class | 12 (6) | 6 | $1.8 | Write the final loose-ends list file from loose-ends.jsonl and verified.jsonl, linked from the task-audit read |
| 7 | ui-ux-ext | @mastermind-refine-demo | 6 (2) | 2 | $0.6 | Load /framework/ai/ once in a browser at 1920 and confirm the cost link is not blue, then close the card. |
| 8 | transcription-refinement | @minion-session-class | 5 (2) | 3 | $0.6 | Write the clean-step cost model from requirements.md as a small class and land it with its own commit. |
| 9 | ui-ux-ext | @mastermind-ai-system-docs | 3 (2) | 2 | $0.6 | Write the completion marker line to task.jsonl with the merge commit 78424710f, after the owner's fingerprint  |
| 10 | ai-servex | @mastermind-ai-system-docs | 2 (2) | 2 | $0.6 | Apply the review.md badge fix (.ai2-tab-badge:not([hidden]) in ai2.css), then write the documentation pass and |
| 11 | sessions | @minion-session-class | 4 (1) | 4 | $0.3 | Check whether the card's diff.patch is in main (search the ai2 card code for the review's named files); if it  |
| 12 | other | @mastermind-refine-demo | 3 (1) | 1 | $0.3 | Commit the remaining task.jsonl and spend.json edits and close the task with finish-task. |
| 13 | streaming-jsonl | @minion-session-class | 1 (1) | 1 | $0.3 | Land the JSONL-tail change: add sessions/AgentsJSONL.js, switch AISessionsPage.js off POLL_MS, then review and |
| 14 | ui-ux-ext | @minion-session-class | 1 (1) | 1 | $0.3 | Run one review pass over f5103369f against requirements Part 2 to confirm the Sessions view and Overview grid, |
| 15 | ai-servex | @mastermind-task-system-design | 1 (1) | 1 | $0.3 | Dry-run then run node public/framework/ai/2026-10-02/servex-mastermind/apply-server-guard-skills.mjs --dry, th |
| 16 | other | @mastermind-ai-system-docs | 5 (0) | 0 | $0.0 | Make every agent read the readme chain top-down; wire it into the start step. |
| 17 | ai-servex | @mastermind-refine-demo | 4 (0) | 0 | $0.0 | Make Servex stamp logs in code; queued, no activity. |
| 18 | other | @minion-session-class | 4 (0) | 0 | $0.0 | Show cost on AI 2 previews and fill the page; status unclear, listed in todo only. |
| 19 | page | @mastermind-refine-demo | 2 (0) | 1 | $0.0 | Open public/framework/ai2/needs-rule.js, confirm the importance() range is 1 to 100, and show the score on eac |
| 20 | page | @mastermind-ai-system-docs | 2 (0) | 0 | $0.0 | Let the AI 2 inbox owner task finish; then merge and close. |
| 21 | page | @minion-session-class | 1 (0) | 1 | $0.0 | Build the three plain pages git, context and cost under public/framework/ai/ from the requirements.md list, an |
| 22 | docs-readmes | @mastermind-ai-system-docs | 1 (0) | 0 | $0.0 | Finish the sources-lib work-in-progress, then land. |

Estimated cost counts only the `now` rows, at about $0.3 each for a Sonnet coder. Row detail: [by-system.md](by-system.md). How rows were checked: [verified.md](verified.md).

## Row ids per cluster (for briefs)

- **ui-ux-ext** (unowned): 29, 34, 102, 105, 106, 116, 140, 146, 147, 148, 152, 160, 188, 194, 195, 196, 206, 208, 213, 221, 230, 234
- **ai-servex** (unowned): 13, 14, 16, 17, 18, 19, 22, 26, 32, 33, 37, 57, 58, 59, 65, 67, 69, 70, 80, 83, 100, 120, 128, 142, 181, 184, 192, 193, 198, 202, 203, 204, 205, 215
- **page** (unowned): 39, 46, 49, 115, 125, 131, 132, 145, 163, 170, 174, 189, 199, 224
- **other** (unowned): 12, 38, 41, 42, 44, 45, 47, 48, 50, 51, 52, 53, 54, 55, 61, 62, 63, 81, 82, 86, 87, 88, 89, 92, 121, 164, 165, 168, 175, 182, 200
- **transcription-refinement** (mastermind-refine-demo): 0, 3, 4, 5, 6, 7, 8, 9, 10, 20, 31, 43, 95, 114, 127, 141, 143, 166, 167, 171, 178, 179, 186, 187, 191, 211, 212, 239
- **ai-servex** (minion-session-class): 15, 25, 71, 77, 91, 130, 138, 153, 154, 158, 209, 218
- **ui-ux-ext** (mastermind-refine-demo): 56, 110, 151, 159, 197, 222
- **transcription-refinement** (minion-session-class): 1, 28, 111, 112, 227
- **ui-ux-ext** (mastermind-ai-system-docs): 135, 149, 241
- **ai-servex** (mastermind-ai-system-docs): 144, 226
- **sessions** (minion-session-class): 11, 23, 129, 225
- **other** (mastermind-refine-demo): 30, 60, 93
- **streaming-jsonl** (minion-session-class): 90
- **ui-ux-ext** (minion-session-class): 126
- **ai-servex** (mastermind-task-system-design): 243
- **other** (mastermind-ai-system-docs): 40, 84, 176, 177, 183
- **ai-servex** (mastermind-refine-demo): 24, 27, 79, 161
- **other** (minion-session-class): 85, 122, 133, 173
- **page** (mastermind-refine-demo): 35, 169
- **page** (mastermind-ai-system-docs): 162, 172
- **page** (minion-session-class): 21
- **docs-readmes** (mastermind-ai-system-docs): 201

## Briefs for unowned clusters (one mastermind each)

[ui-ux-ext](briefs/ui-ux-ext.md), [ai-servex](briefs/ai-servex.md), [page](briefs/page.md), [other](briefs/other.md)
