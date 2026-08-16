The maintainer's document: a verdict per design question, each backed by a
`doc/<name>.md` with the full reasoning, plus a **Measured** section with real
numbers and a **Proposed** section of unapplied, critiqued changes.

## A verdict of "keep" is recorded too

Most of the "Decisions" section isn't things that changed — it's things that were
considered and left alone, written down so the same idea doesn't get
re-litigated by the next reader who has the same instinct (redirect, a route
table, a registry gate). That's the most valuable property of this file: it
answers "why isn't there an X" as readily as "why is there a Y."

## "Proposed" is a critique, not a todo list

Each proposal carries its own options and a weighing, and ends in a
recommendation — `scope()` over `root()`, the ternary in `chain()`, last-write-wins
for double-clicks. None are applied; that's deliberate, per the module's fences —
a core class's API doesn't change without a person deciding to.

## Improvements

1. **Runs to ~120 lines, over this codebase's "most files under 100 lines"
   guideline.** The five open proposals in the back half are the bulk of it; they
   could move to their own `doc/proposed.md` and be summarized here in a
   paragraph, matching how every other long topic in this file was already
   broken out. *(medium, useful — the content is good, the file is just long)*
2. **No section titled "Traps."** The `documentation` skill asks a readme to carry
   one; this readme's traps are folded into "Decisions" instead (e.g. the
   scroll-reset and marking verdicts each end in a ⚠-shaped warning). Functionally
   present, structurally absent — a reader scanning for "Traps" won't find the
   heading. *(simple, useful)*
