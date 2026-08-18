# DesignTool — measures a layout numerically: what is BROKEN, what is OFF, what is GOOD. For pages, the layout generator, and the site audit — no AI at runtime.

## Use
```js
import { analyze, frame, rate } from "/framework/ext/DesignTool/DesignTool.js";
import { sweep } from "/framework/ext/DesignTool/sweep.js";

analyze(document.querySelector(".page.active-page"));   // → findings, severest first — no score
rate(document.querySelector(".page.active-page"));      // → { score, grade, bands, weakest } — the only tier that scores
frame("/framework/styles/layouts/grid/", 3440);         // → the same report, in an iframe at 3440
sweep("/framework/", { from: 360, to: 3440 });           // → the widths where behaviour changes
```

## Watch out
- `analyze()` reports no score on purpose — the old average rewarded emptiness; only `taste/` grades: [doc/decisions.md](./doc/decisions.md)
- Run `analyze()` after layout settles — inside `content()` it measures a half-built page; `frame()` waits 350ms: [doc/decisions.md](./doc/decisions.md)
- `vision.js`'s `ask()` only from a click handler — a paid screenshot per call, and the rail re-measures on every resize: [doc/decisions.md](./doc/decisions.md)
- `probe.IGNORE` skips demo stages, so 73 urls are graded on their chrome; `probe().ignored` says how much: [doc/decisions.md](./doc/decisions.md)
- The walk stops at `depth = 20` — `ext/Panel/` loses a quarter of its tree; raising it is a RULE#1 call: [doc/decisions.md](./doc/decisions.md)
- A rule that fires on the common case is wrong — six of thirteen needed a guard: [knowledge/false-positives.md](./knowledge/false-positives.md)
- A headless sweep that "hangs in `analyze()`" is Chrome wedging after ~85–110 navigations — recycle the context every ~40: [doc/decisions.md](./doc/decisions.md)

## More
- [What the layout work taught us](./doc/learned.md) — measured facts, what keeps breaking, what to do next
- [`knowledge/`](./knowledge/) — the lessons, one file each: ratios, thresholds, false positives, blind spots, bounds, widescreen, characters per line, alignment vs padding, ideal ranges, responsive
- [`library/`](./library/) — eleven arrangements the site is built from, measured live; `library/bad/` is the ten don'ts
- [`audit/`](./audit/) — the whole site, ranked (`findings.json` is a generated baseline) · [`tests/`](./tests/) — twenty-three layouts with a declared verdict
- [`vision/`](./vision/) — the AI tier: a headless runner that shoots pages and regions, asks one fresh model session per image, and logs prose + findings a line at a time
- [`taste/`](./taste/) — the third tier: eleven ideal ranges, weighted — the only score here
- [`doc/decisions.md`](./doc/decisions.md) — the record: decisions, open questions, every trap in detail · [`doc/cost.md`](./doc/cost.md) — ~25µs a node, and the quadratic trap · [`doc/addressing.md`](./doc/addressing.md) — a finding's address is a path, not an index
- Page: [/framework/ext/DesignTool/](/framework/ext/DesignTool/) · Files: `DesignTool.js` (the front door), `probe.js` (the browser read), `rules.js` (what is broken), `polish.js` (what is off)
