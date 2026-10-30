# Takeaways

**Keep**
- `item.set(delta)` as the one API, where the delta is also the saved line.
- Nested names down to the target, then one verb. List members are found by id, never by index.
- `List extends Item`, `Page extends Item` + url, and `Ref` with `moved_to` forwards.
- One writer per file, and one home per page (no two-way sync).

**Change**
- Every line gets `seq` (set by the server) and `client` + `n` (set by the writer). The sender gets an `ack`, not its echo.
- A change saves through `this.store.change()`, your F6. Events stay, for views only.
- `add` writes the whole item (envelope), and `add` of an item that already has a parent makes a `Ref` (F7).
- Views bind through `item.prop(key)`, the `Property.of` you already built, not by wiring events by hand.

**Adopt (at the edges)**
- Plain-JS `Room` + `Journal` (Journal is your storage.md word): JSONL now, a SQLite file next, a Durable Object later.
- Presence as a throwaway frame: soft edit locks, cursors, typing dots.

**Avoid**
- CRDTs, fractional positions and offline multi-writer before phase 5.
- Logging anything faster than a few changes a second (game ticks, audio/video, every keystroke).
