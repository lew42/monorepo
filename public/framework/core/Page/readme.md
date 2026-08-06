# Page — design record

## Rhythm: one flow, not two rhythm systems

**The bug, as reported:** *"in some `.md` containers we have `p` that aren't
directly in the page. I tried some `.page > *` margins, but they failed to reach
into these sections."*

Exactly right, and there were **two** competing systems when it was found:

```css
/* Page.css, @layer theme */          .page > h2 { margin: 3em 0 1em }
/* /styles.css, @layer site */        .page > *:not(h1,h2,h3,h4,.sidebar) { margin-bottom: 2em }
```

The site pair won by layer, so tuning the spacing meant editing whichever file you
happened to open first — and **neither could reach a paragraph markdown generated**,
because `md()` emits `div.md > p` (or, for a single block, an element that *is* the
`.md`). Page copy and rendered copy sat at different rhythms with nothing to point
at.

**Options.**

| | |
|---|---|
| `.page > *, .page > .md > *` (as proposed) | works, and stops at two levels — `details > .md`, `blockquote > p`, a `.md` inside a demo all miss |
| margin on the elements themselves | what the UA already does, and it is the thing being fixed: `h2`'s margin in `em` compounds with the type scale, so a theme retuning `h2` silently moved every section gap |
| **a flow scope** | ✓ |

**Verdict: rhythm is a property of the container, and the container is named.**
`.page`, `.md`, `blockquote`, `.demo-render` and an opt-in `.flow` are flows; a flow
zeroes its children's block margins and then spaces *between* them with the owl
selector. So `.md` nested anywhere is a flow in its own right, and depth stops
mattering.

Four rules and four tokens (`--flow`, `--flow-section`, `--flow-sub`,
`--flow-tight`) replaced six rules across two files. Notes that cost something to
learn:

- **Every selector is `:where()`d to specificity zero.** A component that genuinely
  wants its own spacing then wins by being an ordinary class — `.md-details` and
  `.demo` do exactly that. Without it they would have had to out-specify a
  framework rule, which is the ratchet the CSS doctrine forbids.
- **Order is the mechanism.** All three heading rules are specificity-zero, so the
  last one to match a pair decides it. `heading + *` (hug) is written *before*
  `* + h2` (section air), which is what makes `h1 + h2` take the air.
- **`rem`, never `em`.** `em` on a heading resolves against that heading's own
  font-size, so the margins would scale with the type scale and compound with it.
  When `theme-lew42` took `h2` from 1.4em to 2.25em, a `2.2em` margin silently went
  from 49px to 79px. Rhythm is measured in *body lines*.
- **Margins had to be evicted from generic elements upstream.** `table { margin: 1em 0 }`
  and `hr { margin: 3em 0 }` in `framework.css` are specificity (0,0,1) and beat a
  `:where()` rule at (0,0,0). They were rhythm living in the base theme, so they
  were deleted rather than out-specified — de-escalate upstream. `figure`'s UA
  `margin: 1em 40px` needed the same treatment, because the flow only zeroes
  *block* margins and the 40px is inline.
- **`.grid > * { margin: 0 }`** joined `.flex > *` in `util`. A laid-out container
  owns its spacing via `gap`, and an inherited block margin only fights it.

### The topic was a flow that isn't one

Later, and the same mistake from the other side: `.page` is in the flow list
unconditionally, but a **topic page is a layout** — `styles.css` makes it a flex row
of `.sidebar` + `.pages`. So `.pages`, as the second child, collected
`margin-block-start: var(--flow)`, and a region sized to exactly fill its parent
lost 20px off the bottom. It scrolls, so nothing looked wrong until the end of a
page.

Fixed where the layout is declared — `.page.topic > * { margin-block: 0 }`, in the
rule next to the `display: flex` that caused it. The general form, for the next one:
**a page that overrides `render()` into a flex or grid layout owns its children's
spacing and must say so.** `gap`, not flow.

Worth naming the alternatives, because the same three keep coming back for any
"which boxes get this treatment" question: opt-in (`.ac("flow")` everywhere, and a
forgotten class is invisible), opt-out (this, and the list grows once per layout),
or an inherited `--flow` token each box can zero locally (elegant, except
inheritance isn't scoping — zeroing it on the topic zeroes it for every prose page
*inside* the topic, so every flow root has to re-assert it and the central list
comes back as the re-assert list). The asymmetry decides it: a missing opt-in looks
slightly wrong everywhere and nobody reports it; a missing opt-out looks broken in
one place and gets fixed that afternoon.

