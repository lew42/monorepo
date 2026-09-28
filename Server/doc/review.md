# review — a fresh agent checks the work before it merges

An agent that reviews its own code agrees with itself. So before a branch merges, a **fresh**
agent — one that never saw the author's conversation — reads the brief and the diff and says
pass or fix. The review grows with the size of the change:

| Size | When | Who reviews | What it looks at |
|---|---|---|---|
| **none** | only CSS or docs changed, 20 lines or fewer, no new file | nobody | — |
| **light** | code changed, but no new page, module or Servex part | a fresh Sonnet | the brief and the diff: does it do what was asked, is anything broken, is there a simpler way |
| **full** | a new page, module, tool or Servex change | a fresh Opus | the light questions, plus screenshots at 1280, 1920, 3440 and four UX questions: is the space used well, is the order right, can the reader find everything, is the navigation clear |

## The one command

```
node Server/review.mjs <taskdir> [<worktree>]
```

Run it once the branch is ready to merge. It works out the size from the diff, spawns the
reviewer (skipped entirely for `none`), and writes `review.md` beside the task plus one
`{"review": {...}}` line in `task.jsonl` with the verdict (`pass` or `fix`) and the findings.

## Answering a finding

The author answers every finding in `task.jsonl`, never argues with it in chat:

```json
{"review":{"answer":{"n":2,"reply":"fixed"}}}
{"review":{"answer":{"n":3,"reply":"declined: <why>"}}}
```

The task mastermind judges every decline. There is no second review round unless the mastermind
doubts a decline it sees.

## The merge gate

`Server/merge.mjs` refuses a `light` or `full` branch that has no review newer than its last
commit, or has a `[fix]` finding with no answer yet. The refusal names the one command above to
run.

`node Server/review.mjs --status <taskdir>` prints the phrase the task's card shows on the
board: `reviewed: pass`, `reviewed: 2 fixed, 1 declined`, `reviewed: 1 unanswered`, or
`not reviewed`. The `finish-task` skill pastes this phrase into the landing report by hand, so it
can go stale if a finding is answered after landing — the card does not read task.jsonl live yet.

## Why an old review can still be current

`merge.mjs` accepts a review of the branch's head OR of any commit that head descends from — not
only a head-exact match. That is deliberate: once a review comes back `pass`, or every `[fix]`
finding on it is answered `fixed`/`declined`, new commits that only apply those fixes can land
without a second round (see "Answering a finding" above, and the fresh-eyes-review requirements'
"no second round unless something was declined for a reason the mastermind doubts").

## Later, not now

`--model <id>` is already there so the reviewer can one day be a different model family
(via OpenRouter) — the strongest version of fresh eyes, since it never trained alongside the
author. Not wired up yet.
