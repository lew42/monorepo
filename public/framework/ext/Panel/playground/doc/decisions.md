# decisions — playground

**`PlaygroundRail extends Sidebar`, `menu()` only.** The owner's own words, 2026-08-19: "just put
the framework sidebar's logo + framework header on the playground sidebar." `Sidebar.css`
scopes its brand look to a `.sidebar` ancestor (`.sidebar .brand`, `.sidebar .brand-logo`)
— cherry-picking those classes onto a hand-built header would need `.sidebar` anyway, so
composing the real class costs one method (`menu()`, replaced with the document list) and
gets the narrow-screen burger toggle for free. No `footer`: `menu()` never calls it, so
the account avatar and a second dark-mode toggle simply have no home here.

**`route(name)` claims every segment**, mirroring `ai/2026-08-18/page.js`: undeclared
names only (`Page.child()`'s guard), so a real declared child would still win. Both the
root page (`default`) and every `/playground/<name>/` share one `build(page, name)` —
`page` is always the OUTER playground Page (`page.app`/`page.url` stay stable across
documents), `name` is the one thing that changes.

**`render()`, not `content()`** — the same reason `styles/layouts/full.js` does it: the
point is nothing above the layout, no h1, no `.page.flow` grid.

**No ✕.** The owner, verbatim: "we don't need this X button... so we can jump back out."
`full.js`'s own `.layout-close` icon is not reused — the rail's "Framework" link is the
way out instead, and it was already there for navigation, not added for this.

**`--rail-push`, applied.** `ext/drawer/readme.md` called it "proposed, not applied" —
`.layout-full`'s `inset-inline-end` now reads it (the token itself is defined in
`ext/drawer/drawer.css`, on `.app`, where `--drawer`/`--devbar` already live).
`framework.css`'s own copy of the same formula on `.app` itself is untouched — out of
this task's fence, and changing it would touch a file every page on the site loads.

**Documents stay live in the DOM across a navigation.** `Page.deactivate()` has no
default body — an inactive page is hidden by the arrangement contract (`display: none`,
`Page.css`), never removed. Visiting `default` then `+`-ing to `untitled` leaves TWO
Workspaces (fourteen mounted boxes between them) in the document at once; only the
`.active-page` one is visible. The headless proof scopes every query under
`.page.active-page` for exactly this reason — a bare `.panel-workspace-mode` selector
resolves to one button per open document.