## A link in prose is not the same as an anchor

Same shape of question, and the answer landed in the same place: **scope to the
container, not to the element.**

The site had no `a` rule at all — bare links were UA blue and every link that
looked designed got its look from a component class. The ask was a real treatment:
bold, and a heavier, lower underline in `--prim`.

A flat `a` rule in the base theme is the obvious home and it is wrong twice:

- **`font-weight: 600` bolds the navigation**, which is all anchors — sidebar, tabs,
  TOC, crumbs, preview cards. It also erases a state signal: `.sidebar-link.active`
  and `.nav-link.active` say *600*, and against a 600 baseline that says nothing.
- **`a:visited` is `(0,1,1)`.** That out-ranks `.sidebar-link`, `.tab`, `.toc-link`
  and `.nav-link` — every class those components use to set their own colour. The
  navigation would grey out behind you as you read the site.

The base theme also forbids the fix in place: its selectors are flat by contract, so
a scoped selector cannot live there. It lives here instead, beside the flow rules,
because it is the same statement — *this is what a box of stacked prose looks like*:

```css
:where(p, li, td, th, dd, blockquote, .md) a { … }
```

`:where()`d to `(0,0,1)` for the flow rules' reason: a component that wants its link
back wins by having a class, with no out-specifying.

**`:visited` gets colour and nothing else.** Browsers restrict it to properties that
can't be measured back out of the layout, so weight and thickness are unavailable
and the state has to be carried by hue — `var(--subtle)` text and an underline mixed
halfway to it. Every declaration was chosen to degrade to the unvisited look if a
browser declines it, which is the only safe way to write the selector: you cannot
verify it from `getComputedStyle`, which deliberately reports the *unvisited* values.

## `.pages` scrolls; `.page` does not

Written down because `overflow-y` on `.page` looks obviously right and was wrong
twice over:

- A `.page` is also `max-width: 60em; margin-inline: auto` when it's a paper, so the
  scrollbar rendered at the **sheet's** right edge — 85px inside the window,
  floating in the grey. A scrollbar belongs to a viewport, and a sheet is not one.
- A page inside a tab panel got its own scroller *inside* its ancestor's, so
  `/framework/ext/markdown/` had two: an inner bar at x=586, mid-content, that you
  had to exhaust before the outer one moved.

`align-items: flex-start` on the region is the non-obvious half. The default
`stretch` looked right and was wrong: in a single-line flex container with a
**definite** cross size — which this has, because the `height: 100%` chain above it
is definite — the line's cross size is the *container's*, not the content's. So
every page was forced to exactly the region height and its content painted past the
bottom of its own background. Measured: a page reporting `height: 900px` with
`scrollHeight: 4241`.


## `.cols` — deleted

`Page.css` defined `.cols` — equal drill-down columns, the whole of what
`ColumnPager` used to do. This section previously said:

> Kept rather than deleted because it is four lines… **If it is still unclaimed
> next time someone reads this file, delete it** — an unused rule that survives
> two readings is a rule nobody is going to claim.

It was still unclaimed. Deleted, per its own instruction.

The reasoning that produced it is worth keeping, because the question recurs:
columns are **jumpy**. Adding one reflows every column already on screen, so the
thing you are reading slides sideways while you read it. Replace, plus an
adaptive sidebar, gives the same navigation with nothing shifting.

One detail to carry forward if a drill-down is ever rebuilt: use
`minmax(0, 1fr)`, never bare `1fr`. `1fr` means `minmax(AUTO, 1fr)`, and that
auto floor is the item's min-content — so one long `<pre>` refuses to shrink and
pushes the page past the viewport.

**A pre-committed deletion works.** Writing "delete this if it's still here"
turned a judgement call into a mechanical one, and it survived a rewrite that
invalidated most of the prose around it. Worth reusing on anything speculative.

## The contract lives in `@layer util`, so a page can BE a layout

**The question:** can `.page` be a grid? A dashboard page, a three-column page —
the site already has a whole utility grammar for exactly this (`grid gap auto`,
`flex gap`, `flex-1`, `--column`), and the obvious move is to put it on the page:

```js
div.c("page grid gap auto")
```

