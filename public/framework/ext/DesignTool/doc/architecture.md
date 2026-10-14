# DesignTool architecture — measure numerically, three tiers, no AI at runtime

DesignTool measures a layout and tells you what is broken, what is off, and what is good. It is for pages, the layout generator and the site audit. `probe.js` reads the browser once into one flat array of facts; `rules.js`, `polish.js` and `taste/` each read that array. The front door is [`DesignTool.js`](./DesignTool.js) (`analyze`, `rate`, `frame`).

## One browser read, three tiers on top
**Decided:** `probe.js` walks the DOM once; `rules.js` (BROKEN), `polish.js` (OFF, capped at medium severity) and `taste/` (GOOD) all read that same array.
**Why:** one walk costs about 25µs a node, and separate walks would disagree about the same page.
**Instead:** each tier measuring for itself: slower, and the tiers could not be compared.
**Detail:** [doc/cost.md](./doc/cost.md)

## `analyze()` returns no score
**Decided:** `analyze()` returns a ranked census of findings, severest first; only `rate()` in `taste/` grades.
**Why:** the old average counted findings, findings scale with content, so it rewarded emptiness and ran opposite to how pages look.
**Instead:** a single page score: easy to read, measurably wrong.
**Detail:** [doc/decisions.md](./doc/decisions.md)

## No AI at runtime
**Decided:** every threshold is dimensionless and fixed; vision calibrated them and is not in the loop.
**Why:** a model call per page is a paid, slow, non-repeatable measurement.
**Instead:** a model as the detector: better at seeing, worse at counting.
**Detail:** [knowledge/thresholds.md](./knowledge/thresholds.md)

## Vision is a click-only second opinion
**Decided:** `vision.js` calls `ask()` only from a click handler, with tools limited to `Read,Glob,Grep`.
**Why:** each call is a paid screenshot ($0.03–0.17), the rail re-measures on every resize, and a typed prompt must not be able to write to the repo.
**Instead:** a timer or observer trigger (a bill wired to a resize), or a writable tool set.
**Detail:** [vision/](./vision/)

## Ratios, not pixels
**Decided:** thresholds are ratios (text-to-edge over font-size, characters per line, track bounds).
**Why:** a pixel rule that is right at 1280 is wrong at 3440; the ratio holds at every width.
**Instead:** per-width pixel limits.
**Detail:** [knowledge/ratios.md](./knowledge/ratios.md)

## A rule that fires on the common case is wrong
**Decided:** a rule that flags ordinary layouts gets a guard (inline, `contents`, scrollers, crops, shells, code boxes are skipped).
**Why:** six of thirteen rules needed one; each came from running the analyzer on this site.
**Instead:** lowering severities to hide the noise.
**Detail:** [knowledge/false-positives.md](./knowledge/false-positives.md)

## Widths by bisection
**Decided:** `sweep.js` takes a coarse stride, then bisects to find the widths where behaviour changes.
**Why:** a robust layout changes signature at a handful of widths, and an edge nobody chose is the finding.
**Instead:** a check at every pixel: far too slow.
**Detail:** [knowledge/responsive.md](./knowledge/responsive.md)

## A finding is addressed by path, not index
**Decided:** `address.js` locates a finding by its element path.
**Why:** an index shifts whenever the page re-renders.
**Instead:** array index: breaks the moment a node is added.
**Detail:** [doc/addressing.md](./doc/addressing.md)

## The audit baseline is generated and uncapped
**Decided:** `audit/findings.json` is written by a headless Playwright pass; each row keeps an uncapped compact `rules` summary and the page re-measures a row live when opened.
**Why:** a live run is 168 iframe loads; an earlier cap hid the worst finding on 89 rows, and a full-detail file reached 2MB on a static site.
**Instead:** a capped list (hides findings) or full detail (too heavy).
**Detail:** [audit/readme.md](./audit/readme.md)

## Headless runs recycle the browser
**Decided:** a headless sweep starts a fresh browser context about every 40 navigations and imports the module in its own call.
**Why:** Chrome wedges after roughly 85–110 navigations and looks like a hang inside `analyze()`.
**Instead:** one long-lived context: stalls partway through the corpus.
**Detail:** [doc/decisions.md](./doc/decisions.md)

## Run after layout settles
**Decided:** call `analyze()` once layout has settled; `frame()` waits 350ms by default.
**Why:** inside `content()` the page is half built and the numbers are wrong.
**Instead:** measuring eagerly.
**Detail:** [doc/decisions.md](./doc/decisions.md)

## The walk stops at `depth = 20`
**Decided:** `probe()` defaults to `depth = 20` and `max = 4000` nodes, and skips demo stages via `IGNORE`.
**Why:** it bounds cost; demo stages would otherwise be graded as pages.
**Instead:** an unbounded walk: `ext/Panel/` loses a quarter of its tree at 20, and raising it is a rule-level call.
**Detail:** [doc/decisions.md](./doc/decisions.md)
