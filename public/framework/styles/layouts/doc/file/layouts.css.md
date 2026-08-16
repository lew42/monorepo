## What this file is

Layout-only CSS for two things that are not layout pages: the full-window
maximize view (`.layout-full`, `.layout-close`) and the shape-preview outline
(`.preview > *`). None of the sixteen catalog layouts ship any CSS at all —
this file is the whole stylesheet for the directory.

## The outline exists because a wash cannot be seen twice

`.preview > * { outline: 1px solid var(--line) }` — the comment explains why:
two washed regions with no gap between them read as one wash, and the
outline is what makes a `flex` with no gap visibly read as multiple boxes
rather than a solid block. Scoped inside the preview box, so it never
changes the arrangement being shown.

## Improvements

1. **Nothing ranked.** 39 lines for a whole layout catalog's stylesheet is
   the module's central claim made numerically checkable — `readme.md`'s
   `doc/css-cost.md` is the longer accounting of how this file got this
   small.
