**Usage** — ~600 `.style(` call sites, second only to `ac`. Four behaviours on one
name, chosen by argument shape:

```js
view.style("color", "red");                  // set
view.style({ color: "red", top: "1em" });    // set several
view.style("color");                         // GET — returns a string
view.style("--sidebar", "16em");             // custom property
```

**Necessity** — yes, for values computed at runtime: a width from a measurement, a
colour from data, a component token retuned by the page that holds it.

**Simplicity** — the one method on `View` that is not purely chainable; the getter
form returns a string, so a chain ends there. The `startsWith("--")` branch looks
like special-casing and is not optional: `el.style["--x"] = v` **silently does
nothing**, because custom properties are not reflected onto `CSSStyleDeclaration`
as camelCase keys. Only `setProperty` works, in both the get and set paths.

```js
sidebar().style({ "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
```

The `throw "whaaaat"` at the bottom is a string, not an `Error` — no stack. It is
unreachable from any call this codebase makes.

**When not to use it: almost always.** Inline styles are the top rung of the
escalation ratchet — nothing downstream can override them, not a layer, not
`!important`. Use `.ac()` and a class unless the value is genuinely computed.

