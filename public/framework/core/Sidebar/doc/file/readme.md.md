The maintainer's document: why exactly one component tier, why one `pages`
property instead of a second `groups`, and the Traps/Proposed/Open registers
that track what's settled versus what's still weighed. The reader's document
is `page.js` — this file is served twice, cited by a maintainer reading the
directory and collapsed at the bottom of the Overview via `md.details()`.

## Six sibling files, cited rather than repeated

`entries.md`, `placement.md`, `views.md`, `tokens.md`, `narrow.md`, `comp.md` —
each is a question big enough to earn its own url, summarized here in one
paragraph and linked. The readme stays a map; the weighing lives at the
destination.

## Proposed is a register, not a plan

Four numbered items, each already weighed (options, the trade, a
recommendation) and explicitly **not applied** — a critique waiting on the
person who owns core classes, not work in progress.

## Improvements

1. **No `doc/file/readme.md.md` existed before this pass**, despite two other
   mature modules (`core/Page`, `ext/doc`) already documenting their own
   readme this way. *(simple, important — done)*
2. **"Who uses it" (added this pass) sits between the intro and Decisions**,
   ahead of the design reasoning. A maintainer opening this file wants the
   *why* first; a first-time reader wants *is this real*. Worth moving lower
   if the file grows past its current one-and-a-half screens. *(simple,
   speculative)*
