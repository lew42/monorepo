# Ownership — where a rule goes, and who it belongs to

Split out of `readme.md`; format is question → options → weighing → verdict.

> **`ColumnPager` and `TabPager` were the layout tier when most of this was
> written.** That tier is gone (`Pager` survives, vendored, in
> `michael/pager/legacy/`), and an arrangement is a CSS
> class a page opts into. **The reasoning is still live** — every rule about
> ownership, layers and escalation applies unchanged, and the Pager cases are the
> best worked examples these records have. Read those names as *"a layout
> component"*, not as something that ships. The same applies to
> `styles/components/`, which is `framework/ui/` now.

## 1. Where does a new rule go?

**The problem.** Every new module wants a stylesheet, and every stylesheet is a
future override fight. `ColumnPager.css` was once ~250 lines because it styled
breadcrumbs, preview cards, page titles and link states — none of which are
layout, all of which broke the moment those things appeared outside a
ColumnPager.

**Verdict — the ladder. Stop at the first rung that works:**

1. **Nothing.** The default already handles it.
2. **A utility class.** `flex gap v-center pad h2`.
3. **An existing component's class.** `.page-preview`, `.sidebar-link`, `.page-crumb`.
4. **The module's own `.css` — layout only.** Where things sit, how they size,
   how they respond. Not color, not borders, not type.
5. **`/styles.css` — skin.** This site's opinion. Loaded last, wins at equal
   specificity.

