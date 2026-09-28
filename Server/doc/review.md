# review — a fresh agent checks the work, in four turns

An agent that reviews its own code agrees with itself. So before a branch merges, a **fresh**
agent — one that never saw the author's conversation — reads the brief and the diff and says
pass or fix. Nothing is said out of turn or goes unheard: every finding is answered, every
decline is heard back, and anything still stuck goes to a person. Everything below is logged,
one small line per step, to a new file beside the task: `<taskdir>/review.jsonl`.

## The four turns

| # | Turn | Who writes it | Command |
|---|---|---|---|
| 1 | **Finding** — the reviewer reads the diff and says what's wrong | a fresh reviewer agent | `node Server/review.mjs <taskdir> [<worktree>]` |
| 2 | **Answer** — the author fixes it or explains why not | the author, by hand, in `task.jsonl` | `node Server/review.mjs --turns <taskdir>` (mirrors it in) |
| 3 | **Reply** — for a decline only: does the reviewer accept the reason, or still hold it needs fixing | a second fresh reviewer agent | (also `--turns`, automatic) |
| 4 | **Ruling** — for a hold only: the mastermind settles it, once | the task mastermind, by hand | `node Server/review.mjs --rule <taskdir> <n> <fix\|stands> "<why>"` |

One round of holds only — turn 4 is the last word, there is no turn 5. A finding that was
`fixed`, or `declined` and accepted in turn 3, never reaches turn 4 at all.

Reading the actual file: `<taskdir>/review.jsonl` is append-only JSON lines, same shape as
`ext/Collab`'s `collab.jsonl` — a `{"phase":{...}}` line brackets each turn (`status: "start"`
then `"done"`), with one small verb line per item inside it: `{"finding":...}`,
`{"answer":...}`, `{"reply":...}`, `{"ruling":...}`. A later line for the same finding number
wins, the same merge rule every JSONL log in this repo uses.

```
{"phase":{"n":1,"kind":"findings","status":"start"}}
{"finding":{"n":2,"kind":"fix","text":"..."}}
{"phase":{"n":1,"kind":"findings","status":"done","verdict":"fix","cost":0.42,"model":"claude-sonnet-5"}}
{"phase":{"n":2,"kind":"answers","status":"start"}}
{"answer":{"n":2,"reply":"declined: the extra check duplicates line 40"}}
{"phase":{"n":2,"kind":"answers","status":"done"}}
{"phase":{"n":3,"kind":"replies","status":"start"}}
{"reply":{"n":2,"stance":"hold","text":"the duplicate check catches a different case — still needed"}}
{"phase":{"n":3,"kind":"replies","status":"done"}}
{"phase":{"n":4,"kind":"rulings","status":"start"}}
{"ruling":{"n":2,"decision":"fix","why":"the reviewer's second read is right","by":"mastermind"}}
{"phase":{"n":4,"kind":"rulings","status":"done"}}
```

`--turns` is safe to run more than once — it only mirrors an answer, or replies to a decline,
it has not already recorded. `--rule` refuses (and says why) if turn 3 hasn't run yet, if the
finding was never held, or if it was already ruled on.

`task.jsonl`'s own `{"review":{...}}` line (turn 1's verdict and findings) and the author's
`{"review":{"answer":{...}}}` lines (turn 2) are **unchanged** — `review.jsonl` is an ADDITION
that turns those same facts into a readable, ordered log, never a replacement. `Server/merge.mjs`
still reads only `task.jsonl`, so it keeps working with zero changes.

## The size (turn 1)

| Size | When | Who reviews | What it looks at |
|---|---|---|---|
| **none** | only CSS or docs changed, 20 lines or fewer, no new file | nobody | — |
| **light** | code changed, but no new page, module or Servex part | a fresh Sonnet | the brief and the diff: does it do what was asked, is anything broken, is there a simpler way |
| **full** | a new page, module, tool or Servex change | a fresh Opus | the light questions, plus screenshots at 1280, 1920, 3440 and four UX questions: is the space used well, is the order right, can the reader find everything, is the navigation clear |

