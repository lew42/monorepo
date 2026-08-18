# Saver — where a document goes: `save` / `load` / `delete` over one write queue, for anything that persists JSON

## Use

```js
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";

const saver = dev ? new FileSaver({ path: "/data/doc.json" }) : new LocalStorageSaver({ key: "doc" });
await saver.save(item);            // queued — resolves when your state is written
const json = await saver.load();   // the stored JSON, or null
```

`item` is anything `JSON.stringify` can read; `MemorySaver` for tests and demos.

## Watch out

- `save()` resolves when *your* state is written, not when the next write starts — [doc/method/save.md](./doc/method/save.md)
- `FileSaver` off localhost warns once and resolves `false`; read it and show a read-only badge — [doc/backends.md](./doc/backends.md)
- `load()` gives `null` for a missing document, but `FileSaver.load()` rejects on any other failure — don't seed on a rejection — [doc/decisions.md](./doc/decisions.md)
- Defaults go on the prototype, never as class fields (`assign` runs inside `super()`) — [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/ext/Saver/) · [doc/backends.md](./doc/backends.md) (the four compared, why `FileSaver` is dev-only) · [doc/decisions.md](./doc/decisions.md) (the record: callers, verdicts, open items)
- Per-method and per-property docs: `doc/method/*.md`, `doc/property/*.md`; per-file: `doc/file/*.md`
- Files that matter: `Saver.js` (the queue itself), `FileSaver.js` (dev socket backend), `LocalStorageSaver.js` (deployed backend)
