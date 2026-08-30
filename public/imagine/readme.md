# Imagine — how it is built

A place made of column pages: a [team](/imagine/team/) to run, a [world](/imagine/game/) to
walk, and three trees of variations ([gallery](/imagine/gallery/), [scenes](/imagine/scenes/),
[vary](/imagine/vary/)). One `columns()` call at the root, so everything below it — a person,
a lane, a room three realms down — is another column in the same row, under one crumb strip.

## Use

- **The root is the experience.** `/imagine/page.js` is a 14em rail and nothing else; `Start`
  is its `default` column and its cards are the nav. There is no page to read before you arrive.
- **`team/`** — a roster rail, a person, her assignments, and a board that follows the
  selection. Two controls (density, sort) instead of a page per state; both remembered.
- **`game/`** — three realms, nine rooms, four things, one way out. The navigation *is* the
  game: an exit is a link to a sibling, so walking sideways swaps the deepest column in place.
  A trade is the only move that *shrinks* the pack, and it moves two rail rows in opposite
  directions — [`game/readme.md`](/imagine/game/readme/).
- **`store.js`** — `store(page)`, keyed on `page.url`. Local to this directory on purpose.

## Real files, or generated?

**The rule that decided every one of these: a page is a real file when a person would edit it
by hand, and generated when it is a row of data.** The four `page.js` files here
(root, `team/`, `game/`, plus `store.js`) hold *shapes*; the 25 pages you can actually visit
are built from four arrays inside them — `PEOPLE`, `TASKS`, `WORLD`, `LANES`. Six people, nine
rooms, seven boards, and nobody has to keep 25 files in step with each other.

The line moves when the pages stop being the same shape. `Start`, `Field notes` and each
person's `Board` are written out because each is one specific screen, not the nth of a run. And
the sibling directories (`gallery/`, `scenes/`, `vary/`) are their own files because they are
their own authors.

**A set of controls beats a tree of files.** Density and sort are two `<button>` groups and one
class; as pages they would have been `board/comfy/`, `board/compact/`, `roster/by-name/`,
`roster/by-load/` — four files, four urls, and a combinatorial third when a filter arrives.
The test is whether the variation is *content* (a file: it has a name, a url, a description) or
*presentation* (a control: it is the same content, arranged).

## Path-based storage

`store.js` is a prototype of a core seam, not the seam. A page already has one thing that is
unique, stable and human-readable — its address — and `page.url` is derived by core, so it
cannot drift out of step with the tree the way a hand-typed `id: "team-board"` would. Production
is static, so there is no server to hand out ids; `localStorage["lew42:" + page.url]` is the
static-safe shape. Two things use it for real: the team's lanes, density and sort
(`lew42:/imagine/team/`), and your run in the world (`lew42:/imagine/game/`). Measured
2026-08-29, headless: took the lamp at `/imagine/game/verge/quarry/`, reloaded at
`/imagine/game/hollow/cistern/` — `{"found":["verge/quarry","hollow/cistern"],"carried":["lamp"]}`
before and after, the room still open, HUD `0/9 → 2/9`. Team: three lane moves, board and rail
both redrawn, `density: "compact"` and `sort: "load"` still set after a reload.

**One key, and one thing that empties it.** The world's whole run — nine rooms walked, what is
in the pack, what was given away — is three arrays under `lew42:/imagine/game/`, and the finale
at `/imagine/game/end/` is the only eraser. It calls `clear()` rather than writing an empty
object, so between *start over* and your next move the browser holds nothing about the game at
all; the team's key is beside it and never notices (measured, keys before and after).

**The proposal: `page.store()`.** One method on `Page`, returning a handle with
`get(fallback)` / `set(data)` / `patch(part)` / `clear()`, keyed on `this.url`. It is ~30 lines
and it earns them, because *every* page wants it and none of them wants to invent a key. Three
things it must decide, none of which core should guess: **the prefix** (a shared origin means
`/notes/` and a demo can collide — the app's name is the obvious namespace); **the failure
mode** (localStorage throws whole in private mode, and a UI that loses its buttons because a
save failed is worse than one that forgets — this prototype falls back to an in-memory Map and
warns once); and **whether a moved page keeps its data** (`move()` re-addresses a subtree, so an
adopted page silently changes key — a `store_key` override, defaulting to `url`, is the seam).
It should stay *storage*, not state: no watchers, no reactivity. The pages here already have a
`watch()` of their own, three lines each, and a subscription API on `Page` would make ~160 pages
pay for a pattern four of them want — the same verdict `roles.md` reached.

## Watch out

- **A `default` column could not be a parent — fixed the same day.** `Page.css` used to hide a
  `.default` page whose region contained an active one, and a routed `default` page satisfied
  that test *itself* (a board-beside-roster draft drew **two** columns at
  `/imagine/team/roster/ada/` instead of four). The rule now excludes a target that is itself
  active or an ancestor (2026-08-29, found independently by the gallery build), so a routed
  `default` parent stays visible. The restructure here predates the fix and stands on its own.
- **`hug` is not for a nav rail.** Tried on the realm rails: The Verge hugged to 128px and The
  Hollow to 183px, because one row says "needs the brass lamp". A rail whose width depends on
  which sibling you opened moves the column beside it by 55px on every change. `hug` wants a
  column whose content width is a constant.
- **The site theme styles every `button`** at `(0,2,0)` in `@layer theme`, so a bare component
  class loses its padding to a 0.7em/1.4em CTA. Every control here is `.imagine-seg .imagine-seg-btn`,
  group included even around a single button, and it keeps the theme's small-caps on purpose.
- **At 400 the row snaps to the deepest column**, so opening a person lands on her board and her
  assignments are one swipe left. The crumb strip is the way back.
- A watcher registered in `content()` is registered once — `render()` caches the view. The
  density class is toggled *inside* the watcher for that reason; set at build time it would be
  right on the first paint and never again.

## More

[`columns.md`](/framework/core/Page/doc/columns/) — the row and the width words ·
[`roles.md`](/framework/core/Page/doc/roles/) — `is:` and `nearest()`, the ref all four columns
talk through · [the four exemplars](/framework/core/Page/overview/columns/uses/) this is built on.