Rung 4 is the one that needs policing, so it gets a test: *would this rule still
be right if the component were dropped into a completely different site?* Flex
sizing, yes. `background: #eef0f4`, no. ColumnPager failed its own test
in a handful of places (`.topbar` white, `.main` #eef0f4, the `.col-*` chrome);
those are known debt, listed in §6.

**Corollary, and the load-bearing half of this file: if you ever override a
`framework.css` rule, that is a bug report about `framework.css`.** Record it
here. The fix is almost always to delete the rule or move it behind a class —
not to out-specify it downstream.

---

## 5. When does UI become a class?

**The question behind it:** `md()` and `code.js()` are functions that return
views; `Sidebar` is a `View` subclass. Which is the default?

**Weighing.** A `View` subclass buys three things: `classify()` (the class name
becomes the CSS class), a `render()` hook that runs at construction, and
somewhere for methods to live so a *subclass* can override one piece
(`ColumnPager.brand()`, `.crumbs()`, `.columns()` — the entire extension story
for layouts). It costs an initialization order you now have to understand.

A factory function buys nothing to understand and can't be extended by
overriding one method — you copy it or you parameterize it.

**Verdict: factory function by default; subclass when someone will override a
part of it.** That predicts every existing case correctly: `md`/`syntax` are
one-shot transforms nobody subclasses; `Sidebar` and the Pagers are arrangements
whose whole design is "override `nav()`". The tell is not complexity, it's
whether the thing has *named parts*.

Either way the CSS rule is the same — layout in the module's file, skin
elsewhere — so this choice doesn't change §1.

---

## 7. Why `framework.css` stays at `framework/framework.css`

It's the one file every page depends on and the one people open by hand. Moving
it into `styles/` alongside these docs would be tidier and would cost a
well-known path for no gain. **Keep it where it is**; this directory documents
it rather than owning it.

---

## 8. CSS dependencies — what a module relies on, and how it says so

**The problem.** `.ac("page-preview")` is an import with no `import` statement. So
is `var(--sidebar)`, and so is a `.column-pager > .sidebar` selector that assumes
someone else's DOM shape. None of them appear in the module graph, so a rename
is silent, a grep for consumers finds nothing, and a lean app can load a
stylesheet's *consumer* without its *owner*.

Six kinds, and they are not equally dangerous:

| kind | example | declared? | on rename |
|---|---|---|---|
| **token** | `var(--sidebar)` | yes — it's a named interface | visibly breaks |
| **own class** | `Sidebar.js` writes `.sidebar-link`, `Sidebar.css` styles it | n/a — one directory, one commit | caught immediately |
| **foreign class** | `ColumnPager.css` styles `.page-preview` | **no** | **silent** |
| **DOM shape** | `.column-pager > .sidebar` | by the JS `import` of Sidebar | visibly breaks |
| **container name** | `container-name: col` | only by comment | silent |
| **load order** | `/styles.css` wins by being linked last | no | silent |

Only row three is a real problem, and rows five and six are small enough to
handle with a comment. What follows is about row three.

### Should a module `import` the owner of a class it styles?

**Yes — and it is not a lint annotation, it's the loading edge.** `View.stylesheet()`
runs at module scope, so `import` is literally the mechanism by which a
stylesheet gets loaded. Before this entry, `ColumnPager.css` styled `.page`,
`.page-title` and the preview classes while `ColumnPager.js` never imported
`Page` — it worked only because `App.js` imports `Page` for unrelated reasons.
That is not a dependency, it is a coincidence that happened to hold.

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

One line, zero runtime cost (the module is already in the registry), and it buys
three things: the stylesheet is guaranteed present, `grep -rn Page.class.js`
lists everyone a rename would break, and the comment says *which* names are
load-bearing. The comment is not decoration — without it someone deletes the
"unused" import.

**Stated limit: this does not detect a rename.** Nothing without a build step
does. It converts a silent runtime break into a discoverable one, which is a
different and smaller claim.

**Done** (in the tier as it then stood): `ColumnPager.js` and `TabPager.js` declared their dependency on
`Page`.

### Should every selector be registered?

**Options.** (a) nothing, grep; (b) a JS manifest per stylesheet listing its
selectors, checked for duplicates at boot; (c) a naming prefix; (d) a dev-only
runtime audit.

**Weighing (b).** A registry catches exactly one failure — two modules defining
the same class. It cannot catch the far more common one: a class renamed on one
side while the other still says the old name. And it costs a hand-maintained
second source of truth for the very names it is protecting. A drifted registry
is worse than no registry.

**Verdict: (c), the prefix — the class name *is* the registration.** Zero
runtime, no manifest, cannot drift, and it names the owner at every call site
including inside someone else's file.

> **A class must be prefixed with its owning component, unless the selector
> already starts with that component's own class.**

`.column-pager .crumb-sep` is fine — it can't reach anything ColumnPager doesn't
contain. `.page-preview` must be prefixed, because it is styled unscoped
*on purpose* (a card must look like a card in a ColumnPager, a TabPager, or a
bare page), and an unscoped name has nothing but the name for a namespace.

The codebase was already ~80% compliant (`.page-title`, `.page-link`,
`.sidebar-link`, `.demo-code`, `.md-details`, `.tab-panel`). **Done:** the
exceptions — `.preview`, `.previews`, `.preview-title`, `.preview-desc`,
`.crumb` — are now `.page-*`. Contained to three files, because no page ever
writes those strings; they call `previews()` and `crumb()`, which are the actual
API and are unchanged.

**Verdict on (d): worth building, not built.** ~30 lines in `framework/dev/`:
walk `document.styleSheets` for every class selector, walk `$app` for every
applied class, report both diffs. It catches renames in *both* directions, which
(b) cannot. It must be a console command (`app.css_audit()`), not a warning —
state classes (`.active`, `.in-path`, `.nav-open`) and conditionally-applied
utilities would make it noisy on every load.

### And `--sidebar`?

**This is the good kind of dependency and should not be mitigated away.** A
`var()` is named, greppable, and declared — the opposite of a class-name
dependency. Four sandbox directories already consume `--prim`/`--bg`/`--subtle`,
so the token set is public API with real external users.

The framing in the question — *what if ColumnPager leaves the framework?* — has
it backwards. The token isn't ColumnPager's; ColumnPager leaving doesn't take it.
What would actually break is `framework.css` dropping `--sidebar`, and "tokens
are public API" is exactly the rule that prevents that. Adding is free; renaming
is breaking, and you alias on the way out (`--sidebar: var(--nav-width, 19em)`) —
the same rule `framework/readme.md` §8 sets for JS.

**No defensive `var(--x, fallback)` on shared geometry.** `--sidebar` is shared
*on purpose* (ColumnPager and the home page must agree), so a fallback would
reintroduce the two-numbers-that-drift problem the token exists to solve. Use a
fallback only where the value is a component's private default that a theme may
override — and there is no such case today.

### Known remaining offender

`Page.css` styles `.page > .md` — core reaching into an ext, and undeclarable,
because core may not import an ext. Unlike the `.demo-code` case (deleted: it was
redundant, since `.demo-code` **is** a `<pre>` and the element selector already
won on specificity), this one is real. The fix is to move the rule to `md.css` as
a plain `.md { margin: … }` — a markdown block wanting block rhythm is markdown's
business, and the `util` layer's `:first-child { margin-top: 0 }` already handles
the leading edge. Left undone because it changes spacing everywhere `md()`
appears, which wants a visual check, not a reasoned one.

---

