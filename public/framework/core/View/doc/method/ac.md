**Usage** — the most-called method in the framework: ~477 `.ac(` call sites across
`public/`. Internally it is how `classify()` writes the class chain
(`View.js:45,50,55`), how every `.c()` factory spends its first argument
(`View.js:401-421`), and half of `toggle_class()` (`View.js:145`).

```js
div().ac("flex gap");           // space-separated, one call
div().ac("flex", "gap");        // or several args
div().ac(cond && "active");     // falsy args are skipped, so no ternary
```

**Necessity** — essential. It is rung 2 of the CSS ladder made callable, and
`.c()` on every tag factory is this with fewer parens.

**Simplicity** — right-sized. The `arg &&` guard and the `filter(Boolean)` both
look defensive and both are load-bearing: `undefined.split` throws, and
`classList.add("")` throws, so `.ac("card " + maybe)` was a live landmine before
the filter. `rc` removes, `tc` toggles, `hc` asks — same shape, and only `hc`
ends a chain.

Reach for `style()` only when a value is computed at runtime. A literal inline
style is a rule no stylesheet can ever override.

