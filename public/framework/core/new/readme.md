# core/new — one sketch kept for the record; two deleted 2026-08-30

**Don't import anything in here.** `public/` is the deploy artifact, so a stray
`../new/1/Page.class.js` resolves to a real file and yields a *second, different*
`Page` class — same name, silently wrong instance. `core/` is the live framework;
everything below is how it got there.

```
new/
  1/   WHERE THE SHIPPING DESIGN WAS PROVED — Router.js is line-for-line core/Router/
```

`0/` (the Router-less MVP, before routing) and `starter/` (the earliest working
strip-down, superseded by `1/`'s CSS-only version) were deleted whole — 445
files, 2.8 MB, zero importers, simplify audit #1. Their value was already fully
extracted into `1/`'s design and into the "What each one proved" record below.
`1/readme.md` is the long-form record `core/App/readme.md`, `core/Page/readme.md`
and `core/Router/readme.md` all point back to for the measurements and the
council round behind them.

## What each one proved

- **`0/`** (deleted 2026-08-30) — every page's view is a **sibling**, flat under one `$pages`, at every
  depth. That's what makes `replace` / `columns` / `full` almost entirely CSS
  reading two classes (`.active-page`, `.active-ancestor`) plus a `data-mode`
  attribute. No Router yet — `App` walks `location.pathname` through an in-memory
  tree because every child is a direct `import`.
- **`starter/`** (deleted 2026-08-30) — the first version with a real `Router` and **lazy** children
  (`children: "intro api"`, imported on demand). It also worked out `naming()`,
  the `add()` shapes, and found the column layout's structural limit — a parent
  can arrange its *own* child, not a subtree, without either propagating state
  down or searching up. Solved one level later, in CSS.
- **`1/`** — `1/`'s three classes (**265 lines**) are what's live in `core/` today.
  `mode` is gone entirely — `full`/`cols`/`tabs` are class names a page opts into,
  interpreted only by its own stylesheet. `container()` (two levels: `regions` for
  a named child, `$pages` for a whole subtree) replaced `show(child)`/`host()`.
  `tabs()` is links plus a region, no `Pager` subclass, no per-tab directory. The
  council round (`1/agents/`, reachable at `1/site/council/`) is the other half of
  the record — fourteen independent seats, what they agreed on unprompted, and the
  nineteen ranked requests that came out of it.

## Nobody imports this tree

Grepped across `public/`: zero live imports. Every hit outside `core/new/` itself
is a citation — `core/App/readme.md`, `core/View/readme.md`, `core/Router/doc/measured.md`,
`util/is/readme.md`, `util/source/readme.md`, `ext/markdown/readme.md`,
`ext/DesignTool/audit/pages.js` (which explicitly excludes these sketches from its
crawl), and the framework readme's `instanceof` trap, which names this exact
directory as the hazard. `core/page.js` does not list `new` in its `children:`,
so this tree is deliberately outside the live site's navigation, the same way
`ext/DesignTool`'s audit deliberately excludes it — not an oversight to fix by
adding a link, but the existing convention for a proving ground.

## Running it

Its own dev site, over the repo's real `Server` + `DevSocket`:

```bash
node public/framework/core/new/1/server.js   # http://localhost:8300/
```
