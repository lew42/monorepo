# Sidebar — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## Who uses it

Seven real `import { Sidebar }` sites, all constructing it directly (never
subclassed):

| caller | for | url |
|---|---|---|
| `framework/page.js` | the site's own section nav — `header` replaced with `app.brand()`, `pages: this.sections()` | `/framework/` |
| `page.js` (site root) | the homepage's nav, over plain `{title, url}` data | `/` |
| `michael/page.js` | a sandbox's own section nav | `/michael/` |
| `styles/layers/theme/lew42/page.js` | the theme comp, exercising both `brand` and grouped `pages` | `/framework/styles/layers/theme/lew42/` |
| `styles/layouts/sidebar/page.js` | the "no-rule" placement demo — `.ac("basis").style("--basis", "var(--sidebar)")` | `/framework/styles/layouts/sidebar/` |
| `core/Page/old/nav/page.js` | a nested demo showing `nav_for()` feeding a Sidebar | `/framework/core/Page/old/nav/` |
| `core/Sidebar/page.js` | this module's own three demos | `/framework/core/Sidebar/` |

A dozen more files (`faq/`, `ui/accordion/`, `web/nav/sidebar/`, `core/App/page.js`,
`core/page.js`, `core/Page/old/shell/page.js`, the layout galleries) **link to or
quote** `Sidebar` in prose without constructing one — not counted above.

**Not a module with no callers** — the opposite finding: it is the site's real
navigation chrome, in production at `/` and `/framework/`, not just a demo of
itself.

## Decisions

**Why a component tier for exactly one thing?** Because a sidebar is the one piece
of chrome that is genuinely the same everywhere, and it was extracted from the old
`ColumnPager` precisely so no layout would own it. It is a `View` subclass, so it
adds no tier. **The test if a second is proposed:** does every site want it, and does
it work with no configuration? A tab bar failed (which children are tabs is a
*placement* decision, so it is a method on `Page`); a card failed (a card is a link
with a border, so it is `.page-preview`).

**One `pages` property, or a second `groups`?** One. An entry with its own `pages`
**is** a group, duck-typed — a flat sidebar, a grouped one and a mix are the same
call, and it nests without a new concept. The cost is that a group heading can never
also be a link, which is correct anyway: a heading that navigates is a link
pretending to be a heading.

**What is an entry?** Anything answering `.label ?? .title` and `.url`. So a real
`Page` and a plain POJO both work — and `Page.nav_for(name)` returns exactly that
shape, which is how a parent hands its whole nav in:

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

That is `/framework/`'s entire navigation, and it means the panel, the tab bar and
the preview cards read **one** source. Before it, `/framework/` and `/michael/`
hand-rolled two menus over the same tree and already disagreed. See ./doc/entries.md.

**Where do labels and icons come from?** The child page's own `title` / `icon` —
and a menu name that differs from the title is `label` **on the child**, not a map
on the parent. There is no relabelling table: one was tried and removed, because it
put a child's name in two files and the parent's copy won silently when they
drifted. This section has now said the opposite twice and cited the file that had
already reversed it — **a cross-reference is not a check.** See
`core/Page/doc/labels.md` and ./doc/entries.md.

**Is `header` configured or replaced?** Replaced. The assign-based constructor makes
a passed `header` shadow the method, and the same is true of `footer` (`footer: null`
for none). **Accepting a View instead is the trap:** a View built to be passed in is
constructed *before* the Sidebar captures, so it lands wherever the captor happened
to be and then gets moved — the async-capture failure in synchronous clothing. A
function runs *while* the Sidebar is capturing. Use an arrow, so `this` stays the
page that knows the brand.

**Where does the footer go?** Below the nav, outside the scroller. `render()` is
`bar()` over `menu()`, and `menu()` is the nav over the footer; the nav is the only
scroller (`flex: 1 1 auto; min-height: 0; overflow-y: auto`), so the header and
footer are pinned **by structure, not by `position`**. It replaced a
`position: fixed` mode pill that floated over every page, full-bleed ones included.

**Why is the chevron `›` and not `chevron_right`?** `Sidebar.css` must not depend on
a font the app may never have loaded, or an un-themed sidebar reads
**"chevron_right"** down its margin. A ligature font fails *legibly*, which is a
virtue everywhere except in CSS `content`, where nobody chose to load it. It is
written `"\203A"`, never the literal — the deployed host serves CSS with no charset,
so a raw multi-byte character decodes as Windows-1252 and renders `â€º`.

