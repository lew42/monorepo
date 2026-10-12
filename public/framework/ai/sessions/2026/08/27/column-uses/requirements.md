# Column uses — real-world usages of columnar pages

Wave 2, task D of the column-pages-2 mastermind run. Spec is the owner's paragraph:

> try to create some real-world usages of these columnar pages:
>
> deep trees of content.  explore layouts (full screen layouts, 3440 layouts, multi-column
> (2, 3, 4, etc), multi-panel (split the viewport's height into 2 vertical areas), and figure
> out how to get different areas/panels to communicate, cross-page.js.  each child page should
> have a reference to it's parent.  maybe a TopicPage could be referenced at `child.topic`, so
> all children can find their nearest `.topic` by simply asking for `this.parent.topic`.
> similar for a Document.  then, deeply nested pages could interact relatively simply with a
> page system.

## What gets built

`core/Page/overview/columns/uses/` — a parent page plus four exemplar trees, each a hand-written
`new Page()` composition (patterns, not generator specs), each honest about the mix of words it
uses and ending with a one-line verdict on that mix.

1. **docs/** — a deep tree (5+ levels): sections switch in place via `tabs()`/vtabs, an API member
   list opens columns rightward, `crumbs`, one `width: "full"` reader leaf. One line per level
   saying WHY that nav kind.
2. **inbox/** — list/inbox as an app: `small` preview column, detail column rightward, and a live
   cross-page touch — the root claims `is: "topic"`, the detail marks read, the preview column
   shows the unread count via `nearest("topic")`.
3. **workbench/** — the 3440 exemplar: 2/3/4 columns of real content side by side via width words;
   what fullscreen means; where the dead space goes. Usable at 1280.
4. **split/** — multi-panel: viewport height split in two (the `doc/panels.md` pattern), top a
   columns tree, bottom a status/console area that reacts to navigation above through the shared
   topic ref. The one-chain limit stated honestly on the page.

## Fence

Owned: `core/Page/overview/columns/uses/**` (new) + the one `children:` line in
`core/Page/overview/columns/page.js`. Nothing else — a sibling owns `core/Page/generator/**`;
`core/Page/*.js|css`, `examples/**`, `refs/`, `panels/` are read-only.

## Constraints

- Dev server on :80 is the owner's — never kill/restart, browse headless read-only.
- Never drive the owner's tabs, never `git stash`, never commit.
- Screenshots go to the session scratchpad first; keepers copied into the task dir after probes
  finish (a probe that writes into `public/` fires LiveReload and blanks the page mid-run).
- Every CSS rule in a layer; backgrounds `--wash`/`--tint`/`--surface`, never `--well`; new class
  names prefixed per `new-css-class`.

## Verify

Each exemplar headless at 1280/1920/3440 (400 additionally for inbox), zero console errors; the
two cross-page demos prove their updates with numbers; a 5-deep docs url deep-loaded cold.
