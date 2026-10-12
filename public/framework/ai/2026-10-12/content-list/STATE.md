# content-list: state (2026-10-12)

Step 1 of [content.md](../../core/Page/doc/content.md) is built and ready to merge: [what was built](../../core/Page/doc/content-list-step-1.md), live at [/framework/core/Page/content/](/framework/core/Page/content/). Branch `worktree/content-list`.

## Proof

- **Baseline vs new, 56 pages** (40 sampled, 10 string/address, jsonl-content pages; 4 widths on the main ones; fixed page clock): **0 state diffs, 0 error diffs.** The only text/outline/screenshot differences are ones the unchanged code also shows against itself (same code run twice: 18 text, 10 screenshot diffs, all sidebar ordering races and live chrome), plus the intended edit to `address-2`'s doc line.
- **Targeted A/B, old vs new code, same minute, on the pages that looked suspicious** (`/framework/core/Page/`, `/framework/ai/2026-10-12/`, `page-split-2`): old and new match exactly at all widths. The `/framework/core/Page/` 1920/3440 screenshot differs between two runs of the *old* code too (live chrome).
- **New ability**: [both/](/framework/core/Page/content/both/) shows the class's `content()` (heading and paragraph) and the jsonl paragraph as two rows.
- **smoke.mjs**: clean except `/framework/ai2/live/`, which 404s `directory.json` and `ai/2026-10-11/*.jsonl`. Those files are gitignored in this worktree, nothing the change touches.
- **stream-proof.mjs**: heading 13 ms, card 34 ms, text 31 ms. `update` and `title` steps report NOT SEEN with the old code too (identical result), so no change.
