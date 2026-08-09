**Usage** — 4 live call sites, and all four are *escapes from the captor*:
`View.js:426` (`stylesheet()` putting its `<link>` in `document.head`),
`View.js:452` (the `style()` factory, same), and the same pattern in sandboxes.
Also the tail of `append_prop()` (`View.js:141`).

```js
new View({ tag: "link", capture: false }).append_to(document.head);
```

**Necessity** — yes, narrowly. It is how something built mid-capture reaches a
container the captor isn't. Note that it pairs with `capture: false`: without
that, the view is captured *and* moved.

**Simplicity** — right-sized, and the `is.dom()` branch earns its line — the whole
point is that the target may be a raw DOM node rather than a View.

