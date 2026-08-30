# Pages are navigation

A page here is three things: a URL, some content, and children. Everything the site does
with navigation is a way of drawing that third one.

<figure class="blog-exhibit">

```js /docs/page.js
import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,              // the folder is the route
	title: "Docs",
	children: "intro guide api",    // child folders, in menu order
	content(){ md("Hello."); this.previews(); },
});
```

<figcaption>A whole section of a site. There is no registration step, no route file and no
config — the folder this file sits in is its URL.</figcaption>
</figure>

`children` is one list doing two jobs: it is the menu, and it is what the router walks. There
is no second file that has to agree with it. Leave a folder out and you lose the menu entry,
not the URL — the router still finds `docs/api/page.js`, because [finding it *is* the
walk](/framework/core/Router/).

Drop a `.md` file beside a page and that is a page too: `./notes/` renders `./notes.md` when
no `page.js` claims the name. Nothing crawls the filesystem — the **link** is the naming.

## The same tree, drawn six ways

Because the tree is just data, the arrangement is a choice made per page rather than a
component someone has to build. `this.previews()` draws the children as a wall of cards.
`this.tabs()` draws them as a tab strip. `columns()` makes the whole subtree a row of
full-height columns, Finder-style, where clicking a row opens the next column to its right:

<figure class="blog-exhibit">

[![Three columns — Finder, Docs, Guide — with a crumb strip and the live path above
them](columns.png)](/framework/core/Page/overview/columns/)

<figcaption>Real pages, not a mock: each column is one <code>Page</code> in the tree, the
crumb strip is the chain, and the path above updates as you dig. <a
href="/framework/core/Page/overview/columns/">Open the demo</a> and drive it.</figcaption>
</figure>

Each column picks its own track with one word — `width: "small" | "large" | "full"` — and
`full` versus `fill` is the entire permutation space: `full` collapses the columns behind it
into the crumb strip, `fill` keeps them and everyone divides the row. That came out of eight
experiments, not out of an idea.

## Where the shapes came from

I did not design these in a document. Each one is a lab you can open, and the verdicts are
written down with the page that measured them:

- **[The palette](/framework/core/Page/)** — 29 cards in four bands, each a picture of one
  block. Click a card, get the block running with its code.
- **[What the column labs found](/framework/core/Page/doc/findings/)** — one claim per line,
  each linked to the page that proved it. *Stepping the tone up reads as hierarchy; a flip
  reads as "you are here". Of five content kinds, only a nav list does not scale.*
- **[The page generator](/framework/core/Page/generator/)** — the same vocabulary as a
  machine: it draws page trees against the width words so I can look at a hundred of them.
- **[/imagine/](/imagine/)** — the labs themselves, kept rather than deleted, so a verdict
  always has something to open.

The through-line: **previews are navigation, not decoration.** A wall of cards *is* the index
of what is under it, which is why almost every page here can be a menu without anyone writing
one. [`columns.md`](/framework/core/Page/doc/columns/) has the mechanism.
