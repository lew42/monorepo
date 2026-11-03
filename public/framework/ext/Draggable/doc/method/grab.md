`pointerdown` on the handle — the start of a gesture. Captures the pointer,
arms the `Escape` key, records the origin point, and calls the overridable
`start(e)`.

⚠ **Capture is held for the whole drag.** Every later `pointermove`/`pointerup`
fires on the handle regardless of what the cursor is over — no `document`
listener to leak, no teardown to get wrong. The cost: `e.target` inside a drag
is always the handle, which is why hit-testing goes through
[`under()`](../under/) instead. Full trade-off: [`doc/verdicts.md`](../../verdicts/).

**Usage** — the only place `dragging` is set `true`.
