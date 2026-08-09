The view currently collecting new elements. **The one piece of global state in the
framework.**

**Usage** — read in `prerender()` (`View.js:22`), which is what makes an element
factory append to the enclosing box. Written only by `set_captor()` /
`restore_captor()` (`View.js:397,402`). Read directly once outside the class, by
`framework/ext/highlight/highlight.js:53`, which needs to know where a block will
land before it lands.

**Necessity** — the class. Capturing *is* `View`; everything else is a method.

**Simplicity** — right-sized as a mechanism, and the cost is fully accounted for:
being global and synchronous is why `append_fn` can restore it on return, and why
**nothing may build DOM after an `await`**. It is never declared as a static
initializer — it simply comes into existence the first time `set_captor()` runs,
which is `App.render()` at boot. Before that it is `undefined`, and `prerender()`
guards for exactly that.

See the `capturing` note for the whole story.

