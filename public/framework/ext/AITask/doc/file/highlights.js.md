The highlights wall on `/framework/ai/` — the cards, their day groups, and the
`Show more` both walls share.

`marked(list)` keeps every task whose manifest carries a usable `highlight`
(a `title` and a `url`) and sorts it newest first; `highlights(list)` groups
those by day, heads each run with a link to that day's board, and draws 100
before the button appears. `more(chunk, left, next)` is exported because
`dashboard.js`'s log spine wants the same button with a different chunk.

The field itself, what earns one, the six icons, and the traps:
[`doc/highlights.md`](/framework/ext/AITask/doc/highlights.md).
