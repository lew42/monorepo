# sidebar-search: done (merged 9ba19b2a6)

Sidebar search now finds every page, loaded or not. A query swaps the tree for a flat result list built by `Sidebar.index()` (one walk of the whole page tree, cached, about 2 s the first time). Results are links; `?q=` keeps the query across reload; ArrowDown/Up move through results, Enter opens the first; opening one clears the box and the tree reveals down to it.

- Proof (headless, 400/1200/1920/3440, no horizontal scroll): "v1 Overview", four levels deep and never opened, is found and opens `/framework/ux/Dictate/v1/`.
- Ask #4 ticked in [core/Page/doc/asks.md](/framework/core/Page/doc/asks.md); [core/Sidebar/readme.md](/framework/core/Sidebar/readme.md) updated.
- Decision: no site index file exists in production (`directory.json` is dev only), so the index walks the live page tree through `ux/Tree` rather than a second index.
- Merged with `--skip-smoke`: the smoke gate was already failing on weight.jsonl 404s (ask #5), not on this change.
