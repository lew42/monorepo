# Atmosphere — the look, and the 2D kit that makes it

The mechanism ([`slots.md`](./slots.md)) was finished before the scenes had a mood: grey, one
accent, flat light, unlabelled doors. This is what the second pass added, and it is one idea
used four ways — **a `<canvas>` drawn with the ordinary 2D API is a texture**.

```js
stage.paint(w, h, ctx => …)          // -> CanvasTexture, sRGB, no mipmaps
stage.label("Worlds", { size })      // -> a Sprite: the theme's font on the theme's ink
stage.sky(group, { tint, high, … })  // `high` hangs a painted gradient dome
stage.casts(group)                   // opt a SUBJECT into the shadow pass
```

The observatory takes the idea one step further: a `draw()` run **twice**, into a texture and
into a `<canvas>` on the page, so the object in the world and the picture in the caption are
the same function. [`observatory.md`](./observatory.md)

## Names, in the world

Every 3D link wears its name. The plate is a **Sprite** carrying a canvas bitmap — a chip in
the theme's `ink` with the theme's `surface` as its letters, the same pair `.scene-tip` uses in
2D, which is the only pair that reads on a cream world *and* a near-black one with no branch.

Why a Sprite over the two alternatives:

| | why not |
|---|---|
| an HTML label, projected each frame | leaves the canvas, needs per-frame maths, is never occluded by the world it labels, and does not travel with the slot that owns it |
| a plane billboarded in `tick()` | needs the camera before anything is built, and needs a per-frame list to prune on every drop |

A Sprite faces the camera for free from any camera the chain declares, it **raycasts**, so a
plate inside a linked group is part of the link rather than a dead patch over it, and it is
disposed by the slot that built it like everything else.

⚠ **Every Sprite in three.js shares ONE lazily-created geometry.** `Stage.dispose()` skips
`node.geometry` for sprites; without that guard, dropping one slot frees the buffers of every
label still on screen.

⚠ **A translucent plane that writes depth cuts a name in half.** The plate faces the camera; a
veil turned 47° at the crossroads crosses it, and the far half of the word is depth-tested
away. Translucent scenery gets `depthWrite: false`.

## The doors preview their worlds

`sign(stage, theme)` is a method on the **child**, so a door is drawn by the world behind it
and cannot go stale: three arches in Dawn / Dusk / Deep's own accents, a plinth cycling its
mesh, a plate lifting one corner, three of the gallery's own pictures turning. A sign that
wants to animate hangs a `tick` on its own `userData` and the hub calls it.

⚠ The hub **imports its four children statically** for this. `children:` alone resolves them
one dynamic import later, and the first build would have nothing to ask.

## Light

- **A key and a rim.** One key over a pale world leaves every silhouette the same value as its
  background — that is precisely what "reserved" looks like. `sky()` adds a second directional
  from behind at `rim × power` (default 0.4). No shadow map, no cost.
- **One shadow-casting light, ever.** `sky({ shadow: <half-width> })` turns the key into the
  caster; the foyer, the crossroads, Dawn, the plinth and the gallery use it. Call
  `stage.casts()` on the **subject** — on a whole world it would make the 150-unit sky dome
  cast a shadow over everything under it.
  ⚠ A shadow map is a render target hanging off `light.shadow`, with no geometry and no
  material, so a disposer that walks those two never sees it. `Stage.dispose()` calls
  `Light.dispose()` for exactly this; without it forty swaps leaked twenty textures.
- **`near` matters more than `fog`.** The haze starts at `fog × near`, default 0.3 — so a
  scene whose subject stands nine units out is already fading. That is what washed the hub's
  doors into its own sky. Push `near` past the subject and pull `fog` in to just past the
  floor's edge.
- **`fog: false` on anything that is a light source.** Dusk's sun disc is 34 units out, 70%
  of the way through its own haze; fogged, it was the same as not drawing it.
- **`fill` is the hemisphere bounce, and 0.5 is a DAYLIT number.** A night world at 0.5 reads
  as an overcast afternoon however low its key is — the observatory runs 0.2 in dark mode.
  Lower it before reaching for a darker key.
  ⚠ A hemisphere light hands its **sky** colour to everything facing *up*, so a floor cannot
  be tinted from `bounce`. The colour has to be in the material.

## Two shapes that lie about themselves

- **A radial gradient whose radius runs past its canvas is clipped there.** Daybreak's first
  bloom was painted at radius `w/2` from a point 72% down a short texture: past the top edge,
  and the sky grew a hard-edged rectangle of light. Keep the radius inside the bounds.
- **`PointsMaterial` with no `map` draws each point as a screen-space QUAD.** At any size
  worth seeing, every star is a domino. One 32px painted disc — the same 2D kit again — and
  they are stars.

## Sky

Two skies, and the difference is the whole light/dark story.

- **No `tint`** → the canvas stays transparent and the CSS box behind it *is* the sky. The
  gradient in `scenes.css` is the weather of the hub, the crossroads and the quarters:
  an accent bloom rising from behind the horizon and a wash overhead. ⚠ `light-dark()` and not
  a token — light wants a cool haze at the top, dark wants the top to go out; the two modes
  are not one picture dimmed.
- **`tint` + `high`** → a painted ramp on the inside of a 150-unit dome, `fog: false`,
  `depthWrite: false`, `renderOrder: -1`. ⚠ `dithering: true`: a two-stop ramp across a whole
  sky bands visibly in 8 bits, and on a dark world the bands read as stripes.

## What each scene is going for

| | mood |
|---|---|
| foyer | pale rotunda, warm pool, long shadows |
| crossroads | three lit rings, one dais |
| Dawn | low sun, thin stones, long shadows |
| Dusk | backlit plum, one burning disc |
| Deep | cold water, drifting motes, silhouettes |
| plinth | dim apse, one hanging ring |
| quarters | bright plate over warm haze |
| gallery | white cube by day, lit pictures by night |
| observatory | pale dawn hill, deep night, brass |

Related: [`grains.md`](./grains.md) · [`observatory.md`](./observatory.md) ·
[`decisions.md`](./decisions.md)
