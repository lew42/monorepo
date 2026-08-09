**Usage** — two internal callers and nothing else in `public/`: `hc()`
(`View.js:166`) and `toggle_class()` (`View.js:170`). No page, ext or sandbox
calls it by this name.

**Necessity** — no. It is the long spelling of `hc`, and the codebase has voted:
every real caller types the two-letter one.

**Simplicity** — one line wrapping one DOM call. Either it or `hc` should go, and
`hc` is the one with users. Proposed in `readme.md`; kept for now because three
sandbox View pages document the long names as API.

