# One action, one line: the fold, `batch()`, and where a change came from

**In one line:** a click that changes three fields of one card saves one line, not three, and every `change` event says whether it came from this tab, from loading the log, or from another writer.

## The fold (`Store.merge`)

`set({title, text})` changes two keys, and each key used to be its own saved line; `Task.wait()` called directly saved 8 (spec T2, [object-model.md](/framework/research/2026/10/29/persistence-sync/persistence-sync/lessons/object-model.md)). Now `Store.flush` sends the lines of one tick through `Store.merge` first:

- Lines that are only data (`{"set":{…}}` or `{"unset":[…]}` at the end of their hops) and name **the same item** become one line. The last value of a key wins; an unset after a set of the same key (or the reverse) leaves only the last.
- Two items touched in one action stay two lines.
- **Order never changes what a replay sees.** A line that is not data (a verb like `start`, a list verb like `add` or `move`) closes every fold, so a `set` after it is a new line. A line on an item's parent or child closes that item's fold too, because a parent's `set` may replace the very child a later line names.
- The lines handed in are not changed (they are the same objects the `delta` event carried).

Measured in `batch.test.mjs`: a page edit (a card's title and text, then the page's title) saves 2 lines instead of 3; `Task.wait()` saves 1 instead of 8. Both files replay to the same state as the live object. Readers need nothing new: a folded line is an ordinary `{"set":{…}}` line with more keys.

## `item.batch(fn)`

Lines made in one tick are folded anyway. `batch` is for an action that **awaits** in the middle: the store `item` saves through (the nearest one up its parents) holds every line until `fn` ends, or until its promise settles, then folds and sends them.

```js
await card.batch(async () => {
  card.set({ title: "Renamed" });
  await save_picture();          // the store waits
  card.set({ picture: url });
});                               // one line: {"set":{"title":"Renamed","picture":"…"}}
```

A batch that throws still releases the store. No store (node, a detached item): `fn` just runs.

## `source` on every change (spec T1)

Every `change` event now ends with `{source}`: `"local"` (code in this tab), `"replay"` (a log being loaded) or `"remote"` (a line another writer saved, read live after the store's first load). `Item.source` answers the same at any moment. A view can use it to skip an animation on load; a side effect can use it to run only for a local change.

**A reaction to a line read live saves nothing.** The store's `"read"` event (a `Ref` re-settling, a view recounting) now runs inside the read, so what its listeners change is not saved. Before, every open tab wrote the same reaction once each (spec T1: two tabs, two identical Ref re-path lines). The writer of the line owns its consequences, and a replay makes them again.

## Alternatives not taken

- **Fold in `set()` itself** (one `delta` per `set` call): cheaper, but it misses an action that calls `set` twice, and every reader of `delta` would change. The fold at the store sees the whole action.
- **Fold across verbs** (one line holding `set` and `start()` together, which D13 allows): would save more lines, but the order of keys inside one object would then decide the replay; kept separate.
- **A tab-level `source` instead of per event:** the design's own shape is one last argument on every event; done for `change`. List events (`add`, `move`…) do not carry it yet.

Tests: [batch.test.mjs](../batch.test.mjs). Code: `Store.merge`, `Store.hold`/`release`, `Item.batch`, `Item.source` ([Store.js](../Store.js), [Item.js](../Item.js)).
