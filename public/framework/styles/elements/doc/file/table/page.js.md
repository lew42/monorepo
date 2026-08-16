## What this file is

Four declarations that make a table readable (`border-collapse`, cell
padding, a tinted header) and the four more that make it scroll itself
(`display: block; width: max-content; max-width: 100%; overflow-x: auto`) —
the only rule in `framework.css` this module calls out as needing to be
*four* declarations that only work together.

## `pre` and `table` are the whole list

The closing line — these are the two elements in HTML that cannot shrink and
have no scroller of their own, and there is no third — is a claim the
`nesting.md` rules chapter also makes independently. Worth cross-checking if
either page is ever revised, since they currently agree.

## Improvements

1. **Nothing ranked.** The "realistic one" demo (a data table built with a
   plain `forEach`) is a good small proof that a "data table" needs no
   template language in this framework — worth pointing a reader here before
   they reach for a component.
