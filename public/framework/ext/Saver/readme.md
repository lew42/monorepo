# saver — design record

Where a document goes. `save(item)` / `load()` / `delete()`, four backends, and a
coalescing write queue in the base class that every one of them inherits.

```js
const saver = new FileSaver({ path: "/data/doc.json" });   // localhost
const saver = new LocalStorageSaver({ key: "doc" });       // anywhere
const saver = new MemorySaver();                           // tests
```

A saver never asks what an `item` is — anything `JSON.stringify` can read. That
duck type is the whole seam: `core/Item` holds a saver, `ext/Saver` imports no
core class, and neither knows the other's shape.

## Traps

- **⚠ `save()` resolves when *your* state is on disk, not when the next write
  starts.** It returns the drain promise, which settles after the queue is empty
  — including a write your call caused to be queued.
- **⚠ `FileSaver` off localhost warns ONCE and resolves `false`.** It never
  throws and never retries. A caller that ignores the return value silently
  believes it saved; read it, and show the reader a read-only badge.
- **⚠ A 404 from `load()` is `null`, not an error** — a document that does not
  exist yet is the normal first run. Distinguish "empty" from "absent" in your
  own data if you need to.
- **⚠ Defaults live on the prototype, never as class fields.** `Saver`'s
  constructor assigns inside `super()`, so a field would overwrite what the
  caller passed. `MemorySaver.prototype.save_count = 0` is why
  `new MemorySaver({ json })` survives construction.

## Decisions

**What is the base class for?** The queue, and only the queue. Options: (a) an
empty interface documenting three methods; (b) shared serialization; (c) the
write queue. (b) died on inspection — `FileSaver` sends tab-indented text,
`MemorySaver` keeps structured JSON, `LocalStorageSaver` keeps a compact string;
there is no shared format. (a) is a comment pretending to be code. **Verdict:
(c).** Every backend needs the same debounce, and prior art (frozen-helix's
`FileSaver` and `ListSaver`) wrote it twice, differently.

**Debounce by timer, or one-in-flight/one-pending?** Options: a `setTimeout`
window; a promise chain that queues every call; one in flight and one pending.
A timer picks a number nobody can defend and still overlaps writes under load; a
full chain writes N times for N keystrokes, just later. **Verdict:
one-in-flight/one-pending.** Fifty rapid saves become two writes, the last state
always wins, and a save issued *during* a write lands in the write that follows
it — never dropped, never reordered. The recheck of `pending` after each
`await` in `drain()` is the entire mechanism.

**Dirty tracking, so a save with no field change is skipped?** Rejected by the
council (spec §10) and not reintroduced here. It gated writes on field changes
and silently suppressed structural ones, so a reorder-only document never
persisted. **Verdict: document-level.** Something changed → write the document.

**`ListSaver`?** Not returning. A list document is an `Item` with empty `data`,
so the collection case is already the document case (spec §14, which also
deleted `File` and `Dir` — a file is a saver's `path` string, and the server
mkdirs the path on write).

**Static hosting: fail loudly or quietly?** Neither — **once**. Options: throw
(breaks a page whose only sin is being deployed); fail silently (the shipped
frozen-helix behaviour, and the reason a reader could type for an hour into
nothing); warn once and resolve `false`. **Verdict: warn once, return `false`**
(spec §15). The return value is the seam an editor reads for its read-only
badge, and `load()` keeps working — a `.json` file is a static asset, so a
deployed page can read what it cannot write.

**Delta writes / `write_ops(ops)`.** Deferred, and the seam is `write(item)`:
a backend that wants ops overrides it. Nothing here is built for it yet.

## Open

- `delete()` on `FileSaver` uses fire-and-forget `rpc("rm")`, so `true` means
  *sent*, not *removed*. `async_rpc` would give a real answer for one more await.
- Nothing retries. A socket that drops mid-write loses that write; the next
  `save()` recovers, but an idle document does not.
