# site-diff — one command that shows what changed on the site since the last landing

Before this, a shared CSS change was proven by opening six pages by hand and hoping. This
script shoots a set of real pages headless, twice, and tells you the difference: which pages'
pictures changed, how much, and whether anything actually broke (a new console error, or a
page that now scrolls sideways).

## Use

Two commands, run from this directory (or point node at the full path):

```
node site-diff.mjs baseline --out <dir>
node site-diff.mjs compare  --baseline <dir> --out <dir>
```

`baseline` shoots 40 representative pages at two widths (1280 and 3440) against the shared dev
server and saves a screenshot per page-per-width plus a `manifest.json` describing them.
`compare` shoots the exact same set again — read out of the baseline's own manifest, so it can
never quietly drift onto a different page list — and writes `report.json` plus a table to your
terminal: pixels changed, new console errors, new sideways scroll, worst pages first.

**⚠ Where the baseline dir goes: your scratchpad, never this repo.** A baseline is a folder of
PNGs from one moment — the mastermind keeps its running baseline under its own session
scratchpad and re-points `compare --baseline` at it after every landing. Nothing here writes
inside `public/` except the two source files and this readme.

```
node site-diff.mjs baseline --out C:/Users/…/scratchpad/site-diff/before-landing
…do the landing…
node site-diff.mjs compare --baseline C:/Users/…/scratchpad/site-diff/before-landing --out C:/Users/…/scratchpad/site-diff/after-landing
```

The command exits non-zero only when something got **worse** — a new console error or new
sideways scroll appeared somewhere. A changed picture alone is not a failure; a person still
looks at the PNGs (`report.json` lists which files, sorted worst-pixels-first) and decides if
the change was the point of the landing.

## Options

- `--widths 1280,3440` — override the widths (baseline only; compare reuses whatever the
  baseline shot).
- `--pages <n>` — shoot fewer or more than the default 40. Below 40, the first `n` of the
  curated list. Above 40, the curated 40 plus more of the real site (see `--all`).
- `--all` — every page the site can actually route to (568+ of them — the same walk
  `core/Search/Search.js` does over `/directory.json`, reimplemented here so this script stays a
  plain Node file). Slow; use for an occasional full sweep, not every landing.
- `--server http://localhost:8123` — which server to shoot (default: the shared dev server).
- `--inject "css text"` — adds this CSS to **every** page before the screenshot. Built for
  proving the tool itself works (see below), and just as useful for asking "if I ship this one
  rule, which pages does it actually touch?" before you ship it.

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
   link-*lightest* land at the bottom (`/imagine/design/size/`, `/imagine/design/controls/`),
   proving the ranking really tracks how much of a page the change actually touched. **19.8s.**

Both real runs came in well under the 90-second budget for 40 pages × 2 widths.

## Watch out

- Playwright resolves from the **global** npm install
  (`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`), never a
  project dependency — this repo deliberately has none. Never search the disk for it.
- `compare` always shoots the page list **out of the baseline's own manifest**, never a freshly
  computed one — if the default 40 changes later, an old baseline still compares against exactly
  what it originally shot.
- A missing page is an HTTP 200 in this framework (the SPA fallback serves `index.html` and
  renders "Page Load Error" inside it) — the script checks the rendered DOM for that, not just
  the HTTP status, the same trap `vision/run.mjs` already worked around.
