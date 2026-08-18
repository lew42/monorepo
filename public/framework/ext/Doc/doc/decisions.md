# Doc — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

A module documented as a page: its **files**, its **members**, its **notes** — each
one a real url, each one backed by a `.md` file you wrote next door. Documenting
anything is *writing a file*; `Doc` is what serves those files as a browsable page.

```
content()                Overview          /View/
overview: demos          Overview's rail   /View/overview/<demo>/   demo configs (array) or dir names
children: "guide"        a top tab         /View/guide/             ← guide/page.js
properties: "el"         API               /View/api/el/            + doc/property/el.md
methods:    "append"     API               /View/api/append/        + doc/method/append.md
notes:      "capturing"  Docs              /View/doc/capturing/     = doc/capturing.md
files:      "View.js"    Files             /View/files/             + doc/file/View.js.md
```

**Top tabs are sections; the inner left rail is sub-sections.** That is the whole
layout, and it is `tabs()` twice — `this.tabs(this.bar())` on the Doc,
`this.tabs().ac("vertical")` inside each section. A section is an ordinary `Page`
whose children are the rail, so both levels are real urls with real marking.

## The five lists

Every list is **hand-typed and authorial** — it says which members are worth
reading, and in what order. Reflection could keep a method list in sync for free
and still could not say which members have prose, and the prose is the feature.
Long form, with the `toString()` measurements: [`reflection.md`](./reflection.md).

## `subject` — classes and non-classes alike

`subject` is whatever owns the members: a **class** (`View`), a **function with
properties** (`md`, `demo`), a **namespace object** (`ui`), or **nothing at all** —
a module of loose functions documents itself with `notes:` and `files:` and never
passes one. `member()` looks on `subject.prototype` first, then on the subject
itself, which covers all four with one lookup.

Only a real class gets the **Overrides** line, because only a class has instances
for an assigned member to shadow. `Doc.is_class` tests the source text rather than
`typeof`, since `md` is a function too and owns a `prototype` like every other one.

## Files — the module as a pseudo-IDE

`files:` lists the module's real files (never `doc/` or `ai/` — those are the
documentation, not the module). The tab is `ext/files` with its `about` hook: the
tree, `doc/file/<path>.md`, and the fetched source — so what a file *is for* sits
beside what it *says*. Since 2026-08-16 those three are **ext/Panel leaves**, so
the seams are grips a reader drags; `Doc.browser()` is unchanged by that (one call,
one hook) and `Doc.css` only retunes `--panel-height`, because this browser is the
whole tab rather than a figure inside a page. Why a declared list and not
`directory.json`: [`files.md`](./files.md).

## The rail, and why the Overview is a catalog

The Overview is `catalog()` — the demos as a persistent rail of live cards, the
intro as the region's default. [`rail.md`](./rail.md) has the grouping
argument in full, including why a rail beat a wall of preview cards.

## Decisions

**A Doc's sections are children, so a Doc's own wall has to subtract them**
(2026-08-16). `sections()` adds Overview, API, Docs and Files to `this.children`
because they *are* pages — that is what buys a member a url and a back button. The
cost surfaced on `/framework/ui/`, whose Overview draws its nineteen components:
`previews()` drew twenty-three, the last four being the page's own tab strip. Three
answers were weighed — mark the sections with an inert flag `previews()` reads (the
black-magic marker RULE#8 forbids), swap `this.children` around the call (a mutation
window inside a render), or give `previews()` the subset. **Verdict: `wall()`**, one
line over a `previews(pages)` parameter that defaults to `this.children`, so there is
still exactly one wall mechanism on the site. `Doc.SECTIONS` is now the single list
`bar()` orders by and `wall()` subtracts — it was inlined in `bar()` before.

**It is a class now, and it documents more than classes** (2026-08-15, the owner). This
module was `ext/classdoc`, a function, and the record here argued against a
subclass on the grounds that it had *"no named parts to override."* That was true
of a page shape fixed at three tabs, and it stopped being true the moment a module
could want a fourth. `Doc` names `sections()`, `section()`, each `*_section()`,
`api()`, `docs()`, `member_page()`, `bar()`, `well()` and `render()` — a module
with a different shape overrides one of them instead of the config growing an
option. `Class:` became `subject:` in the same pass, because a class was never the
only thing worth documenting. The composable `classdoc(page, Class, meta, names)`
form went with it — zero callers, and `api(section)` is the seam now.

**⚠ No class fields in `Doc.js`.** A field initializes *after* `super()` returns,
and `initialize()` runs *inside* it — so a field would arrive after the sections it
was meant to configure. Prototype methods and statics only. Same shape as the
`classify()` trap in `core/View`.

