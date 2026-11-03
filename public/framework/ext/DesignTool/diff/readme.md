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

- Moved verbatim to [doc/options-and-selftest.md](./doc/options-and-selftest.md): options, masking, measures, self-test.
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
