`md.c(classes, content)` — classes first, then markdown, mirroring `div.c()` /
`p.c()`:

```js
md.c("note", "Some **md**");   // same as md("Some **md**").ac("note")
```

## It has no caller

A framework-wide grep finds zero uses of `md.c(...)` in `public/` outside its
own definition and its own docs. It was written for symmetry with the element
factories' `.c()` shorthand, and the symmetry is real, but nothing has ever
reached for it — every real call site writes `md("…").ac("note")` instead,
which is the same length and already works.

## Why it can promise less than `div.c()` / `p.c()`

`.c()` on an element factory always puts the classes on the element you asked
for. `md()` is not an element factory — it's a parser whose root shape depends
on the *content*: one block adopts that block, multiple blocks wrap in a
`div.md`. `md.c("note", "a\n\nb")` puts `.note` on the wrapper `div.md`, not on
anything you wrote — a promise `.c()` can't always keep.

See [Proposed](/framework/ext/markdown/doc/proposed/) — this is a live
finding, not yet acted on: keep for symmetry, or delete and say classes go on
with `.ac()`.