**What happened instead: every inactive page on screen, on every route.** `.grid`
and `.flex` are in `@layer util`, which is the last layer, so they beat a
`display: none` written in `theme` at *any* specificity. Nothing throws, and the
symptom reads like a router bug rather than a cascade one.

This was already known in a smaller form — `.page.topic` needed a pair of rules in
`/styles.css` restating the contract's own selectors, and `layouts.css` had
`.page.layout-full.active-page` where the `.active-page` was load-bearing and
commented as such. Both were the same bug, worked around twice.

**Options.**

| | |
|---|---|
| `.page` is a slot; layouts go in a wrapper div | correct and unbreakable, but it means every layout page grows a div, and the two that already exist get refactored |
| `display: var(--page-display, block)` | tokens the show rules — but a util `.grid` still beats `display: none`, so it fixes nothing |
| `display: none !important` in `@layer base` | works (important declarations reverse layer order), and makes the hide unbeatable — no page transition could ever animate a page out |
| **move the hide rule to `@layer util`** | ✓ |

**Verdict: the hide rule moves up into `util`** and beats the utility classes on
specificity instead of by layer — four classes against one. Two consequences worth
stating, because both are load-bearing:

- **It has to be phrased as "hide unless".** A plain `.page { display: none }` in
  `util` is `(0,1,0)`, exactly `.grid`'s, and the winner would be decided by which
  `<link>` loaded last. The `:not()` chain is what buys the margin.
- **Nothing says `display` for a page that IS showing.** A `div` is already a block.
  Put `display: block` back on `.page.active-page` and you have taken the choice
  away from the utility class again.

The cost is a dent in what `util` means — it was "opt-in classes you typed on
purpose", and it is now that plus one structural rule. Recorded in framework.css's
header so the next reader of the layer list finds it there too.

What it bought, immediately: `/styles.css` lost the topic pair (a topic is now
`div.c("page topic flex")`), and `layouts.css` lost the `.active-page` workaround.
Two workarounds deleted, one rule moved.

## `paper` is opt-in, and so is `papers` — as tokens, not declarations

`paper` is a look — a white box, a measure, a centred column. The framework
does not decide that, so there is no default. Two ways to ask for it:

```js
classes: "paper"                      // this page
this.$pages = div.c("pages papers")   // every page in this region
```

The second is a class on the *container*, governing its children — the cheaper
shape whenever a whole region wants the same thing.

**Rejected: default to paper, opt out with `full`.** `full` already means
`position: fixed; inset: 0`. Making it also mean "no measure" gives one word two
independent meanings, so you could never ask for full-bleed-without-fixed — the
same one-property-one-winner problem that deleting `mode` removed. A site that
wants paper everywhere should say so in its own stylesheet.

### How a page opts OUT

This used to be the hard half. `.pages.papers > .page { padding; max-width }` is
`(0,3,0)`, so leaving the sheet meant either out-specifying it
(`.pages.papers > .page.bleed`) or winning from `@layer site` — which is what
`/styles.css` did for `.page.topic`, and which that file's own header calls a bug
report about a missing token.

So it is a token now:

```css
.pages         { --measure: none; --page-pad: 0; }
.pages.papers  { --measure: 60em; --page-pad: 3em 4em; }
.page          { max-width: var(--measure, none); padding: var(--page-pad, 0); }
```

**A value set on an element beats one it inherited, at any specificity, in any
layer** — inheritance is not a declaration on the child, so the cascade has nothing
to compare. `.page.topic { --measure: none }` is one class and wins outright.

The reset on plain `.pages` is not decoration: without it a nested region inside a
`papers` region would inherit the sheet width from an ancestor it has nothing to do
with. Every region declares its own, so the tokens stop at each boundary.

## Overriding `render()`

A topic page that is a *layout* rather than a content page builds its own
wrapper. Three things an override owes, all of them silent when missed:

1. **Set `this.view`.** `activate()` appends `this.view`, not the return value.
2. **Carry `.page`.** The visibility contract only governs that class, so a
   wrapper without it stays on screen on every route.
3. **Never nest a second `.page` inside**, or the inner one is `display: none`.

The root page hit 1 and 2 together during the migration: its `.home` wrapper sat
pinned to the left of every url on the site.

## `nav` — where an icon lives (REVISED: on the page)

