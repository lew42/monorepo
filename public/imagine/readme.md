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
  **Drag a chip between lanes** and it writes through the same `assign_lane()` the person's
  buttons call, so there is one writer and a drag cannot drift from a click — the gesture is
  `ext/Draggable`, not a reimplementation. Everything is counted in **points**: a lane's head,
  the roster's bars, the rail's own total.
- **`game/`** — three realms, nine rooms, four things, one way out. The navigation *is* the
  game: an exit is a link to a sibling, so walking sideways swaps the deepest column in place.
  A trade is the only move that *shrinks* the pack, and it moves two rail rows in opposite
  directions. There is a **journal**, and a **secret** you can only reach by walking back down
  a realm you already finished — [`game/readme.md`](/imagine/game/readme/).
- **Storage** — `this.store()`, keyed on the page's own url. Prototyped here, now core's
  ([`store.md`](/framework/core/Page/api/store/)).

## Real files, or generated?

**The rule that decided every one of these: a page is a real file when a person would edit it
by hand, and generated when it is a row of data.** The three `page.js` files here
(root, `team/`, `game/`) hold *shapes*; the 25 pages you can actually visit
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

This is where `page.store()` was prototyped, and the prototype is gone — the seam is core's
now. A page already has one thing that is
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

**Shipped: `page.store()`, 2026-08-31.** One method on `Page` and one part class beside it,
returning `get(fallback)` / `set(data)` / `patch(part)` / `clear()`. The three things core
would have had to guess were answered before it landed: the prefix is **`lew42:`**, a failed
write falls back to an **in-memory Map and warns once**, and a page that `move()` re-addressed
declares **`store_key`** to keep the address it was saved at. It stayed *storage*, not state —
no watchers: the two pages here have a three-line `watch()` of their own, and a subscription
API on `Page` would make ~160 pages pay for a pattern four of them want, the same verdict
`roles.md` reached. Both consumers migrated with the keys byte-identical, so runs saved
against the prototype opened unchanged.
[`store.md`](/framework/core/Page/api/store/) is the method;
[`decisions.md`](/framework/core/Page/doc/decisions/) is the record.

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
- **`Draggable.under()` returns the first *registered* thing under the cursor, and your chips
  are registered too.** The board's drop landed on the card already in the lane — whose `lane`
  is undefined — so the gesture looked perfect and committed nothing. Every drag that has both
  movable things and containers needs `under(e, found => …)` to say which it is looking for.
- **An empty lane is 0px tall and cannot be dropped onto.** `.drag-items` (Draggable's own
  sheet) is the min-height; the board's lane body wears it for exactly that.
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
