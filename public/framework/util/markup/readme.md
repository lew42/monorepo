# markup — an element's children as readable HTML source, for anyone showing a demo's output

## Use

```js
import { markup } from "/framework/util/markup/markup.js";

markup(view.el);   // → indented, readable HTML text; walks the live DOM
```

## Watch out

- Nothing is escaped — the renderer does that once; escaping here prints `&amp;lt;div&amp;gt;` on the page: [doc/design.md §5](./doc/design.md)
- `<pre>`/`<textarea>` are copied verbatim, however long — re-indenting changes what renders: [doc/design.md §4](./doc/design.md)
- A serialized `<a>` may carry classes you didn't write (`Router` adds `.in-path`) — kept on purpose: [doc/design.md §6](./doc/design.md)
- Three "which tags are inline" lists exist (`markup`, `ext/markdown`, `ext/highlight`) and agree only by coincidence: [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/util/markup/) — the demo, the rules table, why not `innerHTML`
- [`doc/design.md`](./doc/design.md) — the design record: seven questions, options weighed, verdicts
- [`doc/decisions.md`](./doc/decisions.md) — the old readme's decisions, traps and open items, verbatim
- Files that matter: `markup.js` (the whole serializer), `page.js` (the browsable intro)
