Add a class. The workhorse of the chainable API, and the reason `.c()` exists on
every factory — `div.c("flex gap")` is just `div().ac("flex gap")` with fewer
parens.

```js
div().ac("flex gap");           // space-separated, one call
div().ac("flex", "gap");        // or several args
div().ac(cond && "active");     // falsy args are skipped, so no ternary
```

That last line is why the loop guards with `arg &&` rather than trusting
`split`. `undefined.split` throws, and the natural way to write a conditional
class produces exactly `undefined`.

## Why classes and not styles

The CSS ladder says stop at the first rung that works, and rung 2 is *a utility
class*. `ac` is how you spend that rung. Reach for `.style()` only when the value
is computed at runtime — a width from a measurement, a colour from data. A
literal in `.style()` is a rule that no stylesheet can ever override, because
inline styles sit above every layer including `!important` ones.

## Siblings

`rc` removes, `tc` toggles, `hc` asks. All four take the same space-separated
form, and the first three return `this` so they chain; `hc` returns a boolean, so
it ends a chain.
