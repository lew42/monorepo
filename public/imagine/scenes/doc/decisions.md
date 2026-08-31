# Decisions — scenes

Built 2026-08-29 against the vendored three.js at `/fly/three.js` (r181, read-only prior art).
The atmosphere pass and the observatory landed the same day; the mechanism never changed, only
what was built on it. The technique lives in [`atmosphere.md`](./atmosphere.md) and
[`observatory.md`](./observatory.md); the record is here.

## Settled 2026-08-31 — the tour

- **A timeline can drive a pager, and it needed no new engine.** `/imagine/scenes/tour/` imports
  `Cues` and `Clock` from `/imagine/youtube/cues.js` unchanged and walks ten waypoints of the
  worlds this module already had. Full record: [`tour.md`](./tour.md).
- **Every waypoint is `router.go()`.** Not a camera path, not a mode: the camera moves because
  the deepest `camera` in the new chain won, the way it always does. So the url is the waypoint,
  the back button walks the tour backwards, and stopping halfway leaves you in a real place.
- **The tour is a child without a door.** `build()` iterates `Object.keys(this.doors)` now
  rather than `children`, so the colonnade stays at five posts. A tour is a way of moving
  through these worlds, not a sixth world — and a sixth post would have claimed a fifth grain.
- **The controls render into the HOST's nav row** (`Scene.nav_row()` calls `this.tour?.controls()`).
  Start is there too: the stage is a 66vh clamp, so at 1080 the tour's own note begins below the
  fold and the one button the page exists for would have needed a scroll to find.
- **The narration writes over `.scene-hint`.** A guided walk's caption and the affordance hint
  are the same corner of the stage; `stop()` puts the sentence back.
- **The hover tip follows the pointer.** Parked in the top-left corner it named a thing you were
  not looking at. The raycast still only runs when the target CHANGES — only the style write is
  per-move. It is a tooltip now, not a status bar.
- **Perf re-proved after all of it:** 8 laps × 10 navigations (80 slot swaps) round-trip to
  exactly 38 geometries / 12 textures / 1 slot, with zero drift; the rAF loop stops on leaving
  the subtree (frames frozen across a full second) and restarts on return.

## Settled — the observatory

- **A fifth door, and it is not a fifth grain.** Four doors teach one size of swap each; the
  observatory is a *place* that uses all four at once — a region of sky, a plate on an easel, a
  camera with no build at all, and one light. The alternative, four more sightings all claiming
  the same slot, would have been a fifth demo of grain three.
- **A persistent object may RESPOND to the chain.** Every world before this proved persistence
  by staying inert. The telescope is never rebuilt and still aims itself, because it reads the
  deepest `look` in the active chain the way `compose()` reads the deepest `camera`. So do the
  fading stars (`slots.has("hour")`) and the plate missing from the rack
  (`slots.get("plate")`). All three derive from the chain, so a cold url and a walk still
  agree — verified, 0 mismatches over 12 comparisons.
- **One `draw()`, two surfaces.** A plate's drawing runs unchanged into a `CanvasTexture` on
  the glass in the rack and into a `<canvas>` in the caption card. The 3D object and the 2D
  illustration are the same function and cannot drift. Four idioms — chart, photograph,
  diagram, graph — so the rack reads as a series, not as four buttons.
