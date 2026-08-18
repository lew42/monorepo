# Layout space — a layout is a string: type one and see it on five screens at once, or give `gen()` an integer and get one. The sampler and search behind the layouts rail, for anyone authoring a layout.

## Use
```js
import { render } from "./spec.js";
import { gen } from "./gen.js";
render(gen(7, { depth: 3, chaos: 0.2 }));   // the same layout forever — an integer is an address
```
A line is `<class tokens> > <part> [count]`; indentation is nesting; a token holding `:` is a declaration. The grammar: [`doc/syntax.md`](./doc/syntax.md).

## Watch out
- A background tab never fits — `ruler.js` rides a ResizeObserver, so a hidden tab (every MCP `eval`) reads five identical max-content shots; take geometry from `mcp__site__shot` or headless Playwright — [`doc/decisions.md`](./doc/decisions.md)
- A screen is a width AND a height: a `fill` page with no height has nothing to divide and its `scroll` never engages — [`doc/syntax.md`](./doc/syntax.md)
- `scroll` belongs to the row, `stick` needs `align-self: flex-start`, `fluid` is not `flex-1` — the format's own words are position-sensitive, and nesting multiplies them — [`doc/syntax.md`](./doc/syntax.md)
- A seed is a citation inside one version of the model: retuning a weight re-addresses the whole space. Keep the text (the url hash carries it), not the seed — [`doc/decisions.md`](./doc/decisions.md)
- A broken range discriminates beautifully, because it measures its own defect — distrust a suspiciously clean ranking; point it at hand-made work first — [`doc/decisions.md`](./doc/decisions.md)
- Refitting `SHAPES` off the search plateaus (tied within noise, held-out agrees); the remaining points are in `width-used`/`measure` emission, and 38% is structural — [`doc/decisions.md`](./doc/decisions.md)
- `tone` is translucent on purpose and cannot be `wash`/`tint`/`surface`: the theme ladder is opaque, so nesting would not composite — [`doc/syntax.md`](./doc/syntax.md)
- `data-layout-ignore` goes on the miniature, not the wall around it — an ignored wall hides its own text and reads as one gap; the seed tiles are the exception, a tile being only a miniature — [`doc/decisions.md`](./doc/decisions.md)
- `render()` marks its root `default`; `Page.css` hides any `.page` the Router did not mark, and nothing throws — [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/styles/layouts/space/) · [Words](/framework/styles/layouts/space/words/) · [Compose](/framework/styles/layouts/space/compose/) · [Hunt](/framework/styles/layouts/space/hunt/)
- [`doc/syntax.md`](./doc/syntax.md) — the grammar in one page · [`doc/decisions.md`](./doc/decisions.md) — the record: why text, the model/chaos/tone verdicts, three hunt runs and the plateau, the preset ratings, the phase-2 open list · `doc/file/*.md` — one note per source file, the page's Files tab
- Files that matter: `spec.js` (text → live view), `gen.js` (seed → text), `model.js` (shapes, roles, weights), `ruler.js` (five screens, one scale), `presets.js` (nine named strings), `search.js` (roll, rate, credit)
