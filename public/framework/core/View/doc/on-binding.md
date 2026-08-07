# `on()` binds `this` to the view, not the element

```js
p("Click me").on("click", function(){ this.text("Clicked."); });
```

The whole chainable API inside a handler with no lookup and no closure over a
variable you had to name first. **Use `function`, not an arrow**, when you want
that — this is the one place in the framework where the distinction carries
meaning.

**`View` keeps no listener registry**, deliberately: a registry is memory that
must be invalidated, and nothing has needed it. The costs are real and worth
knowing — `off()` needs the same function reference (the DOM's rule, so an inline
arrow is unremovable), and a listener on a view that gets discarded during
`ext/highlight`'s block-unwrapping is lost with nothing in the console.
