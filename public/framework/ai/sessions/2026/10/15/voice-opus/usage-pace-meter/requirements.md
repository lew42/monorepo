# Usage meters: a pace-relative variant (captured, not started)

## The owner's words (voice, 2026-10-15, question d738360b, relayed)

> He likes the existing usage meters and their accuracy; do NOT clobber them. He wants a NEW variant alongside them that reflects the pace-relative view we just added to the text line. Problem: early in the week cycle, with narrow bars, the pacing arrow sits near the start and the used fraction of that space is only a few pixels, so the relative usage isn't visualizable. He'd like variants of the progress bar that show relative-to-pace usage while still conveying pace. Possibly multiple variants to explore.

## What exists

- The text line: `Server/usage-now.mjs` prints "At N% of pace with T left (advice)" (landed today, commit 838917916).
- The meters: `ai/AITask/usage.js` (`usage_rail`), used by `ai/AITask/dashboard.js`. Leave them untouched.

## The ask

Several new meter variants, side by side with the existing one on a demo page, each showing used÷pace (100% = on pace) while still conveying where pace is. Put the variants where page-ui-templates decides UI pieces live (see `../page-ui-templates/requirements.md`). Sonnet; worktree; check_page at the four widths; merge.
