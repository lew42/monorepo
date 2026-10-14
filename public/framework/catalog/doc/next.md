# Catalog — next: previews that load in under 2 s

**The ask:** "a preview on the catalog page is enough to see what it looks like" — the review's test was 40 previews in under 2 s. Today they are live iframes, and they cannot meet it.

**Measured 2026-10-13** (headless, 1920×4000 viewport so ~40 cards are on screen, time to each iframe's `load`):

| Previews loading at once | 1st | 4th | 10th | 20th | 40th |
|---|---|---|---|---|---|
| all (before) | 8.3 s | 8.8 s | 8.9 s | 8.9 s | 8.9 s |
| 8 | 1.3 s | 1.3 s | 4.5 s | 10.3 s | not in 12 s |
| **4 (shipped)** | **0.9 s** | **1.0 s** | 4.1 s | 10.4 s | not in 12 s |

Main site before any change: 10th 1.6 s, 40th 11.0 s, 44 of 50 within 12 s.

**Why:** each preview boots the whole app (router, sidebar of ~1400 pages, dev bar), and same-origin iframes share the catalog tab's one main thread, so 40 previews cost about 40 app boots in a row. A page that holds the thread (`code/performance/bench/`, a benchmark) froze the whole catalog; it is now in `CatalogPage.NO_PREVIEW`.

**The fix (over an hour, so not done here):** a still picture per card, with the live iframe only on hover or click.
- Pictures: `node Server/shots.mjs` already shoots a page ([ext/Shots](../../ext/Shots/readme.md)); a `build.mjs --shots` pass could write one small 600×375 webp per page next to `catalog.jsonl`. 228 × ~15 KB ≈ 3.4 MB, and `screenshots/` is gitignored, so decide first whether thumbnails are committed (production is static) or the card falls back to the iframe when there is no picture.
- Or a light preview mode (`?preview` that skips the sidebar and dev bar): touches `core/App`, ask first.
