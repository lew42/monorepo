Fifteen type checks on one object literal, each a single `return` statement. No
imports, no state, no environment dependency except the last two.

## Why one object and not fifteen exports

Every call site writes `is.fn(x)`, not `import { fn } from "./is.js"` — the
namespace is the point: a reader scanning `if (is.…` sees a closed, guessable
vocabulary rather than fifteen independent names that happen to live in the
same file.

## The two browser-only checks

`is.dom`, `is.el` read `nodeType`; `is.mobile` reads `navigator.userAgent`.
Every other check is a pure function of its argument's type and runs anywhere
JS does. Nothing in the file marks this distinction beyond the two inline
comments — a caller importing this into a non-browser context would only find
out at the call site that throws.

## Two comments are the whole trap surface

`// ⚠ false for an ARROW function` above `class()` and
`// ⚠ false for Object.create(null)` above `pojo()` are the only two checks
whose one-line implementation hides a real edge case. Both are written up in
full in their own `doc/method/*.md`.

## Improvements

1. **`is.class`'s name overstates what it checks.** It answers "constructable,"
   not "declared with `class`" — every plain function passes too. Renaming it
   or adding a stricter sibling is the one real design question left in this
   file. *(medium, important — see the readme's Open question.)*
2. **`is.proto` and `is.mobile` have no callers and one is actively wrong**
   (`is.proto(Array.prototype)` is `false`). Recorded as a recommendation in
   the readme, not applied. *(simple, useful)*
