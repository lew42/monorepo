`ui.table(head, rows)` is one of the three components that kept its function,
because a table body is a **loop** — the one thing copy-paste markup cannot
express cheaply for an unknown number of rows.

## What a caller must know

A cell may be a **string or a function**. A function cell runs with the `<td>`
as the current captor, so it is written exactly like page code — a link, a
badge, a `<kbd>` — rather than as a template string you'd have to escape.

`.c("num")` right-aligns every column but the first (`th + th, td + td`). There
is no general `text-align` utility in the framework, so this is the one place a
numeric column gets one; anything else still wants one inline declaration.

## The trap this component exists to fix

`.ui-table { width: 100% }` overrides `framework.css`'s default `table` rule
(`display: block; width: max-content; overflow-x: auto`), which lets a *wide*
table scroll itself but shrink-wraps a *small* one — measured at 187px inside a
320px card before the fix. The override was checked against all 49 tables on
the site (24 already full width, 25 stretched) before landing here rather than
in `framework.css` itself, because a key/value table with 600px of white space
in the middle is a worse failure than a shrink-wrapped one, and `ui.table` is
specifically for the case that wants to fill its container.

## Improvements

Nothing ranked: nine lines, one loop, the override is already the finding
(recorded above and in `doc/record.md`), and the component has real callers.
