**Usage** — ~50 call sites, and the safe half of the content pair. `md.js` and
`ext/highlight` use it wherever markup must not be interpreted; every demo that
mutates a label on click uses it.

```js
view.text("Clicked.");      // set, chainable
view.text();                // GET — returns a string
```

**Necessity** — yes. `text()` is the default answer for content; `html_unsafe()` is
the exception you justify.

**Simplicity** — right-sized. The `!==` check skips the write, not the return: an
**equal-value set must still return `this`**. That distinction was a live bug —
`text()`, `html()` and `attr()` once switched on whether the value *differed*, so
setting a value equal to the current one fell into the getter branch and returned
a string mid-chain. `field().text("").attr(…)` on an empty `<textarea>` threw
"attr is not a function".