> **This section's verdict was reversed.** The original argument is kept below in
> full, because it is correct about everything except which cost matters more. Read
> the reversal first; the rest is the record of how it was decided the other way.

**What changed.** The old verdict — *"an icon identifies the entry in a menu, so it
lives on the parent"* — is philosophically clean and produced, in practice, **every
icon on this site declared two to three times**: once in `/framework/page.js`'s
hand-typed sidebar, once in the section's `nav` map, and often once more in a
sibling menu. The first time anything moved, they disagreed. The thing the argument
optimised for (no duplication *from* a page) was achieved by duplicating *between
parents* instead, which is the same bug with a longer commute.

**The revised verdict: a page declares its own `icon`; a parent may override it.**
`nav_for()` now resolves three sources, weakest first:

```
the url segment  →  the child's own `title` / `icon`  →  this parent's `nav` entry
```

So the common case is one declaration, on the page, and every menu follows it.
A parent that genuinely needs a different word for one menu still has the last say
— which is what keeps the original argument's real insight: `/framework/` labels its
`start` child **"Start here"** while that page's title is **"Start"**, deliberately.

**What pays for it: `load_all_children()`.** The old verdict's decisive objection
was that a page's icon *cannot be known before the page is imported*, so icons
would pop in as you browse — the bug `tabs()` already refuses. That is still true,
and it is now answered rather than avoided: a parent that wants real titles and
icons up front says so.

```js
initialize(){ this.load_all_children(); }
```

**Measured, on `/framework/`, which draws two levels and so loads two:**

| | |
|---|---|
| `page.js` fetches | 1 → **28** |
| **first paint** | 1119ms → **1170ms** (+51ms) |
| depth | flat — `/framework/core/View/` costs the same as `/framework/` |

The imports resolve *after* `inject()`, so the reader is already reading while they
land. `+51ms` against 25 hand-maintained entries that had already drifted is not a
close call.

**The remaining rule, and it is the honest one:** eager loading is bounded to the
levels a menu actually draws. `/framework/`'s sidebar draws two, so it loads two.
`styles/elements/` is a third level — outside any sidebar — so it keeps a `nav` map
with icons and imports nothing. **Declare what a menu needs before import; derive
what the page already has.**

Two implementation notes worth keeping, both found by measurement:

- **Await both levels.** Awaiting only the first redrew the sidebar before the
  grandchildren had titles, and the nav read `markdown demo highlight` in lower
  case.
- **Recompute the data, don't just re-render.** `Sidebar`'s `pages` is an array
  evaluated once at construction, so re-running `render()` against it redrew the
  same stale list. It looked exactly like the promise never firing.

---

### The original argument, kept

**The question, as posed:** *"if each preview requires the icon, either we
duplicate (references require icon + label + href), or we eagerly load (to dedupe
the icon spec), or…?"* — exactly the right framing, and the "or…" is real.

**Options.**

| | duplication | eager load | icon before the page loads |
|---|---|---|---|
| (a) icon on the page, parent repeats it as a fallback | **yes** — two copies, can drift | no | yes |
| (b) icon on the page only | no | **yes**, or icons pop in as you browse | no |
| (c) **icon on the parent's entry** | no — there is no second copy | no | yes |

**Verdict: (c).** An icon identifies the **entry in a menu**, not the page — so
there is nothing to duplicate *from*, and nothing to load.

This is not a new principle, it's the one `labels` was already built on, applied
one property further:

> A label belongs to the parent's LIST and is there from the start; a title
> belongs to a page and only exists once that page is imported.

The proof that these are genuinely different things and not a cache: `/framework/`
labels its `start` child **"Start here"** while that page's own title is
**"Start"**. Deliberately. If a label were a copy of a title, that would be a bug
instead of a feature.

The same argument kills (b) on its own terms. An icon that appears only after its
page is imported makes a menu read differently depending on where you arrived
from — *the exact bug `tabs()` already refuses* when it labels un-imported tabs
by name rather than by title.

**The honest cost of (c):** it is per-list, so a page listed in two different
menus declares its icon twice. Near-zero here, because `previews()` and a topic's
`Sidebar` both read the *same* parent's `children` through `nav_for()` — one
declaration serves both. If a page ever needs an icon that travels with it (its own `h1`, a global
search result), that is a different property with a different name, and it should
be added then rather than overloading this one.

