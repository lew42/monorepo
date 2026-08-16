This module's own page, and the second-clearest demonstration of the
namespace-object form of `subject:` (the first is [`is`](/framework/util/is/)).

## `subject` is built here, not exported from `source.js`

`source.js` exports four independent functions, not one object with four
properties — there is nothing in the file itself for `member()` to read as a
single subject. `const subject = { source, member, patched, dedent }`
constructs one, entirely for this page: same function references, so
`String(fn)` on any of them still shows the real, running source. This is
the pattern `util/source/readme.md`'s Decisions section points at for any
future module shaped as "a file of related standalone exports."

## Improvements

1. **None outstanding.**
