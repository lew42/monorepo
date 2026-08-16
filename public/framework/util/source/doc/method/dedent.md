Removes the leading blank line and the common indent, so a body nested three
tabs deep inside a `page.js` reads as top-level code.

## CRLF is normalised first, and that is load-bearing

`fn.toString()` returns whatever line endings the file was checked out with;
the same text read back through `innerHTML` comes back `\n` — the DOM
normalises, the string does not. Rendered output looked fine either way;
two callers **comparing** results (`demo()`'s two panes) were not, which is
how this was found.

## The first line is only evidence if it begins a line

`String(fn)` for a shorthand method starts at the **name** —
`append(...args){` — so its indentation was left behind in the file and it
measures zero. Taking the minimum indent across every line let that zero
win: the signature sat at the root while the body stayed three tabs deep. A
first line with no leading whitespace knows nothing about the indent, so
`dedent()` doesn't ask it — `evidence` skips line zero when it starts with
no `\t`/space.

## What it does not do

Strip anything but whitespace. A line shallower than the common indent — a
`case` label, a comment flush left on purpose — keeps all of its code; only
the leading run of tabs/spaces up to `cut` is removed.

## Used by

`source()` itself, and every `Doc` method page via
[`member()`](/framework/util/source/api/member/) → `dedent(String(fn))`.
