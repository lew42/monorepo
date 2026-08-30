# The Observatory — all four grains at once

[/imagine/scenes/observatory/](/imagine/scenes/observatory/) is the fifth door, and the only
world that is not about *one* size of swap. The first four doors teach a grain each; this one
is a place where a region, an object, a camera and a light are four ways of looking through
the same instrument on the same night.

| sighting | slot | what is built | the grain |
|---|---|---|---|
| [Vela](/imagine/scenes/observatory/vela/) | `sky` | nine stars and their figure, 40 units out | region |
| [The Ring](/imagine/scenes/observatory/ring/) | `plate` | one plate on the easel, under its own lamp | object |
| [Eyepiece](/imagine/scenes/observatory/eyepiece/) | — | **nothing** — the page has no `build()` | camera |
| [Daybreak](/imagine/scenes/observatory/daybreak/) | `hour` | a warm light and a glow behind the ridge | light |

`Eyepiece` is the smallest page in the module: a title, a camera and a direction to look.
`compose()` only asks pages that have a builder, so it claims no slot at all — nothing is
created and nothing is disposed, and only where you stand changes.

## What is new here: the rest *persists*, and it also *responds*

Every other world proves persistence by staying **inert** — the plinth's ring keeps turning
because nobody touched it. The telescope makes the stronger claim. It belongs to the
observatory's own `world` slot and is never rebuilt, and it aims itself:

```js /imagine/scenes/observatory/page.js
// The deepest `look` in the chain wins — the rule `camera` already follows.
if (page !== world.userData.at){
    world.userData.at = page;
    look.fromArray(page?.chain().findLast(step => step.look)?.look ?? REST);
}
```

Two more things in the world are read from the chain rather than from a click, and both are
one line in the parent's `tick()`:

- **The stars go out at daybreak.** `stage.slots.has("hour")` fades the star field's opacity.
  Measured: 0.16 → 0.05 in light mode, 0.95 → 0.03 in dark.
- **A plate on the easel is a plate out of the rack.** `stage.slots.get("plate")?.page.plate.name`
  hides the rack's copy, so the picture you are reading is literally the one that is missing.

That is why a cold url and a walk down still agree: all three read the same source `compose()`
does. Verified — url, path bar, nav row, slot map, camera eye/aim, declared look, derived
mount angles, rack contents, caption facts and draw calls all identical; the only difference
is the lerp still closing on its target, ≤ 0.012 rad.

⚠ **`geometries` is not a parity key.** three registers a geometry on its *first render*, so
an object a sighting's camera frustum-culls is simply not uploaded yet on a cold load and is
on a walk. It reads as a leak and is not one.

## The plates — one drawing, two surfaces

The furthest the 2D×3D marriage goes in this module. Each record in
`observatory/plates.js` has one `draw(ctx, w, h, random)`, and it
runs **twice, unchanged**: once through `stage.paint()` onto the glass plate standing in the
rack, once into a plain `<canvas>` in the caption card under the stage. The 3D object and the
2D illustration cannot drift apart, because they are the same function.

Four idioms on purpose, so the rack reads as a series and not as four buttons: a star chart,
a photograph, an instrument diagram, a graph. Two are dark emulsion, two are card stock.

- **`VELA` is one list of stars with three renderings** — the chart on plate 041, the figure
  in the sky, and the cluster on the foyer's door.
- **Every plate is painted in its own colours, never the theme's**, so it needs no redraw when
  the mode pill flips — the same argument the gallery's pictures make.
- `plates.js` carries its own two-line copy of `Stage.rand`'s LCG so it can stay 2D-only, and
  so both surfaces are guaranteed the same sequence from the same seed.

The caption card steps **one rung darker** into the plate (`scenes.css`, `.scene-plate`) —
deliberately the opposite direction to [the magazine's ladder](/imagine/mag/), whose rows step
cleaner as you go deeper because a column you walk into should lift toward you. A plate is an
object lying on a desk; you read *into* it.

## Light and dark

No `tint`, so the canvas stays transparent and the themed CSS box behind it is the sky: light
mode is a pale dawn observatory, dark mode a deep night. The branch is six numbers in one
`sky()` call plus two colours — and one thing that had to turn over with the mode: **white
stars on a dawn sky are not faint, they are absent.** Vela's stars and figure are ink at dawn
and light at night; the plates are not, because they are objects.

`sky()` gained one word for this world: **`fill`**, the hemisphere bounce. The 0.5 every other
scene wants makes a night read as an overcast afternoon whatever the key is doing; the
observatory runs 0.2 in dark and 0.6 in light.

## Cost

Measured headless at 1920 (2026-08-29):

| | draw calls | triangles |
|---|---|---|
| observatory (base) | 19 | 704 |
| deepest sighting (Daybreak) | 21 | 754 |
| foyer, for scale | 42 | 9,722 |
| worlds/dawn, for scale | 37 | 3,814 |

A sighting costs **+2 draw calls** over its own world; the new foyer door costs 6 (post 2,
sign 3, name 1). The star field is 1,100 points in one call, the ridge is one buffer of
triangles, and the four plates are one mesh each because a `MeshStandardMaterial` has an
`emissive` for `stage.link()` to raise — no frames needed.

**Dispose round-trip, 100 swaps (20 laps × 5 states), measured at 0 / 50 / 100:** geometries
16 → 16 → 16, textures 11 → 11 → 11. Programs 6 → 10 → 10 — the shader cache saturating, not
growing. The loop stops dead on the way out: `running: false`, frame counter frozen at 113
across 2.6 seconds.

Related: [`grains.md`](./grains.md) · [`atmosphere.md`](./atmosphere.md) ·
[`slots.md`](./slots.md) · [`decisions.md`](./decisions.md)