- **The caption card steps one rung DARKER into its plate**, the opposite direction to
  [the magazine's tone ladder](/imagine/mag/): a column you walk into should lift toward you, a
  plate lying on a desk should not. Written down because the two sheets now disagree on purpose.
- **`sky()` gained one word, `fill`** — the hemisphere bounce. Backwards compatible at its old
  0.5; the observatory runs 0.2 at night. It is an extension, not a change.
- **The plate is labelled in its own emulsion** as well as on a sprite above it, so a picture
  carries its name at any distance the way a real plate does.

## What bit — the observatory

- **A radial gradient whose radius runs past its canvas is clipped there.** Daybreak's bloom
  was drawn at radius `w/2` around a point 72% down a 256×128 texture, so it hit the top edge
  and the sky wore a hard-edged rectangle of light. Square texture, radius inside the bounds.
- **`PointsMaterial` with no `map` draws screen-space QUADS.** Every star was a domino. One
  32px painted disc, and the same `stage.paint()` that draws everything else here fixed it.
- **A hemisphere light hands its sky colour to everything facing up**, so a floor cannot be
  tinted from `bounce`. A grey floor under a warm key is not "pale", it is sepia — the first
  pass read as a mud flat. The blue had to go in the material.
- **A ring tilted past ~40° is a stick** from a camera at eye level, and the foyer turns every
  sign on Y, so it never comes back round. The door's ring sits at 0.5 rad and nods.
- **White stars on a dawn sky are absent, not faint.** Vela's stars and figure turn over with
  the mode; the plates deliberately do not, because they are objects.
- **The foyer's door spacing was a constant.** A fifth door at the flat 3.5 would have stood at
  x = 7, and at 400 the widened fov and dolly leave about ±6.3 in frame. The gap is derived
  from the count now; the colonnade keeps its total width.
- **`geometries` is not a parity key.** three registers a geometry on its *first render*, so an
  object a sighting's camera frustum-culls is not uploaded yet on a cold load and is on a walk.
  It reads as a leak and is not one. `programs` is the same story — a saturating shader cache.

## Settled — the atmosphere pass

- **A `<canvas>` is a texture, and that is the whole 2D×3D marriage.** One kit —
  `stage.paint()` — writes the name plates, the gradient skies, the wall wash and every
  painting in the gallery. No image files anywhere in the module, so nothing to fetch and
  nothing to keep in sync with a theme.
- **A door is drawn by the world behind it.** `sign()` is a method on the child, not data in
  the hub, so a portal cannot describe a world that has moved on. It also makes each door a
  live demo of its own grain, which no static icon could be.
- **Labels are Sprites.** Considered and rejected: HTML projected each frame (leaves the
  canvas, never occluded, does not travel with its slot) and a plane billboarded in `tick()`
  (needs the camera before anything is built, and a per-frame list to prune on every drop).
- **A fourth grain, and it is the smallest one.** `gallery/`'s children claim a slot holding
  one spotlight and declare a camera. Nothing visible is rebuilt; only where you stand
  changes. It is the strongest statement of the thesis in the module.
- **One shadow-casting light per scene, opted into.** `sky({ shadow })`, `stage.casts()` on
  the subject. Shadow maps stay at 1024 and only five of the nine scenes ask for one.

## What bit — the atmosphere pass

- **A translucent veil that writes depth cut every name in half.** The plate faces the camera;
  the crossroads arch is turned 47°; the planes cross and the far half of the word is
  depth-tested away. `depthWrite: false` on the veil.
- **`stage.casts()` on a whole world made the sky cast.** The dome is 150 units across, so it
  shadowed everything under it. It is called on the subject now, and the doc says so twice.
- **Fog was eating the subject, not the distance.** `sky()`'s haze started at `0.3 × fog` —
  nine units out on the hub, which is exactly where its doors stand. `near` is an argument now.
- **A dark room does not come from one lerp.** `wall.lerp(ink, 0.16)` darkens a floor in light
  mode and *lightens* it in dark mode, because `ink` is nearly white there; the gallery grew a
  bright bar along its bottom edge. Both modes get their own number.
- **The narrow-canvas dolly was a third of what it needed to be.** At 400 the widened fov still
  left the outermost door and the outermost painting off the sides. `0.65 → 1.25`.
- **Ground under a high camera is a halo, not a floor.** Quarters got a 54-unit disc so its
  plate would not float in a void; from twelve units up you see forty units of it receding, and
  every one fades to the fog colour, which in light mode is white. Cut — the plate floats, and
  what shows past its corners is the CSS sky, which is the point of that pair anyway.
- **A sun 34 units out is 70% fog.** Dusk's disc needed `fog: false` to exist at all.
- **A light owns a texture, and the disposer could not see it.** `Stage.dispose()` walks
  geometries and materials; a shadow map is a render target hanging off `light.shadow`, with
  neither. Forty swaps leaked twenty of them (11 → 31 textures, measured). `Light.dispose()`
  frees it; the same forty swaps now round-trip to exactly 33 geometries and 10 textures.

## Settled

- **The chain composes the world; clicks do not.** The alternative — mutate the scene on each
  click — cannot make a deep url and a walk down agree, which is the one property a *pager*
  has to have. Deriving from `chain()` gives it for free, and the diff by slot is what keeps
  the unchanged parts alive rather than merely redrawn.
- **A slot is a word a page says about itself**, not a mode the system offers. Three grains and
  no branch anywhere: `world`, `focus`, `grove` are all the same code path.
- **One renderer, one canvas, one loop for the subtree.** `setAnimationLoop(null)` on
  `deactivated()`, dropped-slot disposal on every swap, `Stage.dispose()` for the whole thing.
- **The canvas is transparent by default and the CSS box behind it is the sky.** That is the
  whole of the light/dark support for the hub and the crossroads — no colour scheme code. A
  land that wants its own weather calls `sky({ tint })` and paints over it; `compose()` resets
  the clear alpha before every build so nothing leaks between worlds.
- **The path bar is `Page.crumbs()`**, the real one, off `chain()` — it cannot disagree with
  the world. It only had to *look* like a path: the chevron is a material-icons ligature, so
  the span's font-size is zeroed and `::after` draws the slash.
- **The 2D nav row is derived, not written.** The arrangement contract shows one note at a
  time, so the row of text links is the only place a reader can always see the doors out.

## What bit

- **The palette came back all-white with no error.** Colours are read from four resolved
  properties on the stage box (`background-color`, `color`, `border-color`, `outline-color` —
  the last has no `outline-style`, so it paints nothing and is a free slot) because a custom
  property reads back as literal `light-dark(…)` text. But the stylesheet is a `<link>` and the
  first build can read an unstyled box; `THREE.Color` then *warns* and stays white. Fixed by
  comparing a signature every 8 frames and rebuilding — which also handles the mode pill
  changing the theme under a live scene.
- **`aspect-ratio` + `max-height` on a block box caps the WIDTH.** A 16/9 stage capped at 62vh
  stopped 290px short of the row at 1280 and left grey beside it — the max-height transfers
  back through the ratio. The stage is a height clamp now, and `Stage.resize()` widens the fov
  when the box goes narrow so a portrait canvas at 400 does not crop the world sideways.
- **`/imagine/` is a columns host** and claimed the whole subtree. See
  [`slots.md`](./slots.md) — two overrides, and `$notes` instead of `$pages` because
  `render_column()` reassigns `$pages` after `content()` runs.
- **`metalness` with no environment map renders near black.** The gold prism was olive at
  `metalness: 0.45`. Low metalness, and a front fill light — a key straight overhead leaves
  every face you can see in shadow.
- **A class field would have clobbered `assign()`.** `Scene.prototype.slot = "world"`, never
  `slot = "world"` in the class body: field initialisers run *after* `super()`, which is after
  `Page`'s constructor already assigned what the caller passed.
- **Over-lighting reads as "no colour"** long before it reads as "too bright". The first hub
  had a salmon icosahedron rendering as cream. Key at 1.35, hemisphere at 0.5, neutral tone
  mapping.

## Not done

- **No colour-scheme branch in the lands.** Dawn, Dusk and Deep paint their own weather and
  ignore light/dark on purpose — a land IS its palette. The hub, the crossroads, the plinth,
  the quarters, the gallery and the observatory are all theme-anchored, which is where the mode
  belongs.
- **The observatory's sightings do not animate.** The telescope turns and the stars fade;
  nothing else moves. A drifting sky or a ticking clock was cut — the world is a *reading*, and
  the four cards are what you are reading.
- **The rack does not scroll or page.** Four plates is the rack; a fifth would want a different
  object, not a smaller one.
- **Labels do not scale with the canvas.** At 400 a name is a few pixels; the 2D nav row under
  the stage carries them, which is what that row is for. A `size` in screen space rather than
  world units would fix it and would cost a per-frame pass.
- **The hover glow still lights a whole linked group**, including its name plate's neighbours.
  Fine at this scale; a large group would want an outline pass.
- **No `OrbitControls`.** Camera is declarative (`camera: { eye, aim }`, deepest wins, lerped)
  because a dragged camera is state the url does not carry — the opposite of the thesis. Worth
  revisiting as an *optional* per-scene word.
- **No GLTF.** `/fly/spaceship.glb` is right there and would load, but a model is an asset
  decision, not a paging one.
- **`Stage.dispose()` is never called by the page.** Leaving the subtree stops the loop and
  keeps the context, so coming back is instant; the disposal that matters — every dropped slot
  — happens on every swap. A real teardown seam exists and is unwired.
- **Hover lights the whole linked group.** Fine for the shapes here; a large group would want
  an outline pass instead.
