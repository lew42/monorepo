# Decision — an ask, options with caveats, one chosen and changeable

A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: decision / chose (and old task.jsonl decisions) — [shapes](/framework/ux/Content/doc/shapes/).

## Use
```js
import Decision from "/framework/ux/Content/Decision/Decision.js";
new Decision({ id: "d-1", ask: "…", options: [{ say, caveat }], why, log })
```
`export default` the class, everything from one data object — so a page.jsonl `place` line can construct it.

## Watch out
- Writes: Servex `/card/append?id=` for a card host, else the dev socket's `append`; nothing when `edit()` is off.
- The demo writes to `demo.jsonl` here, never a real log.

## More
- [Live demo](/framework/ux/Content/Decision/) · [shape](/framework/ux/Content/Decision/doc/shape/)
