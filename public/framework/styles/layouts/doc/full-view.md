# The full-window view — a url, not a class

Split out of `readme.md`.

## 3. "Maximize", with a router that only knows path segments

**Question.** A layout wants to be seen without a docs column around it. How is
that expressed?

**Options.**

1. `?full` on the same url.
2. A button that toggles a class.
3. A child page, `<name>/full/`, rendering only the layout.

**Weighing.** (1) cannot work: `Router.load_segments()` splits on `/` and
`Page.child()` walks declared names, so `…/holy-grail/?full` **is**
`…/holy-grail/` — the query is dead data. (2) is state that no url describes:
not linkable, not shareable, and Back does not leave it.

**Verdict: (3), a child page.** `layouts/full.js` is a three-argument factory, so
each of the eight `full/page.js` files is three lines and there is one place that
decides what "full" means.

Two details worth recording:

- **It overrides `render()`, not `content()`.** `Page.render()` draws an `h1` for
  whatever `title` it has, and a maximize view with a heading above it is not
  maximized. The alternative — `title: ""` to make the `if (this.title)` falsy —
  also empties `document.title`, because `Router.activate()` does
  `document.title = page.title ?? document.title` and `""` is not nullish. A
  five-line `render()` override is cheaper than a lie in the tab bar.
- **What "full" actually removes.** `hides-nav` takes the site nav (an inert
  class `/styles.css` reads) and `.layout-full` zeroes the region's sheet
  (`--measure`/`--page-pad`, retired `paper` — see `core/Page/readme.md`, "The
  sheet is the default") and gives the layout the region's height, so a
  `flex-1` band has something to take and a footer lands at the bottom. It does
  **not** hide `/framework/`'s sidebar — which was argued for at the time
  ("maximize means the width it was drawn for, not chrome-free") and is the
  part the revision below overturned.

### REVISED — the directories are gone

The verdict above holds where it matters: **a url, not a class.** Everything else
was rebuilt. Three changes, in order of how much they were worth. *(A word note:
this section once called the mechanism "viewport" / `.layout-viewport` — the name
did not survive; the shipped code below is `full` / `.layout-full`, and every
mention here now matches it.)*

**The eight `full/` directories became one `route()`.** `Page.child()` already falls
through to `this.route(name)` for any segment the parent did not declare — the seam
that exists so a page can own urls it could not list in advance. A maximize view is
exactly that, and the directories were never carrying information:

```js
route(name){ return name === "full" && full(this, layout); },
```

Eight directories and eight four-line `page.js` files deleted, and the url is
unchanged in kind — still linkable, still leavable by Back. §7 below listed the
eight files as the thing to cut; this is that cut, and it turned out to cost less
than trimming to two would have.

The word appears twice per page rather than being hidden inside the helper. That is
deliberate: a page should read as *"I claim this url, and here is the link to it"*.
A helper that silently matched its own name would be one file's behaviour decided in
another, which is the house definition of black magic.

**It is `position: fixed; inset: 0` now, not a wider measure.** The old version took
the region's measure and kept `/framework/`'s sidebar beside it, on the argument
that maximize means "the width it was drawn for" and not "chrome-free". In practice
the two are the same thing at a 19em sidebar plus a docs column — the layouts most
wanting width (holy grail, dashboard) were still cramped. So the view takes the
window and the way out is an `×`, which also answers the objection that hiding the
sidebar leaves no way back.

**The `.active-page` workaround is deleted.** It used to be recorded here as a trap:

> The height rule is `.page.layout-full.active-page`, and the `.active-page` is
> load-bearing. A bare `.page.layout-full { display: flex }` has the same
> specificity as `.page { display: none }` in Page.css and loads later, so it wins
> — leaving all eight maximize views on screen for every route on the site.

That is no longer true, and the entry is kept only so nobody re-derives it. The
arrangement contract moved into `@layer util` and now out-ranks anything a component
stylesheet or a utility class can say about `display`, so
`.page.layout-full { display: flex }` is an ordinary rule that means what it
says. See `core/Page/readme.md`, "The contract lives in `@layer util`".

**It escaped `ext/drawer`'s push (fixed 2026-08-16).** `position: fixed; inset: 0`
means the containing block is the viewport, not `.app` — so the rail's
`padding-inline-end` reservation never reached it and the rail sat on top of
whatever `.layout-full` view was open. `layouts.css` now restates the same
reservation on `.page.layout-full`'s own `inset-inline-end`. Full account, and the
proposed follow-up (a shared token instead of two formulas): `ext/drawer/readme.md`.

**Since superseded again:** none of the eight layout pages uses `route("full")` any
more. They stopped needing a fixed overlay when the page became its own layout at
its own plain url, and stopped being the layout at all on 2026-08-12, when each one
moved onto a `demo.exhibit()` stage — a resizable box with a "fill the window"
sibling, which is the same capability without a second url (`ext/demo/doc/record.md`
§7). `full.js` and this `route()` seam are unchanged and still serve
`styles/sections/`, whose fifteen bands compose into one page that genuinely wants
one. See `core/Page/readme.md`, "Round 2", and `layouts/readme.md`.

---

