# content-list: state (2026-10-12)

Step 1 of [content.md](../../core/Page/doc/content.md) is built and ready to merge: [what was built](../../core/Page/doc/content-list-step-1.md), live at [/framework/core/Page/content-shapes/](/framework/core/Page/content-shapes/). Branch `worktree/content-list`.

## Proof

- **Baseline vs new, 56 pages** (4 widths on the main ones, fixed page clock): **0 state diffs, 0 error diffs.**
- **Noise floor**: the same code run twice already differs on 18 text and 10 screenshot checks (sidebar ordering races, live chrome); old vs new shows no more than that, plus the intended doc edit on `address-2`.
- **Targeted A/B, old vs new code, same minute, on the pages that looked suspicious** (`/framework/core/Page/`, `/framework/ai/2026-10-12/`, `page-split-2`): old and new match exactly at all widths. The `/framework/core/Page/` 1920/3440 screenshot differs between two runs of the *old* code too (live chrome).
- **New ability**: [both/](/framework/core/Page/content-shapes/both/) shows the class's `content()` (heading and paragraph) and the jsonl paragraph as two rows.
- **smoke.mjs**: clean except `/framework/ai2/live/`, which 404s `directory.json` and `ai/2026-10-11/*.jsonl`. Those files are gitignored in this worktree, nothing the change touches.
- **stream-proof.mjs**: heading 13 ms, card 34 ms, text 31 ms. `update` and `title` steps report NOT SEEN with the old code too (identical result), so no change.

## Review (fresh Opus, first pass) and what changed

- **Index page showed nothing below its heading** and the sidebar listed it twice under the wrong url (`/page-content-every-shape/`): the fixture lacked `meta: import.meta`. Fixed; the folder is now `core/Page/content-shapes/` (a child named `content` also clashes with `page.content`), and the index lists every child with a link.
- **`part-text` row is a white card at 1200 and plain text at 1920**: unchanged behaviour of the rows code moved verbatim from `render_content_list` (`part-text` has no View of its own). Left as is; not part of step 1.
- **Tab bar wraps on `/framework/core/Page/`**: present before this change too.
