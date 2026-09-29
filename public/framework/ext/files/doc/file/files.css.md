# `files.css`

The frame, the flex columns, the tree rows, and the two payloads (source, about). One
theme layer, no container or media queries — since 2026-09-28 the columns are plain
flex, sized by `clamp()` and moved by [`ext/grip`](/framework/ext/grip/), not
[`ext/Panel`](/framework/ext/Panel/) leaves.

## `.files` is a frame around a token, `.files-fill` overrides it

```css
.files { --files-height: min(70vh, 30em); display: flex; flex-direction: column; block-size: var(--files-height); … }
.files-fill { block-size: 100%; }
```

A plain caller gets a bounded box with its own scroll (the default `--files-height`);
`fill: true` — minion B's full-screen `/fs` route — makes the box claim its parent's
whole height instead, so the *columns* scroll and the page never does. `ext/Doc`'s Files
tab retunes `--files-height` the same way it always did.

## The columns: one row, `clamp()` widths, a written variable

```css
.files-col-tree { flex: 0 1 clamp(10em, var(--files-col-w, 16em), 60%); }
.files-col-source { flex: 1 1 0; }
```

The tree (and the `about` column, when it exists) has a seeded width via `clamp()`'s
middle argument; dragging its grip writes `--files-col-w` on that column and nothing
else, which is `ext/grip`'s whole contract — only the dragged column changes, whatever
is to its right just slides over. The source column is `flex: 1 1 0`: it always takes
whatever is left. Nothing is saved past the visit — same trade the deleted
`MemorySaver` made.

## What went, and what replaced it

| gone | replaced by |
|---|---|
| `ext/Panel`'s workspace bar (add / fullscreen / zoom / presets) | nothing — it was never this module's own UI |
| the `files-bar` mode switcher (1 column / 2 columns / code + rendered) | nothing — the owner called it cluttered; the columns are just always tree(+about)+source now |
| the seeded row/column axis (a phone got a stacked tree) | nothing stacks now — the row scrolls sideways once the columns' floors stop fitting, the same trade `core/Page`'s own `.page-columns-row` makes |
| `panel.css`'s grip-and-seam CSS | `ext/grip`, mounted directly inside `.files-col` |

## The source block is flush and has no end

```css
.file-source > .code-block,
.file-source > pre { margin: 0; border: none; border-radius: 0; font-size: 0.85em; }
```

Unchanged: `.files-col` is the scroller now (`overflow-y: auto`), so the block inside it
neither draws its own frame nor caps its own height.

## The folder body: closed by default, one glyph that turns

```css
.file-dir-body { display: none; }
.file-dir.open > .file-dir-body { display: block; }
.file-dir.open > .file-dir-name .icon { transform: rotate(90deg); }
```

New in this pass. A closed folder's body is hidden, not removed, so reopening one that
was already built (past `open`'s depth, or an ancestor of the selected file) doesn't
rebuild it. The chevron rotates rather than swapping glyphs — one `<span>`, one
`transform`.

## Improvements

1. **`--files-height`'s default is still the same guess (`min(70vh, 30em)`) with one
   known override (`ext/Doc`).** Carried over from before this rewrite, unchanged.
   *(simple, speculative)*
2. **The sideways scroll on a narrow screen has not been driven with a pointer, only
   read from the CSS.** `core/Page`'s own columns do the identical thing, so the
   mechanism is proven elsewhere; this module's own narrow-width behaviour wants a
   headless check before it ships somewhere phone-first. *(simple, needs a check)*
