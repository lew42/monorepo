# Where a clicked link opens — the page decides

A link carries no target. When you click a link inside the app, the Router asks **the
page that holds the link** where it should go, by calling that page's `open_link(link)`.
The page returns a url to navigate to, or nothing when it showed the link itself.

See all three at once: [/framework/ext/markdown/open/](/framework/ext/markdown/open/).

| the page | what `open_link()` does with a link to a `.md` |
|---|---|
| any page (the default) | navigates to the doc's own page, `<module>/md/…/` ([markdown.md](/framework/core/Page/doc/markdown.md)) |
| a page in a columns tree | opens a doc from its own folder as **the next column**: one column deep opens column two, three deep opens column four |
| a card, or any small box | whatever it says. `open_link(link){ return this.swap_link(link); }` draws the doc inside the card, with a Back button |

A link that isn't to a `.md` navigates as it always did.

## The pieces

- `open_link(link)`: the one seam. Override it on any page.
- `swap_link(link)`: draws the doc inside this page, over what it was showing, with Back.
- `md_files(names)`: this page's own `.md` files as a list of links. Pass `names` if you
  know them (a card's own file lines); otherwise it reads the dev server's file list,
  which production doesn't have.
- `md_dir()`: the real folder this page's docs live in: `folder` if the page says one,
  else its url. A card whose url is a view of a folder elsewhere overrides it.
- `Page.of(element)`: the page that drew an element. `render()` records it.

## Why not a `target` on the link

HTML's way is a `target` on each link. It is explicit, but every link author then has to
know the layout the link will be clicked in, and the link breaks when its page moves into
columns or into a card. Here a doc's links are plain markdown, and the same doc reads
correctly in all three places.

## Watch out

- **A swap has no url.** Back, reload and the site nav don't know about it. That is the
  price of "swap in place". A view worth returning to should be a page.
- **In columns, a doc opens headed by its file name** (`alpha`), and keeps its own `# Alpha`
  heading underneath. A doc in a subfolder opens through the page's `md/` column.
- **A deep reload of a column doc** (`…/columns/alpha/`) probes `alpha/page.js` first and
  logs one 404, the old cost of core's "`x/` renders `x.md`" fallback. A click never does.
- **Hidden pages still load their iframes.** A page's ancestors stay in the DOM, hidden,
  so the demo sets an iframe's url only once it is on screen (it nested itself 160 deep
  otherwise).
