**Usage** — one internal caller: `tc()` (`View.js:156`), which loops it over a
space-separated list, passing its own `force` straight through. Nothing in
`public/` calls it directly.

**Necessity** — no, as a public name. As a body, yes — it is the single-class step
`tc` iterates.

**`force`** — same contract as `tc`: omitted flips the class, `true`/`false`
add/remove via `ac`/`rc` (so an equal-value set still returns `this`).

**Simplicity** — the split buys nothing: `tc` could write the ternary inline and
lose a member. The one thing to preserve is the *difference* between them — this
one takes **one** class, `tc` takes a list — because a reader who assumes they
are aliases will pass `"a b"` here and toggle a class literally named `a b`.

