# Decision — an ask, options with caveats, one chosen and changeable

A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: decision / chose (and old task.jsonl decisions) — [shape](/framework/ux/Content/Decision/doc/shape/).

## Use
```js
import Decision from "/framework/ux/Content/Decision/Decision.js";
new Decision({ id: "d-1", ask: "…", options: [{ say, caveat }], why, log })
```
`export default` the class, everything from one data object — so a page.jsonl `place` line can construct it.

**Every decision in a log, ranked and nested:** place `Decisions.js` — `{"place":{"module":"/framework/ux/Content/Decision/Decisions.js"}}`. Rank 1 first; a child decision sits below its parent's options, under "If <option> → then decide:". A click writes a `chose` line, and the latest one is the decision ("Decided by …"). The records come from `Server/decide.mjs` (its detail: `Server/doc/decide.md`), which walks each one step by step.

## Watch out
- Writes: Servex `/card/append?id=` for a card host, else the dev socket's `append`; nothing when `edit()` is off.
- The demo writes to `demo.jsonl` here, never a real log.
- Write a decision with decide.mjs, not by hand — it is what guarantees rank, caveats, confidence and sources are all there.

## More
- [Live demo](/framework/ux/Content/Decision/) · [shape](/framework/ux/Content/Decision/doc/shape/)
