# Inspect — see what any page or card is made of, and how it got there

Two read-only Views, opt-in from a page's own `settings/` tab. Neither ever writes.

## Files

- [ItemInspector.js](ItemInspector.js) — given `{item}`, three sections: **Inside** (every list the item owns — `content`, `pages`, …, via `item.lists()` — one row per member: id, type, title, linked where it has a url), **Methods** (own class first, then each parent up to `Item`, collapsed `<details>`, one chip per method name), **Fields** (`item.data`'s own keys, short values).
- [DeltaHistory.js](DeltaHistory.js) — given `{url}` (a folder with its own `page.jsonl`), loads the raw lines (`new Item.Store({url}).load()`, no host attached, so nothing replays onto a live object) and a slider from 1 to N: moving it reruns `Class.replay(lines.slice(0, n))` *in memory* and shows the result's title and list counts. `Class` is whatever `Item.class_for(lines)` finds registered on line 1, or `Page` when nothing is.
- [Inspect.test.mjs](Inspect.test.mjs) — a four-line fixture page.jsonl, replayed at N = 1..4, asserting the card count grows 0→1→2→3; under 1 s.

## Use

```js
import ItemInspector from "/framework/ext/Inspect/ItemInspector.js";
import DeltaHistory from "/framework/ext/Inspect/DeltaHistory.js";
new ItemInspector({ item: somePage });
new DeltaHistory({ url: somePage.url });   // somePage.url ends in "/", its page.jsonl lives there
```

Wired into `LivePage.Settings` (`public/live/LivePage.js`): after the Files list, two more `h4`s, "What it is made of" and "How it got here", each loading its module with a dynamic `import()` so `/live/` pays nothing for Inspect until a settings tab opens.

## Watch out

- `ItemInspector` reuses the same prototype-chain walk as [`live/design/ui/MethodMap.js`](/live/design/ui/MethodMap.js)'s `own_methods()`, written again rather than imported — `MethodMap` lives under `/live/`, and Inspect works for any Item core/Page/ext might open on, not only Page.
- `DeltaHistory` never attaches a host to its `Item.Store`, so the file's lines land in `store.entries` instead of replaying onto anything live — the only way to read a log's raw lines without disturbing whatever already has it open.

## More

- [core/Item/Item.js](/framework/core/Item/Item.js) — `Item.replay`, `Item.class_for`, `item.lists()`
- [core/Item/replay/](/framework/core/Item/replay/) — the older replay lab (button-press tapes, not a slider)
- [public/live/readme.md](/live/readme.md) — the settings tab this plugs into
