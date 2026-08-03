# new/1 — new/0 plus a Router, lazy children, and regions

Three classes, **265 lines of code**. new/0 proved the flat container by cheating:
every child was a direct import, so the whole tree was in memory. new/1 pays that
off, adds a Router, and replaces new/0's `mode` property with nothing at all.

```
1/
  App.js            boot, and the app's own region. Nothing else.
  Page.class.js     a node: url, content, children — eager, lazy, or inline
  Router.js         url -> page, the chain diff, and two classes
  server.js         dev-only, port 8300, SPA fallback
  site/             replace · columns · tabs · full, and both loading tiers
  agents/           the council's proposals — steve, eric, tim
```

```bash
node public/framework/core/new/1/server.js     # http://localhost:8300/
```

## Three things, and everything else is CSS

**1. `children` is one Map, three states.** Setting an existing key never moves
it, so a name keeps its declared position when it resolves.

```
undefined   not a child of mine        -> 404
null        declared, not loaded yet   -> import it
Page        here                       -> use it
```

**2. `container()` decides where a page mounts**, most specific claim first:

```js
container(){
    const mine = this.parent?.regions?.get(this.name);   // my parent placed ME (a tab)
    if (mine) return mine;

    for (let page = this.parent; page; page = page.parent)
        if (page.$pages) return page.$pages;             // an ancestor claimed the subtree

    return this.app.$pages;                              // the default, flat
}
```

`$pages` claims everything below you; `regions` claims one named child. Two levels
because `tabs()` needs the second — two tab sets on one page cannot share a single
`$pages`, and that is what forced the split.

**3. `Router.mark()` writes exactly two classes** — `.active-page` on the leaf,
`.active-ancestor` on everything above it. That is the whole of what this tier
says about appearance.

## There is no `mode`

Earlier drafts had `mode: "columns" | "full"` resolved with `chain.findLast()` and
written as `data-mode` on `.app`. It's gone, and so is the resolution, the
attribute, the remembered previous class, and `Router`'s knowledge that
arrangements exist. A property whose only destiny is to become a class should
just be the class:

```js
this.$pages = div.c("pages cols");   // arrange my children as equal columns
classes: "full"                       // cover the window
classes: "holds"                      // I contain the leaf — stay on screen
```

Every one of those is visible in the file that wants the behavior, and none of
them is interpreted anywhere else. `.cols` is a utility; `.full` and `.holds` are
site rules. The framework does not know any of these names.

**`full` is positioning, not chrome management.** The old version put a class on
`.app` to hide the sidebar, which meant App carried state that had to be set,
kept in sync, and unset on the way out — and it could never compose, because one
`mode` property had one winner:

```css
.page.full.active-page { position: fixed; inset: 0; z-index: 10;
                         background: #fff; overflow-y: auto; }
```

Nothing on `.app` changes. Verified: `.app` stays `class="app"` on every route.
A full page can still make a region and class it `cols` — "columns inside a full
page" needs no mechanism, because the two answers live on different elements.

The honest cost: the chrome is **covered, not removed**. It's still in the DOM,
still tabbable, still read by a screen reader. `display: none` didn't have that
problem. If that matters, `inert` on the chrome is the fix, and it belongs to the
site, not the framework.

## Nothing declares "keep me visible"

An ancestor is hidden — that's replace. But a page holding the leaf inside its own
box can't be, or the leaf goes with it. A `classes: "holds"` flag did that job for
one round and was wrong twice over: it hid nothing when a *non-tab* child was
active (so a tab group sat beside an unrelated page), and it was one more thing
every author had to remember.

The real question is whether I contain the active page, so CSS asks it:

```css
.page.active-ancestor:has(.page.active-page) { display: block; flex: 1 1 auto; }
```

```
tabs  + a tab       the tab is in my panel          I stay
tabs  + a non-tab   that child is in app.$pages     I go
full  + a column    the column is in my region      I stay
replace + a child   my sibling, not my descendant   I go
```

Four cases, one selector, nothing to declare. `holds` is deleted.

## Tabs need no new class, and no directories

A tab bar is links. A tab panel is a region. Every tab is inline:

```js
export default new Page({
    meta: import.meta,

    initialize(){
        this.add("what",  "a string IS the content");
        this.add("why",   () => { … });
        this.add("state", { title: "State survives", content(){ … } });
        this.add("notes", "…");
        this.add("standalone", () => { … });     // a child in NO bar
    },

    content(){
        this.$tabs = this.tabs("what why");       // one set
        this.$more = this.tabs("state notes");    // …and another
    }
});
```

