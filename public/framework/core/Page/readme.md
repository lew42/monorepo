# Page — design record

A node: a url, some content, and children. Dormant — constructing one renders
nothing, so `export default new Page(…)` is always import-safe.

Emits `.page`, `.page-title`, `.page-link`, `.page-previews`, `.page-preview`,
`.page-preview-thumb`, `.page-preview-link`, `.page-preview-title`, and reads
`.pages` / `.active-page` / `.active-ancestor`. `Page.css` styles all of them.

Every member has a page of its own under the API tab — who calls it, whether it
is necessary, whether it is over-built. Fourteen live trees — six that build one,
five that arrange one, three that are whole websites — are the **Overview's
rail**: one directory each under `overview/`, listed in order by `overview:` in
`page.js` and grouped by the `group:` each one declares. Every card is that tree
running at half size; every demo page is that tree with its own `page.js` open
beneath it. Record: `overview/readme.md`. Long form, one file per
question: `./doc/declaring.md` (the children list and the CMS question),
`./doc/labels.md` (titles, labels, icons, cards), `./doc/css.md` (the whole CSS
record — visibility, the sheet, rhythm, the cards).

## Decisions

**Are declared children eager or lazy?** **Eager.** `children: "a b c"` imports
every child at construction, and `Router.load()` awaits the chain's `loading` — so a
menu draws **once**, with real titles and icons. Reversed from lazy-with-an-opt-in
in Aug 2026, because almost every index page typed the opt-in anyway. There is now
**no lazy tier**. `./doc/declaring.md`.

**What happens to a child nobody declared?** It still resolves. `child()` falls
through `route()` to a filesystem probe, so forgetting to declare costs the **menu
entry**, not the url. The old verdict — "the declaration *is* the registration, so a
miss fails loudly" — was the wrong loudness: a 404 for a file that exists on disk is
a puzzle, not a report.

**So what is `children` for now?** Navigation: **which children, in what order.**
That is the one job left, and the one a filesystem cannot do.

**Four shapes, one meaning** (Aug 2026). A string of names, an array of names, an
array of Pages or option objects, and a **POJO keyed by title** — `{ HTML(){ … } }`
is `/html/`, the key slugged exactly the way `naming()` slugs a standalone page's
title. The POJO is the lean form for children with no folder, which is every demo
tree here. It **throws** on a value that is not a function, string, plain object,
`Page` or `null`: `JS: md("…")` is the synchronous-capture trap in value position,
and must fail loudly. Warts in `doc/property/children.md` — integer-like keys hoist.

**Where do a label and an icon live?** On the page they describe, as `label:` and
`icon:`. The `nav:` map on the parent is **gone** (Aug 2026) — with `label` on the
child it had one job left, and a parent that wants a different word in its own list
now spreads over the entry at the call site, where you can see it:
`{ ...this.nav_for(name), label: "Overview" }`. `./doc/labels.md`.

**What is a preview card, and who draws it?** **`preview(nav)` is THE card, and the
child draws its own.** `previews()` only arranges: it calls
`child.preview(this.nav_for(name))` per declared child, and falls back to the default
card built from the nav entry alone when a child has not resolved.

| | |
|---|---|
| `previews()` keeps building its cards inline | two markup shapes wearing one class — a rule reaching for `.page-preview-title` silently missed half of them |
| a second method meaning *draw yourself small* (`thumb()`) | a second override point, and every page without one has to know it exists |
| **`previews()` calls `preview()`** | ✓ one shape; a page that wants a live render overrides one method |

A card is a `div.page-preview` holding an optional `.page-preview-thumb` and a
`.page-preview-link`, in that order. An override reuses both pieces and costs a line:

```js
preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", () => this.layout())); }
```

**The zoom is not an argument.** `preview_card()` takes `(nav, thumb)` and no stage
options — the zoom and any padding are classes on a div the override writes, which is
one word longer and visible where it happens.

The hard-won parts came from the gallery module this replaces (Aug 2026): the
thumb is **inert**, because an `<a>` inside an `<a>` is invalid and the browser
silently un-nests it; the label below it is the only real link and its `::after`
covers the card; a cell is its render's natural height up to `--thumb-max`, which
is why no page declares a size. `./doc/css.md`.

