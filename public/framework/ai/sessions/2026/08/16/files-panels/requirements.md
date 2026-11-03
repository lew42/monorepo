# files-panels

## The ask, verbatim

> make the Doc system's files implementation use ext/Panels for each region
> (file list, readme, code)

## Two decisions Mike made at the top

Asked before the first edit, both answered:

1. **Scope — every `files()` caller**, not just `Doc`'s Files tab. `files()`
   itself becomes the panel workspace, so `/framework/start/` and `ext/files`'
   own page change with it. One arrangement site-wide; the flex/container-query
   CSS goes.
2. **No persistence.** `MemorySaver` — a rearrangement here is exploration, not
   a document, so every visit is the seeded one. Nothing on disk, no
   localStorage key.

## Shape

`ext/files` keeps the door and the pieces; a new `panels.js` owns the
arrangement, **dynamically imported** so the dozen-module Panel stack costs
every other page nothing (`app.js` re-exports `files` eagerly for the whole
site — the one cost Mike's chosen option carried, and this removes it).

```
files.js    files(meta, names, {about})  →  div.c("files").append(import("./panels.js")…)
            + common_dir / nest / tree(paths, cut, selected) / source(meta, path)
panels.js   workspace({ saver: new MemorySaver(), templates: REGIONS, seed })
            REGIONS = blank | tree | about | source
files.css   the rows and the two panes; the flex arrangement deleted
```

Selection: one delegated `click` on the workspace root reads `data-path` off
the row, then walks the panel tree and `repaint()`s every leaf that draws the
selected file — so two source panels side by side both track it. The tree is
**not** repainted (a redraw throws away the scroll position of the row you just
clicked); its mark moves by class toggle across every live tree.

## Fences

Files this task owns:

- `public/framework/ext/files/files.js`, `panels.js`, `files.css`, `readme.md`,
  `page.js`, `doc/*`
- `public/framework/ext/Doc/Doc.css` (the `.doc-files` height/frame rules only)
- `public/framework/start/page.js` (only if the call needs to change)

Not owned: anything under `ext/Panel/` — this is a consumer of that module, and
a change needed there is a finding, not an edit.
