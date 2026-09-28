# Question — an ask, a text field, the latest answer beneath

A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: question / answer — [shapes](/framework/ux/Content/doc/shapes.md).

## Use
```js
import Question from "/framework/ux/Content/Question/Question.js";
new Question({ id: "q-1", ask: "…", hint: "…", log })
```
`export default` the class, everything from one data object — so a page.jsonl `place` line can construct it.

## Watch out
- Writes: Servex `/card/append?id=` for a card host, else the dev socket's `append`; nothing when `edit()` is off.
- The demo writes to `demo.jsonl` here, never a real log.

## More
- [Live demo](/framework/ux/Content/Question/) · [shape](/framework/ux/Content/Question/doc/shape/)
