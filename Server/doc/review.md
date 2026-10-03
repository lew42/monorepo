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

This is the same one-verb-per-line phase/kind JSONL convention `collab.jsonl` uses, not the same
code: `ext/Collab`'s `Phase`/`Member`/`Vote` classes are a browser-side REPLAY of that file (fetch
by URL, render); `review.mjs` is a Node writer with no browser, so it follows the convention
without importing those classes.

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

Size decides WHO reviews — nothing more. What they're shown (screenshots or not) is a separate
question, covered next, because it depends on whether a page was touched, not on size.

| Size | When | Who reviews |
|---|---|---|
| **none** | only CSS or docs changed, 20 lines or fewer, no new file | nobody |
| **light** | code changed, but no new page, module or Servex part | a fresh Sonnet |
| **full** | a new page, module, tool or Servex change | a fresh Opus |

The task mastermind may lower the size only with `--why "self-evident: <one line>"` (logged as a
`{"decision":...}` line so the reason survives); raising it needs no reason.

## Which widths (also turn 1)

Any review — `light` or `full` — whose diff changes at least one `page.js`/`page.jsonl` gets
screenshots FIRST, at whichever widths the change actually needs — not always all four. The
owner, on taking a screenshot at every width for every change: "it doesn't make sense to take
three extra screenshots when one would do … depends on the width of the content." `widthsFor`
(`Server/review.mjs`, exported) decides, in this order — first match wins:

| The change | Widths | Why |
|---|---|---|
| only `.md`, or text in a `page.js`, no css | **1200** alone | words, not layout — one look is enough |
| a layout word (`grid`, `columns`, `sidebar`, `flex`, `width`, `@container`, `@media`, a `styles/layouts/` class) in a changed css/js file, any file under `core/Page`, `core/Sidebar`, `styles/`, or more than one page touched | **400, 1200, 1920, 3440** | this can reshape the page at any width |
| one css file, scoped to one component, capped with `max-width` | **400** alone | if it works at 400 it works wider — same words |
| anything else | **400, 1920** | a phone check and a common desktop check |

`--widths 1200,1920` overrides the pick by hand, same flag on both `review.mjs` and
`merge.mjs --quick` below. Taken via:

```
node Server/layout-check.mjs <urls> --widths <picked> --bands --out <taskdir>/shots/
```

`--bands` (`Server/layout-check.mjs`'s own header) adds, for every width: `tab_rows` (did a tab
bar wrap into more than one row), `left_stack` (the padding stacked at the page's own left edge,
layer by layer), `bands` (every top-level section's share of the screen, and how much of that
share actually has content on it), and `wraps` (anything that wrapped to a second line when it
looks like it shouldn't have). This is skipped if every page already has a png at every width
picked, under `shots/<page-slug>/` — the task mastermind may have shot them first. One line is
appended to `task.jsonl`, naming the widths actually used:

```json
{"shots":{"pages":["/framework/x/"],"dir":"shots/","sheet":"shots/x/sheet.png","sheets":["shots/x/sheet.png"],"bands":["shots/x/layout.json"],"widths":[1200]}}
```

**`merge.mjs --quick`** (the fast path for a one-line voice fix) reuses `widthsFor` the same way,
skipping the reviewer agent entirely: one screenshot (normally one width, from the rule above),
then a `review.md` line ("size quick — one shot at `<w>` — pass", written by the same
`writeNoReviewPass` the `none` row above uses) so the merge gate and the dashboard see a real
record with no agent cost. Detail and the exit codes: `merge.mjs`'s own header comment.

The reviewer is then told to load the `review` skill (`.claude/skills/review/SKILL.md`) and
follow it: read the brief, the owner's own words, the diff, the shots and each page's
`layout.json`, and ask one fixed list of questions per system — page structure, navigation,
layout, sizing, wrapping, spacing and padding, colour and contrast, flow — in that order, each
answered with a screenshot region or a `layout.json` number as its evidence. It writes
`<taskdir>/review/report.md` instead of the plain `review.md`. Every one of those questions is
documented, live, at [/framework/ai/review/](/framework/ai/review/) — read straight from the
skills' own `questions.md` files by `node Server/review.mjs --questions`, which `main()` also
runs at the start of every review, so that page never goes stale even if nobody runs the command
by hand.

A review whose diff touches no page — most `light` reviews, and a `full` review of something
that isn't a page, like a new Servex tool — keeps the plain prompt this always used (read the
brief and the diff, say what's wrong) and writes the plain `<taskdir>/review.md`, exactly as
before this. Either way, `task.jsonl`'s `{"review":...}` line's `file` names whichever one was
actually used, and gains `report` and `shots` pointers (both `null` when no page was touched).
`parseReview` (exported) reads both files the same way, so `--turns`, `--rule`, `--score`,
`--status` and `merge.mjs`'s gate are all unchanged — they only ever read `task.jsonl`.

## Answering a finding (turn 2)

The author answers every finding in `task.jsonl`, never argues with it in chat. A `[fix]` finding
always needs `fixed` or `declined`; a `[note]` finding may use either of those too, or the lighter
`noted` when there is nothing to change but the finding is still worth acknowledging:

```json
{"review":{"answer":{"n":2,"reply":"fixed"}}}
{"review":{"answer":{"n":3,"reply":"declined: <why>"}}}
{"review":{"answer":{"n":4,"reply":"noted: <why nothing changes>"}}}
```

Then run `node Server/review.mjs --turns <taskdir>` to mirror the answer into `review.jsonl` and,
for any decline, get a second fresh reviewer's read (turn 3, above) — accept, or hold.

⚠ **Answer lines are keyed only by finding number, flat across the whole `task.jsonl`** — before
appending an answer for a SECOND review pass on the same task, make sure that pass's own
`{"review":{verdict,findings}}` entry has already been appended (the one `review.mjs` writes when
it runs). Otherwise `status()` and `--score` are still reading the FIRST pass's findings list, and
an answer meant for the second pass's finding 3 silently overwrites the first pass's own finding
3's answer, by number — a real trap, not a theoretical one (`review-turns`, 2026-09-28, minion C's
own mistake mid-task; caught and corrected the same way, an appended corrective answer line).

## The one file API check

Every review run first fails the branch if any file under `public/` (the dated task logs
`ai/20*` excepted) calls the dev socket's `write` or `append` RPC outside
`ext/filesystem/FsFile.js` and `dev/Socket/`, before any agent is paid for. Run it alone
with `node Server/review.mjs --file-api <worktree>`. Why: [`ext/filesystem/readme.md`](../../public/framework/ext/filesystem/readme.md), "One file API".

## The merge gate

`Server/merge.mjs` refuses a `light` or `full` branch that has no review newer than its last
commit, or has a `[fix]` finding with no answer yet. The refusal names the one command above to
run. This is unchanged by the turns above — the gate only ever reads `task.jsonl`. A branch that
also touches a page is refused unless that review has its own page report (`review/report.md`,
with shots at all four widths) on disk — the plain brief-and-diff `review.md` a non-page change
gets is not enough for a page.

`node Server/review.mjs --status <taskdir>` prints the phrase the task's card shows on the
board: `reviewed: pass`, `reviewed: 2 fixed, 1 declined`, `reviewed: 2 unanswered: #3, #7`, or
`not reviewed` — an unanswered count always names which findings, so a reader never has to go
hunting through `task.jsonl` for them. `merge.mjs`'s own refusal at the review gate names them
the same way. The `finish-task` skill pastes this phrase into the landing report by hand, so it
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
