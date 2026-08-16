# readme.md

The maintainer record: the three positioning decisions, the item shape, who
calls this module (as of today: only its own doc page, plus a formally
wired-but-unwired adapter), what's deferred, and the traps that don't throw.

Rewritten during the 2026-08-15 documentation pass to add "Used by" (the
brief's Step 2 requirement — this module's biggest finding is that it has
essentially no live callers) and to break the "Phase 2" section out to
`doc/phase-2.md` once it grew past the readme's one-screen budget.

## Improvements

1. **Keep "Used by" current if `ai.js` is ever re-wired or deleted.** It's
   the one section in this file most likely to go stale silently, because
   nothing crawls for callers automatically (`documentation` skill, Step 2).
   *(simple, important)*
