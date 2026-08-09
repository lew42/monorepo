# classdoc — design record

A class's members as pages: real source, plus prose from a sibling `.md` file.
Documenting a member is *writing a file*.

```
content()               Overview          /View/
overview: "demos"       Overview's rail   /View/overview/demos/   ← overview/demos/page.js
children: "guide"       a top tab         /View/guide/            ← guide/page.js
properties: "el"        API               /View/api/el/           + doc/property/el.md
methods:    "append"    API               /View/api/append/       + doc/method/append.md
notes:      "capturing" Docs              /View/docs/capturing/   = doc/capturing.md
```

Two levels of `tabs()`: `this.tabs("overview api docs")` on the class page, and
`this.tabs().ac("vertical")` inside each group. A group is an ordinary `Page` whose
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

**`content()` is a child of its own group, not the group itself.** So a class with sub
pages and a class without are one shape — the rail's first entry is the overview, and
`tabs()`'s existing "first child is the panel's `.default`, and its link is the parent's
url" does the rest. The cost is one url nobody links to, `/View/overview/overview/`.

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
