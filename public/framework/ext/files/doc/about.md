# `about` — prose beside the source

Added 2026-08-15 so a module's docs and its code can share one screen: `ext/doc`'s
Files tab passes `about: path => md.file(this.meta, "doc/file/" + path + ".md", { h1: false })`,
and the pane shows what a file is *for*, beside what it *says*.

## The contract

```js
files(meta, names, { about: path => view | Promise<view> })
```

`about` is called once per shown path, with the **declared** path — the same
string that appeared in `names` — never the shortened display name. Its return
fills a `div.c("file-about")` inside the `about` panel. It is optional:
`{ about } = {}` is the whole default, and a caller that omits it gets a
two-region browser rather than a third region drawing an empty box.

## Placement is the reader's, not a breakpoint's

The pane used to be `flex: 0 1 24em` beside the source, dropping under it at
`@container (max-width: 56em)` — a container query rather than a media query,
because a `files()` call is as likely to sit inside a demo stage or a split
pane as directly on a page, and the window's width says nothing about either.

That argument was right and the mechanism is gone: `about` is an
[ext/Panel](/framework/ext/Panel/) leaf now, seeded at two shares to the
source's four and a half, with a **grip** between them. A reader who wants more
prose drags for it, at any box width, without anyone having guessed a
breakpoint. The one thing seeded rather than dragged is the axis — a column
below 640px, a row above — because a split holds its axis at every width:
[panels](/framework/ext/files/docs/panels/).

The old reasoning for `flex: 0 1 24em` survives as the seed's proportions. The
extra room on a wide screen still goes to the *source*, not the prose: a
paragraph stretched to fill 60% of a 3440 screen is unreadable regardless of
measure.

## The capture trap

```js
about: { icon: "notes", draw(){ div.c("file-about", () => about(state.path)); } }
```

`draw` runs with the captor already on the panel's `$body`, so `div.c(…)`
places itself. The **callback form** is what makes the fill correct either way:
`append_fn` re-establishes the captor inside it and appends whatever the hook
returns, so `about(path)` may hand back a view it built or a promise of one
(`md.file()` is the second shape) and both land in the same place.

The earlier flex version made the same trap twice in nine lines — the `about`
div placed itself while the source pane had to be **returned** from an
`.empty()` callback, because it captures nothing. Both regions are written the
same way now, and the rule underneath is unchanged: build synchronously, or
return what will fill in later. Calling instead of returning renders nothing,
silently.

## Who calls it

- `ext/doc`'s Files tab (`Doc.browser()`) — every `Doc` module page. `{ h1: false }`
  on the `md.file()` call drops the doc's own leading `<h1>`, since the file
  name is already the tree row.
- This module's own Files tab — `files:` on this page.js makes it dogfood the
  hook it documents.
