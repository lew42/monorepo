# Styles — design record

The strategy in one line: **`framework.css` should contain nothing you would
ever want to override.** Everything downstream of it is arranged so that the
cheapest way to build something new is to write no CSS at all.

> **Note, 2026-08.** `ColumnPager` and `TabPager` were the layout tier when most of
> this was written. They are now dead code in `core/legacy/`, and an arrangement is
> a CSS class a page opts into (`core/Page/Page.css`). **The reasoning below is
> still live** — every rule about ownership, layers and escalation applies
> unchanged, and the Pager examples are the best worked cases this file has. Read
> those names as *"a layout component"*, not as something that ships.


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
sizing, yes. `background: #eef0f4`, no. ColumnPager failed its own test
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

## 6. The eviction list

**Narrowed by §12.** This list was written when the base layer was "framework
styles you might have to fight." Now that it's explicitly *the base theme* — the
one you get free, replaced by loading another — having opinions is its job. The
test is no longer "is this opinionated" but **"is this dead, or is it reachable
only by a fight."** Two of the original entries survive that, two don't.

**Evicted, and what it cost to notice.** Four margins had to go before the flow
rules (§9a) could own rhythm, because an element selector at (0,0,1) beats a
`:where()` rule at (0,0,0):

| was | why it left |
|---|---|
| `table { margin: 1em 0 }` | rhythm, living in the base theme |
| `hr { margin: 3em 0 }` | same. Replaced with `border-top: 1px solid var(--line)`, which is what an `hr` actually needed |
| `figure`'s UA `margin: 1em 40px` | never declared here at all, so every `figure` on the site sat indented 40px. The flow zeroes *block* margins only, so the inline half survived. Now `figure { margin: 0 }` in `base` |
| `dd`'s UA `margin-left: 40px` | the exact bug `ul, ol { padding-left: 1.2em }` was already written to fix, missed because `dl` has no View factory |

**The general rule this confirms: a margin on a generic element in the base theme
is nearly always rhythm in the wrong place.** Spacing belongs to whatever arranges
the content.

**`table` got a scroller, and the reason it took this long is instructive.** `pre`
has had `overflow-x: auto` since the reset was written; `table` never did, because
nobody had looked at a wide one in a narrow column. Measured at 390px: a 442px
table in a 262px column, and **the whole region scrolling sideways to accommodate
it** — so the symptom presented as "the page overflows", not as "the table is too
wide", and every attempt to find the offending element pointed at an ancestor.

```css
table { display: block; width: max-content; max-width: 100%; overflow-x: auto; }
```

Four declarations that only work together: `max-content` keeps a small table small,
`max-width: 100%` makes a wrappable one fill the column and wrap normally, and
`overflow-x` catches only the case that genuinely cannot shrink — a `nowrap` cell,
or a long unbroken string. `display: block` is what makes `overflow` apply at all;
the rows keep their own table display values, so nothing about the layout inside
changes.

**The general lesson: an element that cannot shrink and has no scroller of its own
will make its ancestors overflow instead.** `pre` and `table` are the two in HTML
that do this. There is no third, which is why this list is now complete rather than
open.

Three more were found by writing `/framework/styles/elements/`, which is the
argument for that section existing at all — documenting every element is how you
discover the ones nobody looked at:

- **`input[type=range]` took the text-field border**, because neither `:not()` list
  named it. A 1px border around a slider is not a control anyone designed. Fixed.
- **`audio` and `iframe` were missing** from `img, picture, video, canvas, svg
  { display: block; max-width: 100% }`. Both have View factories; both kept the
  inline baseline gap the rule exists to remove, and an `iframe` could overflow its
  column. Fixed.
- **`kbd` and `samp` were missing** from the `--mono` rule, so they rendered at a
  visibly different size from a `code` in the same sentence. Fixed.
