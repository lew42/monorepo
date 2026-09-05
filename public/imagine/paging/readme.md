# paging — one configurable page, six building blocks, twelve ready-made shapes. The realm is an app: a rail that never moves, and a middle that swaps

Open [/imagine/paging/](/imagine/paging/). A real page is on the stage; the bar above it
has every word that page is made of, one labelled dropdown each. Change one and the page
changes. Pick another shape from the rail. That is the whole thing.

**The configuration is in the address, in the words the bar shows you.** Every change writes
itself into the url (`?navigation=rail&page-colour=tint`), so the page you are looking at is
always the page the url names — copy it, send it, open it cold and you get the same page. The
key is the label a reader sees; the old `surface`/`background`/`type` keys are still read, so
saved links keep working. `url.js`.

**One vocabulary, one file format.** The seven words are the same seven everywhere: the bar
over a stage, the drawer, the url, and both editors write them into one `mode` object in one
`page.json`. `config_of()` in [`blocks.js`](./blocks.js) is the only thing that reads it.

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

- `stage()` draws the page, the bar above it and the way into the drawer. Every configured
  page in the realm is this one call — the [library](/imagine/paging/library/)'s twelve
  presets, the block pages, every cell of [Cross](/imagine/paging/cross/), the pages you
  [make](/imagine/paging/make/), and the middle column of [Build](/imagine/paging/build/).
- **Two seams for what a word cannot say**: `draw` puts your own thing IN the box (a template
  family, a built page's blocks); `draw_child` draws a child's panel. `pages:` is which children
  the navigation word draws — hand it your own or it draws four samples.
- The vocabulary is [`blocks.js`](./blocks.js) and it imports nothing, so a page, a rail
  tile, a chip, a url and a doc all read the same lists.
- **Two colour controls, independent**: `surface` paints the content box, `background`
  paints the page behind it. Each is a dropdown with a dot beside it in the colour it
  is currently on — the one control whose value is a thing rather than a word.
- The drawer (**More**) holds the link to this exact page, the full form with a sentence
  per value, the JSON, **the `page.js` this would be**, **nest** — any of the twelve presets
  *or any url*, including a page you made — and **make this a page**, which takes a name you
  type and writes a real `page.json` to disk in dev.

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
- **The bar is labelled with the SIX BLOCKS, in the rail's order** — five of them own one
  word each and SKIN holds its three under one heading, so the rail, the bar and the address
  say the same words. (A [library](/imagine/paging/library/) page gets one more, *page shape*,
  naming the ready-made page you are on.) No width is written anywhere: a `<select>` in a flex
  row shrinks below its content, which is why the bar's old selects clipped their own values —
  `flex: none` on the control, and no `padding` shorthand (it takes away the reserve the
  browser draws the arrow in).
- **A `<pre>` inside a flex column collapses to nothing.** `.drawer-body` is `flex v` and a
  `<pre>` scrolls, so its automatic minimum height is 0 — the drawer's `page.js` box was 22px
  tall holding nineteen lines. `flex: none` on the wrapper, and let the box scroll itself.
- **A stable navigation word reserves the box's height** (`.paging-nav-reserve`), so the
  caption under the stage can say "the box did not move" and be right. `columns` and
  `takeover` are the dynamic words and report the pixels they really moved ·
  [navigation](/imagine/paging/navigation/)
- **`?...` belongs to the page named by the url you ARRIVED on** — the address the browser
  opened, or the link you clicked. Not `location.pathname` (core pushes the address after the
  page draws, so mid-navigation it is still the page you left) and not "the first stage that
  asks" (the app's home page is built on every cold load, even when a deep child is what you
  opened) · `url.js`
- **A page here is built once and then shown again.** Core caches it and `activate()`
  re-appends the view it already has, so a stage that read the address when it was built shows
  that answer for ever. `Paging.activated()` re-reads it on arrival; the app's FRONT page never
  activates at all (core only activates what changed) so `Realm` watches for a click on its own
  url instead · `paging.js`
- Six old directories are gone; their urls answer with one line saying where they went
  (`route()` in `page.js`). Delete a row when nothing points at it.

## More

- [The realm](/imagine/paging/) · [the library](/imagine/paging/library/) ·
  [Docs](/imagine/paging/doc/) — [decisions](/imagine/paging/doc/decisions/) ·
  [the four mechanisms](/imagine/paging/doc/mechanisms/) ·
  [persistence](/imagine/paging/doc/persistence/) ·
  [templates](/imagine/paging/doc/templates/) · [builder](/imagine/paging/doc/builder/)
- Files that matter: `blocks.js` (the vocabulary) · `stage.js` (**the one renderer**, the
  builder's middle column included since 2026-09-05 — [how](/imagine/paging/doc/builder/)) ·
  `presets.js` (the twelve) · `paging.js` (the app, and the base class) ·
  `rail.js` (the nav grids) · `toolbar.js` (the bar of chips) · `url.js` (the address) ·
  `config.js` (the drawer)
- Next door: [/imagine/layouts/](/imagine/layouts/) owns the numbered arrangements;
  [/imagine/shells/](/imagine/shells/) owns app chrome; [/imagine/sections/](/imagine/sections/)
  owns the full-width bands; [templates](/imagine/paging/templates/) is the eleven shapes the
  rest of the site already ships.
- [Cross](/imagine/paging/cross/) — **pick any two of the seven words** and every pair of
  values is a live page; the other crossing is
  [the theming wall](/imagine/paging/templates/theming/).
- Two readings, linked from [Docs](/imagine/paging/doc/) and nowhere else:
  [critique](/imagine/paging/critique/) · [inventory](/imagine/paging/inventory/).
