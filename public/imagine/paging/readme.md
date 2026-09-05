# Paging — what a click does, and what the page looks like while it does it

Every page on this site is three things: an **icon**, some **content**, and a list of
**children** you can click. A *page system* is the two decisions taken on top of that shape —
where a child goes when you click it, and what the surface looks like while it goes there.
This realm takes those two decisions apart so you can try them on.

Live: [/imagine/paging/](/imagine/paging/) — the hub shows all four mechanisms as small live
examples you can click before reading anything.

**The design rule of this realm:** *a click changes what is inside a rectangle you could already
see; the rectangle stays.* Every swap here happens on a bounded stage you can point at before
you touch it — that is most of the difference between a switch that feels easy and one that
makes you ask "what went where?" ([the argument](/imagine/paging/doc/decisions/)).

## Where to start

1. [Examples](/imagine/paging/examples/) — five pages, each with the result and the code that
   made it side by side. Every one changes exactly ONE word from the one above it.
2. [Sizes](/imagine/paging/sizes/) — press a chip, watch the same box grow, read the caption
   that says what changed in pixels.
3. [Make](/imagine/paging/make/) — type a name, get a real page at a real url, and in dev a
   real `page.json` on disk. Four words configure it; one of them turns its children into tabs.

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
  `width: "full"`. Nothing here reimplements either: [`doc/mechanisms.md`](/imagine/paging/doc/mechanisms/)
- **A child's track is its PARENT's mechanism**, so only a page whose toolbar offers `mech` can
  hand a child the whole row: [`doc/mechanisms.md`](/imagine/paging/doc/mechanisms/)
- **The layout axis derives its default from the page's own `width`** — declared `full` plus an
  axis defaulting to `column` contradicted each other and the declaration lost silently
  (a takeover rendered at 241px): [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- **A chip is a span, not a `<button>`.** The site theme styles every button as an uppercase CTA
  at (0,2,0) and wins whatever a component says: [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- **Never name a `View` field `on`** — it shadows `View.on()`, the event binder, and throws three
  frames away on the parent page. It is `chosen`: [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- **`.cols` weights cannot be set from this stylesheet.** `.cols > *` is `@layer util` and
  `paging.css` is `@layer theme`, which loses at any specificity — `--cols-w` goes inline:
  [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- **Import the blog's `posts.js`, never its `Post.js`** — the class loads `blog.css`, which
  re-sizes every `.page-previews` on the page: [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- `expand` and `swap` have **no url** — they are gestures inside one box, and every one offers
  the column as the way out: [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- Centring is `margin-block: auto`, never `justify-content: center` — a column body is a
  scroller, and a centred flex line clips its own top edge.

- **A swap needs an edge before you click it.** `.paging-box:has(.paging-items-swap)
  .paging-shown` frames the stage; `mechanisms/swap/`'s four-visual stage has a FIXED height
  because it claims its rectangle never moves. ⚠ Its outgoing panel is removed on a timer, never
  on `animationend` — reduced motion makes the animation 1ms and the event may never fire:
  [`doc/decisions.md`](/imagine/paging/doc/decisions/)
- **The tab set here is ours, not `ext/tabs`'** — `.paging-tabs .paging-tab-bar .paging-tab
  .paging-tab-panel`. `ext/tabs` leaves its panel transparent, and its selected tab is (0,4,0) in
  the same layer, so joining a panel to it from here would mean out-specifying another module's
  sheet. The site-wide version is a proposal with the diff:
  [`ai/2026-09-05/paging-mechanisms-v2/`](/framework/ai/2026-09-05/paging-mechanisms-v2/)
- **A tab is a child page** — `+ tab`, rename and reorder are page operations on the parent's
  `children`, and one word (`kids`) on the parent chooses columns or tabs. A rename changes the
  title and never the directory, so a saved url keeps working:
  [`doc/decisions.md`](/imagine/paging/doc/decisions/)

## More

- [Docs](/imagine/paging/doc/) — the index of the four records below
- [`doc/persistence.md`](/imagine/paging/doc/persistence/) — what is remembered, how a reader can
  tell, the reset, and where a page you make is written (files in dev, the browser otherwise)
- [`doc/mechanisms.md`](/imagine/paging/doc/mechanisms/) — the four, how each is built, what
  was measured at 1280 and 3440
- [`doc/decisions.md`](/imagine/paging/doc/decisions/) — the record: every verdict, the stage
  rule, the four swap visuals, what was rejected, what is open
- The rest of the realm: [Mechanisms](/imagine/paging/mechanisms/) · [Styles](/imagine/paging/styles/) ·
  [Center](/imagine/paging/center/) · [Transitions](/imagine/paging/transitions/) ·
  [Toolbars](/imagine/paging/toolbars/) · [Right nav](/imagine/paging/rightnav/) ·
  [Explorer](/imagine/paging/explorer/) · [Inventory](/imagine/paging/inventory/) ·
  [Critique](/imagine/paging/critique/)
- Files: `words.js` (the vocabulary and the storage namespace, imports nothing) ·
  `samples.js` (the additive sample ladder, and the real built things in it) ·
  `demos.js` (the hub's four miniatures) · `paging.js` (the `Paging` class and its four parts) ·
  `paging.css` · `page.js` (the hub) · `mechanisms/swap/swap.js` (the four swap visuals) ·
  `make/tabs.js` (tabs on a page you made) · `doc/page.js` (the records index) · `examples/` · `make/`
- The columns vocabulary this stands on: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md)
