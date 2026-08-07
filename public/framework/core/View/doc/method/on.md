Bind an event. The one thing worth knowing is what `this` is inside the handler.

```js
p("Click me").on("click", function(){
    this.text("Clicked.");      // `this` is the VIEW, not the element
});
```

The view, not `event.currentTarget` — so you get the whole chainable API inside a
handler with no lookup and no closure over a variable you had to name first.

**Use `function`, not an arrow**, when you want that. An arrow captures `this`
lexically and you will get the enclosing scope instead. This is the one place in
the framework where the arrow/function distinction carries meaning, which is
exactly why it is worth stating out loud.

`click(cb)` is `on("click", cb)`, because it is most of the calls.

## The sharp edge

`off(event, cb)` needs the **same function reference** you passed to `on` — the
DOM's rule, not this framework's. An inline arrow can never be removed:

```js
view.on("scroll", () => …);     // unremovable, by construction
```

`View` keeps no listener registry, so nothing here can rescue you. If a listener
has to come off later, hold the reference.

That absence is also why chaining `.on()` onto `code.js()` in argument position
inside a phrasing parent silently loses the handler — the `<pre>` it was chained
to gets discarded at append time, and there is no registry to move the listener
from. See `ext/highlight/readme.md`.
