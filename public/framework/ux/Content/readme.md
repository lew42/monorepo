# Content — cards that remember: Question, Decision, Quotation, Disclosure

Each one is a `ux/` class that reads one `.jsonl` log and appends to it. The data shapes come first; the look is a template on top.

## Index

[Decision](./Decision/) — an ask with options, one chosen and changeable  
[Disclosure](./Disclosure/) — a title that opens into a section, built on native details  
[Question](./Question/) — an ask, a text field, and the latest answer beneath  
[Quotation](./Quotation/) — one owner prompt with its words, time and a link  
[Spend](./Spend/) — dollars over time drawn as SVG, no library  
[catalog](./catalog/) — every kind of box drawn live, grouped by family  
[plan](./plan/) — how the 75 kinds of box shrink to 36, drawn live

## Use
```js
import Decision from "/framework/ux/Content/Decision/Decision.js";
new Decision({ id: "d-1", ask: "…", options: [{ say: "A", caveat: "…" }], log: "/…/x.jsonl" });
```
A page places one with a single line: `{"place": {"module": "/framework/ux/Content/Decision/Decision.js", "id": "d-1", …}}`.

## Watch out
- **Writes go two ways.** A card host POSTs to Servex `/card/append?id=`; anything else (or a failed POST) uses the dev socket's `append`. With `edit()` off, a click shows locally and writes nothing — [`ContentModule.js`](/framework/ux/Content/) `write()`.
- **Latest line wins.** Answers and choices are never rewritten; a new line for the same id replaces the old one on screen and the old one stays in the log.
- **Demos never persist.** Each doc page writes to its own `demo.jsonl` in its folder; delete it to start over.
- **Never `.text()` on a Quotation** — its data field `text` shadows View's method.

## More
- [Card catalog](/framework/ux/Content/catalog/) — every card kind on the site, drawn live, duplicates marked
- [Built from lines](/framework/ux/Content/built/) — a page that is only a `page.jsonl`: prose plus the three modules
- [Question](/framework/ux/Content/Question/) · [Decision](/framework/ux/Content/Decision/) · [Quotation](/framework/ux/Content/Quotation/) · [record shapes](/framework/ux/Content/doc/shapes/)
