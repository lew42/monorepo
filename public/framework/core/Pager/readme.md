# Pager & ColumnPager

A **Pager** is a `div.pager` container that shows one page at a time and swaps it.
A **ColumnPager** is a Pager that lays a page and its ancestors out as a drill-down
(sidebar + breadcrumbs + two columns).

The split mirrors the framework's whole approach: `Pager` is the dumb, minimal,
reusable core; `ColumnPager extends Pager` is one richer structure. You can build
others (Tabs, Grid) the same way.

## Pager — the MVP

Deliberately dumb: **no history, no URLs, no activation.** It holds a `.active`
page and swaps its DOM on command. That makes it useful on its own (tabs, wizards,
in-app view switching) and a clean base to extend.

```js
import { Pager } from "/app.js";

const pager = new Pager();   // a div.pager, captured where you create it
pager.show(pageA);           // renders pageA into the container
pager.show(pageB);           // swaps to pageB
```

`show(page)` = `empty()` + `append(page)` + track `.active`. That's the whole
class. Lifecycle (activate/deactivate, title/meta) is the Router/App's job — the
thing that knows the URL. The Pager only owns the DOM swap.

The App creates one `Pager` as its main content area (`app.pager`); every page is
swapped in and out of it.

## ColumnPager — the drill-down layout

```js
import { Page, ColumnPager } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    children: [/* … */],
    pager: ColumnPager,   // this topic renders its subtree in the drill-down
});
```

A **topic** declares `pager: ColumnPager`; its descendants are plain Pages. When
any descendant is the target:

1. `Page.host()` walks up to the topic (the nearest ancestor with a `pager`).
2. The App mounts the topic's ColumnPager (`new ColumnPager(topic)`).
3. It reads `window.location`, resolves the target from `Page.registry`,
   walks `.chain`, and renders the last two ancestors as columns (the rest become
   breadcrumbs).

Because clicking a link and hard-reloading a URL both run the same chain logic,
`/a/b/` looks identical either way — no per-page layout knowledge, no hash router.

Key details:
- Columns are filled with `page.body()` (plain content), **never** `render()`, so
  a topic never recurses into its own ColumnPager.
- Navigation is plain `<a href>` (from `page.link()`/`crumb()`); the Router
  intercepts globally — no per-link handlers here.
- Only two columns show at once; deeper paths push ancestors into the breadcrumb.
- Below `45em` (a container query on its own width) the sidebar collapses to a
  burger and only the active column shows.

## How they nest

```
.app
  .pager            ← app.pager (Pager) — swaps whole "host" pages
    .column-pager   ← a topic's ColumnPager, built by host.render()
      .sidebar  .main(.topbar .columns)
```

`.main` is just the layout region beside the sidebar. The app Pager swaps hosts;
a host that owns a pager renders a ColumnPager inside it. Simple pages skip the
ColumnPager and render `body()` straight into the Pager.

## Building another structure

A structure is just a `Pager` subclass whose `render()` lays out the chain
differently:

```js
export class Tabs extends Pager {
    constructor(root){ super({ root }); }
    render(){
        // a tab bar of root.children + a panel for the active child
    }
}
```

Then a topic uses `pager: Tabs`. Everything navigational (routing, links,
activation) is unchanged — only the layout differs.

## Files

- `Pager.js` / `Pager.css` — the base swap container
- `ColumnPager.js` / `ColumnPager.css` — the drill-down layout
- Loading strategy & the tree it walks: `michael/loading.md`
