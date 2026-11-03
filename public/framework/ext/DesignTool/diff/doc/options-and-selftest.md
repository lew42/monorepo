# diff — options, masking, measures, self-test (moved from the readme)

<!-- moved verbatim from readme.md lines 53-102, 2026-10-12 readme audit -->
## The default 40

One of each *kind* of page, not a random sample, so a shared-CSS change that breaks one kind of
page shows up even without `--all`: the homepage; the four realms besides blog and notes
(Framework, Web, Imagine, Résumé); the paging front, its library, and one mechanism; the layout
tree plus one layout; one Doc-built page; one Research page; the blog front and one post; the
notes wall and two notes; the platform hub and its MVP; the size, spacing and controls pages;
and a spread of eighteen `styles/layouts/*` pages. The full list is the `PAGES` array at the top
of `site-diff.mjs` — read it there rather than here, so it can never go stale in two places.

## What gets masked

A `.panel-t-clock` (the live clock on `/framework/`, and anywhere else a Panel clock is
embedded) ticks every second — measured twice a minute apart it would report as "changed" on
every single run for a reason that has nothing to do with anyone's edit. `site-diff.mjs` paints
every match a flat grey **before** the screenshot, on both the baseline and the compare shot, so
it disappears from the diff entirely rather than merely tolerating it. Add a line to the `MASKS`
array at the top of the script for the next thing that ticks on its own.

## What each run measures, per page per width

- **Pixels changed** — the current screenshot compared to the baseline's, pixel by pixel, inside
  a headless browser tab (a `<canvas>` does the compare — no image-diff library needed, since
  Playwright is already a browser). A few pixels of font anti-aliasing jitter do not count; the
  threshold is in `pixelDiff()`.
- **Console errors** — every `console.error` and thrown error the page raised, counted before
  and after; `new_console_errors` is what makes the exit code non-zero.
- **Sideways scroll** — `document.documentElement.scrollWidth` vs `clientWidth`; a page that
  didn't scroll sideways in the baseline and does now is a regression, not a stylistic choice.
- **Framed boxes at x:0** — how many elements sit flush against the very left edge of the
  viewport *and* paint something (a background or a border) there. This is the "bled wall" and
  "fat nav" shape of bug from the brief — a box that reaches the edge on purpose is fine, a
  count that jumps after a landing is worth a look.

## Self-test — proving it actually catches something (run 2026-09-06)

1. `baseline` against the shared server: 40 pages × 2 widths = 80 shots in **13.1s**, 0 console
   errors.
2. `compare` against that same baseline, nothing else changed: **0 of 40 pages changed**, 0 new
   errors, in **18.4s**. Even `/framework/` — home of the live clock — reported a flat 0-pixel
   diff, because the mask paints an identical grey box both times rather than merely tolerating
   drift.
3. `compare --inject "a { text-decoration: underline !important; }"` against the same baseline:
   **40 of 40 pages changed** (nearly every page has a link) — but sorted by pixels changed, the
   link-*heaviest* pages land at the top (`/imagine/paging/library/`, `/blog/`, `/`) and the
   link-*lightest* land at the bottom (`/framework/styles/system/studies/size/`, `/framework/ui/controls/study/`),
   proving the ranking really tracks how much of a page the change actually touched. **19.8s.**

Both real runs came in well under the 90-second budget for 40 pages × 2 widths.