**A card with a thumb wears no chrome** (Aug 2026). Surface, border, inset and a
checkered board around a render is four frames, and it read as busy. The chrome
now belongs to the plain icon-and-label card only — `:not(:has(> .page-preview-thumb))`
— the thumb's `min-height` floor is gone (it was padding short renders out to a
strip of board), and hover on a bare card outlines the thumb instead of the card.
`./doc/css.md` has the states.

**Every page is a `standard` page unless it says otherwise** (Aug 2026). `render()`
applies `this.classes ?? "standard"`, so the default page is the standard shape — a
measure with `.wide` and `.bleed` tracks — and declaring `classes:` opts
out *whole*. Before, half the site's pages declared the shape and the rest
sat 60em wide in the region, and the split read as two different sites. The
default lives in `render()`, not `naming()`, so a custom `render()` that never
reads `classes` is untouched — which is exactly the classdoc root and the topic
pages.

**One axis: title, prose, walls and exhibits share one left edge, and wider blocks
grow rightward only** (Mike, 2026-08-12). A page used to run two compositions at
once — a centred measure for the text, a left-packed edge for the walls — which
reads broken at every scale and recurses inside a `demo.app`. So the template's
gutter is fixed (`--gutter-x: clamp(2em, 4%, 5em)`), all the slack goes right, and
`.page` carries no auto margins. `./doc/css.md` has the diagnosis and the one
counter-argument worth reopening it with.

The shape was called `grid` until Aug 2026, which was the utility word doing an
opinionated job; `page.ac("grid")` now means `display: grid`, as it does anywhere
else.

**`classes:` replaces the default wholesale, and that is knowingly a bit awkward.**
A page that wants the template *plus* something writes `classes: "standard blue"` —
it has to name the default to keep it. The alternative is a second property or an
additive convention, and neither has been worth its API surface yet, so this is
deferred rather than decided. Revisit it when a third page has to restate
`standard` to add one word.

**A title is an address** (Aug 2026). `naming()`'s url chain gained a fourth
source: no `meta`, no parent, but a `title` → `"/" + Page.slug(title) + "/"` —
so a demo tree's root writes no url line, and `new Page({ title: "Web" })` is
`/web/`. The consequence lives in `add()`: a standalone page now arrives *with*
an address, so adoption overwrites it — `move()` walks the resolved subtree to
`parent.url + name + "/"`, the invariant `nav_for()` and marking always assumed.

**Should `url` be computed — a walk up the parents — so it cannot go stale?**
Asked when `move()` arrived (Aug 2026). **No, twice over.** The assign-based
constructor makes `url` a *config key*, and a prototype method of the same name
would be silently shadowed by any `new Page({ url: "/docs/intro/" })` — the
add() sharp edge, installed deliberately on the most-read member of the class,
and a second name for the same concept is worse than either. And staleness has
exactly one window: adoption. `add()` is the single place `parent` is assigned,
nothing re-parents a page afterward, and `move()` re-derives at that change
point — the same pattern `naming()` is. A walk would defend against mutations
the framework does not perform. **Revisit if re-parenting ever becomes real**
(a CMS moving pages): `move()` is already the re-derivation hook that path
would call.

**`catalog()` is an ext, like `tabs()`.** `previews()` as a persistent rail beside
a `$pages` region — the recipe the catalog demo proved by hand, promoted to a
method when a third consumer was about to paste it. The Page overview's demo rail
and every classdoc Overview are catalogs. `ext/catalog/readme.md`.

**`nav()` — my own menu entry.** `nav_for(name)` is still the parent's method, and
still takes a name, because an entry belongs to the list it appears in. `nav()` is
what it spreads, and it is what `preview()` falls back to when nobody passed one — so
`page.preview()` on its own still works.

**`alias()` — deleted.** `add()` used to write every child onto its parent by name.
Nothing in `public/` ever read one, and it could not have been relied on anyway — an
alias exists only after that child is imported. It cost a `reserved` deny-list,
seven class fields declared only to be visible to a guard, and a cold-load-only
blanking bug when a child was named `view`. **A convenience that needs a deny-list is
not a convenience.**

