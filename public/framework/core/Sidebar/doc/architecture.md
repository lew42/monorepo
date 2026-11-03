# Sidebar architecture — a brand, a tree, a footer, nothing else

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

`Sidebar` is a `View` subclass: a brand over a search box over a tree of links, resizable by its own right edge, with a footer pinned to the bottom. Any page can render one; no layout owns it. Main class: [`Sidebar.js`](../Sidebar.js). Styles: [`Sidebar.css`](../Sidebar.css). Live demo: [`/framework/core/Sidebar/`](/framework/core/Sidebar/).

## One `pages` property; an entry with `pages` is a group

**Decided:** an entry is anything with a `title` (or `label`) and a `url`. An entry that has its own `pages` is a titled group, with no link of its own.
**Why:** a flat list, a grouped list and a mix are one shape, so nothing new needs learning. A real `Page` and a plain object both work.
**Instead:** a second `groups` property, which would put the same data in two places.
**Detail:** [entries](./entries.md) and [decisions](./decisions.md#what-is-an-entry)

## Rows are a `ux/Tree`; `root:` walks the live page tree

**Decided:** every row is a `ux/Tree` row. `root: <a Page>` walks `page.children` lazily, and `adapt: true` folds to the path you are on. `pages:` renders through the same tree, without the lazy depth.
**Why:** the keyboard, the fold and the handle come from one component. A hand-rolled list had already drifted from the other menus.
**Instead:** a bespoke `nav()` walk, deleted in 2026-09-18 (about 70 lines).
**Detail:** [decisions](./decisions.md#rows-are-uxtree-not-navgrouplink)

## Search swaps the tree for a flat result list

**Decided:** `ux/Filter` sits above the tree. A query hides the tree and shows a ranked list from `index()`, which walks every page once and caches the result. The query lives in `?q=`, so a reload keeps it.
**Why:** a filtered tree can hide a match in a folded branch. A flat list finds every page, loaded or not.
**Instead:** narrowing the tree in place, which misses unloaded branches.
**Detail:** [index](./index.md)

## The footer is pinned by structure, not by `position`

**Decided:** `menu()` puts the nav above the footer, and the nav is the only scroller. The rail is `height: 100dvh`.
**Why:** a `position: fixed` mode pill floated over every page, full-bleed ones included.
**Instead:** `position: fixed` for the footer, which overlapped content.
**Detail:** [decisions](./decisions.md#where-does-the-footer-go)

## `header` and `footer` replace the defaults, passed as a function

**Decided:** a caller's `header` or `footer` replaces the default. Pass a function, so it runs while the Sidebar is capturing. A View built early lands in the wrong place.
**Why:** a View constructed before the Sidebar captures is moved later, which fails silently.
**Instead:** accepting a View, which that failure makes unsafe.
**Detail:** [decisions](./decisions.md#is-header-configured-or-replaced)

## Width belongs to the Sidebar; placement belongs to the caller

**Decided:** the Sidebar owns its width. It defaults to `20em`, clamps to `12rem` through `50%`, and is set by `ext/grip`. The width is saved under one shared key, `lew42:sidebar`. The caller decides where the Sidebar sits, with the shared token and no fallback.
**Why:** the site's type scale is a clamp on `body`, and `em` follows it while `rem` does not. A drag should remember across every page.
**Instead:** `rem` (measured flat across screen widths), or a per-page key (forgets on every navigation).
**Detail:** [placement](./placement.md) and [decisions](./decisions.md#resizable-remembered-and-why-20em-not-19em-or-18rem)
⚠ The decisions file says the key lives in `Page.Store`. The code uses `Page.Prefs` (`new Page.Prefs({ id: "sidebar" })`), the same guarded `localStorage` handle under a different name.

## Below 52em the panel is a sticky top bar

**Decided:** below `52em` the rail becomes a sticky top bar with a burger. CSS turns the resize handle off, and the rail returns to `height: auto`.
**Why:** on a phone, an open menu should not be a full-screen sheet.
**Instead:** a JavaScript resize listener, which CSS can do alone.
**Detail:** [narrow](./narrow.md)

## Links mark themselves through the Router

**Decided:** `.active` and `.in-path` are written by `Router.mark_links()`. A view that renders links late calls `mark_links()` again. The tree reveals the current path on load and after navigation.
**Why:** one owner of link state means one fix covers every nav surface.
**Instead:** a view comparing `window.location` itself, which drifts from the Router.
⚠ `reveal()` falls back to `location.pathname` when no Router is present. The rule holds only while `this.app.router` exists.
**Detail:** [marking](../../Router/doc/marking.md)

## The mode toggle needs `app`

**Decided:** the footer mounts the colour-scheme toggle only when `app` is passed. Without it the footer shows just the placeholder avatar.
**Why:** the toggle is built by `mode(this.app)`, so it needs the app it belongs to.
**Instead:** a global lookup, which would hide a missing `app` from the caller.
**Detail:** [adoption](../../App/doc/adoption.md)

## Open

- **`.brand` has two owners:** `Sidebar.header()` and `app.brand()` both emit it. It works only because a site that passes `header` runs one of them.
- **The avatar is a placeholder** with no action.
- **Nested groups** are not refused. A group inside a group renders with no `url`. The recommended warning is a proposal in [decisions](./decisions.md#proposed), not yet built.
- **Three hand-drawn rails** (`apidoc`, `theme/lew42`, `styles/layouts/sidebar`) read the `19em` token, not the live width. See [decisions](./decisions.md#resizable-remembered-and-why-20em-not-19em-or-18rem).
- **The chevron** `›` in [decisions](./decisions.md#why-is-the-chevron--and-not-chevron_right) is not in `Sidebar.css` or `ux/Tree` today. ⚠ Unverified, so no entry is made for it.
