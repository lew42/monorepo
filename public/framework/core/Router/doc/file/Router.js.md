The whole tier: 146 lines, no imports, no base class. Everything between a url
changing and the DOM reflecting it lives in this one file — `assign`/`listen` to
start, `click`/`link_clicked`/`go`/`load`/`load_segments` to resolve a navigation,
`activate`/`chain`/`shared_depth` to swap the DOM, `mark`/`mark_links`/`root` to
paint the two-class appearance API.

## No registry, no route table

`load_segments()` **is** the resolver: each hop awaits `page.child(name)`, which
imports on a miss. There is nothing to register and nothing that can drift out of
sync with the real tree, because the tree *is* the source of truth.

## Comments carry the traps, not the design

Nearly every non-obvious line has a one-line `//` or `⚠` comment pointing at a
`doc/*.md` file rather than explaining itself inline — `doc/registry-gate.md`,
`doc/chain-diff.md`, `doc/marking.md`, `doc/scroll-reset.md`,
`doc/styles-loaded.md`, `doc/navigated.md`. That split (comment = pointer, prose =
`doc/`) is why this file stays under 150 lines while the record behind it runs to
ten note pages.

## `activate()` must stay synchronous

The whole rest of the class exists to keep every `await` on the *resolving* side
(`load()`, `load_segments()`) so `activate()` can be wrapped in
`document.startViewTransition()` by a site that wants one. That single constraint
shapes where the two awaits in `load()` live and why `mark()`/the scroll reset/the
title write all happen inline rather than as their own async steps.

## Improvements

1. **Line-number comments in the sibling `doc/*.md` files drift out of sync with
   this file and nothing catches it.** Every citation like `Router.js:92` goes
   stale the moment a comment above it changes length — measured: every single
   line reference across `doc/method/*.md` and `doc/property/*.md` had drifted by
   the time of this audit (see the audit report). *(simple to state, medium to
   fix — it's ~20 line numbers across 16 files; already corrected in this pass.)*
2. **`root()` vs `app.root`** — same word, a `Page` on one side and an `Element` on
   the other, one class apart. The readme's own proposal (`scope()`) is unapplied.
   *(simple, useful)*
3. **The two fast-click and one-Router-per-document questions in the readme's
   "Proposed" section are still open.** Neither is a file-level concern, but a
   reader of this file alone won't know they're being tracked. *(simple, useful)*
