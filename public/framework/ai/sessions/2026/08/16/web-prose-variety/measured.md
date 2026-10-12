# Measured: web.js prose variety

## Headline

**The `repetition` band cannot be moved by changing `web.js`'s text, and this
run proves it two ways.** `taste/read.js`'s `repetition()` groups siblings by
`probe.js`'s `label(el)` — element tag plus its first three CSS classes —
never by text content. A wall of N `div.flex.v.gap` sections is "repeated" to
that measurement whatever their paragraphs say. Confirmed by an isolated
Playwright probe (six identically-classed boxes with identical text vs. six
with entirely distinct text: both scored `repetition: 1`), and confirmed again
here — **`repetition` is bit-for-bit identical, before vs. after, on every one
of the 46 measurements below.** The prose change was made anyway (a design
system demo with one repeated sentence is worth fixing on its own merits, and
it caused zero `analyze()` regressions), but it does not and cannot do what
the dispatch asked of it.

## Method

23 pages (every child of `styles/layouts/page.js`'s `children:` string, read
from the live `Map` at runtime — not hand-typed) × 2 widths (1280, 3440) = 46
runs, each via `dualFrame()` (an iframe built the same way `LayoutTool.js`'s
own `frame()` does: `data-layout-ignore`, `max-width: none`, 350ms settle),
probing once per run and calling `analyze()` and `rate()` on the same model.
Headless Playwright (global install, `file://…/playwright/index.mjs`) against
the dev server already on port 80, `window.$BLOCKRELOAD = true` set via
`addInitScript` before every navigation. BEFORE was captured with `web.js`
untouched; AFTER after the edit below. Scripts and raw JSON:
`C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\c6315543-dde2-46c6-b052-c819794f42e8\scratchpad\{measure.mjs,results-before.json,results-after.json,compare.mjs,probe-test.mjs}`
(scratchpad — not part of this deliverable, per RULE#12).

## Aggregate (median across all 46 runs)

| | before | after |
|---|---|---|
| `repetition` | 0.894 | 0.894 — **identical on every single row** |
| `measure` | (per-page, see table) | **identical on every single row** |
| `rate()` score | 51 | 52 |
| `analyze()` score | 84 | 84 — **identical on every single row, zero regressions** |
| `analyze()` high count | 0 (1 on `fit`@3440, unchanged) | 0 (1 on `fit`@3440, unchanged) |

## Per-page, per-width

| page | width | rate before→after | repetition before→after | measure before→after | analyze before→after | high |
|---|---|---|---|---|---|---|
| model | 1280 | 71→67 | 0.965→0.965 | 62.95→62.95 | 74→74 (C→C) | 0→0 |
| model | 3440 | 71→66 | 0.965→0.965 | 62.95→62.95 | 68→68 (D→D) | 0→0 |
| fit | 1280 | 63→67 | 0.962→0.962 | 47.9→47.9 | 81→81 (B→B) | 0→0 |
| fit | 3440 | 62→66 | 0.962→0.962 | 47.9→47.9 | 69→69 (D→D) | 1→1 |
| flex | 1280 | 57→57 | 0.892→0.892 | 38.2→38.2 | 83→83 (B→B) | 0→0 |
| flex | 3440 | 51→51 | 0.892→0.892 | 37.8→37.8 | 82→82 (B→B) | 0→0 |
| grid | 1280 | 48→56 | 0.823→0.823 | 19→19 | 81→81 (B→B) | 0→0 |
| grid | 3440 | 48→56 | 0.823→0.823 | 19→19 | 74→74 (C→C) | 0→0 |
| space | 1280 | 47→47 | 0.979→0.979 | 78.5→78.5 | 69→69 (D→D) | 0→0 |
| space | 3440 | 51→51 | 0.979→0.979 | 78.9→78.9 | 69→69 (D→D) | 0→0 |
| 400 | 1280 | 50→50 | 0.958→0.958 | 57.9→57.9 | 84→84 (B→B) | 0→0 |
| 400 | 3440 | 58→58 | 0.958→0.958 | 65.7→65.7 | 71→71 (C→C) | 0→0 |
| document | 1280 | 55→55 | 0.877→0.877 | 67.4→67.4 | 84→84 (B→B) | 0→0 |
| document | 3440 | 55→63 | 0.877→0.877 | 67.4→67.4 | 83→83 (B→B) | 0→0 |
| docs | 1280 | 51→51 | 0.886→0.886 | 56→56 | 84→84 (B→B) | 0→0 |
| docs | 3440 | 61→61 | 0.886→0.886 | 56→56 | 83→83 (B→B) | 0→0 |
| landing | 1280 | 40→40 | 0.876→0.876 | 17.5→17.5 | 86→86 (B→B) | 0→0 |
| landing | 3440 | 38→38 | 0.876→0.876 | 17.5→17.5 | 84→84 (B→B) | 0→0 |
| hero | 1280 | 55→55 | 0.888→0.888 | 61.95→61.95 | 86→86 (B→B) | 0→0 |
| hero | 3440 | 57→57 | 0.888→0.888 | 61.95→61.95 | 84→84 (B→B) | 0→0 |
| pricing | 1280 | 36→36 | 0.917→0.917 | 93.15→93.15 | 86→86 (B→B) | 0→0 |
| pricing | 3440 | 44→44 | 0.917→0.917 | 93.2→93.2 | 88→88 (B→B) | 0→0 |
| stack | 1280 | 57→57 | 0.886→0.886 | 66.3→66.3 | 86→86 (B→B) | 0→0 |
| stack | 3440 | 59→59 | 0.886→0.886 | 66.4→66.4 | 84→84 (B→B) | 0→0 |
| shell | 1280 | 52→52 | 0.904→0.904 | 58.05→58.05 | 86→86 (B→B) | 0→0 |
| shell | 3440 | 60→56 | 0.904→0.904 | 55.55→55.55 | 84→84 (B→B) | 0→0 |
| dashboard | 1280 | 34→34 | 0.881→0.881 | 13→13 | 84→84 (B→B) | 0→0 |
| dashboard | 3440 | 45→53 | 0.881→0.881 | 13→13 | 84→84 (B→B) | 0→0 |
| split | 1280 | 34→34 | 0.869→0.869 | 13.2→13.2 | 86→86 (B→B) | 0→0 |
| split | 3440 | 40→47 | 0.869→0.869 | 13.2→13.2 | 84→84 (B→B) | 0→0 |
| overlay | 1280 | 53→53 | 0.901→0.901 | 69.7→69.7 | 81→81 (B→B) | 0→0 |
| overlay | 3440 | 61→61 | 0.901→0.901 | 63.9→63.9 | 84→84 (B→B) | 0→0 |
| gallery | 1280 | 33→33 | 0.894→0.894 | 13.4→13.4 | 86→86 (B→B) | 0→0 |
| gallery | 3440 | 45→53 | 0.894→0.894 | 13.5→13.5 | 84→84 (B→B) | 0→0 |
| sidebar | 1280 | 59→59 | 0.856→0.856 | 69→69 | 86→86 (B→B) | 0→0 |
| sidebar | 3440 | 59→59 | 0.856→0.856 | 69→69 | 84→84 (B→B) | 0→0 |
| masonry | 1280 | 42→42 | 0.837→0.837 | 43.3→43.3 | 79→79 (C→C) | 0→0 |
| masonry | 3440 | 52→52 | 0.837→0.837 | 43.3→43.3 | 79→79 (C→C) | 0→0 |
| feed | 1280 | 37→37 | 0.896→0.896 | 17.9→17.9 | 86→86 (B→B) | 0→0 |
| feed | 3440 | 40→40 | 0.896→0.896 | 17.9→17.9 | 84→84 (B→B) | 0→0 |
| carousel | 1280 | 43→43 | 0.912→0.912 | 80.9→80.9 | 86→86 (B→B) | 0→0 |
| carousel | 3440 | 52→52 | 0.912→0.912 | 78.4→78.4 | 84→84 (B→B) | 0→0 |
| mail | 1280 | 35→35 | 0.898→0.898 | 13.1→13.1 | 84→84 (B→B) | 0→0 |
| mail | 3440 | 45→49 | 0.898→0.898 | 13.1→13.1 | 83→83 (B→B) | 0→0 |
| chat | 1280 | 37→37 | 0.919→0.919 | 19.2→19.2 | 86→86 (B→B) | 0→0 |
| chat | 3440 | 45→45 | 0.919→0.919 | 19.2→19.2 | 84→84 (B→B) | 0→0 |

## Regression check

`analyze()` score, grade and high-count are **identical on all 46 rows** — the
gate the dispatch named holds cleanly. `rate()`'s aggregate score (11 bands,
`repetition` and `measure` both frozen) moved by a few points on some rows in
both directions — `model` fell 4–5 points, `shell`@3440 fell 4; `grid`,
`dashboard`@3440, `split`@3440, `gallery`@3440, `mail`@3440 and `document`@3440
rose 6–8. That movement comes entirely from bands this run didn't isolate
(likely `slivers`, `depth` or `contrast`, all sensitive to exact text length),
is small, and runs both directions — not the regression the dispatch was
watching for, but worth naming rather than rounding to "unchanged."

## Why cards() and tiles() were left alone

The dispatch's finding said `cards`, `tiles` and `notes` all "repeat one
`blurb`." Read against the actual code: `cards()` shows a topic word, a
number, and a wash bar — no `blurb` text at all. `tiles()` has no text
whatsoever (pure decoration, which is also why `repetition`'s own `texts`
filter never counts it). Only `sections()`, `rows()` and `notes()` genuinely
drew `site.blurb` N times; those three were the ones changed.
