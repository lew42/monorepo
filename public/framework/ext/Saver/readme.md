# Saver — where a document goes: `save` / `load` / `delete` over one write queue, for anything that persists JSON

> **⚠ Converge (the owner, 2026-10-02):** file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [ext/filesystem](/framework/ext/filesystem/) (`FsFile`, `FsDir` → `Dir`), [ext/files](/framework/ext/files/) (the tree UI), [ext/JSONL](/framework/ext/JSONL/), and about 15 direct `Socket` `"append"`/`"write"` calls. Before adding to any of them, consider consolidating: ONE file object (`FsFile`: `read`, `write`, `append`, and a `store` for .jsonl) as the only caller of the dev socket. Logs are appended one line at a time, never rewritten. A `LiveList`'s change events are both the view update and the line that gets appended. Design: [page-item-design.md](/framework/ai/2026-09-30/proposal-flow/page-item-design.md).

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
- `FileSaver.write()`/`delete()` follow the site's one edit switch (`ext/Ask/edit.js`'s `edit()`), not the dev socket directly — the dev rail's "edit" checkbox off gets the same read-only warning as off localhost, without leaving localhost — [`/framework/ext/Ask/doc/decisions.md`](/framework/ext/Ask/doc/decisions.md)
- `load()` gives `null` for a missing document, but `FileSaver.load()` rejects on any other failure — don't seed on a rejection — [doc/decisions.md](./doc/decisions.md)
- Defaults go on the prototype, never as class fields (`assign` runs inside `super()`) — [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/ext/Saver/) · [doc/backends.md](./doc/backends.md) (the four compared, why `FileSaver` is dev-only) · [doc/decisions.md](./doc/decisions.md) (the record: callers, verdicts, open items)
- Per-method and per-property docs: `doc/method/*.md`, `doc/property/*.md`; per-file: `doc/file/*.md`
- Files that matter: `Saver.js` (the queue itself), `FileSaver.js` (dev socket backend), `LocalStorageSaver.js` (deployed backend)
