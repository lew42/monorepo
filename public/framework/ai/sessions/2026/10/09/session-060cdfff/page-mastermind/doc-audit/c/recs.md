# Doc audit recommendations for core/Page/doc — minion c

## css.md: keep

- why: Comprehensive 496-line design record of Page.css, covering visibility contracts, rhythm, cards, shapes (standard/pad/full/fill), axes, and breakout scaling. No design decisions restated elsewhere; this is the authoritative source for the CSS implementation choices.
- into / folder / replaced by: (keep in place)
- linked from: columns.md (line 659), decisions.md (multiple refs), file/Page.css.md (cites it rather than repeat), layout.md, labels.md
- stale: none found — all class names (.page, .pages, .standard, etc.), CSS variables (--measure, --page-pad, --gutter-x), and design decisions (flow, rhythm, one axis) verified in Page.css

## markdown.md: keep

- why: Focused 59-line reference for the `md/` pattern (markdown files as routable pages). Clearly explains how links find docs, why `md/` not `.md`, and the watch-outs (no page named `md`, trailing slash matters, budget, module guessing). No duplication with open.md (which covers where a click opens).
- into / folder / replaced by: (keep in place)
- linked from: readme.md (under Navigation, paired with open.md), ext/markdown/open/ (live example)
- stale: none found — Markdown.js, Page.md_url(), Page.child() all verified in code; md/ routing tested and working

## roles.md: keep

- why: Canonical 73-line reference for page roles (`is:`, `nearest()`, `topic()`, `document()`). Documents the pattern for cross-page communication without imports, explains why `is:` was chosen over alternatives (true/false flags shadow methods), and shows measured performance and real use cases (Inbox, Refs). No other doc covers this pattern.
- into / folder / replaced by: (keep in place)
- linked from: decisions.md (line 281, roles summary), method/nearest.md, method/topic.md, method/document.md, method/prefs.md, method/store.md, watch-out.md; also referenced in columns.md and panels.md
- stale: none found — all methods (`topic()`, `document()`, `nearest()`) verified in Page.class.js; pattern is current and in use

## indexing-2026-10-08.md: keep

- why: Valuable 24-line record of the owner's architectural questions about directory indexing (2026-10-08) and a dated addendum (2026-10-09 17:25) documenting the 16 MB directory.json fix. Serves as a record of open design questions (deltas vs rewrites, session index, querying without loading 4,000 files) that shaped the current strategy. The addendum confirms progress and status: recommendations are "recorded, not started" because owner asked for no new tasks.
- into / folder / replaced by: (keep in place)
- linked from: readme.md (under Reference)
- stale: none found — the 16MB fix is real (verified in git log commit 9b7f9b686), the questions remain open and relevant, the addendum marks the status clearly