- **`:focus-visible { outline-width: 2px }` genuinely did nothing**, and the reason
  is worth keeping: no `outline-style` is set, so the ring is the UA's
  `outline-style: auto`, which **follows `border-radius`** and by spec **ignores
  `outline-width`**. A `solid` outline honours the width and draws a square ring
  around a rounded control. That is also the answer to the old
  *"messes with the border radius???"* comment beside it. Rounded rings win; the
  declaration was deleted and the reasoning written into the file.

Still evictable:

- **`select`'s SVG arrow.** A data-URI triangle plus `appearance: none`. Not
  because it's opinionated — because it's the one rule here a theme genuinely
  struggles to replace: you must know to re-set `appearance` *and* clear three
  `background-*` longhands. If any rule in the file earns a `:where()` (§9),
  it's this one.
- **`html { scrollbar-color: … }`** — a look with no token behind it, so a theme
  can't retune it without a selector. Give it a token or drop it.

No longer evictable (they're the base theme doing its job, and a theme overrides
them at equal specificity):

- `.btn, button { padding }` and the `.bg` / `.prim` variants.
- `input … { border: 1px solid var(--subtle) }` — and it reads a token, so a
  theme already controls it.

Site-level, unchanged:
- **`.app { background: #ddd }` in `/styles.css`** duplicates and fights
  `body.theme-1 .app { background: white }`. Site-level, but it's the same bug.

And in components, per §1's test:

- **`ColumnPager.css`** set `.main { background: #eef0f4 }`, `.topbar
  { background: #fff }`, borders, and the whole `.col-bar` / `.col-path` /
  `.col-close` chrome. That chrome is developer affordance, not layout — the
  strongest candidate for extraction into a component of its own (which
  `framework/readme.md` §8 already flags for removal on other grounds).
- **`.page { background: white }` lives in `/styles.css`** while `Page` emits
  `.page` — so the framework alone renders an unstyled page. Noted in
  `framework/readme.md` §8; the fix is a minimal default here, at the cost of
  two rules that can drift.

---

## 6b. A doc page that quotes a rule is a claim that can be checked

These pages quote real declarations — ``md("`pre` gets `padding: 0.75em 1em`")`` —
which is what makes them useful and also what makes them rot. Four of them went stale
**within an hour** of being written, because fixing the bugs they had just found
changed the values they quoted.

That is a checkable class of claim, and the check is about fifteen lines: pull every
`` `prop: value` `` out of the doc pages with a regex, normalise whitespace, and assert
the string appears in `framework.css` or `Page.css`. Run against this section it found,
with no false negatives worth the name:

- `input:not(…[type=color])` — the `:not()` list had gained `[type="range"]`
- `dd`'s `margin-left: 40px` — no longer true, `dd` now has a rule
- `figure`'s `margin: 1em 40px` — same
- `outline-width: 2px` — the declaration had been deleted as a no-op

