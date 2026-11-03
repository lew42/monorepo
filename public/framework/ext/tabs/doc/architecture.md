# Tabs architecture — the set is placed, not marked

`tabs.js` adds one method, `Page.prototype.tabs()`, that turns named children into a bar of links plus one panel. Main class: `Page` ([`core/Page/Page.class.js`](/framework/core/Page/)); files: [`tabs.js`](./../tabs.js) (the method), [`tabs.css`](./../tabs.css) (three shapes), [`switcher.js`](./../switcher.js) (a vertical set in a `<details>`).

## Which children are tabs is decided at placement

**Decided:** a child becomes a tab only when a `tabs()` call names it; the child itself carries no tab flag.
**Why:** a page can hold several sets, and a child in none of them must render where it would anyway.
**Instead:** a `tab: true` flag on the child, which made every child name a layout decision.
**Detail:** [doc/decisions.md](./decisions.md#which-children-are-tabs-is-decided-at-placement-not-marked-on-the-child)

## A set nests by nesting pages, not sets

**Decided:** a tab that needs its own tabs is a `Page` whose own `render()` calls `tabs()`.
**Why:** `Page.container()` already reads `parent.regions`, so both levels get real urls, marking and back-button behaviour with no depth logic here.
**Instead:** a set inside a set, which would need its own routing and marking code.
**Detail:** [doc/decisions.md](./decisions.md#a-set-nests-by-nesting-pages-not-by-nesting-sets)

## The flush strip is the default; the box is opt-in

**Decided:** the default is a flat label strip, a hairline and a 2px accent under the selected tab; `.bounded` adds the rectangle (fill, frame, cut-out tab).
**Why:** the quiet version is the component. A bar that ships a box has decided a look that is not its call.
**Instead:** a `.minimal` class, rejected for the same reason. `.underline` still parses and names the default.
**Detail:** [doc/decisions.md](./decisions.md#2026-09-06--reversed-flush-is-the-default-the-rectangle-is-the-opt-in)

## `.block` is a style option, and `--tab-fill` is the one way to tint it

**Decided:** `.block` (folder tabs, used by `Doc`'s top bar) is a class on the set; the selected tab has no fill, and a host that tints the strip sets `--tab-fill` to the ground its content sits on.
**Why:** a tab cannot know the page background, so it must be transparent unless told otherwise.
**Instead:** a fill by default, which would show a box on every untinted page.
**Detail:** [doc/decisions.md](./decisions.md#decisions)

> ⚠ `block` labels are not the `h4` class. `tabs.css` sets `--size: 0.8`, bold and uppercase on the tab itself (lines 127 and 147). The `h4` wording in decisions.md is stale.

## The panel shows the default child, and the url picks the rest

**Decided:** every set renders its first child as the panel's `.default`; the url chooses which child shows, so a click and a reload produce the same output.
**Why:** a panel is never blank, and the url is the only state.
**Instead:** a client-side selected-tab variable, which a reload would lose.
**Detail:** [doc/decisions.md](./decisions.md#decisions)

## Only the first set owns the parent's url

**Decided:** the first `tabs()` on a page sets `default_tab` and owns the page's own url; a later set cannot.
**Why:** two defaults would both claim the same url.
**Instead:** nothing else; a second set silently has no default. Two sets that name the same child also collide silently in `regions`, and the second panel wins.
**Detail:** [doc/decisions.md](./decisions.md#traps-none-of-which-warn)

## A tab label never depends on which tab you arrived at

**Decided:** `label()` reads `label`, then `title`, and falls back to the name only while the children load.
**Why:** a title that changed per entry point made the bar read differently on every visit.
**Instead:** the name of the tab, which is what the bar showed before.
**Detail:** [doc/decisions.md](./decisions.md#traps-none-of-which-warn)

## `[aria-current]` is a third selected mark

**Decided:** `.active`, `.in-path` and `[aria-current]` all count as selected, in all three shapes.
**Why:** a stand-in app (`demo.app`) has no Router to set the two classes.
**Instead:** only the Router classes, which left demo strips with no selected tab.
**Detail:** [doc/decisions.md](./decisions.md#aria-current-counts-as-selected-too-in-all-three-shapes)

## A set of one is hidden

**Decided:** a bar with a single tab is not drawn.
**Why:** a rail of one is not a rail; it is noise.
**Instead:** a bar of one tab, which is what it used to show.
**Detail:** [`tabs.css`](./../tabs.css) line 119.

## Late links are marked by hand

**Decided:** `tabs()` calls `mark_links()` after it draws its links, and any code that renders links late must do the same.
**Why:** `mark()` has already run by then, so new links miss the pass.
**Instead:** waiting for a later mark, which never comes for a stand-alone set.
**Detail:** [doc/decisions.md](./decisions.md#traps-none-of-which-warn)
