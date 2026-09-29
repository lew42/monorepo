# Prior work on navigation — every row the inventory found

Three read-only inventory passes fed this page: [A — imagine/layouts](/framework/ai/2026-09-29/page-system/inventory/A-imagine-layouts.md),
[B — framework](/framework/ai/2026-09-29/page-system/inventory/B-framework.md),
[C — task logs](/framework/ai/2026-09-29/page-system/inventory/C-task-logs.md). Every row either
tagged **nav** is listed here, grouped by what it's for, so nothing found gets re-discovered from
scratch.

## The persistent-vs-switching question — already measured

- [`/imagine/paging/navigation/`](/imagine/paging/navigation/) — the stability study itself:
  every mechanism driven headless at 1280 and 3440, two numbers each (sideways drift, vertical
  drift). **Keep, decided.**
- [`doc/measurements.md`](/imagine/paging/navigation/doc/measurements.md) — the raw numbers, the
  element watched, before/after boxes, the runner.
- [`/web/nav/doc/study/`](/web/nav/doc/study/) — "does navigation stay still when a column
  opens," an earlier pass on the same question, moved in from `/imagine/design/navigation/`.
- [`/imagine/design/navigation/`](/imagine/design/) — 9 mechanisms catalogued and walked headless
  (rail-nested, crumbs, tabs, preview-wall, columns-row, prev-next, toc-rail, rail-scroll,
  sidebar); found `toc()` silently never painted on 23 call sites (fixed, see below).
- [`core-columns` (2026-09-24)](/framework/ai/2026-09-24/core-columns/) — the shipped fix: an
  open column freezes at its floor width instead of resizing when a sibling opens. 0px shift now,
  was up to 242px.
- [`/imagine/decks/persist/`](/imagine/decks/persist/) vs
  [`/imagine/decks/swap/`](/imagine/decks/swap/) — the same four slides, rail vs full-swap,
  head to head.

## The shipped nav components

- [`core/Sidebar`](/framework/core/Sidebar/) — the site's one persistent nav: a tree over
  `page.children`, resizable, footer pinned. Rewritten onto `ux/Tree` on 2026-09-18
  ([`site-sidebar-tree`](/framework/ai/2026-09-18/site-sidebar-tree/)); row spacing and icon
  centering redone on 2026-09-19 ([`sidebar-repair`](/framework/ai/2026-09-19/sidebar-repair/)).
- [`core/Sidebar/variants/`](/framework/core/Sidebar/variants/) — five alternate shapes tried
  before landing on the current one, plus a build log walkthrough.
- [`ext/drawer`](/framework/ext/drawer/) — the right-side contextual second surface.
- [`ext/tabs`](/framework/ext/tabs/) — `this.tabs()` on every Page; flush-seamless by default
  (decided, the owner, 2026-09-06).
- [`ext/Doc`](/framework/ext/Doc/) — the class-doc top-tab pattern (`Doc.js` line ~81: "a page
  whose own children are a left rail").
- [`core/Router`](/framework/core/Router/) — url → `page.child(name)`, writes `.active-page` /
  `.active-ancestor` / `a.active` / `a.in-path`; `page.open_link(link)` is the hook any custom
  click handler must call to stay compatible.

## The alternatives named on the main page

- [`core/Page/overview/columns/`](/framework/core/Page/overview/columns/) — Miller columns, the
  shipped core page shape (`page.columns()`, width words, `.bleed` for flush).
- [`/layouts/explorer/`](/layouts/explorer/) — the 3-pane "right becomes left" browser.
- [`/layouts/labs/screens/`](/layouts/labs/screens/) — 8 demos of what "next" does to a full
  screen (`full` replaces, `fill` joins).
- [`/imagine/paging/`](/imagine/paging/) — the configurable prototype; `navigation` is one of its
  six url words (rail / tabs / expand / columns / takeover / swap).

## Fixed bugs worth knowing about, if a nav link ever goes blank or a panel never paints

- [`nav-rerender` (2026-09-22)](/framework/ai/2026-09-22/nav-rerender/) — a one-frame race made
  the AI rail link render blank; `Router.go()` checked the url before `pushState()` ran.
- [`dead-nav` (2026-09-18)](/framework/ai/2026-09-18/dead-nav/) — a dead top nav in `app.js`
  deleted; confirmed the `toc()` CSS-exclusion bug (above) was site-wide.
- [`overlap-study` → `sidebar-filter` (2026-09-18)](/framework/ai/2026-09-18/sidebar-filter/) —
  101 lines of duplicated resize-drag code deduped into `ext/grip`.

## Removed since the inventory was written (same day)

- `/imagine/paging/rightnav/` — see [`doc/alternatives.md`](alternatives.md)'s last section. Real
  and working on 2026-09-04, never wired into a `children:` list, removed by the "Paging v3"
  rewrite before it became reachable. Not linked from this page.
