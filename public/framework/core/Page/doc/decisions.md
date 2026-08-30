# Page — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Every member has a page of its own under the API tab — who calls it, whether it
is necessary, whether it is over-built. Fourteen live trees — six that build one,
five that arrange one, three that are whole websites — are the **Overview's
rail**: one directory each under `overview/`, listed in order by `overview:` in
`page.js` and grouped by the `group:` each one declares. Every card is that tree
running at half size; every demo page is that tree with its own `page.js` open
beneath it. Record: `overview/readme.md`. Long form, one file per
question: `./declaring.md` (the children list and the CMS question),
`./labels.md` (titles, labels, icons, cards), `./css.md` (the whole CSS
record — visibility, the sheet, rhythm, the cards).

## Who uses this

Every `page.js` on the site — around 160 of them — constructs a `Page` (or is one,
via `class X extends Page`) as its default export, almost always through
`import { Page } from "/app.js"`. That is the module's real caller list, and it is
too large to enumerate; the more useful list is the dozen files that import
`Page.class.js` **directly**, bypassing the re-export, because those are the ones
that have to exist before `/app.js` itself can be trusted:

| file | why it imports directly |
|---|---|
| `core/App/App.js` | adopts the routed root page in `App.load()` |
| `ext/Doc/Doc.js` | `class Doc extends Page` — the class-page system this audit itself runs on |
| `ext/AITask/AITask.js` | `class AITask extends Page` — the AI dashboard |
| `ext/catalog/catalog.js`, `ext/demo/{app,demo,sample}.js`, `ext/tabs/{page,tabs}.js` | the arrangement exts — each fills or reads `$pages` / `regions`, the two properties `container()` looks for |
| `styles/page.js`, `versus/page.js` | build demo trees outside `/app.js`'s own re-export |
| `alex/framework/core/Page/ErrorPage.js` | a sandbox subclass |

**A module with no callers is a finding; this one's finding is the opposite one.**
`Page` is the single most depended-on class in the framework, reached through
exactly two doors — the re-export almost everything uses, and the direct import
the infrastructure above needs because it runs before `/app.js` has finished.

## Decisions

**Is `columns()` a page shape or an extension?** **A core page shape**, graduated
2026-08-26 from `overview/columns/`. `columns()` sets one flag on the host; `render()`
asks `column_host()` (a `chain()` walk) instead of walking the tree, so a lazily-loaded
child is a column too. Every rule lives in `Page.css`, beside `.page.solo` — the other
shape that claims a whole region. The demo is now an ordinary tree that calls the method.
`./columns.md`.

**Why a `width:` word instead of a class?** Because the CLASS is an implementation
detail and the word is the vocabulary: `width: "small"` reads on the page, and
`column()` stamps `.page-column-small`. The four words set **tokens**
(`--page-column-flex/-min/-max`), never properties, so the narrow container query can
page the row one column at a time without out-specifying four rules — and a page that
wants 48em retunes one token instead of asking for a fifth word. `./columns.md`.

**Does core own a breadcrumb now?** **Yes — `crumbs(from)`**, derived from `chain()`,
which is the shape `ui/crumbs/` said a real one would have to take. It emits
`.page-crumbs` links and nothing else; `Router.mark_links()` lights them. `from` is
where the trail starts, so a columns host shows only its own subtree.

**Are declared children eager or lazy?** **Eager.** `children: "a b c"` imports
every child at construction, and `Router.load()` awaits the chain's `loading` — so a
menu draws **once**, with real titles and icons. Reversed from lazy-with-an-opt-in
in Aug 2026, because almost every index page typed the opt-in anyway. There is now
**no lazy tier**. `./declaring.md`.

**What happens to a child nobody declared?** It still resolves. `child()` falls
through `route()` to a filesystem probe, so forgetting to declare costs the **menu
entry**, not the url. The old verdict — "the declaration *is* the registration, so a
miss fails loudly" — was the wrong loudness: a 404 for a file that exists on disk is
a puzzle, not a report.

**So what is `children` for now?** Navigation: **which children, in what order.**
That is the one job left, and the one a filesystem cannot do.

