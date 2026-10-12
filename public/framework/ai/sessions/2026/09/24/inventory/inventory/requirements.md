# inventory — everything we've built, and how to rein it in

## The owner's words (condensed but faithful, from the master mastermind's brief)

"In a past task within the last week or two, I asked to fan out and have minions summarize all the
things we've built. Find all the things we've built, whether in the framework, the imagine pages, or
wherever, and identify all of them. Look at each readme: is it up to date, current, does it make
sense? Then cross-reference everything with each other. If we have an extension for a specific
purpose and it's not used somewhere it probably should be, say so. There are a lot of duplicates:
page demos here, page layouts there, a layout library there, sections here. There's stuff all over
the place. I want a thorough analysis of everything, and the best strategy to rein this in and
organize it: if we need to move things, rename things or refactor things, that's what I'm looking for."

## Deliverables

1. **The inventory** — one row per thing built, across framework/core, ext, ui, ux, styles, the rest
   of framework/, /web/, every /imagine/ realm (24), /layouts/, /websites/, /notes/, /blog/ and the
   personal pages. Row: thing, path, purpose (one sentence), readme (current / stale / missing),
   duplicates or overlaps, should-use-but-doesn't, status (live / demo / lab / dead / moved-stub).
2. **The strategy page** at this directory: a map of what exists (areas and overlaps, as a picture),
   the duplicate clusters (members, the survivor, why), and a ranked reorganization plan (moves,
   renames, merges, deletions — each with its risk and its link fallout).
3. **Model quality**: what the Sonnet rows cost and how accurate they were (five spot-checks).

**Nothing is moved in this task.** The plan is the deliverable.

## Reused, not redone

- [reuse-audit, 2026-09-22](/framework/ai/2026-09-22/reuse-audit/) — the earlier fan-out: 112 module
  paragraphs (feature-by-feature), the 739 dead moved-stub files, the 27 card rules.
- [overlap-study, 2026-09-18](/framework/ai/2026-09-18/overlap-study/) — its predecessor.
- The card catalog (75 kinds) — `ux/Content/catalog/`, on branch `worktree/page-cards`, not yet merged.

## Fence

- Mastermind: this directory only.
- Minions: **read-only on the repo.** Each writes exactly one file: its rows JSON in the session
  scratchpad. The mastermind copies them into `rows/` here once, at the end.
