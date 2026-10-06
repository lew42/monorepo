The real underlying storage for sub-pages: a `#List` of child `#Page` instances, keyed by `id` (the folder name).

```js
page.pages: List                    // new List({ owner: this, name: "pages", of: null })
```

**Architecture** — (2026-10-03, `Page extends Item` directly):
- `page.pages` is the real #List holding child pages.
- `page.children` is a Map-shaped view (`PageChildren extends Map`) over `page.pages`, preserving compatibility with `children.get()`, `children.has()`, `children.set()`, `children.delete()`, and iteration for all existing callers.
- A declared but unloaded child is held as a lightweight stub (`{ id: name, name, stub: true }`). When the real child page loads, `PageChildren.set()` calls `pages.replace()` quietly without triggering a change event.
- Stored items are retrieved by `id` via `page.pages.find(name)`.

See [`doc/property/children.md`](./children.md) for the `children` Map view, and [`doc/method/declare.md`](../method/declare.md) for declaring children.