The false positives are all counter-examples (`background: #eef0f4`, quoted as *"not
this"*), which a human dismisses in seconds.

**Worth knowing rather than worth automating, for now.** It is a scratch script, not a
repo script — a work-in-progress check doesn't earn an npm script, and nothing here
runs tests in CI. But *"the docs quote the CSS, so the docs are testable against the
CSS"* is the useful idea, and it is the only mechanism in this repo that would have
caught any of the four.

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

## 9. `:where()` — tried, reverted

**The fear, stated exactly.** Base-theme rules are the ones you end up fighting.
There aren't many and they're mostly right, but when one is wrong for your page
you're in a specificity argument with the substrate — and the usual escalation
(more classes, `!important`, a later layer) makes the next person's fight worse.

**What was tried.** Every selector in `framework.css`'s `@layer theme` wrapped in
`:where()`, which carries zero specificity. The framework then loses to any rule
you write, at any specificity, with no escalation available or needed.

**Why it was reverted.** The problem is real but *hypothetical here*. The base
theme's selectors are already flat and single-element, so the ordinary model
covers essentially every case:

```css
framework.css    h2 { font-size: 1.4em }    /* loads first */
your-theme.css   h2 { font-size: 2em }      /* loads later, wins */
```

Equal specificity, later declaration takes it. And if that ever isn't enough,
an unlayered rule beats every layer — heavy, but it's there.

What `:where()` costs is immediate and paid by every reader: an unfamiliar
wrapper on forty rules, and a cascade *inside* the layer that resolves by source
order rather than selector weight — so `button.bg` stops beating `button` by
being more specific and starts depending on being lower in the file. That's fine
in one hand-ordered file and a trap the moment anyone forgets it.

**Verdict: keep plain selectors. Reach for `:where()` if a real override fight
happens, and then only around the rule that caused it.** Recorded so the idea
isn't re-derived from scratch — it's a good tool aimed at a problem this file
doesn't currently have.

**Two obligations this verdict creates**, since the simpler model only works if
they're honored:

- **Base-theme selectors stay flat.** One element, no descendant combinators. A
  `.page > h2` in `framework.css` would out-rank a theme's `h2` no matter when
  the theme loaded. The low specificity is a feature that has to be maintained
  on purpose, not an accident.
- **"Loads later, wins" is true only at equal specificity.** `Page.css`'s
  `.page > h2` beats a theme's `h2` regardless of order. That's correct — a
  component adapting a heading in its own context should win — but it means a
  theme cannot restyle every heading on the site with one flat rule. This is the
  known sharp edge of the model.

### 9a. The real override fight arrived — and `:where()` was the right tool

The trigger this verdict was waiting for. `Page.css` had four rhythm rules
(`.page > h2`, `.page > p`, …) which are exactly the sharp edge above: they
out-ranked a theme's flat `h2` forever, and they were unreachable from a `.md`
block anyway.

They are now the **flow** rules, and every one is `:where()`d to specificity zero:

```css
:where(.flow, .page, .md, blockquote, .demo-render) > * + * { margin-block-start: var(--flow); }
```

Three things this buys, all of which the plain-selector model could not:

- A theme or a component that genuinely wants its own spacing wins by being an
  **ordinary class** — `.md-details` and `.demo` do exactly that. No escalation.
- The second obligation above is retired for rhythm: `Page.css` no longer out-ranks
  a theme's flat rules.
- Retuning is a **token** (`--flow`, `--flow-section`, `--flow-sub`,
  `--flow-tight`), not a selector, so a theme changes four values.

The cost §9 warned about is real and is paid here: **inside the flow block, order
decides**, because all the selectors weigh the same. That is load-bearing — the
"heading hugs what follows" rule is written before "a heading takes air above" so
that `h1 + h2` gets the air. It is commented in the file, and it is exactly the trap
§9 predicted, contained to seven rules in one place instead of forty.

**Verdict stands, and this is what honoring it looks like:** plain selectors by
default, `:where()` around the rules that caused a real fight. It has now happened
once.

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
`highlight.css` (0.75/1) and `demo.css` (0.9/1) each independently overriding it —
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

## 12. `@layer theme` is the base theme

Recorded here because it changes how the whole file reads; the full theming
record — component looks vs. theme files, the four-rung ladder, light/dark, and
naming — lives next to the guide, in `theme/guide/readme.md`.

**The reframe.** `framework.css`'s `@layer theme` block is not "the framework's
unavoidable styles." It is **a theme** — the one you get when you load no other.
Using no theme is a supported, finished-looking outcome, which is the property
that makes the theme system optional rather than mandatory.

Nothing moved to make this true; it was already the case. What changed is that
it's now stated, which settles two things that were previously arguable:

- **The base is allowed to have opinions**, because a theme is what replaces
  them. §6's eviction list stops being "delete anything opinionated" and becomes
  "delete anything *dead*." The `select` arrow stays; it's the base theme's
  answer to an unstylable control, and a theme may override it.
- **Element defaults are the floor, not the skin.** A theme retunes tokens; it
  doesn't re-specify `button` padding or the form-control block. That's what
  keeps a theme file short enough to read in one sitting.

**Token expansion, and why it isn't scope creep.** Theming needs a vocabulary,
and the file had almost none — six tokens, none of them for surfaces or text.
Six were added (`--ink`, `--surface`, `--line`, `--wash`, `--radius`, `--font`),
and **every one replaces a value that was already hardcoded**, most in several
places: `#fff` in four files, `rgba(0,0,0,0.1–0.2)` borders in about eight,
`system-ui` in the base layer. That's the bar for the next one — a token names a
decision that already exists, it doesn't invent one.

`font-family` also moved from `@layer base` to `@layer theme`. A typeface is a
look, and a theme has to be able to change it by loading later; in `base` it
couldn't be reached without out-specifying a layer.

### 12a. Dark mode: the honest half is done, the switch is not thrown

The gap used to read: *"`:root` pins `color-scheme: light`, so dark mode is defined
but not honest — components still hardcode `#fff` and `rgba(0,0,0,…)`."*

**What was actually blocking it was the syntax palette, and it was worse than a
hardcode.** `ext/highlight`'s ten `--syn-*` tokens were light-only, while
`--code-bg` falls back to `--wash`, which **is** mode-aware. So a dark page would
have got a dark code box with `#cf222e` keywords painted on it — not a wrong shade,
an unreadable one. A half-mode-aware token set is worse than a fully light one,
because the failure is invisible until you flip the switch.

Paired with `light-dark()`, so a token cannot exist in one mode and go missing in
the other:

| | |
|---|---|
| the ten `--syn-*` | GitHub Light / GitHub Dark |
| `scrollbar-color` | the thumb no longer vanishes on a dark page |
| **`--error`, new** | replaced `#c00` in `md.css`, `demo.css` and a near-copy in `highlight.css` — three files with an opinion about one state, none readable on a dark surface |

**`:root { color-scheme: light }` was deliberately left alone**, and that is the
point of stopping here. Flipping it makes every visitor's OS setting change what
the site looks like — a taste decision with a visual pass attached, and not one to
make on the way past. The work that had to be true *first* is now true, so the
switch is one word instead of a project.

**Measured no-op today:** `theme-lew42` already overrides all ten `--syn-*`, so the
painted keyword colour is unchanged (`#FF8F60` before and after). What improved is
the site that loads **no theme** — which is the whole thing this section is about.

### 12b. The switch is thrown, and one token was lying

`theme/mode.js` is the switch: one button, `auto → light → dark`, stored in
`localStorage` and applied as inline `color-scheme` on `.app`. Not on `<html>` —
tokens live on `.app`, and two themes render side by side on `theme/guide/`, so a
mode forced at the root would take both.

`auto` clears the override rather than storing a resolved value. The OS can change
while the tab is open, and a stored `"light"` would outlive the reason it was
chosen.

**Throwing it exposed one bug, and it was in the tone ladder rather than in any
component.** `theme-lew42` had:

```css
--wash: light-dark(#f2f2f2, rgba(230,230,230,0.07));
```

`.app { background: var(--wash) }`, and `body` has no background — so in dark mode
the app painted 7% white **over the browser's white canvas**. Dark mode rendered as
pale grey with pale text. Measured: `.app` computed to
`rgba(230,230,230,0.07)`, `--ink` to `#e6e6e6`.

**A colour that backs a whole app cannot be translucent.** The three surface tokens
are opaque now and form one ladder, with elevation reading *lighter* on both sides
of the switch:

| | light | dark |
|---|---|---|
| `--wash` — the floor | `#f2f2f2` | `#171717` |
| `--tint` — a panel in a card | `#f8f8f8` | `#1f1f1f` |
| `--surface` — a card | `#ffffff` | `#262626` |

`--tint` is new in the same pass. `th`, the demo toolbar and the demo caption were
all painted `--wash` — the floor, two levels below the card they sit in — because
there was no name for "one step down from a surface".

**Then the whole framework section was audited in dark**, every page, looking for a
computed background lighter than 55% luminance. Eight hits, and seven are correct:
two `.section-band`s in the `dark` *tone* (which is the high-contrast band, and
inverts on purpose), and five elements inside `theme/guide/`, which renders
`theme-paper` and an explicitly-light `theme-lew42` to prove exactly that.

The eighth was real: **`<mark>`** kept the UA's yellow with `canvastext` on it, so a
highlight in dark mode was light text on yellow. Paired now, like everything else.

**`:root { color-scheme: light }` still stands.** The base theme has translucent
`--wash` for the same reason it always did, and it is honest about being light-only;
a theme opts into both modes and `theme-lew42` now genuinely does.

### 12c. The contrast pass, and what a fixed grey costs

Every page in the site was walked in both modes, at 1400px and 390px, comparing
each leaf text node's computed colour against the first opaque background above it.
**Zero horizontal overflow and zero clipped boxes** in the framework — the structural
work held. Contrast had four real findings.

**`--subtle` was 4.24:1**, just under AA, in roughly 150 places — ToC rows, demo
buttons, icons, `summary`, captions. Two shades darker (`#737373` → `#6a6a6a`)
clears it without changing the grey's character. This is the highest-value single
token change on the site, because `--subtle` is what every de-emphasised thing
reads.

**`--syn-comment` was `light-dark(…)`, and should never have been.** `--code-bg` is
dark in *both* modes, so the "light mode" value was a dark grey on a dark box.
Measured on `#3f3f3f`: `#9d9d9d` 3.88:1, `#b5b5b5` 5.14:1. **A token only takes
`light-dark()` if the surface behind it actually flips.**

**`<mark>` kept the UA's yellow** with `canvastext` on it — light text on yellow in
dark mode. Paired now.

**A fixed grey on a variable band is the interesting one**, because it is a *design*
bug rather than a value bug, and it bit `styles/sections/` twice:

| | was | measured |
|---|---|---|
| the eyebrow | `color: var(--prim)` | **1.06:1** on the `prim` band |
| a stat label | `color: var(--subtle)` | **1.06:1** on the `prim` band |

Both are the same mistake: **a colour picked against the band you were looking at.**
A band whose fill is a variable cannot have de-emphasis that is a constant. Two
fixes, and the second generalises:

```js
"--eyebrow": COLOURED[tone] ? "currentColor" : "var(--prim)",
muted = { color: "color-mix(in srgb, currentColor 68%, transparent)" },
```

`currentColor` has *already* been chosen to contrast with whatever is behind it, so
a mix of it cannot fail the same way. **De-emphasis should be derived from the ink,
not named alongside it** — and that is the rule to reach for anywhere a component
can land on more than one surface.

### 12d. Two things the audit got wrong, which is worth more than the findings

**`color(srgb 0.9 0.9 0.9)` components are 0–1, not 0–255.** The first pass divided
them by 255 anyway, read every `color-mix`ed value as near-black, and reported the
sidebar's icons at 1.13:1. They are about 7:1. **Thirty false positives, and the fix
was nearly applied.** If a measurement disagrees with the screenshot, the
measurement is on trial too.

**`--prim` as *text* is 2.01–2.25:1** and is left alone deliberately — a call the
owner of the brand made, not an oversight. It affects `.toc-link.current`, `.prim`
labels and `.page-link.active`. Recorded so the next person does not "discover" it
and quietly repaint the accent.


Still open, and smaller than it was: `Page.css`'s `box-shadow: rgba(0,0,0,0.08)` on
a hover, and `/styles.css`'s `body.theme-1` block, which is legacy with real
consumers.

---

## 13. Escalation is a ratchet — the `site` layer

**The observation that started this** (and it's the sharpest one in the record):
once you use a cascade mechanism to win, you can't reuse it. Reaching for a
stronger tool doesn't just solve today's conflict, it *spends* that rung for
everyone after you.

There are five rungs and you get each one once:

| rung | beats | what's left above |
|---|---|---|
| specificity | equal-specificity rules | four |
| a layer | everything in lower layers | three |
| unlayered | every layer, any specificity | two |
| `!important` | everything unimportant | one |
| inline `!important` | — | nothing |

**The rule:**

> **Never escalate downstream. De-escalate upstream.**

When site CSS can't beat framework CSS, don't raise the site — *lower the
framework*. The framework has room to go down (a flatter selector, a token,
`:where()` around the one rule that caused it); downstream has nowhere to go up
that doesn't cost the next person. **The framework holds the low ground on
purpose so nobody downstream has to climb.**

That's also the mechanism behind §1's "override = bug report," which until now
was an exhortation with no method attached. And it's why §9 kept `:where()` in
reserve *for `framework.css` specifically* — the asymmetry is the whole point.

### The worked example

A `code { background: var(--bg); color: white }` in `/styles.css`, wanting dark
code blocks. It half-worked, which is the interesting part:

| property | winner | why |
|---|---|---|
| inline `code` background | site | equal specificity, loads later |
| `pre` background | framework `pre, code` | site never mentioned `pre` |
| `pre > code` background | framework (0,0,2) | out-specifies site's `code` (0,0,1) |
| `pre > code` **color** | **site** | uncontested — nothing else sets it |

Result: white text on a light box. Note that `pre > code { background: none }`
was *not* the villain — it prevents a double box and is correct. The trap was
that a partial override left one property stranded from the others.

Three ways to fix it, and only one is right:

- **Out-specify from the site** (`.app pre > code`) — climbs a rung, and the
  next person who wants to restyle code has to climb two.
- **Unlayer `/styles.css`** — climbs to the top rung for a background color,
  and takes out `util` as collateral (`.pad` would lose to a blanket site rule).
- **De-escalate upstream** — the framework was missing a token. Added
  `--code-bg` / `--code-ink` as component tokens falling back to the globals;
  the site now sets two *values* and no selectors, and reaches inline code,
  block code, fences and demo code areas at once. **Rung zero.**

The same pass found `.demo-code { background: rgba(0,0,0,0.06) }` — a component
hardcode at (0,1,0) that would have out-ranked the site's token for demo blocks
only, i.e. the "restyled everything except that one box" bug, pre-installed. Now
it reads `pre`'s background like everything else.

### The `site` layer

Even with the rule above, `/styles.css` shouldn't be in the same layer as the
framework it's skinning. It is now `@layer site`, between `theme` and `util`:

```css
@layer base, theme, site, util;
```

**Why between, not on top.** Site rules should beat the framework and every
component at *any* specificity — that's the point. But `util` must still win,
because a utility class is something you typed on purpose at the element; a
blanket `div { padding: 0 }` in the site has no business defeating `.pad`.

**Why a named layer rather than unlayering.** Three reasons: unlayered beats
`util` too; unlayered is the last cheap rung and this doesn't warrant it; and a
named layer is *positioned*, so something can later be placed above **or** below
it, which "on top of everything" forecloses.

**The gotcha this exposed, worth knowing.** Layer order is fixed by the *first*
`@layer` statement encountered, and a name first seen later is appended at the
**end**. `Page.css`'s `<link>` is appended before `framework.css`'s — `App.js`
imports `Page` at module scope, and imports are hoisted above `App.js`'s own
`View.stylesheet()` call. So `Page.css` establishes the order for the whole
site. Declaring `site` only in `framework.css` would have produced
`base, theme, util, site` — site beating utilities, silently. **Every stylesheet
now restates the full four-name list**, which is what the existing "every
stylesheet states it" convention was always for; it just had no teeth while all
the lists agreed.

---

## 14. Does the document scroll, or does the page?

**The bug that forced the question.** `framework.css` had `html { height: 100% }`,
`body { min-height: 100% }`, `.app { height: 100% }` — and the third rule did
nothing at all. A percentage height resolves against the parent's **height**, and
`min-height` doesn't give body one, so `100%` was indefinite and computed to
`auto`. Measured on `/framework/`: `.app` was **591px inside a 900px viewport**,
with the shell's background stopping 309px above the fold.

That is not a typo, it is a fork in the design, and the site had been sitting on
the wrong side of it for as long as `Page.css` has existed:

| | document scroll | app shell |
|---|---|---|
| scroller | `<html>` | each `.page` |
| sidebar stays put | `position: sticky` | for free |
| scroll reset on navigate | must be written | free (a fresh box) |
| mobile URL bar collapses | yes | no |
| find-in-page over a long doc | natural | per pane |

**What made it lopsided:** `Page.css` was already written for the app shell and
had been for months. `.page { min-height: 0; overflow-y: auto }` with the comment
*"every page scrolls itself"*, `.pages { flex: 1 1 auto; min-height: 0 }` — the
`min-height: 0` in both exists for exactly one purpose, letting a flex child
scroll. None of it did anything. Measured: `overflow-y: auto` on a `.page` whose
`scrollHeight` equalled its `clientHeight` on every route.

**Verdict: app shell.** One rule changed — `body { min-height: 100% }` →
`height: 100%` — and a tier of existing machinery started working. The cheaper
option (delete the dead rules, `min-height: 100vh`, sticky sidebar) would have
been deleting the design to match the accident.

**The cost, and it is real:** the `100%` chain is only as good as its weakest
link, and there is no warning when one is missing. `.default` proved it twice —
a region's index content is page-shaped but is not a `.page`, so it missed first
`overflow-y` and then `min-height`, and inside a topic (which clips) that is not
a missing scrollbar but **445px of the home page unreachable**.

### 14a. Then the region took the scrolling, not the page

`.page { overflow-y: auto }` was right about *something* scrolling and wrong about
*what*. A `.page` is also `max-width: 60em; margin-inline: auto`, so its scrollbar
rendered at the **sheet's** right edge — 85px inside the window, floating in the
grey. A scrollbar belongs to a viewport and a sheet is not one. Worse, a page
inside a tab panel got a scroller nested in its ancestor's: `/framework/ext/markdown/`
had two, the inner one at x=586 in the middle of the content, and you had to
exhaust it before the outer moved.

Moving `overflow-y` up to `.pages` fixes both and needs **no `.page-inner`** — the
page keeps its measure and is simply a block in a scrolling column.

Two things that came with it, both non-obvious:

- **`align-items: flex-start` is required, and `stretch` is a trap.** In a
  single-line flex container with a *definite* cross size — which the app shell
  guarantees — the line's cross size is the CONTAINER's, not the content's. So
  every page was pinned to the region height and its content spilled out of the
  bottom, painting past the end of its own background. Measured: `height: 900px`
  with `scrollHeight: 4241`. `flex-start` lets it size to content; `min-height: 100%`
  is what still makes a short page fill. Two declarations because they are two
  cases. A topic wants the opposite and says `align-self: stretch`.
- **One shared position, so navigation must reset it.** `Router.activate()` now
  does `page.view.el.closest(".pages")?.scrollTo(0, 0)`. This looks unnecessary
  until it isn't: the browser clamps `scrollTop` to the new content height, so
  navigating to a *short* page self-corrects and reads as working. Measured
  leaking 1500px only between two pages that both exceed the region.

### 14b. `overflow-y: scroll`, and which regions opt out

`scroll` rather than `auto` so the gutter is always reserved and navigation stops
shifting content sideways. But the gutter is wrong on any region you are *not*
reading — dead space, and it pushes the real scrollbar back off the window edge,
undoing the whole point. So `/styles.css` hides the others:

```css
.pages:not(:has(> .page.active-page)):not(:has(> .default)),
.pages:has(> .page.topic.active-page) { overflow-y: hidden; }
```

The obvious form — `:has(> .page.topic.active-ancestor:has(.page.active-page))` —
is **invalid: `:has()` cannot be nested**, and it drops silently. The un-nested
version is wrong for a subtler reason: **the root page is a topic and is an
active-ancestor on every route in the site**, so it matched `app.$pages` always,
including `/notes/`, where a long page would then clip with no scrollbar.

> The same latent bug is still live in `hides-nav`: `.app:has(.page.hides-nav.active-ancestor)`
> matches on every route for exactly that reason, so the global nav is hidden
> site-wide rather than only inside topics. Not fixed here — it is currently
> indistinguishable from intent.

---

## 15. One background, on `.app`, and nothing paints over it

`.app { background: var(--wash) }` was correct-looking and invisible: `/styles.css`
also said `.page { background: var(--surface) }`, which painted every page white
edge to edge — including full-bleed topics — so the grey had never once been seen.

Deleting the blanket `.page` background exposes the other half: only pages inside
a `.pages.papers` region get padding and a measure, and `app.$pages` was a bare
`.pages`. `/notes/`, `/alex/` and every other top-level section had **zero
padding**, flush against the viewport edge, and had simply been white-on-white the
whole time. One word in `app.js` — `div.c("pages papers")` — gives the app's own
region the measure, and `.page.topic` opts out.

**`papers` then lost its background too**, which is the part worth writing down.
The rule said `background: white`, then `var(--surface)`, and both contradicted
the header four lines above them in `Page.css`: *structure only, the site decides
backgrounds*. What `papers` actually provides is a MEASURE — a column width,
centred, with room to breathe — and a measure is structure. The sheet is one line
in `/styles.css` for a site that wants one.

This site doesn't. With `.page` and `.pages` transparent, a page is a hole onto
the shell, and that is what lets a **content block** be the white thing: a code
box, a preview card, a demo. While `.page` painted `--surface`, white was the
floor and nothing standing on it could read as raised — a white card on a white
sheet is a border and a prayer.

The grey stays on `.app` rather than `.pages` so there is exactly one painted box
in the whole stack. Worth knowing that `.theme-lew42` paints
`background: var(--surface)` on that same element, so this wins by `@layer site`
and not by specificity — the two must keep targeting the same element for the
layer order to decide it, which is the trap §7 of the theme's own record warns
about.

---

## Still to write

The docs now mirror the stylesheet: `styles/page.js` is the strategy, and one
child per layer covers its contents — [`base/`](base), [`theme/`](theme) (with
[`theme/guide/`](theme/guide) for writing your own), [`util/`](util).

Coverage as it stands:

| layer | covered | not yet |
|---|---|---|
| `base` | all ten rules, eight with a before/after `compare()` | — |
| `theme` | tokens, type scale, code, block elements, controls; the remainder in one table | a demo for `:focus-visible`, `scrollbar-color`, the `clamp()` body size |
| `util` | flex, grid, spacing, text, zoom, `textarea.auto` | `zoom-responsive`, `gap-2em`, `all-pad` have no demo of their own |

The before/after pattern is a local `compare()` — the same markup twice, the
left side with one declaration reverted inline. It lives in `base/page.js`
because that's where it earns its keep; if a second page needs it, it goes in
`ext/demo/` rather than being copied.

Bigger items, in order of value:

1. **Rewire component hardcodes to tokens** (§12) — the thing standing between
   here and working dark mode.
2. **`app.css_audit()`** (§8) — the dev-only styled-vs-applied diff.
3. **`.page > .md`** (§8) — the last undeclarable core→ext CSS dependency.
