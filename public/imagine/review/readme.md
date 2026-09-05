# Review — how this page was made

On 2026-09-04 the owner said, reading through /imagine/: *"I'm sort of lost… it's not clear at
all."* Eighteen reviewers — one per realm — were sent to answer a single question about the page
they were given: **can a stranger say what this is for in ten seconds?**

## Use

- **[The page](/imagine/review/) is the report.** One card per realm, worst first, each carrying
  the sentence a stranger said and the sentence the page meant. Where those two disagreed, that
  was the finding.
- **Each reviewer fixed what it found** rather than filing it — 55 fixes across the eighteen
  realms, plus 14 written-up proposals for changes that belonged in `core/` or `ext/`. Every fix
  has its caveat beside it in that reviewer's log.
- **The pictures are after the fixes; the "stranger said" line is before them.** They deliberately
  do not match — the gap between them is the whole point of the page.
- The raw material is eighteen task logs under
  [`/framework/ai/2026-09-04/`](/framework/ai/2026-09-04/), named `imagine-<realm>`, plus the one
  brief they all worked from, kept beside
  [this task's own log](/framework/ai/2026-09-04/imagine-review/) as `reviewer-brief.md`.

## Watch out

- **This page is a wall, so it is a grid, not a stack of full-width rows.** A row per realm ran
  its sentences to 2,900px at 3440 — the exact defect the page reports about other realms. The
  grid track is `minmax(24em, 1fr)`, which keeps every line inside the measure at any width and
  still claims the whole row.
- **`width: "fill"`, not `"full"`.** `full` collapses `/imagine/`'s hub rail — [gallery
  tried it and reverted](/imagine/gallery/) the same day. `fill` is the right word here because
  this page is a leaf that nothing ever opens beside, and its content is cards, not prose.
- **The sentences are the reviewers' own words, harvested verbatim.** Rewriting them would
  destroy the evidence; the point is what someone actually said, not a tidier version of it.

## More

[The layout critique](/imagine/paging/critique/) — the measurements every reviewer worked from,
taken before any of this ·
[`columns.md`](/framework/core/Page/doc/columns/) — the width words, and why `fill` and `full`
differ.
