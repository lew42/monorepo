# Make — one screen for making pages: the tree, the page itself, and everything it says

**This is the whole page editor.** Type a name and you get a real page — a real url, the real
Router, core's own columns — and in dev a real `page.json` file on disk you can open in an
editor and commit. Three panes: the tree of every page you have made (left), the page you
picked drawn for real (middle), and everything that page says about itself (right).

Live: [/imagine/paging/make/](/imagine/paging/make/)

## Use

| pane | what you do there |
|---|---|
| **left** | `New page` at the top. Click a row to edit it. Drag it by its grip: onto the **edge** of another row to sit beside it, onto the **middle** of one to go inside it. The star is "open first" and presses off again — the row it is on says `opens first` in words; `+` adds a page under this one; `×` asks, then deletes the directory. |
| **middle** | the page, drawn by the same `PagingStage` it draws at its own url, with that url as a link over it. Everything you press on the right moves it. |
| **right** | **Page** — title, description, icon · **Words** — the realm's seven dropdowns · **Blocks** — prose, a card wall, a template. The bar's **More** opens the drawer on this page's real url; **Code** opens the same drawer on the `page.js` it would be. |

```js
// every edit builds a NEW tree and hands it to the one write seam
page.edit_at(path, { navigation: "tabs" });   // one of the seven words
page.set_at(path, { title: "Reading list" }); // a top-level field
page.move_to(from, to, before);               // what a drop calls
page.apply(tree);                             // regrow, redraw, save the diff
```

## Watch out

- **A drop is the only reorder.** There are no up/down buttons, and `Sortable` needed one
  override to make that usable — [`../doc/builder.md`](/imagine/paging/doc/builder.md).
- **The settings pane is rebuilt whenever the middle is.** The bar holds a reference to the
  stage; a rebuilt middle under an old bar is seven silent no-ops. `redraw()` enforces it.
- **A text field is never rebuilt under the cursor** — every typing control passes
  `{ centre: false, settings: false }`, and prose typing redraws the stage in place instead.
- **A rename never moves a file.** `made/notes/page.json` stays whatever the page is called, so
  a url somebody saved keeps working — and a drag only renames a directory on a real collision.
  `head_parts()` says so under the url, in one line, and only while the title and the address
  actually disagree.
- **Where the pages go is `made.js`, and only `made.js`**: files in dev, `localStorage` on a
  static host — [`../doc/persistence.md`](/imagine/paging/doc/persistence.md).
- **A page you made keeps core's `h1`** (`heading: true`), unlike every other page in this realm.
- **Never `flex-wrap` a tree row.** A wrapping flex row wraps *before* it shrinks, so one `wrap`
  puts the star, `+` and `×` on their own line instead of ellipsising a long title. The
  "opens first" tag lives *under* the row; only the delete question, which replaces the row's
  contents, wraps.
- **The star writes one file.** `default_at()` recomputes `mode.default` itself and hands back
  every sibling whose answer is already right *untouched*, so `made.js` writes nothing for it.
  The writer it replaced stamped the flag onto *all* of them and rewrote pages nobody had
  touched; it is deleted, and this is the only one.
- **The drawer is about the page you PICKED**, not this screen: a page with a real address
  answers `node_url()`, and the drawer's first box prints it.

## More

- [`../doc/builder.md`](/imagine/paging/doc/builder.md) — the census, the controls, tabs, and
  the record of the day the two editors became one screen
- [`../doc/persistence.md`](/imagine/paging/doc/persistence.md) — the one store, and the mark
- [Build](/imagine/paging/build/) — where the builder used to be; one sentence and a link now
- Files: `page.js` (the screen and the one write seam) · `tree.js` (the tree and the drag) ·
  `settings.js` (the right pane) · `made.js` (where the pages go) · `make.css`
