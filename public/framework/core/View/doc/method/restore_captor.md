**Usage** — the mirror of `set_captor`, from the same places: `append_fn()`
(`View.js:108`) and `lazy()` (`View.js:293`). `App` and `app.js` deliberately
**do not** call it — they set the captor once and leave it set for the life of the
document.

**Necessity** — yes, as half of the pair.

**Simplicity** — right-sized. Note that it pops rather than clearing, so an
unbalanced call silently restores the *wrong* captor rather than throwing — the
same class of failure as everything else in this area, and the reason the rule is
mechanical: never build DOM after an `await`.

