# `about` — prose beside the source

Added 2026-08-15 so a module's docs and its code can share one screen: `ext/Doc`'s
Files tab passes `about: path => md.file(this.meta, "doc/file/" + path + ".md", { h1: false })`,
and the pane shows what a file is *for*, beside what it *says*.

## The contract

```js
files(meta, names, { about: path => view | Promise<view> })
```

`about` is called once per shown path, with the **declared** path — the same
string that appeared in `names` — never the shortened display name. Its return
fills the `div.c("file-about")` column. It is optional:
`{ about } = {}` is the whole default, and a caller that omits it gets a
two-column browser rather than a third column drawing an empty box.

## Placement is the reader's, not a breakpoint's

The pane used to be `flex: 0 1 24em` beside the source, dropping under it at
`@container (max-width: 56em)` — a container query rather than a media query,
because a `files()` call is as likely to sit inside a demo stage or a split
pane as directly on a page, and the window's width says nothing about either.

That argument was right and the mechanism has changed twice since: an
`ext/Panel` leaf briefly (2026-08-16), and as of 2026-09-28 a plain flex
column with an [`ext/grip`](/framework/ext/grip/) strip on its right edge. A
reader who wants more prose drags for it, at any box width, without anyone
having guessed a breakpoint. What did NOT carry over from the panel version is
the seeded row/column axis for a narrow screen — a narrow box now scrolls the
whole row sideways instead of stacking the about column above the source;
[columns](./columns.md) has the open item.

The old `flex: 0 1 24em` reasoning survives as the seeded `clamp()` width in
`files.css`. The extra room on a wide screen still goes to the *source*, not
the prose: a paragraph stretched to fill 60% of a 3440 screen is unreadable
regardless of measure.

## The capture trap

```js
$about = div.c("file-about", () => about(state.path));
// later, on a new selection:
$about.empty(() => about(state.path));
```

Both calls hand `about(path)`'s return value to a captor that is already
placed — `div.c`'s callback form on the way in, `.empty()`'s on every redraw
after. `append_fn` re-establishes the captor inside either one and appends
whatever the hook returns, so `about(path)` may hand back a view it built or a
promise of one (`md.file()` is the second shape) and both land in the same
place. Calling `about(path)` and dropping the return value, instead of
returning it from the callback, renders nothing — silently.

## Who calls it

- `ext/Doc`'s Files tab (`Doc.browser()`) — every `Doc` module page. `{ h1: false }`
  on the `md.file()` call drops the doc's own leading `<h1>`, since the file
  name is already the tree row.
- This module's own Files tab — `files:` on this page.js makes it dogfood the
  hook it documents.
