# Search architecture — the corpus is the Router's own walk

`Search` (`Search.js`) is the list of every page the Router can reach, plus the rules that order it. It has no DOM. `Omnibox` (`Omnibox.js`) is the one box that shows it, and it lives only on [the Search page](/framework/core/Search/). Pattern: a plain class for data (`Search`), a `View` for the picture (`Omnibox`), and a `Search.Filters` helper class that lives in the same file.

## The corpus is built by the Router, one url at a time

**Decided:** every row is made by `Page.load(url, 0)`, the same call `Page.child()` makes on navigation. The urls to try come from `/directory.json`.
**Why:** a result must open. A row built from a filesystem guess ("Colstyles" from a folder name) or a hand list can promise a page the Router cannot open.
**Instead:** a title guessed from the directory name (fast, but wrong and with no description), or a build-time manifest (a build step, which is forbidden).
**Detail:** [corpus](./corpus.md), [decisions](./decisions.md#the-corpus-is-the-routers-walk-not-a-filesystem-index)

## Nothing is read until somebody searches

**Decided:** `Omnibox.open()` calls `search.build()` for the first time. A page load never builds the corpus.
**Why:** about 540 to 840 dynamic imports cost about a second and 21 MB. A reader who never searches should pay nothing.
**Instead:** building on page load (a cost for every visitor) or in a worker (more moving parts for one second).
**Detail:** [corpus](./corpus.md#what-it-costs)

## The box lives on one page, not the whole site

**Decided:** `core/Search/page.js` builds the box in `activated()` and calls `unmount()` in `deactivated()`. Unmount removes the document listeners and the DOM.
**Why:** a site-wide box repainted other pages.
**Instead:** a site-wide box, which broke other pages. Its keyboard shortcuts would also fire everywhere.
**Detail:** [decisions](./decisions.md#the-prototype-was-always-visible-this-one-is-always-visible-too)

## Ranking: the title answers first, then the description

**Decided:** `Search.rank(text)` sorts by six tiers (`Search.TIERS`): exact title, title prefix, word start, title contains, description contains, and every word found somewhere. Ties break on shorter title, shallower url, then a to z. An empty query lists the shallowest pages first.
**Why:** a title is three words and a description is a sentence. "Titles first, then descriptions" is what autocomplete users expect.
**Instead:** the prototype's buckets split "this page's subtree" from "everywhere". They are dropped, because the box belongs to the window, not to the page under it.
**Detail:** [decisions](./decisions.md#ranking-title-tiers-then-a-description-tier)

## Filters: chips are OR inside a group, AND between groups

**Decided:** `Search.Filters.match()` requires any chosen value in each group. A group with no chosen values is skipped. Groups are built from the corpus (`section` and the four tag axes from `tags.js`). A group with fewer than two options is not drawn.
**Why:** "no chip lit means everything" needs no special case. Building from the corpus means new `tags:` appear without code changes.
**Instead:** a hand-typed list of groups, which goes stale.
**Detail:** [filters](./filters.md)

## Forty cards, then a button

**Decided:** `Omnibox` draws `PAGE = 40` cards, then a "Show more" button. A new query or chip resets the count.
**Why:** a wall of forty is scannable; the whole corpus is not.
**Instead:** a scroll-loaded list, which needs a scroll container and more state.

## The wall is `auto-fill`, not the `.grid.auto` utility

**Decided:** `Search.css` declares `repeat(auto-fill, minmax(min(var(--column), 100%), 1fr))` with `--column: 17em`. That gives 1 column at 400px, 4 at 1280px and 7 at 3440px.
**Why:** `.grid.auto` is `auto-fit`, which collapses empty tracks into huge cards. A util-layer class also cannot be overridden from this module's theme layer.
**Instead:** `.grid.auto`, rejected for the reason above.

## Some urls are skipped, each with a reason

**Decided:** `Search.prototype.skip` lists url prefixes the corpus will not load. Each entry is a citation to its reason in `Search.js`.
**Why:** `/framework/core/new/` is prior art that one page throws on import. The personal sandboxes restyle the whole site when imported (see [corpus](./corpus.md#the-hazard-this-found-importing-a-page-changes-the-document)).
**Instead:** a guard only, which warns but lets the restyle happen. `Search.check()` is kept as that guard for any sandbox not yet listed.
⚠ `corpus.md` and `readme.md` name five skipped prefixes, including `/arya/`. The code's `skip` list has four and omits `/arya/`, whose `Page.js` puts a class on `<body>` at import. Add it to `skip`, or update the two docs.
**Detail:** [corpus](./corpus.md#the-five-skipped-prefixes-each-with-its-reason)

## No url state for the query

**Decided:** the query is not written to the address bar.
**Why:** nobody links a colleague to a half-typed search.
**Instead:** a `?q=` param, which would make every keystroke a history entry.

## The box's position is a preference, saved per site

**Decided:** top or bottom placement is saved with `Page.Prefs` under `store_key: "omnibox"`.
**Why:** a reader who moves the box means it. Losing that on refresh would be the box forgetting.
**Instead:** no memory (a reset on every load), or a position that is not user-controlled.
⚠ `decisions.md` says this is `Page.Store` under `localStorage` key `lew42:omnibox`. The code calls `Page.Prefs` with `store_key: "omnibox"`. The behaviour matches; the naming in `decisions.md` is stale.

## More

- [`readme.md`](./../readme.md) — what the module is, and when to load it
- [`doc/decisions.md`](./decisions.md) — the dated log, read only to learn how a call moved
