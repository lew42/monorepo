# realm-alternates — fix brief (wave 2)

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css` if you touch a stylesheet, `finish-task`.

**The ask:** the critique at `/imagine/paging/critique/` ranked every realm at 3440 and found the three worst — apply its alternate for each, at the cause, and measure before and after. Read `public/imagine/paging/critique/page.js` first (the numbers, the alternates, the three cross-cutting claims), then `public/framework/core/Page/doc/columns.md` (the width words: `large` caps at 64em however wide the row is; `fill` claims the leftover; `wide` inside column prose opts a block out of the measure).

## The three, in order

1. **`/imagine/research/`** — 41% of 3440 used, 14,517px of scroll. Its page is `public/imagine/research/page.js`, a `Program` column with `width: "large"`. The same program shape at `/imagine/platform/research/` already took `width: "fill"` on 2026-09-04 and its front fills the row (the Program's root is `wide` and its stream is reading columns since the same day — `ext/Research/Program.js`, `Research.css`). Apply the one word. Measure width used and scroll height before/after at 3440.
2. **`/imagine/generated/`** — one card in 2180px of dead paper. Read `public/imagine/generated/page.js` and the critique's alternate (a tile wall, `wide`, card surface). The smallest change that makes the page use its row: probably `previews()` on a `wide` wall and a width word. No new CSS.
3. **`/imagine/cms/`** — 99/100 taste score, 31% wide; one contiguous 2180px dead block → the critique says a `wide` third region. Read `public/imagine/cms/page.js` and its children; propose the region (what goes in it — the critique's suggestion or a better one from the page's own content) and build it ONLY if it is a rearrangement of what the page already has; otherwise write the proposal in your task log and stop at the measurement.

## Prove it

Before/after at 1280 and 3440: width used %, widest dead region px, scroll height, zero console errors, nothing at x:0, nothing past the measure (the `layout` skill's invariants). Screenshots in your task links. Re-shoot each realm's children once (a `fill` parent changes their room).

## Fences

Write only: `public/imagine/research/page.js`, `public/imagine/generated/page.js`, `public/imagine/cms/page.js` (and its own `.css` if one exists), this task dir. Never `ext/`, `core/`, or the critique page. Budget ~150k tokens.
