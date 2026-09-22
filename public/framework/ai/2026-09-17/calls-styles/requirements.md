# calls-styles — two calls made, built into the standard: `--gap` caps at 2.4em so `--flow` never crosses under it, and the five-rung ladder is the ladder, with the two-rung alternative documented

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one number changes; one paragraph documents). Clear beats brief by far. Prioritize.
**Length budget:** your landing report is one screen with the 3440 numbers before and after.

## The owner's words (2026-09-18, 00:55)

> for those things that you said are my calls, the spacing ladder, the column count, just make a decision and document the alternative, or make a toggle that switches between each one. I don't want you to wait and not implement something because you're the mastermind. Make the call.

The mastermind's calls (decision lines in `ai/2026-09-17/mastermind-layout-browser/task.jsonl`, ids `spacing-ladder` and `flow-gap-crossing`):

1. **`--gap`'s cap goes from 2.6em to 2.4em** in `public/framework/framework.css`'s standard block (`--gap: calc(clamp(1em, 1.5cqi - 0.3em, 2.6em) * var(--size))` → `2.4em`), so `--flow` (cap 2.5em) is never smaller than `--gap` at any width. The floor and the slope are untouched; 1280 does not move (prove it: `--gap` in px at 1280 before and after, identical). The alternatives — raising `--flow`'s cap to 2.7em (breaks the owner's 1.5× paragraph-gap verdict of 2026-09-13), or defining `--flow` from `--gap` — go in `public/framework/styles/doc/decisions.md` as a dated entry, and the crossing sentence on `/framework/styles/system/` (the two bars that crossed at 3440) becomes a sentence that says they no longer cross, with the numbers.
2. **The ladder is five rungs.** On `/framework/styles/system/`, one click down (the record fold or its decisions doc, wherever the census already sits), one paragraph: the mastermind chose five (`--gap`, `--gap-70/-50/-35/-25`, 83% of the census within 15%); the alternative is two rungs (`--gap` and `--flow`, standard and section — the owner's Figma instinct), which covers 27% and would move about seven in ten scaled values by more than 15%; the case it wins: a brand-new site with no existing spacing to fit. Nothing on level 1 changes.

## Prove it

- Headless on your private server (`PORT=8116 node server.js`, background, killed by its real Windows PID): read `--gap` and `--flow` in px off a probe div (paint the token on it; `getPropertyValue` returns the clamp text — the layout caveat) at 400 / 1280 / 1920 / 2400 / 3440 before and after; the after table has `--flow ≥ --gap` in every row and the 400 / 1280 rows identical to before.
- Then 20 pages at 3440 before and after (`/`, `/framework/`, `/framework/styles/system/`, `/layouts/browse/`, `/layouts/practice/*`, `/imagine/`, `/imagine/paging/`, `/framework/ai/`, the blog front, and ten more you pick from the sitemap): for each, the count of wrapped rows in `.flex.wrap` and `.grid.auto` walls (a row count change is a layout change) — expect zero changes; report any.
- Two numbers that must agree: pages crawled before and after.

## Rules

- Load `css` (read framework.css 220–250 yourself), `layout`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/calls-styles/`); `documentation` then `finish-task`. Write the two calls as `decision` lines in your log quoting the mastermind's ids.
- **Fence:** the ONE number in `public/framework/framework.css`, `public/framework/styles/system/**` (the crossing sentence, the ladder paragraph), `public/framework/styles/doc/decisions.md`, your task dir. Nothing else.
- ⚠ framework.css is live on the owner's dev server (port 80 is listening — never touch it; LiveReload pushes your edit to the owner's tabs): one write, then load a page headless within a minute and read the console. Never `git stash`, never `find /`, never drive the owner's tabs.
- Landing: `outcome` = a headline, the five-width table, the 3440 crawl verdict, the links, what was left and why. One screen.
