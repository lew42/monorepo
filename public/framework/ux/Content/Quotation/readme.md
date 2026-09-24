# Quotation — one owner prompt: words, time, how, and a link

A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: prompt — [shapes](/framework/ux/Content/doc/shapes/).

## Use
```js
import Quotation from "/framework/ux/Content/Quotation/Quotation.js";
new Quotation({ text, raw, at, via, url })  // or { id, log } to read and merge
```
`export default` the class, everything from one data object — so a page.jsonl `place` line can construct it.

## Watch out
- Writes: Servex `/card/append?id=` for a card host, else the dev socket's `append`; nothing when `edit()` is off.
- The demo writes to `demo.jsonl` here, never a real log.

## More
- [Live demo](/framework/ux/Content/Quotation/) · [shape](/framework/ux/Content/Quotation/doc/shape/)
