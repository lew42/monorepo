# 2026-08-11 — The `core/Page` pages, and the `/web/` guide tier

> **Status: shipped, uncommitted.** Every claim below was checked against the code
> and rendered in a browser before it was written down. Weights are stated: some of
> this is a mechanism that breaks if you change it, most of it is a preference that
> was reasonable on the day.

## Shipped

**The default page template is `standard`, not `grid`.** `render()` stamps
`this.classes ?? "standard"`; `grid` is now a plain utility in `framework.css`
(`.grid`, `.grid.auto`, `.grid.three`) carrying no page meaning, and `ext/toc`
opts out with `:not(.standard)` instead of the old carve-out. Buying the word
back was the entire point — there is no other argument for the rename.

**`.page.standard.left` is an option, not a doctrine.** A fixed left gutter with
the leftover moved right, so `main` and `.wide` share one left edge. `.bleed` is
deliberately left spanning the full page: it *is* the page's width by definition,
and an inset-left, flush-right band would be a third rule to explain. Two
consumers so far (`/web/`, `/web/layout/tracks/`); if it stays at two, re-ask
whether it earns a class.

**Preview cards go bare where there is a render to show.** A card with a thumb
drops surface, border and checkered — a frame around a picture is two frames too
many. A card with only a label **keeps** its chrome. That split is the rule; "the
cards went bare" is the half of it people will remember and misapply. The thumb
has a ceiling (`--thumb-max`, 12em) and no floor — the floor padded short renders
out, and what showed in the dead space was the card's own background. Label-below
is the shape (thumb, then link), not a class.

**The catalog rail is sticky with its own scrollbar** — `position: sticky; top: 0;
max-height: 100dvh; overflow-y: auto`, un-pinning to a horizontal strip under
64em. The rail no longer jumps on click — measured across an
`overview/wall/ → overview/docs/` click, its own `scrollTop` (300) and its
viewport top (85px) are unchanged. **Router was not touched to get that**: the
region reset still scrolls the nearest `.pages`, and a sticky element doesn't
care.

**`.tabs.block` — folder tabs.** The bar's `border-bottom` moves off the bar and
onto the tabs, so under the active tab the hairline is *absent* rather than
covered. That indirection is load-bearing: an opaque fill would have to name the
host page's background, and a page here is a transparent hole onto the shell.
classdoc's top bar uses it. The rest of the variant is taste.

**Fourteen overview demos, real directories.** `core/Page/overview/{page,
children, add, labels, route, shapes, wall, catalog, dashboard, strip, deep,
landing, docs, site}/` — each its own page with a distinct site identity. The rail
heads them in three runs (Basics 6, Arrangements 5, Sites 3) from a `group:`
string each child declares and `previews()` reads; the order comes from the
parent's `overview:` list, so the headings **fall out of** that order rather than
being declared anywhere. `overview/demos/` dissolved into this; its
`mini-app.{js,css}` moved sideways to `ext/demo/`.

**`demo.tree()`** — the local `tree()` promoted onto `demo` in `ext/demo/tree.js`.
A `demo.tree()` page prints its own `page.js` open below the render when it has
`meta:`. Render first, own source second, caption last is the verdict; note it is
convention, not construction — `demo.source.file()` opens *closed* by default and
twelve hand-written pages each force `open` themselves.

**`core/Page/previews/`** teaches the family: the parent arranges
(`previews()` / `walls()` / `catalog()`), the child draws (`preview()`),
card + link is the shape both share, and `group:` / `card:` are claims a child
makes that the wall reads.

**The `/web/` guide tier is live** — guide teaches, `/framework/` is reference,
linked from both the chrome nav and the root wall.

- `/web/nav/` — 11 clickable patterns in two runs (9 Patterns, 2 Studies). The
  **jumps** study argues that a whole-page swap moves the title, the nav and the
  reading column on every click while a persistent shell moves only the region.
  Stated qualitatively; it carries no measurement, so treat it as an argument, not
  a finding. The **drill** study's verdict is hedged on purpose: re-root the rail
  (b), with the flat rail (a) as the default until there is a third level — and it
  flags that (b) drops the siblings you came from.
- `/web/layout/` — 7 principles in three runs (Reading, Arrangers, The page).
  Three carry a real toolbar lever (flow, flex, grid); the other four are a stage
  you drag by its right edge, which the parent page says out loud.

**`tabs()` no longer throws inside a mini_app** — `this.app?.loaders?.push(…)`.
A stand-in app has no first-paint queue to wait on. One character, a real bug.

**`[aria-current]` is the selected-state technique we are moving to** — not yet
the only one. All three tab shapes and `ext/catalog` read it, but always as the
third alternative in `:is(.active, .in-path, [aria-current])`, and `tabs.js` still
*queries* only `.active` / `.in-path`. `mini-app.js` is the only place that sets
it.

## Open

- **`classes:` replaces rather than adds** — `"standard blue"` must restate
  `standard`. Mike deferred. Merging instead would make the default invisible at
  the call site, which is the reason it wasn't simply changed.
- **Should core adopt `aria-current` natively** — Page.css, or `Router.mark()`
  setting it beside `.active`? Four rules in `ext/demo/mini-app.css` wait on that
  call; until then the `:is()` list is the shim.
- **The drill study's sibling-preserving descent** — re-root without losing the
  siblings you came from — needs a block the site does not have.
- **T9 / T10 / T11** from `proposal.md` remain deferred.
- **Latent, and mild:** a page directory named `walls/` would wear `.page-walls`
  and pick up its one rule (`padding-inline`) when nested under a `.page.standard`.
  The same collision on `previews/` was live — two such directories exist — and was
  fixed with `:where(:not(.page))`. Not worth a second guard before a `walls/` page
  exists.
- **Nine live links into nothing — found by the 391-route crawl, fixed.**
  `ext/demo/web.js`'s sample tree is titled `Web`, so its in-memory children
  derive `/web/html/`, `/web/css/`, … — fine inside a `mini_app`, which
  intercepts them. This session making `/web/` real turned one leak into nine
  404s: `core/Page/nav/page.js` rendered a **bare `Sidebar`** from that tree,
  no shell. Fixed by shelling it — the sidebar now sits in a `mini_app` beside
  the page's own `$pages`, so the demo *navigates* (verified: crumb moves, real
  url doesn't, zero errors), which is better teaching than anchors that 404.
  Still open underneath: the fixture's derived urls now share a namespace with
  the real `/web/` section — fictional urls risk becoming real. Worth one
  deliberate decision (rename the fixture's root, or keep it and always shell);
  every current consumer is shelled.
- Two stray `panel-*.png` at the repo root predate this session — left for Mike.
- The usage script's bearer token 401s.
