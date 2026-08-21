# Decisions

## Holds, never extends

`Workspace` wraps `this.root` (a `Panel`) rather than subclassing it. A subclass would
inherit `divide`/`split`/`close`/`mirror` — verbs about a PANEL's place in a tree, which a
workspace has none of — and `toJSON()` (`Item.js`) walks `data` and `items` with no override
point, so a subclass's own instance state (`mode`, `zoom`, `viewports`) would either leak
into the saved document or need its own `toJSON()` to hide it, every time. The accepted
proposal (`ai/2026-08-18/panel-complexity/proposal.md`) already said *"never a fourth Panel
subclass"* for exactly this shape of problem; holding a root and delegating costs one field
and reads as what it is.

## `workspace(options)` stays the door

`../workspace.js`'s `workspace()` is now three lines: `new Workspace(options).$view`. Every
existing caller — `ext/editor`, `ext/files`, `space/compose`, this module's own `page.js` —
passes the exact options it always did (`saver templates tools seed mode`) and gets back a
box it can `.style()`/`.ac()` exactly as before. What changed is what is INSIDE that box: a
one-row bar sits above the root now, where the root used to be the whole thing.

## The `workspace.js` ↔ `Workspace.js` cycle is real, and safe

`../workspace.js` imports `Workspace` (the door needs the class); `Workspace.js` imports
`mount` back (the class needs the redraw engine). A genuine circular import — and the safe
kind: each side only reaches for the other's binding **inside a function body**, called
later, never at module-evaluation time. ESM resolves this correctly; the trap CLAUDE.md
names ("a parent↔child import cycle breaks only on deep reload") is about a DIFFERENT
shape — two files each reading top-level state off the other before either has run — which
neither side here does.

## `mount()` grows `$roots[]` — the fix for the old "last writer wins" trap

The pre-existing readme warned: *"Three live mounts share one document (`/`, `/full/`, a
task page) — the last writer wins."* That was three INDEPENDENT `workspace()` calls, each
running its own `Item.open(store)` against the same file — three separate root objects, each
convinced it was the only writer. `mount(root, $root)` now keys a `WeakMap` by the ROOT
object itself: a second call for a root already tracked joins its `Set` of boxes instead of
re-loading or re-wiring, so N viewports of ONE `Workspace` share one root, one listener pass,
one save queue. The trap does not fully disappear — two SEPARATE `new Workspace()` calls
pointed at the same path are still two root objects and still race — but the fix for that is
"call `mount()` again on the Workspace you already have," which is now the documented way to
get a second view.

## `views` (paint.js) keeps only the LAST-drawn box per item — known, not fixed here

Every `view(item)` call — one per box, once per redraw — overwrites `views.get(item)` with
that box's `$panel`/`$body`/`$items`. With two boxes of one root, `repaint(item)` (the lazy
single-leaf `sow`, live-mirror repainting, the `properties` inspector reaching a panel it is
not inside) all land on whichever box was rendered LAST, until the next STRUCTURAL redraw
(`add`/`remove`) repaints every box from the tree again. Proven harmless for the one gesture
this task measures — split/close/mirror all fire `add`, which redraws every box — and left
open for whoever gives `views` a second dimension.

## `flow` is a `Workspace` option now, not `mount()`'s standing behaviour

Before this task, `record(root, $root)` ran inside `mount()` unconditionally — every
`panel()` and every `workspace()` got a `Flow` whether or not anything ever showed its
scrubber. The owner, 2026-08-19: *"maybe panel-flow should be a workspace-configured
feature."* `mount()` gained a `{ flow = true }` option (default true, so `panel()` and any
direct caller of `mount()` are unchanged); `Workspace` computes its own default —
`options.flow ?? root.document()` — so a `mode: document` workspace still records by default
and a `fill` one (`ext/editor`, `ext/files`, `space/compose`, none of which pass `mode`)
does not, unless asked.

## The bounded-space option is one class on the ROOT box, not a wrapper

`Workspace({ center: true })` adds `.panel-workspace-center` to whichever `.panel-workspace`
box `mount()` builds — `justify-content: center` plus `background: var(--wash)` on the box
itself, `flex-grow: 0; inline-size: min(100%, 60em)` on its one `.panel` child. No extra DOM:
the root box already has exactly one child (the root `.panel`), so centering IT is centering
the whole tree. `height` is `--panel-height` on the same box, unchanged from what callers
already did by hand with `.style()` — the option just lets the constructor say it once.

## Open, named rather than fixed here

- **This page is not yet in `ext/Panel/page.js`'s `children:`.** The fence for this task
  allowed exactly one edit to that file (the `/full/` route's retirement) — wiring the
  playground's nav is task C's, once there is a real destination for it. Until then this
  page exists (reachable by its own url) but does not appear on the Panel page's tabs.
- **The Workspace bar's `mode` toggle is a SECOND writer of `root.data.mode`,** beside the
  rail's existing `root: true` picker (`glyphs.js`'s `WORDS.mode`) — both work, neither
  conflicts (both go through `Panel.set()`), but design §8 deletes the rail's copy once this
  bar is the only one anyone reaches for, which needs task C's viewport controls landed
  first.
- **`documents.js`'s `create(name)` trusts the caller** that `name` is not already taken —
  no uniqueness check beyond the auto-mint path. A picker UI (task C) would want one before
  offering a free-text name.
