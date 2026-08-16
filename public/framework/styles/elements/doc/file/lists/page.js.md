## What this file is

`ul, ol { padding-left: 1.2em }` demonstrated as "the entire list
stylesheet," plus nesting, loose lists, and `dl` — the one list HTML offers
that still has no framework factory.

## The `dl` finding

Writing this page is what found that `dd` kept the browser's
`margin-left: 40px` — a fixed pixel indent in an em-scaled document, the
exact bug the `ul`/`ol` rule exists to fix. It's fixed now (`dd { margin-left:
0; padding-left: 1.2em }`), and this page is where that finding is recorded
as having been made.

## Improvements

1. **Nothing ranked.** Six short demos, each isolating one behaviour (nesting
   depth, `start`/`type`/`reversed` as attributes rather than classes, the
   flow rule for loose-list paragraphs), with nothing left implicit.
