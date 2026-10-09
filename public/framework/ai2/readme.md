# ai2: the old address of AI 2 (merged into AI on 2026-10-09)

AI 2 is no longer a separate module. Its code moved into [ai/cards](/framework/ai/cards/) (a card and what it shows) and [ai/rail](/framework/ai/rail/) (the list on the left and the data behind it); its docs moved to [ai/doc/ai2](/framework/ai/doc/ai2/history.md).

What stays here, on purpose:

- `page.js`: the route for `/framework/ai2/` and `/framework/ai2/<card>/`, so every old link still opens.
- One-line shims (`card.js`, `rail.js`, `inbox.js` …): each re-exports the moved file, so an old `import` keeps working.
- `ai2.css`, `page.jsonl`, `weight.jsonl`: the route page's own look and logs.

Nothing was deleted: [the old-path to new-path list](/framework/ai/2026-10-09/ai2-merge/manifest.json) and [the inventory](/framework/ai/2026-10-09/ai2-merge/inventory.md) show every move. Old page logs are in [ai/archive/ai2](/framework/ai/archive/ai2/readme.md).