**Where the section names come from.** Fixed: `overview`, `api`, `docs`, `files`.
Named sections (`sections: { … }`) stay rejected — it is API surface forever for a
page shape that is the same on every module, and the point is that a call site
lists *members* and never says "tab". A module that needs a fifth section
subclasses `sections()`, which costs nothing and is visible in its own file.

**Declared `children` stay top-level tabs.** A declared child resolves from
`<module>/<name>/page.js`; moving it under a section would mean moving the
directory. So `children:` is a peer tab and `overview:` is the sub page — one key
per shape, both resolved by the filesystem, neither breaking an existing url.

**An empty section has no tab.** No members, no API; no notes, no Docs; no files,
no Files. A bar of one hides itself (`tabs.css`), so a module with an Overview and
nothing else renders as a plain page.

**The header is a well.** The module name and the tab strip share **one row** in a
full-bleed band a shade darker than the page — title at the gutter, strip
bottom-aligned on the band's edge so the selected tab's notch still reaches the
content. `.tabs` is `display: contents` so the strip is a flex sibling of the title
rather than a box below it; below roughly `title + 24em` it wraps under the title
on its own, no media query. The fill is a **shadow**, not a palette colour, so it
composites over whatever ground the host paints and darkens in both modes where
this theme's `wash → tint → surface` ladder only goes lighter. **One axis** — title,
content and (once wrapped) the tab labels all sit on `--gutter-x`.

**A patched method shows the patch, labelled.** `ext/highlight` replaces
`View.prototype.append` at import time, and a doc page that reads a live object is
documenting the *running program*. Detection is one line of trivia: JS infers a
function's name from assignment to an identifier, never to a member expression.

## Traps

- **⚠ `bar()` and the mount region are the same list.** `tabs()` registers a child's
  region from the names it draws the strip from (`ext/tabs`), so a name dropped from
  `bar()` also loses its `regions` entry — and `Page.container()` then walks up to the
  nearest ancestor `$pages` and renders that child **over the surrounding page**. A Doc
  shortening its strip has to re-register the dropped names against the panel
  (`this.regions.get("overview")`), which is what `/framework/ui/` does.
- **⚠ `subject.prototype[name]` executes a getter.** `App.get loaded()` builds a
  `Promise.all`; read off a bare prototype it throws before `toString()` is reached.
  `Object.getOwnPropertyDescriptor` is the only way to hold an accessor's *function*.
- **⚠ `/app.js`'s default export is the app INSTANCE, not the class.** An instance
  carries no prototype, so every member page comes up empty with no error. The
  "has no member" warning names this, because the raw failure names nothing.
- **⚠ Class fields are invisible.** `render = () => {}` lives on the instance, and
  the symptom is identical to "no notes yet".
- **⚠ Statics are searched second.** A static and a method of one name: the method wins.
- **⚠ Every function owns `name`, `length` and `prototype`.** The static fallback in
  `Doc.declaration()` answered `name = "View"` — `Function.name` — for a documented
  *instance* property called `name`, and it read as a real declaration. Those five
  names (`Doc.intrinsic`) skip the fallback, so the page is prose alone.
- **⚠ A note sharing a name with another note** collides. Warned.
- **`content()` is bound to the `Doc`** — *fixed the day it was found.* It used to
  run bound to the Overview **section**, because `catalog()` makes `content` the
  intro child's and the intro belongs to the section. Three auditors hit it within
  the hour: `ui`'s lost time to `this.previews()` silently drawing nothing, and
  `ext/DesignTool`'s and `ext/Ask`'s pages both **threw** on `this.look()` /
  `this.asker()` — helpers they had written on the config, one line above the call.
  Three independent readers expecting the same thing is the design telling you
  which binding is right. `overview_section()` now binds it. ⚠ The consequence:
  `this.parent` inside `content()` is the module's parent, not the section.

## Open

- **`files:` goes stale silently** — a file added to the module and not to the list
  is simply absent from the tab. The trade is recorded in [`files.md`](./files.md);
  the check belongs in the `documentation` skill, not in a crawler.
- **Every tab has two `h1`s.** `well()` emits `h1.doc-title` and the routed page
  emits its own `h1.page-title` — so `ext/DesignTool` reports `hierarchy: 2 level-1
  headings on one page` on every Doc on the site, at every width. Found on
  `styles/layouts/space/words/` (2026-08-16) and reproduced on `/framework/ext/Doc/`
  itself, so it is this module's and not any page's. The well's title is the one
  that is really the page's top; the fix is probably `h2` markup wearing the `h1`
  look, or the section suppressing the child's. The owner's call which.