## Traps

- **Size the text, pad the box, never the same element.** Both em bugs in this
  component were this bug: `--gutter: 2.6em` measured 36.5px on a `.h4` group title
  and 41.8px on every link. A custom property carries a **token**, not a resolved
  length. ./doc/comp.md.
- **Placement is not its business** — one line at the call site, and always the
  shared token with **no fallback**. ./doc/placement.md.
- **Anything that renders links late must re-run `mark_links()`.** `Router.mark()`
  has already been and gone. No view compares `window.location` itself.
- **A sidebar built without `app` has no mode toggle and says nothing.** Fine when
  meant; invisible when not — and it happens by accident inside a `Doc`
  overview, where `this.app` is `undefined`. `core/App/doc/adoption.md`.
- **⚠ One bad `icon:` on one child page WIDENS THE WHOLE SIDEBAR** — and nothing
  throws. Material Icons is a ligature font, so a name it does not carry renders as
  the literal *word*; that word is unbreakable, so it sets the link's min-content
  width, and a flex item's `min-width: auto` refuses to shrink below it. The
  `flex-basis` still reads the correct `19em` while the box renders wider, which is
  what makes it so hard to find. Measured 2026-08-16: `icon: "right_panel_open"` on
  one new ext page took the framework sidebar from **231px to 344px**, and everything
  else on the page shrank to pay for it. **Measure a name against the loaded font
  before using it** — render it at 24px and check the width is 24, not 384.

## 2026-09-18 — the tree, the resize, the workspace note

`site-sidebar-tree` (`ai/2026-09-18/site-sidebar-tree/`). Three things changed, in
priority order: rows are now `ux/Tree`, the panel resizes and remembers, and the
owner's "predefined workspaces" question got an answer without a build.

### Rows are `ux/Tree`, not `nav()`/`group()`/`link()`

`nav()` deleted its own hand-rolled walk and now builds a `Tree`: `Tree.from()`'s
own two lines (`Tree.nodes_of()` + `.draw()`, inlined so `reveal()` can chain after
the promise) when the caller passes `root: <a real Page>`, or `tree_nodes()` — the
same POJO `pages:` shape, converted to `ux/Tree`'s node shape recursively — when it
doesn't. **69 lines of list-building code removed**: `group()`/`link()` in
Sidebar.js (26 removed there against 136 added, most of it the tree wiring and the
resize below) and `.sidebar-link`/`.sidebar-group`/`.sidebar-group-title` in
Sidebar.css (43 removed against 106 added, mostly the `.ui-tree-*` dressing that
replaces them one-for-one). `Router.mark_links()` still does 100% of the
`.active`/`.in-path` marking — every `ux/Tree` row with an `href` is a real `<a>`,
exactly like the old `.sidebar-link` — so nothing about routing changed, as asked.

**`root: this` is the live, deep, lazy tree.** `Tree.from()` walks `page.children`
one level at a time — a branch fetches its own subtree the first time you open it —
so a fifty-module section still costs one row until you ask, and `adapt: true`
folds everything but the path you are on, its siblings and its own children: a
five-level site reads as a short list at every depth, exactly the deliverable's
ask. Demoed live, five levels and all, on this module's own page (`ux/`'s
`sample()` tree, wrapped in a one-line click guard rather than the full
`ext/demo/app.js` machinery — see `core/Sidebar/page.js`).

**`pages:` still works, unedited, for every caller that already uses it** — the six
real call sites (`framework/page.js`, `page.js` at the site root, `michael/page.js`,
`styles/layers/theme/lew42/page.js`, `styles/layouts/sidebar/page.js`,
`core/Page/old/nav/page.js`) all pass `pages: <a POJO array>` today, and every one
of them now renders through `ux/Tree` — the keyboard, the fold, the resize handle —
with **zero edits to any of them**. What they do NOT get today is the five-level
reach: `sections()` (in `framework/page.js`, outside this fence) only ever builds
**two** levels of POJO data (a section, and one flat level of its own children), so
`tree_nodes()` has nothing deeper to convert. **Left open, and it is a one-line
fix per call site** — `pages: this.sections()` → `root: this` — spelled out here
because `core/Sidebar/**` is the only directory this task could touch:
`core/Page` has another minion in it right now, and the other five files sit
outside the fence entirely. Whoever picks this up next: swap the one line, delete
`sections()` if nothing else calls it, done.

