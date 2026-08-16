The maintainer's document — every reversal this class has been through
(`children` from lazy to eager, the icon's home moved four times, `classes`
replacing a wrong-named `grid`), each recorded as a decision with the weighing
kept, not just the verdict.

## It is long, and long for a stated reason

Most readmes on this site fit one screen; this one runs past it because `Page` is
the single most load-bearing class in the framework and has accumulated the most
reversed decisions. Three sections already broke out to `doc/*.md`
(`declaring.md`, `labels.md`, `css.md`) and are cited in one paragraph each here —
the split the skill asks for is already in effect, it is just that what remains
is still substantial.

## Proposed vs Decisions

Two different registers in one file: **Decisions** are settled, with their
reasoning kept so they can be reopened; **Proposed** (further down) are open
findings from an earlier audit pass, explicitly not applied. A reader skimming
for "is this still true" should stop at the Traps/Open split near the bottom
rather than the Decisions in the middle.

## Improvements

1. **No `doc/file/readme.md.md` existed** — every other mature module in this
   codebase (`ext/doc`) documents its own readme as a file too. *(simple,
   important — done in this pass.)*
2. **The four numbered items under Proposed read like a second readme-within-a-
   readme.** They are audit findings, not design decisions, and could move to
   this module's `audit/modules/core-Page.md` instead, leaving `readme.md` to
   the decisions register alone. *(medium, useful — not applied; it is itself a
   change to move prose out of a file this agent may only add to, not restructure
   without asking.)*
