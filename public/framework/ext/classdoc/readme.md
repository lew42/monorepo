# classdoc — design record

A class's members as pages: real source, plus prose from a sibling `.md` file.
Documenting a member is *writing a file*.

```
content()               Overview          /View/
overview: demos         Overview's rail   /Page/overview/<demo>/  demo configs (array) or dir names
children: "guide"       a top tab         /View/guide/            ← guide/page.js
properties: "el"        API               /View/api/el/           + doc/property/el.md
methods:    "append"    API               /View/api/append/       + doc/method/append.md
notes:      "capturing" Docs              /View/docs/capturing/   = doc/capturing.md
```

`this.tabs("overview api docs")` on the class page; `this.tabs().ac("vertical")`
inside API and Docs; `this.catalog()` inside Overview — the demos as a rail of
live cards, the intro as the region's default. A group is an ordinary `Page` whose
children are the rail, so both levels are real urls.

Long form: `./doc/rail.md` (the grouping, and why a rail rather than previews),
`./doc/reflection.md` (why the lists are typed, with the `toString()` measurements).

## Decisions

**How do three tabs sit above a rail?** As **pages**, not as a view mode. A group
(`overview`, `api`, `docs`) is a `Page` added in `initialize()`, and `tabs()` already
makes a page's children a bar plus a panel — so the second level cost no JS at all.
The alternative, one page rendering two navs over one flat set of children, cannot
work: `Page.container()` mounts a child in `parent.regions`, and a page that is not in
the active chain is `display: none`, rail and all. **Nesting has to follow the chain.**

**Where do the groups' names come from?** Fixed: `overview`, `api`, `docs`, labelled
`Overview`, `API`, `Docs`. Named groups (`groups: { … }`) were rejected — it is API
surface forever for a page shape that is the same on every class, and the whole point
is that a call site lists *members* and never says "tab".

**Member urls moved** — `/View/append/` is now `/View/api/append/`. Weighed against
keeping them flat by making the groups view-only: flat urls cost the tab bar its
marking, its history, and its reload. A url per tab was the requirement.

**`content()` is a child of its own group, not the group itself.** So a class with
demos and a class without are one shape — the intro (`name: "intro"`, labelled
Overview, wearing the class's icon) is the rail's first card and the region's
`.default`; a rail of one hides itself, so a class with no demos just shows its
intro. The cost is one url few will link to, `/View/overview/intro/`.

**That move now belongs to `catalog()`, not here.** It turned out to be the thing
standing between every other index on the site and a rail, so it was lifted into
`Page.prototype.catalog()` (2026-08-11) and the group config lost its hand-built
child list: the group declares `content`, `title` and `icon`, calls
`this.catalog()` in `initialize()`, and gets the same intro it always had.
`ext/catalog/readme.md` carries the verdict.

**The Overview is a catalog, and the doc is full width.** The groups rendered
`tabs().ac("vertical")` and the doc capped itself at 78em (64em for the overview).
Now `.page.classdoc` is `--measure: none`, the top bar spans the window, every
leaf — member pages included — renders on the standard page grid, and the Overview
group is a catalog: live cards in a persistent rail, the detail full width beside
them, which is the room a demo needs to render first and print its source
underneath. `overview:` takes the demo configs as an array or names sibling
directories — `core/Page/page.js` now names fourteen, one per demo. The `method` / `property` /
`note` classes died in the same pass — styled by nothing, and declaring `classes:`
forfeits the grid default a leaf now wants.

**The header is a well** (2026-08-12). The class name and the tab strip share **one
row** in a full-bleed band a shade darker than the page — title at the gutter, strip
bottom-aligned on the band's edge so the selected tab's notch still reaches the content.
`.tabs` is `display: contents` so the strip is a flex sibling of the title rather than
a box below it, and the panel takes a `100%` basis to claim its own line; below roughly
`title + 24em` the strip wraps under the title on its own, no media query. The fill is a
*shadow* (`light-dark(rgba(0,0,0,0.06), rgba(0,0,0,0.35))`), not a palette colour, so it
composites over whatever ground the host paints, and it darkens in both modes where this
theme's `wash → tint → surface` ladder only goes lighter. The selected tab fills with
`--wash`, the app's own ground, so tab and content read as one lighter surface cut into
the band. Type comes off the scale, never invented: the title is an `h1` wearing `.h2`,
the labels are `ext/tabs`' `.block` variant at the `h4` level. **One axis** — the title
and the content below both sit on `--gutter-x`, and the strip's single inset
(`gutter − tab-padding`) reads as a gutter-wide gap beside the title *and* lands the
labels on the axis once it wraps. Worth reopening if the theme ever grows a recessed
token — this is the only place on the site that wants one.

**Declared `children` stay top-level tabs.** A declared child resolves from
`<class>/<name>/page.js`; moving it under a group would mean moving the directory. So
`children:` is a peer tab and `overview:` is the sub page — one key per shape, both
resolved by the filesystem, neither breaking a url that already exists.

**An empty group has no tab.** A class with no notes has no Docs; no members, no API.
`ext/classdoc`'s own page is the live case — no `Class`, so no API tab.

**Reflect the method list?** No — one list, not two. Reflection would document
`append_fn`, `prepend_pojo`, `backtick_append`, and it *still* cannot tell you which
have prose. Recorded with its trigger: a hand-typed list goes stale **silently**, so
**if a class ever gets a "document everything" page, reflection is right for that page**
(`core/View` is now close to one). `./doc/reflection.md`.

**A patched method shows the patch, labelled.** `ext/highlight` replaces
`View.prototype.append` at import time, and a doc page that reads a live object is
documenting the *running program*. Detection is one line of trivia: JS infers a
function's name from assignment to an identifier, never to a member expression.

**Rejected: a `ClassDoc extends Page` subclass.** It has no named parts to override —
the whole job is *add some children* — and a subclass would fix the page's identity to
one class forever, where a function composes. `classdoc(page, Class, meta, names)` stays
exported for a page that wants two classes.

## Traps

- **⚠ `Class.prototype[name]` executes a getter.** `App.get loaded()` builds a
  `Promise.all`; read off a bare prototype it throws before `toString()` is reached.
  `Object.getOwnPropertyDescriptor` is the only way to hold an accessor's *function*.
- **⚠ `/app.js`'s default export is the app INSTANCE, not the class.** `import { App }`
  gets the class. Guarded with a named warning, because the raw failure is a `TypeError`
  naming neither `App` nor the import.
- **⚠ Class fields are invisible.** `render = () => {}` lives on the instance, and the
  symptom is identical to "no notes yet".
- **⚠ Statics are searched second.** A static and a method of one name: the method wins.
- **⚠ Every function owns `name`, `length` and `prototype`.** The static fallback in
  `declaration()` answered `name = "View"` — `Function.name` — for a documented
  *instance* property called `name`, and it read as a real declaration. Those five
  names now skip the fallback, so the page is prose alone, which is the honest answer.
- **⚠ A note sharing a name with a method** no longer collides — they are in different
  groups — but a note sharing a name with *another note* still does. Warned.

## Open

- **A missing `.md` renders `md.file`'s `.md-error` box.** Correct — it fails visibly —
  but the copy reads like a fault when the honest meaning is "nobody has written this
  yet." One string, not a mechanism.
