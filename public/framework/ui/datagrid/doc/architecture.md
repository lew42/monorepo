# datagrid architecture — pure markup, no behavior

A CSS grid rendered from two arrays: columns (keys, labels, widths, format functions) and rows (objects). Entry: [`datagrid.js`](../datagrid.js), which re-exports the static functions from [`ext/DataGrid`](/framework/ext/DataGrid/). The actual functions live in `ext/DataGrid/DataGrid.js`.

## Markup and behavior are separate

**Decided:** this module exports only the markup — `datagrid`, `datagrid_head`, `datagrid_body`, `grid_template`, `to_len`. Behavior (resize, sort, filter, windowing) lives in [`ext/DataGrid`](/framework/ext/DataGrid/).
**Why:** markup is UI (no state, no listeners); behavior is UX. `datagrid()` is a function, so a new agent reads it as UI code, but everything it renders is static.
**Instead:** a single class with no markup/behavior split (rejected — conflicts with the UI/UX law in CLAUDE.md).
**Detail:** [doc/decisions.md](./decisions.md#1-why-the-markup-and-the-behaviour-are-two-separate-modules)

## One `--col-<key>` custom property per column, inline

**Decided:** each column sets its width/min via a single CSS custom property (`--col-<key>`) on the grid element itself at mount time.
**Why:** resizing needs only a property write on every pointer move; no full grid-template-columns recompute, so no layout thrash on a drag.
**Instead:** write `gridTemplateColumns` directly (expensive layout pass per frame).
**Detail:** [doc/decisions.md](./decisions.md#2-one-colkey-custom-property-per-column-set-inline)

## Resize handle visibility is CSS-only

**Decided:** the `.datagrid-grip` appears on `:hover`/:focus-visible with one CSS rule; no JavaScript "is the pointer near this edge" computation.
**Why:** removes the expensive near-zone listener that was running on every pointer move, anywhere on the page (the source of the 108% CPU cost in the original Sessions grid).
**Instead:** a hit strip spanning the full grid height, with a JS near-zone watcher (rejected — the handle appeared late; CSS :hover fixes both, instantly, for free).
**Detail:** [doc/decisions.md](./decisions.md#3-the-resize-handle-is-css-only--no-js-near-zone)
