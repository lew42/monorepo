## What this file is

The token values ported from the July 2026 Figma comp (`Frame 14643`): one
orange, a three-step wash/tint/surface ladder, Montserrat, a barely-rounded
radius, and the full type scale as rung-3 rules on generic headings. 142
lines, and every `⚠` comment in it names a measured bug this file used to
have.

## The three surface tokens are opaque, and that was a real bug

`--wash` was translucent in dark mode, and `.app { background: var(--wash) }`
composited it over the browser's white canvas — dark mode rendered as pale
grey with pale text. The comment beside the token block states the rule this
proved: "a colour that backs a whole app cannot be translucent." Worth
knowing before adding a fourth translucent token to this ladder.

## `--subtle` is not the comp's literal value

The comp's `#737373` measured 4.24:1 against `--wash` — under AA, in roughly
150 places — so this file darkens it two shades to `#6a6a6a` and says why in
a comment rather than silently deviating from the source design.

## The type scale is a rule block, not eight tokens

`.theme-lew42 :is(h1, .h1) { font-size: 3em; … }` and its four siblings are
rung-3 of the theming ladder (a rule on generic HTML), argued for at length
in `doc/port.md` — the short version is that eight new tokens each replacing
exactly one hardcode falls under the token-adoption bar this module states
elsewhere ("a token needs an existing hardcode to replace, ideally several").

## Improvements

1. **Nothing ranked.** Every non-obvious value in the file is annotated with
   why it diverges from the naive read of the comp, which is the single
   highest-value habit a ported design file can have.
