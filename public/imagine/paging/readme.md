# paging — one configurable page, six building blocks, twelve ready-made shapes. The realm is an app: a rail that never moves, and a middle that swaps

Open [/imagine/paging/](/imagine/paging/). Point at the page on the stage and a toolbar
appears; pick another shape from the rail. That is the whole thing.

## The six blocks

Everything in this realm is one of these, or a preset made out of them.

| block | what it is |
| --- | --- |
| [Stage](/imagine/paging/stage/) | the box a click changes the inside of. It never moves. |
| [Navigation](/imagine/paging/navigation/) | what a click on a child does, and how the children are drawn |
| [Content](/imagine/paging/content/) | what is in the box |
| [Room](/imagine/paging/room/) | how much of the screen the box gets |
| [Arrangement](/imagine/paging/arrangement/) | where the page's other parts sit around the box |
| [Skin](/imagine/paging/skin/) | the colours and the type size |

## Use

A page in the realm is seven words and one call.

```js
import { Paging } from "/imagine/paging/paging.js";

export default new Paging({
    meta: import.meta,
    title: "A dashboard",
    content(){
        this.lede("One sentence saying what to do.");
        this.stage({ navigation: "rail", content: "dashboard", room: "wide",
                     arrangement: "bar-top", surface: "card", background: "tint", type: "compact" });
    },
});
```

- `stage()` draws the page, its hover toolbar and the way into the drawer. There is no
  second renderer — the [library](/imagine/paging/library/)'s twelve presets, the block
  pages and the pages you [make](/imagine/paging/make/) are all this one call.
- The vocabulary is [`blocks.js`](./blocks.js) and it imports nothing, so a page, a rail
  tile, a chip, a url and a doc all read the same lists.
- **Two colour controls, independent**: `surface` paints the content box, `background`
  paints the page behind it. The hover toolbar has both as rows of swatches.
- The drawer (`ext/drawer`) holds the full form, the JSON, **nest** (any preset inside
  this one) and **make this a page**, which writes a real `page.json` to disk in dev.

## Watch out

- **A demo never persists.** A refresh puts every page here back to what it ships as.
  Only [Make](/imagine/paging/make/) and [Build](/imagine/paging/build/) save, and they
  say so out loud · [doc/persistence.md](./doc/persistence.md)
- **The realm is not a columns row.** `Paging.column_host()` returns nothing, so a page
  here is a plain page in the app's middle — that is what makes a deep link change one
  thing instead of opening two columns · [doc/decisions.md](./doc/decisions.md)
- **A View's class name IS a CSS class.** `View.classify()` lowercases every constructor
  in the chain, so a class called `Stage` wore the framework's own `.stage` word and
  shrink-wrapped itself to 307px inside a 1546px frame, silently. Names here are
  `PagingStage` / `PagingToolbar` · [doc/decisions.md](./doc/decisions.md)
- **Set a View's fields before `super.initialize()`** — `View.initialize()` IS the render.
- **A field shadows a method.** `card`, `opens`, `chosen`, `nested` have each bitten this
  realm; core's `Page.nav()` reads `this.card`, so a method of that name throws on every
  preview · [doc/decisions.md](./doc/decisions.md)
- **A child with `container-type: inline-size` may not be sized by its own contents** —
  one that also carries `align-self: start` collapses to 0px inside a flex column
  (`blog.css`'s `.blog-hero`). `.paging-canvas > *` stretches them back.
- Six old directories are gone; their urls answer with one line saying where they went
  (`route()` in `page.js`). Delete a row when nothing points at it.

## More

- [The realm](/imagine/paging/) · [the library](/imagine/paging/library/) ·
  [Docs](/imagine/paging/doc/) — [decisions](/imagine/paging/doc/decisions/) ·
  [the four mechanisms](/imagine/paging/doc/mechanisms/) ·
  [persistence](/imagine/paging/doc/persistence/) ·
  [templates](/imagine/paging/doc/templates/) · [builder](/imagine/paging/doc/builder/)
- Files that matter: `blocks.js` (the vocabulary) · `stage.js` (the one renderer) ·
  `presets.js` (the twelve) · `paging.js` (the app, and the base class) ·
  `rail.js` (the nav grids) · `toolbar.js` (the hover bar) · `config.js` (the drawer)
- Next door: [/imagine/layouts/](/imagine/layouts/) owns the numbered arrangements;
  [/imagine/shells/](/imagine/shells/) owns app chrome; [templates](/imagine/paging/templates/)
  is the eleven shapes the rest of the site already ships.
- Older records kept for the links that point at them, not part of the realm:
  [critique](/imagine/paging/critique/) · [inventory](/imagine/paging/inventory/).
