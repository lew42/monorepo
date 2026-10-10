# Fresh-eyes review, built into every task

Card: `2026/09/28/fresh-eyes-review-built-into-every-task`. Owner's words: `ai/2026-09-28/harness-research/owner-words.md` (the paragraph that starts "by the way, you can tell the Servex mastermind to build into the system, the task system, a review process").

## The idea, in one sentence

An agent that reviews its own code agrees with itself, so every task that builds something new gets reviewed by a **fresh** agent that never saw the author's conversation, and the review grows with the size of the task.

## The three sizes

| Size | When | Who reviews | What it looks at |
|---|---|---|---|
| **none** | only CSS or docs changed, about 20 lines or fewer, no new file | nobody | — |
| **light** | code changed, but no new page, module or Servex part | a fresh Sonnet | the brief and the diff: does it do what the owner asked, is anything broken, is there a simpler way |
| **full** | a new page, module, tool or Servex change | a fresh Opus | the light questions, plus screenshots at 1280, 1920 and 3440 and the four UX questions: is the space used well, is the order right, can the reader find everything, is the navigation clear |

The size is computed from the diff; the task mastermind may raise it, never lower it without writing why in task.jsonl.

## Deliverables

1. **`Server/review.mjs <taskdir>`**: works out the size from the branch diff, spawns the reviewer through Servex (a new session: no resume, no fork, given only the brief, the owner's words, the diff and the screenshots), and writes `review.md` beside the task plus one `{"review":{size, verdict, findings}}` line in task.jsonl. The verdict is `pass` or `fix`. Reuse layout-check's screenshots; don't take them twice.
2. **Answers, not arguments.** The author answers every finding in task.jsonl as `fixed` or `declined: <why>`. The task mastermind judges declines. No second round unless something was declined for a reason the mastermind doubts.
3. **`Server/merge.mjs` refuses** a branch whose size is light or full and has no review newer than its last commit, or has an unanswered finding. The refusal says the one command to run.
4. **Skills, one line each where they already talk about landing:** `finish-task` (run review.mjs before landing), `sub-mastermind` (decide the size when splitting the task; run the review after the minions deliver, before merge), `minion` (a reviewer finding is answered, not debated).
5. **The card shows it:** the landing line links review.md, and the card reads "reviewed: pass" or "reviewed: 2 fixed, 1 declined".
6. **Docs:** `Server/doc/review.md`, linked from `Server/readme.md`. One screen, with the table above as its picture.

## Proof

- Run it on three recent landed tasks, one of each size; attach the three review.md files.
- Show merge.mjs refusing an unreviewed full-size branch, then accepting it after review.
- Cost per review in dollars, from the task's cost line (a target: light under $0.50, full under $3).

## Fence

Yours: `Server/review.mjs`, `Server/doc/review.md`, the review lines in `Server/merge.mjs`, the one-line skill edits above. `Server/on-landing.mjs` and `Server/clarity.mjs` are the model to copy (a fresh Sonnet spawned detached, windowsHide on every spawn); change them only to share code. Work in your own worktree; merge with merge.mjs.

## Later, not now

With the harness research, the reviewer can be a different model family (via OpenRouter), which is the strongest version of fresh eyes. Leave a `model` option in review.mjs for it.
