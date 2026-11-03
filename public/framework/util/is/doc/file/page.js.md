This module's own page: a two-line demo, the one paragraph explaining why `is`
exists (`View.append()`'s dispatch), and the rest left to the API tab that
`subject: is` and `methods:` generate.

## Why the overview is short

Every one of the fifteen checks now has its own page under
[API](/framework/util/is/api/) — the real source, plus the caller list and
trap for each. Repeating a table of all fifteen here as well is exactly the
kind of list the documentation skill warns goes stale silently; this file
says what the table used to say in one line and links to it.

## `subject: is` is the plain-namespace-object case

`is` is an object literal, not a class or a function-with-properties, so
`member()` (`util/source/source.js`) falls through to
`Object.getOwnPropertyDescriptor(is, name)` for every check — the same lookup
path a class's statics use.

## Improvements

1. **None outstanding.** The page is as small as the module.