`tabs(names)` returns the view, so you place it and class it. **Which children are
tabs is decided at placement, not marked on the child** — so a page can have
several sets, and a child in none of them is an ordinary child. Nothing on a Page
says "I am a tab."

No `TabPager`, no `Page` subclass, no directory per tab. `/tabs/what/` is a real
url with nothing on disk behind it.

Measured, 1400px:

```
/tabs/what/        panel 0, bar 0 highlights, tabs page full width
/tabs/notes/       panel 1, bar 1 highlights
/tabs/standalone/  tabs page GONE, standalone full width — not all-or-nothing
/tabs/state/       2 modules (root, tabs). The tabs themselves cost none.
input value        survives switching between SETS, not just tabs
```

`/tabs/` is simply its own url — the bars with empty panels. There is no redirect
and no default tab.

## `route()` runs after the declaration, not after the filesystem

A page can claim urls it could not list in advance:

```js
route(name){ return { title: `Item ${name}`, content(){ … } }; }
```

`/dynamic/42/` has no `page.js` and is in no `children` map. Measured: two
imports total (`/`, `/dynamic/`), whatever number you ask for.

starter tried the filesystem first and fell back to `route()`, so every dynamic
url paid a doomed 404 before being claimed — and the alternative, checking
`route()` first, lets a greedy one silently shadow a real file. Declared children
give a third slot that starter didn't have:

```
children.get(name)  ->  a Page     use it
                    ->  null       declared: import it
                    ->  undefined  never declared: route() may claim it
```

Only declared names ever hit the network, so no 404 is wasted; and `route()`
cannot shadow a `page.js`, because a file you want is a file you declared.

## Columns inside a full page

The thing one `mode` property could never express, because covering the window and
arranging a subtree are answers to different questions:

```js
classes: "full",                       // position: fixed, inset: 0
content(){ this.$pages = div.c("pages cols"); }
```

```
/full/left/deeper/   full 1400@0 covering the window   .app class is still "app"
                     left 660@40  |  deeper 660@700    equal columns inside it
```

`left/` and `deeper/` declare nothing. They're lazy, they're two levels apart, and
they land as siblings in one grid because `container()` walks past `left` (which
claimed nothing) to `full`'s region.

### Lazy tabs, and why the labels are names

Tabs can be declared lazily — `children: "overview api guide"`, no imports, no
wiring — and `tabs()` imports exactly **one** of them: the first, because it has
to be rendered at the group's own url.

That forces the label question, and it is worth stating as a rule because it is
not a tab problem. A label taken from `title` only exists once that page is
imported, and *which* pages are imported depends on the url you arrived at. The
bar would then read differently per entry point — the bug reported as *"the first
tab's label changes depending on which tab renders."*

So the rule is deterministic instead:

```
Overview   api   guide
^ always loaded (we render it) -> its title
           ^ never loaded at bar-build time -> its declared name, always
```

Measured — identical from all four entry points, including `/tabs/api/` where
`api` *is* loaded and its title is still deliberately not used:

```
/tabs/         imports  / · /tabs · /tabs/overview        bar  Overview api guide
/tabs/api/     imports  / · /tabs · /tabs/api · overview  bar  Overview api guide
/tabs/guide/   imports  / · /tabs · /tabs/guide · overview bar Overview api guide
```

**`load_all_children()`** in `initialize()` is the opt-in: it imports every
declared child, and then every label is a real title. Costs the laziness, which is
why it isn't the default.

### Every set shows its default; the url selects one at a time

`/tabs/` shows the first tab, and the first tab's link *is* `/tabs/` — no redirect,
no second url with the same content, and nothing in `Router` knows tabs exist.

The rule that does it is about the **panel**, not the group, which is what makes
two sets work:

```css
.tab-panel:not(:has(> .page.active-page)) > .page.default { display: block; }
```

A url selects one tab. Every *other* set therefore has nothing of its own in the
chain and falls back to its first — so no panel is ever blank:

```
/tabs/          set 1 → Overview    set 2 → state
/tabs/guide/    set 1 → guide       set 2 → state
/tabs/notes/    set 1 → Overview    set 2 → notes
```

That middle-to-last transition is the bug reported as *"click Guide, then Notes,
and Guide disappears"* — it now falls back to Overview instead of going blank.
Guide does not persist, and that is the deliberate trade: **the state is read
entirely off the url, so clicking produces byte-identical output to reloading.**
Verified. Remembering per-set selections would have made `/tabs/notes/` mean two
different screens depending on how you got there.

