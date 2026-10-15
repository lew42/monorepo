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

Reviewed 2026-10-13 at four widths, with before and after shots: [review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-site-pages/review.md).

## Shipped 2026-10-14: a still picture per card

`node Server/CatalogThumbs.mjs --plan | --apply | --all` writes one 600×375 webp per page to `catalog/thumbs/<slug>.webp` (slug = url with `/` as `__`) plus `thumbs/index.json`; the card shows the picture and boots the live iframe on mouse hover (a phone: first tap shows it, second follows the link). A page with no picture keeps the 4-at-a-time iframe. Measured the same way (headless, 1920×4000, from the first response; the card is `CatalogPage.watch_hover`):

| 49 cards on screen | 1st | 10th | 20th | 40th |
|---|---|---|---|---|
| live iframes (4 at a time) | 1.25 s | 5.2 s | 11.5 s | not in 14 s |
| **pictures** | **0.74 s** | **0.74 s** | **0.74 s** | **0.74 s** |

227 pictures, 3.4 MB (about 15 KB each). One full shoot takes ~30 min, so `--apply` only reshoots the missing or stale (older than the newest file in the page's folder). The shooter uses the shared `Server/browser.mjs` launcher rather than `Shots.run`, which writes a round folder and a `runs.jsonl` line per shot.

**Not deployed yet:** `thumbs/` is git-ignored (automated pictures are never committed) and a Cloudflare build deploys a checkout, so `node Server/DeployCount.mjs` does not count them and production shows the iframe fallback until a picture folder is uploaded some other way (e.g. a CI step running `--apply`, or committing the folder, the owner's call).

Shots (1920×4000): [before, iframes](next-before-iframes.png) · [after, pictures](next-after-pictures.png). Refresh part of the set with `--apply --only <url part>` (a fresh checkout resets file times, so a plain `--apply` may reshoot all).
