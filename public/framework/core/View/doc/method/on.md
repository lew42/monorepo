**Usage** — 35 call sites, plus `click()` (`View.js:235`) and `stylesheet()`'s
`load`/`error` pair (`View.js:372-373`), which is the one place a `View` listens
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

**A listener added through `on()` cannot be taken off again.** Removal needs the
**same function reference** — the DOM's rule, not this framework's — and the
reference the DOM holds is the wrapper arrow, never the function you passed. If a
handler must come off, add it with `this.el.addEventListener` and keep the
reference yourself.

`View` keeps no listener registry, deliberately: a registry is memory that must be
invalidated. The cost is that a handler chained onto `code.js()` in argument
position inside a phrasing parent is silently lost — the `<pre>` it was chained to
is discarded at append time and there is nothing to move the listener from. See
`ext/highlight/readme.md`.
