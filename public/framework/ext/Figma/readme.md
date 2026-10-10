# Figma — tracks Figma files as JSONL + saved screenshots, so the site can browse every page and rebuild designs without Figma

## Use

Page: [/framework/ext/Figma/](/framework/ext/Figma/) — files, then a file's pages as a preview grid, then one page large with its frames (`?file=<key>&page=<node id>`). First rebuilt design: [Color Schemes](/framework/ext/Figma/colors/).

Track or refresh a file (the Figma MCP only answers inside an agent session, so an agent supplies a spec of node ids and screenshot URLs; the script computes the rest):

```
node public/framework/ext/Figma/track.mjs spec.json
```

## Classes

- `Figma` (`Figma.js`) — the system; `Figma.files()` loads every tracked file from `index.jsonl`.
- `FigmaFile` (`FigmaFile.js`) — one tracked file: key, name, pages; reads `data/<key>/pages.jsonl` (newest line per id wins).
- `FigmaNode` (`FigmaNode.js`) — a page or frame: name, size, screenshot, link back to Figma.
- `FigmaBrowse` (`FigmaBrowse.js`) — the browse `Page` (extends `core/Page`).

## Watch out

- No tool lists a user's files: every fetch needs a file key from a Figma URL. Tracked now: Sept-2026 `QYN0G2URSBHYH5I06MOjxU`.
- Never modify the Sept-2026 or July-2026 Figma files (read only); scratch writes go to `T5PuB8EhKhfyh0xtpIT1L0`.
- Screenshots over 600 KB are refused by `track.mjs`; the Figma screenshot URL is short-lived.

## More

- [doc/observations.md](./doc/observations.md) — how the Figma MCP behaves (costs, limits, what failed); keep it current
- [doc/capture.md](./doc/capture.md) — our page into Figma (`generate_figma_design`): works, frozen snapshot, measured
- [doc/mapping.md](./doc/mapping.md) — which Figma properties imply which of our layout words (first draft)
- [doc/page-storage.md](./doc/page-storage.md) — how a page's content should be stored (JSONL views vs `page.js`), decided
