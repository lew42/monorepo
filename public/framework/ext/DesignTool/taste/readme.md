# Taste — the third DesignTool tier: eleven weighted ideal ranges that rank two CLEAN layouts (`rules.js` says BROKEN, `polish.js` says OFF). For the layout generator's search and the site audit.

## Use
```js
import { rate } from "/framework/ext/DesignTool/taste/taste.js";

rate(document.querySelector(".page.active-page"));
// → { score, grade, bands, weakest, covered, read, of, ignored, mostly_picture }
```

## Watch out
- Nothing here proposes a fix or fires a finding — a low band means "further from centre", not "wrong"; a rating ranks, only a rule repairs: [doc/decisions.md](./doc/decisions.md)
- `score` is `null` (grade `—`) when no band read — rankers skip null, never sort it last; read `covered` and `mostly_picture` beside any grade: ≥ 50% skipped means the tool was blindfolded, not that the layout is bad: [doc/decisions.md](./doc/decisions.md)
- A missing range is dropped, not scored zero — the divisor moves with it, and every band gates on a minimum sample (`enough()`): [doc/decisions.md](./doc/decisions.md)
- A band that models a rule must copy the rule's GUARDS, not just its maths — `frame-gap` and `measure` each shipped without them and read wrong for a day: [doc/decisions.md](./doc/decisions.md)
- A broken range discriminates beautifully — three did, each by its own defect; a suspiciously clean ranking is the first thing to distrust: [doc/decisions.md](./doc/decisions.md)
- Fix the population before you touch a threshold — `measure`'s IQR was fitted to contaminated text and looked right by cancellation: [../knowledge/ideal-ranges.md](../knowledge/ideal-ranges.md)
- Every length is read at its own scale (`own()`/`space` in `read.js`); `gap-share` cannot reuse `ratios.gaps()`, which bails on grids: [doc/decisions.md](./doc/decisions.md)
- `corpus/` validates the ORDER, not the PLACE, and its count moves with every retune — quote it with a date or not at all: [doc/decisions.md](./doc/decisions.md)

## More
- [Overview](/framework/ext/DesignTool/taste/) · [Corpus](/framework/ext/DesignTool/taste/corpus/) — pairs, one named break each, judged on the band the case names; two are expected to fail
- [`doc/decisions.md`](./doc/decisions.md) — the whole record: why a rating not a rule, the refit, the second wave, the 2026-08-17 re-derivations, what is open (`frame-gap` reads the nav rail site-wide — the owner's call)
- [`../knowledge/ideal-ranges.md`](../knowledge/ideal-ranges.md) — where every number came from, every rejected candidate; rendered at [knowledge/](/framework/ext/DesignTool/knowledge/)
- `doc/file/*.md` — one note per file, the page's Files tab
- Files that matter: `ranges.js` (the rulebook; `AUTHOR` for writers), `read.js` (eleven ratios, one probe), `taste.js` (`rate()`, front door), `corpus.js` (the pairs)
- Used by: `styles/layouts/space/` (gen · search · page), `dev/DevBar/layout.js`
