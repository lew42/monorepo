# Gallery — browsable lists of everything, built from pages that live elsewhere

Every card here is a foreign `page.js`, imported by path and drawn with its own
`preview()`. Nothing in this directory is a child of anything in this directory, and
nothing crawls: each list is an array of paths.

## Use

```js
import { wall, body, load } from "/imagine/gallery/foreign.js";

wall(["/framework/styles/layouts/mail/"]);                       // cards, linking home
wall(paths, { address: page => "/my/url/" + page.name + "/" });  // cards, linking to ME
wall(paths, { plain: true });                                    // title + description only
body("/framework/core/Page/overview/prose/");                    // that page's BODY, here
```

## Watch out

- A list past ~8 cards (`lists/page.js`: Layouts, Column shapes, Recipes) gets a title
  filter above the wall — client-side, over the titles `wall()` already draws, nothing
  crawled or stored. The three six-card lists skip it; there is nothing to filter yet.
- One import is a whole subtree — 19 modules and 3 stylesheets for one page, measured.
  Open a list per column, never all six at once.
- Never `add()` a foreign page: `move()` rewrites its url and its real address dies.
- Never `render()` one either — `view` is cached, and the original loses its body.
- The `Arrange` names are routed, not declared. A declared name never reaches `route()`.
- `classes: "default"` on a column you also navigate to hides it. See
  [`doc/decisions.md`](./doc/decisions.md).
- `width: "full"` on the top index would hide `/imagine/`'s own hub rail the whole time
  you're in here — tried, reverted, stayed `"large"`. Same doc.
- Lists/Answers/Cards each carry a `thumb.jpg` beside their `page.js`, shown by a
  `preview(nav)` override — a picture, never a live instance. Regenerate one with the
  scratch script named in [`doc/decisions.md`](./doc/decisions.md) if that page's own
  look changes; nothing rebuilds it for you.

## More

- [Gallery](/imagine/gallery/) · [Answers](/imagine/gallery/answers/) ·
  [Cards](/imagine/gallery/cards/)
- The findings, written for everyone: [`core/Page/doc/previews.md`](/framework/core/Page/doc/previews/)
- Files that matter: `foreign.js` (the three calls), `lists/page.js` (the data arrays),
  `gallery.css` (the proposed card restyle, scoped to `.gal-flat`), each child's
  `thumb.jpg` (its card's picture, on the Gallery index and on Lists' own)
