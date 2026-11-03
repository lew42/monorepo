The framework-wide constructor convention, unchanged here — see
[`View`'s `assign`](/framework/core/View/api/assign/) for the full case. `Saver`'s
own contribution is just the shape it lets each backend take:

```js
new FileSaver({ path: "/data/doc.json" });
new LocalStorageSaver({ key: "doc" });
new MemorySaver({ json: seedValue });
```

One options object, no positional arguments to remember the order of, and every
default lives on the **prototype** (`Saver.prototype.pending = undefined`,
`MemorySaver.prototype.json = null`, …) rather than as a class field — because a
field initializes *after* `super()` runs `assign()`, and would silently
overwrite whatever the caller just passed in. `MemorySaver.js`'s own comment
names this trap at the point it would bite.