**Is a `.md` file a page?** **Yes, beside a page and nowhere else** (Aug 2026).
After the `page.js` probe misses, `Page.file()` fetches `<url><name>.md` and renders
a hit as a page. Gated on the content-type, because the SPA fallback answers a miss
with `index.html` at 200. `./declaring.md`.

**Four shapes, one meaning** (Aug 2026). A string of names, an array of names, an
array of Pages or option objects, and a **POJO keyed by title** — `{ HTML(){ … } }`
is `/html/`, the key slugged exactly the way `naming()` slugs a standalone page's
title. The POJO is the lean form for children with no folder, which is every demo
tree here. It **throws** on a value that is not a function, string, plain object,
`Page` or `null`: `JS: md("…")` is the synchronous-capture trap in value position,
and must fail loudly. Warts in `doc/property/children.md` — integer-like keys hoist.
An option object *inside the array* form is the same idea one level down — no
`name:`, it derives one from `Page.slug(title)`, and two that derive the same name
warn instead of the earlier one silently losing (fixed 2026-08-15 — `ext/Timeline`'s
two-card `overview:` was rendering one).

**Where do a label and an icon live?** On the page they describe, as `label:` and
`icon:`. The `nav:` map on the parent is **gone** (Aug 2026) — with `label` on the
child it had one job left, and a parent that wants a different word in its own list
now spreads over the entry at the call site, where you can see it:
`{ ...this.nav_for(name), label: "Overview" }`. `./labels.md`.

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
is why no page declares a size. `./css.md`.

**A card with a thumb wears no chrome** (Aug 2026). Surface, border, inset and a
checkered board around a render is four frames, and it read as busy. The chrome
now belongs to the plain icon-and-label card only — `:not(:has(> .page-preview-thumb))`
— the thumb's `min-height` floor is gone (it was padding short renders out to a
strip of board), and hover on a bare card outlines the thumb instead of the card.
`./css.md` has the states.

**Every page is a `standard` page unless it says otherwise** (Aug 2026). `render()`
applies `this.classes ?? "standard"`, so the default page is the standard shape — a
measure with `.wide` and `.bleed` tracks — and declaring `classes:` opts
out *whole*. Before, half the site's pages declared the shape and the rest
sat 60em wide in the region, and the split read as two different sites. The
default lives in `render()`, not `naming()`, so a custom `render()` that never
reads `classes` is untouched — which is exactly the Doc root and the topic
pages.

**One axis: title, prose, walls and exhibits share one left edge, and wider blocks
grow rightward only** (the owner, 2026-08-12). A page used to run two compositions at
once — a centred measure for the text, a left-packed edge for the walls — which
reads broken at every scale and recurses inside a `demo.app`. So the template's
gutter is fixed (`--gutter-x: clamp(2em, 4%, 5em)`), all the slack goes right, and
`.page` carries no auto margins. `./css.md` has the diagnosis and the one
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
and every Doc Overview are catalogs. `ext/catalog/readme.md`.

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
and stays open for the owner, per the house rule that a new name on `Page` is proposed
before it is written. `doc/method/walls.md` carries the depth rule and why a childless
child gets no rung at all.

### `nearest(role)`, and the two roles — 2026-08-27

The ask: *"each child page should have a reference to its parent. Maybe a TopicPage
could be referenced at `child.topic`, so all children can find their nearest `.topic`.
Similar for a Document. Then deeply nested pages could interact relatively simply."*

| | |
|---|---|
| a `TopicPage` **subclass** | ✗ a page's role is a word about it, like `width:` and `card:` — not an identity. A subclass also forces a file per role |
| `topic: true` **as the flag** | ✗ it shadows the `topic()` method **on the topic page itself**, which is the page most likely to call it |
| a **registry** on `app` | ✗ a second tree beside the one that already exists, and it has to be kept in step |
| **`is: "topic"` + `nearest(role)`** | ✓ one declarative word, one line over `chain()`, no state anywhere |

**Verdict: `nearest(role)`, with `topic()` and `document()` as the two named lookups.**
`findLast`, so the closest claim wins — a document inside a topic is still your
document, the same override direction as CSS. A third role needs no method:
`nearest("thing")`. [`./roles.md`](/framework/core/Page/doc/roles/).

