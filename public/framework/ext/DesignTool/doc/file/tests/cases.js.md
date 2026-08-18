The ground truth. Twenty-three layouts, each declaring what it **is** — a `bad`
case names the one rule it exists to trip, a `good` case claims to trip nothing
— so the suite scores the analyzer instead of the analyzer scoring itself.

## Four cases exist to prove a GUARD, not a rule

`Data table`, `Contents wrapper`, `Clamped card` and `Repeated rows` each
reproduce a shape that made the analyzer wrong on this site — a `<tr>` measured
as a frame, a `display: contents` wrapper read as a collapsed box, a
`-webkit-line-clamp` read as a clip, one wobble repeated twenty times. They
declare `quiet:` (this rule must not fire **at all**) or `at_most:` (it may fire
this many times), because an exemption that merely lowers a severity still
passes "no high findings". Every one of the four was a real finding count in
`knowledge/false-positives.md` before it was a case.

## Two cases exist because their rule never fired anywhere

`Nested padding` and `Unmarked structure` cover `double-pad` and `invisible`,
which produced **zero findings in 854 site runs**. Writing the cases settled
which kind of zero each was: `invisible` is reachable and this site simply
always paints a surface; `double-pad` was arithmetically unsatisfiable and is
now fixed. A rule with no case cannot tell those two apart.

## Breakage is written inline, on purpose

The CSS that breaks a case is the same three lines the reader is shown, not a
shared "deliberately wrong" stylesheet a reader could copy by accident. The
file's own comment names the incident that made this a rule: a shared wrapper
carrying `padding: 1.5em` "for looks" stepped one case's paragraphs 32px right
of the page title and misaligned two things that had nothing to do with what
the case was demonstrating.

## `from:` scopes a case to the widths where it's actually a finding

`Dead widescreen` and `Wide measure` both declare `from:` — 420px fixed
content isn't dead space on a phone, and ~112 characters a line isn't a
finding below the width it actually crosses 85. Without `from:`, either case
would need to be judged "bad, but only sometimes," which `tests/page.js`'s
`verdict()` can't express without it.

## "Good widescreen" is the case that corrected the docs, not just the tool

Written straight from the `layout-design` skill's stated advice
(`.grid.auto` with `--column: 40em`) and failed at 1280 with 112 characters a
line — `auto-fill` with a `1fr` maximum is unbounded, so at one column the
track takes the whole width. The fix (`minmax(min(34em,100%), 38em)`, bounded
at both ends) is now the case; the full story is in
[Thresholds](../../knowledge/thresholds.md).

## Improvements

1. **`Repeated rows` is the only case that asserts a COUNT**, and it does so via
   `at_most`, which cannot distinguish "the roll-up worked" from "the rule
   stopped firing". A case that declared both a floor and a ceiling (`≥1` and
   `≤1`) would pin it exactly; today a guard that silenced `alignment`
   altogether would pass. *(simple, useful.)*
2. **The corpus tests detection, not severity** (already named in the
   readme's Open section) — restated here because it's specifically visible
   from this file: every case's `verdict` is binary (`bad`/`good`), so nothing
   here would catch a rule that fires correctly but at the wrong severity
   tier. *(medium, useful.)*
