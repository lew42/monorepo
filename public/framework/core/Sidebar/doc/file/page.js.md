This module's own page: `subject: Sidebar`, its six properties, its eleven
methods, its six notes — and three live demos in `content()` rather than an
`overview:` rail.

## Why `content()` and not `overview:`

The three demos build in complexity — bare API, then groups and icons, then
the two-token light/dark pair rendered **side by side** in one demo, which is
already the rail's own advice (*show the effect, not the name*) without
needing the rail's machinery. Three demos in a fixed order reads as a small
tutorial; `overview:` earns its keep when variants are interchangeable and a
reader wants to pick one, which isn't the shape here.

## `toc()`, and nothing else structural

The only layout call beyond the demos and prose. Everything else is `h2()` +
`demo()` + `md()`, in the order a reader would want to meet the API.

## Improvements

1. **`files:` was missing entirely before this pass** — no Files tab, no
   `doc/file/*.md`. Fixed in this pass: `files: "Sidebar.js Sidebar.css
   page.js"` plus the three files it now points at. *(simple, important — done)*
2. **The nested-groups code sample (line 49) is an unlabelled fence.** It's a
   usage fragment, not a pasteable file, which is the documented exception —
   correct as-is. *(n/a)*
3. **A fourth demo showing the narrow-screen collapse** (a fixed-width demo box
   under 52em) would make `docs/narrow/`'s behaviour visible from the Overview
   instead of requiring the reader to shrink the whole browser window.
   *(medium, useful)*
