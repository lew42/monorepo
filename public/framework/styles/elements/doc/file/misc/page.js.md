## What this file is

The catch-all: `details`/`summary`, focus rings, the Material Icons ligature
trap, `br`, the seven landmark elements with no rule, and — the page's own
centerpiece — the complete list of 39 factories `framework.css` never touches
at all.

## The focus-ring trap, explained end to end

`outline-width: 2px` used to sit beside a comment wondering why it did
nothing. This page has the full chain: no `outline-style` is set, so the
ring is the UA's own `outline-style: auto`, which follows `border-radius`
and, by spec, ignores `outline-width`. The dead declaration is gone; the
reasoning is kept here rather than lost with it.

## A trap worth repeating, repeated correctly

The closing demo restates the `p()`/`h1`–`h6` backtick-only trap from
`CLAUDE.md`, live — literal asterisks rendering in a `span()` beside a
real `<code>` in a `p()`, so the claim is shown rather than only asserted.

## Improvements

1. **Nothing ranked.** This page is where the module's own "cover the
   unstyled elements too" principle pays off most directly — the 39-factory
   list turns an implicit claim ("framework.css is small") into a specific,
   checkable one.
