# One action, one line: the fold, `batch()`, typing, and where a change came from

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

A batch that throws still releases the store. No store (node, a detached item): `fn` just runs. Held lines live only in memory until they reach the Outbox (which keeps them through a reload), so when the page is hidden or closed (`pagehide`, `visibilitychange`) everything a batch holds is sent at once (`Store.send_held`); the batch goes on, and its later lines are sent at its end.

## Typing: many keystrokes, one line

Typing in a field calls `set({text})` on every key, and each one used to be a saved line. In a browser the store now **holds** a data line instead of sending it, and the next data line on the same item joins it (the fold makes them one line). It is sent:

- after a **pause** of `idle` ms (300) since the last keystroke;
- at the latest `max` ms (2000) after the first, so a long burst is still saved every 2 seconds;
- on **blur** (any `focusout` in the page) and when the page is **hidden or closed** (`pagehide`, `visibilitychange`): `Store.flush_typing()`;
- **before any other line**: a verb, a list change, or a change to another item sends what is held first, in order.

The item changes at once (the screen updates on every key); only the save waits. `store.pending` counts held lines, so a "saving…" sign stays honest. The setting is `Store.coalesce = {idle, max}`, read per Store class (`this.constructor.coalesce`), so a subclass can turn it off: the Replay Lab's `LabTape.Store` does, because it shows every line the moment it is made. It is `null` in node (the item tool, scripts and tests keep their one-tick timing), and `null` in a browser turns it off. Measured in `coalesce.test.mjs`: 11 keystrokes 5 ms apart save one line with the last text, and it replays.

**Caveat:** every lone data line is held, not only typing: a click that sets one field reaches the file up to 300 ms later, so code that sets a field and at once asks Servex or an agent to read that file could read the old value (nothing does today; a verb, such as Approve through `act()`, is never held). **Caveat:** a held line lives only in memory for up to 2 seconds. A crash of the tab (not a close: `pagehide` sends it) in that window loses it. Alternative not taken: send the first keystroke at once and hold only the ones after it (no delay for a lone change, but two lines per burst instead of one).

## `source` on every change (spec T1)

Every `change` event now ends with `{source}`: `"local"` (code in this tab), `"replay"` (a log being loaded) or `"remote"` (a line another writer saved, read live after the store's first load). `Item.source` answers the same at any moment. A view can use it to skip an animation on load; a side effect can use it to run only for a local change.

**A reaction to a line read live saves nothing.** The store's `"read"` event (a `Ref` re-settling, a view recounting) now runs inside the read, so what its listeners change is not saved, **by any store**: the mute is global (`Store.replay_depth`), so a future listener that writes to another file is dropped too, without a warning. Today's listeners only redraw or re-settle. Before, every open tab wrote the same reaction once each (spec T1: two tabs, two identical Ref re-path lines). The writer of the line owns its consequences, and a replay makes them again.

**Caveat:** the fold keeps a key where it was first set. A `set` key, then a dotted sub-key of it, then the key again would replay in the wrong order; `set()` never writes a dotted key inside `set` today.

## Alternatives not taken

- **Fold in `set()` itself** (one `delta` per `set` call): cheaper, but it misses an action that calls `set` twice, and every reader of `delta` would change. The fold at the store sees the whole action.
- **Fold across verbs** (one line holding `set` and `start()` together, which D13 allows): would save more lines, but the order of keys inside one object would then decide the replay; kept separate.
- **A tab-level `source` instead of per event:** the design's own shape is one last argument on every event; done for `change`. List events (`add`, `move`…) do not carry it yet.

Tests: [batch.test.mjs](../batch.test.mjs). Code: `Store.merge`, `Store.hold`/`release`, `Item.batch`, `Item.source` ([Store.js](../Store.js), [Item.js](../Item.js)).
