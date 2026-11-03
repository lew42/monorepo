# The tour — the YouTube lab's cue engine, driving a 3D pager

[/imagine/scenes/tour/](/imagine/scenes/tour/) is the one page in this module that is not a
world. It has no `slot` and no `build()`, so `compose()` never asks it for anything and the
foyer stands behind it untouched. What it owns is a **clock**, and the clock walks urls.

```js /imagine/scenes/tour/page.js
import { Cues, Clock, clock } from "/imagine/youtube/cues.js";
```

That import is the whole point. `Cues` and `Clock` are the twenty lines that fire `chat/`'s
messages and open `course/`'s chapter pages, taken unchanged and driven by wall time instead of
by `getCurrentTime()` — [`/imagine/youtube/doc/cues.md`](/imagine/youtube/doc/cues.md). Lifting
the engine out of the player is what made it possible; before that, a timeline needed a video.

## Every waypoint is real navigation

A mark carries a path, and arriving at it is `router.go()` — the same call a click makes. So:

- the **url is always the waypoint**, and a tour stopped halfway leaves you standing in a real
  place rather than in a mode;
- the **back button walks the tour backwards**, because ten waypoints are ten history entries;
- **nothing is a special case.** No mode flag reaches into `Stage`, no camera path is
  interpolated by hand. The camera moves because the deepest `camera` in the new chain won, the
  way it always does.

Measured: five waypoints in order — `worlds/dawn` → `worlds/dusk` → `plinth/knot` →
`quarters/dock` → `quarters/works` — with the slot map correct at each (`world`; `world`+`focus`;
`world`+`dock`; `world`+`works`). Pause held the url across 6.5s; Resume advanced; Stop left the
reader in `gallery/motes` with the doors back.

## ⚠ The tour must survive its own page

Every other timed thing on this site stops in `deactivated()`. This one is *deactivated by its
own first waypoint* — so that rule is exactly inverted here, and the inversion is the trap:

- A page object is a **module singleton** and outlives its view, so the clock keeps its own time
  after the page leaves the screen. Nothing here may read `this.view`.
- The guard is **"did the reader leave the subtree"**, not "is my page on screen":
  `this.app.router.active?.chain().includes(this.host())`. Same shape as `course/`'s `follow()`,
  opposite reason.
- The **controls live in the host's nav row**, not in the tour's own note (`Scene.nav_row()`
  calls `this.tour?.controls()`). By the second waypoint the tour's note is somewhere behind
  you, and the row is the only thing on screen that can stop it. The doors stay below it — a
  tour you cannot walk out of is a cage.

## ⚠ A child without a door

`tour` is in the foyer's `children:` but not in its `doors:`, and `build()` now iterates
`Object.keys(this.doors)`. That one word is what lets a child exist without a post in the
colonnade. It is deliberate: a tour is a way of *moving through* these worlds, not a sixth
world, and a sixth post would also have claimed — wrongly — that there is a fifth grain of swap.
The text nav row is derived from `children`, so the door to it is a chip, which is the right
weight.

## Where the narration goes

`.scene-hint` — the corner chip that otherwise reads *Click anything that lights up.* A guided
walk's caption and an affordance hint are the same corner of the stage, so the tour writes over
it and `stop()` puts the sentence back. No new chrome, and nothing left behind if a tour is
abandoned.

## Related

- [`/imagine/youtube/doc/cues.md`](/imagine/youtube/doc/cues.md) — the engine, and the two
  halves of it (the fires, and the index)
- [`slots.md`](./slots.md) — why a page with no `slot` composes nothing
- [`grains.md`](./grains.md) — the four swaps the tour walks
