**Usage** — 35 call sites, plus `click()` (`View.js:262`) and `stylesheet()`'s
`load`/`error` pair (`View.js:427-428`), which is the one place a `View` listens
for something other than a user.

```js
p("Click me").on("click", function(){
    this.text("Clicked.");      // `this` is the VIEW, not the element
});
```

**Necessity** — yes. Events are half of what a wrapper over an element is for.

**Simplicity** — right-sized, and the wrapping arrow exists to rebind `this` to
the view. **Use `function`, not an arrow**, when you want that; an arrow captures
`this` lexically and hands you the enclosing scope. This is the one place in the
framework where the distinction carries meaning.

## The sharp edges

`off(event, cb)` needs the **same function reference** — the DOM's rule, not this
framework's — and the arrow wrapper here means the reference the DOM holds is
never the one you passed. So a listener added through `on()` is **unremovable by
`off()`**, always, not just when you pass an inline arrow. Nothing in `public/`
has ever hit this, because nothing calls `off()`.

`View` keeps no listener registry, deliberately: a registry is memory that must be
invalidated. The cost is that a handler chained onto `code.js()` in argument
position inside a phrasing parent is silently lost — the `<pre>` it was chained to
is discarded at append time and there is nothing to move the listener from. See
`ext/highlight/readme.md`.
