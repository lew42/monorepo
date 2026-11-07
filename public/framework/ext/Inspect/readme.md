# Inspect — see what any page or card is made of, and how it got there

Two read-only Views, opt-in from a page's own `settings/` tab. Neither ever writes. [page.js](page.js) has a live demo.

## Files

- [ItemInspector.js](ItemInspector.js) — given `{item}`, three sections: **Inside** (every list the item owns — `content`, `pages`, … via `item.lists()`, skipping the `_`-prefixed backing fields `lists()` also returns — one row per member: id, a label from its title or, failing that, its text, linked where it has a url), **Methods** (own class first, then each parent up to `Item`, collapsed `<details>`, one chip per method name), **Fields** (`item.data`'s own keys, short values). Also exports `own_methods` (the prototype-chain walk), `label_of`, `item_row` and `item_list` — the row and list drawing shared with DeltaHistory, and the walk shared with [MethodMap](/live/design/ui/MethodMap.js).
- [DeltaHistory.js](DeltaHistory.js) — given `{url}` (a folder with its own `page.jsonl`) and an optional `{Class}` (the real class, when the caller already knows it), loads the raw lines (`new Item.Store({url}).load()`, no host attached, so nothing replays onto a live object) and a slider from 1 to N: moving it reruns `Class.replay(lines.slice(0, n))` *in memory* and shows the result's title, its cards (`content`) in order and its sub-pages (`pages`) — the same rows as ItemInspector's Inside. Below that, every line of the log, capped and scrollable. `Class` defaults to whatever `Item.class_for(lines)` finds registered on line 1, or `Page` when nothing is.
- [Inspect.css](Inspect.css) — the row/list/chip chrome, mirroring `LivePage.css`'s `live-files-*` shape (a bordered body, a divider between rows); falls back to a plain card color outside `/live/`.
- [Inspect.test.mjs](Inspect.test.mjs) — a four-line fixture page.jsonl, replayed at N = 1..4, asserting the card count grows 0→1→2→3; under 1 s.

## Use

```js
import ItemInspector from "/framework/ext/Inspect/ItemInspector.js";
import DeltaHistory from "/framework/ext/Inspect/DeltaHistory.js";
new ItemInspector({ item: somePage });
new DeltaHistory({ url: somePage.url, Class: somePage.constructor });   // Class optional; somePage.url ends in "/"
```

Wired into `LivePage.Settings` (`public/live/LivePage.js`): after the Files list, two more `h4`s, "What it is made of" and "How it got here", each loading its module with a dynamic `import()` so `/live/` pays nothing for Inspect until a settings tab opens; Settings already knows the page's real class, so it passes `Class: of.constructor`.

## Watch out

- Methods lists every method of the class, not only the ones a delta can call — fine for seeing the shape of a class, not a guide to what is safe to call from voice (that is `LivePage.can_press`).
- The "first comment line" per method (from the original brief) is not drawn: a method's source comment is not cheap to recover at runtime without re-reading the file, and the method name plus its owning class is enough to place it.
- `item.lists()` returns the List for every own key that holds one it owns — including the backing field of a getter (`Page.pages` is `this._pages`), which is why names starting with `_` are filtered rather than shown as `_pages (1)`.

## More

- [core/Item/Item.js](/framework/core/Item/Item.js) — `Item.replay`, `Item.class_for`, `item.lists()`
- [core/Item/replay/](/framework/core/Item/replay/) — the older replay lab (button-press tapes, not a slider)
- [public/live/readme.md](/live/readme.md) — the settings tab this plugs into
