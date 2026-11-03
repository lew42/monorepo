## What this file is

The second demonstration theme: mono, square corners, high contrast,
dark-only. 56 lines, and the one file in this module that deliberately
carries a rung-3 rule (a generic-HTML selector) rather than staying at
rung-1 tokens the way `paper.css` does.

## The counter-example it exists to be

The heading-prefix rule (`content: "# "` on `h1`/`h2`/`h3`) is the guide
page's live proof that rung 3 is legal — restyling generic HTML is a theme's
job — while rung 4 (naming a component class) is not. The comment block
above the rule says to read it "as a bug report, not a pattern," which is
worth restating here since it is the one rule in either theme file that
isn't a token.

## Dark-only, and says so by omission

Neither `.light` nor `.dark` is declared, which per the guide's own rule
means this theme is honestly single-mode rather than silently wrong in the
other one. Contrast with `paper.css`, which declares both.

## Improvements

1. **Nothing ranked.** Same shape as `paper.css`, with the one deliberate
   deviation (the rung-3 rule) clearly commented as a demonstration rather
   than an oversight.
