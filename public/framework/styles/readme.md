# Styles — design record

The strategy in one line: **`framework.css` should contain nothing you would
ever want to override.** Everything downstream of it is arranged so that the
cheapest way to build something new is to write no CSS at all.

Format, as everywhere: **question → options → weighing → verdict.** A verdict of
*keep* counts — it stops an idea being re-litigated.

---

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
sizing, yes. `background: #eef0f4`, no. ColumnPager currently fails its own test
in a handful of places (`.topbar` white, `.main` #eef0f4, the `.col-*` chrome);
those are known debt, listed in §6.

**Corollary, and the load-bearing half of this file: if you ever override a
`framework.css` rule, that is a bug report about `framework.css`.** Record it
here. The fix is almost always to delete the rule or move it behind a class —
not to out-specify it downstream.

---

## 2. The type scale: one vocabulary, or per-component sizes?

**Before.** `Page.css` set `.page-title { font-size: 1.9em }`, `.page > h2 {
1.15em }`, `.page > h3 { 1em }`. `TabPager.css` and `ColumnPager.css` each
re-set `.page-title` for their context. `framework.css` had the heading rule
commented out. So the site's type scale was three-quarters of a scale, owned by
a component, scoped to direct children of `.page`.

That scoping was deliberate — the comment said headings inside a `demo()` should
keep "their plain browser look." But the same scoping meant an `h2` inside a
`.md` block (i.e. inside every readme and half the prose on the site) got the
*browser's* 1.5em while the `h2` beside it got 1.15em. Two scales, silently.

**Options.**

| | per-component (before) | scale in `framework.css` | separate opt-in `theme.css` |
|---|---|---|---|
| one answer for "how big is an h2" | no | yes | yes |
| works inside `.md`, demos, anywhere | no | yes | yes |
| `framework.css` stays opinion-free | yes | **no** | yes |
| files to import to get a normal-looking page | 1 | 1 | 2 |

**Weighing.** The third column is the principled one and it loses on the last
row. A framework whose baseline output is UA-default headings isn't neutral —
it's just wearing the browser's opinion instead of its own, and every consumer
immediately writes the same six rules. Six declarations is a small enough
opinion to hold, and it *removes* more CSS than it adds.

**Verdict: the scale lives in `framework.css` `@layer theme`.** Six levels — h1
page title, h2 section, h3 sub-section, h4 uppercase annotation, body, code —
each with a class alias (`.h1`–`.h4`, `.code`) so an element can borrow a level
without lying about the document outline. Sizes are the ones `Page.css` already
used, so nothing about this site moved except that it moved *consistently*.

Two deliberate consequences, recorded because they are visible:

- **`h2`/`h3` inside `.md` blocks got smaller** — they now match the scale
  instead of the UA default. This is the point, but it is a site-wide change.
- **Headings inside a `demo()` are now themed.** The old comment wanted them
  unthemed; that was never actually "neutral," it was the UA's opinion. A demo
  now shows what your code makes *in this theme*, which is the honest thing for
  a themed site to show.

**Margins stayed out of the scale.** Size/weight/tracking is what a level *is*;
margin is rhythm, and rhythm is set by whatever is arranging the content.
`Page.css` keeps `.page > h2 { margin: 2.2em 0 0.7em }` and the section rule
under it. This split is why the scale can apply globally without wrecking tight
contexts like a demo box or a preview card.

**Open:** the scale still has no `margin: 0` reset on headings, so an unarranged
`h2` gets UA margins (`0.83em`, relative to its own font-size). Zeroing them
would make rhythm fully explicit — and would require every arranger to opt in.
Not yet; revisit if a second context needs the same override `Page.css` does.

---

## 3. Should themes be scoped to `.app` so two variants can sit side by side?

**The want.** The same page rendered twice on one screen under two themes.

**Options.** (a) tokens on `:root`, themes override on `:root` — today's shape if
you're careless; (b) tokens on `:root`, themes override on `.app` /
`body.theme-x`; (c) tokens declared on `.app` itself, `:root` holds nothing.

**Weighing.** (c) sounds like the "correct" scoping and buys nothing: custom
properties already cascade, so a token declared at `:root` is overridable at any
depth. What actually blocks side-by-side variants isn't where the *defaults*
live, it's where the *overrides* live — an override at `:root` is global no
matter how the defaults were declared. (c) also breaks anything outside `.app`
(a portal, a dialog in the top layer).

**Verdict: keep (b), and make it a rule.** Defaults on `:root`; **a theme never
writes to `:root`.** `/styles.css` already does this correctly with
`body.theme-1 { … }`. Side-by-side variants work today with zero framework
changes — `div.c("app theme-a")` beside `div.c("app theme-b")`.

The real obstacle to two live apps on one page is JS, not CSS: `View.captor`,
`View.stylesheets` and `Page.registry` are statics, and the module registry is
per-realm (see `framework/readme.md` §7). CSS is not the binding constraint.

---

## 4. Versioned CSS — `v1`, `v1.1`, `v2`

**The ambition.** Rather than editing a working rule and breaking whatever
depended on it, add a class that layers the change on top, or swap to a new one.
A tree of versions instead of a mutating trunk.

**Weighing.** The additive half is already how the framework works, just without
the version numbering: `col: "narrow"`, `.page-preview.active`, `body.theme-1`,
`View.ctrl()` toggling classes. That's the good half and it costs nothing.

The numbering is where it gets expensive. `v1.1` only means something if there
is a promise about what `v1` contains, which means every rule needs a version,
which means `.card.v2` and `.button.v1.1` on the same page and a real question
about which cascade order they land in. Worse, it institutionalizes never
deleting anything — the opposite of the goal of this document.

**Verdict: no version numbers; keep the additive-class habit.** The thing
versioning is actually protecting against is *fear of editing a shared rule*,
and the cheap fix for that is small rules with obvious owners, which is §1. If a
component genuinely needs two incompatible looks, they get two names that say
what they are (`.page-preview` / `.page-preview-compact`), not two numbers.

Revisit if a real consumer outside this repo pins a look and can't move.

---

## 5. When does UI become a class?

**The question behind it:** `md()` and `syntax()` are functions that return
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

## 6. The eviction list

Rules currently in `framework.css` `@layer theme` that are opinions wearing a
baseline's clothes. Each is a candidate for deletion or for moving behind a
class. Listed, not yet acted on, because each needs a look at what breaks.

- **`select`'s SVG arrow.** A data-URI triangle and `appearance: none` — a
  whole visual design, unavoidable, in the base.
- **`.btn, button { padding: .25em 1em }`** and the `.bg` / `.prim` color
  variants. The variants are already opt-in classes and fine; the bare `button`
  padding is not.
- **`input … { border: 1px solid var(--subtle) }`.** Same shape of problem.
- **`html { scrollbar-color: … }`** — a look, applied globally.
- **`.app { background: #ddd }` in `/styles.css`** duplicates and fights
  `body.theme-1 .app { background: white }`. Site-level, but it's the same bug.

And in components, per §1's test:

- **`ColumnPager.css`** sets `.main { background: #eef0f4 }`, `.topbar
  { background: #fff }`, borders, and the whole `.col-bar` / `.col-path` /
  `.col-close` chrome. That chrome is developer affordance, not layout — the
  strongest candidate for extraction into a component of its own (which
  `framework/readme.md` §8 already flags for removal on other grounds).
- **`.page { background: white }` lives in `/styles.css`** while `Page` emits
  `.page` — so the framework alone renders an unstyled page. Noted in
  `framework/readme.md` §8; the fix is a minimal default here, at the cost of
  two rules that can drift.

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

**Done:** `ColumnPager.js` and `TabPager.js` now declare their dependency on
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
is breaking, and you alias on the way out (`--sidebar: var(--nav-width, 13em)`) —
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

## 9. The fightability problem — `:where()`

**The fear, stated exactly.** Framework-level theme rules are the ones you end
up fighting. There aren't many and they're mostly right, but when one is wrong
for your page you're in a specificity argument with the substrate — and the
usual escalation (more classes, `!important`, a later layer) makes the next
person's fight worse.

**Options.**

| | keep them fightable | delete every opinion | `@layer` alone | **`:where()`** |
|---|---|---|---|---|
| a bare page looks finished | yes | **no** | yes | yes |
| overriding costs | a specificity fight | n/a | a layer, site-wide | **nothing** |
| framework can still ship defaults | yes | no | yes | yes |
| reversible per-rule | no | n/a | no | yes |

**Weighing.** §6 (the eviction list) was the previous answer: if a default is
fightable, delete it. That's the right instinct pointed at the wrong cause. The
problem was never that the framework *has* opinions — it's that its opinions
*outrank yours by default*, which is an accident of how selectors are written,
not a design decision anyone made.

`:where()` has zero specificity. Wrap a rule in it and it loses to literally any
rule you write — a bare element selector, one class, anything. You never
out-specify the framework; it forfeits.

**Verdict: every selector in `framework.css`'s `@layer theme` is wrapped in
`:where()`.** Three escapes now exist, cheapest first:

```css
h2 { font-size: 2em }              /* a plain selector already wins */
.card :where(h2) { … }             /* scope it, still zero-specificity */
h2 { font-size: revert-layer }     /* drop to whatever came before */
```

Two things are deliberately **not** wrapped:

- **`:root` tokens.** Custom properties don't compete on specificity; they're
  inherited values, overridden by tree proximity (§3). Wrapping would change
  nothing and imply otherwise.
- **The `util` layer.** A utility class is an explicit opt-in and *should* beat
  component CSS — which the layer order already gives it. Zeroing its
  specificity would be actively wrong.

**This substantially dissolves §6.** The eviction list existed because opinions
in the base are dangerous. Zero-specificity opinions aren't — a `select` arrow
you can delete with one unqualified `select { appearance: auto }` is a
convenience, not a trap. Genuinely dead rules should still go; the urgency
doesn't survive.

**Known cost, recorded:** inside this layer, equal-specificity rules now resolve
by *source order* rather than by selector weight — `:where(button.bg)` no longer
outranks `:where(button)`, it just comes later in the file. That is fine within
one hand-ordered file and would not be fine spread across many. It's another
reason not to extend `:where()` to component stylesheets, which are written and
read independently.

---

## 10. Does an ext need any CSS?

**The question, asked of `md.css`:** it was 47 lines. How much of that is
markdown's?

**Almost none.** Markdown emits plain HTML — `pre`, `code`, `blockquote`,
`table`, `h2`. Those are *HTML's* looks. `md.css` owning them meant the site had
two blockquote designs (one for markdown, one for a hand-written
`blockquote()`), two table designs, and a `pre` that looked different depending
on who rendered it.

**The rule this generalizes to:**

> **A module styles the classes it emits. Generic elements belong to whoever
> styles generic elements** — `framework.css`.

`md.css` is now two classes: `.md-error` and `.md-details`. Both prefixed, both
emitted by `md.js`, both styled nowhere else. That's the target shape for every
ext.

**The `pre` finding is the strongest evidence this file has for §1's
"overriding the framework is a bug report."** Four stylesheets had an opinion
about one box: `framework.css` at `0.25em 0.5em`, and `md.css` (0.75/1),
`syntax.css` (0.75/1) and `demo.css` (0.9/1) each independently overriding it —
plus three verbatim copies of `pre > code { padding: 0; background: none }`.
Nobody coordinated; three of them landed within 0.15em of each other. The base
was simply wrong: `pre` is a block and `code` is inline, and one padding was
never going to fit both. Split in `framework.css`, all four overrides deleted.

**`md.details` — a reusable disclosure?** Yes, eventually. The look (top rule,
quiet summary, smaller body) is generic; only the *content* is markdown's.
**Verdict: extract `core/Details/` when a second disclosure appears, not
before** — one consumer doesn't justify a fourth file, and `.md-details` is
md's own prefixed class, so it's the safe kind of ownership meanwhile.
`summary { cursor: pointer }` did move to `framework.css`: that one is a UA gap,
not a design.

---

## 11. Native CSS mixins?

**Not usable yet.** `@mixin` / `@apply` are specified in **css-mixins-1** and
have landed in Chrome Canary, with Chrome 146 the expected ship — no browser
supports them in a release build, and no second engine has shipped. For a
no-build framework that runs the source directly, that's a "check back in a
year." (`@function`, the value-returning half of the same spec, shipped in
Chrome earlier and is equally single-engine.)

**What does the job today, and why you mostly don't want the mixin anyway:**

| want | native answer |
|---|---|
| `el1, el2, el3 { … }` written once | `:is(el1, el2, el3)` — or `:where(…)` when it should also be overridable |
| a named bundle of values | custom properties — `--pad: 0.25em 1em` |
| "piggyback on rules declared earlier" | a class, applied in the markup |
| undo an inherited decision | `revert-layer` |

The specific shape asked about — `el2 { @el1 }`, i.e. Sass's `@extend` — is the
one to avoid even once it's available. `@extend` works by rewriting selector
lists, so the styles you inherit arrive with the *original* selector's
specificity and source position, and the resulting cascade is genuinely hard to
predict. That's a known Sass footgun, not a gap in CSS. `:where()` plus a token
covers the honest cases without it.

---

## Still to write

This page documents the strategy. The styleguide (`page.js`) is meant to grow
until it covers **every line of `framework.css`** — each rule with its reasoning
and, where it's visible, a before/after pair. Three exist so far (`box-sizing`,
`font: inherit`, list indent); the pattern is a `compare()` of the same markup
with the declaration reverted inline. Uncovered so far: focus rings, the form
control block, `select`, buttons, every utility class, and the `zoom-*` family.
