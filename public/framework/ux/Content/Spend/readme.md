# Spend — dollars over time, in about 100 lines of SVG

A [Content](/framework/ux/Content/) module. It fills its width, is 190px tall, and needs no library.

## Use
```js
import Spend from "/framework/ux/Content/Spend/Spend.js";
new Spend({ task: "2026-09-25/css-audit" });        // or tasks: [...] (summed), or points: [{ t, usd }]
```
One page.jsonl line: `{"place": {"module": "/framework/ux/Content/Spend/Spend.js", "task": "2026-09-25/css-audit"}}`. Optional `from` / `to` (ISO) scope the range.

## Watch out
- **Static data.** It reads `spend.json` in the task folder, written by `node Server/task-cost.mjs` (each run refreshes it); never Servex.
- Bars are dated by when a turn *started*, so a long turn shows at its start.

## More
- [Live demo](/framework/ux/Content/Spend/) · [Content](/framework/ux/Content/)
