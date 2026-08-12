# /web/nav/ — design record

Eleven pattern pages in a `catalog()`, eight of them `demo.tree()` and three —
`tabs`, `jumps`, `drill` — hand-shaped because they compare *two or three* sites at once.
The reader-facing verdicts live on the pages; this is what it cost to build them.

## Decisions

**The shells are written out, once per file, not factored into a helper.** Six of
the nine patterns need a persistent shell, and every one of them is the same four
lines: `render()` returns `div.c("page full flex …")`, builds its chrome, and sets
`this.$pages`. A shared `shell()` would have removed that from the file the reader
opens — and the shell *is* the pattern. The three things an override owes are the
same three `/framework/page.js` owes: set `this.view`, carry `.page`, never nest a
second one.

**The demos build `ext/tabs`' markup by hand, and that stays.** It was originally
forced — `tabs()` ended with `this.app?.loaders.push(…)` and a `DemoApp` has no
`loaders`, so it threw. That is fixed (`loaders?.`), and `catalog()` never threw at
all; both now work inside a demo app. The hand-built version stays because these
pages teach *the pattern* — a bar of links and the region they swap — not the ext
that ships it. `rail/page.js` likewise builds its rail from `previews()` + `$pages`.

**`aria-current` is the only mark inside a demo app** (`ext/demo/app.js`), and
each component's *"nothing selected yet"* fallback lights its first entry
unconditionally — so without help two tabs read as selected at once, and the one
you are actually on reads as neither. The six rules that used to fix that here are
gone: `ext/tabs` and `ext/catalog` now count `[aria-current]` as selected in their
own stylesheets, which is where the selected look already lived. This directory
ships no stylesheet.

**Every demo opens on a real page, not on its root.** A shell whose region is
empty demonstrates nothing, and it is what the card in the rail shows. So each
tree function ends in `.children.get("…")` — the same move
`core/Page/overview/deep` makes.

**`zoom-25` for the three multi-box previews.** The rail's thumb ceiling is 10em
(`catalog.css`), so a two-box render at the usual 50% crops to one box — and the
`h4` label above it read as a *rail group heading*. At 25% the whole comparison
fits the card, which is the only thing those three cards have to say.

**Distinct root titles, deliberately.** Eleven trees named `Web` would be eleven
identical thumbnails and eleven identical crumb strips — the lesson
`core/Page/overview/readme.md` already paid for. Also: `web()`'s own default root
title is now the url of *this section*, so every use of it here renames the root.

## Traps

- **A tree is a function, not a `Page`** — a `Page` caches its `view`, and the
  card's copy and the stage's copy would fight over one DOM node.
- **A url in a demo's prose must match its own root.** `demo.app` only intercepts
  paths under `root.url`; a stale one navigates the real site.
- **`links(page)` reads `page.parent`,** so it only works from a child. The three
  `drift` pages each render their own nav that way.
- **A bleed stage has no inset.** Fine around a bordered demo app, wrong around
  prose — the three comparison pages add `pad` to their own container.