**Shape.** One map, not two parallel ones, and Page honors it:

```js
nav: {
    start: "Start here",                          // string = just a label
    core:  { label: "Core", icon: "dashboard" },
}
```

`labels` was previously an ad-hoc property that only `framework/page.js` read, in
its own `render()`. Folding it in means one documented mechanism instead of a
second parallel map — `icons: {…}` beside `labels: {…}` is the shape that becomes
three maps.

**Rejected: putting it in `children` itself** (`children: { core: {…} }`). It
collides with `add(name, pojo)`, which already means *"build an inline Page from
these options"* — so a declared child would silently become an inline page that
never loads its own file. Fewest concepts, worst failure.

**One place reads it.** `nav_for(name)` returns `{ url, label, icon }` and is the
only thing that decides how a child is presented, so a topic's sidebar and its
preview cards structurally cannot disagree.

## The tab bar had no CSS at all

`Page.tabs()` shipped working and **invisible**: it emits `.tabs`, `.tab-bar`,
`.tab` and `.tab-panel`, and after `TabPager.css` moved to `core/legacy/` nothing
styled any of them. A tab bar rendered as a row of bare links — the kind of hole
that makes a finished feature look unfinished.

**Verdict: Page.css styles them, structure and tokens only.**

The CSS ladder says a module's own stylesheet is *layout, not looks*, and an
unstyled tab bar is the case where that rule needs reading carefully. The
resolution: ship the minimum required to **be** a tab bar — a row, a rule under
it, an underline on the selected one — with **no literal colour**. Every value is
`--line`, `--subtle`, `--ink`, `--prim`, so a theme retunes it without touching a
selector. That satisfies both halves: the component is not deciding what it looks
like, it is only declaring that it *is* a tab bar.

Two rules do work that would otherwise need JS:

```css
.tab.active, .tab.in-path                        { border-bottom-color: var(--prim); }
.tab-bar:not(:has(.tab.active)) > .tab:first-child { … }
```

The first comes free from `Router.mark_links()`. The second gives a set whose url
isn't selected the selected *look* on its first tab, mirroring the panel's own
`.default` fallback — so a panel is never showing content with nothing marked.

## Which page earns a tab bar

`/framework/ext/` is the only one on this site, and the reasoning is the test to
apply anywhere else:

```
four children · flat · none has children of its own · you flip between
them rather than drilling into them
```

The moment a child grows children of its own, a tab bar has nowhere to show the
trail and it should go back to `previews()`. And `tabs()` has **no overflow
handling at all** — right at four, unusable at twenty, and it will never tell you
which side of the line you are on.

Cost, measured: `/framework/ext/` went from 3 module fetches to 4, because
`tabs()` always imports its first tab so the group's own url renders something.
That is the documented trade, and it is the reason the *other* three tabs cost
nothing.

---

## `.default` asked "is the leaf mine?" when it meant "am I in the chain?"

```css
.pages:not(:has(> .page.active-page)) > .default { display: block; … }
```

**The bug.** On `/framework/ext/demo/` the leaf is `demo`, which mounts in ext's
**tab panel** — so framework's region contains only `.page-ext.active-ancestor`,
never an `.active-page`. The test passed, framework rendered its index page, and
because a region is a flex row you got **two columns**: the index squeezed to
281px beside the ext page.

**Why it hid for so long.** It needs a leaf that mounts somewhere other than its
nearest region — a tab panel, or a child's own `$pages`. `/framework/ext/` is the
only tab bar on the site, so this was the only route that could show it, and only
once you clicked a tab. The `.default` was there the whole time; it grew from
content-height to full-region when `.default` gained `min-height: 100%`, which is
what made it impossible to keep missing.

**The fix is one selector**, and it is the same question the `display` rules
already ask correctly — `.page.active-ancestor:has(.page.active-page)` shows an
ancestor *because* it is in the chain:

```css
.pages:not(:has(> .page.active-page, > .page.active-ancestor)) > .default
```

**`.active-page` and `.active-ancestor` are one question asked two ways: "is any
of this mine".** Any rule that reads one and not the other is a rule that will be
wrong as soon as the tree gets a level deeper. `.tab-panel`'s twin fallback had
the identical shape and was fixed alongside it — not because anything hits it yet
(`tabs()` is documented for flat children) but because a pair that drifts is a
pair where one gets fixed and the other doesn't.
