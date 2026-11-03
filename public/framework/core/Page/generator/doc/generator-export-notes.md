# Export system notes

## The endgame: exporting generated trees to real page.js files

THE ENDGAME — a generated tree, written out as real `page.js` files.

Waves 1-7 built a page tree that has everything a real one has except a filesystem: real urls, the real Router, core's columns, the `active-page` contract. This is the last thing it was missing — a way OUT. One click writes one directory per page under `/imagine/generated/<name>/`, each with an ordinary `page.js`, and the result is browsable exactly like a module somebody typed by hand. Nothing under there imports anything from this directory.

The whole export is a function of the LIVE TREE — `host.children`, the same Pages you are looking at — so what lands on disk is what was on screen. The draw path (`gen.js`, `rules.js`, `spec.js`) is not touched, read or re-run: `#7` still means one tree and the reproducibility line stays green.

⚠ DEV ONLY, by design. The site is static in production, so the writer is the dev server's `rpc:write` (Server/plugins/SocketServer/Runtime.js) and the control disables itself with a reason when nothing answers — see `report()`.

## Export directory location

Where an export lands. `/imagine/` is the lab world, and its own index page is the one file outside this directory that had to learn the word "generated".

## SHAPES: rendering strategies for different page types

One `page.js` per page, in the shape the readme's own "four words that were cut" section writes by hand — because that section is the answer to "what does this word look like when a person writes it", and it was already written.

```
wall    a card wall            index: true + previews()
list    an inbox               nothing — core's column already lists children
prose   the leaf               a line of md()
tabs    a strip over a panel   ext/tabs' `tabs()`
vtabs   the same, on its side  `tabs().ac("vertical")`
```

⚠ A CHILDLESS PAGE IS A LEAF, whatever word it wears. `gen()` already draws it that way and `kind()` already offers `prose` only to a page with no children; a typed spec can still say `tabs` with nothing under it, and `tabs()` on an empty set reaches for `list[0]` and throws. One rule, three places agree.

## Cell calculation and column fallback

`cols=3` is three tracks exactly: `.page-previews` is `auto-fill` over `--column`, so the track is what is left after the gaps, divided three ways. ⚠ The fallback is `1em` — core's own wall gap — and NOT the `0px` controls.js writes for the generator's own nav. Guess it low and the third track no longer fits: `auto-fill` silently drops to two columns. Same idea, different wall.

## Style settings for generated pages

The two spec settings core's wall can actually read. `flow=` has no equivalent here on purpose: it swaps the generator's own nav between `.grid.auto` and `.flex.auto`, and `previews()` is one grid — a `.flex` wall would be a rule this export invented, which is the opposite of "reads like a person wrote it".

## Generated pages filter

The generated pages under one page, in spec order. `at` is the filter the whole module uses: the permutation wall and the spec gallery are stable children with no place in the spec, and neither is part of the tree being exported.

## Module generation: fields order

ONE FILE. Fields in the order every hand-written page.js in this repo puts them: what I am, how wide, what is under me, what I draw.

Core's own word — `.page-column-<width>`, a track in the row. An in-place child never has one: `tree.js` dropped it upstream, so there is nothing to write.

## Root page generation

THE ROOT — the one page the spec does not describe. It is the export's own name, the provenance of the tree, and the single line that makes the whole subtree lay out as columns. Everything below it is an ordinary page.

⚠ The spec goes in a BLOCK COMMENT and a typed spec is whatever somebody typed, so `*/` is neutered before it ends the comment three lines early.

A seed is only an address against one MODEL, so the file says which one it was drawn under — the same line the proof strip prints. A typed spec has no seed to name and its own text is above.

## Index page generation

THE INDEX — `/imagine/generated/page.js`, rewritten on every export because its `children:` is the only record that an export happened. Nothing crawls: a page exists once its parent names it, and this is the parent.

⚠ `children:` is OMITTED when the list is empty. `children: ""` declares one child called "" — `"".split(/\s+/)` is `[""]`, not `[]` — and the index would render a nameless row that 404s.

## Shape determination

THE SHAPE A PAGE DRAWS AS — factored out of `module()` so the code tab (tree.js) can ask the same question `module()` already asks and never get a different answer. A CHILDLESS PAGE IS A LEAF, whatever word it wears (module()'s own note above).

## Content line extraction

ONE LINE — the `content(){ … }` body a hand-written page.js would have for THIS page, right now. `null` for a shape with none (`list` — core's own column already draws its rows). The code tab's second reason to exist: read this, don't reprint it.

## Width line extraction

ONE LINE — the `width:` field, or `null` when the page sits on the default track.

## Export function explanation

EXPORT — and the four answers it can give, all of them quiet.

`ls` first, and it does three jobs at once: it proves a dev server is listening, it says whether this name is taken, and it is where the index's `children:` comes from. That is why there is no manifest file — the directory IS the list, and a second copy of it would be a second thing to keep in step.

## Export write process

Writes go through the one file API (ext/filesystem/FsFile.js), never a raw rpc.

The seam, last: the index names the directory only once the directory is there.

Files, not pages — the list is the tree plus the root that holds it, and the root's own description already says how many pages the tree is.

## Suggest function: naming exported trees

A NAME THIS TREE ALREADY HAS. A curated or saved spec has a title and that title is the obvious directory name; a rolled tree has a seed and nothing else. Both are only a suggestion — the field is editable, and `Page.slug()` is what actually decides what a directory may be called.

## Control UI

The control, under the spec box — where the tree already is. One field, one button, one line of feedback that is never an alert.

⚠ Off the dev server there is no socket at all (`dev/Socket` gates on hostname), so the button is disabled before it is ever pressed and the line says why. That is the honest production state: this page still rolls, types, switches and links — it just cannot write files, because there is nothing to write to.

## Report function

The answer, in the line under the button — and a LINK when there is one, because the whole point of the feature is the page you can now open.

## Write ordering

Every page in the tree, as `[url path, source]` — the whole write list, in the order it is written: deepest last, so no index ever names a directory that is not there yet.
