# Library — eleven arrangements the site is built from, live and measured, and the ten ways to get them wrong beside them

## Use
```js
import { entry, run_all, measured, finding, widths_table } from "/framework/ext/DesignTool/library/entry.js";
import { patterns } from "/framework/ext/DesignTool/library/patterns.js";

// entry(spec) turns one pattern (or one don't) into a page: declaration,
// live specimen, a live score that follows the window, and the same
// specimen measured at 400/1280/1920/3440.
```

## Watch out
- `patterns.js` and `bad/traps.js` each define their own small `cards(n, style)` helper — nearly identical, on purpose: a "don't" and the pattern that replaces it are meant to be read side by side, not share an import that could drift the demo out from under either page.
- The body an entry measures is `.dt-case-body`, not the page — the title, prose and live rail are furniture the pattern itself never draws.

## More
- [`bad/`](./bad/) — the ten don'ts: the same shape, deliberately broken, each naming the rule it trips and the entry above that replaces it.
- Page: [/framework/ext/DesignTool/library/](/framework/ext/DesignTool/library/) · quality tier: [`../taste/`](../taste/) · the whole tool: [`../`](../)
- Files: `entry.js` (`entry()`, `measured()`, `widths_table()` — shared by `library/` and `widths/`) · `page.js` (the wall + whole-library run) · `patterns.js` (the eleven catalog entries)
