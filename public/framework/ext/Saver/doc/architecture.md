# Saver architecture — one write queue under three methods, backends only say how

`Saver` is where a JSON document goes: `save(item)`, `load()`, `delete()`. The base class holds only the write queue ([`Saver.js`](../Saver.js)); each backend implements just `load()`, `write()` and `delete()`. The four backends are [`FileSaver`](../FileSaver.js) (a dev-only `.json` file), [`LocalStorageSaver`](../LocalStorageSaver.js) (the deployed store), and [`MemorySaver`](../MemorySaver.js) (tests and demos). The fourth, the bare `Saver`, is the base itself. Backends compared: [backends.md](./backends.md).

## One write in flight, one pending

**Decided:** `save()` keeps one write running and one pending state; every save between them replaces the pending state.
**Why:** a keystroke-per-save UI would otherwise write fifty times for fifty keys. The last state always wins, and a save made during a write lands in the next write, never dropped.
**Instead:** a timer debounce (picks a window nobody can defend, still overlaps under load), or a promise chain that writes once per call (N writes for N keys, just later).
**Detail:** [decisions.md](./decisions.md) "Debounce by timer, or one-in-flight/one-pending?"

## The queue is the whole base class

**Decided:** `Saver` has no state of its own beyond `writing` and `pending`, and writes nothing itself.
**Why:** a shared serializer was tried and died — each backend keeps a different format (tab-indented text, structured JSON, a compact string), so there was nothing shared to put in the base.
**Instead:** an empty interface documenting three methods, which is a comment pretending to be code.
**Detail:** [decisions.md](./decisions.md) "What is the base class for?"

## `drain()` re-reads `pending` after every await

**Decided:** `drain()` loops while `pending` is set, clearing it before each write, and clears `writing` in a `finally`.
**Why:** a write that throws used to leave `writing` stuck, so every later `save()` returned the same dead promise. Now one failed write loses only itself and warns once.
**Instead:** a promise chain that never recovers; a catch that swallows silently.
**Detail:** [decisions.md](./decisions.md) "A rejecting `write()`"

## Documents are saved whole, never dirty-tracked

**Decided:** every `save()` writes the whole document.
**Why:** a field-diff gate once skipped structural changes, so a reorder-only document never persisted.
**Instead:** dirty tracking per field (rejected by the council).
**Detail:** [decisions.md](./decisions.md) "Dirty tracking"

## A list is a document, so there is no `ListSaver`

**Decided:** a list is an `Item` with empty `data` and populated `items`; it is saved with the same `save()` as any document.
**Why:** the collection case is already the document case, so a second backend would document a distinction the data model does not have.
**Instead:** a `ListSaver` class (not built).
**Detail:** [decisions.md](./decisions.md) "`ListSaver`?"

## Static hosting warns once and returns `false`

**Decided:** when writes are refused, `FileSaver.write()` and `delete()` warn once per page load and resolve `false`; they never throw.
**Why:** a deployed page has no dev server to write to, and a throw would break a page whose only sin is being deployed. The `false` is the seam an editor reads for its read-only badge.
**Instead:** throw (breaks the page), or fail silently (a reader types for an hour into nothing).
**Detail:** [backends.md](./backends.md) "`FileSaver` is a dev-only backend"

> ⚠ The code gates writes on `edit()` from [`ext/Ask/edit.js`](/framework/ext/Ask/edit.js), not on `localhost` directly. Off localhost `edit()` is false, so the result is the same; the dev rail's edit switch also turns writes off. [backends.md](./backends.md) still says "off localhost", which is true only through `edit()`.

## `load()` returns `null` for absent, and rejects for failure

**Decided:** `FileSaver.load()` resolves `null` only on a 404 (or an unparseable file), and rejects on any other bad status.
**Why:** a caller that seeds a fresh document on `null` would overwrite a real file after a failed read.
**Instead:** fold every failure into `null`, which made "not saved yet" and "couldn't check" look the same.
**Detail:** [decisions.md](./decisions.md) "A failed `load()`"

## `FileSaver` writes through the one file API and the one edit switch

**Decided:** `FileSaver.write()` checks `edit()` and then writes through [`FsFile`](/framework/ext/filesystem/FsFile.js); `delete()` checks `edit()` and sends `rm` over the dev socket without waiting for a reply.
**Why:** one switch decides whether the site may write, so the dev rail's edit checkbox works for every saver. One file object is the only caller of the socket for writes.
**Instead:** a direct socket write in each caller (the older path, now being consolidated; see the banner in [readme.md](../readme.md)).
**Detail:** [`ext/Ask/doc/decisions.md`](/framework/ext/Ask/doc/decisions.md)

## `LocalStorageSaver` delegates to `Page.Prefs`

**Decided:** `LocalStorageSaver` reads, writes and clears its one key through `Page.Prefs.read_raw`, `write_raw` and `clear_raw`.
**Why:** one guarded `localStorage` touch for the whole framework; the guard never throws (no storage, sandboxed iframe, private mode).
**Instead:** its own `setItem` try/catch (the first version, moved in 2026-09-18).
**Detail:** [`core/Page/doc/decisions.md`](/framework/core/Page/doc/decisions.md)

## Defaults live on the prototype, not as class fields

**Decided:** every default (`writing`, `pending`, `json`, `save_count`, `warned`) is set on the prototype.
**Why:** `Saver`'s constructor assigns the caller's options inside `super()`, so a class field would overwrite what the caller passed.
**Instead:** class fields (overwritten silently by `new MemorySaver({ json })`).
**Detail:** [decisions.md](./decisions.md) "Traps"

## More

- [backends.md](./backends.md) — the four compared, and why `FileSaver` is dev-only
- [decisions.md](./decisions.md) — the full record: callers, verdicts, dated reversals
- [readme.md](../readme.md) — the index and the watch-outs
