# Items hold items: references, moves, storage targets (the owner, 2026-10-21)

Words: the VS Code tab's prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`, 2026-10-21 just after midnight). Essence, with the owner's certainty kept. What exists today is in [readme.md](../readme.md) ("Where an item saves") and [core/Page/doc/storage.md](../../Page/doc/storage.md).

## The model the owner wants

- **Any item can hold items, on demand** (a good default: "every item can be a node or a folder"). Not every item gets an items list; the first item added to it creates one. A drop of one item onto another is a default inbox.
- **Adding is a reference by default.** Adding X to Y does not move X; Y references it where it lives. **Moving** is explicit (a move mode, or a modifier key such as Ctrl or Shift): it removes X from where it was and gives it a new home (from a parent's JSONL into its own file, from anywhere into its own directory).
- **Recursive auto-wiring (what the owner is looking for).** When an item is added, it gets persistence; its own children get persistence when added; drag, drop and move rewire storage automatically.
- **Storage targets vary.** The parent's JSONL (embedded), its own `.jsonl` (with a configurable name: sessions write `session.jsonl` in a dated folder, which is right), its own directory, a `.js` file that exports an instance (no easy append; its persistence could come from a cloud API or local storage), JSON (but JSONL streams, so why JSON), a database or the cloud. The store handles the mechanism, including the socket.
- **Subscribe is universal.** Any item's live updates come through its store, whatever the backend (JSONL tail today, pub/sub or cloud later).
- **A session's added items embed by default** (a session is an item; anything dropped on it becomes part of its record).
- **Content may be the items list.** By default, show what items are in it; or a template where you write anything and embed child items.
- **Where things live must be visible**, at least for now: a field or a visual mode per storage target (in the parent's file, its own file, its own folder, cloud). Recursive storage need not be supported by every target.
- The owner cares less about API names now (agents write the code) but wants to see how it is configured and what it looks like on screen.

## Next (planned, not started)

A design-first plan: the class sketch (on-demand items, a `Ref` item, `move()`, a `storage` field naming the target), the storage targets mapped onto `storage.md`'s Backend and Journal, and the on-screen view of where an item lives (designed in Figma first). Builds on [next.md](next.md) (`set(prop, item)` adopts the child) and `storage-slice-1.md` (DevBackend and StaticBackend).

**Server side (the owner, 2026-10-22):** the `item` tool may instantiate the item on the server, apply the delta and save through a server store adapter (the same path as the browser, without the socket), so validation and programmatic rules run in one place. One `item` tool with a method name and data, not a tool per method. A map of every piece of the item system (classes, stores, tools, writers) comes first: [readme-system.md](../../../ai/doc/readme-system.md).