**Core stops at the ref.** How a topic then talks to its subtree — a selection, a
watcher list, a cached fetch — is that page's own three lines. Putting a subscription
API on `Page` would make every page pay for a pattern four pages want.
[Refs](/framework/core/Page/overview/columns/refs/) is the working proof: a picker and
a reader four levels apart, neither importing the other.

### The column flush word is `bleed` — 2026-08-27

`.page-column-prose`'s 0.7em/0.9em inset had been cancelled by hand in a lab
(`examples/grids/grids.css`, `margin: -0.7em -0.9em`) — a constant nothing kept in
step with the rule it was cancelling. Promoted: the inset is now
`--page-column-pad-x` / `--page-column-pad-y`, and `.page-column-prose > .bleed`
spends them.

**No new class.** `bleed` is already the site's word for edge-to-edge; `.page > .bleed`
spends the page grid's gutter tracks and this spends the column's inset. One
vocabulary, two containers. `./columns.md`.

### Panels: the height split needs nothing new — 2026-08-27

Asked for a way to split the viewport height into two independent regions. `.pages` —
the region class — is already `flex: 1 1 auto; min-height: 0; overflow-y: scroll`,
which *is* a panel; `solo flex v` on the page is the rest. **Verdict: a written
pattern, not a core word**, with the honest limit that the Router activates one chain
so only one panel can be "where you are". `./panels.md`, live at
[Panels](/framework/core/Page/overview/columns/panels/).

### Resizable columns, and `hug` / `fill` — 2026-08-29

**The seam is a sibling of the body, and it costs the row nothing.** `.page.column` is
`display: contents` so it cannot host a pointer event, and the body is a scroller so an
overlay inside it scrolls away — the only place left is *between* the body and the child
region, where the row sees it as a flex item. `flex: 0 0 6px` with
`margin-inline-start: -6px` is an outer size of **zero**, pulled back onto the column it
resizes. The rejected shape was a 0-width item with an overhanging `::before`: that reach
is scrollable overflow of the row, and flexible columns fill their row exactly, so the last
seam would have put a horizontal scrollbar under every un-capped arrangement.

**No new mechanism for the width.** A drag writes the same three tokens the width words
set (`--page-column-flex/-min/-max`) as an inline custom property, which out-ranks a class
by one level; double-click sets them to `""`, which *removes* them, and the word is back.
Nothing stores a previous value because nothing has to. **No `ext/grip`** — core does not
depend on ext, and the whole gesture is `setPointerCapture` plus `lostpointercapture`.

**`hug`'s ceiling is not a compromise** (`flex-basis: auto` is max-content, and a
paragraph's max-content is the paragraph on one line), and its 6em floor is
`Page.column_floor` in `em`: at 8em the floor decided every short rail and hug never
hugged — measured 128px on a 100px list. **`fill` is `full` that lets its neighbours
stay**: the same 100% basis, but it shrinks and keeps a floor, and it gets no `:has()`
rule — collapsing the ancestors is the whole of what makes `full` a different word.
Measured, gestures and both words: `./columns.md`.

### `index: true` — a column whose cards are the nav — 2026-08-29

A column lists its children as rows. An **index** column has already drawn them as a
`previews()` wall, so the rows say the same things twice — cards, then a rail.

| | |
|---|---|
| leave it to the page | ✗ three had already done it by hand: `imagine/shells` restated all ten lines of `column()`, `imagine/screens` did it in CSS, `imagine/vary` still ships the double list |
| `nav: false` | ✗ `nav()` is a method here — the `opens()` collision exactly |
| `rail: false` | ✗ `rail: true` is already four pages' own field (`overview/site`, `overview/docs`, two under `old/`) |
| a class + a CSS rule | ✗ it builds the rows and then hides them; they stay in the accessibility tree |
| **`index: true`** | ✓ one guard in `column()`, no CSS, and the shells override became one word |

**Verdict: `index: true`.** Grepping the consumer pages for each candidate is what picked
it — the step the `opens()` bug skipped. Measured on shells at 1280 and 1920: 10 rows + 10
cards → **0 rows + 10 cards**. It is for a column that shows its children *another* way,
never for hiding them: a column with neither wall nor rows is a dead end. `./columns.md`.

