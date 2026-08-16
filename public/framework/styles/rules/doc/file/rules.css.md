## What this file is

Layout-only CSS for the demo cards `demos.js` builds — `.rules-card`,
`.rules-stage`, `.rules-nest`, `.rules-verdict`. Nine short rules, all reading
tokens (`--surface`, `--line`, `--radius`) rather than inventing a look.

## It practices what the module preaches

The comment at the top says it plainly: "a rules page that ships its own skin
is not following its own rules." `.rules-stage` uses the exact
`padding: clamp(0.75em, 3.5%, 3.5em)` the Proportion page argues for — the
one place in this file where the rule and its own enforcement are the same
line.

## Improvements

1. **Nothing ranked.** 37 lines, every rule scoped to a class this directory
   emits, every colour a token. This is the module documenting the standard
   it holds everything else to, on itself.
