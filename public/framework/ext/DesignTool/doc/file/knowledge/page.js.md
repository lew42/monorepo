The index for the knowledge files — nine of them now — a plain `Page`, not a
`Doc`, since these are lessons rather than API surface. Each child is built by
one `lesson()` helper that fetches its `.md` file and supplies the card
description.

The first four are the analyzer's own notes (ratios, false positives,
responsiveness, thresholds); the five added with `library/` are what building
that catalog measured — floors and ceilings, spending a widescreen, characters
per line, padding versus alignment, and the blind spots.

## It draws a firm line to `styles/rules/`

The closing paragraph is explicit about scope: these are the **analyzer's**
notes (what it measures, what it learned not to flag), and building a layout
in the first place — cascade, proportion, nesting — is `styles/rules/`'s job,
linked rather than duplicated.

## Improvements

1. **`lesson()` is a tiny local helper duplicating a shape `Doc`'s `docs()`
   method already generalizes** (a name, a file, a description, one page each)
   — reasonable here since this page predates nothing being a `Doc`, but worth
   noting as exactly the kind of small pattern that would collapse for free if
   this page ever became one. Not recommended on its own: these four files are
   lessons the reader browses in order, not members of a documented subject,
   so the `Doc` shape doesn't obviously fit better than what's here. *(medium,
   speculative.)*
2. **`card: "two"` is set but never explained** — a reader of this file alone
   can't tell whether "two" is a column count, a size tier, or something else
   without checking `Page`'s own `card` property doc. *(simple, speculative.)*
