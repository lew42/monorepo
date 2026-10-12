# Minion B — a Reviews view on the Collab scoreboard page

Load the `minion` skill first. Your brief's directory: `public/framework/ai/2026-09-28/review-turns/`
(`requirements.md` there — point 3 is yours: "Is a review useful?"). Worktree:
`C:\Code\lew42\worktrees\review-turns` (already has `worktree/collab-rounds` merged in, so
`public/framework/ext/Collab/` exists here — read `Collab.js`, `view.js`, `page.js`, `readme.md`,
`doc/collab.md` fully before you touch anything; this is a live page, follow its existing shape,
don't restyle it).

**Your files, and only these:** `public/framework/ext/Collab/view.js` and, only if the "Reviews"
section needs its own route/section header, `public/framework/ext/Collab/page.js`. Do not touch
`Collab.js`, `Server/review.mjs`, or anything under `Server/`. A sibling minion (A) is adding review
score lines to the shared `public/framework/ai/collab/scoreboard.jsonl` at the same time — you don't
need to wait for it; build against the shape below and read the real file once it exists (or write
1-2 fake lines to a scratch copy to develop against, then delete them — never leave test data in the
shared file).

## The score line shape you're reading

One new kind of row lands in the SAME shared file `public/framework/ai/collab/scoreboard.jsonl`
that `Collab.Scoreboard` already reads (design/research decision rows use `{"score":{"collab",
"decision","member","model","votes","won","cost"}}` — see `Collab.js`'s `Scoreboard` class and
`collab-format.md`'s "The scoreboard" section for those). A REVIEW row is the same verb, tagged
`kind:"review"`, with no `votes`/`won`:
```json
{"score":{"at":"…","kind":"review","collab":"2026-09-28/fresh-eyes-review","decision":"review-fresh-eyes-review","member":"claude-sonnet-5","model":"claude-sonnet-5","size":"light","cost":0.42,"findings":3,"fixed":2,"changed_outcome":true}}
```
`Collab.Scoreboard.apply()` already stores these rows fine (it keys by `collab+decision+member`,
generic). Read them straight off `.rows` (don't use `.models()` — that method assumes vote rows).

## What to build: a small "Reviews" section

Read `Server/doc/review.md` (minion A is updating it — the turns table) for the vocabulary: review,
size (none/light/full), finding, fixed/declined, useful (a review is "useful" when
`changed_outcome: true` — a real fix landed because of it, not just a rubber stamp).

Add a section to the Collab scoreboard page — wherever `view.js`/`page.js` currently draws the
model table (find it; match its existing widget choices, don't invent new CSS). Filter
`scoreboard.rows` to `r.kind === "review"`, group by `model`, and show, per model:
- **reviews** — count of review rows for that model
- **% useful** — `changed_outcome: true` rows ÷ total, as a percentage
- **$ / useful review** — sum of `cost` over useful rows ÷ count of useful rows (blank/— if zero
  useful reviews, never divide by zero)

One line per model, sorted by review count descending. If there are zero review rows yet, show one
plain sentence ("no reviews scored yet") instead of an empty table — never a blank section with no
explanation (traps-that-never-throw: this must not crash the page when the file has no review rows,
which is true right now).

## Proof you owe

1. A screenshot of the live page at 1920 (`node Server/layout-check.mjs <worktree url>/framework/ext/Collab/ --widths 1920`, or the `ui-test`/`run` pattern this repo uses) — BEFORE minion A's real score lines exist, showing the "no reviews yet" sentence, so we know the empty case doesn't throw.
2. Once minion A has appended at least one real score line (ask the task mastermind, or check the
   file yourself), reload and screenshot again — the Reviews row for that model should be visible
   and correct (do the arithmetic by hand against the raw JSONL line and check it matches).
3. Zero console errors, zero failed requests on both loads.

Log your steps in `public/framework/ai/2026-09-28/review-turns/task.jsonl` as you go. Report back to
the task mastermind when done — don't merge, don't touch files outside `ext/Collab/`.
