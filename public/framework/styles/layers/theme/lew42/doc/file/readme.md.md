## What this file is

The design record for the port: what of the comp counts as a theme (values,
not vocabulary — the test being "does `lew42.css` contain a selector naming
a component class," which it does not), the token-renaming rationale, and
three traps worth knowing before touching this theme.

## The traps are the highest-value section

Three `⚠` items: `/styles.css` beats this file on `.app` itself but loses
inside a `div.theme-lew42` nested within `.app` (layers rank declarations
competing on one element, and the closer element wins the subtree); the
`h1` rule is `(0,2,0)` and out-ranks any component rule sizing a heading;
and two dark values (`--bg`, `--code-ink`) are deliberately *not* mirrored
from their light counterparts, for reasons tied to other files
(`button.bg`'s hardcoded white label, the comp's dark code box under a light
page).

## Points to the longer record

`./doc/port.md` carries the full port narrative — the type-scale
tokens-vs-rule-block decision in full, and the known divergences from the
comp (the `h2` underline position, `em` vs. the comp's fixed-1440 `px`, the
chevron glyph). This file states the same three items as one-liners; read
`doc/port.md` for the "why," not this one.

## Improvements

1. **Nothing ranked.** The traps section is exactly the shape `CLAUDE.md`
   asks readmes to carry ("what fails silently"), and each one names the
   specific measurement or file that would otherwise force a reader to
   rediscover it.
