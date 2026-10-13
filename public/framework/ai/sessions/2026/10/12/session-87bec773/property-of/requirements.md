# `Property.of(item, name)`: bind a template field to a live Item key, and use it where data goes stale (brief)

[binding.md](/framework/core/Page/doc/binding.md) (section 4) names this as the recommended next step: a Property that mirrors one key of an Item and writes back through `item.set`, so the Item still saves its delta. It listens to the Item **only while it has listeners of its own**, so nothing leaks.

**Why now:** the owner's stale-data complaint (2026-10-12: a session detail showed Sonnet 5.5 after the session moved to Opus 5.5; stalled flags that weren't). Binding is "the cure for the stale-data problem".

## Done when
- [ ] `Property.of(item, name)` in `core/Property/Property.js`: reads follow the Item; `set` writes through `item.set`; it subscribes to the Item on the first listener and unsubscribes on the last.
- [ ] Tests in `Property.test.mjs`: live read, write-through (a delta is saved), no listener left after the last view goes (count the Item's listeners), a clone override and `unset` still work.
- [ ] **One real caller:** a session detail's model, cost or state field bound with `Property.of`, so a live change redraws it without a reload. Prove it headless: append a turn with a new model, and the field changes within about a second (shot before and after).
- [ ] Update binding.md (section 4: built, with a link to the caller); smoke clean; `hold.mjs`; commit each step; merge; land.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`.
