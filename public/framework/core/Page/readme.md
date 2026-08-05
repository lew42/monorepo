# Page — design record

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

## `paper` is opt-in, and so is `papers`

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

## Overriding `render()`

A topic page that is a *layout* rather than a content page builds its own
wrapper. Three things an override owes, all of them silent when missed:

1. **Set `this.view`.** `activate()` appends `this.view`, not the return value.
2. **Carry `.page`.** The visibility contract only governs that class, so a
   wrapper without it stays on screen on every route.
3. **Never nest a second `.page` inside**, or the inner one is `display: none`.

The root page hit 1 and 2 together during the migration: its `.home` wrapper sat
pinned to the left of every url on the site.

## `nav` — where an icon lives, and why not on the page

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
