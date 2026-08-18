A card per child — arranged here, **drawn by the child**.

**Usage** — dozens of call sites, and it is what an index page *is* on this site:
`framework/core/page.js:21`, `framework/ext/page.js:17`,
`framework/styles/page.js:19`, `framework/ui/page.js:46`,
`framework/util/page.js:16`, and most section indexes. ⚠ Not `framework/page.js`
any more — the site landing moved to [`walls()`](/framework/core/Page/api/walls/)
(Aug 2026, see `../../readme.md`), which is `previews()` one level up: a heading
per section, that section's own `previews()` under it.

```js
content(){ this.previews(); }
content(){ this.previews(subset); }   // a Map — when some children are chrome
```

**Necessity** — yes. One declaration (`children`), and every menu on the site follows
it. Removing this would put a hand-typed card list on twenty pages.

**Simplicity** — right-sized. It reads `nav_for(name)` per child, so the cards, the
sidebar and the tab bar structurally cannot name a child three ways; then it hands that
entry to `child.preview(nav)` and gets out of the way. A **declared-but-unresolved**
child has no page to ask, so its entry goes to `preview_card()` — the same default card,
built from the nav entry alone.

Because declared children are imported at construction and `Router.load()` awaits them,
the cards draw **once**, with real titles. The redraw machinery this used to need is
gone.

**`pages` defaults to all of mine** (Aug 2026). The one parameter, and it exists because
a page's `children` can hold things that are not content: a [`Doc`](/framework/ext/Doc/)
adds Overview · API · Docs · Files as real children, so a Doc calling this on its own
Overview previewed its own tab strip. `Doc.wall()` hands in the subset rather than this
method growing a filter, a flag or a second wall — **one wall mechanism on the site**
is the point, and a `Map` is what `children` already is.

⚠ **`grid-auto-flow: dense` is gone** (2026-08-17, with the `:has(> .page-previews-group)`
rule that existed only to switch it back off). Dense backfilled the gap a heading leaves
at the end of the previous row with a card from the run *below* it — so `styles/layouts/`
rendered Fit and Flex above the VOCABULARY heading that owns them. The holes it existed
to fill were the `.two`/`.big` column span's, and that is gone too: DOM order now.

**`group:` heads a run.** A child may claim a group the way it claims a `card`, and
each *run* of one gets an `h4.page-previews-group` spanning the wall — categories
before specifics, on a wall or in a rail. It is read off the child page directly, not
from `nav_for()`, so a declared-but-unresolved child cannot start a group. Consecutive
children sharing a word get one heading between them; the same word twice, separated,
gets two. The `overview` rail on `core/Page/page.js` is the worked example — fourteen
demos, three groups, and the rail declares none of them.

⚠ `grid-auto-flow: dense` can backfill the gap a heading leaves at the end of the
previous row with a card from the run *below* it. Harmless in a one-column rail, which
is the only consumer today (`Page.css`).

**The wall.** `.page-previews` is `auto-fill` off `--column`, `align-items: start` (a
cell is as tall as what it shows), and `bleed` — the widest breakout track on a
`.page.standard`, inert anywhere else, which is what puts nineteen cards on one screen at
3440 instead of thirteen. `Page.css` hands the page's own `--gutter-x` back so the
wall does not sit against the sidebar. Retune with `--column` and `--thumb-max` on
the wall itself:

```js
this.previews().style({ "--column": "18em", "--thumb-max": "15em" });
```

Note the shape of the callback — `div.c("page-previews bleed", () => …)` captures the wall
synchronously and fills it inside the capture function. This method is the worked
example in `View`'s capturing note for exactly that reason.
