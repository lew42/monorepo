# layout-check: read a page in horizontal bands (minion brief)

Parent: mastermind-page. The owner, 12:35 (owner-words.md in the parent folder, "Continued"): screenshot every page at mobile up to "mega", and read each screenshot as horizontal bands from top to bottom: is each band the right size, does it have the right padding (stacked padding counts), is anything wrapping when it shouldn't? "There's no source of truth", so make the obvious parts MEASURABLE.

## The job
Extend `Server/layout-check.mjs` (don't write a new tool) with a `--bands` flag. With `--bands`, the default widths become `400,1200,1920,3440`, and for each url and width it also measures:

1. **tab_rows**: for every tab bar (`.tab-bar`, `[role=tablist]`), the number of distinct rows its visible tabs sit on (group by rounded `top`). Flag if > 1 at 400, or > 1 at 1200 and up.
2. **left_stack**: the padding stacked at the content's left edge. Take the first visible `h1`, and the first visible `p` in the main content (not the site sidebar). For each, walk its ancestors up to `body` and list every one that adds horizontal space on the left (`padding-left + border-left-width + margin-left > 0`): `{cls, px}`. Report the total and the list. At 400, a total over 32px is a flag. This is "the tab area has padding, then a card has its own padding, then its inner box".
3. **bands**: the page's top-level vertical stack, down to about 3 screen heights. Start at the active page's content box, descend through single-child wrappers, and take the children stacked vertically. For each band: `{cls, y, h, share}` (share = h / viewport height), plus `ink`, the fraction of the band's area with text, image or control under it (reuse the existing 40x25 sampler, restricted to the band). Flag a band with `share > 0.25` and `ink < 0.15` as "big and empty".
4. **wraps**: elements meant to sit on one line, such as `.tab`, `button`, nav/rail links, `h1`–`h3`, chips and labels: any whose height is > 1.6× its computed line-height. List up to 10 as `{tag, cls, text (first 30 chars), lines}`.

Write them into the existing per-url `layout.json` under each width, and print one line per url per width: `400  tabs:3 rows  left:56px (4 layers)  bands:7 (1 big-empty)  wraps:4`. Exit code unchanged (errors/overflow only): the new numbers inform, they don't fail a merge.

Also save full-page screenshots, capped at 3 viewport heights, when `--bands` is on (the band reading needs to see below the fold).

## How
- Work in a worktree: `node Server/worktree-up.mjs layout-bands`. Commit there, then `node Server/merge.mjs <worktree> --skip-smoke --no-review "<why>"` (the smoke test fails on uncommitted AI 2 card dirs that aren't in any worktree; that failure is known and has nothing to do with this change). Then `node Server/worktree-down.mjs layout-bands`.
- Prove it on 3 pages against the MAIN site (`--base`-style full urls on `http://monorepo.localhost`): `/framework/core/Page/`, `/framework/ai2/`, `/framework/core/View/` (a class doc page with many tabs). Check that tab_rows at 400 is > 1 on a many-tab page, and read one screenshot yourself to confirm the numbers match what you see.
- Update the header comment of `layout-check.mjs` (it's the doc) with the new flag, in the same style.

## Never
Never edit any other file under Server/ or public/. Never `git stash/checkout/reset` in the main tree.

## Return
At most 8 lines: the command, what the 3 test pages measured (one line each), the merge commit.
