# Page — design record

A node: a url, some content, and children. Dormant — constructing one renders
nothing, so `export default new Page(…)` is always import-safe.

Emits `.page`, `.page-title`, `.page-link`, `.page-previews`, `.page-preview`,
`.page-preview-title`, and reads `.pages` / `.active-page` / `.active-ancestor`.
`Page.css` styles all of them.

Every member has a page of its own under `page.js`'s rail — who calls it, whether it
is necessary, whether it is over-built. Seven live trees, one per variation, sit at
`overview/demos/`, on the `mini-app.js` beside them. Long form, one file per
question: `./doc/declaring.md` (the children list and the CMS question),
`./doc/labels.md` (titles, labels, icons, cards), `./doc/layout.md` (the whole CSS
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

**Where do a label and an icon live?** On the page they describe, as `label:` and
`icon:`. The `nav:` map on the parent is **gone** (Aug 2026) — with `label` on the
child it had one job left, and a parent that wants a different word in its own list
now spreads over the entry at the call site, where you can see it:
`{ ...this.nav_for(name), label: "Overview" }`. `./doc/labels.md`.

**`alias()` — deleted.** `add()` used to write every child onto its parent by name.
Nothing in `public/` ever read one, and it could not have been relied on anyway — an
alias exists only after that child is imported. It cost a `reserved` deny-list,
seven class fields declared only to be visible to a guard, and a cold-load-only
blanking bug when a child was named `view`. **A convenience that needs a deny-list is
not a convenience.**

**Where does a page mount?** `container()`, most specific claim first: a `regions`
entry my parent set for me, then the nearest ancestor with a `$pages`, then
`app.$pages`. It is the one step a reader of `Page.class.js` cannot see, which is
why the choice is logged.

**`tabs()` is not here.** `ext/tabs` patches it onto the prototype and fills
`regions`; `container()` only reads. Core never imports an ext, so the tab bar's CSS
left with it — 30% of `Page.css`, for one caller.

**How does a doc page show a real tree?** `overview/demos/mini-app.js` — a `View`
that plays App and Router for exactly one tree: it holds the `$pages` those pages
mount in, walks `child()` on a click, and marks what it shows. Everything inside is
this class doing its own `render()`, `previews()`, `nav_for()` and `chain()`, so a
demo cannot drift from the code it documents. Two things it deliberately does not
borrow from the real app:

| | why not | instead |
|---|---|---|
| the Router's clicks | a fictional url handed to `go()` would 404 the site | `preventDefault()` on its own subtree, for urls under its root only — `link_clicked()` bails on `defaultPrevented` |
| `.active-page`, `.active` | `mark()` and `mark_links()` wipe both across the **whole app** on every navigation, this widget included | `.default` — the arrangement contract's own "shown without being routed to" — and `aria-current` |

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
  `.grid` / `.flex` a page is allowed to wear. `./doc/layout.md`.
- **`children` changes type.** You write a string, you read a `Map`.
- **A page built for a demo must not name its children as a string.** `children: "a b"`
  is a filesystem declaration: it probes the *server* for `<url>a/page.js`. Object
  children or `add()`, and a fictional url on the root — which it needs anyway, since
  a child derives its url from its parent's.

## Proposed

Findings from the every-member audit. **None of these are applied** — they are for
Mike and other agents to shoot at.

### 1. `preview()` and `previews()` emit two different cards

`previews()` builds its card inline — icon, then `span.page-preview-title` — and
does **not** call `preview()`, which emits a bare `a.page-preview` carrying the
title as a text node. Two markup shapes wearing one class; `Page.css` styles the
flex one, so any rule reaching for `.page-preview-title` silently misses on the
other.

| | |
|---|---|
| `previews()` calls `preview()`, and `preview()` grows the icon | one shape; `preview()` needs a nav entry, so it takes an argument or reads its own `label`/`icon` |
| delete `preview()` | five sandbox call sites break; `link()` covers the intent |
| leave both | the divergence is invisible until a CSS rule misses |

**Recommendation: `previews()` calls `preview()`.** The icon and the title span are
what a preview card *is* — a bare anchor was the earlier, poorer version of the same
thing, not a second variant worth keeping.

### 2. `go()` has no callers anywhere

Not the framework, not an ext, not a sandbox. It is also the *imperative* way to do
the one thing this framework deliberately does declaratively: navigation is a real
`<a href>` that `Router.click()` upgrades, which is why Back works and why nothing
holds navigation state.

**Recommendation: delete.** `app.router.go(url)` is one property longer and says
which object is doing the work.

### 3. `description` is declared 30 times and read zero times

`Page` never touches it. `ext/classdoc` copies it onto the overview child, where
nothing reads it either. Framework-shaped API with no framework behaviour behind it.

Options: render it under the `h1`; carry it through `nav_for()` so cards can show it;
or delete it. **Recommendation: pick one and write it down** — a property this widely
declared and never read gets "fixed" by three people in three different ways.

### 4. `mounts_in()` is a public member whose whole job is a `console.log`

It returns its first argument. It exists so `container()` reads as three claims in
priority order rather than three claims interleaved with logging, which is the
house rule working — but it puts a side-effect-only method on the public prototype
with an imperative name that reads like a question.

**Recommendation: keep, and revisit if the logging ever goes.** The observability is
load-bearing: `container()` is the one piece of black magic left, and the log is what
makes it observable rather than merely declarative.

### 5. Two `parent` properties, one dot apart

`Page.parent` is tree position; `View.parent` is DOM containment, written by
`append()` and read by nothing. A Page's `view` is a View, so `page.parent` and
`page.view.parent` answer different questions with the same word.

**Recommendation: delete `View.parent`** (see `core/View/readme.md` §8). Nothing
reads it, and its absence removes the collision entirely.

### 6. `load_all_children()` could be `load_children()`

The `all` distinguished it from the lazy tier, and there is no lazy tier. Two call
sites, both in this file.

**Recommendation: leave it.** `all` still says something true — it means *my whole
subtree*, not just my direct children — and a rename touching a core method for four
characters is not worth the churn. Recorded so it stops being re-proposed.

### 7. `nav_for(name)` takes a name, not a child

It reads `this.children` itself, so it cannot answer for a page that is not a child,
and a caller holding a `Page` must know its name to ask. That is arguably correct —
an entry belongs to the list it appears in — but it is why `styles/gallery` threads
names rather than pages through three call sites.

**Recommendation: keep, and document the constraint** (done, in
`./doc/method/nav_for.md`). Revisit if a fourth consumer has to thread names.

### 8. `Router.mark()` wipes marks the Router does not own

Found by building the demos. `mark()` clears `.active-page` / `.active-ancestor` from
**every node under `$app`** and `mark_links()` does the same to `.active` / `.in-path`
— on every navigation, including the one that first renders the widget. So anything
rendering a real `Page` outside the router's chain is blanked the next time anyone
clicks anything: a `.page` with no mark is `display: none` by the arrangement
contract, and nothing throws. `mini-app.js` sidesteps it with `.default` and
`aria-current`, which is fine for doc machinery and wrong as the general answer.

| | |
|---|---|
| scope the wipe to `from`, the chain `activate()` already holds | one more thing `activate()` must pass along; misses a page removed some other way |
| bless `.default` as the opt-out, in `doc/layout.md` | free, but it makes "shown without being routed to" mean two things |
| leave it | the next widget that renders a page finds this the hard way |

**Recommendation: scope the wipe.** It is the same *only what changed* discipline
`activate()` follows two lines above, and a query across every node in the app to
undo three classes is doing it the expensive way as well as the surprising one.

## Open

- **Two variations still have no demo.** *An undeclared child resolves anyway* cannot
  be shown at all — the lesson **is** the filesystem probe, and a demo tree must not
  touch the network. *`container()`'s two levels* is buildable, and blocked on one
  line: `tabs()` ends with `this.app?.loaders.push(…)`, which throws for any `app`
  that is not the App. `?.` on `loaders` would let a miniature carry a tab set, and a
  region demo with it.
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
