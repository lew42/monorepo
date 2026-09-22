# Make — one screen for making pages: the tree, the page itself, and everything it says

**This is the whole page editor.** Type a name and you get a real page — a real url, the real
Router, core's own columns — and in dev a real `page.json` file on disk you can open in an
editor and commit. Three panes: the tree of every page you have made (left), the page you
picked drawn for real (middle), and everything that page says about itself (right).

Live: [/imagine/paging/make/](/imagine/paging/make/)

## Use

**Click a thing in the middle; the sidebar follows.** That is the whole gesture. Whatever you
clicked gets one outline and one name badge, and the right pane empties and refills with the
few controls that thing can take — and nothing else.

| you click | the badge says | the right pane shows |
|---|---|---|
| the page | `page · Notes` | title, description, icon · the realm's seven words · add a block · delete |
| a block in it | `block · prose` | what kind it is, its own one or two words, where it sits |
| a run inside that block | `element · h2` | tone, size, align |
| empty ground, or Escape | — | one sentence saying what you can click |

A run needs **two clicks** — the first selects the block it is in, the next goes inside it.
Clicking a link or a button *in* the drawn page just uses the page; it is a real page.

| pane | what you do there |
|---|---|
| **left** | `New` makes a page at the top level. Click a row to open it in the middle. Drag it by its grip: onto the **edge** of another row to sit beside it, onto the **middle** of one to go inside it. Fold a row with its chevron, or drive the whole tree from the keyboard. The star is "opens first"; `+` adds a page under this one; `×` asks in the right pane, then deletes the directory. Under the pages are the **Documents** — the panel layouts, which open in the [playground](/framework/ext/Panel/playground/). |
| **middle** | the page, drawn by the same `PagingStage` it draws at its own url, with that url as a link over it. Everything you press on the right moves it, on the same frame. |
| **right** | only the selected thing — see the table above. |

### Real pages — `?real=`

Add `?real=<url>` to the address and the left pane grows a third group: that url's **real**
pages — ordinary directories in this repo with a `page.js` each, the shape every page on this
site has, rather than the `page.json` files Make owns.

```
/imagine/paging/make/?real=/framework/ux/
```

**Drag one of those rows onto another and the directory moves on disk.** You are asked first:
the right pane says which directory moves and where, and the move runs on that button. Then
`rpc:move` renames the directory and the two `page.js` files that name it — the parent it left
and the parent it joined — have their `children:` lines rewritten. **Every `href`, markdown
link, `url:` field and absolute import that pointed at the moved page is rewritten too** — the
confirm row previews the count, the move answers with the real one
([`core/Page/tools/links.mjs`](/framework/core/Page/tools/links.mjs), `doc/decisions.md`).
Undo is offered for one minute, and it reverses the links as well. Make does not *edit* a real
page; it moves it.

The url above opens the framework's own `ux/` tier, and a move there is a real edit to this
repo — which is the point. Point `?real=` at a scratch directory first if you want to try it.

```js
// every edit builds a NEW tree and hands it to the one write seam
page.edit_at(path, { navigation: "tabs" });   // one of the seven words
page.set_at(path, { title: "Reading list" }); // a top-level field
page.move_to(from, to, before);               // what a drop calls
page.apply(tree);                             // regrow, redraw, save the diff

page.select(new Pick({ kind: "block", path, at, what }));   // the one write of `sel`
```

## Watch out

- **`picked` and `sel` are not the same thing.** `picked` is which page the middle draws (there
  is always one); `sel` is what is selected inside it (there may be nothing) —
  [`doc/decisions.md`](/imagine/paging/make/doc/decisions.md).
- **The ring is `ext/Panel`'s**, and `select.js` loads `ext/Panel/focus.css` for it. A class
  whose rule is not loaded paints nothing and throws nothing — the outline was simply invisible
  until that line existed.
- **A run's three words are `zoom`, not `font-size`, and they live in `@layer util`.**
  `font-size: 1.3em` *replaces* a heading's size instead of scaling it, and a `theme`-layer rule
  loses to the skin's `(0,2,0)` heading selector — silently, both times.
- **The tree is [`ux/Tree`](/framework/ux/Tree/)**, and the fold state is Make's (`page.shut`),
  not the Tree's: the Tree is rebuilt on every keystroke.
- **The settings pane is rebuilt whenever the middle is.** The bar holds a reference to the
  stage; a rebuilt middle under an old bar is seven silent no-ops. `redraw()` enforces it.
- **A text field is never rebuilt under the cursor** — every typing control passes
  `{ centre: false, settings: false }`, and prose typing redraws the stage in place instead.
- **A rename never moves a file.** `made/notes/page.json` stays whatever the page is called, so
  a url somebody saved keeps working — and a drag only renames a directory on a real collision.
- **Where the pages go is `made.js`, and only `made.js`**: files in dev, `localStorage` on a
  static host — [`../doc/persistence.md`](/imagine/paging/doc/persistence.md). That choice,
  and a real page's move (`real.js`), both follow the site's one edit switch now
  (`ext/Ask/edit.js`'s `edit()`) rather than checking the dev socket themselves — the rail's
  "edit" checkbox off previews the static-host, this-browser-only behaviour on localhost.
- **A page you made keeps core's `h1`** (`heading: true`), unlike every other page in this realm.
- **The star writes one file.** `default_at()` hands back every sibling whose answer is already
  right *untouched*, so `made.js` writes nothing for it. This is the only writer of `mode.default`.
- **The drawer is about the page you PICKED**, not this screen: a page with a real address
  answers `node_url()`, and the drawer's first box prints it.
- **Moving a real page rewrites a plain string `children:` and nothing else.** A parent that
  declares `children: [...]`, `children: {…}` or `children(){…}` is refused out loud, with the
  file named, and nothing moves — [`doc/decisions.md`](/imagine/paging/make/doc/decisions.md).
- **A real page's move needs the dev server**, and a `Server/` change is live only after the
  server is restarted. On a static host the confirm row says so and offers no Move.
- **Undo is one step and one minute**, held in memory. Reload the screen and it is gone; the
  move is not.
- **Not every row in the real tree is a directory.** A `Doc` module derives Overview / API /
  Docs / Files children that exist only in memory; dragging one answers "nothing at `<url>`"
  and moves nothing, which is right but reads as a bug the first time.

## More

- [`doc/decisions.md`](/imagine/paging/make/doc/decisions.md) — the record: the control counts
  before and after, the events reused, what `ext/Panel` lost, and the alternatives rejected
- [`../doc/builder.md`](/imagine/paging/doc/builder.md) — the census, the controls, tabs, and
  the day the two editors became one screen
- [`../doc/persistence.md`](/imagine/paging/doc/persistence.md) — the one store, and the mark
- [`ux/Tree`](/framework/ux/Tree/) — the tree · [`ext/Panel`](/framework/ext/Panel/) — the ring,
  the `panel-focus` contract, and the layouts the Documents group links to
- [`Server/README.md`](/Server/README.md) — `rpc:move`, the writer a real page's drag calls
- Files: `page.js` (the screen, the one write seam, the selection) · `select.js` (what a click
  selects, the ring, the badge, a run's three words) · `tree.js` (all three trees) ·
  `real.js` (real pages: the `?real=` group, the confirm row, the move, the `children:`
  rewriter) · `settings.js` (the right pane, filtered) · `made.js` (where the pages go) ·
  `make.css`
