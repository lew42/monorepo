Inline styles — set one, set many, or read one back.

```js
view.style("color", "red");                  // set
view.style({ color: "red", top: "1em" });    // set several
view.style("color");                         // GET — returns a string
view.style("--sidebar", "16em");             // custom property
```

Four behaviours on one name, chosen by argument shape. It reads fine at the call
site, and it is the only method on `View` that is not purely chainable — the
getter form returns a string, so a chain ends there.

## Custom properties need the branch

`el.style["--x"] = v` **silently does nothing**. Custom properties are not
reflected onto the `CSSStyleDeclaration` as camelCase keys, so the assignment
lands on a plain JS object property that no browser reads. Only
`el.style.setProperty("--x", v)` works, which is why the `startsWith("--")` check
exists in both the set and get paths.

This is how a page retunes a component token without a stylesheet:

```js
sidebar().style({ "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
```

## When not to use it

Almost always. Inline styles are the top rung of the escalation ratchet — nothing
downstream can override them, not a layer, not `!important`. Use `.ac()` and a
class unless the value is genuinely computed at runtime.