### `app` reaches a page that is never routed to — 2026-08-29

`child()` was "the one place `app` is handed down", and that was true only for pages the
Router asks for. A `default` column is **built by its host**, so `child()` never runs for it
and the `app` it was adopted with at module scope — `undefined` — survives to its content:
`this.app.router` threw on `/imagine/screens/deck/`. `render_column()` now assigns it as it
builds the child, making that the second of two places. The general shape: `add()` copies
`app` at *declaration* time, when a `page.js` at module scope has none, and only routing
fills it in later.

**Not generalised into `activate()`.** One line there (`this.app ??= this.parent?.app`)
would also cover a page a parent activates by hand into a region — `uses/split`'s two
panels, whose `app` is undefined today and harmless, because `container()` finds a region
before it ever reaches `this.app.$pages`. Touching `activate()` for every page on the site
to fix a case that does not throw is the wrong trade; **open**, if a third case turns up.

## Traps

- **`:has()` does not care whether a page is painted.** A closed page is still in the
  DOM — `@layer util` only stops it *rendering* — so a `:has()` rule keyed on a
  descendant's class keeps matching after you navigate away. Any such rule has to test
  the mark too: `:is(.active-page, .active-ancestor, .default)`. It shipped a one-way
  door in the `full` column collapse, 2026-08-26.
- **Going up the chain activates nothing.** `Router.activate()` diffs the chains and
  only touches what changed, so a navigation to an *ancestor* fires `deactivate()` and
  no `activate()` at all. Anything that refreshes on navigation needs both ends.
- **`View.stylesheet` is global, so two copies of one demo cannot both exist.**
  `old/overview/columns/` shipped its own `.page.columns`; once the same names landed
  in `Page.css` both sheets styled both demos and neither worked. The snapshot was
  deleted rather than renamed — 2026-08-26.
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
  `.grid` / `.flex` a page is allowed to wear. `./css.md`.
- **A page placed with no mark and no `default` is `display: none`**, and nothing
  throws — the arrangement contract. `activate()` now says so on localhost:
  `warn_if_hidden()` re-checks on a microtask, after whatever marks the chain has
  run, and stays quiet when a sibling in the same box is marked (an ancestor
  standing aside). Off localhost it does nothing at all.
- **A captured callback's return value is appended.** `div.c("pages", $p => this.regions.set(name, $p))`
  returns the `Map` and paints a literal `[object Map]` in the page. Nothing throws.
  Block body for any callback whose last expression is not a view.
- **`children` changes type.** You write a string, you read a `Map`.
- **A page built for a demo must not name its children as a string.** `children: "a b"`
  is a filesystem declaration: it probes the *server* for `<url>a/page.js`. A POJO
  (`children: { HTML(){ … } }`), object children or `add()`, and a fictional url on
  the root — which it needs anyway, since a child derives its url from its parent's.

## Proposed

Findings from the every-member audit. **None of these are applied** — they are for
The owner and other agents to shoot at.

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
`./method/nav_for.md`). Revisit if a fourth consumer has to thread names.

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
  imports currently pay HTTP requests for. `./declaring.md` has the shape. At
  ~160 pages, not yet.
- **The fetch cascade is on the critical path to paint**, roughly one round trip per
  level, deep links included. Accepted deliberately; not free.
- **`children` gets a property page and a guide page, at two urls.** `/api/children/`
  is the audit entry; `/children/` is the long form. That only works because
  `Doc` now nests members under an `api` group — before the split, a property
  named `children` was added *before* `load_all_children()` ran and shadowed the
  guide entirely. Worth remembering the next time a member and a guide share a word.
- **A directory named after a class `Page.css` styles used to collide with it.**
  `render()` stamped `page-<name>`, so a page named `previews` wore the card wall's
  own `.page-previews` and silently took its gap, `align-items` and `dense` — the
  fix stripped the class by hand in `activated()`. Fixed 2026-08-19: the stamp is
  `page--<name>` (double dash), so a page directory can no longer collide with a
  component class.
