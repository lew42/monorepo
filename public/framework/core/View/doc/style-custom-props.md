# `style()` and the custom-property branch

`el.style["--x"] = v` **silently does nothing.** Custom properties are not
reflected as camelCase keys on `CSSStyleDeclaration`, so the assignment lands on a
plain JS property no browser reads. Only `setProperty` works, which is why
`startsWith("--")` is checked in both the get and set paths.

This is what lets a page retune a component token with no stylesheet:

```js
sidebar().style({ "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
```
