# Paging — what a click does, and what the page looks like while it does it

Every page on this site is three things: an **icon**, some **content**, and a list of
**children** you can click. A *page system* is the two decisions taken on top of that shape —
where a child goes when you click it, and what the surface looks like while it goes there.
This realm takes those two decisions apart so you can try them on.

Live: [/imagine/paging/](/imagine/paging/) — the hub shows all four mechanisms as small live
examples you can click before reading anything.

## Where to start

1. [Examples](/imagine/paging/examples/) — five pages, each with the result and the code that
   made it side by side. Every one changes exactly ONE word from the one above it.
2. [Sizes](/imagine/paging/sizes/) — press a chip, watch the same box grow, read the caption
   that says what changed in pixels.
3. [Make](/imagine/paging/make/) — type a name, pick three words, get a real page at a real
   url. Nothing is written to disk.

## Use

```js
import { Paging, leaf } from "/imagine/paging/paging.js";

export default new Paging({
    meta: import.meta,
    takeaway: "**One sentence saying what this page is for.**",   // drawn first, by lede()
    axes: "mech style",                                           // which chip groups show
    mode: { mech: "expand", style: "tint" },                      // where it opens
    children: [ leaf("Alpha", "What it says when you open it.") ],
    content(){ this.lede(); this.paging(); },                     // takeaway, then the stage
});
```

## The vocabulary

| mechanism | what a click does | icon |
|---|---|---|
| `launch` | a new column to the RIGHT; this page stays | `chevron_right` |
| `expand` | a panel BELOW, in place; the item grows | `expand_more` |
| `swap` | the box keeps its place and changes what it holds | `swap_horiz` |
| `takeover` | the whole row; every page behind it becomes a crumb | `open_in_full` |

Styles: `plain` `card` `tint` `prim` `dark`. Content: `xs` `s` `m` `l` `xl` — **and each rung
keeps everything the smaller ones showed**. Layout: `center` `column` `wide` `full`. Toolbar
placement: `top left right bottom` × `inside` `outside`. All of it in one file, `words.js`.

## Watch out

- **`launch` and `takeover` are core's columns words**, not new machinery — a child column and
  `width: "full"`. Nothing here reimplements either: [`doc/mechanisms.md`](/imagine/paging/doc/mechanisms.md)
- **A child's track is its PARENT's mechanism**, so only a page whose toolbar offers `mech` can
  hand a child the whole row: [`doc/mechanisms.md`](/imagine/paging/doc/mechanisms.md)
- **The layout axis derives its default from the page's own `width`** — declared `full` plus an
  axis defaulting to `column` contradicted each other and the declaration lost silently
  (a takeover rendered at 241px): [`doc/decisions.md`](/imagine/paging/doc/decisions.md)
- **A chip is a span, not a `<button>`.** The site theme styles every button as an uppercase CTA
  at (0,2,0) and wins whatever a component says: [`doc/decisions.md`](/imagine/paging/doc/decisions.md)
- **Never name a `View` field `on`** — it shadows `View.on()`, the event binder, and throws three
  frames away on the parent page. It is `chosen`: [`doc/decisions.md`](/imagine/paging/doc/decisions.md)
- **`.cols` weights cannot be set from this stylesheet.** `.cols > *` is `@layer util` and
  `paging.css` is `@layer theme`, which loses at any specificity — `--cols-w` goes inline:
  [`doc/decisions.md`](/imagine/paging/doc/decisions.md)
- **Import the blog's `posts.js`, never its `Post.js`** — the class loads `blog.css`, which
  re-sizes every `.page-previews` on the page: [`doc/decisions.md`](/imagine/paging/doc/decisions.md)
- `expand` and `swap` have **no url** — they are gestures inside one box, and every one offers
  the column as the way out: [`doc/decisions.md`](/imagine/paging/doc/decisions.md)
- Centring is `margin-block: auto`, never `justify-content: center` — a column body is a
  scroller, and a centred flex line clips its own top edge.

## More

- [`doc/persistence.md`](/imagine/paging/doc/persistence.md) — what is remembered, the one key
  shape (`lew42:paging:<url>`), the RESET button and its proof, the CRUD store contract
- [`doc/mechanisms.md`](/imagine/paging/doc/mechanisms.md) — the four, how each is built, what
  was measured at 1280 and 3440
- [`doc/decisions.md`](/imagine/paging/doc/decisions.md) — the record: every verdict, the
  2026-09-04 clarity rebuild with its before/after numbers, what was rejected, what is open
- The rest of the realm: [Mechanisms](/imagine/paging/mechanisms/) · [Styles](/imagine/paging/styles/) ·
  [Center](/imagine/paging/center/) · [Transitions](/imagine/paging/transitions/) ·
  [Toolbars](/imagine/paging/toolbars/) · [Right nav](/imagine/paging/rightnav/) ·
  [Explorer](/imagine/paging/explorer/) · [Inventory](/imagine/paging/inventory/) ·
  [Critique](/imagine/paging/critique/)
- Files: `words.js` (the vocabulary and the storage namespace, imports nothing) ·
  `samples.js` (the additive sample ladder, and the real built things in it) ·
  `demos.js` (the hub's four miniatures) · `paging.js` (the `Paging` class and its four parts) ·
  `paging.css` · `page.js` (the hub) · `examples/` · `make/`
- The columns vocabulary this stands on: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md)