**`go()` — deleted** (Aug 2026). It had no caller anywhere, and it was the
*imperative* way to do the one thing this framework does declaratively: navigation is
a real `<a href>` that `Router.click()` upgrades. `app.router.go(url)` is one property
longer and says which object is doing the work.

**`description` is a card's second line.** Declared ~30 times and read nowhere until
Aug 2026; `nav()` now carries it and `preview_card()` renders it, clamped, on a card
with no thumb. A widely declared property with no behaviour behind it gets "fixed"
three different ways, so this is the one way.

**Where does a page mount?** `container()`, most specific claim first: a `regions`
entry my parent set for me, then the nearest ancestor with a `$pages`, then
`app.$pages`. It is the one step a reader of `Page.class.js` cannot see, which is
why the choice is logged.

**`tabs()` is not here.** `ext/tabs` patches it onto the prototype and fills
`regions`; `container()` only reads. Core never imports an ext, so the tab bar's CSS
left with it — 30% of `Page.css`, for one caller.

**How does a doc page show a real tree?** `ext/demo/app.js` — born beside the
demos here, promoted to the demo ext by the five-block census — a `View`
that plays App and Router for exactly one tree: it holds the `$pages` those pages
mount in, walks `child()` on a click, and marks what it shows. Everything inside is
this class doing its own `render()`, `previews()`, `nav_for()` and `chain()`, so a
demo cannot drift from the code it documents. Two things it deliberately does not
borrow from the real app:

| | why not | instead |
|---|---|---|
| the Router's clicks | a fictional url handed to `go()` would 404 the site | `preventDefault()` on its own subtree, for urls under its root only — `link_clicked()` bails on `defaultPrevented` |
| `.active-page`, `.active` | `mark_links()` sweeps every anchor under `$app` on every navigation, this widget's included; and a page in here is not a page the Router routes to | `.default` — the arrangement contract's own "shown without being routed to" — and `aria-current` |

`mark()` puts `.default` on **every page in `chain()` whose view contains the leaf's** —
`.active-ancestor:has(.page.active-page)` written in JS. That one test covers both
arrangements: a child that mounts in the box beside its parent hides that parent, and a
child that mounts in a region the parent holds keeps it on screen. Its own record,
and the rest of the demos' decisions: `overview/readme.md`.

**What is an index of indexes called?** `/framework/` painted ten icon cards into a
1080px column and left 72% of a 3440 viewport empty grey — it showed nothing and
linked to ten places. The wanted shape was already invented locally:
`styles/layouts/page.js` had a private `ladder()` — a heading that is a link, with that
child's own `previews()` under it — and three consumers wanted it.

| | |
|---|---|
| `tree()` | **taken**, by `demo.tree()` (`ext/demo/exhibit.js`), which means something else entirely |
| `outline()` | reads as *text*. These are cards |
| **`walls()`** | ✓ `previews()` is my children; `walls()` is my grandchildren, under their parent's name. Sits beside the arrangements the 08-09 session named — wall, catalog, dashboard, strip |

**Verdict: `walls()`**, provisionally — the name is greenlit to unblock the landing
and stays open for Mike, per the house rule that a new name on `Page` is proposed
before it is written. `doc/method/walls.md` carries the depth rule and why a childless
child gets no rung at all.

## Traps

- **Overriding `render()`** owes three things, all silent when missed: set
  `this.view` (`activate()` appends that, not the return value), carry the `.page`
  class, and never nest a second `.page` inside.
- **A page that overrides `render()` into a flex or grid layout owns its children's
  spacing** — `gap`, not flow. `render()` emits `div.c("page flow", …)`, so a page
  opts *in* to rhythm by wearing the class.
- **`.active-page` and `.active-ancestor` are one question asked two ways** — "is any
  of this mine". A rule that reads one and not the other breaks as soon as the tree
  gets a level deeper.
- **`.page` visibility is decided in `@layer util`**, not `theme`, so it out-ranks the
  `.grid` / `.flex` a page is allowed to wear. `./doc/css.md`.
