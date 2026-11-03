## What this file is

The tutorial for writing a theme, taught with two real ones (`paper`,
`terminal`) rendered live, side by side, from the same markup. It is the
piece of this module aimed at "I want my own look," as distinct from
`layers/theme/page.js` (what the base theme already gives you) and
`layers/theme/lew42/page.js` (the one worked example that shipped).

## The claim it has to keep true

"Same markup, same classes, zero theme-aware code" is stated and then
immediately demoed with the identical `sample()` function under both themes.
If a future edit made either theme require a class the other doesn't have,
this page would be lying about its own subject in the most visible possible
way — worth checking first if this page is ever touched.

## The four-rung ladder

Token → component token → rule on generic HTML → rule naming a component
class. Rung 4 is named as "the failure the whole design exists to prevent."
This ladder is the theme-authoring mirror of the CSS-ladder in the root
`styles/readme.md`; the two use almost identical language on purpose.

## Improvements

1. **Nothing ranked.** The page's central claim is demoed rather than
   asserted, both sample themes are real files a reader can open (now via
   the Files tab this pass added), and the naming-axes section closes with a
   concrete test ("does the variant change the vocabulary or only the
   values") rather than a rule of thumb.
