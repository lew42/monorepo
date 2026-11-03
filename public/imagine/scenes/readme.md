# Scenes — a 3D pager

The page tree *is* the scene graph. Navigating activates a scene state; clicking an object in
the canvas navigates. One renderer, one canvas, one loop for the whole subtree — and every
flat thing in it (names, skies, paintings) is a `<canvas>` handed to a material.

Live: [/imagine/scenes/](/imagine/scenes/) — four grains of swap, one mechanism, and a fifth
door that uses all four at once. Or [take the tour](/imagine/scenes/tour/): the YouTube lab's
cue engine on a wall clock, walking these worlds by `router.go()`.

## Use

```js /imagine/scenes/worlds/page.js
import { Scene, THREE } from "../Scene.js";

export default new Scene({
    meta: import.meta,
    slot: "world",                                   // which part of the world is mine
    camera: { eye: [0, 3, 10], aim: [0, 1.5, 0] },   // the deepest page that names one wins
    build(stage, theme){                             // return an Object3D; theme is the CSS palette
        const world = new THREE.Group();
        stage.sky(world, { fog: 30, near: 0.5, shadow: 9 });   // key + rim; `shadow` = the one caster
        stage.floor(world, theme.sky, 24);
        thing.add(stage.label("Dawn"));                        // its name, in the world
        world.add(stage.link(thing, "/imagine/scenes/worlds/dawn/", "Dawn"));   // a 3D link
        return world;
    },
    sign(stage, theme){ … },                         // optional: the miniature my PARENT hangs on my door
    tick(dt, group, stage){ … },                     // optional, per frame
});
```

The host adds `scenic: true` and calls `this.staging()` from `content()`. Everything else is
a slot name: `world` replaces everything, any other name replaces just that zone.

## Watch out

- **The palette arrives late and can change under you.** A custom property reads back as
  literal `light-dark(…)` text, so the colours are read from four *resolved* properties on the
  stage box — and an unloaded stylesheet makes all four white with only a console warning.
  [`doc/decisions.md`](./doc/decisions.md)
- **A translucent plane that writes depth cuts a camera-facing label in half**, and
  `stage.casts()` on a whole world makes the 150-unit sky dome cast a shadow over everything.
  Both, with the rest of the look: [`doc/atmosphere.md`](./doc/atmosphere.md)
- **Fog starts at `fog × near` (0.3 by default)** — close enough to wash out the subject, not
  just the distance. Push `near` past it.
- **`/imagine/` is a columns host** and would claim this whole subtree. Everything below the
  host opts out, in `Scene.column_host()` and `Scene.container()`.
  [`doc/slots.md`](./doc/slots.md)
- **The tour is deactivated by its own first waypoint**, so its clock may never touch
  `this.view` and its guard is "did the reader leave the subtree" — the inverse of every other
  timed thing here. [`doc/tour.md`](./doc/tour.md)
- **The foyer's posts come from `doors:`, not `children:`** — that is what lets `tour` be a
  child with a nav chip and no post in the colonnade.
- **`aspect-ratio` + `max-height` on a block box caps the WIDTH too.** The stage is a height
  clamp; the camera widens its fov and stands back when the box goes narrow.
- **That widening only runs one way.** Past a ~2.15 stage aspect `Stage.resize()`'s squeeze
  floors at 1, so the horizontal fov keeps growing with width alone and a fixed world-space
  layout shrinks toward the middle of an ultrawide canvas — found on the foyer's colonnade and
  the crossroads' three arches, fixed in both by scaling the layout with the live aspect past
  that point. [`doc/decisions.md`](./doc/decisions.md)
- **Never `Math.random()` in a `build()`** — a cold load and a walk down must agree, paintings
  included. `stage.rand(seed)`.
- **A shape can lie about itself**: a radial gradient past its canvas edge is clipped into a
  hard rectangle, and a `PointsMaterial` with no map draws squares.
  [`doc/atmosphere.md`](./doc/atmosphere.md)
- Three.js is vendored at `/fly/three.js` and is **read-only prior art**. Import, never edit.

## More

- [`doc/slots.md`](./doc/slots.md) — the mechanism: chain → slots → diff, and why it makes a
  deep url and a walk identical.
- [`doc/grains.md`](./doc/grains.md) — the four swaps, what each one proves, what to look at.
- [`doc/observatory.md`](./doc/observatory.md) — the fifth door: all four grains at once, a
  telescope that reads the chain without being rebuilt, and one `draw()` on two surfaces.
- [`doc/tour.md`](./doc/tour.md) — the cue engine driving the pager: every waypoint is real
  navigation, and the one page that outlives its own view.
- [`doc/atmosphere.md`](./doc/atmosphere.md) — the 2D kit, the label technique, light, fog and
  sky, and the mood each scene is going for.
- [`doc/decisions.md`](./doc/decisions.md) — what was tried, what bit, what is still open.
- Files: `Scene.js` (the Page subclass **and** `Scene.Stage`), `scenes.css`, one `page.js`
  per grain, and `observatory/plates.js` (four drawings, no three.js).