- **A page placed with no mark and no `default` is `display: none`**, and nothing
  throws — the arrangement contract. `activate()` now says so on localhost:
  `warn_if_hidden()` re-checks on a microtask, after whatever marks the chain has
  run, and stays quiet when a sibling in the same box is marked (an ancestor
  standing aside). Off localhost it does nothing at all.
- **`children` changes type.** You write a string, you read a `Map`.
- **A page built for a demo must not name its children as a string.** `children: "a b"`
  is a filesystem declaration: it probes the *server* for `<url>a/page.js`. A POJO
  (`children: { HTML(){ … } }`), object children or `add()`, and a fictional url on
  the root — which it needs anyway, since a child derives its url from its parent's.

## Proposed

Findings from the every-member audit. **None of these are applied** — they are for
Mike and other agents to shoot at.

### 1. `mounts_in()` is a public member whose whole job is a `console.log`

It returns its first argument. It exists so `container()` reads as three claims in
priority order rather than three claims interleaved with logging, which is the
house rule working — but it puts a side-effect-only method on the public prototype
with an imperative name that reads like a question.

**Recommendation: keep, and revisit if the logging ever goes.** The observability is
load-bearing: `container()` is the one piece of black magic left, and the log is what
makes it observable rather than merely declarative.

### 2. Two `parent` properties, one dot apart

`Page.parent` is tree position; `View.parent` is DOM containment, written by
`append()` and read by nothing. A Page's `view` is a View, so `page.parent` and
`page.view.parent` answer different questions with the same word.

**Recommendation: delete `View.parent`** (see `core/View/readme.md`, Proposed —
`View.parent`). Nothing
reads it, and its absence removes the collision entirely.

### 3. `load_all_children()` could be `load_children()`

The `all` distinguished it from the lazy tier, and there is no lazy tier. Two call
sites, both in this file.

**Recommendation: leave it.** `all` still says something true — it means *my whole
subtree*, not just my direct children — and a rename touching a core method for four
characters is not worth the churn. Recorded so it stops being re-proposed.

### 4. `nav_for(name)` takes a name, not a child

It reads `this.children` itself, so it cannot answer for a page that is not a child,
and a caller holding a `Page` must know its name to ask. That is arguably correct —
an entry belongs to the list it appears in — but it is why `styles/layouts/page.js`
threads names rather than pages through its call sites.

**Recommendation: keep, and document the constraint** (done, in
`./doc/method/nav_for.md`). Revisit if a fourth consumer has to thread names.

## Open

- **One variation still has no demo.** *An undeclared child resolves anyway* cannot be
  shown at all — the lesson **is** the filesystem probe, and a demo tree must not touch
  the network. *`container()`'s two levels* is demonstrated now, by the catalog
  arrangement: a page that hands itself a `$pages` in `content()` is a master–detail
  container, and its children mount in it. A miniature carrying a **tab set** works
  now: `tabs()` ended with `this.app?.loaders.push(…)`, which threw for any `app` that
  is not the App, and the `?.` moved onto `loaders`.
- **`children` should shrink further.** With a generated manifest carrying titles, a
  parent could read a child's title without *executing* it — the job the eager
  imports currently pay HTTP requests for. `./doc/declaring.md` has the shape. At
  ~160 pages, not yet.
- **The fetch cascade is on the critical path to paint**, roughly one round trip per
  level, deep links included. Accepted deliberately; not free.
- **`children` gets a property page and a guide page, at two urls.** `/api/children/`
  is the audit entry; `/children/` is the long form. That only works because
  `classdoc` now nests members under an `api` group — before the split, a property
  named `children` was added *before* `load_all_children()` ran and shadowed the
  guide entirely. Worth remembering the next time a member and a guide share a word.
- **A directory named after a class `Page.css` styles collides with it.** `render()`
  stamps `page-<name>`, so `/michael/previews/` wore the card wall's own
  `.page-previews` and silently took its gap, `align-items` and `dense` — it strips
  the class by hand in `activated()`. A filesystem name should not be able to reach
  into a stylesheet; deserves a real answer someday.
