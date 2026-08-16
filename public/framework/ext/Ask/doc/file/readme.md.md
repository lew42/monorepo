The maintainer's document: what the bridge is, who calls it, and the five
design decisions that shape it — each one now a real url under `docs/`
instead of a paragraph that only a reader of this exact file would find.

## What changed in this pass

The module had a readme before this pass, and a good one — narratively, every
decision was already written down. What it lacked was a `Doc`-shaped `page.js`
(it was a plain `Page`) and any `doc/*.md` at all, so none of that prose had a
url, a Files tab, or an API tab with real source. This pass split the
longer sections (`task`, the process-vs-pipe decision, the fork rule, `shot`,
the record shape) out to `doc/*.md`, added a "Who uses it" section from a
fresh framework-wide grep, and fixed one stale line: the piece table listed
only `Server/plugins/Ask.js` as "the spawn," with no mention that `start()`'s
spawn lives in a separate file, `Server/plugins/Start.js`.

## Why the piece table still exists

It's the fastest orientation a returning reader gets — five words to
`Ask.js`, `chat.js`, or the right server plugin — and it's the one place in
the readme dense enough that trimming it to "a paragraph" would lose
information rather than prose. Kept as a table rather than broken into
`doc/pieces.md`: it's a lookup, not an argument, and a lookup earns its place
inline.

## Improvements

1. **The "Who uses it" table is a snapshot from one grep, on one day** — like
   every such table in this framework, it goes stale the moment a fifth
   caller shows up and nobody re-runs the search. No fix beyond what the
   `documentation` skill already prescribes (re-run per audit); flagged here
   because this readme is the one place that snapshot lives. *(n/a — inherent
   to the format, not a defect in this file.)*
2. **Five `doc/*.md` breakouts is a lot of surface for a 90-line source file**
   — worth checking, on the next pass, whether `process` and `fork` still earn
   separate urls or whether they've settled enough to fold back into the
   readme now that the fork/resume behavior is stable and unlikely to change.
   *(simple, speculative — a consolidation, not a fix.)*
