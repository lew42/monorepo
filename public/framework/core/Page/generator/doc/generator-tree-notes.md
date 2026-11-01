# tree.js — design notes and removed commentary

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

## Overview and entry point

The module generates a nested page tree from spec text. Spec text → **page configs**, the nested-POJO form `Page.declare()` already takes:

```
this.children = new Map();
tree(spec, seed).forEach(config => this.add(config.name, config));
```

That is the whole trick, and it is why this file is short. A `children:` array of plain objects IS a virtual page tree — `add()` builds a real `Page` per entry and recurses — so the generated tree gets real urls, the real Router, the real `active-page` / `active-ancestor` contract, and core's columns. Nothing touches the filesystem, and nothing here plays app the way `ext/demo`'s box does.

Each config overrides three methods, which is all a generated page is:
- `column()` — its picture, in the shape its block word names
- `link()` — the same url, carrying the seed
- `container()` — WHERE its view mounts: a new column, or its parent's panel

A fourth is `route("code")` — the one UNDECLARED child every generated page answers (`Page.child()`'s own contract: memory, then `route()`, then a filesystem probe). It never appears in `children:` and is never part of the exported tree (`export.js`'s `kids()` filters on `.at`, which this child does not have); it reuses `export.js`'s own `content_line()` / `width_line()` / `module()` to show what a hand-written page.js for THIS page would say, plus the calls the host's own controls logged against this page's position (`page.js`'s `swap()` / `calls`).

**IMPORTANT:** Every generated url carries `#<seed>`. `Router.go()` pushes `pathname + search + hash`, so a plain href would DROP the seed the moment you navigated one level in — and the reload would rebuild a different tree under the same url.

---

## inplace() function

**THE ONE QUESTION** every placement asks: does this page show its children INSIDE itself? `tabs` and `vtabs` do; `wall`, `list` and `prose` open a column to the right.

---

## tree() and nodes() functions

`hash` is the generator's address — `#7` for a seed, `#s=<encoded>` for a typed spec. Every generated url carries it verbatim; this module never builds one itself. `host` is the generator page itself — threaded through only so a page's `route("code")` can read `host.calls`, the log every control click appends to (page.js).

One config per line. The NAME is still the block word plus an ordinal, so a url reads `…/wall/list/prose/` and says what the tree is; the TITLE is a word drawn from the page's own key, so a nav of three children reads as three different pages. Both, because they answer different questions — the url is structure, the label is content.

A width word is a track in the ROW, and an in-place child is in a panel — it has no track to be wide in. `gen()` already refuses to draw one; this drops it from a typed spec too, so the two agree about what the word can mean.

### Page seed (key)

THE PAGE'S OWN SEED is computed from its PLACE in the spec — parent, position, arity. Content is then a function of the spec text and nothing else, so a typed tree gets distinct children with no seed at all, and the same spec twice is the same page twice down to the last bar. fill.js draws everything from it.

**Important design decision:** The BLOCK WORD is deliberately not in the seed (it was, until the switch controls landed). A control that changed how a page presents its children also renamed it and redrew every bar inside it — "Reports, vtabs" became "Bulletin, tabs" — which is a silent reroll, and the one thing a control may not do. A page's content is a function of WHERE it is, so switching its word leaves it the same page.

### Location and indices (at, opt)

MY PLACE IN THE SPEC is stored as indices — the address every control edits through (`host.swap(this.at, …)`, spec.js). Indices and not the url, because a page is named after its block word: switching `list` to `tabs` renames it, and a name path would point at a page that stopped existing the moment the switch landed. `opt` is the rest of the line — `flow` `cols` `gap`, read by `shape()`.

---

## container() function

WHERE A VIEW MOUNTS is shared by every generated page AND its `code` child, because both answer the same question: does MY PARENT show its children inside itself?

Core hands a child to the nearest ancestor's `$pages`, which is a SIBLING of that ancestor's column body, so `display: contents` floats it out as the next column in the row. Two lines change that:

1. an in-place parent hands me its `$panel` instead — inside its body, so the row never grows and picking a tab (or opening its code) swaps content where it stands
2. my own children then skip PAST me to the nearest ancestor that still owns a slot in the row, or a grandchild would open inside the panel too

This is `ext/tabs`' `regions` contract by hand: same seam, same guarantee that an ancestor has rendered before I look (Router.activate runs root-to-leaf).

---

## code_child() function

THE CODE TAB'S OWN CONFIG — `route("code")`'s answer. `this` at render time is the LIVE code page `add()` just built, and `this.parent` is the generated page it hangs off (adoption sets that the moment `child()` adopts what `route()` returned) — so every read below is the CURRENT state of that page, not a snapshot from when the tree grew.

Three things, and `export.js` writes two of them already — read there first:
- `serialize([node])` — this page's own spec line (and any nested lines), spec.js's
- `module(page)` — the whole page.js `export.js` would write for it
- `host.calls` — one line per control click, logged by `page.js`'s `swap()`, keyed by `page.at` so it survives the regrow every click causes

The code tab is rendered as a `route("code")` UNDECLARED child (Page.child()'s memory → route() → filesystem order), so it exists only once something links to it (the small `code` icon `column()` draws below) and is never part of `children:` or the exported tree (`export.js`'s `kids()` filters on `.at`, which this child does not have). `node` is THIS line's own raw spec node (spec.js's `parse()`), closed over so the tab can show its own fragment without re-parsing the whole spec.

---

## items() function

One child, one link — the ONE place a generated url is written, so the generator's own column and every column it grows carry the seed the same way. A page's view is built when it ACTIVATES, so a generated child is invisible until something links to it. The generator's own column draws this list too; without it the tree exists in memory and nothing on screen can reach it (2026-08-26).

An inbox row and a wall card are PREVIEWS, not links: a line or two of the page behind them, which is the whole reason those columns cost their width. A tab or a side tab is a label and nothing else — a strip has no room.

---

## column() function

ONE COLUMN, for all five words — `Page.column()`'s shape, with the child list drawn as whatever the word names. The word is a CLASS and `generator.css` is what makes a `wall` look like a wall, so a sixth word is one entry in `gen.js` and one rule there.

`width` is core's own word — `column()` stamps `.page-column-<width>` and Page.css turns that into a track. See doc/columns.md.

The two words whose children are a WALL OF LINKS are `wall` and `list`, and they are the only two with an arrangement to control. A strip of tabs is one line and has none.

### The switch control

THE SWITCH on the head shows this page's word, and its track. The word chip that used to sit here was a READOUT of exactly these two, so nothing was added to the head: the readout became the control.

### Code tab link

THE CODE TAB is a real link (`route("code")` above), so a reload or a middle-click lands on it too. `.attr("title", …)` because the icon alone says nothing to a reader who has not met this feature before.

---

## nav() and panel() functions

The child list — and the ONE place `shape()` is applied. A wall and an inbox are the same box in framework words: `.grid.auto` (or `.flex.auto`) reading `--column`, and `.gap` reading `--gap`. The `tune` chips above write those two tokens and nothing else, which is why swapping grid for flex needs no rule of our own.

### In-place shape (panel)

THE IN-PLACE SHAPE is a strip of tabs (or a side rail) and the box its children land in. `container()` above sends every child into `$panel`, and the page's own content sits in there too and steps aside when a child arrives — a `@layer util` rule in generator.css, the same one `ext/tabs` uses on `.tab-panel`. So a tab set with nothing selected shows its own page rather than a blank box, and a childless one shows why it is empty.
