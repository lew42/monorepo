# The shell is a panel workspace

## Where does a region's `draw` live?

**Options considered.** (a) Put `palette`/`canvas`/… into `ext/Panel/templates.js`,
the global `T` vocabulary every panel on the site offers. (b) Assign a `draw`
onto each hydrated `Panel` by template name after `Item.open`. (c) Hand
`workspace()` a workspace-local registry.

**Verdict: (c)**, `workspace({ saver, templates, seed })` — three keys, one call.
(a) puts editor state in a module that must not know the editor exists, and would
show `canvas` in the `T` menu of every panel on the site, including ones that
have nothing to do with this document. (b) fights `paint()`, which resolves
`item.data.template ? template.draw : item.draw` — a region has to *persist* its
name to survive a reload, so it must go through `data.template`, and then only a
registry can answer what that name means. In `ext/Panel` the registry is one
instance property on the **root** `Panel` (`root.templates`), read by
`vocab(item) = item.root().templates ?? templates`; it never serializes, exactly
like `saver` and `parent` don't.

Two behaviours fall out of the same predicate, `vocab(item) === templates`: a
workspace with its own regions is offered **no `random`** (rolling would give an
editor two canvases) and **no per-body `layout.bar`** (its regions already carry
controls of their own, and the floating bar would sit over the corner they use).

## Editor state stays in the closure

Each region is `{ draw(){ … } }` closing over `doc / sel / nodes / history`, and
its first act is to assign the `$var` the painters write to. So **every painter
is guarded** (`$layers?.empty(…)`): a region the current arrangement does not
show has no body, and closing the canvas must not stop the layers list working.
Verified by hand — with `canvas` closed, layers, properties and the badge all
still run.

## Two drag systems, one registry

`Draggable.registry` is a single `WeakMap` for the whole document, so `locate()`
happily offered a `Panel` an editor `Block` as a drop target and vice versa — one
`item.move()` and the two trees would cross. The guard is one clause in each
`drop_check`: `target.item?.root() === this.item.root()`. It also closed a live
defect on `/framework/ext/Panel/`, where a workspace panel could be dropped into
the `panel(fn)` demo lower on the same page.

## The saver chooser is a two-line helper

`store(path, key)`, applied twice, rather than the same ternary written out
twice. Ruling 15 wants the `LocalStorageSaver` mount **visible in one line** at
the call site; it is, and there is one definition of it to keep in step rather
than two copies that can drift — see the cross-module review's finding on this
exact duplication between here and `ext/Panel`.