The task mastermind may lower the size only with `--why "self-evident: <one line>"` (logged as a
`{"decision":...}` line so the reason survives); raising it needs no reason.

## Answering a finding (turn 2)

The author answers every finding in `task.jsonl`, never argues with it in chat:

```json
{"review":{"answer":{"n":2,"reply":"fixed"}}}
{"review":{"answer":{"n":3,"reply":"declined: <why>"}}}
```

Then run `node Server/review.mjs --turns <taskdir>` to mirror the answer into `review.jsonl` and,
for any decline, get a second fresh reviewer's read (turn 3, above) — accept, or hold.

## The merge gate

`Server/merge.mjs` refuses a `light` or `full` branch that has no review newer than its last
commit, or has a `[fix]` finding with no answer yet. The refusal names the one command above to
run. This is unchanged by the turns above — the gate only ever reads `task.jsonl`.

`node Server/review.mjs --status <taskdir>` prints the phrase the task's card shows on the
board: `reviewed: pass`, `reviewed: 2 fixed, 1 declined`, `reviewed: 1 unanswered`, or
`not reviewed`. The `finish-task` skill pastes this phrase into the landing report by hand, so it
can go stale if a finding is answered after landing — the card does not read task.jsonl live yet.

## Why an old review can still be current

`merge.mjs` accepts a review of the branch's head OR of any commit that head descends from — not
only a head-exact match. That is deliberate: once a review comes back `pass`, or every `[fix]`
finding on it is answered `fixed`/`declined`, new commits that only apply those fixes can land
without a second round.

## Is a review useful?

Once a review run is fully **settled** — every finding answered, every hold ruled on —
`node Server/review.mjs --score <taskdir>` appends one line to the shared scoreboard file
`public/framework/ai/collab/scoreboard.jsonl` (the same file `ext/Collab`'s decision votes use,
in its own shape — `kind: "review"`, no `votes`/`won`):

```json
{"score":{"kind":"review","collab":"2026-09-28/some-task","decision":"review-some-task-ffa63e9","member":"claude-sonnet-5","model":"claude-sonnet-5","size":"light","cost":0.42,"findings":3,"fixed":2,"changed_outcome":true}}
```

`changed_outcome: true` means a real fix landed because of this review — a decline-only or
zero-`[fix]`-finding review is not useful, even if it "passed". `decision` is the task's own
directory slug plus the reviewed commit's short hash, so running `--score` again on the same
settled run never duplicates the line, but a genuinely second review round on the same task (new
commits, after the first round already settled) gets its own line instead of silently overwriting
the first round's numbers. Refuses (prints why, exits non-zero) if the run isn't settled yet —
some finding still unanswered, or a hold with no ruling.

`node Server/review.mjs --backfill` does the same for every past `review.md` that predates
turns and scoring — it reconstructs size/cost/findings/fixed/changed_outcome from that task's own
`task.jsonl` and skips (prints why) anything it can't read.

A small **Reviews** section on the Collab scoreboard page (`/framework/ext/Collab/`) reads this
same file: per reviewer model, how many reviews, what percent were useful, and dollars spent per
useful review — so a model that mostly rubber-stamps shows up in the numbers, not just the vibes.

## One review pass at a time

The whole turns model assumes ONE finding pass per task — `review.jsonl`'s answer/reply/ruling
lines are keyed only by finding number, not by which review pass they belong to. If a task is
ever fully re-reviewed after its first round already settled (not just re-mirroring the same
answers — an actual second `review.md` from a fresh diff), the new pass's finding numbers would
overwrite the first pass's finding text for readers of `review.jsonl`. Nothing today asks for a
second full pass — requirements.md's own model is one pass, one round of holds — so this is a
known limit, not a defended-against case.

## Later, not now

`--model <id>` is already there so the reviewer can one day be a different model family
(via OpenRouter) — the strongest version of fresh eyes, since it never trained alongside the
author. Not wired up yet.
