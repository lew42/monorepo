# Tabs — a bar of links and the panel its children mount into; `this.tabs()` on every `Page`, for pages that flip *between* children

## Use

```js
import "/framework/ext/tabs/tabs.js";          // once, anywhere — app.js already does

content(){ this.tabs("guide api"); }          // children by name; the first is the default panel
this.tabs("guide api").ac("vertical");       // same set as a left rail; .ac("block") for folder tabs
```

A set is **flush and seamless** by default (the owner, 2026-09-06): a strip of labels, a
hairline under the set, a 2px accent under the selected tab, and the panel below it with no box
of its own. `.ac("bounded")` asks for the rectangle instead — a fill, a frame and a radius on
the panel, with the selected tab cut out of its top edge.

## Watch out

- Flush is the default and `.bounded` is the one word for the rectangle — the reverse of the 2026-09-05 call, and nothing on the site asks for the box today (`.underline` still parses and names the default) — [doc/decisions.md](./doc/decisions.md)
- A tab wears the **control grammar's metrics** (2026-09-06) — the same font-size, `min-height: 2.4em` and padding as a button or a field, so a strip lines up with a toolbar and `.size-small` shrinks both. Its skin stays its own. [/framework/ui/controls/](/framework/ui/controls/)
- Only the first `tabs()` on a page can own the parent's url; two sets sharing a child name collide silently — [doc/decisions.md](./doc/decisions.md)
- A tab bar suits a page with no prose of its own whose children flip *between* and fit its measure; otherwise `previews()` — [doc/usage.md](./doc/usage.md)
- A bar is one strip that scrolls, never a wrapping block; past ~fifty members it is untested — [doc/overflow.md](./doc/overflow.md)
- A nested set with no `app` never highlights on a cold load; anything rendering links late owes `mark_links()` — [doc/decisions.md](./doc/decisions.md)
- Under a stand-in app (`demo.app`) `[aria-current]` is the third selected mark — [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/ext/tabs/) — live demos: the default strip, `.block`, `.vertical`
- [doc/decisions.md](./doc/decisions.md) — placement not marking, nest pages not sets, the quiet default, `.block`/`--tab-fill`, traps, caller census
- [doc/usage.md](./doc/usage.md) — which page earns a tab bar (the four-condition test)
- [doc/overflow.md](./doc/overflow.md) — one strip that scrolls; the hidden-scrollbar bargain
- [doc/extraction.md](./doc/extraction.md) — why it left `core/Page`: measurements, options weighed
- `doc/method/tabs.md`, `doc/file/*.md` — API and per-file notes, rendered by the `Doc` page
- Files: `tabs.js` (the prototype patch), `tabs.css` (three shapes, tokens), `page.js` (demos, Doc index)