`.tab-bar:not(:has(.tab.active)) > .tab:first-child` gives that fallback tab the
selected look, so a panel is never showing content with nothing highlighted.

**Only the first `tabs()` call links its first tab to the group url** — a page's
url means one thing. Later sets link every tab to its own url.

### Links rendered late miss `mark_links()`

The bar is filled after an `await`, so `Router.mark()` had already run and no tab
ever got `.active`. This is the async-content marking gap starter documented and
left open. `mark_links()` now defaults its argument to `this.active.url`, so
anything rendering links late can re-run the pass:

```js
this.app?.router?.mark_links();   // end of tabs()'s fill
```

## `order` is gone

`Router.mark()` used to set `style="order: i"` from the chain index. It was
unnecessary: pages are appended root-to-leaf on activation and never moved, so DOM
order is already chain order. Same-depth siblings are never visible together, so
their relative order can't be observed.

## Adoption, and when a page needs `.app`

`adopt()` meant `.parent` in `core/`, and an earlier draft here overloaded it to
push `.app` recursively down the tree. Both jobs are now where they belong:

- **`add(name, child)`** — the one place `parent` is assigned. Takes a name, a
  content function, an options object, or a Page, so a file-backed child and an
  inline one arrive the same way.
- **`.app`** — assigned on the walk, in `child()`, to the page about to need it.
  Nothing recurses it at boot.

A Page reads `.app` in exactly two places: `activate()` (for `container()`) and
`go()`. Everything else — `link()`, `preview()`, `previews()`, `render()`,
`chain()`, `naming()` — never touches it.

The cost: an eager child you have never navigated to has no `.app`, so
`unvisited.go()` would throw. `link()` is a plain `<a href>` and covers that case.

## Measured

Playwright, 1400×800, module fetches counted per navigation:

```
lazy       /  = 1 module.  Deep cold load of /columns/child/grandchild/ = 4
           (its own chain) — replace/, tabs/ and full/ never touched
columns    360 | 360 | 360 equal tracks, region-scoped
tabs       panel 1 -> 3 pages; input value survives a round trip
redirect   /tabs/ -> /tabs/one/; Back lands on /, not /tabs/
full       page 1400@0 covering the window; .app class is still just "app"
inline     /replace/inline/ and /replace/options/ — real urls, no files
404        App.error() renders with the chrome intact
```

No console errors on any route. No horizontal overflow.

## What replaced the Pager tier

```
core/Pager/ColumnPager.js            new/1
────────────────────────────────     ────────────────────────────────
equal drill-down columns             $pages.ac("cols") — one utility class
Sidebar, crumbs, topbar, burger      site chrome — never was layout
pager(){ new ColumnPager({root}) }   gone
Page.host() walks to find it         gone — nothing to find
TabPager                             a region and some links
```

`Page.host()` existed to walk the ancestors for whoever owned the layout.
`container()` walks for whoever owns the *container*, which is a smaller and more
honest question — and it's the only walk left. `pager()`, `host()` and
`load_ancestors()` are all gone.

## Backed out: `redirect()` and `Router.enter()`

Both existed only to make `/tabs/` forward to a default tab, and both put a
routing concept into `Router` to pay for one layout's convenience — `load()` had
to return a page instead of a boolean, and a second entry point existed purely to
distinguish "the browser is already here" from "we're navigating." Removed.
`go()` pushes the url that was asked for, `load()` returns a boolean, and a tab
group is just a url that renders a bar.

If a default tab is wanted later, it should be reconsidered from scratch rather
than restored — the version that existed was built for one demo.

## Open

1. **`container()` is still action at a distance.** A page writes `this.$pages` (or
   `tabs()` writes `regions`) and *other* files' pages start mounting there. Kept
   deliberately — it is what makes tabs, nested arrangements and columns-inside-full
   expressible at all — but it is the one place a reader of the child's file cannot
   see what happens to it. Two levels of claim is the most it should ever grow.
2. **A page's own `.app` gap** — `unvisited.go()` throws, because `.app` is
   assigned on the walk. `link()` is a plain `<a href>` and covers that case.
3. **`full` covers rather than removes the chrome.** Still tabbable underneath.
4. **No in-flight guard.** Two fast clicks on different unresolved urls still
   race; the slower import lands last and wins.
5. **`page.activate()` assumes its ancestors are mounted.** True because Router is
   the only caller and iterates root-to-leaf. Called directly on a deep page it
   mounts alone, silently.
6. **The sidebar nav is hand-typed.** Building it from `app.root`'s children would
   import every one of them to read their titles — the same trap the tab bar hit.
