# Elements — the reference for every element `framework.css` styles (and the ones it doesn't), for anyone writing plain HTML with the factories

## Use

```js
import { demo, h2, p, ul, li } from "/app.js";
demo(() => { h2("A section"); p("Plain HTML, no classes."); ul(() => { li("one"); li("two"); }); });
```

Zero classes and it already looks finished — that is the claim `@layer theme` makes; the
seven child pages (text, lists, code, table, forms, media, misc) prove it element by element.

## Watch out

- Every quoted value was read out of `framework.css`, not remembered — if a page and the file disagree, the file is right and the page is a bug; the surprises found there: [`doc/framework-css.md`](./doc/framework-css.md).
- Findings get recorded, not shipped — a doc page is not a licence to change `framework.css`; the eviction candidates live in [`doc/framework-css.md`](./doc/framework-css.md).
- No stylesheet here or in any child; a fixture that needs a size says so inline, at the call site — [`doc/decisions.md`](./doc/decisions.md).
- `text/` demos a real `h1()`, so that document has two `<h1>`s — knowingly: [`doc/decisions.md`](./doc/decisions.md).
- No `Ctrl+F` across seven pages; if it bites, add a flat all-elements page, never merge — [`doc/decisions.md`](./doc/decisions.md).

## More

- [Overview](/framework/styles/elements/) · [`doc/decisions.md`](./doc/decisions.md) — why seven pages, `demo()` for everything, unstyled elements covered too, the no-stylesheet record · [`doc/framework-css.md`](./doc/framework-css.md) — what surprised us in `framework.css`, recorded not fixed
- `doc/file/*.md` — one note per file: this `page.js`, this readme, and each child's `page.js`
- Files that matter: `page.js` (index and routing table), `<group>/page.js` (one `demo()` per element), `/framework/styles/framework.css` (the only source of truth)
