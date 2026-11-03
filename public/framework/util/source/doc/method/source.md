A function's body as text, with the wrapper stripped: `() => { body }` and
`function(){ body }` both give up their braces; a concise arrow (`x => x + 1`)
keeps its expression instead, because there is no brace to strip.

## What it throws away, on purpose

Everything before the body starts — `() =>`, `function(){`, a method's own
name. Right for an anonymous example (`demo(() => { … })`); wrong for a
member, which is why [`member()`](/framework/util/source/api/member/) exists
as the second entry point rather than a flag on this one.

## The one trap inside it

Finding *where the body starts* is not `indexOf("=>")` — the first arrow at
depth zero, skipping quoted strings, is `arrow_at()`. A naive search once
sliced an ordinary function at an arrow **inside** it and printed a fragment
that still looked like valid code. Full account:
[readme.md §6](../../readme.md).

## Used by

`demo(fn)` and `code.fn(fn)` ([ext/demo](/framework/ext/demo/),
[ext/highlight](/framework/ext/highlight/)) — the two places a function
becomes an on-page example, and the reason both call the same function
instead of each stringifying it their own way.
