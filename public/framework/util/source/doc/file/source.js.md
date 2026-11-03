Four small functions, no imports, no state: `source`, `member`, `patched`,
`dedent`. Everything that turns running JS into on-page text goes through
this file, once.

## Two different "give me this function as text" callers

`source(fn)` is for an anonymous example — it strips the wrapper down to the
body. `member(subject, name)` is for a named class/object member — it must
keep the signature, so `dedent(String(fn))` is used directly rather than
`source()`. Getting this backwards is the mistake the design record
(`readme.md` §3) exists to prevent: `source()` on a method throws away the
one line confirming a reader is in the right place.

## `member()` is the file's newest and most load-bearing function

Edited 2026-08-15: generalized from "takes a class" to "takes any subject
that owns the member" — see [member's page](/framework/util/source/api/member/)
for the full account. It is what every `Doc`-based module's API tab is built on.

## `arrow_at()` and the CRLF normalisation inside `dedent()` are the two silent
traps

Both are one-line fixes for bugs that once shipped and read as correct code
— a fragment that looked like a working example, a signature indented wrong.
Neither shows up unless two callers' output is compared side by side, which
is exactly what this file exists to make agree automatically.

## Improvements

1. **No test file guards `arrow_at()` or `dedent()`'s two traps.** Both were
   found by eye, not by a runner — a regression would ship the same way the
   bug did. *(medium, important)*
2. **`member` and `patched` currently have one caller each (`ext/Doc`).**
   Expected for a same-day generalization; worth re-checking once more
   `Doc`-based modules exist and the pattern either gets reused or doesn't.
   *(simple, speculative)*
