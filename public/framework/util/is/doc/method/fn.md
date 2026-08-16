`typeof value === "function"`. A **class** passes too — a class *is* a function
in JS, so `is.fn(SomeClass)` is `true`. If a caller needs "specifically a
class," that's `is.class`, and its trap is worth reading before trusting it.

## Used by

The busiest check in the file. `View.append()`'s capture-callback branch;
`Page.class.js` (content dispatch, route dispatch, child normalization —
three call sites); `ext/catalog/catalog.js` (content dispatch); `ext/demo/demo.js`
(is the example a function to stringify, or already source text).
