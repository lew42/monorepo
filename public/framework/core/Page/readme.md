# Page

`Page` is a titled, linkable, dormant unit of content. There's no `page()` helper — a
page.js exports `new Page(...)` directly. (A helper was tried and dropped: it needed the
class hoisted anyway, and `new Page(...)` reads just as clearly — see below.)
This is the MVP harvest of frozen-helix's `core/Page` — Page0/Page1-level only, plus the
`activate()` protocol. No Pagers, no columns/tabs, no routing (deferred, see below).

## Decisions (and why)

- **Dormant, always.** `new Page(...)` never renders on creation. Rendering happens when
  the page is *placed* — `View.append` calls `.render()` (existing dispatch), or
  `render(target)` is called directly. This sidesteps frozen-helix's auto-render dilemma
  entirely: no root collector, no batching, no async ordering. Safe to import, renders
  where placed. (See frozen-helix `core/Page/readme.md` — "The auto-render dilemma" — for
  the full analysis; this is its "dormant value" verb, made the only verb.)
- **`export default new Page(...)`** is the blessed page.js shape. `App.load_page()`
  appends the default export (which renders it) and then calls `pg.activate?.()`.
- **`render()` vs `activate()` is a real distinction.** render = build your DOM (embedded
  sub-pages do this too). activate = become THE page — document-level side effects only:
  `document.title`, meta description, body `theme` class. Embedded pages render but never
  activate, so composition can't clobber the document title.
- **render() is deliberately simple** — one `div.c("page", ...)` (title h1 + content),
  captured wherever the page is placed. No `target` param (View.append sets the captor
  before calling render, so capture handles placement) and no re-render guard (simple >
  perfect; calling render twice just makes a second div — don't). Full control:
  `new Page({ render(){ ... } })` — assign overrides the prototype method.
- **App stays Page-agnostic.** Duck-typing only (`.render()`, `.activate?.()`) — App never
  imports Page. `export default "a string"` still works; Page is the richest citizen of an
  open protocol, not a requirement.
- **`meta: import.meta` derives `url`** (`/docs/page.js` → `/docs/`, `/docs/x.page.js` →
  `/docs/x`), so `link()` never hard-codes paths (the pain in `/path-1`'s ad-hoc pattern).
- **Open schema.** Constructor is `assign(...args)` — any extra property rides along as
  inert data (e.g. a parent page rendering `sub.description` under `sub.link()`). Only
  `title`, `description`, `theme`, `classes` have built-in behavior.
- **og: tags deferred.** Social scrapers don't run JS, and every path serves the same
  fallback index.html — runtime og injection is dead code for its purpose. Future path:
  a Cloudflare Worker (HTMLRewriter) injecting per-path meta from a manifest generated
  off these same page objects.

## Deferred (frozen-helix has the design docs)

Pagers (columns/tabs), `slug` hash-routing, `deactivate()` (meaningless under full page
loads; the name `activate` reserves the seat for when a client-side navigator exists),
sub-page adoption/captor. When those return, they layer on top of this class — the
frozen-helix Pager contract is already built around `activate(pg)`.

## Files

- `Page.class.js` — the `Page` class (exported from `/app.js`)
- `page.js` — the navigable doc/demo page (`/framework/core/Page/`)
