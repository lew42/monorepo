# paging — one configurable page, six building blocks, twelve ready-made shapes. The realm is an app: a rail that never moves, and a middle that swaps

Open [/imagine/paging/](/imagine/paging/). A real page is on the stage; the bar above it
has every word that page is made of, one labelled dropdown each. Change one and the page
changes. Pick another shape from the rail. That is the whole thing.

**The configuration is in the address.** Every chip you press writes itself into the url
(`?navigation=rail&content=dashboard`), so the page you are looking at is always the page
the url names — copy it, send it, open it cold and you get the same page. `url.js`.

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

- `stage()` draws the page, the bar of chips above it and the way into the drawer. There is no
  second renderer — the [library](/imagine/paging/library/)'s twelve presets, the block
  pages and the pages you [make](/imagine/paging/make/) are all this one call.
- The vocabulary is [`blocks.js`](./blocks.js) and it imports nothing, so a page, a rail
  tile, a chip, a url and a doc all read the same lists.
- **Two colour controls, independent**: `surface` paints the content box, `background`
  paints the page behind it. Each is a dropdown with a dot beside it in the colour it
  is currently on — the one control whose value is a thing rather than a word.
- The drawer (**More**) holds the link to this exact page, the full form with a sentence
  per value, the JSON, **the `page.js` this would be**, **nest** (any preset inside this
  one) and **make this a page**, which writes a real `page.json` to disk in dev.

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
- **The bar may never cover the demo.** It was `position: absolute` over the stage's top
  edge until 2026-09-05, revealed on hover — so pointing at the front page's tab strip
  made the bar appear on top of it and the tab could not be clicked at all, at any width.
  It is a sibling above the stage now and it reserves its height.
- **Seven dropdowns, and no width written anywhere.** Chip groups for 40 values sprawled
  four rows deep; dropdowns fit one row at 3440 and two at 1280. A `<select>` in a flex
  row shrinks below its content, which is why the bar's old selects clipped their own
  values — `flex: none` on the control, and no `padding` shorthand (it takes away the
  reserve the browser draws the arrow in).
- **A stable navigation word reserves the box's height** (`.paging-nav-reserve`), so the
  caption under the stage can say "the box did not move" and be right. `columns` and
  `takeover` are the dynamic words and report the pixels they really moved ·
  [navigation](/imagine/paging/navigation/)
- **`?...` belongs to the page the ENTRY url names** — not to `location.pathname` (core
  pushes the address after the page draws, so mid-navigation it is the page you left) and
  not to "the first stage that asks" (the app's home page is built on every cold load,
  even when a deep child is what you opened) · `url.js`
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
  `rail.js` (the nav grids) · `toolbar.js` (the bar of chips) · `url.js` (the address) ·
  `config.js` (the drawer)
- Next door: [/imagine/layouts/](/imagine/layouts/) owns the numbered arrangements;
  [/imagine/shells/](/imagine/shells/) owns app chrome; [templates](/imagine/paging/templates/)
  is the eleven shapes the rest of the site already ships.
- [Cross](/imagine/paging/cross/) — two words at once, nine live pages; the other
  crossing is [the theming wall](/imagine/paging/templates/theming/).
- Two readings, linked from [Docs](/imagine/paging/doc/) and nowhere else:
  [critique](/imagine/paging/critique/) · [inventory](/imagine/paging/inventory/).
