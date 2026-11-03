# core-fixes — two core bugs found by today's builds

## BUG 1 — `width: "full"` collapses the SITE SIDEBAR to 0px

Reproduces on the framework's own reference: navigate to a `full` column page
(e.g. under `/framework/core/Page/overview/columns/finder/` — the Reader leaf wears `full`;
also `/imagine/vary/scroll/full/`). The site's left sidebar (core/Sidebar, outside `.pages`)
collapses to 0 width.

DIAGNOSE PROPERLY before touching anything: `full` is `flex: 1 0 100%` on `.page-column-body`
(`core/Page/Page.css` columns section) — a 100% flex-basis inside `.page-columns-row` which sits
inside `.pages` inside the `.app` flex row beside the sidebar; find where the pressure escapes its
container (min-width:0 chain? the row's overflow? `.app`'s flex children lacking flex-shrink:0 on
the sidebar?). Fix at the cause with the narrowest rule; the fix must NOT break what `full` does
inside its row (ancestors collapse into crumbs — `doc/columns.md` documents the contract and
2026-08-27 numbers: full = whole row, 3166px at 3440).

## BUG 2 — `View.href(undefined)` falls into `attr()`'s GETTER branch and returns null

Found via ext/demo's preview override throwing on a url-less nav; `core/View/View.js:134` area is
the stylesheet loader — find the actual `href` method. Fix: `href(undefined)` (and null) should be
a no-op returning `this` (chainable), never the getter. Check the `attr()` method's arity handling
— fix at whichever level is honest (href or attr — if attr, audit its other single-arg callers
first and report the blast radius BEFORE choosing; the narrow href guard is acceptable if attr is
too hot).

## FENCE

`core/Page/Page.css` (bug 1), `core/View/View.js` (bug 2), `core/Page/doc/columns.md` +
`core/View/doc/**` (a line each), `doc/decisions.md`. Nothing else.

## HARD RULES

- Never kill/restart the :80 dev server (owner's; private `$env:PORT='8095'; node server.js` if down)
- Never drive owner tabs; never stash; never commit
- Don't touch ext/Playground, dev/DevBar, ext/grip (another session owns them)
- Headless-probe screenshots to the session scratchpad (`corefix-*`), never into `public/` mid-probe

## VERIFY (headless, Playwright global at
`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`)

- bug 1 — sidebar width before/after at the finder Reader and `/imagine/vary/scroll/full/` at
  1280/1920/3440 (report the numbers; sidebar must hold its width, full must still own its row),
  plus regression: `/framework/` (homepage), a Doc page, `/imagine/` root, `uses/split` — all clean.
- bug 2 — a url-less nav renders without throwing (the ext/demo preview path — prove with the case
  that threw), and `href("x")` / `href()` getter still behave.
- Zero console errors everywhere. Screenshots for bug 1 before/after in the task dir + `links`.

## REPORT

Root cause of each in one line, the fix in one line, the sidebar numbers, blast radius statement
for attr/href, cuts.
