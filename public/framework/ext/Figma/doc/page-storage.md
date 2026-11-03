# How should a page's content be stored? (decided 2026-10-10)

The owner's idea: a page is a list of views serialized into its own JSONL (first line a snapshot, later lines deltas), so playback and the live tail come free.

**What exists:** `page.jsonl` already works as a *settings and data* stream for pages (tabs, notes, the page tools that agents use to change a page by path + delta: `core/Page/doc/page-tool-2026-10-09.md`), and chat and session files render as lists from JSONL. A page's *views* are still built by the code in `page.js`; I found no code that rebuilds a view tree from lines.

**Decision:** the Figma slice uses plain `page.js` (`colors/page.js`) for the rebuilt design, because it is the simplest thing that works and the Figma data (`pages.jsonl`) is already JSONL.

**Alternative, and the smallest slice for it:** a `View` list class where each line is `{view: "div", cls, text, children}`; a renderer turns a snapshot line plus deltas into DOM, and `live()` replays new lines. Build it first on a page of nested cards (this very demo is a good test, being a pure tree), only then widen. Not built here: it changes how `core/Page` loads content.
