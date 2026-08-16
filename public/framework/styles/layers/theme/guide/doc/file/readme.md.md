## What this file is

The design record behind the theming guide: where component looks live (in
neither the theme nor the component — both talk to tokens), the four-rung
ladder in full with the "component owns theme variants" cross-table, why
`:where()` was tried and reverted for the base theme, and the naming
convention (theme = proper noun, axis = adjective).

## The symmetry argument

Section one's table — "theme owns component looks" vs. "component owns theme
variants" — is the clearest single piece of reasoning in this file: it shows
both directions cost the same coupling, transposed, which is what makes
"neither owns it, both talk to tokens" the actual resolution rather than a
compromise.

## Improvements

1. **Nothing ranked.** Every verdict states its options and its weighing
   before the conclusion, in the question → options → weighing → verdict
   shape this module uses consistently across its design records.