**What `ux/Tree` cannot say, logged rather than worked around:** a page can declare
`leaf: true` (`core/Page/doc/data-children.md`) — "I present myself, not my
children" — and `sections()` honours it by drawing that section as a flat link
however many children it actually has (`ux` and `ui` both do this on the real
site). `Tree.node_of()` has no idea `leaf` exists, so a `root:` tree would draw a
leaf section as an expandable branch instead. It never came up in this task's own
testing because every `pages:` caller's data already collapses a leaf section to a
plain `{title, url}` entry before `tree_nodes()` ever sees it — but a future
`root:` caller will hit it. `ux/Tree` is consumed, not edited, by this fence; this
is that module's own backlog now.

### Resizable, remembered, and why 20em not 19em or 18rem

**⚠ Superseded the same day — see "The grab becomes `ext/grip`" below.** The
paragraph that follows is accurate history: this is what was true for the few
hours between this section landing and the next one.

**The resize mechanism is `/layouts/shell/`'s `Shell.grab()`, copied, not
imported** (the brief's own instruction — the lab is not a dependency): pointer
capture on a 10px handle straddling the panel's right border, a live `pointermove`
writing the width, `dblclick` resetting it. The one real difference is where the
clamp lives — Shell clamps its OWN track's `flex-basis`; a `Sidebar` has no track
of its own to clamp, because **placement is not its business**
(`doc/placement.md`, unchanged) — `/styles.css` still owns `.topic > .sidebar {
flex: 0 0 var(--sidebar) }`, outside this fence. The fix: `.sidebar` now
re-declares `--sidebar` **on itself** —
`--sidebar: clamp(12rem, var(--sidebar-w), 50%)` — and a custom property declared
directly on an element always wins over one it would otherwise have inherited from
`:root`, regardless of `@layer` order or specificity. That single fact is what let
this land with no edit to `framework.css` or `/styles.css`, both outside the
fence.

**A real bug, caught by measuring rather than assuming:** the first version used
`--sidebar-w: 18rem` (the shell lab's own number) and measured **288px at every
one of 400 / 1280 / 1920 / 3440** — dead flat, the exact "widening the window did
nothing" failure this module's own `doc/comp.md` already has a war story about.
Cause: this site's fluid type scale is a clamp on `body` (`framework.css`), and
`rem` is always relative to `html`'s fixed 16px — `em` is what tracks the clamp,
inherited straight down from `body`. `/layouts/shell/` can use `rem` because that
lab's own page never asked to track the site's body clamp in the first place; a
`Sidebar` inherits it by construction, the same way the original `--sidebar: 19em`
always did (measured 229 / 243 / 274px across 1280/1920/3440 — the brief's own
numbers, reproduced exactly by loading the untouched file before editing it).
**Verdict: `em`, not `rem`, for the default; `rem` stays for the clamp's own
floor** — the brief's literal "12rem" — because a drag's minimum is a fixed
usability floor, not something that should shrink further on a small screen.

**The number: `20em`.** One `em` more than the original `19em`, which is the
smallest step that is honestly "larger" rather than "the same, argue about
rounding": measured **241 / 256 / 288px** across 1280/1920/3440 against the old
229 / 243 / 274px — +12 / +13 / +14px, growing with the screen the way the owner
asked ("help fill the horizontal space on my giant 3440 monitor") without eating
noticeably more of a 1280 laptop's content column. A bigger jump (`22em` was
tried in measurement, not shipped) read fine at 3440 and started to feel wide at
1280 next to a 52em-measure reading column; dragging is one gesture away and
remembered, so the default does not have to do all the work.

**One shared key, `lew42:sidebar`, keyed on nothing a page owns.** A plain
`this.store()` keys on the PAGE's own url, which is exactly wrong for a piece of
chrome the owner described as persistent across the whole site — resizing the
framework's own rail should not forget itself the moment you visit `/michael/`.
`Sidebar.Store`, a four-line hand-rolled handle matching `Page.Store`'s shape
(`get`/`patch`, a private-mode/quota catch) without needing a `Page` at all, is
what that took at the time.

**Merged into `Page.Store` itself, 2026-09-18** (`ai/2026-09-18/cleanup-2/`,
`core/Page/doc/decisions.md`'s own entry has the full record): `Page.Store` gained
an `id` field for exactly this — a caller with no page, one fixed key. `store()`
is `new Page.Store({ id: "sidebar" })` now; `Sidebar.Store` is deleted, not kept
as a wrapper. Same `lew42:sidebar` key, same `get`/`patch` shape, one fewer class
hand-rolling the same guarded `localStorage` touch.

**A drift this leaves behind, on purpose:** three other files read
`var(--sidebar)` to size a box that LOOKS like the sidebar without being one —
`apidoc/page.js`, `theme/lew42/page.js`, `styles/layouts/sidebar/page.js`. They
still read `framework.css`'s `:root { --sidebar: 19em }` (unedited, outside this
fence) rather than a real `Sidebar`'s new `20em` default or its live resized
width, because a custom property set directly on `.sidebar` never reaches a
sibling element by inheritance. They were already independent copies of the token
before this task (the resize did not create the drift, only widened the gap by a
few px); each is a one-line fix — point the copy at the real `Sidebar` instead of
the shared token, or accept the gap — for whoever owns those files.

### The workspace note — decided, not built

The owner, 2026-09-18: *"Maybe it's more like predefined workspaces where the
tree is a tree of things on a specific page, and when you click one it opens an
editor that has a main workspace and a column for a right sidebar for the
properties — fixed defined areas, and that right sidebar can be contextual."*

**That shape already exists, twice, and does not need a third build.**
[`/imagine/paging/make/`](/imagine/paging/make/) is a tree of things on one page
(a page's own blocks), and clicking one opens exactly that: a main workspace plus
a contextual right column for that selection's properties — tree · page ·
settings, selection-driven, the owner's sentence almost verbatim. `/layouts/shell/`
is the site-wide half of the same idea: a persistent left tree beside one main
region, sized and remembered the way this task just gave `core/Sidebar`. **The
site-wide shape is sidebar tree + page** — this component, now — **and a page that
wants a right properties column opts in the way Make does**: it is that PAGE's own
layout decision (a third region, selection-driven), not a thing `core/Sidebar` or
core's page grid should grow a config word for. Two consumers agreeing on a shape
without sharing a line of code is the strongest evidence a framework feature would
be premature, not the strongest case for one.

**The alternative — nested columns per sub-page (`core/Page`'s Miller-columns
shape, `core/Page/overview/columns/finder/`) — wins when the reader is meant to
compare siblings side by side**, not drill into one selection's properties: a
finder-style browse where the last two or three columns matter at once. It loses
here because the owner's sentence is explicitly about ONE selection at a time
(tree → main → its own properties), which is a master-detail-properties shape, not
a browse-several-things-at-once one.

## 2026-09-18 (later the same day) — the filter, and the grab becomes `ext/grip`

Two merges from the overlap study (`ai/2026-09-18/overlap-study/overlap.md`, its
`decision` lines `overlap-filter-into-sidebar` and `overlap-shared-resize-grab`),
picked up in `ai/2026-09-18/sidebar-filter/`.

**`ux/Filter` is now the search box above the tree.** It was 151 lines with zero
production callers before this — the owner's own sentence named "filters or toggles
or trees" as the three things the sidebar needed, and the tree half was already
done. `filter()` composes it with `segments: []` (this rail narrows by one fact, a
title, not a category, so the segment row it would otherwise draw stays empty) and
`search_field: "text"`, which reads straight off a `ux/Tree` node with no reshaping.
Sidebar owns the part `ux/Filter` has no idea about — which rows a `changed(
predicate)` keeps, which branches to open so a match is not hidden inside a shut
one, and putting the fold state back exactly as the reader left it when they clear
the box. Measured on `core/Sidebar/page.js`'s own "five levels" demo (`root:
sample()`), headless, Playwright: the tree's own 9 top-level rows, with the "JS"
branch opened by hand first (its 3 children load and count too — **12 rows
visible**); typing "syn" narrowed that to **2 rows** — "JS" itself (the ancestor of
the match, kept visible on purpose) and "Syntax" (the match); "HTML", which has
neither a title match nor a loaded matching descendant, confirmed hidden. Pressing
Escape put all 12 back and left "JS" open, exactly as it was before the first
keystroke. Zero console or page errors, same demo, at 400 / 1280 / 3440. Script:
`ai/2026-09-18/sidebar-filter/` (this task's own scratch directory kept nothing —
per the minion rule, scratch never lands in the repo).

**The one seam `ux/Filter` was missing: Escape clears the query.** Added to the
base `Filter` class, not bolted onto Sidebar from outside — `FilterChips`'s own ×
already did the same two lines under a different name (`clear_query()`), so that
method moved up from `FilterChips` to `Filter` and Escape (`field()`'s own
`keydown` listener) and the chip's × now call the one copy. Every existing
`Filter`/`FilterChips` caller keeps working unchanged; nobody had to opt in for
Escape to start working, because it was `Filter.field()` all four callers already
build through.

**No toggle.** The brief allowed one "if `ux/Filter` already offers one" — it
doesn't have a second axis that isn't a segment list, and this rail has no real
second category to filter by, so nothing was added. A future one (`adapt: false`
= "show every level", say) is a real caller decision for whoever wants it, not a
speculative surface here.

**Left open, on purpose, because of the fence, not because it was missed:** a row
inside an unopened lazy branch (`root:`'s `children` is still a function until
something opens it) cannot be searched — matching it would mean fetching a whole
subtree on every keystroke. The row is judged by its own title alone until a reader
opens it by hand. And keyboard arrow-navigation can still step onto a row this
filter hid (`ux/Tree`'s own `moves()` reads DOM class, not visibility) — the real
fix is a hook inside `ux/Tree` itself, which this task's fence forbids touching
(another minion has it under active edit today, `ai/2026-09-18/tree-fixes`).

**The grab becomes `ext/grip`.** `core/Sidebar`'s own `grab()` and `/layouts/
shell/`'s `Shell.grab()` were, as of this morning, a byte-for-byte copy of the same
pointer-capture gesture — confirmed by the paragraph above, written a few hours
before this one. `ext/grip` already existed (`dev/DevBar`, `ext/drawer`) and had
everything both copies needed except a double-click reset, so that became the one
thing added to `ext/grip` itself (an optional `reset` callback, wired to
`dblclick`) rather than reinvented a third time. `done` was already optional-in-
spirit for one of the two callers (`Shell`'s own `page.size_rail()` saves on every
call, not just on release) so `grip.js` now makes it a real optional parameter
(`done?.(width)`) instead of assuming every caller wants it. Both `grab()` methods
are now a handful of lines that call `grip({ from: "start", write, done?, reset })`;
both components' own hand-rolled `.sidebar-grab`/`.std-shell-grab` CSS (a
straddling 10px target, a `::after` line, a `-grabbing` class) is deleted —
`ext/grip`'s own `.grip`/`.grip-start`/`.grip-pill` draws both rails now, sitting
wholly inside the box instead of straddling its border.

**101 lines of the old pointer-capture code and its CSS deleted, replaced by 57
that call `ext/grip` — a net 44-line reduction**, counted hunk by hunk against the
exact text each `Edit` call matched (`Sidebar.js`'s `grab()`: 23 → 16; `Sidebar.css`'s
`.sidebar-grab` block: 25 → 7, its one-line narrow-mode override: 1 → 5 for an
explanatory comment; `Shell.js`'s `grab($track)`: 24 → 15; `shell.css`'s
`.std-shell-grab` block: 26 → 5, its narrow-mode override: 2 → 7; plus one new
`import grip` line in each `.js` file). This is bigger than the overlap study's own
~30-line estimate because that estimate only ever measured `Sidebar.js` against
`Shell.js`, not either file's CSS — which is where the other half of the removal
was hiding.

**Proved headless, both rails, drag AND double-click.** `core/Sidebar/page.js`'s
own demo box carries a fixed inline `width` (outside `.topic`, where `--sidebar`
would otherwise reach it), so dragging it was checked at the level the mechanism
actually lives — the `--sidebar-w` token and the localStorage key — rather than a
rendered size that this one demo was never going to show anyway: `--sidebar-w`
went from unset to `287px` on drag, `lew42:sidebar` in localStorage picked up
`{"px":287}`, and a double-click put both back to unset / `{"px":null}`. The REAL
site nav (`/framework/`, a live `Sidebar` actually inside `.topic`) was dragged too,
for the visible case: 241px → 348px, double-click back to 241px exactly.
`/layouts/shell/`'s own rail: 288px → 375px, double-click back to 288px exactly.
Zero console or page errors throughout.

## Proposed

Not applied unless marked adopted above. Each touches a core class, so it wants a
critique first.

**Should `$bar`, `$menu` and `$mode` be dropped?** ✅ **Adopted 2026-09-18.**
Measured: assigned, never read, by anything, anywhere. `$toggle` is read twice and
stays.
*Options:* (a) drop the three; (b) keep all four on consistency — a component's
parts are public by convention, and a subclass shouldn't have to `querySelector`;
(c) drop all four and let `open()` find the toggle by query.
*Weighing:* (c) trades a stored reference for a DOM query on every toggle, for
nothing. (b) is defensible but nobody has ever subclassed `Sidebar`, so it is
speculative surface. (a) makes the one remaining handle *mean* something.
**Recommendation: (a).** Landed while `Sidebar.js` was already being rewritten for
the tree: `bar()`/`menu()`/`footer()` return their box directly, `$toggle` is the
only handle left, and `./doc/views.md` needs a pass to stop describing four.

**Should the Escape handler live in `toggle()` rather than `render()`?**
`render()` is four lines, three of which are a keydown listener about narrow-screen
behaviour.
*Options:* (a) leave it; (b) move it into `toggle()`, beside the button it refocuses.
*Weighing:* the listener is on the sidebar, not the button — Escape has to work from
anywhere inside the panel — so (b) would attach a listener to `this` from inside a
method that builds a child, which is worse than the thing it fixes.
**Recommendation: (a), and stop calling it a wart.**

**Should the four header properties collapse?** `brand`, `brand_url`, `logo`,
`logo_url` — the widest surface on the class, and **two of them have never been
set** in five sandboxes and the whole framework.
*Options:* (a) keep all four; (b) drop `brand_url` and `logo_url`, on the grounds
that a site with an opinion about either should pass `header`; (c) collapse to
`brand: { text, url, logo, logo_url }`.
*Weighing:* (c) is one option instead of four and reads worse at every call site.
(b) removes two `??` from a line that has to exist anyway, and the case they serve
is real — `framework/page.js` needs a wordmark pointing at the section, and meets it
by replacing `header` entirely, which is the evidence for (b).
**Recommendation: (a), recorded** — the cost of keeping them is two `??`, and the
cost of removing them is a breaking change for a case that will come. Revisit if a
year passes with neither set.

**Should nested groups recurse, or be refused?** A group inside a group reaches
`link()` with an entry that has no `url` and renders `href="undefined"`, silently.
*Options:* (a) recurse in `nav()`; (b) `console.warn` on an entry with `pages`
inside a group; (c) leave it.
*Weighing:* (a) is one line and invites a nesting depth nobody has asked for, which
the CSS does not indent anyway. (c) is the current silent failure. (b) costs one
line and turns an invisible bug into a message.
**Recommendation: (b).**

**Should `open()` drop the computed method name?** `this[on ? "ac" : "rc"]("open")`
reads twice; `on ? this.ac("open") : this.rc("open")` is the same length.
**Recommendation: rename it to the plain ternary.** Local, obvious, no caller
affected.

## Open

- **`.brand` has two owners.** `Sidebar.header()` emits it and so does the site's
  `app.brand()` — same class, two components, which the naming rule forbids. It works
  because the site passes `header` so only one ever runs, and because this file scopes
  to `.sidebar .brand`. Still one class name short of a collision.
- **The favicon is the default logo.** `Sidebar.favicon()` reads the document's
  `<link rel="icon">` rather than hardcoding an asset path. Neat, and slightly magic —
  it reads DOM the class doesn't own.
- **The avatar is a placeholder.** A styled empty box with `title="Account"` that
  does nothing. The only speculative piece of the component.
- **A group leads with its section rather than linking its heading.** Every group's
  first entry is "Overview", pointing at the section's own url. Without it a grouped
  sidebar has no way to reach `/framework/core/` at all.
